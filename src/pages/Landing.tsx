import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { useMidnightContext } from '../context/MidnightContext';
import FaucetDrawer from '../components/FaucetDrawer';

export default function Landing() {
  const { isDemo, enableDemo, mockCases, mockLedger, demoLogStep, demoDisclose } = useDemo();
  const { isConnected, connect } = useMidnightContext();
  const navigate = useNavigate();
  const goDemo = () => { if (!isDemo) enableDemo(); navigate('/dashboard'); };
  const [demoAmt, setDemoAmt] = useState('15');
  const [demoMsg, setDemoMsg] = useState<string | null>(null);
  const demoCase = mockCases.find((c) => c.id.startsWith('demo-7')) ?? mockCases[0];
  const [faucetOpen, setFaucetOpen] = useState(false);

  return (
    <>
      {/* CENTERED HERO — not 2-col */}
      <section className="mk-hero" aria-label="Hero">
        <span className="mk-eyebrow"><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#7BD9A5', display: 'inline-block' }} /> Private evidence · Public proof · Midnight Preprod</span>
        <h1 className="mk-title">
          Prove what matters. <em>Keep the evidence private.</em>
        </h1>
        <p className="mk-sub">
          MidnightTrace is the compliance workspace for sensitive findings. Amounts stay redacted on your device —
          the ledger carries only totals, verified in zero-knowledge. Anyone can audit. No one sees what was proven.
        </p>
        <div className="mk-ctas">
          <button className="btn btn-primary" onClick={goDemo} style={{ padding: '14px 28px', fontSize: '0.95rem', fontWeight: 700 }}>Explore the live demo →</button>
          <button className="btn btn-secondary" onClick={() => { if (isConnected) navigate('/dashboard'); else void connect(); }} style={{ padding: '14px 22px' }}>
            {isConnected ? 'Open workspace' : 'Connect wallet'}
          </button>
          <button className="btn btn-ghost" onClick={() => setFaucetOpen(true)} style={{ padding: '14px 18px' }}>Setup in 60s →</button>
        </div>
        <div className="mk-proofline">
          <span>✓ ZK-verified totals</span><span>·</span><span>Amounts never on-chain</span><span>·</span><span>Wallet-free audit</span>
        </div>
        <FaucetDrawer open={faucetOpen} onClose={() => setFaucetOpen(false)} />
      </section>

      {/* LARGE PRODUCT VISUALIZATION — full-width browser */}
      <section aria-label="Product visualization">
        <div className="mk-viz">
          <div className="mk-viz-bar">
            <span className="mk-viz-dot" style={{ background: '#ff5f56' }} />
            <span className="mk-viz-dot" style={{ background: '#ffbd2e' }} />
            <span className="mk-viz-dot" style={{ background: '#27c93f' }} />
            <span className="mono" style={{ marginLeft: 12, fontSize: '0.72rem', color: 'var(--night-muted)' }}>midnighttrace.app / workspace — Case #0042</span>
            <span className="mono" style={{ marginLeft: 'auto', fontSize: '0.64rem', color: '#7BD9A5', background: 'rgba(123,217,165,0.1)', border: '1px solid rgba(123,217,165,0.3)', padding: '3px 10px', borderRadius: 999, fontWeight: 700 }}>● VERIFIED</span>
          </div>
          <div className="mk-viz-body">
            <div className="mk-viz-rail">
              <div className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--night-muted)', fontWeight: 700, marginBottom: 6 }}>Workspace</div>
              {['Overview', 'Cases', 'Timeline', 'Audit', 'Guide'].map((t, i) => (
                <div key={t} className={`mk-viz-railitem${i === 1 ? ' on' : ''}`}>{t}</div>
              ))}
              <div style={{ marginTop: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: 'var(--night-muted)', borderTop: '1px solid var(--night-line)', paddingTop: 12 }}>
                aggregate {mockLedger.aggregate.toString()}<br />{mockLedger.cases.length} cases on ledger
              </div>
            </div>
            <div className="mk-viz-main">
              <div className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--night-muted)', fontWeight: 700 }}>Evidence timeline — Case #0042</div>
              {[
                { t: 'OPENED', d: 'Case created — phase ACTIVE', s: 'Open', c: '#9AA3B5' },
                { t: 'EVIDENCE', d: 'Finding logged — amount redacted, proof valid', s: 'Verified', c: '#7BD9A5' },
                { t: 'EVIDENCE', d: 'Finding logged — amount redacted, proof valid', s: 'Verified', c: '#7BD9A5' },
                { t: 'DISCLOSED', d: 'Running total published by owner', s: 'Public', c: '#F4C770' },
                { t: 'SEALED', d: 'Phase CLOSED — totals permanent', s: 'Sealed', c: '#F4C770' },
              ].map((r) => (
                <div key={r.t + r.d} className="mk-viz-row">
                  <span className="mono" style={{ fontSize: '0.62rem', color: 'var(--night-muted)', fontWeight: 700 }}>{r.t}</span>
                  <span style={{ color: 'var(--night-paper)' }}>{r.d}</span>
                  <span className="mono" style={{ fontSize: '0.62rem', color: r.c, border: `1px solid ${r.c}44`, padding: '3px 8px', borderRadius: 999 }}>{r.s}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                <input className="input" value={demoAmt} onChange={e => setDemoAmt(e.target.value.replace(/[^0-9]/g,''))} placeholder="amount" inputMode="numeric" maxLength={5} aria-label="Demo private amount" style={{ maxWidth: 120, padding: '9px 12px', fontSize: '0.86rem' }} />
                <button className="btn btn-primary" style={{ padding: '9px 16px', fontSize: '0.82rem' }} onClick={() => {
                  const n = BigInt(parseInt(demoAmt || '0', 10) || 0);
                  if (n <= 0n) { setDemoMsg('Enter amount > 0'); return; }
                  if (n > 65535n) { setDemoMsg('Max 65,535 per step'); return; }
                  demoLogStep(7n, n, demoCase.id);
                  setDemoMsg(`Logged hidden ${n} → total updated ✓`);
                  setTimeout(() => setDemoMsg(null), 2500);
                }}>Log hidden step</button>
                <button className="btn btn-secondary" style={{ padding: '9px 16px', fontSize: '0.82rem' }} onClick={() => {
                  const n = BigInt(parseInt(demoAmt || '0', 10) || 0);
                  demoDisclose(7n, n || 42n, demoCase.id);
                  setDemoMsg(`Disclosed → lastDisclosed ✓`);
                  setTimeout(() => setDemoMsg(null), 2500);
                }}>Disclose</button>
              </div>
              {demoMsg && <div role="status" style={{ fontSize: '0.84rem', color: '#7BD9A5', fontWeight: 600 }}>{demoMsg}</div>}
            </div>
            <div className="mk-viz-side">
              <div>
                <div className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--night-muted)', fontWeight: 700 }}>Private — your device</div>
                <div style={{ marginTop: 8, padding: '10px 12px', background: '#070A12', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--night-muted)' }}>████ amount · never on-chain</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7BD9A5', fontWeight: 700 }}>Public — ledger</div>
                <div style={{ marginTop: 8, padding: '10px 12px', background: 'rgba(123,217,165,0.08)', border: '1px solid rgba(123,217,165,0.3)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#7BD9A5', fontWeight: 700 }}>total = 42 · Verified</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--night-muted)', fontWeight: 700 }}>Proof</div>
                <div className="mono" style={{ marginTop: 8, fontSize: '0.72rem', color: 'var(--night-muted)', lineHeight: 1.6 }}>total' = total + amount<br /><span style={{ color: '#7BD9A5' }}>✓ valid</span> · block 412,320</div>
              </div>
              <Link to="/audit" style={{ color: '#8FB4F0', fontWeight: 600, fontSize: '0.86rem' }}>Verify — no login →</Link>
            </div>
          </div>
        </div>
        <div className="mk-caption">Live product visualization — interact above, or open the full workspace. Example case #0042.</div>
      </section>

      <div className="mk-logo-strip" aria-label="Assurances">
        <span>Zero-knowledge proofs</span><span>·</span><span>Selective disclosure</span><span>·</span><span>Append-only ledger</span><span>·</span><span>Wallet-free audit</span>
      </div>

      {/* PROBLEM → OUTCOME editorial */}
      <section id="product" className="mk-section">
        <div className="mk-section-head">
          <h2>Evidence that doesn&apos;t leak when it&apos;s verified.</h2>
          <p>Spreadsheets expose. PDFs can&apos;t be checked. MidnightTrace keeps the sensitive value redacted and proves the outcome — so compliance, finance, and audit teams can trust the total without seeing the parts.</p>
        </div>
        <div className="mk-compare">
          <div className="mk-compare-old">
            <span className="mono" style={{ fontSize: '0.64rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--night-muted)', fontWeight: 700 }}>Evidence today — fragile</span>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--night-paper)' }}>Verification means exposure</h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 10, color: 'var(--night-muted)', fontSize: '0.92rem' }}>
              <li>✗ Records scattered across tools, no provenance</li>
              <li>✗ Checking a total requires seeing every line</li>
              <li>✗ Audit trail is a promise, not a proof</li>
            </ul>
          </div>
          <div className="mk-compare-new">
            <span className="mono" style={{ fontSize: '0.64rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--verify)', fontWeight: 700 }}>With MidnightTrace — private by design</span>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>Private inputs, provable outcomes</h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 10, fontSize: '0.92rem', color: '#33302A' }}>
              <li>✓ Witness stays on-device, always redacted</li>
              <li>✓ Every step carries a ZK proof — total&apos; = total + amount</li>
              <li>✓ Anyone verifies at /audit, no wallet, no secrets</li>
            </ul>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
              <Link to="/dashboard" className="btn btn-primary" style={{ background: '#0B1020', borderColor: '#0B1020', color: '#fff' }}>Open workspace →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — hairline steps, not cards */}
      <section id="how-it-works" className="mk-section">
        <div className="mk-section-head">
          <h2>From capture to audit in four moves.</h2>
          <p>No ceremony. Connect or demo, open a case, log privately, disclose when you choose. The ledger does the rest.</p>
        </div>
        <div className="mk-steps">
          {[
            { n: '01', t: 'Connect or demo', d: '1AM / Lace on Preprod — or one-click demo, no wallet, same flows.' },
            { n: '02', t: 'Open a case', d: 'Name the matter. Only caseId + metadata hash touch the chain.' },
            { n: '03', t: 'Log privately', d: 'Enter the amount. It stays redacted; the wallet proves the new total.' },
            { n: '04', t: 'Disclose & seal', d: 'Publish a total when ready, seal when done. Audit stays open forever.' },
          ].map((s) => (
            <div key={s.n} className="mk-step">
              <div className="mk-step-num">{s.n}</div>
              <strong>{s.t}</strong>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRIVACY — 3-up with connectors */}
      <section id="privacy" className="mk-section">
        <div className="mk-section-head">
          <h2>Privacy, without hand-waving.</h2>
          <p>Three states, enforced by the contract — not by UI promises. What&apos;s private, what&apos;s proved, what&apos;s public.</p>
        </div>
        <div className="mk-privacy">
          <div className="mk-privacy-card">
            <div className="mono" style={{ fontSize: '0.64rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--night-muted)' }}>🔒 Private</div>
            <strong style={{ color: 'var(--night-paper)', fontSize: '1.05rem' }}>Witness · amount · identity</strong>
            <p style={{ margin: 0, color: 'var(--night-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>Never on-chain, never in the indexer, never in logs. Encrypted at rest with a wallet-derived key.</p>
          </div>
          <div style={{ alignSelf: 'center', color: '#8FB4F0', fontWeight: 700, fontSize: '1.3rem' }}>→</div>
          <div className="mk-privacy-card">
            <div className="mono" style={{ fontSize: '0.64rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: '#8FB4F0' }}>⬢ Zero-knowledge proof</div>
            <strong style={{ color: 'var(--night-paper)', fontSize: '1.05rem' }}>total&apos; = total + amount</strong>
            <p style={{ margin: 0, color: 'var(--night-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>Membership via Merkle path, amount as private witness. Valid proof → ledger accepts the new total.</p>
          </div>
          <div style={{ alignSelf: 'center', color: '#7BD9A5', fontWeight: 700, fontSize: '1.3rem' }}>→</div>
          <div className="mk-privacy-card accent">
            <div className="mono" style={{ fontSize: '0.64rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: '#7BD9A5' }}>✓ Public</div>
            <strong style={{ color: 'var(--night-paper)', fontSize: '1.05rem' }}>Totals · phases · proofs</strong>
            <p style={{ margin: 0, color: 'var(--night-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}><code className="mono">caseId, total, lastDisclosed, aggregate</code> are public. <Link to="/audit">/audit</Link> checks them without seeing amounts.</p>
          </div>
        </div>
      </section>

      {/* LEDGER PREVIEW — open table on dark */}
      <section className="mk-section">
        <div className="mk-section-head">
          <h2>The ledger, live.</h2>
          <p>Demo data below — connect a wallet for real Preprod state. Same shape, same proofs, same audit path.</p>
        </div>
        <div style={{ border: '1px solid var(--night-line)', borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,0.015)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '16px 20px', borderBottom: '1px solid var(--night-line)', alignItems: 'center' }}>
            <span className="mono" style={{ fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--night-muted)', fontWeight: 700 }}>Evidence ledger · aggregate {mockLedger.aggregate.toString()}</span>
            <Link to="/cases" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>Open cases →</Link>
          </div>
          {mockCases.slice(0, 4).map((c) => (
            <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 0.7fr 0.8fr auto', gap: 12, alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--night-line)', fontSize: '0.9rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--night-paper)' }}>{c.title}</span>
              <span className="mono" style={{ fontSize: '0.74rem', color: 'var(--night-muted)' }}>{c.receipts[0]?.stepType ?? 'logStep'}</span>
              <span className="badge badge-verify">Verified</span>
              <span className="mono" style={{ fontSize: '0.74rem', color: 'var(--night-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
              <Link to={`/cases/${c.id}`} style={{ color: '#8FB4F0', fontSize: '0.84rem', fontWeight: 600 }}>View →</Link>
            </div>
          ))}
          <div className="mono" style={{ padding: '12px 20px', fontSize: '0.7rem', color: 'var(--night-muted)' }}>Demo ledger — real Preprod via wallet. No fake on-chain claims.</div>
        </div>
      </section>

      {/* FINAL BAND */}
      <section className="mk-cta-band">
        <div>
          <h2>Ready to verify the evidence?</h2>
          <p>Open the workspace — private proofs, public trust. No wallet needed to audit.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Link to="/dashboard" className="btn" style={{ background: '#0B1020', color: '#fff', borderColor: '#0B1020', padding: '13px 24px' }}>Open MidnightTrace →</Link>
          <Link to="/audit" className="btn" style={{ background: 'transparent', color: '#0B1020', borderColor: 'rgba(11,16,32,0.3)', padding: '13px 20px' }}>Audit without wallet</Link>
        </div>
      </section>
    </>
  );
}
