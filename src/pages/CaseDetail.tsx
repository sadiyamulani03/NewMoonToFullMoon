import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { addReceipt, exportCaseReceipts, getCase, setCaseStatus, type ForensicCase } from '../lib/api';
import { useMidnightContext } from '../context/MidnightContext';
import { useDemo } from '../context/DemoContext';
import { commitmentForSecret, toHex } from '../lib/membership';
import { MIDNIGHTTRACE_OWNER_SECRET } from '../config';
import WalletStatus from '../components/WalletStatus';
import TxProgress from '../components/TxProgress';
import { logTx } from '../lib/auditLog';

type Action = 'logStep' | 'discloseFinding' | 'closeCase';
type TxState = 'idle' | 'preparing' | 'awaiting_wallet' | 'proving' | 'submitting' | 'confirming' | 'success' | 'cancelled' | 'failed' | 'timeout';

function fmtTime(iso: string): string { return new Date(iso).toLocaleString(); }
function fmtDay(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function txStateLabel(s: TxState): string {
  switch (s) {
    case 'preparing': return 'Preparing secure proof…';
    case 'awaiting_wallet': return 'Waiting for wallet approval…';
    case 'proving': return 'Generating proof… check wallet popup';
    case 'submitting': return 'Submitting transaction…';
    case 'confirming': return 'Waiting for Preprod confirmation…';
    case 'success': return 'Transaction confirmed.';
    case 'cancelled': return 'Cancelled — wallet declined.';
    case 'failed': return 'Failed.';
    case 'timeout': return 'Timed out.';
    default: return '';
  }
}

export default function CaseDetail() {
  const { id = '' } = useParams();
  const [caseItem, setCaseItem] = useState<ForensicCase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<Action>('logStep');
  const [caseIndex, setCaseIndex] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [busyStage, setBusyStage] = useState<'proof' | 'submit'>('proof');
  const [txState, setTxState] = useState<TxState>('idle');
  const [msg, setMsg] = useState<string | null>(null);
  const [msgTechnical, setMsgTechnical] = useState<string | null>(null);
  const [showTechnical, setShowTechnical] = useState(false);
  const [memberSecret, setMemberSecret] = useState('');
  const [memberMsg, setMemberMsg] = useState<string | null>(null);
  const [onChainIdx, setOnChainIdx] = useState<bigint | null>(null);
  const [editIdx, setEditIdx] = useState(false);
  const [lastProof, setLastProof] = useState<{ txId: string; blockHeight: number | bigint; caseId: string; network: string } | null>(null);

  const { isConnected, walletState, isMobile, midLedger, memberCommitmentHex, membershipStatus, applyOwnerSecret, callOpenCase, callGrantAccess, callLogStep, callDiscloseFinding, callCloseCase } = useMidnightContext();
  const { isDemo, mockCases, mockLedger, demoLogStep, demoDisclose, demoClose, demoOpenCase, getDemoCase, enableDemo } = useDemo();
  const ledger = isDemo ? mockLedger : midLedger;

  const reload = useCallback(() => {
    if (isDemo) { const f = getDemoCase(id) ?? mockCases.find((c) => c.id === id) ?? null; if (f) setCaseItem(f); else setError('Demo case not found'); return; }
    getCase(id).then(setCaseItem).catch((e) => setError(String(e)));
  }, [id, isDemo, getDemoCase, mockCases]);

  useEffect(() => { reload(); }, [reload]);
  useEffect(() => { if (isDemo) { const f = mockCases.find((c) => c.id === id); if (f) setCaseItem(f); } }, [mockCases, id, isDemo]);

  useEffect(() => {
    if (onChainIdx !== null) return;
    if (caseItem?.receipts.length) {
      const first = caseItem.receipts[0].caseIndex;
      if (first != null) { const v = BigInt(first); setOnChainIdx(v); setCaseIndex(String(v)); return; }
    }
    if (ledger) {
      if (!ledger.cases.length) { setOnChainIdx(0n); setCaseIndex('0'); return; }
      const max = ledger.cases.reduce((m, c) => c.caseId > m ? c.caseId : m, 0n);
      const hasReceipt = !!caseItem?.receipts.length;
      const sugg = hasReceipt ? ledger.cases[0].caseId : max + 1n;
      const clamped = sugg > 65535n ? max : sugg;
      setOnChainIdx(clamped); setCaseIndex(String(clamped));
    }
  }, [ledger, onChainIdx, caseItem]);

  const resolveId = useCallback(() => {
    const v = BigInt(caseIndex || '0');
    if (v < 0n || v > 4294967295n) throw new Error('Case index 0–4294967295');
    return v;
  }, [caseIndex]);

  const onLanded = useCallback(async (txId: string, blockHeight: number | bigint, stepType: Action, total?: bigint | null) => {
    if (isDemo) return;
    await addReceipt(id, { txId, blockHeight, total: total ?? 0n, stepType, caseIndex: resolveId() }).catch(() => {});
    if (stepType === 'closeCase') await setCaseStatus(id, 'closed').catch(() => {});
    reload();
  }, [id, reload, resolveId, isDemo]);

  const validateAmount = (raw: string): bigint | null => {
    if (!raw.trim()) { setMsg('Enter an amount — 1 to 65,535.'); setMsgTechnical(null); return null; }
    try {
      const n = BigInt(raw.trim());
      if (n < 0n) { setMsg('Amount must be 0 or more.'); setMsgTechnical(null); return null; }
      if (n > 65535n) { setMsg('Amount too large — max 65,535 per step. Use multiple findings for larger totals.'); setMsgTechnical(null); return null; }
      if (n === 0n) { setMsg('Amount must be at least 1.'); setMsgTechnical(null); return null; }
      return n;
    } catch { setMsg('Enter a valid number — digits only.'); setMsgTechnical(null); return null; }
  };

  useEffect(() => {
    if (!caseItem || isDemo) return;
    try {
      const pendingRaw = sessionStorage.getItem(`midnighttrace:lastTx:${id}`);
      if (!pendingRaw) return;
      const pending = JSON.parse(pendingRaw) as { txId: string; caseId: string; ts: number };
      if (Date.now() - pending.ts < 5 * 60 * 1000 && !caseItem.receipts.some((r) => r.txId === pending.txId)) {
        setMsg(`Previous transaction ${pending.txId.slice(0, 8)}… may still be confirming — check /audit?case=${pending.caseId}`);
      }
    } catch {}
  }, [caseItem, id, isDemo]);

  const run = async () => {
    if (busy) return;
    setMsgTechnical(null); setShowTechnical(false); setLastProof(null);
    if (isDemo && caseItem) {
      const cid = resolveId();
      const mockTx = Array.from({ length: 12 }, () => Math.floor(Math.random()*16).toString(16)).join('') + '…';
      const start = Date.now();
      setBusy(true); setTxState('proving'); setBusyStage('proof');
      if (action === 'logStep') { const p = validateAmount(amount); if (p === null) { setBusy(false); setTxState('idle'); return; } demoLogStep(cid, p, caseItem.id); setMsg('✓ Demo: finding logged — redacted amount → public total updated.'); setLastProof({ txId: mockTx, blockHeight: 500123, caseId: cid.toString(), network: 'Demo — not on-chain' }); logTx({ op: 'logStep', caseId: cid.toString(), txId: mockTx, outcome: 'success', latencyMs: Date.now()-start }); }
      else if (action === 'discloseFinding') { const p = validateAmount(amount); if (p === null) { setBusy(false); setTxState('idle'); return; } demoDisclose(cid, p, caseItem.id); setMsg('✓ Demo: total disclosed — now public.'); setLastProof({ txId: mockTx, blockHeight: 500124, caseId: cid.toString(), network: 'Demo — not on-chain' }); logTx({ op: 'discloseFinding', caseId: cid.toString(), txId: mockTx, outcome: 'success', latencyMs: Date.now()-start }); }
      else { demoClose(cid, caseItem.id); setMsg('✓ Demo: case sealed — phase CLOSED.'); setLastProof({ txId: mockTx, blockHeight: 500125, caseId: cid.toString(), network: 'Demo — not on-chain' }); logTx({ op: 'closeCase', caseId: cid.toString(), txId: mockTx, outcome: 'success', latencyMs: Date.now()-start }); }
      setTxState('success'); setBusy(false); setAmount(''); return;
    }
    if (!isConnected) { setMsg('Connect wallet or enable Demo — no proof can be generated without a wallet.'); setTxState('failed'); return; }
    if (membershipStatus === 'unknown') { setMsg('Checking allowlist membership… please wait a second and retry. If it persists, tap “Join as investigator” below or enable Demo.'); setTxState('failed'); return; }
    if (membershipStatus === 'not-member') { setMsg('Not on allowlist — this wallet is not yet an authorized investigator for this Preprod ledger.'); setTxState('failed'); return; }
    setBusy(true); setTxState('preparing'); setBusyStage('proof'); setMsg(null); setMsgTechnical(null);
    const start = Date.now();
    try {
      const cid = resolveId();
      let r: { txId: string; blockHeight: number | bigint } | null = null;
      const op: 'logStep' | 'discloseFinding' | 'closeCase' = action;
      if (action === 'logStep') {
        const p = validateAmount(amount); if (p === null) { setBusy(false); setTxState('idle'); return; }
        setTxState('proving'); setBusyStage('proof');
        r = await callLogStep(cid, p);
        setTxState('submitting'); setBusyStage('submit');
        await onLanded(r.txId, r.blockHeight, 'logStep');
        setTxState('confirming');
        try { sessionStorage.setItem(`midnighttrace:lastTx:${id}`, JSON.stringify({ txId: r.txId, caseId: cid.toString(), ts: Date.now() })); } catch {}
        logTx({ op, caseId: cid.toString(), txId: r.txId, network: 'preprod', latencyMs: Date.now()-start, outcome: 'success' });
        setLastProof({ txId: r.txId, blockHeight: r.blockHeight, caseId: cid.toString(), network: 'Midnight Preprod' });
      } else if (action === 'discloseFinding') {
        const p = validateAmount(amount); if (p === null) { setBusy(false); setTxState('idle'); return; }
        setTxState('proving'); setBusyStage('proof');
        r = await callDiscloseFinding(cid, p);
        setTxState('submitting'); setBusyStage('submit');
        await onLanded(r.txId, r.blockHeight, 'discloseFinding', p);
        setTxState('confirming');
        try { sessionStorage.setItem(`midnighttrace:lastTx:${id}`, JSON.stringify({ txId: r.txId, caseId: cid.toString(), ts: Date.now() })); } catch {}
        logTx({ op, caseId: cid.toString(), txId: r.txId, network: 'preprod', latencyMs: Date.now()-start, outcome: 'success' });
        setLastProof({ txId: r.txId, blockHeight: r.blockHeight, caseId: cid.toString(), network: 'Midnight Preprod' });
      } else {
        setTxState('proving'); setBusyStage('proof');
        r = await callCloseCase(cid);
        setTxState('submitting'); setBusyStage('submit');
        await onLanded(r.txId, r.blockHeight, 'closeCase');
        setTxState('confirming');
        try { sessionStorage.setItem(`midnighttrace:lastTx:${id}`, JSON.stringify({ txId: r.txId, caseId: cid.toString(), ts: Date.now() })); } catch {}
        logTx({ op, caseId: cid.toString(), txId: r.txId, network: 'preprod', latencyMs: Date.now()-start, outcome: 'success' });
        setLastProof({ txId: r.txId, blockHeight: r.blockHeight, caseId: cid.toString(), network: 'Midnight Preprod' });
      }
      setTxState('success'); setMsg('✓ Proof verified — receipt filed on ledger.');
      setMsgTechnical(null);
      setAmount('');
    } catch (e) {
      const raw = (e as Error).message ?? String(e);
      const latency = Date.now()-start;
      if (/not.*allowlist|findPathForLeaf|Not an authorized/i.test(raw)) { setTxState('failed'); logTx({ op: action, caseId: resolveId().toString(), outcome: 'failed', errorCategory: 'circuit_rejected', latencyMs: latency }); setMsg('Not on allowlist — transaction rejected by circuit.'); setMsgTechnical(`${raw} — Tap “Join as investigator” then retry, or use Demo.`); }
      else if (/reject/i.test(raw) || /declined|denied|user/i.test(raw)) { setTxState('cancelled'); logTx({ op: action, outcome: 'cancelled', errorCategory: 'wallet_rejected', latencyMs: latency }); setMsg('Wallet declined — nothing was submitted. Try again when ready.'); setMsgTechnical(raw); }
      else if (/Failed to fetch|NetworkError|proof server/i.test(raw)) {
        setTxState('failed'); logTx({ op: action, outcome: 'failed', errorCategory: 'prover_unavailable', latencyMs: latency });
        const isLocalHost = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
        const isLocalhostErr = /localhost:6300/.test(raw);
        if (!isLocalHost && isLocalhostErr) setMsg('Local proof service is unavailable in this deployment. Connect your supported Midnight wallet or enable Demo mode.');
        else setMsg('We couldn’t reach the proof service.');
        setMsgTechnical(`${raw} — ${isLocalHost ? 'Try: docker compose up -d --wait proof-server or enable Demo.' : 'Use your supported Midnight wallet (in-wallet proving) or enable Demo.'}`);
      }
      else if (/timeout/i.test(raw)) { setTxState('timeout'); logTx({ op: action, outcome: 'timeout', errorCategory: 'prover_timeout', latencyMs: latency }); setMsg('Proof generation timed out. No transaction was submitted.'); setMsgTechnical(raw); }
      else { setTxState('failed'); logTx({ op: action, outcome: 'failed', errorCategory: 'unknown', latencyMs: latency }); setMsg('We couldn’t complete the proof.'); setMsgTechnical(raw); }
    } finally { setBusy(false); }
  };

  const open = async () => {
    if (busy) return;
    setMsgTechnical(null); setShowTechnical(false);
    if (isDemo) {
      const cid = resolveId();
      const start = Date.now();
      setBusy(true); setTxState('proving'); setBusyStage('proof');
      if (caseItem) { demoLogStep(cid, 0n, caseItem.id); setMsg(`✓ Demo: case #${cid} marked open.`); logTx({ op: 'openCase', caseId: cid.toString(), txId: `demo-${cid}`, outcome: 'success', latencyMs: Date.now()-start }); }
      else { const nid = demoOpenCase(cid, `Case #${cid}`, ''); setMsg(`✓ Demo: case #${cid} created ${nid}.`); logTx({ op: 'openCase', caseId: cid.toString(), txId: nid, outcome: 'success', latencyMs: Date.now()-start }); }
      setTxState('success'); setBusy(false); return;
    }
    if (!isConnected) { setMsg('Connect wallet or enable Demo.'); setTxState('failed'); return; }
    if (membershipStatus === 'unknown') { setMsg('Checking allowlist membership… please wait a second and retry.'); setTxState('failed'); return; }
    if (membershipStatus === 'not-member') { setMsg('Not on allowlist — this wallet is not yet authorized. Tap “Join as investigator” below or enable Demo.'); setTxState('failed'); return; }
    setBusy(true); setTxState('preparing'); setBusyStage('proof'); setMsg(null); setMsgTechnical(null);
    const start = Date.now();
    try {
      const cid = resolveId();
      const meta = `${caseItem?.title ?? ''}|${caseItem?.description ?? ''}|${String(cid)}`;
      const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(meta)));
      setTxState('proving'); setBusyStage('proof');
      const r = await callOpenCase(cid, hash);
      setTxState('submitting'); setBusyStage('submit');
      await onLanded(r.txId, r.blockHeight, 'logStep', 0n);
      setTxState('confirming');
      try { sessionStorage.setItem(`midnighttrace:lastTx:${id}`, JSON.stringify({ txId: r.txId, caseId: cid.toString(), ts: Date.now() })); } catch {}
      logTx({ op: 'openCase', caseId: cid.toString(), txId: r.txId, network: 'preprod', latencyMs: Date.now()-start, outcome: 'success' });
      setTxState('success'); setMsg(`✓ Case #${cid} opened on-chain — phase ACTIVE, total 0.`);
      setMsgTechnical(null);
    } catch (e) {
      const raw = (e as Error).message ?? String(e);
      const latency = Date.now()-start;
      if (/already exists/i.test(raw)) { setTxState('failed'); logTx({ op: 'openCase', caseId: resolveId().toString(), outcome: 'failed', errorCategory: 'case_exists', latencyMs: latency }); setMsg(`Case #${resolveId()} already exists on ledger.`); setMsgTechnical(raw); }
      else if (/reject/i.test(raw)) { setTxState('cancelled'); logTx({ op: 'openCase', outcome: 'cancelled', errorCategory: 'wallet_rejected', latencyMs: latency }); setMsg('Wallet declined — case not opened.'); setMsgTechnical(raw); }
      else if (/Failed to fetch|NetworkError|proof server|localhost:6300/i.test(raw)) {
        setTxState('failed'); logTx({ op: 'openCase', outcome: 'failed', errorCategory: 'prover_unavailable', latencyMs: latency });
        setMsg('We couldn’t open the case — proof service unavailable.');
        setMsgTechnical(raw);
      }
      else { setTxState('failed'); logTx({ op: 'openCase', outcome: 'failed', errorCategory: 'unknown', latencyMs: latency }); setMsg('We couldn’t open the case.'); setMsgTechnical(raw); }
    } finally { setBusy(false); }
  };

  const grant = async () => {
    if (isDemo) { setMemberMsg('Demo: already authorized — grant is mocked.'); return; }
    if (!isConnected) { setMemberMsg('Connect wallet.'); return; }
    if (membershipStatus !== 'member') { setMemberMsg('Only members can grant.'); return; }
    const hex = memberSecret.trim().replace(/^0x/i, '');
    if (!/^[0-9a-fA-F]{64}$/.test(hex)) { setMemberMsg('Need 64 hex chars.'); return; }
    try {
      const sec = new Uint8Array(32); for (let i = 0; i < 32; i++) sec[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
      const r = await callGrantAccess(sec);
      setMemberMsg(`Granted ${toHex(commitmentForSecret(sec)).slice(0, 12)}… tx ${r.txId.slice(0, 8)}…`);
      setMemberSecret('');
    } catch (e) { setMemberMsg((e as Error).message ?? String(e)); }
  };

  const onChainCase = onChainIdx != null && ledger ? ledger.cases.find((c) => c.caseId === onChainIdx) ?? null : null;

  const [shareCopied, setShareCopied] = useState(false);
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/cases/${id}?audit=${onChainIdx?.toString() ?? caseIndex}`;
  const copyShare = async () => {
    try { await navigator.clipboard.writeText(shareUrl); setShareCopied(true); setTimeout(() => setShareCopied(false), 1800); } catch {}
  };
  const exportJson = () => {
    if (!caseItem) return;
    const withShare = JSON.parse(exportCaseReceipts(caseItem));
    (withShare as Record<string, unknown>)._share = { auditUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/audit?case=${onChainIdx?.toString() ?? caseIndex}`, caseUrl: shareUrl, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(withShare, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `midnighttrace-${caseItem.id}.json`; a.click(); URL.revokeObjectURL(url);
  };

  const sealed = onChainCase?.phase === 'CLOSED' || caseItem?.status === 'closed';
  const receipts = (caseItem?.receipts ?? []).slice().sort((a, b) => a.blockHeight - b.blockHeight || a.createdAt.localeCompare(b.createdAt));

  return (
    <>
      {/* BREADCRUMB — hairline, not pill */}
      <nav className="mono" aria-label="Breadcrumb" style={{ fontSize: '0.76rem', color: 'var(--muted)', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <Link to="/dashboard" style={{ color: 'var(--muted)' }}>Workspace</Link>
        <span>/</span>
        <Link to="/cases" style={{ color: 'var(--muted)' }}>Cases</Link>
        <span>/</span>
        <strong style={{ color: 'var(--ink)' }}>{caseItem?.title ?? id.slice(0, 12)}</strong>
        {isDemo && <span className="badge badge-verify">Demo — not on-chain</span>}
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={copyShare} style={{ padding: '6px 10px', fontSize: '0.78rem' }}>{shareCopied ? 'Copied ✓' : 'Copy share link'}</button>
          <button className="btn btn-ghost" onClick={exportJson} disabled={!caseItem || !caseItem.receipts.length} style={{ padding: '6px 10px', fontSize: '0.78rem' }}>Export JSON</button>
        </span>
      </nav>

      {!caseItem && !error && (
        <div style={{ display: 'grid', gap: 12, padding: '24px 0' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span className="spinner" /><span className="mono" style={{ color: 'var(--muted)' }}>Opening dossier…</span></div>
          <div className="skeleton" style={{ height: 120 }} />
          <div className="skeleton" style={{ height: 200, opacity: 0.6 }} />
        </div>
      )}
      {error && <div role="alert" style={{ color: '#A32E1F', padding: '16px 0', borderTop: '2px solid #A32E1F', fontSize: '0.92rem' }}>{error} <span style={{ color: 'var(--muted)' }}>— try refresh or enable Demo.</span></div>}

      {caseItem && (
        <article className="dossier">
          {/* DOSSIER HEADER — full-width editorial */}
          <div className="dossier-top">
            <div style={{ minWidth: 0, flex: '1 1 480px' }}>
              <div className="eyebrow">Dossier · Case file #{onChainIdx?.toString() ?? caseIndex ?? '—'}</div>
              <h1 className="display dossier-title">{caseItem.title}</h1>
              <p className="dossier-desc">{caseItem.description}</p>
              <div className="dossier-meta">
                <span>OWNER <strong>{caseItem.owner}</strong></span>
                <span>INSERTS <strong>{receipts.length}</strong></span>
                <span>TOTAL <strong style={{ color: onChainCase ? 'var(--verify)' : undefined }}>{onChainCase ? onChainCase.total.toString() : '—'}</strong></span>
                <span>PHASE <strong>{onChainCase?.phase ?? '—'}</strong></span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end', flexShrink: 0 }}>
              <span className={`status-ribbon ${sealed ? 'status-sealed' : 'status-open'}`}>{sealed ? '● Sealed' : '● Open'}</span>
              <Link to={`/audit?case=${onChainIdx?.toString() ?? caseIndex}`} className="btn btn-secondary" style={{ fontSize: '0.84rem' }}>Audit this matter ↗</Link>
            </div>
          </div>

          {!isDemo && !isConnected && (
            <div style={{ padding: '20px 0', borderTop: '1px solid var(--line)' }}><WalletStatus walletState={walletState} isMobile={isMobile} /></div>
          )}
          {isConnected && !isDemo && membershipStatus === 'not-member' && (
            <div style={{ padding: '18px 0', borderTop: '1px solid var(--line)', display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div className="mono" style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ochre)', fontWeight: 700 }}>● Not on allowlist — join required</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--muted)', marginTop: 4, maxWidth: '60ch' }}>Preprod uses one shared owner commitment. Apply it and retry instantly — no grant needed.</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-primary" style={{ fontSize: '0.84rem' }} onClick={() => { try { applyOwnerSecret(MIDNIGHTTRACE_OWNER_SECRET); setMsg('✓ Joined as investigator — commitment applied. Retry the action.'); setMsgTechnical(null); } catch (e) { setMsg('Join failed.'); setMsgTechnical(String(e)); } }}>
                  Join as investigator
                </button>
                <button className="btn btn-secondary" style={{ fontSize: '0.84rem' }} onClick={() => { try { enableDemo(); setMsg('Demo enabled — no allowlist needed.'); } catch {} }}>Enable demo</button>
              </div>
            </div>
          )}

          {/* 3-ZONE WORKSPACE */}
          <div className="work-grid">
            <nav className="work-index" aria-label="Dossier index">
              <a href="#overview" className="active">Overview</a>
              <a href="#evidence">Evidence · {receipts.length}</a>
              <a href="#prove">Prove & disclose</a>
              <a href="#access">Access</a>
            </nav>

            <div className="evidence-stream">
              <section id="overview" style={{ paddingBottom: 8 }}>
                <div className="stat-strip" style={{ borderTop: 'none' }}>
                  <div className="stat-open" style={{ paddingTop: 0 }}>
                    <span className="stat-open-label">Public total</span>
                    <span className="stat-open-value" style={{ fontSize: '2.2rem', color: onChainCase ? 'var(--verify)' : 'var(--muted-faint)' }}>{onChainCase ? onChainCase.total.toString() : '—'}</span>
                    <span className="stat-open-sub">on-chain · <span className="redacted redacted-sm">amount hidden</span></span>
                  </div>
                  <div className="stat-open" style={{ paddingTop: 0 }}>
                    <span className="stat-open-label">Last disclosed</span>
                    <span className="stat-open-value" style={{ fontSize: '2.2rem', color: onChainCase?.lastDisclosed && onChainCase.lastDisclosed > 0n ? 'var(--ochre)' : 'var(--muted-faint)' }}>{onChainCase ? onChainCase.lastDisclosed.toString() : '—'}</span>
                    <span className="stat-open-sub">{onChainCase ? `${onChainCase.eventCount.toString()} inserts` : 'no ledger entry'}</span>
                  </div>
                </div>
              </section>

              <section id="evidence" style={{ paddingTop: 12 }}>
                <div className="section-head">
                  <h2 style={{ fontSize: '1.5rem' }}>Evidence stream</h2>
                  <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{receipts.length} inserts · private amounts <span className="redacted redacted-sm">redacted</span></span>
                </div>
                {receipts.length === 0 ? (
                  <div className="empty-open" style={{ marginTop: 16 }}>
                    <div style={{ fontSize: '1.6rem' }}>📄</div>
                    <h3>No inserts yet</h3>
                    <p>Use “Prove & disclose” on the right — log a hidden finding, disclose, or seal. Each appears here with block + stamp.</p>
                  </div>
                ) : (
                  <div>
                    {receipts.map((r) => (
                      <div key={r.txId} className="evidence-entry">
                        <div className="evidence-when">
                          {fmtDay(r.createdAt)}<br />
                          block {r.blockHeight}<br />
                          <span style={{ opacity: 0.7 }}>{r.txId.slice(0, 8)}…</span>
                        </div>
                        <div>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                            <h4>{r.stepType === 'discloseFinding' ? 'Disclosed running total' : r.stepType === 'closeCase' ? 'Sealed the matter' : 'Logged a hidden finding'}</h4>
                            {r.stepType === 'discloseFinding' ? <span className="stamp stamp-pending stamp-small">Disclosed</span> : <span className="stamp stamp-verify stamp-small">Verified</span>}
                          </div>
                          <div className="mono" style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--muted)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <span>tx <span style={{ color: 'var(--ink)' }}>{r.txId.slice(0, 12)}…</span></span>
                            <span>case #{r.caseIndex ?? '—'}</span>
                            <span className="redacted redacted-sm">amount</span>
                            {r.stepType === 'discloseFinding' && <span>→ total <strong style={{ color: 'var(--ochre)' }}>{r.total}</strong></span>}
                          </div>
                          <div style={{ marginTop: 6, fontSize: '0.82rem', color: 'var(--muted)' }}>{fmtTime(r.createdAt)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section id="access" style={{ paddingTop: 32 }}>
                <div className="section-head">
                  <h2 style={{ fontSize: '1.3rem' }}>Access — allowlist</h2>
                  <span className="mono" style={{ fontSize: '0.7rem', color: membershipStatus === 'member' || isDemo ? 'var(--verify)' : 'var(--ochre)' }}>{isDemo ? 'demo authorized' : membershipStatus}</span>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '0.92rem', maxWidth: '60ch' }}>
                  Commitment <code className="mono" style={{ color: 'var(--ink)', wordBreak: 'break-all' }}>{memberCommitmentHex ?? (isDemo ? 'demo-authorized' : 'connect wallet')}</code>
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  <input className="input" placeholder="64 hex member secret" value={memberSecret} onChange={(e) => setMemberSecret(e.target.value)} style={{ flex: '1 1 220px' }} />
                  <button className="btn btn-secondary" onClick={() => void grant()}>Grant access</button>
                  <button className="btn btn-ghost" onClick={() => { if (isDemo) setMemberMsg('Demo — already authorized'); else { try { applyOwnerSecret(memberSecret.trim()); setMemberMsg('Secret applied'); setMemberSecret(''); } catch (e) { setMemberMsg((e as Error).message); } } }}>Use secret</button>
                </div>
                {memberMsg && <div style={{ marginTop: 8, fontSize: '0.86rem', color: 'var(--muted)' }}>{memberMsg}</div>}
              </section>
            </div>

            {/* RIGHT — THE selective container: prove rail */}
            <aside id="prove" className="verify-rail solo-card" aria-label="Prove and disclose">
              <div className="solo-card-head">
                <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>Prove & disclose</strong>
                <span className="badge badge-private">ZK · private</span>
              </div>
              <div className="solo-card-body">
                <div>
                  <label className="field-label" htmlFor="case-index">
                    On-chain case #
                    <button type="button" className="btn btn-ghost" style={{ marginLeft: 8, padding: '2px 8px', fontSize: '0.7rem' }} onClick={() => setEditIdx((v) => !v)}>{editIdx ? 'Lock' : 'Edit'}</button>
                  </label>
                  <input id="case-index" className="input mono" inputMode="numeric" value={caseIndex} onChange={(e) => setCaseIndex(e.target.value.replace(/[^0-9]/g, ''))} readOnly={!editIdx} placeholder="7" style={{ fontSize: '1.2rem', textAlign: 'center' }} />
                  {ledger && <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 6 }}>Next free #{ledger.cases.length ? (ledger.cases.reduce((m, c) => c.caseId > m ? c.caseId : m, 0n) + 1n).toString() : '0'} · {isDemo ? 'demo' : 'preprod'}</div>}
                </div>
                <div>
                  <label className="field-label" htmlFor="action-sel">Step</label>
                  <select id="action-sel" className="input" value={action} onChange={(e) => setAction(e.target.value as Action)}>
                    <option value="logStep">① Log finding — private amount → proof</option>
                    <option value="discloseFinding">② Disclose — publish running total</option>
                    <option value="closeCase">③ Close — seal the matter</option>
                  </select>
                </div>
                {action !== 'closeCase' && (
                  <div>
                    <label className="field-label" htmlFor="amt">{action === 'logStep' ? 'Hidden amount — 🔒 never leaves device' : 'Total to publish'}</label>
                    <input id="amt" className="input" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} placeholder={action === 'logStep' ? 'e.g. 18  (max 65,535)' : 'e.g. 42'} maxLength={5} style={{ fontSize: '1.3rem', textAlign: 'center' }} />
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 6, lineHeight: 1.55 }}>
                      {action === 'logStep'
                        ? <><span className="redacted redacted-sm">amount</span> stays local · wire proves <code className="mono">total&apos; = total + amount</code> · public sees only total ✓</>
                        : <>Publishes <code className="mono">lastDisclosed</code>. All step amounts stay <span className="redacted redacted-sm">redacted</span>.</>}
                    </div>
                  </div>
                )}
                {!onChainCase ? (
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => void open()} disabled={busy}>{busy ? txStateLabel(txState) || 'Opening…' : `Open case #${caseIndex || '—'} on ledger${isDemo ? ' (demo)' : ''}`}</button>
                ) : (
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => void run()} disabled={busy}>
                    {busy ? txStateLabel(txState) || 'Generating proof…' : action === 'logStep' ? 'Generate proof — log finding' : action === 'discloseFinding' ? 'Generate proof — disclose' : 'Seal case — final attestation'}
                  </button>
                )}
                {busy && <TxProgress stage={busyStage} />}
                {msg && (
                  <div role="status" style={{ padding: '12px', borderRadius: 10, fontSize: '0.88rem', background: msg.startsWith('✓') ? 'var(--verify-soft)' : 'var(--ochre-soft)', border: `1px solid ${msg.startsWith('✓') ? 'var(--verify-border)' : 'var(--ochre-border)'}`, color: msg.startsWith('✓') ? 'var(--verify)' : 'var(--ochre)' }}>
                    {msg}
                    {msgTechnical && (
                      <div style={{ marginTop: 8 }}>
                        <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.74rem' }} onClick={() => setShowTechnical((v) => !v)}>{showTechnical ? 'Hide technical details' : 'Show technical details'}</button>
                        {showTechnical && <pre className="mono" style={{ marginTop: 6, padding: '10px', background: 'rgba(0,0,0,0.06)', borderRadius: 8, fontSize: '0.72rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: 'var(--muted)' }}>{msgTechnical}</pre>}
                      </div>
                    )}
                  </div>
                )}
                {msg?.startsWith('✓') && lastProof && (
                  <div style={{ borderTop: '1px solid var(--line-soft)', paddingTop: 14, display: 'grid', gap: 8, fontSize: '0.86rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Verification</span><strong style={{ color: 'var(--verify)' }}>✓ VERIFIED</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Case</span><code className="mono">#{lastProof.caseId}</code></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Proof</span><code className="mono">{lastProof.txId.slice(0, 14)}…</code></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Block</span><span className="mono">{String(lastProof.blockHeight)}</span></div>
                    <Link to={`/audit?case=${lastProof.caseId}`} className="btn btn-secondary" style={{ width: '100%', marginTop: 4 }}>View audit details →</Link>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </article>
      )}
    </>
  );
}
