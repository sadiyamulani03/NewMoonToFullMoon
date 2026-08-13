import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

import { buildPublicDataProvider } from '../lib/providers';
import { readMidnightTraceLedger, type MidnightTraceLedgerView } from '../lib/ledger';
import { listCases } from '../lib/api';
import { MIDNIGHTTRACE_CONTRACT_ADDRESS, NETWORK_ID } from '../config';

interface AuditResult {
  auditedAt: string;
  network: string;
  contractAddress: string;
  fingerprint: string | null;
  ledger: MidnightTraceLedgerView | null;
  checks: { label: string; ok: boolean; detail: string }[];
}

function bigintFieldHex(field: bigint | undefined | null): string {
  if (field === undefined || field === null) return '…';
  const hex = field.toString(16);
  return `0x${hex.length % 2 ? '0' : ''}${hex}`;
}

function fmtTotal(value: bigint): string {
  return value.toString();
}

export default function Auditor() {
  const [network, setNetwork] = useState<string>((NETWORK_ID as string) === 'undeployed' ? 'preprod' : NETWORK_ID);
  const [address, setAddress] = useState<string>(MIDNIGHTTRACE_CONTRACT_ADDRESS);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAudit = useCallback(async () => {
    const trimmed = address.trim();
    if (!/^[0-9a-f]+$/i.test(trimmed) || trimmed.length !== 64) {
      setError('A contract address must be 64 hex characters.');
      return;
    }
    setBusy(true);
    setError(null);
    setResult(null);
    const checks: AuditResult['checks'] = [];
    try {
      const publicDataProvider = await buildPublicDataProvider(network);
      const state = await publicDataProvider.queryContractState(trimmed);

      if (!state) {
        checks.push({
          label: 'On-chain state reachable',
          ok: false,
          detail: 'The indexer returned no state for this contract address. Is it deployed on this network?',
        });
        setResult({
          auditedAt: new Date().toISOString(),
          network,
          contractAddress: trimmed,
          fingerprint: null,
          ledger: null,
          checks,
        });
        return;
      }

      const ledger = readMidnightTraceLedger(state.data);
      const sumCases = ledger.cases.reduce((acc, c) => acc + c.total, 0n);

      checks.push({ label: 'On-chain state reachable', ok: true, detail: 'Public ledger read successfully.' });
      checks.push({
        label: 'Allowlist root pinned',
        ok: Boolean(ledger.allowlistRoot),
        detail: ledger.allowlistRoot
          ? `Root digest ${bigintFieldHex(ledger.allowlistRoot.field)} — the fingerprint of the membership tree.`
          : 'No membership tree root available.',
      });
      checks.push({
        label: 'Aggregate reconciliation',
        ok: ledger.aggregate === sumCases,
        detail:
          ledger.aggregate === sumCases
            ? `aggregate ${fmtTotal(ledger.aggregate)} equals Σ case totals ${fmtTotal(sumCases)}.`
            : `aggregate ${fmtTotal(ledger.aggregate)} does NOT equal Σ case totals ${fmtTotal(sumCases)}.`,
      });
      for (const c of ledger.cases) {
        checks.push({
          label: `Case #${c.caseId} integrity`,
          ok: c.total >= 0n && c.eventCount >= 0n && c.lastDisclosed <= c.total,
          detail: `total ${fmtTotal(c.total)}, eventCount ${fmtTotal(c.eventCount)}, lastDisclosed ${fmtTotal(c.lastDisclosed)}, phase ${c.phase}.`,
        });
      }

      // Cross-check: disclosed totals recorded in the receipt book must equal
      // the on-chain lastDisclosed for that case index.
      let bookCrossChecked = 0;
      let bookMismatch = 0;
      try {
        const cases = await listCases();
        for (const c of ledger.cases) {
          const book = cases.find(
            (item) => item.receipts.some((r) => (r.caseIndex ?? 0) === Number(c.caseId)),
          );
          if (!book) continue;
          const disclosed = book.receipts
            .filter((r) => (r.caseIndex ?? 0) === Number(c.caseId))
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
          if (!disclosed) continue;
          bookCrossChecked += 1;
          const onChain = c.phase === 'CLOSED' ? c.total : c.lastDisclosed;
          if (BigInt(disclosed.total) !== onChain) bookMismatch += 1;
        }
      } catch {
        checks.push({
          label: 'Receipt book cross-check',
          ok: false,
          detail: 'Receipt book was unreachable — skipping off-chain cross-check.',
        });
      }
      if (bookCrossChecked > 0) {
        checks.push({
          label: 'Receipt book cross-check',
          ok: bookMismatch === 0,
          detail:
            bookMismatch === 0
              ? `${bookCrossChecked} case(s) match the receipt book (disclosed totals == on-chain).`
              : `${bookMismatch} case(s) diverge from the receipt book.`,
        });
      }

      const fingerprint = await sha256Hex(
        JSON.stringify({
          contractAddress: trimmed,
          aggregate: ledger.aggregate.toString(),
          memberCount: ledger.memberCount.toString(),
          allowlistRoot: ledger.allowlistRoot ? ledger.allowlistRoot.field.toString(16) : null,
          cases: ledger.cases.map((c) => [
            c.caseId.toString(),
            c.total.toString(),
            c.lastDisclosed.toString(),
            c.eventCount.toString(),
            c.phase,
          ]),
        }),
      );

      setResult({
        auditedAt: new Date().toISOString(),
        network,
        contractAddress: trimmed,
        fingerprint,
        ledger,
        checks,
      });
    } catch (e: unknown) {
      setError((e as Error).message ?? String(e));
    } finally {
      setBusy(false);
    }
  }, [network, address]);

  const allPass = result?.checks.every((c) => c.ok) ?? false;

  return (
    <>
      <div className="breadcrumb">
        <Link to="/">Dashboard</Link>
        <span> / </span>
        <span className="info-label">Public audit window</span>
      </div>

      <section className="card">
        <p className="section-head">
          <span className="section-no">05</span> Public audit window
        </p>
        <p className="muted-text">
          Anyone — no wallet, no membership secret — can pin the honest truth of a MidnightTrace investigation here:
          read the <strong>on-chain ledger</strong> straight from the Midnight indexer and verify the aggregate, the
          per-case running totals, the allowlist root, and that disclosed findings match the team's receipt book.
          Private step amounts never appear; the ZK proofs the circuit wrote are what make the totals trustworthy.
        </p>

        <label className="form-label" htmlFor="audit-network">
          Network
        </label>
        <select
          id="audit-network"
          className="form-input"
          value={network}
          onChange={(e) => setNetwork(e.target.value)}
          disabled={busy}
        >
          <option value="preprod">Preprod</option>
          <option value="preview">Preview</option>
        </select>

        <label className="form-label" htmlFor="audit-address">
          Contract address
        </label>
        <input
          id="audit-address"
          className="form-input"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="64-hex character Midnight contract address"
          disabled={busy}
        />

        {error && <p className="error-text">{error}</p>}

        <button className="btn btn-primary btn-block" onClick={() => void runAudit()} disabled={busy || !address.trim()}>
          {busy ? 'Reading on-chain state…' : 'Run audit'}
        </button>
      </section>

      {result && (
        <>
          <section className="card">
            <p className="section-head">
              <span className="section-no">06</span> Audit result
            </p>
            <p>
              <span className="info-label">Audited</span> <code>{new Date(result.auditedAt).toLocaleString()}</code>
              <span className="info-label">Network</span> <code>{result.network}</code>
            </p>
            <p>
              <span className="info-label">Contract</span> <code className="tx-id">{result.contractAddress}</code>
            </p>
            {result.fingerprint && (
              <p>
                <span className="info-label">Fingerprint</span> <code className="tx-id">{result.fingerprint}</code>
              </p>
            )}

            <div className={`audit-badge ${allPass ? 'audit-pass' : 'audit-fail'}`}>
              {allPass ? '✓ All integrity checks passed' : '✗ One or more checks failed'}
            </div>

            <ul className="audit-checks">
              {result.checks.map((c, i) => (
                <li key={i}>
                  <span className={`check-dot ${c.ok ? 'ok' : 'bad'}`}>{c.ok ? '✓' : '✗'}</span>
                  <strong>{c.label}</strong>
                  <p className="muted-text">{c.detail}</p>
                </li>
              ))}
            </ul>
          </section>

          {result.ledger && (
            <section className="card">
              <p className="section-head">
                <span className="section-no">07</span> On-chain ledger
              </p>
              <div className="stats-grid">
                <div className="stat-box">
                  <span className="info-label">Aggregate</span>
                  <strong className="stat-value">{fmtTotal(result.ledger.aggregate)}</strong>
                  <span className="muted-text">all cases combined</span>
                </div>
                <div className="stat-box">
                  <span className="info-label">Members</span>
                  <strong className="stat-value">{fmtTotal(result.ledger.memberCount)}</strong>
                  <span className="muted-text">commitments on the allowlist</span>
                </div>
                <div className="stat-box">
                  <span className="info-label">Cases</span>
                  <strong className="stat-value">{result.ledger.cases.length}</strong>
                  <span className="muted-text">on-chain case files</span>
                </div>
                <div className="stat-box">
                  <span className="info-label">Allowlist root</span>
                  <code className="stat-value stat-hex">
                    {result.ledger.allowlistRoot ? bigintFieldHex(result.ledger.allowlistRoot.field).slice(0, 18) : '—'}…
                  </code>
                  <span className="muted-text">membership tree digest</span>
                </div>
              </div>

              {result.ledger.cases.length === 0 && <p className="muted-text">No case files have been opened on-chain yet.</p>}
              {result.ledger.cases.length > 0 && (
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>Case</th>
                      <th>Total</th>
                      <th>Last disclosed</th>
                      <th>Events</th>
                      <th>Phase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.ledger.cases.map((c) => (
                      <tr key={c.caseId.toString()}>
                        <td>
                          <code>#{c.caseId.toString()}</code>
                        </td>
                        <td>
                          <code>{fmtTotal(c.total)}</code>
                        </td>
                        <td>
                          <code>{fmtTotal(c.lastDisclosed)}</code>
                        </td>
                        <td>
                          <code>{fmtTotal(c.eventCount)}</code>
                        </td>
                        <td>
                          <span className={`status-tag ${c.phase === 'CLOSED' ? 'status-closed' : ''}`}>{c.phase}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          )}
        </>
      )}
    </>
  );
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}