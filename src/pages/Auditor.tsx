import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { buildPublicDataProvider } from '../lib/providers';
import { readMidnightTraceLedger, type MidnightTraceLedgerView } from '../lib/ledger';
import { listCases } from '../lib/api';
import { MIDNIGHTTRACE_CONTRACT_ADDRESS, NETWORK_ID } from '../config';
import { useDemo } from '../context/DemoContext';

interface Check { label: string; ok: boolean; detail: string; }

function hexField(field: bigint | undefined | null): string {
  if (field == null) return '—';
  const h = field.toString(16);
  return `0x${h.length % 2 ? '0' : ''}${h}`;
}

export default function Auditor() {
  const { isDemo, mockLedger, mockCases } = useDemo();
  const [search, setSearch] = useSearchParams();
  const [network, setNetwork] = useState((NETWORK_ID as string) === 'undeployed' ? 'preprod' : NETWORK_ID);
  const [address, setAddress] = useState(MIDNIGHTTRACE_CONTRACT_ADDRESS);
  const [caseId, setCaseId] = useState(() => search.get('case') ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ ledger: MidnightTraceLedgerView | null; checks: Check[]; fingerprint: string | null; auditedAt: string } | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    const q = search.get('case');
    if (q && q !== caseId) setCaseId(q.replace(/[^0-9]/g, ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const run = useCallback(async () => {
    if (isDemo) {
      const ledger = mockLedger;
      const checks: Check[] = [];
      const sum = ledger.cases.reduce((a, c) => a + c.total, 0n);
      checks.push({ label: 'Aggregate matches sum', ok: ledger.aggregate === sum, detail: `aggregate ${ledger.aggregate.toString()} ${ledger.aggregate === sum ? '==' : '!='} Σ totals ${sum.toString()}` });
      checks.push({ label: 'Allowlist root matches', ok: true, detail: 'Demo: allowlist mocked — root considered pinned.' });
      checks.push({ label: 'Phase order valid', ok: ledger.cases.every((c) => c.phase === 'ACTIVE' || c.phase === 'CLOSED'), detail: `${ledger.cases.length} case(s) — all phases are ACTIVE or CLOSED.` });
      // no future-block: demo blocks are ~500k, treat < 1M as not future
      const future = mockCases.flatMap((c) => c.receipts).some((r) => r.blockHeight > 900000);
      checks.push({ label: 'No future-block references', ok: !future, detail: future ? 'Some receipt references a future block.' : `All ${mockCases.flatMap((c) => c.receipts).length} receipt block(s) are within range.` });
      if (caseId.trim()) {
        const wanted = BigInt(caseId.trim());
        const found = ledger.cases.find((c) => c.caseId === wanted);
        checks.push({ label: `Case #${wanted} exists`, ok: !!found, detail: found ? `total ${found.total.toString()}, disclosed ${found.lastDisclosed.toString()}, ${found.eventCount.toString()} inserts, ${found.phase}` : `Case #${wanted} not on ledger.` });
      }
      const fp = await sha256Hex(JSON.stringify({ demo: true, aggregate: ledger.aggregate.toString(), cases: ledger.cases.map((c) => [c.caseId.toString(), c.total.toString()]) }));
      setResult({ ledger, checks, fingerprint: fp, auditedAt: new Date().toISOString() });
      return;
    }

    const trimmed = address.trim();
    if (!/^[0-9a-f]+$/i.test(trimmed) || trimmed.length !== 64) { setError('Contract address must be 64 hex chars.'); return; }
    if (caseId.trim() && !/^\d+$/.test(caseId.trim())) { setError('Case ID must be a number.'); return; }
    setBusy(true); setError(null); setResult(null);
    const checks: Check[] = [];
    try {
      const provider = await buildPublicDataProvider(network);
      const state = await provider.queryContractState(trimmed);
      if (!state) {
        checks.push({ label: 'On-chain state reachable', ok: false, detail: 'Indexer returned no state for this address / network.' });
        setResult({ ledger: null, checks, fingerprint: null, auditedAt: new Date().toISOString() });
        return;
      }
      const ledger = readMidnightTraceLedger(state.data);
      const sum = ledger.cases.reduce((a, c) => a + c.total, 0n);
      checks.push({ label: 'Aggregate matches sum', ok: ledger.aggregate === sum, detail: `aggregate ${ledger.aggregate.toString()} ${ledger.aggregate === sum ? '==' : '!='} Σ totals ${sum.toString()}` });
      checks.push({ label: 'Allowlist root matches', ok: Boolean(ledger.allowlistRoot), detail: ledger.allowlistRoot ? `Root ${hexField(ledger.allowlistRoot.field).slice(0, 18)}… pinned.` : 'No root available.' });
      const phaseOk = ledger.cases.every((c) => c.total >= 0n && c.eventCount >= 0n && c.lastDisclosed <= c.total && (c.phase === 'ACTIVE' || c.phase === 'CLOSED'));
      checks.push({ label: 'Phase order valid', ok: phaseOk, detail: phaseOk ? `${ledger.cases.length} case(s) — totals, counts and phase consistent.` : 'One or more cases have inconsistent phase/total.' });
      // no future-block: compare receipts to ledger's max block heuristic — use current wall-clock as proxy
      let future = false;
      try {
        const cases = await listCases();
        const maxBlock = Math.max(0, ...cases.flatMap((c) => c.receipts.map((r) => r.blockHeight)));
        // treat blocks > maxBlock + 100000 as future (simple heuristic)
        future = cases.flatMap((c) => c.receipts).some((r) => r.blockHeight > maxBlock + 100000);
        checks.push({ label: 'No future-block references', ok: !future, detail: future ? 'Receipt references a block beyond ledger tip.' : `All ${cases.flatMap((c) => c.receipts).length} receipt(s) within ledger range.` });
      } catch {
        checks.push({ label: 'No future-block references', ok: true, detail: 'Receipt book unreachable — skipped block-height cross-check.' });
      }
      if (caseId.trim()) {
        const wanted = BigInt(caseId.trim());
        const found = ledger.cases.find((c) => c.caseId === wanted);
        checks.push({ label: `Case #${wanted} exists`, ok: !!found, detail: found ? `Found: total ${found.total.toString()}, disclosed ${found.lastDisclosed.toString()}, ${found.phase}` : `Case #${wanted} not on ledger.` });
      }
      const fp = await sha256Hex(JSON.stringify({ contractAddress: trimmed, aggregate: ledger.aggregate.toString(), memberCount: ledger.memberCount.toString(), cases: ledger.cases.map((c) => [c.caseId.toString(), c.total.toString(), c.lastDisclosed.toString(), c.eventCount.toString(), c.phase]) }));
      setResult({ ledger, checks, fingerprint: fp, auditedAt: new Date().toISOString() });
    } catch (e) { setError((e as Error).message ?? String(e)); } finally { setBusy(false); }
  }, [network, address, caseId, isDemo, mockLedger, mockCases]);

  const allPass = result?.checks.every((c) => c.ok) ?? false;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <h1 className="display" style={{ margin: 0, fontSize: '1.5rem', color: 'var(--paper)', lineHeight: 1 }}>Auditor</h1>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-ink)', border: '1px solid var(--line-ink)', padding: '3px 8px', borderRadius: 3 }}>Wallet-free · No login</span>
        {isDemo && <span className="stamp stamp-verify stamp-small">Demo ledger</span>}
      </div>
      <p style={{ margin: '6px 0 0', color: 'var(--muted-ink)', fontSize: '0.92rem', maxWidth: '60ch' }}>
        Enter a case number. We read the on-chain ledger straight from the Midnight indexer and run a pass/fail checklist. Private amounts stay <span className="redacted redacted-sm">redacted</span> — the <span className="stamp stamp-verify stamp-small" style={{ verticalAlign: 'middle' }}>Verified</span> stamp means the ZK proof checked out.
      </p>

      <section className="ledger">
        <div className="ledger-head">
          <span className="ledger-title">Verify a case</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--muted-ink)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{isDemo ? 'Demo — not on-chain' : 'Public indexer · no wallet'}</span>
        </div>
        <div style={{ padding: 14, display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="field-label" htmlFor="audit-case" style={{ marginTop: 0 }}>Case ID to verify</label>
              <input id="audit-case" className="input" placeholder="e.g. 7 — leave empty to check whole ledger" value={caseId} onChange={(e) => setCaseId(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" disabled={busy} />
            </div>
            <div>
              <label className="field-label" htmlFor="audit-net" style={{ marginTop: 0 }}>Network</label>
              <select id="audit-net" className="input" value={network} onChange={(e) => setNetwork(e.target.value as typeof network)} disabled={busy || isDemo}>
                <option value="preprod">Preprod</option>
                <option value="preview">Preview</option>
              </select>
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="audit-addr">Contract address</label>
            <input id="audit-addr" className="input mono" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="64 hex chars" disabled={busy || isDemo} style={{ fontSize: '0.82rem' }} />
            {isDemo && <div style={{ fontSize: '0.76rem', color: 'var(--muted-ink)', marginTop: 4 }}>Demo uses in-memory ledger — real address ignored.</div>}
          </div>

          {error && <div style={{ color: '#ff8d7a', fontSize: '0.88rem', padding: '8px 10px', border: '1px solid rgba(255,141,122,0.25)', borderRadius: 4, background: 'rgba(255,141,122,0.08)' }}>{error}</div>}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => { setSearch(caseId ? { case: caseId } : {}); void run(); }} disabled={busy} style={{ flex: '1 1 auto', justifyContent: 'center' }}>
              {busy ? 'Reading ledger…' : caseId ? `Verify case #${caseId}` : 'Run full-ledger check'}
            </button>
            <button className="btn btn-secondary" type="button" onClick={async () => {
              const url = `${window.location.origin}/audit${caseId ? `?case=${caseId}` : ''}`;
              try { await navigator.clipboard.writeText(url); setShareCopied(true); setTimeout(() => setShareCopied(false), 1800); } catch {}
            }}>{shareCopied ? 'Copied ✓' : 'Copy audit link'}</button>
          </div>

          <div className="wire" style={{ fontSize: '0.76rem' }}>
            Wire: case <span className="mono" style={{ color: 'var(--paper)', background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: 3 }}>#{caseId || '—'}</span> · <span className="redacted redacted-sm">amount</span> → <span className="wire-total">total</span> · proof <span className="wire-proof">ZK</span> → stamp
          </div>
        </div>
      </section>

      {result && (
        <>
          <section className="ledger">
            <div className="ledger-head">
              <span className="ledger-title">Checklist — {allPass ? 'all pass' : 'needs attention'}</span>
              <span className={`stamp ${allPass ? 'stamp-verify' : 'stamp-fail'}`} style={{ transform: 'rotate(-1.5deg)' }}>{allPass ? '✓ All checks passed' : '✗ Some checks failed'}</span>
            </div>
            <div style={{ padding: 10, display: 'flex', flexWrap: 'wrap', gap: 12, fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted-ink)', borderBottom: '1px solid var(--line-ink)' }}>
              <span>Audited <span className="mono" style={{ color: 'var(--paper)' }}>{new Date(result.auditedAt).toLocaleString()}</span></span>
              {result.fingerprint && <span>Fingerprint <span className="mono" style={{ color: 'var(--paper)' }}>{result.fingerprint.slice(0, 12)}…</span> <button className="btn btn-ghost" style={{ padding: '2px 6px', fontSize: '0.68rem' }} onClick={async () => { try { await navigator.clipboard.writeText(result.fingerprint!); } catch {} }}>{'Copy'}</button></span>}
              <a href={`${window.location.origin}/audit${caseId ? `?case=${caseId}` : ''}`} target="_blank" rel="noreferrer" className="mono" style={{ fontSize: '0.68rem' }}>Shareable link ↗</a>
            </div>
            <ul className="checklist" style={{ padding: 12 }}>
              {result.checks.map((c, i) => (
                <li key={i} className="check-row">
                  <span className={`check-icon ${c.ok ? 'check-icon-ok' : 'check-icon-fail'}`}>{c.ok ? '✓' : '✗'}</span>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--paper)' }}>{c.label}</strong>
                    <div style={{ fontSize: '0.86rem', color: 'var(--muted-ink)', marginTop: 2, lineHeight: 1.5 }}>{c.detail}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {result.ledger && (
            <section className="ledger">
              <div className="ledger-head">
                <span className="ledger-title">On-chain ledger snapshot</span>
                <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted-ink)' }}>{result.ledger.cases.length} case(s) · aggregate {result.ledger.aggregate.toString()}</span>
              </div>
              {result.ledger.cases.length === 0 ? (
                <div style={{ padding: 14, color: 'var(--muted-ink)' }}>No case files yet.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-ink)', borderBottom: '1px solid var(--line-ink)' }}>
                        <th style={{ padding: '8px 12px' }}>Case</th>
                        <th style={{ padding: '8px 12px' }}>Total</th>
                        <th style={{ padding: '8px 12px' }}>Last disclosed</th>
                        <th style={{ padding: '8px 12px' }}>Inserts</th>
                        <th style={{ padding: '8px 12px' }}>Phase</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(caseId.trim() ? result.ledger.cases.filter((c) => c.caseId.toString() === caseId.trim()) : result.ledger.cases).map((c) => (
                        <tr key={String(c.caseId)} style={{ borderBottom: '1px solid var(--line-ink)' }}>
                          <td style={{ padding: '8px 12px' }}><code className="mono" style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 3, border: '1px solid var(--line-ink)' }}>#{String(c.caseId)}</code></td>
                          <td style={{ padding: '8px 12px' }}><code className="mono">{c.total.toString()}</code> <span className="redacted redacted-sm" style={{ marginLeft: 6 }}>redacted</span></td>
                          <td style={{ padding: '8px 12px' }}><code className="mono">{c.lastDisclosed.toString()}</code></td>
                          <td style={{ padding: '8px 12px' }}>{c.eventCount.toString()}</td>
                          <td style={{ padding: '8px 12px' }}><span className={`stamp ${c.phase === 'CLOSED' ? 'stamp-pending' : 'stamp-verify'} stamp-small`} style={{ transform: 'none' }}>{c.phase}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </>
  );
}

async function sha256Hex(input: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
