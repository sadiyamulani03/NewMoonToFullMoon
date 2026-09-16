import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { addReceipt, exportCaseReceipts, getCase, setCaseStatus, type ForensicCase } from '../lib/api';
import { useMidnightContext } from '../context/MidnightContext';
import { useDemo } from '../context/DemoContext';
import { commitmentForSecret, toHex } from '../lib/membership';
import WalletStatus from '../components/WalletStatus';
import TxProgress from '../components/TxProgress';

type Action = 'logStep' | 'discloseFinding' | 'closeCase';

function fmtTime(iso: string): string { return new Date(iso).toLocaleString(); }

export default function CaseDetail() {
  const { id = '' } = useParams();
  const [caseItem, setCaseItem] = useState<ForensicCase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<Action>('logStep');
  const [caseIndex, setCaseIndex] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [busyStage, setBusyStage] = useState<'proof' | 'submit'>('proof');
  const [msg, setMsg] = useState<string | null>(null);
  const [msgTechnical, setMsgTechnical] = useState<string | null>(null);
  const [showTechnical, setShowTechnical] = useState(false);
  const [memberSecret, setMemberSecret] = useState('');
  const [memberMsg, setMemberMsg] = useState<string | null>(null);
  const [onChainIdx, setOnChainIdx] = useState<bigint | null>(null);
  const [editIdx, setEditIdx] = useState(false);

  const { isConnected, walletState, isMobile, midLedger, memberCommitmentHex, membershipStatus, applyOwnerSecret, callOpenCase, callGrantAccess, callLogStep, callDiscloseFinding, callCloseCase } = useMidnightContext();
  const { isDemo, mockCases, mockLedger, demoLogStep, demoDisclose, demoClose, demoOpenCase, getDemoCase } = useDemo();
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
    if (!raw.trim()) return null;
    try {
      const n = BigInt(raw.trim());
      if (n < 0n) { setMsg('Amount must be 0 or more.'); setMsgTechnical(null); return null; }
      if (n > 65535n) { setMsg('Amount too large — max 65,535 per step. Use multiple findings for larger totals.'); setMsgTechnical(null); return null; }
      return n;
    } catch { setMsg('Enter a valid number.'); setMsgTechnical(null); return null; }
  };

  const run = async () => {
    setMsgTechnical(null); setShowTechnical(false);
    if (isDemo && caseItem) {
      const cid = resolveId();
      if (action === 'logStep') { const p = validateAmount(amount); if (p === null) return; demoLogStep(cid, p, caseItem.id); setMsg('✓ Demo: finding logged — redacted amount → public total updated.'); setMsgTechnical(null); }
      else if (action === 'discloseFinding') { const p = validateAmount(amount); if (p === null) return; demoDisclose(cid, p, caseItem.id); setMsg('✓ Demo: total disclosed — now public.'); setMsgTechnical(null); }
      else { demoClose(cid, caseItem.id); setMsg('✓ Demo: case sealed — phase CLOSED.'); setMsgTechnical(null); }
      setAmount(''); return;
    }
    if (!isConnected) { setMsg('Connect wallet or enable Demo — no proof can be generated without a wallet.'); setMsgTechnical(null); return; }
    if (membershipStatus !== 'member') { setMsg('Not on allowlist — this wallet cannot log findings for this ledger.'); setMsgTechnical('Membership check: allowlist.findPathForLeaf(commitment) returned nothing for this secret. Use the owner secret or ask a member to grant access.'); return; }
    setBusy(true); setBusyStage('proof'); setMsg(null); setMsgTechnical(null);
    try {
      const cid = resolveId();
      if (action === 'logStep') {
        const p = validateAmount(amount); if (p === null) { setBusy(false); return; }
        setBusyStage('proof');
        const r = await callLogStep(cid, p);
        setBusyStage('submit');
        await onLanded(r.txId, r.blockHeight, 'logStep');
      } else if (action === 'discloseFinding') {
        const p = validateAmount(amount); if (p === null) { setBusy(false); return; }
        setBusyStage('proof');
        const r = await callDiscloseFinding(cid, p);
        setBusyStage('submit');
        await onLanded(r.txId, r.blockHeight, 'discloseFinding', p);
      } else {
        setBusyStage('proof');
        const r = await callCloseCase(cid);
        setBusyStage('submit');
        await onLanded(r.txId, r.blockHeight, 'closeCase');
      }
      setMsg('✓ Proof verified — receipt filed on ledger.');
      setMsgTechnical(null);
      setAmount('');
    } catch (e) {
      const raw = (e as Error).message ?? String(e);
      if (/reject/i.test(raw) || /declined|denied|user/i.test(raw)) { setMsg('Wallet declined — nothing was submitted. Try again when ready.'); setMsgTechnical(raw); }
      else if (/Failed to fetch|NetworkError|proof server/i.test(raw)) { setMsg('We couldn’t reach the proof service.'); setMsgTechnical(`${raw} — Try: docker compose up -d --wait proof-server or enable Demo in the header.`); }
      else if (/timeout/i.test(raw)) { setMsg('Wallet didn’t respond in time.'); setMsgTechnical(raw); }
      else { setMsg('We couldn’t complete the proof.'); setMsgTechnical(raw); }
    } finally { setBusy(false); }
  };

  const open = async () => {
    setMsgTechnical(null); setShowTechnical(false);
    if (isDemo) {
      const cid = resolveId();
      if (caseItem) { demoLogStep(cid, 0n, caseItem.id); setMsg(`✓ Demo: case #${cid} marked open.`); setMsgTechnical(null); }
      else { const nid = demoOpenCase(cid, `Case #${cid}`, ''); setMsg(`✓ Demo: case #${cid} created ${nid}.`); setMsgTechnical(null); }
      return;
    }
    if (!isConnected) { setMsg('Connect wallet or enable Demo.'); setMsgTechnical(null); return; }
    if (membershipStatus !== 'member') { setMsg('Not on allowlist — cannot open cases.'); setMsgTechnical('Requires allowlist membership proof for openCase.'); return; }
    setBusy(true); setBusyStage('proof'); setMsg(null); setMsgTechnical(null);
    try {
      const cid = resolveId();
      const meta = `${caseItem?.title ?? ''}|${caseItem?.description ?? ''}|${String(cid)}`;
      const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(meta)));
      setBusyStage('proof');
      const r = await callOpenCase(cid, hash);
      setBusyStage('submit');
      await onLanded(r.txId, r.blockHeight, 'logStep', 0n);
      setMsg(`✓ Case #${cid} opened on-chain — phase ACTIVE, total 0.`);
      setMsgTechnical(null);
    } catch (e) {
      const raw = (e as Error).message ?? String(e);
      if (/already exists/i.test(raw)) { setMsg(`Case #${resolveId()} already exists on ledger.`); setMsgTechnical(raw); }
      else if (/reject/i.test(raw)) { setMsg('Wallet declined — case not opened.'); setMsgTechnical(raw); }
      else { setMsg('We couldn’t open the case.'); setMsgTechnical(raw); }
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

  return (
    <>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--muted-ink)', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <Link to="/cases" style={{ color: 'var(--muted-ink)' }}>Cases</Link>
        <span>›</span>
        <span className="mono" style={{ color: 'var(--paper)', background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 3, border: '1px solid var(--line-ink)' }}>{caseItem?.title ?? id}</span>
        {isDemo && <span className="stamp stamp-verify stamp-small">Demo — not on-chain</span>}
      </div>

      {!caseItem && !error && (
        <div style={{ padding: 18, display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span className="spinner" aria-hidden="true" /><span className="mono" style={{ color: 'var(--muted-ink)', fontSize: '0.86rem' }}>Loading evidence folder…</span></div>
          <div className="skeleton" style={{ height: 120 }} />
          <div className="skeleton" style={{ height: 200, opacity: 0.6 }} />
        </div>
      )}
      {error && <div role="alert" style={{ color: '#ff8d7a', padding: 12, border: '1px solid rgba(255,141,122,0.25)', borderRadius: 4, background: 'rgba(255,141,122,0.08)' }}>{error} <span style={{ color: 'var(--muted-ink)', fontSize: '0.82rem' }}>— try refresh or enable Demo.</span></div>}

      {caseItem && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 0.95fr) minmax(360px, 1.05fr)', gap: 16, alignItems: 'start' }}>
          {/* PANEL A — status + primary actions */}
          <div className="inspect" style={{ position: 'sticky', top: 16 }}>
            <div className="inspect-head">
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-ink)' }}>Folder · Case file</div>
                <div className="inspect-title" style={{ marginTop: 4 }}>{caseItem.title}</div>
                <div style={{ marginTop: 6, color: 'var(--muted-ink)', fontSize: '0.88rem', lineHeight: 1.5 }}>{caseItem.description}</div>
              </div>
              <span className={`stamp ${caseItem.status === 'closed' || onChainCase?.phase === 'CLOSED' ? 'stamp-pending' : 'stamp-verify'}`} style={{ flexShrink: 0 }}>
                {onChainCase?.phase === 'CLOSED' || caseItem.status === 'closed' ? 'Sealed' : 'Open'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
              <div style={{ border: '1px solid var(--line-ink)', borderRadius: 4, padding: '10px 11px', background: 'rgba(255,255,255,0.02)' }}>
                <div className="ledger-label">Public total</div>
                <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: onChainCase ? 'var(--verify)' : 'var(--muted-ink)' }}>{onChainCase ? onChainCase.total.toString() : '—'}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted-ink)' }}>on-chain · <span className="redacted redacted-sm">amount redacted</span></div>
              </div>
              <div style={{ border: '1px solid var(--line-ink)', borderRadius: 4, padding: '10px 11px', background: 'rgba(255,255,255,0.02)' }}>
                <div className="ledger-label" style={{ color: onChainCase?.lastDisclosed && onChainCase.lastDisclosed > 0n ? 'var(--ochre)' : undefined }}>Last disclosed</div>
                <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: onChainCase?.lastDisclosed && onChainCase.lastDisclosed > 0n ? 'var(--ochre)' : 'var(--muted-ink)' }}>{onChainCase ? onChainCase.lastDisclosed.toString() : '—'}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted-ink)' }}>phase {onChainCase?.phase ?? '—'} · {onChainCase?.eventCount.toString() ?? '0'} inserts</div>
              </div>
            </div>

            <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--muted-ink)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span>Owner <span className="mono" style={{ color: 'var(--paper)', background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 3 }}>{caseItem.owner}</span></span>
              <span>Case ID <span className="mono" style={{ color: 'var(--paper)' }}>#{(onChainIdx?.toString() ?? caseIndex) || '—'}</span></span>
            </div>

            {!isDemo && !isConnected && <div style={{ marginTop: 12 }}><WalletStatus walletState={walletState} isMobile={isMobile} /></div>}

            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line-ink)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-ink)', marginBottom: 8 }}>Primary actions — one folder, one ledger</div>

              <label className="field-label" htmlFor="case-index" style={{ marginTop: 0 }}>
                On-chain case #
                <button type="button" className="btn btn-ghost" style={{ marginLeft: 8, padding: '2px 8px', fontSize: '0.68rem' }} onClick={() => setEditIdx((v) => !v)}>{editIdx ? 'Lock' : 'Edit'}</button>
              </label>
              <input id="case-index" className="input" inputMode="numeric" value={caseIndex} onChange={(e) => setCaseIndex(e.target.value.replace(/[^0-9]/g, ''))} readOnly={!editIdx} placeholder="7" style={{ opacity: editIdx ? 1 : 0.92 }} />
              {ledger && <div style={{ fontSize: '0.74rem', color: 'var(--muted-ink)', marginTop: 4 }}>Next free #{ledger.cases.length ? (ledger.cases.reduce((m, c) => c.caseId > m ? c.caseId : m, 0n) + 1n).toString() : '0'} · {isDemo ? 'demo' : 'preprod'} ledger</div>}

              <select className="input" value={action} onChange={(e) => setAction(e.target.value as Action)} style={{ marginTop: 10 }}>
                <option value="logStep">Log finding — private amount → proof</option>
                <option value="discloseFinding">Disclose — publish running total</option>
                <option value="closeCase">Close case — seal phase</option>
              </select>

              {action !== 'closeCase' && (
                <>
                  <label className="field-label" htmlFor="amt">
                    {action === 'logStep' ? 'Step amount — stays redacted 🔒 PRIVATE' : 'Running total to publish — selective disclosure'}
                  </label>
                  <input id="amt" className="input" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} placeholder={action === 'logStep' ? 'e.g. 18 (max 65535)' : 'e.g. 42'} maxLength={5} aria-describedby="amt-help" />
                  <div id="amt-help" style={{ fontSize: '0.74rem', color: 'var(--muted-ink)', marginTop: 4, lineHeight: 1.5 }}>
                    {action === 'logStep' ? (
                      <><span className="redacted redacted-sm">amount</span> never leaves your device · Wire proves <code className="mono">total&apos; = total + amount</code> · Public sees only total + <span className="stamp stamp-verify stamp-small" style={{ verticalAlign: 'middle' }}>Verified</span></>
                    ) : (
                      <>This publishes <code className="mono">lastDisclosed</code> on-chain. All other step amounts stay <span className="redacted redacted-sm">redacted</span>.</>
                    )}
                  </div>
                </>
              )}

              {!onChainCase ? (
                <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={() => void open()} disabled={busy}>{busy ? 'Opening… check wallet' : `Open case #${caseIndex || '—'} on ledger${isDemo ? ' (demo)' : ''}`}</button>
              ) : (
                <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={() => void run()} disabled={busy || (action !== 'closeCase' && !amount && !isDemo)}>
                  {busy ? (busyStage === 'proof' ? 'Generating proof… check wallet' : 'Submitting — awaiting finalization…') : action === 'logStep' ? 'Generate proof — log finding (private)' : action === 'discloseFinding' ? 'Generate proof — disclose finding' : 'Seal case — final attestation'}
                </button>
              )}
              {busy && <div style={{ marginTop: 10 }}><TxProgress stage={busyStage} /></div>}
              {msg && (
                <div role="status" aria-live="polite" style={{ marginTop: 10, padding: '8px 10px', borderRadius: 4, fontSize: '0.86rem', background: msg.startsWith('✓') ? 'var(--verify-soft)' : 'var(--ochre-soft)', border: `1px solid ${msg.startsWith('✓') ? 'var(--verify-border)' : 'var(--ochre-border)'}`, color: msg.startsWith('✓') ? 'var(--verify)' : 'var(--ochre)' }}>
                  {msg}
                  {msgTechnical && (
                    <div style={{ marginTop: 8 }}>
                      <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.74rem' }} onClick={() => setShowTechnical((v) => !v)} aria-expanded={showTechnical}>
                        {showTechnical ? 'Hide technical details' : 'Show technical details'}
                      </button>
                      {showTechnical && <pre className="mono" style={{ marginTop: 6, padding: '8px 10px', background: 'rgba(0,0,0,0.25)', borderRadius: 4, fontSize: '0.72rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: 'var(--muted-ink)' }}>{msgTechnical}</pre>}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--line-ink)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-ink)' }}>Allowlist — member secret</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--muted-ink)', marginTop: 4 }}>Commitment <span className="mono" style={{ color: 'var(--paper)', wordBreak: 'break-all' }}>{memberCommitmentHex ?? (isDemo ? 'demo-authorized' : 'connect wallet')}</span> · <span style={{ color: membershipStatus === 'member' || isDemo ? 'var(--verify)' : 'var(--ochre)' }}>{isDemo ? 'demo' : membershipStatus}</span></div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input className="input" placeholder="64 hex secret" value={memberSecret} onChange={(e) => setMemberSecret(e.target.value)} style={{ flex: '1 1 160px' }} />
                <button className="btn btn-secondary" onClick={() => void grant()} style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>Grant</button>
                <button className="btn btn-ghost" onClick={() => { if (isDemo) setMemberMsg('Demo — already authorized'); else { try { applyOwnerSecret(memberSecret.trim()); setMemberMsg('Secret applied'); setMemberSecret(''); } catch (e) { setMemberMsg((e as Error).message); } } }} style={{ padding: '8px 10px' }}>Use</button>
              </div>
              {memberMsg && <div style={{ marginTop: 6, fontSize: '0.82rem', color: 'var(--muted-ink)' }}>{memberMsg}</div>}
            </div>
          </div>

          {/* PANEL B — ledger history + receipts */}
          <div className="ledger">
            <div className="ledger-head">
              <span className="ledger-title">Ledger history · Receipts</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-ghost" onClick={copyShare} style={{ padding: '6px 10px', fontSize: '0.78rem' }}>{shareCopied ? 'Copied ✓' : 'Copy share link'}</button>
                <Link to={`/audit?case=${onChainIdx?.toString() ?? caseIndex}`} className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>Audit this ↗</Link>
                <button className="btn btn-ghost" onClick={exportJson} disabled={!caseItem || !caseItem.receipts.length} style={{ padding: '6px 10px', fontSize: '0.78rem' }}>Export JSON</button>
              </div>
            </div>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--line-ink)', background: 'rgba(255,255,255,0.02)', fontSize: '0.82rem', color: 'var(--muted-ink)' }}>
              Inserts filed by block height. Private amounts show as <span className="redacted redacted-sm">redacted</span>. Public totals have a <span className="stamp stamp-verify stamp-small" style={{ verticalAlign: 'middle' }}>Verified</span> stamp.
            </div>
            {!caseItem ? (
              <div style={{ padding: 18, color: 'var(--muted-ink)' }}>Loading…</div>
            ) : caseItem.receipts.length === 0 ? (
              <div className="empty" style={{ margin: 12 }}>
                <div className="empty-icon">📄</div>
                <h3 className="empty-title">No inserts yet</h3>
                <p className="empty-text">Run the circuit on the left — log a hidden finding, disclose, or seal. Each will appear here with a block number and verify stamp.</p>
              </div>
            ) : (
              <div className="timeline">
                {caseItem.receipts.slice().sort((a, b) => a.blockHeight - b.blockHeight || a.createdAt.localeCompare(b.createdAt)).map((r) => (
                  <div key={r.txId} className="timeline-item">
                    <div className={`timeline-dot ${r.stepType === 'discloseFinding' ? 'timeline-dot-pending' : r.stepType === 'closeCase' ? 'timeline-dot-pending' : 'timeline-dot-verify'}`} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <strong style={{ color: 'var(--paper)', fontSize: '0.92rem' }}>{r.stepType === 'discloseFinding' ? 'Disclosed' : r.stepType === 'closeCase' ? 'Sealed' : 'Finding logged'}</strong>
                        <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted-ink)' }}>· {fmtTime(r.createdAt)}</span>
                        {r.stepType === 'discloseFinding' ? <span className="stamp stamp-pending stamp-small">Disclosed</span> : <span className="stamp stamp-verify stamp-small">Verified</span>}
                      </div>
                      <div className="mono" style={{ marginTop: 6, fontSize: '0.74rem', color: 'var(--muted-ink)', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span>tx <span style={{ color: 'var(--paper)' }}>{r.txId.slice(0, 12)}…</span></span>
                        <span>block {r.blockHeight}</span>
                        <span>case #{r.caseIndex ?? '—'}</span>
                        <span className="redacted redacted-sm">amount</span>
                        {r.stepType === 'discloseFinding' && <span>→ total <strong style={{ color: 'var(--ochre)' }}>{r.total}</strong></span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <style>{`@media(max-width: 860px){ div[style*="0.95fr"]{ grid-template-columns:1fr !important } div[style*="sticky"]{ position:static !important } }`}</style>
    </>
  );
}
