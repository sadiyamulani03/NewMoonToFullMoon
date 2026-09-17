import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { useMidnightContext } from '../context/MidnightContext';
import { GITHUB_URL, DEMO_VIDEO_URL } from '../config';
import FaucetDrawer from '../components/FaucetDrawer';

export default function Landing() {
  const { isDemo, enableDemo, mockCases, mockLedger, demoLogStep, demoDisclose } = useDemo();
  const { walletState, isConnected, connect } = useMidnightContext();
  const navigate = useNavigate();
  const goDemo = () => { if (!isDemo) enableDemo(); navigate('/dashboard'); };
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [demoAmt, setDemoAmt] = useState('15');
  const [demoMsg, setDemoMsg] = useState<string | null>(null);
  const demoCase = mockCases.find((c) => c.id.startsWith('demo-7')) ?? mockCases[0];
  const [faucetOpen, setFaucetOpen] = useState(false);
  const isConnecting = walletState.status === 'connecting';

  return (
    <>
      {/* EDITORIAL HERO */}
      <section className="lp-hero-editorial" aria-label="Hero">
        <div className="lp-hero-editorial-left">
          <div className="mono" style={{ fontSize: '0.70rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--verify)', fontWeight: 700 }}>
            PRIVATE EVIDENCE / PUBLIC PROOF
          </div>
          <h1 className="display" style={{ margin: '12px 0 0', fontSize: 'clamp(38px, 6vw, 62px)', lineHeight: 0.92, letterSpacing: '-0.05em', color: 'var(--paper)' }}>
            Prove what matters.<br />
            <span style={{ color: 'var(--paper)', opacity: 0.92 }}>Keep the</span> <span style={{ color: '#F4C770' }}>evidence private.</span>
          </h1>
          <p style={{ margin: '16px 0 0', color: 'var(--muted-ink)', fontSize: '1.08rem', lineHeight: 1.65, maxWidth: '52ch' }}>
            MidnightTrace is a privacy-preserving evidence platform on Midnight Preprod. Capture sensitive findings, prove them in zero-knowledge, and let anyone verify — without exposing what was proven.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
            <button className="btn btn-primary" onClick={goDemo} style={{ padding: '13px 24px', fontSize: '0.92rem', fontWeight: 700 }}>Explore the demo →</button>
            <button className="btn btn-secondary" onClick={() => void connect()} disabled={isConnecting} style={{ padding: '13px 20px' }}>
              {isConnecting ? 'Connecting…' : isConnected ? 'Open dashboard' : 'Connect wallet'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: '0.70rem', color: 'var(--muted-ink)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            <span>PRIVATE</span> <span style={{ opacity: 0.3 }}>·</span> <span>VERIFIABLE</span> <span style={{ opacity: 0.3 }}>·</span> <span>AUDITABLE</span> <span style={{ opacity: 0.3 }}>·</span> <span style={{ color: 'var(--verify)' }}>● MIDNIGHT PREPROD</span>
          </div>
          <FaucetDrawer open={faucetOpen} onClose={() => setFaucetOpen(false)} />
        </div>
        <div className="lp-hero-editorial-right" aria-hidden="true">
          <div style={{ background: '#121824', border: '1px solid var(--line-ink)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.32)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line-ink)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
              <span className="mono" style={{ fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-ink)', fontWeight: 700 }}>Evidence verification</span>
              <span className="mono" style={{ fontSize: '0.62rem', color: 'var(--verify)', background: 'var(--verify-soft)', border: '1px solid var(--verify-border)', padding: '3px 8px', borderRadius: 999, fontWeight: 700 }}>● LIVE</span>
            </div>
            <div style={{ padding: '18px', display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center', padding: '12px 14px', background: '#0F131A', border: '1px solid var(--line-ink)', borderRadius: '10px' }}>
                <div>
                  <div className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-ink)' }}>PRIVATE EVIDENCE</div>
                  <div style={{ marginTop: 4, fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--muted-ink)' }}><span className="redacted">████ 42</span> · never on-chain</div>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--redact)', display: 'grid', placeItems: 'center', color: 'var(--muted-ink)', fontSize: '0.9rem' }}>◧</div>
              </div>
              <div style={{ display: 'grid', placeItems: 'center', color: 'var(--muted-ink)', fontSize: '0.9rem' }}>↓</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center', padding: '12px 14px', background: 'rgba(122,161,224,0.06)', border: '1px solid rgba(122,161,224,0.18)', borderRadius: '10px' }}>
                <div>
                  <div className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--blue)', fontWeight: 700 }}>ZK PROOF</div>
                  <div className="mono" style={{ marginTop: 4, fontSize: '0.74rem', color: 'var(--paper)', fontWeight: 600 }}>total' = total + amount · <span style={{ color: 'var(--verify)' }}>✓ valid</span></div>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'rgba(122,161,224,0.12)', border: '1px solid rgba(122,161,224,0.22)', display: 'grid', placeItems: 'center', color: 'var(--blue)' }}>⬢</div>
              </div>
              <div style={{ display: 'grid', placeItems: 'center', color: 'var(--muted-ink)', fontSize: '0.9rem' }}>↓</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center', padding: '12px 14px', background: 'var(--verify-soft)', border: '1px solid var(--verify-border)', borderRadius: '10px' }}>
                <div>
                  <div className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--verify)', fontWeight: 700 }}>PUBLIC VERIFICATION</div>
                  <div className="mono" style={{ marginTop: 4, fontSize: '0.74rem', color: 'var(--paper)', fontWeight: 600 }}>total = 42 · <span style={{ color: 'var(--verify)' }}>Verified</span></div>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--verify)', color: 'white', display: 'grid', placeItems: 'center', fontWeight: 700 }}>✓</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4, fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--muted-ink)' }}>
                <span>Case #07</span> <span>·</span> <span>block 412,320</span> <span>·</span> <span style={{ color: 'var(--verify)' }}>● Verified</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--muted-ink)', justifyContent: 'center' }}>
            <span><Link to="/audit" style={{ color: 'var(--blue)', fontWeight: 600 }}>Verify — no login →</Link></span>
            <span>·</span>
            <span><button onClick={() => setFaucetOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontFamily: 'inherit', fontSize: 'inherit', cursor: 'pointer', padding: 0 }}>Setup wallet →</button></span>
          </div>
        </div>
      </section>

      {/* PRODUCT PREVIEW */}
      <section aria-label="Product preview" style={{ marginTop: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div className="mono" style={{ fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted-ink)', fontWeight: 700 }}>Product preview</div>
          <h2 style={{ margin: '8px 0 0', fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 32px)', letterSpacing: '-0.02em', color: 'var(--paper)' }}>A real evidence workspace — not a mockup</h2>
          <p style={{ margin: '8px auto 0', color: 'var(--muted-ink)', maxWidth: '56ch', fontSize: '0.92rem' }}>Evidence timeline, verification, and audit — as it appears in the application.</p>
        </div>
        <div style={{ border: '1px solid var(--line-ink)', borderRadius: '16px', overflow: 'hidden', background: '#121824', boxShadow: '0 16px 48px rgba(0,0,0,0.28)' }}>
          <div style={{ height: 28, background: '#0F131A', borderBottom: '1px solid var(--line-ink)', display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f', display: 'inline-block' }} />
            <span className="mono" style={{ marginLeft: 12, fontSize: '0.68rem', color: 'var(--muted-ink)' }}>midnighttrace.app — Case #0042</span>
            <span className="mono" style={{ marginLeft: 'auto', fontSize: '0.62rem', color: 'var(--verify)', background: 'var(--verify-soft)', border: '1px solid var(--verify-border)', padding: '2px 8px', borderRadius: 999 }}>VERIFIED</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 0 }}>
            <div style={{ padding: '16px', borderRight: '1px solid var(--line-ink)' }}>
              <div className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-ink)', fontWeight: 700, marginBottom: 10 }}>Evidence timeline</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {[
                  { t: 'OPENED', d: 'Case #0042 created', s: 'Verified' },
                  { t: 'EVIDENCE', d: 'Finding logged — private amount', s: 'Verified' },
                  { t: 'DISCLOSED', d: 'Finding disclosed — public result', s: 'Public' },
                  { t: 'VERIFIED', d: 'Audit verified', s: 'Verified' },
                  { t: 'SEALED', d: 'Case sealed', s: 'Sealed' },
                ].map((r, i) => (
                  <div key={r.t} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 12, alignItems: 'center', padding: '8px 10px', background: i === 1 ? 'rgba(255,255,255,0.02)' : 'transparent', border: i === 1 ? '1px solid var(--line-ink)' : '1px solid transparent', borderRadius: '8px' }}>
                    <span className="mono" style={{ fontSize: '0.62rem', color: 'var(--muted-ink)', fontWeight: 600 }}>{r.t}</span>
                    <span style={{ fontSize: '0.84rem', color: 'var(--paper)' }}>{r.d}</span>
                    <span className="mono" style={{ fontSize: '0.62rem', color: r.s === 'Verified' ? 'var(--verify)' : r.s === 'Public' ? 'var(--ochre)' : 'var(--muted-ink)', border: '1px solid', padding: '2px 6px', borderRadius: 999 }}>{r.s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '16px', display: 'grid', gap: 12, background: 'rgba(255,255,255,0.01)' }}>
              <div>
                <div className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-ink)', fontWeight: 700 }}>Private data</div>
                <div style={{ marginTop: 6, padding: '8px 10px', background: 'var(--redact)', color: 'var(--muted-ink)', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', borderRadius: '6px' }}>████ amount · never on-chain</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--verify)', fontWeight: 700 }}>Public result</div>
                <div style={{ marginTop: 6, padding: '8px 10px', background: 'var(--verify-soft)', border: '1px solid var(--verify-border)', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--verify)', fontWeight: 700 }}>total = 42 · Verified</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-ink)', fontWeight: 700 }}>Verification</div>
                <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span className="badge badge-verify">✓ Valid</span>
                  <span className="badge badge-private">Private</span>
                  <span className="mono" style={{ fontSize: '0.62rem', color: 'var(--muted-ink)' }}>Preprod · df5e05…</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--muted-ink)' }}>Product visualization — example case #0042, not live blockchain data</div>
      </section>

      {/* TRUST */}
      <section className="lp-trust-strip" aria-label="Capabilities" style={{ marginTop: 8 }}>
        <div className="lp-trust-item"><span className="lp-trust-icon">◈</span><div><strong>Private</strong><span>Sensitive evidence stays protected</span></div></div>
        <div className="lp-trust-item"><span className="lp-trust-icon" style={{ background: 'var(--verify-soft)', borderColor: 'var(--verify-border)', color: 'var(--verify)' }}>✓</span><div><strong>Verifiable</strong><span>Claims can be cryptographically verified</span></div></div>
        <div className="lp-trust-item"><span className="lp-trust-icon" style={{ background: 'rgba(122,161,224,0.12)', borderColor: 'rgba(122,161,224,0.3)', color: 'var(--blue)' }}>◎</span><div><strong>Traceable</strong><span>Evidence has a clear provenance</span></div></div>
        <div className="lp-trust-item"><span className="lp-trust-icon" style={{ background: 'rgba(244,199,112,0.13)', borderColor: 'rgba(244,199,112,0.3)', color: '#C98A3E' }}>⬢</span><div><strong>Auditable</strong><span>Authorized reviewers can inspect records</span></div></div>
      </section>

      {/* PROBLEM → SOLUTION */}
      <section id="product" className="lp-compare">
        <div className="lp-compare-card lp-compare-problem">
          <div className="lp-compare-head"><span className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-ink)', fontWeight: 700 }}>Evidence today</span><span className="badge badge-fail">Fragile</span></div>
          <h3>Traditional evidence exposes what should stay private</h3>
          <ul>
            <li><span className="li-dot li-dot-fail" /> fragmented records across tools</li>
            <li><span className="li-dot li-dot-fail" /> verification requires exposing sensitive data</li>
            <li><span className="li-dot li-dot-fail" /> unclear provenance and audit trail</li>
          </ul>
        </div>
        <div className="lp-compare-card lp-compare-solution">
          <div className="lp-compare-head"><span className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--verify)', fontWeight: 700 }}>With MidnightTrace</span><span className="badge badge-verify">Private by design</span></div>
          <h3>Private evidence, publicly verifiable outcomes</h3>
          <ul>
            <li><span className="li-dot li-dot-verify" /> witness stays private</li>
            <li><span className="li-dot li-dot-verify" /> ZK proof for every step</li>
            <li><span className="li-dot li-dot-verify" /> structured, auditable records</li>
          </ul>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="lp-steps-v2">
        <div className="lp-section-head">
          <h2>How it works</h2>
          <p>From private capture to public audit — four steps, no data leaves your device.</p>
        </div>
        <div className="lp-steps-grid">
          {[
            { n: '01', t: 'Connect', d: 'Connect IAM/1AM on Preprod — or explore in Demo.', icon: '◈' },
            { n: '02', t: 'Create a case', d: 'Open a case; choose a case ID and private evidence.', icon: '＋' },
            { n: '03', t: 'Add private evidence', d: 'Log findings; amount stays redacted, proof is generated.', icon: '◧' },
            { n: '04', t: 'Publish verifiable findings', d: 'Disclose or seal; anyone can verify via Audit.', icon: '✓' },
          ].map((s, i) => (
            <div key={s.n} className="lp-step-v2">
              <div className="lp-step-num">{s.n}</div>
              <div className="lp-step-icon">{s.icon}</div>
              <strong>{s.t}</strong>
              <span>{s.d}</span>
              {i < 3 && <div className="lp-step-connector" aria-hidden="true">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* PRIVACY */}
      <section id="privacy" className="lp-privacy">
        <div className="lp-section-head">
          <h2>Privacy, without hand-waving</h2>
          <p>What is private, what is proved, what is public — verified by the contract, not the UI.</p>
        </div>
        <div className="lp-privacy-grid">
          <div className="lp-privacy-card lp-privacy-private">
            <div className="lp-privacy-kicker">🔒 PRIVATE</div>
            <strong>Witness, amount, auth path</strong>
            <p><span className="redacted redacted-sm">████</span> never on-chain, never in indexer, never in logs. Encrypted at rest with wallet-derived key.</p>
          </div>
          <div className="lp-privacy-arrow">→</div>
          <div className="lp-privacy-card lp-privacy-proof">
            <div className="lp-privacy-kicker" style={{ color: 'var(--blue)' }}>⬢ ZERO-KNOWLEDGE PROOF</div>
            <strong>total' = total + amount</strong>
            <p>Membership via Merkle path, amount as private witness. Proof valid → ledger updates total.</p>
          </div>
          <div className="lp-privacy-arrow" style={{ color: 'var(--verify)' }}>→</div>
          <div className="lp-privacy-card lp-privacy-verifiable">
            <div className="lp-privacy-kicker" style={{ color: 'var(--verify)' }}>✓ PUBLIC</div>
            <strong>Verification & disclosed finding</strong>
            <p><code className="mono">caseId, total, lastDisclosed, phase, aggregate</code> public; <Link to="/audit">/audit</Link> verifies without seeing amount.</p>
          </div>
        </div>
      </section>

      {/* EVIDENCE LEDGER PREVIEW */}
      <section className="lp-preview">
        <div className="lp-section-head">
          <h2>Evidence ledger</h2>
          <p>All cases share an auditable, append-only ledger. Demo data shown — real Preprod via wallet.</p>
        </div>
        <div className="lp-preview-card">
          <div className="lp-preview-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-ink)', fontWeight: 700 }}>Evidence ledger</span>
              <span className="badge badge-verify">● Preprod</span>
            </div>
            <div style={{ display: 'flex', gap: 8, fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--muted-ink)' }}>
              <span>aggregate {mockLedger.aggregate.toString()}</span>
              <span>{mockCases.length} cases</span>
            </div>
          </div>
          <div className="lp-preview-table-head">
            <span>Case</span><span>Type</span><span>Status</span><span>Privacy</span><span>Last activity</span><span>Action</span>
          </div>
          {mockCases.slice(0,4).map(c => (
            <div key={c.id} className="lp-preview-row">
              <span style={{ fontWeight: 600, color: 'var(--paper)' }}>{c.title}</span>
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted-ink)' }}>{c.receipts[0]?.stepType ?? 'logStep'}</span>
              <span className="badge badge-verify">Verified</span>
              <span className="badge badge-private">Private</span>
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted-ink)' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
              <Link to={`/cases/${c.id}`} className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.72rem' }}>View →</Link>
            </div>
          ))}
          <div className="lp-preview-foot">
            <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)' }}>Demo ledger — real Preprod via wallet. No fake on-chain claims.</span>
            <Link to="/cases" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>Open cases →</Link>
          </div>
        </div>
      </section>

      {/* WORKED EXAMPLE */}
      <section className="ledger lp-worked">
        <div className="ledger-head">
          <span className="ledger-title">Worked example — case #07</span>
          <Link to="/about" className="mono" style={{ fontSize: '0.72rem', fontWeight: 600 }}>Full table on About →</Link>
        </div>
        <div style={{ padding: 0, overflowX: 'auto' }}>
          <table className="evidence-table">
            <thead><tr><th>Step</th><th>Evidence</th><th>What you enter</th><th>What goes on-chain</th><th>Proof</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td className="mono" style={{ color: 'var(--muted-ink)' }}>01</td><td><strong>Open #07</strong><div className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)' }}>2026-09-14 · block 412300</div></td><td>—</td><td className="mono">ACTIVE · total 0</td><td><span className="badge badge-private">Private</span></td><td><span className="badge badge-pending">Open</span></td></tr>
              <tr><td className="mono" style={{ color: 'var(--muted-ink)' }}>02</td><td><strong>Batch 1</strong><div className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)' }}>receipt a3f1…9c02</div></td><td><span className="redacted redacted-sm">████ a1</span></td><td className="mono">total = a1 <span style={{ color: 'var(--verify)' }}>✓</span></td><td><span className="badge badge-verify">Verified</span></td><td>42 → 42</td></tr>
              <tr><td className="mono" style={{ color: 'var(--muted-ink)' }}>03</td><td><strong>Batch 2</strong><div className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)' }}>receipt 7b22…4a11</div></td><td><span className="redacted redacted-sm">████ a2</span></td><td className="mono">total = a1+a2 <span style={{ color: 'var(--verify)' }}>✓</span></td><td><span className="badge badge-verify">Verified</span></td><td>→ Verified</td></tr>
              <tr><td className="mono" style={{ color: 'var(--muted-ink)' }}>04</td><td><strong>Disclose</strong><div className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)' }}>optional</div></td><td>(you choose)</td><td className="mono" style={{ color: 'var(--ochre)' }}>lastDisclosed = total</td><td><span className="badge badge-pending">Disclosed</span></td><td style={{ color: 'var(--ochre)', fontWeight: 700 }}>Public</td></tr>
              <tr><td className="mono" style={{ color: 'var(--muted-ink)' }}>05</td><td><strong>Close</strong><div className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)' }}>seal</div></td><td>—</td><td className="mono">CLOSED → Sealed</td><td><span className="badge badge-verify">Sealed</span></td><td>phase CLOSED</td></tr>
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--line-ink)', background: 'rgba(255,255,255,0.02)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted-ink)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span>Observer sees only <code className="mono" style={{ color: 'var(--paper)', background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 4 }}>total = 42</code> (example). Never <span className="redacted redacted-sm">a1</span> <span className="redacted redacted-sm">a2</span>.</span>
          <Link to="/audit?case=7" style={{ fontWeight: 700 }}>Audit case #07 →</Link>
        </div>
      </section>

      {/* LIVE DEMO */}
      <section className="ledger" style={{ borderColor: 'var(--verify-border)', overflow: 'hidden' }}>
        <div className="ledger-head" style={{ background: 'rgba(255,255,255,0.02)', borderBottomColor: 'var(--line-ink)' }}>
          <span className="ledger-title" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span className="badge badge-verify" style={{ transform: 'none' }}>Demo</span> Live demo — no wallet · Case #07</span>
          <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)' }}>aggregate {mockLedger.aggregate.toString()} · {mockCases.length} cases</span>
        </div>
        <div style={{ padding: '16px', display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <input className="input" value={demoAmt} onChange={e => setDemoAmt(e.target.value.replace(/[^0-9]/g,''))} placeholder="amount (max 65535)" inputMode="numeric" maxLength={5} style={{ maxWidth: 140 }} aria-label="Demo private amount — max 65535" />
            <button className="btn btn-primary" onClick={() => {
              const n = BigInt(parseInt(demoAmt || '0', 10) || 0);
              if (n <= 0n) { setDemoMsg('Enter amount > 0'); return; }
              if (n > 65535n) { setDemoMsg('Max 65,535 per step'); return; }
              demoLogStep(7n, n, demoCase.id);
              setDemoMsg(`Logged hidden ${n} → total updated (amount stays redacted) ✓`);
              setTimeout(() => setDemoMsg(null), 2500);
            }}>Log hidden step</button>
            <button className="btn btn-secondary" onClick={() => {
              const n = BigInt(parseInt(demoAmt || '0', 10) || 0);
              if (n > 65535n) { setDemoMsg('Max 65,535 per step'); return; }
              demoDisclose(7n, n || mockLedger.cases.find(c => c.caseId === 7n)?.total || 0n, demoCase.id);
              setDemoMsg(`Disclosed ${n || 'total'} → lastDisclosed ✓`);
              setTimeout(() => setDemoMsg(null), 2500);
            }}>Disclose</button>
          </div>
          {demoMsg && <div role="status" aria-live="polite" style={{ fontSize: '0.84rem', color: demoMsg.startsWith('Max') || demoMsg.startsWith('Enter') ? 'var(--ochre)' : 'var(--verify)', fontWeight: 600 }}>{demoMsg}</div>}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="lp-final-cta">
        <div>
          <h2>Ready to verify the evidence?</h2>
          <p>Open MidnightTrace — private proofs, public trust. No wallet needed to audit.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/dashboard" className="btn btn-primary" style={{ background: '#F4C770', color: '#0B1020', borderColor: '#F4C770' }}>Open MidnightTrace →</Link>
          <Link to="/audit" className="btn" style={{ background: 'transparent', color: 'var(--paper)', borderColor: 'rgba(255,255,255,0.14)' }}>Audit without wallet</Link>
        </div>
      </section>
    </>
  );
}
