import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { addReceipt, exportCaseReceipts, getCase, setCaseStatus, type ForensicCase } from '../lib/api';
import { useMidnightContext } from '../context/MidnightContext';
import { commitmentForSecret, toHex } from '../lib/membership';
import WalletStatus from '../components/WalletStatus';
import TxProgress from '../components/TxProgress';

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
  return `block ${blockHeight} · preprod · ${id}`;
}

export default function CaseDetail() {
  const { id = '' } = useParams();
  const [caseItem, setCaseItem] = useState<ForensicCase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<Action>('logStep');
  const [caseIndex, setCaseIndex] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [txStage, setTxStage] = useState<'proof' | 'submit'>('proof');
  const [runMessage, setRunMessage] = useState<string | null>(null);
  const [memberSecretInput, setMemberSecretInput] = useState('');
  const [memberMessage, setMemberMessage] = useState<string | null>(null);
  const [onChainIndex, setOnChainIndex] = useState<bigint | null>(null);

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

  const reload = useCallback(() => {
    getCase(id).then(setCaseItem).catch((e: unknown) => setError(String(e)));
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Suggested on-chain case index: the first matching entry in the live
  // ledger, else 0.
  useEffect(() => {
    if (midLedger && midLedger.cases.length > 0 && onChainIndex === null) {
      setOnChainIndex(midLedger.cases[0].caseId);
      setCaseIndex(midLedger.cases[0].caseId.toString());
    }
  }, [midLedger, onChainIndex]);

  const resolveCaseId = useCallback((): bigint => {
    const parsed = BigInt(caseIndex || '0');
    if (parsed < 0n || parsed > 65535n) throw new Error('Case index must be 0–65535.');
    return parsed;
  }, [caseIndex]);

  const onLanded = useCallback(
    async (
      done: DoneArgs,
      stepType: 'logStep' | 'discloseFinding' | 'closeCase',
      recordedTotal?: bigint | null,
    ) => {
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
    [id, reload, resolveCaseId],
  );

  const runActive = async () => {
    if (!isConnected) {
      setRunMessage('Connect the wallet first.');
      return;
    }
    if (membershipStatus !== 'member') {
      setRunMessage('This wallet has no membership secret on the allowlist yet.');
      return;
    }
    setBusy(true);
    setTxStage('proof');
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
    if (!isConnected) {
      setRunMessage('Connect the wallet first.');
      return;
    }
    if (membershipStatus !== 'member') {
      setRunMessage('This wallet has no membership secret on the allowlist yet.');
      return;
    }
    setBusy(true);
    setTxStage('proof');
    setRunMessage(null);
    try {
      const caseId = resolveCaseId();
      const r = await callOpenCase(caseId);
      setRunMessage(`Case #${caseId.toString()} opened on-chain (tx ${r.txId.slice(0, 12)}…).`);
      await onLanded({ txId: r.txId, blockHeight: r.blockHeight }, 'logStep', 0n);
    } catch (e: unknown) {
      setRunMessage((e as Error & { reason?: string }).reason ?? (e as Error).message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  const grantNewMember = async () => {
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
      setMemberMessage('Member secret must be exactly 64 hex characters (32 bytes). Generate one with your tooling.');
      return;
    }
    try {
      const secret = new Uint8Array(32);
      for (let i = 0; i < 32; i++) secret[i] = parseInt(secretHex.slice(i * 2, i * 2 + 2), 16);
      const r = await callGrantAccess(secret);
      setMemberMessage(
        `Access granted. Commit the newcomer's secret (${toHex(commitmentForSecret(secret)).slice(0, 16)}… → shown in the panel below) so they can prove membership from their wallet. tx ${r.txId.slice(0, 12)}…`,
      );
      setMemberSecretInput('');
    } catch (e: unknown) {
      setMemberMessage((e as Error & { reason?: string }).reason ?? (e as Error).message ?? String(e));
    }
  };

  const provideOwnerSecret = () => {
    try {
      applyOwnerSecret(memberSecretInput.trim());
      setMemberMessage('Owner secret applied — membership proof will use it. Keep it secret, keep it safe.');
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

  const onChainCase = onChainIndex !== null && midLedger
    ? midLedger.cases.find((c) => c.caseId === onChainIndex) ?? null
    : null;

  return (
    <>
      <div className="breadcrumb">
        <Link to="/cases">Cases</Link>
        <span> / </span>
        <span className="info-label">{caseItem?.title ?? 'case'}</span>
      </div>

      {!isConnected && (
        <section className="card">
          <p className="section-head">
            <span className="section-no">01</span> Wallet
          </p>
          <WalletStatus walletState={walletState} isMobile={isMobile} />
        </section>
      )}

      <section className="card">
        <p className="section-head">
          <span className="section-no">02</span> Case file
        </p>
        {error && <p className="error-text">{error}</p>}
        {!caseItem && !error && <p className="muted-text">Loading case…</p>}
        {caseItem && (
          <>
            <strong className="case-title">{caseItem.title}</strong>
            <span className="status-tag">{caseItem.status}</span>
            <p className="muted-text">{caseItem.description}</p>
            <p>
              <span className="info-label">Owner</span> <code className="address">{caseItem.owner}</code>
            </p>
            <div className="ledger-row">
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
              <p className="muted-text">
                This case file is not on-chain yet. Pick a case index and open it below.
              </p>
            )}
          </>
        )}
      </section>

      <section className="card">
        <p className="section-head">
          <span className="section-no">03</span> Investigate (on-chain)
        </p>
        <p className="muted-text">
          Every action mints a zero-knowledge proof that is checked and committed by the MidnightTrace contract. Step
          amounts are private witnesses; only what you choose to disclose ever reaches the ledger.
        </p>

        <label className="form-label" htmlFor="case-index">
          On-chain case index
        </label>
        <input
          id="case-index"
          className="form-input"
          inputMode="numeric"
          value={caseIndex}
          onChange={(e) => setCaseIndex(e.target.value)}
          placeholder="0"
        />

        {onChainCase && (
          <p>
            <span className="info-label">This case</span>{' '}
            <code>total {onChainCase.total.toString()} · disclosed {onChainCase.lastDisclosed.toString()} · {onChainCase.phase}</code>
          </p>
        )}

        <select className="form-input" value={action} onChange={(e) => setAction(e.target.value as Action)}>
          <option value="logStep">Log a hidden step (add untracked movement)</option>
          <option value="discloseFinding">Disclose a finding (publish running total)</option>
          <option value="closeCase">Seal the case (make totals permanent)</option>
        </select>

        {action !== 'closeCase' && (
          <>
            <label className="form-label" htmlFor="step-amount">
              {action === 'logStep' ? 'Step amount (private, never shown on-chain)' : 'Running total to publish'}
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

        {!onChainCase && (
          <button className="btn btn-secondary btn-block" onClick={() => void openCaseOnChain()} disabled={busy}>
            Open case # on-chain first
          </button>
        )}
        {onChainCase && (
          <button
            className="btn btn-primary btn-block"
            onClick={() => void runActive()}
            disabled={busy || action === 'closeCase' ? busy : busy || !amount}
          >
            {busy
              ? 'Working the zero-knowledge proof…'
              : action === 'logStep'
                ? 'Log hidden step'
                : action === 'discloseFinding'
                  ? 'Disclose finding'
                  : 'Seal case'}
          </button>
        )}
        {busy && <TxProgress stage={txStage} />}
        {runMessage && <p className={runMessage.startsWith('Transaction') || runMessage.startsWith('Case') ? 'ok-text' : 'error-text'}>{runMessage}</p>}
      </section>

      <section className="card">
        <p className="section-head">
          <span className="section-no">04</span> Chain of custody
        </p>
        <p className="muted-text">
          Receipts are filed in order of finalization, so the timeline is independently verifiable: every proof
          references the block where the contract accepted it, and the disclosed column shows exactly when a running
          total was made public.
        </p>
        {!caseItem && <p className="muted-text">Loading…</p>}
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
                      <p>
                        <span className="info-label">txId</span> <code className="tx-id">{r.txId}</code>
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
          <button className="btn btn-secondary" onClick={downloadExport} disabled={caseItem.receipts.length === 0}>
            Export receipts (JSON)
          </button>
        )}
      </section>

      <section className="card">
        <p className="section-head">
          <span className="section-no">05</span> Team and membership
        </p>
        <p className="muted-text">
          The contract authorizes members by <strong>private allowlist</strong>: it stores only commitments (hashes),
          never identities nor secrets. Your wallet's membership commitment is below; proving membership is a
          zero-knowledge proof that your secret opens a leaf in the on-chain Merkle tree.
        </p>
        <p>
          <span className="info-label">Your commitment</span>{' '}
          <code className="tx-id">{memberCommitmentHex ?? 'connect the wallet to derive one'}</code>
        </p>
        <p>
          <span className="info-label">Allowlist status</span>{' '}
          <span className={`status-tag ${membershipStatus === 'member' ? '' : 'status-closed'}`}>
            {membershipStatus === 'member' ? 'member' : membershipStatus === 'not-member' ? 'not authorized' : 'unknown'}
          </span>
        </p>

        <label className="form-label" htmlFor="member-secret">
          Member secret (32-byte hex) — paste the deployer secret to grant yourself or a colleague access
        </label>
        <input
          id="member-secret"
          className="form-input"
          value={memberSecretInput}
          onChange={(e) => setMemberSecretInput(e.target.value)}
          placeholder="64 hex characters"
        />
        <div className="wallet-actions">
          <button className="btn btn-primary" onClick={() => void grantNewMember()} disabled={isConnected && membershipStatus !== 'member'}>
            Grant access for this secret
          </button>
          <button className="btn btn-secondary" onClick={provideOwnerSecret} disabled={!memberSecretInput.trim()}>
            Use as my member secret
          </button>
        </div>
        {memberMessage && <p className="muted-text">{memberMessage}</p>}
      </section>
    </>
  );
}