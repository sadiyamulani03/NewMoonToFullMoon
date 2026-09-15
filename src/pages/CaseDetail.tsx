import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { addReceipt, exportCaseReceipts, getCase, setCaseStatus, type ForensicCase } from '../lib/api';
import { useMidnightContext } from '../context/MidnightContext';
import { useDemo } from '../context/DemoContext';
import { commitmentForSecret, toHex } from '../lib/membership';
import WalletStatus from '../components/WalletStatus';
import TxProgress from '../components/TxProgress';
import Loading from '../components/Loading';

type Action = 'logStep' | 'discloseFinding' | 'closeCase';

interface DoneArgs {
  txId: string;
  blockHeight: number | bigint;
  total?: bigint | null;
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

function fmtBlock(id: string, blockHeight: number): string {
  return `block ${blockHeight} · ${id.slice(0, 8)}…`;
}

export default function CaseDetail() {
  const { id = '' } = useParams();
  const [caseItem, setCaseItem] = useState<ForensicCase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<Action>('logStep');
  const [caseIndex, setCaseIndex] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [txStage] = useState<'proof' | 'submit'>('proof');
  const [runMessage, setRunMessage] = useState<string | null>(null);
  const [memberSecretInput, setMemberSecretInput] = useState('');
  const [memberMessage, setMemberMessage] = useState<string | null>(null);
  const [onChainIndex, setOnChainIndex] = useState<bigint | null>(null);
  const [indexEdit, setIndexEdit] = useState(false);

  const {
    isConnected,
    walletState,
    isMobile,
    midLedger,
    memberCommitmentHex,
    membershipStatus,
    applyOwnerSecret,
    callOpenCase,
    callGrantAccess,
    callLogStep,
    callDiscloseFinding,
    callCloseCase,
  } = useMidnightContext();

  const { isDemo, mockCases, mockLedger, demoLogStep, demoDisclose, demoClose, demoOpenCase, getDemoCase } = useDemo();

  const ledger = isDemo ? mockLedger : midLedger;

  const reload = useCallback(() => {
    if (isDemo) {
      const found = getDemoCase(id) ?? mockCases.find((c) => c.id === id) ?? null;
      if (found) setCaseItem(found);
      else setError('Demo case not found');
      return;
    }
    getCase(id).then(setCaseItem).catch((e: unknown) => setError(String(e)));
  }, [id, isDemo, getDemoCase, mockCases]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Keep caseItem in sync with demo updates
  useEffect(() => {
    if (!isDemo) return;
    const found = mockCases.find((c) => c.id === id);
    if (found) setCaseItem(found);
  }, [mockCases, id, isDemo]);

  useEffect(() => {
    if (onChainIndex !== null) return;
    if (caseItem && caseItem.receipts.length > 0) {
      const first = caseItem.receipts[0].caseIndex;
      if (first !== undefined && first !== null) {
        const v = BigInt(first);
        setOnChainIndex(v);
        setCaseIndex(v.toString());
        return;
      }
    }
    if (ledger) {
      if (ledger.cases.length === 0) {
        setOnChainIndex(0n);
        setCaseIndex('0');
        return;
      }
      const max = ledger.cases.reduce((m, c) => (c.caseId > m ? c.caseId : m), 0n);
      const hasReceipt = !!(caseItem && caseItem.receipts.length > 0);
      const suggested = hasReceipt ? ledger.cases[0].caseId : max + 1n;
      const clamped = suggested > 65535n ? max : suggested;
      setOnChainIndex(clamped);
      setCaseIndex(clamped.toString());
    }
  }, [ledger, onChainIndex, caseItem]);

  const resolveCaseId = useCallback((): bigint => {
    const parsed = BigInt(caseIndex || '0');
    if (parsed < 0n || parsed > 4294967295n) throw new Error('Case index must be 0–4294967295 (Uint32).');
    return parsed;
  }, [caseIndex]);

  const onLanded = useCallback(
    async (
      done: DoneArgs,
      stepType: 'logStep' | 'discloseFinding' | 'closeCase',
      recordedTotal?: bigint | null,
    ) => {
      if (isDemo) return; // demo already updated via context
      await addReceipt(id, {
        txId: done.txId,
        blockHeight: done.blockHeight,
        total: recordedTotal ?? 0n,
        stepType,
        caseIndex: resolveCaseId(),
      }).catch(() => undefined);
      if (stepType === 'closeCase') {
        await setCaseStatus(id, 'closed').catch(() => undefined);
      }
      reload();
    },
    [id, reload, resolveCaseId, isDemo],
  );

  const runActive = async () => {
    if (isDemo && caseItem) {
      const cid = resolveCaseId();
      if (action === 'logStep') {
        const parsed = BigInt(amount || '0');
        if (parsed < 0n) { setRunMessage('Amount cannot be negative'); return; }
        demoLogStep(cid, parsed, caseItem.id);
        setRunMessage('Demo: hidden step logged locally (not on-chain).');
      } else if (action === 'discloseFinding') {
        const parsed = BigInt(amount || '0');
        demoDisclose(cid, parsed, caseItem.id);
        setRunMessage('Demo: disclosed total updated in-memory.');
      } else {
        demoClose(cid, caseItem.id);
        setRunMessage('Demo: case sealed in-memory.');
      }
      setAmount('');
      return;
    }
    if (!isConnected) {
      setRunMessage('Connect the wallet first — or enable Demo mode.');
      return;
    }
    if (membershipStatus !== 'member') {
      setRunMessage('This wallet has no membership secret on the allowlist yet.');
      return;
    }
    setBusy(true);
    setRunMessage(null);
    try {
      const caseId = resolveCaseId();
      let blockHeight: number | bigint;
      if (action === 'logStep') {
        const parsed = BigInt(amount || '0');
        if (parsed < 0n) throw new Error('Step amount cannot be negative.');
        const r = await callLogStep(caseId, parsed);
        blockHeight = r.blockHeight;
        await onLanded({ txId: r.txId, blockHeight }, 'logStep', null);
      } else if (action === 'discloseFinding') {
        const parsed = BigInt(amount || '0');
        if (parsed < 0n) throw new Error('Disclosed running total cannot be negative.');
        const r = await callDiscloseFinding(caseId, parsed);
        blockHeight = r.blockHeight;
        await onLanded({ txId: r.txId, blockHeight, total: parsed }, 'discloseFinding', parsed);
      } else {
        const r = await callCloseCase(caseId);
        blockHeight = r.blockHeight;
        await onLanded({ txId: r.txId, blockHeight, total: null }, 'closeCase', null);
      }
      setRunMessage('Transaction landed on-chain and the receipt was filed.');
    } catch (e: unknown) {
      setRunMessage((e as Error & { reason?: string }).reason ?? (e as Error).message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  const openCaseOnChain = async () => {
    if (isDemo && caseItem) {
      const cid = resolveCaseId();
      // demo already has case; just add a fresh open receipt if needed
      demoLogStep(cid, 0n, caseItem.id);
      setRunMessage(`Demo: case #${cid.toString()} marked open in-memory.`);
      return;
    }
    if (isDemo) {
      const cid = resolveCaseId();
      const newId = demoOpenCase(cid, caseItem?.title ?? `Case #${cid.toString()}`, caseItem?.description ?? '');
      setRunMessage(`Demo: new case #${cid.toString()} created as ${newId}.`);
      return;
    }
    if (!isConnected) {
      setRunMessage('Connect the wallet first — or enable Demo.');
      return;
    }
    if (membershipStatus !== 'member') {
      setRunMessage('This wallet has no membership secret on the allowlist yet.');
      return;
    }
    setBusy(true);
    setRunMessage(null);
    try {
      const caseId = resolveCaseId();
      const meta = `${caseItem?.title ?? ''}|${caseItem?.description ?? ''}|${caseId.toString()}`;
      const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(meta));
      const metadataHash = new Uint8Array(hashBuf);
      const r = await callOpenCase(caseId, metadataHash);
      setRunMessage(`Case #${caseId.toString()} opened on-chain (tx ${r.txId.slice(0, 12)}…, metadata anchored).`);
      await onLanded({ txId: r.txId, blockHeight: r.blockHeight }, 'logStep', 0n);
    } catch (e: unknown) {
      setRunMessage((e as Error & { reason?: string }).reason ?? (e as Error).message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  const grantNewMember = async () => {
    if (isDemo) { setMemberMessage('Demo: membership is mocked — grant is simulated as already authorized.'); return; }
    if (!isConnected) {
      setMemberMessage('Connect the wallet first.');
      return;
    }
    if (membershipStatus !== 'member') {
      setMemberMessage('Only an allowlisted member can authorize others.');
      return;
    }
    setMemberMessage(null);
    const secretHex = memberSecretInput.trim().replace(/^0x/i, '');
    if (!/^[0-9a-fA-F]{64}$/.test(secretHex)) {
      setMemberMessage('Member secret must be exactly 64 hex characters (32 bytes).');
      return;
    }
    try {
      const secret = new Uint8Array(32);
      for (let i = 0; i < 32; i++) secret[i] = parseInt(secretHex.slice(i * 2, i * 2 + 2), 16);
      const r = await callGrantAccess(secret);
      setMemberMessage(
        `Access granted. Commit ${toHex(commitmentForSecret(secret)).slice(0, 16)}… tx ${r.txId.slice(0, 12)}…`,
      );
      setMemberSecretInput('');
    } catch (e: unknown) {
      setMemberMessage((e as Error & { reason?: string }).reason ?? (e as Error).message ?? String(e));
    }
  };

  const provideOwnerSecret = () => {
    if (isDemo) { setMemberMessage('Demo: member secret is mocked — already authorized.'); return; }
    try {
      applyOwnerSecret(memberSecretInput.trim());
      setMemberMessage('Owner secret applied — membership proof will use it.');
      setMemberSecretInput('');
    } catch (e: unknown) {
      setMemberMessage((e as Error).message);
    }
  };

  const downloadExport = () => {
    if (!caseItem) return;
    const blob = new Blob([exportCaseReceipts(caseItem)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `midnighttrace-${caseItem.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onChainCase = onChainIndex !== null && ledger
    ? ledger.cases.find((c) => c.caseId === onChainIndex) ?? null
    : null;

  return (
    <>
      <div className="breadcrumb">
        <Link to="/cases">Cases</Link>
        <span> / </span>
        <span className="info-label">{caseItem?.title ?? 'case'}</span>
        {isDemo && <span className="info-label" style={{ background: 'rgba(139,224,175,0.15)', color: '#8be0af' }}>Demo — not on-chain</span>}
      </div>

      {/* CARD 1: Case overview + wallet + membership (merged) */}
      <section className="card">
        <p className="section-head">
          <span className="section-no">01</span> Case file — overview
        </p>
        {isDemo ? (
          <p className="muted-text" style={{ marginBottom: 8 }}><span className="info-label" style={{ background: 'rgba(139,224,175,0.15)', color: '#8be0af' }}>Demo — not on-chain</span> All edits here are in-memory — refresh resets.</p>
        ) : !isConnected && (
          <div style={{ marginBottom: 12 }}>
            <WalletStatus walletState={walletState} isMobile={isMobile} />
          </div>
        )}

        {error && <p className="error-text">{error}</p>}
        {!caseItem && !error && <Loading label="Loading case…" />}
        {caseItem && (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <strong className="case-title" style={{ fontSize: '1.2rem' }}>{caseItem.title}</strong>
              <span className={`status-tag ${caseItem.status === 'closed' ? 'status-closed' : ''}`}>{caseItem.status}</span>
              <span className="muted-text" style={{ fontSize: '0.82rem' }}>{caseItem.receipts.length} proof{caseItem.receipts.length === 1 ? '' : 's'} · opened {fmtTime(caseItem.createdAt)}</span>
            </div>
            <p className="muted-text">{caseItem.description}</p>
            <p style={{ marginTop: 8 }}>
              <span className="info-label">Owner</span> <code className="address">{caseItem.owner}</code>
              <span className="info-label" style={{ marginLeft: 8 }}>Allowlist</span>{' '}
              <span className={`status-tag ${membershipStatus === 'member' || isDemo ? '' : 'status-closed'}`}>
                {isDemo ? 'demo — authorized' : membershipStatus === 'member' ? 'member' : membershipStatus === 'not-member' ? 'not authorized' : 'unknown'}
              </span>
              {!isDemo && (
                <>
                  <span className="info-label" style={{ marginLeft: 8 }}>Commitment</span>{' '}
                  <code className="tx-id" style={{ fontSize: '0.78rem' }}>{memberCommitmentHex ?? 'connect wallet'}</code>
                </>
              )}
            </p>

            <div className="ledger-row" style={{ marginTop: 12 }}>
              <span className="info-label">On-chain total</span>
              <code className="value">{onChainCase ? onChainCase.total.toString() : '—'}</code>
              <span className="info-label">Last disclosed</span>
              <code className="value">{onChainCase ? onChainCase.lastDisclosed.toString() : '—'}</code>
              <span className="info-label">Events</span>
              <code className="value">{onChainCase ? onChainCase.eventCount.toString() : '—'}</code>
              <span className="info-label">Phase</span>
              <code className="value">{onChainCase ? onChainCase.phase : '—'}</code>
            </div>
            {(!onChainIndex || !onChainCase) && (
              <p className="muted-text" style={{ marginTop: 8 }}>
                This case file is not on-chain yet. Pick a case index and open it below.
              </p>
            )}

            {/* Inline membership actions — merged into overview card to save a card */}
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
              <label className="form-label" htmlFor="member-secret">Member secret (32-byte hex) — grant or claim access</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  id="member-secret"
                  className="form-input"
                  style={{ flex: '1 1 220px' }}
                  value={memberSecretInput}
                  onChange={(e) => setMemberSecretInput(e.target.value)}
                  placeholder="64 hex chars"
                />
                <button className="btn btn-secondary" onClick={() => void grantNewMember()} disabled={!isDemo && isConnected && membershipStatus !== 'member'} style={{ padding: '9px 14px' }}>
                  Grant access
                </button>
                <button className="btn btn-ghost" onClick={provideOwnerSecret} disabled={!memberSecretInput.trim()} style={{ padding: '9px 12px' }}>
                  Use as my secret
                </button>
              </div>
              {memberMessage && <p className="muted-text" style={{ marginTop: 8 }}>{memberMessage}</p>}
            </div>
          </>
        )}
      </section>

      {/* CARD 2: Investigate (on-chain actions) */}
      <section className="card">
        <p className="section-head">
          <span className="section-no">02</span> Investigate — run the circuit
        </p>
        <p className="muted-text" style={{ marginBottom: 10 }}>
          Every action creates a <span title="A cryptographic proof that total' = total + hidden amount, without revealing the amount">zero-knowledge proof</span>. Your{' '}
          <span title="The private amount — never stored on-chain, never shown on screen">hidden amount</span> stays on your device; only disclosed totals become public.{' '}
          <Link to="/about#glossary" style={{ fontWeight: 700 }}>Glossary →</Link>
        </p>

        <label className="form-label" htmlFor="case-index">
          On-chain case index
          {!indexEdit && caseIndex && (
            <button type="button" className="btn btn-ghost" style={{ marginLeft: 8, padding: '2px 8px', fontSize: '0.7rem' }} onClick={() => setIndexEdit(true)}>
              Edit
            </button>
          )}
          {indexEdit && (
            <button type="button" className="btn btn-ghost" style={{ marginLeft: 8, padding: '2px 8px', fontSize: '0.7rem' }} onClick={() => setIndexEdit(false)}>
              Lock
            </button>
          )}
        </label>
        <input
          id="case-index"
          className="form-input"
          inputMode="numeric"
          value={caseIndex}
          onChange={(e) => setCaseIndex(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="0"
          readOnly={!indexEdit}
          title={indexEdit ? 'Editable — must be 0-65535 and free on-chain' : 'Auto-assigned — click Edit to override'}
          style={!indexEdit ? { opacity: 0.92 } : undefined}
        />
        {!indexEdit && ledger && (
          <p className="muted-text" style={{ fontSize: '0.82rem', marginTop: 6 }}>
            Suggested #{caseIndex} — next free ID{ledger.cases.length > 0 ? ` (max on-chain is #${ledger.cases.reduce((m,c)=>c.caseId>m?c.caseId:m,0n).toString()})` : ''}.
          </p>
        )}

        <select className="form-input" value={action} onChange={(e) => setAction(e.target.value as Action)} style={{ marginTop: 12 }}>
          <option value="logStep">Log a hidden step (add untracked movement)</option>
          <option value="discloseFinding">Disclose a finding (publish running total)</option>
          <option value="closeCase">Seal the case (make totals permanent)</option>
        </select>

        {action !== 'closeCase' && (
          <>
            <label className="form-label" htmlFor="step-amount">
              {action === 'logStep' ? 'Step amount — private, stays on your device' : 'Running total to publish — becomes public'}
            </label>
            <input
              id="step-amount"
              className="form-input"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
          </>
        )}

        {!onChainCase ? (
          <button className="btn btn-secondary btn-block" onClick={() => void openCaseOnChain()} disabled={busy}>
            Open case # on-chain first{isDemo ? ' (demo)' : ''}
          </button>
        ) : (
          <button
            className="btn btn-primary btn-block"
            onClick={() => void runActive()}
            disabled={busy || (action !== 'closeCase' && !amount && !isDemo)}
          >
            {busy
              ? 'Working the zero-knowledge proof…'
              : action === 'logStep'
                ? isDemo ? 'Log hidden step (demo)' : 'Log hidden step'
                : action === 'discloseFinding'
                  ? isDemo ? 'Disclose finding (demo)' : 'Disclose finding'
                  : isDemo ? 'Seal case (demo)' : 'Seal case'}
          </button>
        )}
        {busy && <TxProgress stage={txStage} />}
        {runMessage && <p className={runMessage.includes('Demo') || runMessage.startsWith('Transaction') || runMessage.startsWith('Case') ? 'ok-text' : 'error-text'} style={{ marginTop: 10 }}>{runMessage}</p>}
      </section>

      {/* CARD 3: Chain of custody */}
      <section className="card">
        <p className="section-head">
          <span className="section-no">03</span> Chain of custody
        </p>
        <p className="muted-text" style={{ marginBottom: 10 }}>
          Receipts in finalization order — block + txId + step type. {isDemo && <em>Demo receipts are in-memory.</em>}
        </p>
        {!caseItem && <Loading label="Loading…" />}
        {caseItem && caseItem.receipts.length === 0 && (
          <p className="muted-text">No proofs recorded for this case yet — run the circuits above.</p>
        )}
        {caseItem && caseItem.receipts.length > 0 && (
          <ul className="case-list timeline">
            {caseItem.receipts
              .slice()
              .sort((a, b) => a.blockHeight - b.blockHeight || a.createdAt.localeCompare(b.createdAt))
              .map((r) => (
                <li key={r.txId} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="case-row">
                    <div>
                      <strong className="case-title">
                        {r.stepType === 'discloseFinding'
                          ? 'Finding disclosed'
                          : r.stepType === 'closeCase'
                            ? 'Case sealed'
                            : 'Step logged'}
                      </strong>
                      <span className="info-label"> · {fmtTime(r.createdAt)}</span>
                      <p style={{ margin: '6px 0 0', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className="info-label">txId</span> <code className="tx-id">{r.txId.slice(0, 18)}…</code>
                        <span className="info-label">at</span> <code>{fmtBlock(r.txId, r.blockHeight)}</code>
                        <span className="info-label">case</span> <code>#{r.caseIndex ?? 0}</code>
                        {r.stepType === 'discloseFinding' && (
                          <>
                            <span className="info-label">total now public</span> <code>{r.total}</code>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        )}
        {caseItem && (
          <button className="btn btn-secondary" onClick={downloadExport} disabled={caseItem.receipts.length === 0} style={{ marginTop: 12 }}>
            Export receipts (JSON)
          </button>
        )}
      </section>
    </>
  );
}
