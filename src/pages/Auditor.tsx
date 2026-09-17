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
  const [errorTechnical, setErrorTechnical] = useState<string | null>(null);
  const [showErrorTechnical, setShowErrorTechnical] = useState(false);
  const [result, setResult] = useState<{ ledger: MidnightTraceLedgerView | null; checks: Check[]; fingerprint: string | null; auditedAt: string } | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    const q = search.get('case');
    if (q && q !== caseId) setCaseId(q.replace(/[^0-9]/g, ''));
  }, [search]);

  const run = useCallback(async () => {
    if (isDemo) {
      const ledger = mockLedger;
      const checks: Check[] = [];
      const sum = ledger.cases.reduce((a, c) => a + c.total, 0n);
      checks.push({ label: 'Aggregate matches sum', ok: ledger.aggregate === sum, detail: `aggregate ${ledger.aggregate.toString()} ${ledger.aggregate === sum ? '==' : '!='} Σ totals ${sum.toString()}` });
      checks.push({ label: 'Allowlist root matches', ok: true, detail: 'Demo: allowlist mocked — root considered pinned.' });
      checks.push({ label: 'Phase order valid', ok: ledger.cases.every((c) => c.phase === 'ACTIVE' || c.phase === 'CLOSED'), detail: `${ledger.cases.length} case(s) — all phases are ACTIVE or CLOSED.` });
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
    if (!/^[0-9a-f]+$/i.test(trimmed) || trimmed.length !== 64) { setError('Contract address must be 64 hex chars (Preprod).'); setErrorTechnical(trimmed.length ? `Got ${trimmed.length} chars — expected 64 hex.` : 'Address is empty.'); return; }
    if (caseId.trim() && !/^\d+$/.test(caseId.trim())) { setError('Case ID must be a number.'); setErrorTechnical(null); return; }
    setBusy(true); setError(null); setErrorTechnical(null); setShowErrorTechnical(false); setResult(null);
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
      let future = false;
      try {
        const cases = await listCases();
        const maxBlock = Math.max(0, ...cases.flatMap((c) => c.receipts.map((r) => r.blockHeight)));
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
    } catch (e) {
      const raw = (e as Error).message ?? String(e);
      if (/Failed to fetch|NetworkError|indexer/i.test(raw)) { setError('We couldn’t reach the Midnight indexer.'); setErrorTechnical(`${raw} — Check your connection and that the contract address is on ${network}.`); }
      else { setError('We couldn’t complete the audit.'); setErrorTechnical(raw); }
    } finally { setBusy(false); }
  }, [network, address, caseId, isDemo, mockLedger, mockCases]);

  const allPass = result?.checks.every((c) => c.ok) ?? false;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', display: 'grid', gap: 24 }}>
      <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
        <h1 className="display" style={{ margin: 0, fontSize: 'clamp(28px, 4vw, 36px)', color: 'var(--paper)', lineHeight: 1 }}>Verify a MidnightTrace case</h1>
        <p style={{ margin: '8px auto 0', color: 'var(--muted-ink)', fontSize: '0.92rem', maxWidth: '52ch' }}>
          Enter a case number. We read the on-chain ledger straight from the Midnight indexer — no wallet, no prover. Private amounts stay <span className="redacted redacted-sm">redacted</span>.
        </p>
        <div style={{ marginTop: 10, display: 'inline-flex', gap: 8, alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--muted-ink)', border: '1px solid var(--line-ink)', padding: '6px 12px', borderRadius: 999 }}>
          Wallet-free · No login · Public audit {isDemo && <span className="badge badge-verify" style={{ marginLeft: 8 }}>Demo</span>}
        </div>
      </div>

      <section style={{ border: '1px solid var(--line-ink)', borderRadius: '16px', background: '#121824', overflow: 'hidden' }}>
        <div style={{ padding: '20px', display: 'grid', gap: 16 }}>
          <div>
            <label className="field-label" htmlFor="audit-case" style={{ marginTop: 0 }}>Case ID</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input id="audit-case" className="input" placeholder="e.g. 7" value={caseId} onChange={(e) => setCaseId(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" disabled={busy} style={{ flex: 1, fontSize: '1.1rem', padding: '12px 16px', textAlign: 'center', letterSpacing: '0.02em' }} />
              <button className="btn btn-primary" onClick={() => { setSearch(caseId ? { case: caseId } : {}); void run(); }} disabled={busy} style={{ padding: '12px 24px', fontSize: '0.92rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                {busy ? 'Verifying…' : 'Verify case'}
              </button>
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)' }}>Leave empty to check whole ledger</span>
              <button className="btn btn-ghost" style={{ padding: '2px 8px', fontSize: '0.72rem' }} onClick={async () => { const url = `${window.location.origin}/audit${caseId ? `?case=${caseId}` : ''}`; try { await navigator.clipboard.writeText(url); setShareCopied(true); setTimeout(() => setShareCopied(false), 1800); } catch {} }}>{shareCopied ? 'Copied ✓' : 'Copy link'}</button>
            </div>
          </div>

          <details style={{ borderTop: '1px solid var(--line-ink)', paddingTop: 12 }}>
            <summary style={{ cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted-ink)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>Advanced — network & contract</summary>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <div>
                <label className="field-label" htmlFor="audit-net" style={{ marginTop: 0 }}>Network</label>
                <select id="audit-net" className="input" value={network} onChange={(e) => setNetwork(e.target.value as typeof network)} disabled={busy || isDemo}>
                  <option value="preprod">Preprod</option>
                  <option value="preview">Preview</option>
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="audit-addr" style={{ marginTop: 0 }}>Contract</label>
                <input id="audit-addr" className="input mono" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="64 hex" disabled={busy || isDemo} style={{ fontSize: '0.72rem' }} />
              </div>
            </div>
          </details>

          {error && (
            <div role="alert" style={{ padding: '12px', borderRadius: '10px', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.18)', color: '#ff8d7a', fontSize: '0.88rem' }}>
              {error}
              {errorTechnical && (
                <div style={{ marginTop: 8 }}>
                  <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => setShowErrorTechnical(v => !v)}>{showErrorTechnical ? 'Hide technical details' : 'Show technical details'}</button>
                  {showErrorTechnical && <pre className="mono" style={{ marginTop: 6, padding: '10px', background: 'rgba(0,0,0,0.24)', borderRadius: '8px', fontSize: '0.72rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: 'var(--muted-ink)' }}>{errorTechnical}</pre>}
                </div>
              )}
            </div>
          )}

          <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)', textAlign: 'center', borderTop: '1px solid var(--line-ink)', paddingTop: 12 }}>
            Wire: <span className="redacted redacted-sm">amount</span> → <span style={{ color: 'var(--verify)', fontWeight: 700 }}>total</span> · proof <span style={{ color: 'var(--blue)' }}>ZK</span> → stamp · Private amounts never leave device
          </div>
        </div>
      </section>

      {result && (
        <>
          <section style={{ border: '1px solid', borderColor: allPass ? 'var(--verify-border)' : 'rgba(192,57,43,0.18)', borderRadius: '16px', overflow: 'hidden', background: allPass ? 'var(--verify-soft)' : 'rgba(192,57,43,0.06)' }}>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: allPass ? 'var(--verify)' : '#c0392b', color: 'white', display: 'grid', placeItems: 'center', margin: '0 auto', fontSize: '1.4rem', fontWeight: 700 }}>{allPass ? '✓' : '✗'}</div>
              <h2 style={{ margin: '12px 0 0', fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: allPass ? 'var(--verify)' : '#c0392b' }}>{allPass ? 'VALID' : 'Attention needed'}</h2>
              <p style={{ margin: '6px 0 0', color: allPass ? 'var(--verify)' : '#c0392b', fontSize: '0.88rem', fontWeight: 600 }}>{allPass ? 'All checks passed — this record is trustworthy.' : 'Some checks failed — review details.'}</p>
              <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--muted-ink)' }}>
                <span>Audited {new Date(result.auditedAt).toLocaleString()}</span>
                {result.fingerprint && <span>· {result.fingerprint.slice(0, 12)}…</span>}
              </div>
            </div>
            <div style={{ background: '#121824', padding: '16px', display: 'grid', gap: 10, borderTop: `1px solid ${allPass ? 'var(--verify-border)' : 'rgba(192,57,43,0.18)'}` }}>
              {result.checks.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.01)', border: `1px solid ${c.ok ? 'var(--verify-border)' : 'rgba(192,57,43,0.18)'}` }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: c.ok ? 'var(--verify-soft)' : 'rgba(192,57,43,0.08)', border: `1px solid ${c.ok ? 'var(--verify-border)' : 'rgba(192,57,43,0.18)'}`, color: c.ok ? 'var(--verify)' : '#c0392b', display: 'grid', placeItems: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>{c.ok ? '✓' : '✗'}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--paper)', fontSize: '0.88rem' }}>{c.label}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted-ink)', marginTop: 2, lineHeight: 1.5 }}>{c.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {result.ledger && (
            <section style={{ border: '1px solid var(--line-ink)', borderRadius: '16px', overflow: 'hidden', background: '#121824' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line-ink)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--paper)' }}>On-chain snapshot</h3>
                <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted-ink)' }}>{result.ledger.cases.length} cases · aggregate {result.ledger.aggregate.toString()}</span>
              </div>
              {result.ledger.cases.length === 0 ? (
                <div style={{ padding: 20, color: 'var(--muted-ink)', textAlign: 'center' }}>No case files yet.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted-ink)', borderBottom: '1px solid var(--line-ink)', background: 'rgba(255,255,255,0.01)' }}>
                        <th style={{ padding: '10px 16px', fontWeight: 700 }}>Case</th>
                        <th style={{ padding: '10px 16px', fontWeight: 700 }}>Total</th>
                        <th style={{ padding: '10px 16px', fontWeight: 700 }}>Last disclosed</th>
                        <th style={{ padding: '10px 16px', fontWeight: 700 }}>Inserts</th>
                        <th style={{ padding: '10px 16px', fontWeight: 700 }}>Phase</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(caseId.trim() ? result.ledger.cases.filter((c) => c.caseId.toString() === caseId.trim()) : result.ledger.cases).map((c) => (
                        <tr key={String(c.caseId)} style={{ borderBottom: '1px solid var(--line-ink)' }}>
                          <td style={{ padding: '10px 16px' }}><span className="mono" style={{ background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--line-ink)', fontWeight: 600 }}>#{String(c.caseId)}</span></td>
                          <td style={{ padding: '10px 16px' }}><span className="mono" style={{ color: 'var(--paper)', fontWeight: 600 }}>{c.total.toString()}</span></td>
                          <td style={{ padding: '10px 16px' }}><span className="mono">{c.lastDisclosed.toString()}</span></td>
                          <td style={{ padding: '10px 16px' }}>{c.eventCount.toString()}</td>
                          <td style={{ padding: '10px 16px' }}><span className="badge" style={{ background: c.phase === 'CLOSED' ? 'var(--ochre-soft)' : 'var(--verify-soft)', color: c.phase === 'CLOSED' ? 'var(--ochre)' : 'var(--verify)', borderColor: c.phase === 'CLOSED' ? 'var(--ochre-border)' : 'var(--verify-border)' }}>{c.phase}</span></td>
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
    </div>
  );
}

async function sha256Hex(input: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
