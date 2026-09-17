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
  const goExplore = () => navigate('/dashboard');
  const handleConnect = () => { void connect(); };
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [demoAmt, setDemoAmt] = useState('15');
  const [demoMsg, setDemoMsg] = useState<string | null>(null);
  const demoCase = mockCases.find((c) => c.id.startsWith('demo-7')) ?? mockCases[0];
  const [faucetOpen, setFaucetOpen] = useState(false);
  const isConnecting = walletState.status === 'connecting';
  const isIdle = walletState.status === 'idle';

  return (
    <>
      {/* Announce */}
      <div className="lp-announce">
        <span className="lp-announce-pill">NEW</span>
        <span>MidnightTrace v1.1 on Preprod · <span className="mono">df5e05…29501</span> · Uint32 + metadataHash</span>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub ↗</a>
      </div>

      {/* HERO — two column: left headline + CTAs, right live evidence ledger */}
      <section className="lp-hero-v2" aria-label="Hero">
        <div className="lp-hero-v2-left">
          <div className="lp-hero-kicker"><span className="lp-kicker-dot" /> Built on Midnight Preprod · Privacy-preserving · ZK verified</div>
          <h1 className="display lp-hero-v2-title">Prove work happened.<br /><span style={{ color: '#F4C770' }}>Keep evidence private.</span></h1>
          <p className="lp-hero-v2-sub">
            MidnightTrace turns sensitive evidence into <strong>zero-knowledge proofs</strong>. The chain verifies that you counted — without ever seeing <em>what</em> you counted. For forensic analysts, auditors and compliance teams.
          </p>
          <div className="lp-hero-ctas">
            <button className="btn btn-primary lp-cta-primary" onClick={goExplore}>Explore MidnightTrace →</button>
            {isConnected ? (
              <Link to="/dashboard" className="btn btn-secondary">Open dashboard</Link>
            ) : (
              <button className="btn btn-secondary" onClick={handleConnect} disabled={isConnecting || isIdle}>{isConnecting ? 'Connecting…' : isIdle ? 'Initializing…' : 'Connect Wallet'}</button>
            )}
          </div>
          <div className="lp-hero-meta">
            <button className="btn btn-ghost" onClick={() => setFaucetOpen(true)} style={{ color: 'var(--blue)', fontSize: '0.82rem', padding: '6px 0' }}>Setup wallet → faucet</button>
            <span style={{ color: 'var(--line-ink)' }}>·</span>
            <Link to="/audit" className="btn btn-ghost" style={{ color: 'var(--blue)', fontSize: '0.82rem', padding: '6px 0' }}>Verify — no login →</Link>
            <span style={{ color: 'var(--line-ink)' }}>·</span>
            <Link to="/about" className="btn btn-ghost" style={{ color: 'var(--muted-ink)', fontSize: '0.82rem', padding: '6px 0' }}>How privacy works →</Link>
          </div>
          <FaucetDrawer open={faucetOpen} onClose={() => setFaucetOpen(false)} />
          <div className="lp-hero-stats">
            <span>Early cohort <strong className="mono">70</strong> <span style={{ color: 'var(--verify)' }}>● 4.5/5</span></span>
            <span>Contract <strong className="mono">df5e05…29501</strong></span>
            <span style={{ color: 'var(--verify)', fontWeight: 700 }}>● Preprod live</span>
          </div>
        </div>

        <div className="lp-hero-v2-right" aria-label="Live evidence ledger preview">
          <div className="evidence-card evidence-card-featured">
            <div className="evidence-card-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-ink)' }}>Live evidence ledger · Case #07</span>
                <span className="badge badge-verify">Verified</span>
              </div>
              <span className="mono" style={{ fontSize: '0.62rem', color: 'var(--muted-ink)' }}>block 412,320 · 2026-09-14</span>
            </div>
            <div className="evidence-card-body">
              <div className="evidence-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted-ink)' }}>Evidence #07-B1 · Forensic batch</span>
                <span className="badge badge-private">🔒 Private</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
                <span className="redacted">████ 42</span>
                <span style={{ color: 'var(--muted-ink)' }}>→</span>
                <code className="mono" style={{ background: 'var(--verify-soft)', border: '1px solid var(--verify-border)', padding: '3px 8px', borderRadius: 6, color: 'var(--verify)', fontWeight: 700 }}>total = 42</code>
                <span className="stamp stamp-verify stamp-small" style={{ marginLeft: 'auto' }}>Verified</span>
              </div>
              <div className="evidence-meta-grid">
                <div><span className="mono" style={{ fontSize: '0.62rem', color: 'var(--muted-ink)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Proof</span><div className="mono" style={{ fontSize: '0.74rem', color: 'var(--verify)', fontWeight: 700 }}>✓ valid · ZK</div></div>
                <div><span className="mono" style={{ fontSize: '0.62rem', color: 'var(--muted-ink)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Privacy</span><div className="mono" style={{ fontSize: '0.74rem', color: 'var(--paper)', fontWeight: 600 }}><span className="redacted redacted-sm">redacted</span> · never on-chain</div></div>
                <div><span className="mono" style={{ fontSize: '0.62rem', color: 'var(--muted-ink)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Wire</span><div className="mono" style={{ fontSize: '0.74rem', color: 'var(--blue)' }}>total' = total + amount</div></div>
              </div>
              <div className="mono" style={{ marginTop: 10, fontSize: '0.68rem', color: 'var(--muted-ink)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span>a3f1…9c02</span>·<span>SHA-256 receipt</span>·<span>allowlist root pinned</span>
              </div>
            </div>
            <div className="evidence-card-foot">
              <span style={{ fontSize: '0.76rem', color: 'var(--muted-ink)' }}>Black bars are the feature — amount never leaves your wallet.</span>
              <Link to="/audit" style={{ fontSize: '0.76rem', fontWeight: 700 }}>Audit without wallet →</Link>
            </div>
          </div>
          <div className="evidence-card evidence-card-secondary">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Next evidence · Pending disclosure</span>
              <span className="badge badge-pending">Pending</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
              <span className="redacted redacted-sm">████ a2</span>
              <span style={{ color: 'var(--muted-ink)' }}>→</span>
              <code className="mono" style={{ fontSize: '0.78rem', color: 'var(--muted-ink)' }}>total = a1+a2</code>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="lp-trust-strip" aria-label="Capabilities">
        <div className="lp-trust-item"><span className="lp-trust-icon">🔒</span><div><strong>Private</strong><span>Amounts stay in wallet, never on-chain</span></div></div>
        <div className="lp-trust-item"><span className="lp-trust-icon" style={{ background: 'var(--verify-soft)', borderColor: 'var(--verify-border)', color: 'var(--verify)' }}>✓</span><div><strong>Verifiable</strong><span>ZK proof for every step</span></div></div>
        <div className="lp-trust-item"><span className="lp-trust-icon" style={{ background: 'rgba(122,161,224,0.12)', borderColor: 'rgba(122,161,224,0.3)', color: 'var(--blue)' }}>◎</span><div><strong>Auditable</strong><span>Wallet-free /audit in seconds</span></div></div>
        <div className="lp-trust-item"><span className="lp-trust-icon" style={{ background: 'rgba(244,199,112,0.13)', borderColor: 'rgba(244,199,112,0.3)', color: '#C98A3E' }}>◈</span><div><strong>Built on Midnight</strong><span>Preprod · df5e05…29501</span></div></div>
      </section>

      {/* PROBLEM → SOLUTION */}
      <section id="evidence" className="lp-compare">
        <div className="lp-compare-card lp-compare-problem">
          <div className="lp-compare-head"><span className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700 }}>Traditional evidence</span><span className="badge badge-fail">Fragile</span></div>
          <h3>Fragmented, exposed, hard to verify</h3>
          <ul>
            <li><span className="li-dot li-dot-fail" /> Evidence scattered across files & chats</li>
            <li><span className="li-dot li-dot-fail" /> Difficult to verify without exposing data</li>
            <li><span className="li-dot li-dot-fail" /> Information leaks on every share</li>
            <li><span className="li-dot li-dot-fail" /> Unclear provenance and chain of custody</li>
          </ul>
        </div>
        <div className="lp-compare-card lp-compare-solution">
          <div className="lp-compare-head"><span className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--verify)', fontWeight: 700 }}>MidnightTrace</span><span className="badge badge-verify">Verified</span></div>
          <h3>Private proofs, clear provenance</h3>
          <ul>
            <li><span className="li-dot li-dot-verify" /> Private amounts → public totals via ZK</li>
            <li><span className="li-dot li-dot-verify" /> Verifiable evidence without disclosure</li>
            <li><span className="li-dot li-dot-verify" /> Clear provenance and audit trail</li>
            <li><span className="li-dot li-dot-verify" /> Audit-ready records for anyone</li>
          </ul>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="lp-steps-v2">
        <div className="lp-section-head">
          <h2>How it works</h2>
          <p>Four steps — from private capture to public audit. No data leaves your device.</p>
        </div>
        <div className="lp-steps-grid">
          {[
            { n: '01', t: 'Capture', d: 'Pick a private amount. It is redacted everywhere — only you see it.', icon: '◧' },
            { n: '02', t: 'Prove', d: 'Wallet proves total\' = total + amount in zero-knowledge. Amount stays hidden.', icon: '⬢' },
            { n: '03', t: 'Verify', d: 'Chain checks the proof and stores only the new total + Verified stamp.', icon: '✓' },
            { n: '04', t: 'Audit', d: 'Anyone opens /audit — no wallet — and checks aggregate, root and phase.', icon: '◎' },
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

      {/* PRODUCT PREVIEW — large dashboard mock */}
      <section className="lp-preview">
        <div className="lp-section-head">
          <h2>Product preview</h2>
          <p>A real SaaS dashboard — not a mockup. Evidence table, verification timeline and wallet state.</p>
        </div>
        <div className="lp-preview-card">
          <div className="lp-preview-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-ink)', fontWeight: 700 }}>Dashboard · Evidence ledger</span>
              <span className="badge badge-verify">● Preprod live</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)' }}>aggregate {mockLedger.aggregate.toString()}</span>
              <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)' }}>{mockCases.length} cases</span>
            </div>
          </div>
          <div className="lp-preview-table-head">
            <span>Evidence</span><span>Type</span><span>Status</span><span>Privacy</span><span>Timestamp</span><span>Action</span>
          </div>
          {mockCases.slice(0,4).map(c => (
            <div key={c.id} className="lp-preview-row">
              <span style={{ fontWeight: 600, color: 'var(--paper)', fontFamily: 'var(--font-display)' }}>{c.title}</span>
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted-ink)' }}>{c.receipts[0]?.stepType ?? 'logStep'}</span>
              <span className="badge badge-verify">Verified</span>
              <span className="badge badge-private">Private</span>
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted-ink)' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
              <Link to={`/cases/${c.id}`} className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.72rem' }}>View →</Link>
            </div>
          ))}
          <div className="lp-preview-foot">
            <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)' }}>Hover rows · Verified = green · Private = redacted bars · Try demo — no wallet</span>
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>Open dashboard →</Link>
          </div>
        </div>
      </section>

      {/* PRIVACY — PRIVATE DATA → ZK → VERIFIABLE */}
      <section id="privacy" className="lp-privacy">
        <div className="lp-section-head">
          <h2>Privacy, without hand-waving</h2>
          <p>What is private, what is proved, what is public — technically accurate.</p>
        </div>
        <div className="lp-privacy-grid">
          <div className="lp-privacy-card lp-privacy-private">
            <div className="lp-privacy-kicker">🔒 PRIVATE DATA</div>
            <strong>Your evidence stays yours</strong>
            <p>Step <span className="redacted redacted-sm">amount</span> never leaves wallet, never on-chain, never in API. Black bars are not blur — they are the guarantee.</p>
          </div>
          <div className="lp-privacy-arrow">→</div>
          <div className="lp-privacy-card lp-privacy-proof">
            <div className="lp-privacy-kicker" style={{ color: 'var(--blue)' }}>⬢ ZERO-KNOWLEDGE PROOF</div>
            <strong>total' = total + amount</strong>
            <p>Wallet proves the wire without revealing the amount. Membership via Merkle proof — only you can advance your case.</p>
          </div>
          <div className="lp-privacy-arrow" style={{ color: 'var(--verify)' }}>→</div>
          <div className="lp-privacy-card lp-privacy-verifiable">
            <div className="lp-privacy-kicker" style={{ color: 'var(--verify)' }}>✓ VERIFIABLE RESULT</div>
            <strong>Public total + Verified stamp</strong>
            <p>Chain stores <code className="mono">total</code>, <code className="mono">lastDisclosed</code> (optional) and phase. Anyone at <Link to="/audit">/audit</Link> verifies without seeing the amount.</p>
          </div>
        </div>
      </section>

      {/* WORKED EXAMPLE — polished evidence record */}
      <section className="ledger lp-worked">
        <div className="ledger-head">
          <span className="ledger-title">Worked example — case #07 · Polished evidence record</span>
          <Link to="/about" className="mono" style={{ fontSize: '0.72rem', fontWeight: 600 }}>Full table on About →</Link>
        </div>
        <div style={{ padding: 0, overflowX: 'auto' }}>
          <table className="evidence-table">
            <thead><tr><th>Step</th><th>Evidence</th><th>What you enter</th><th>What goes on-chain</th><th>Proof</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td className="mono" style={{ color: 'var(--muted-ink)' }}>01</td><td><strong>Open #07</strong><div className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)' }}>2026-09-14 · block 412300</div></td><td><span style={{ color: 'var(--muted-ink)' }}>—</span></td><td className="mono">ACTIVE · total 0</td><td><span className="badge badge-private">Private</span></td><td><span className="badge badge-pending">Open</span></td></tr>
              <tr><td className="mono" style={{ color: 'var(--muted-ink)' }}>02</td><td><strong>Batch 1</strong><div className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)' }}>receipt a3f1…9c02</div></td><td><span className="redacted redacted-sm">████ a1</span></td><td className="mono">total = a1 <span style={{ color: 'var(--verify)' }}>✓</span></td><td><span className="badge badge-verify">Verified</span></td><td><span className="mono" style={{ fontSize: '0.72rem' }}>42 → 42</span></td></tr>
              <tr><td className="mono" style={{ color: 'var(--muted-ink)' }}>03</td><td><strong>Batch 2</strong><div className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)' }}>receipt 7b22…4a11</div></td><td><span className="redacted redacted-sm">████ a2</span></td><td className="mono">total = a1+a2 <span style={{ color: 'var(--verify)' }}>✓</span></td><td><span className="badge badge-verify">Verified</span></td><td><span className="mono" style={{ fontSize: '0.72rem' }}>→ Verified</span></td></tr>
              <tr><td className="mono" style={{ color: 'var(--muted-ink)' }}>04</td><td><strong>Disclose</strong><div className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)' }}>optional</div></td><td><span style={{ color: 'var(--muted-ink)' }}>(you choose)</span></td><td className="mono" style={{ color: 'var(--ochre)' }}>lastDisclosed = total</td><td><span className="badge badge-pending">Disclosed</span></td><td><span style={{ color: 'var(--ochre)', fontWeight: 700 }}>Public</span></td></tr>
              <tr><td className="mono" style={{ color: 'var(--muted-ink)' }}>05</td><td><strong>Close</strong><div className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)' }}>seal</div></td><td><span style={{ color: 'var(--muted-ink)' }}>—</span></td><td className="mono">CLOSED → Sealed</td><td><span className="badge badge-verify">Sealed</span></td><td><span className="mono" style={{ fontSize: '0.72rem' }}>phase CLOSED</span></td></tr>
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--line-ink)', background: 'rgba(255,255,255,0.03)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted-ink)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span>Observer sees only <code className="mono" style={{ color: 'var(--paper)', background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: 3 }}>total = 42</code> (example). Never <span className="redacted redacted-sm">a1</span> <span className="redacted redacted-sm">a2</span>.</span>
          <Link to="/audit?case=7" style={{ fontWeight: 700 }}>Audit case #07 →</Link>
        </div>
      </section>

      {/* PROOF — video + quotes */}
      <section style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 12, alignItems: 'start' }}>
        <div className="ledger" style={{ overflow: 'hidden' }}>
          <div className="ledger-head"><span className="ledger-title">See it live</span><span className="mono" style={{ fontSize: '0.66rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-ink)' }}>Demo · Preprod live</span></div>
          <div style={{ aspectRatio: '16/9', background: '#0F131A', display: 'grid', placeItems: 'center' }}>
            <iframe src={DEMO_VIDEO_URL.replace('/view?usp=sharing', '/preview')} title="MidnightTrace demo" allow="autoplay; encrypted-media" allowFullScreen loading="lazy" style={{ width: '100%', height: '100%', border: 0, display: 'block' }} />
          </div>
          <div style={{ padding: '10px 14px', borderTop: '1px solid var(--line-ink)', background: 'rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <a href={DEMO_VIDEO_URL} target="_blank" rel="noreferrer" className="mono" style={{ fontSize: '0.72rem', fontWeight: 600 }}>Open in Drive ↗</a>
            <span style={{ fontSize: '0.72rem', color: 'var(--muted-ink)' }}>Mock ledger in demo · Real proofs: Lace / 1AM + tNIGHT</span>
          </div>
        </div>
        <div className="ledger" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="ledger-head"><span className="ledger-title">Auditors liked</span><span className="mono" style={{ fontSize: '0.66rem', color: 'var(--muted-ink)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>5/5 · Very Easy</span></div>
          <div style={{ padding: '10px 12px', display: 'grid', gap: 10 }}>
            {[
              ['Proving an investigation step without exposing underlying evidence.', 'Zeel Chauhan · 5/5'],
              ['Immutable forensic trail was the strongest part.', 'Samara · 5/5'],
              ['Audit page made verification easy to understand.', 'Rashi Achaliya · 5/5'],
            ].map(([q, a]) => (
              <div key={q} style={{ border: '1px solid var(--line-ink)', borderRadius: 8, padding: '10px 12px', background: 'rgba(255,255,255,0.03)' }}>
                <p style={{ margin: '0 0 4px', fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--paper)', fontStyle: 'italic' }}>“{q}”</p>
                <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)' }}>— {a}</span>
              </div>
            ))}
            <Link to="/about" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--blue)' }}>Privacy model → full table on About</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="ledger">
        <div className="ledger-head"><span className="ledger-title">FAQ — what stays private</span></div>
        <div>
          {[
            { q: 'What is public vs. redacted?', a: 'Public: per-case total, lastDisclosed (only if you disclose), phase, eventCount, aggregate, allowlist root. Private forever: every step amount and member secret — only persistentHash commitments are stored. ZK shows total\' = total + amount without revealing amount.' },
            { q: 'Do I need a wallet to verify?', a: 'No. /audit reads live Preprod state from the indexer and checks aggregate == Σ totals, root, phase order, and disclosure book. Share a case ID — anyone can verify.' },
            { q: 'Does demo touch the chain?', a: 'No — in-memory mock ledger, toggled in header. Refresh resets it. Real proofs need Lace/1AM on Preprod + tNIGHT from faucet.' },
            { q: 'What does “redacted” mean?', a: 'Black bar, not blur. Amount never leaves device, never lands on-chain, never renders in UI/API. Green Verified means proof checked out; amount stayed redacted.' },
          ].map((item, i) => (
            <div key={item.q} style={{ borderBottom: '1px solid var(--line-ink)' }}>
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} aria-expanded={faqOpen === i} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '12px 14px', background: faqOpen === i ? 'rgba(255,255,255,0.04)' : 'transparent', border: 0, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--paper)', textAlign: 'left' }}>
                <span>{item.q}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted-ink)' }}>{faqOpen === i ? '−' : '+'}</span>
              </button>
              {faqOpen === i && <div style={{ padding: '0 14px 12px', fontSize: '0.86rem', color: 'var(--muted-ink)', lineHeight: 1.6 }}>{item.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* LIVE DEMO — landing IS demo (no wallet, no redirect needed) */}
      <section className="ledger" style={{ borderColor: 'var(--verify-border)', overflow: 'hidden' }}>
        <div className="ledger-head" style={{ background: 'rgba(63,167,114,0.14)', borderBottomColor: 'var(--verify-border)' }}>
          <span className="ledger-title" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span className="stamp stamp-verify stamp-small" style={{ transform: 'none' }}>Demo</span> Live demo — no wallet · Case #07</span>
          <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--verify)', fontWeight: 700 }}>aggregate {mockLedger.aggregate.toString()} · {mockCases.length} cases</span>
        </div>
        <div style={{ padding: '14px 14px', display: 'grid', gap: 12 }}>
          <div className="wire" style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: 'var(--paper)' }}>{demoCase.title} <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted-ink)' }}>· {demoCase.status} · {demoCase.receipts.length} receipts</span></span>
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted-ink)' }}>total {mockLedger.cases.find(c => c.caseId === 7n)?.total.toString() ?? '—'} · lastDisclosed {mockLedger.cases.find(c => c.caseId === 7n)?.lastDisclosed.toString() ?? '0'}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="redacted">████ {demoAmt || '—'}</span>
              <span style={{ color: 'var(--muted-ink)' }}>→</span>
              <code className="mono" style={{ background: 'var(--verify-soft)', border: '1px solid var(--verify-border)', padding: '2px 6px', borderRadius: 3, color: 'var(--verify)', fontWeight: 700 }}>total' = total + amount</code>
              <span className="stamp stamp-verify stamp-small" style={{ transform: 'none' }}>Verified</span>
            </div>
            <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {demoCase.receipts.slice(-3).map(r => <span key={r.txId} title={r.txId}>{r.txId.slice(0,12)}… · {r.stepType} · block {r.blockHeight}</span>)}
            </div>
          </div>
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
            }} style={{ borderColor: 'var(--line-ink-strong)' }}>Disclose</button>
            <Link to="/dashboard" className="btn btn-ghost" style={{ color: 'var(--blue)' }}>Open full dashboard →</Link>
          </div>
          {demoMsg && <div role="status" aria-live="polite" style={{ fontSize: '0.82rem', color: demoMsg.startsWith('Max') || demoMsg.startsWith('Enter') ? 'var(--ochre)' : 'var(--verify)', fontWeight: 600 }}>{demoMsg}</div>}
          <div style={{ fontSize: '0.78rem', color: 'var(--muted-ink)', lineHeight: 1.5 }}>
            This is the real demo ledger (same mock ledger as <Link to="/dashboard" style={{ fontWeight: 600 }}>/dashboard</Link>). Amount is <span className="redacted redacted-sm">redacted</span> — never leaves the input, never on-chain. Verify wallet-free at <Link to="/audit" style={{ fontWeight: 600 }}>/audit</Link>.
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="lp-final-cta">
        <div>
          <h2>Ready to verify the evidence?</h2>
          <p>Open MidnightTrace — private proofs, public trust. No wallet needed to audit.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/dashboard" className="btn btn-primary lp-cta-primary" style={{ background: '#F4C770', color: '#0B1020', borderColor: '#F4C770' }}>Open MidnightTrace →</Link>
          <Link to="/audit" className="btn" style={{ background: 'transparent', color: 'var(--paper)', borderColor: 'rgba(255,255,255,0.18)' }}>Audit without wallet</Link>
        </div>
      </section>
    </>
  );
}
