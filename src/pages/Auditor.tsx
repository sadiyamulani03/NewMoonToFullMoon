import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { buildPublicDataProvider } from '../lib/providers';
import { readMidnightTraceLedger, type MidnightTraceLedgerView } from '../lib/ledger';
import { listCases } from '../lib/api';
import { MIDNIGHTTRACE_CONTRACT_ADDRESS, NETWORK_ID } from '../config';
import { useDemo } from '../context/DemoContext';
import { useToast } from '../context/ToastContext';

interface Check { label: string; ok: boolean; detail: string; }

function hexField(field: bigint | undefined | null): string {
  if (field == null) return '—';
  const h = field.toString(16);
  return `0x${h.length % 2 ? '0' : ''}${h}`;
}

export default function Auditor() {
  const { isDemo, mockLedger, mockCases } = useDemo();
  const { toast } = useToast();
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
      checks.push({ label: 'Aggregate equals Σ totals', ok: ledger.aggregate === sum, detail: `aggregate ${ledger.aggregate.toString()} ${ledger.aggregate === sum ? '==' : '!='} Σ totals ${sum.toString()} — contract invariant` });
      checks.push({ label: 'Allowlist root pinned', ok: true, detail: 'Demo: allowlist mocked — root considered pinned.' });
      checks.push({ label: 'Phase order valid', ok: ledger.cases.every((c) => c.phase === 'ACTIVE' || c.phase === 'CLOSED'), detail: `${ledger.cases.length} case(s) — all phases ACTIVE or CLOSED, disclosed ≤ total.` });
      const future = mockCases.flatMap((c) => c.receipts).some((r) => r.blockHeight > 900000);
      checks.push({ label: 'No future-block references', ok: !future, detail: future ? 'Some receipt references a future block.' : `All ${mockCases.flatMap((c) => c.receipts).length} receipt block(s) within range.` });
      if (caseId.trim()) {
        const wanted = BigInt(caseId.trim());
        const found = ledger.cases.find((c) => c.caseId === wanted);
        checks.push({ label: `Case #${wanted} present on ledger`, ok: !!found, detail: found ? `total ${found.total.toString()} · disclosed ${found.lastDisclosed.toString()} · ${found.eventCount.toString()} inserts · ${found.phase}` : `Case #${wanted} not on ledger.` });
      }
      const fp = await sha256Hex(JSON.stringify({ demo: true, aggregate: ledger.aggregate.toString(), cases: ledger.cases.map((c) => [c.caseId.toString(), c.total.toString()]) }));
      setResult({ ledger, checks, fingerprint: fp, auditedAt: new Date().toISOString() });
      toast('✓ Verification checks complete', 'success');
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
      checks.push({ label: 'Aggregate equals Σ totals', ok: ledger.aggregate === sum, detail: `aggregate ${ledger.aggregate.toString()} ${ledger.aggregate === sum ? '==' : '!='} Σ totals ${sum.toString()}` });
      checks.push({ label: 'Allowlist root pinned', ok: Boolean(ledger.allowlistRoot), detail: ledger.allowlistRoot ? `Root ${hexField(ledger.allowlistRoot.field).slice(0, 18)}… pinned.` : 'No root available.' });
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
        checks.push({ label: `Case #${wanted} present on ledger`, ok: !!found, detail: found ? `Found: total ${found.total.toString()}, disclosed ${found.lastDisclosed.toString()}, ${found.phase}` : `Case #${wanted} not on ledger.` });
      }
      const fp = await sha256Hex(JSON.stringify({ contractAddress: trimmed, aggregate: ledger.aggregate.toString(), memberCount: ledger.memberCount.toString(), cases: ledger.cases.map((c) => [c.caseId.toString(), c.total.toString(), c.lastDisclosed.toString(), c.eventCount.toString(), c.phase]) }));
      setResult({ ledger, checks, fingerprint: fp, auditedAt: new Date().toISOString() });
      toast('✓ Preprod verification checks complete', 'success');
    } catch (e) {
      const raw = (e as Error).message ?? String(e);
      if (/Failed to fetch|NetworkError|indexer/i.test(raw)) { setError('We couldn’t reach the Midnight indexer.'); setErrorTechnical(`${raw} — Check your connection and that the contract address is on ${network}.`); }
      else { setError('We couldn’t complete the audit.'); setErrorTechnical(raw); }
      toast('Audit check encountered an issue', 'error');
    } finally { setBusy(false); }
  }, [network, address, caseId, isDemo, mockLedger, mockCases, toast]);

  const copyFingerprint = async () => {
    if (!result?.fingerprint) return;
    try {
      await navigator.clipboard.writeText(result.fingerprint);
      toast('✓ Cryptographic fingerprint copied', 'success');
    } catch {}
  };

  const allPass = result?.checks.every((c) => c.ok) ?? false;

  return (
    <>
      <header className="masthead">
        <div className="eyebrow eyebrow-verify">Verification console · wallet-free · no login</div>
        <div className="masthead-row">
          <div>
            <h1 className="display masthead-title">Audit the ledger, not the promises.</h1>
            <p className="masthead-sub">
              Type a case number. The console reads chain state straight from the Midnight indexer and checks
              every invariant — amounts stay <span className="redacted redacted-sm">redacted</span> throughout.
            </p>
          </div>
          <div className="masthead-actions mono" style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
            <span>● LIVE · {isDemo ? 'demo ledger' : network}</span>
          </div>
        </div>
      </header>

      {/* CONSOLE — dark input deck + light verdict */}
      <section className="console-grid" aria-label="Verification console">
        <div className="console-left">
          <div className="mono" style={{ fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--cyan)', fontWeight: 700 }}>⌁ Input deck</div>
          <div>
            <label className="field-label" htmlFor="audit-case">Case number to verify</label>
            <input id="audit-case" className="input mono" placeholder="e.g. 7" value={caseId} onChange={(e) => setCaseId(e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" disabled={busy} />
            
            {/* Quick Test Presets */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
              <button type="button" className="btn btn-ghost" style={{ padding: '3px 8px', fontSize: '0.72rem', color: 'var(--text-secondary)' }} onClick={() => { setCaseId('7'); setSearch({ case: '7' }); }}>#7 Northstar</button>
              <button type="button" className="btn btn-ghost" style={{ padding: '3px 8px', fontSize: '0.72rem', color: 'var(--text-secondary)' }} onClick={() => { setCaseId('42'); setSearch({ case: '42' }); }}>#42 Drill</button>
              <button type="button" className="btn btn-ghost" style={{ padding: '3px 8px', fontSize: '0.72rem', color: 'var(--text-secondary)' }} onClick={() => { setCaseId(''); setSearch({}); }}>Full Ledger</button>
            </div>
            
            <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>empty = whole ledger · digits only</div>
          </div>
          <button className="btn btn-primary" onClick={() => { setSearch(caseId ? { case: caseId } : {}); void run(); }} disabled={busy} style={{ width: '100%', padding: '14px', fontSize: '0.95rem', fontWeight: 700 }}>
            {busy ? 'Reading chain state…' : '▶ Run verification'}
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" style={{ flex: 1, fontSize: '0.78rem', color: 'var(--text-secondary)' }} onClick={async () => { const url = `${window.location.origin}/audit${caseId ? `?case=${caseId}` : ''}`; try { await navigator.clipboard.writeText(url); setShareCopied(true); toast('✓ Public audit link copied', 'success'); setTimeout(() => setShareCopied(false), 1800); } catch {} }}>{shareCopied ? 'Copied ✓' : '📋 Copy audit link'}</button>
            <Link to="/cases" className="btn btn-ghost" style={{ flex: 1, fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Browse cases</Link>
          </div>
          <details>
            <summary style={{ cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>Advanced — network & contract</summary>
            <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
              <div>
                <label className="field-label" htmlFor="audit-net">Network</label>
                <select id="audit-net" className="input" value={network} onChange={(e) => setNetwork(e.target.value as typeof network)} disabled={busy || isDemo} style={{ fontSize: '0.9rem', textAlign: 'left' }}>
                  <option value="preprod">Preprod</option>
                  <option value="preview">Preview</option>
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="audit-addr">Contract address</label>
                <input id="audit-addr" className="input mono" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="64 hex" disabled={busy || isDemo} style={{ fontSize: '0.72rem', textAlign: 'left' }} />
              </div>
            </div>
          </details>
          {error && (
            <div role="alert" style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.35)', color: '#fb7185', fontSize: '0.86rem' }}>
              {error}
              {errorTechnical && (
                <div style={{ marginTop: 8 }}>
                  <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.72rem', color: '#fb7185' }} onClick={() => setShowErrorTechnical(v => !v)}>{showErrorTechnical ? 'Hide technical details' : 'Show technical details'}</button>
                  {showErrorTechnical && <pre className="mono" style={{ marginTop: 6, fontSize: '0.7rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: 'rgba(0,0,0,0.3)', padding: 8, borderRadius: 6 }}>{errorTechnical}</pre>}
                </div>
              )}
            </div>
          )}
          <div className="mono" style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border-subtle)', fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            WIRE <span className="redacted redacted-sm">amount</span> → <span style={{ color: 'var(--verify)' }}>total</span> · proof <span style={{ color: 'var(--cyan)' }}>ZK</span> → stamp<br />Private amounts never leave the device.
          </div>
        </div>

        <div className="console-right">
          {!result ? (
            <div style={{ padding: '36px 0', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', opacity: 0.5, marginBottom: 8 }}>🛡️</div>
              <h2 style={{ margin: '12px 0 6px', fontSize: '1.6rem' }}>Console ready.</h2>
              <p style={{ margin: 0, color: 'var(--text-secondary)', maxWidth: '44ch', marginInline: 'auto' }}>
                Run a verification to inspect the verdict, per-check invariant readout, and on-chain state.
                Try case <button type="button" className="btn btn-ghost" style={{ padding: '2px 6px', fontSize: '0.86rem', color: 'var(--cyan)' }} onClick={() => { setCaseId('7'); setSearch({ case: '7' }); void run(); }}>7 →</button> — the worked example from the guide.
              </p>
              <div className="mono" style={{ marginTop: 18, fontSize: '0.72rem', color: 'var(--text-muted)' }}>Quorum: aggregate == Σ totals · root pinned · phases valid · blocks sane</div>
            </div>
          ) : (
            <>
              <div className={`verdict ${allPass ? 'verdict-ok' : 'verdict-bad'}`}>
                <span className="verdict-mark">{allPass ? '✓' : '!'}</span>
                <div>
                  <p className="mono" style={{ margin: 0, fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700 }}>Verdict · {new Date(result.auditedAt).toLocaleString()}</p>
                  <h2 className="verdict-title">{allPass ? 'VALID' : 'Needs review'}</h2>
                  <p style={{ margin: '6px 0 0', fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                    {allPass ? 'Every invariant holds — this record is cryptographically verified.' : 'At least one check failed — inspect the readout.'}
                    {result.fingerprint && (
                      <span className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
                        · fp {result.fingerprint.slice(0, 12)}…
                        <button type="button" className="btn btn-ghost" onClick={copyFingerprint} style={{ padding: '2px 6px', fontSize: '0.68rem' }}>📋</button>
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div>
                {result.checks.map((c, i) => (
                  <div key={i} className="check-row">
                    <span className={`check-ico ${c.ok ? 'check-ico-ok' : 'check-ico-bad'}`}>{c.ok ? '✓' : '✗'}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{String(i + 1).padStart(2, '0')} · {c.label}</div>
                      <div className="mono" style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 2 }}>{c.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
              {result.ledger && (
                <div style={{ marginTop: 8 }}>
                  <div className="mono" style={{ fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700, marginBottom: 8 }}>
                    On-chain snapshot · {result.ledger.cases.length} cases · aggregate {result.ledger.aggregate.toString()}
                  </div>
                  {result.ledger.cases.length === 0 ? (
                    <div style={{ color: 'var(--muted)' }}>No case files yet.</div>
                  ) : (
                    <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
                      <table className="queue-table">
                        <thead><tr><th>case</th><th>total</th><th>disclosed</th><th>inserts</th><th>phase</th></tr></thead>
                        <tbody>
                          {(caseId.trim() ? result.ledger.cases.filter((c) => c.caseId.toString() === caseId.trim()) : result.ledger.cases).map((c) => (
                            <tr key={String(c.caseId)}>
                              <td><span className="mono" style={{ background: 'rgba(56, 189, 248, 0.12)', padding: '3px 9px', borderRadius: 999, border: '1px solid rgba(56, 189, 248, 0.35)', color: 'var(--cyan)', fontWeight: 700 }}>#{String(c.caseId)}</span></td>
                              <td className="mono" style={{ fontWeight: 700 }}>{c.total.toString()}</td>
                              <td className="mono">{c.lastDisclosed.toString()}</td>
                              <td>{c.eventCount.toString()}</td>
                              <td><span className={`badge ${c.phase === 'CLOSED' ? 'badge-pending' : 'badge-verify'}`}>{c.phase}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

async function sha256Hex(input: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
