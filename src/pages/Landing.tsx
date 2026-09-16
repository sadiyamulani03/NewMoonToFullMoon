import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDemo } from '../context/DemoContext';

export default function Landing() {
  const { isDemo, enableDemo } = useDemo();
  const navigate = useNavigate();
  const goDemo = () => { if (!isDemo) enableDemo(); navigate('/dashboard'); };
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  return (
    <>
      {/* ANNOUNCE BAR — full bleed */}
      <div className="lp-announce">
        <span className="lp-announce-pill">NEW</span>
        <span>MidnightTrace v1.1 on Preprod · Uint32 + metadataHash · <span className="mono">df5e05…29501</span></span>
        <a href="https://github.com/sadiyamulani03/NewMoonToFullMoon" target="_blank" rel="noreferrer">GitHub ↗</a>
      </div>

      {/* HERO — dark ink, centered, full-bleed */}
      <section className="lp-hero-dark">
        <div className="lp-hero-dark-inner">
          <div className="lp-hero-kicker">Midnight Network · Preprod · Private by default · Verifiable without secrets</div>
          <h1 className="display lp-hero-dark-title">
            Prove a forensic
            <br />
            step without
            <br />
            <span className="lp-hero-gold">exposing the evidence.</span>
          </h1>
          <p className="lp-hero-dark-sub">
            MidnightTrace is a <strong>private forensics desk on Midnight</strong>. Every finding is a{' '}
            <span title="Zero-knowledge proof — proves total' = total + amount without revealing amount">zero-knowledge proof</span> — the chain shows you counted, not <em>what</em> you counted.
          </p>

          <div className="lp-hero-dark-ctas">
            <Link to="/dashboard" className="btn lp-btn-gold">Launch app →</Link>
            <button className="btn lp-btn-ghost-dark" onClick={goDemo}>{isDemo ? 'Open demo dashboard' : 'Try demo — no wallet'}</button>
            <Link to="/audit" className="btn lp-btn-outline">Verify — no login</Link>
          </div>

          <div className="lp-hero-dark-meta">
            Don’t want to connect? <Link to="/audit">Verify publicly</Link> · <Link to="/about">Privacy model</Link> · 70 users · 4.5/5
          </div>
        </div>

        {/* Wide ledger showcase — bento-style, overlaps */}
        <div className="lp-hero-showcase">
          <div className="lp-showcase-card">
            <div className="lp-showcase-head">
              <span className="mono lp-showcase-kicker">LIVE EXHIBIT · CASE #07</span>
              <span className="stamp stamp-verify stamp-small">Verified</span>
            </div>
            <div className="lp-showcase-grid">
              <div className="lp-showcase-col">
                <span className="ledger-label">Filed</span>
                <span className="mono lp-showcase-val">2026-09-14 · block 412,320</span>
                <span className="mono lp-showcase-muted">preprod · inbox → chain</span>
              </div>
              <div className="lp-showcase-col lp-showcase-col-center">
                <span className="ledger-label">Finding</span>
                <span>Hidden batch <span className="redacted">██ 42 ██</span> added</span>
                <span className="mono lp-showcase-wire">ZK proof → <span className="redacted redacted-sm">amount</span> → <span className="wire-total">total&apos; = total + amount</span></span>
              </div>
              <div className="lp-showcase-col lp-showcase-col-right">
                <span className="ledger-label">Public total</span>
                <span><code className="mono lp-code-gold">42</code> <span className="lp-muted-sm">(0 → 42)</span></span>
                <span className="mono lp-showcase-receipt">a3f1…9c02 · <span className="redacted redacted-sm">redacted</span> · <span className="lp-verify">✓ valid</span></span>
              </div>
            </div>
            <div className="lp-showcase-foot">
              <span className="mono">Wire: <span className="wire-proof">ZK proof</span> on device → chain stores only <code className="mono">total</code></span>
              <span className="stamp stamp-verify lp-stamp-rotate">Proof confirmed</span>
            </div>
          </div>
          <div className="lp-hero-glow" aria-hidden />
        </div>
      </section>

      {/* STATS — dark ticker */}
      <section className="lp-stats-dark" aria-label="Project stats">
        <div className="lp-stats-dark-inner">
          <div className="lp-stat-dark"><span className="lp-stat-dark-num">70</span><span className="lp-stat-dark-label">Preprod users<br />verified wallets</span></div>
          <div className="lp-stat-dark"><span className="lp-stat-dark-num">4.5<span className="lp-stat-dark-small">/5</span></span><span className="lp-stat-dark-label">Avg rating<br />50 responses</span></div>
          <div className="lp-stat-dark"><span className="lp-stat-dark-num">v1.1</span><span className="lp-stat-dark-label mono">df5e05…29501<br />03123e…49c1</span></div>
          <div className="lp-stat-dark"><span className="lp-stat-dark-num"><span className="lp-verify">●</span> Live</span><span className="lp-stat-dark-label">Preprod indexed<br />SHA-256 receipt</span></div>
        </div>
      </section>

      {/* BENTO FEATURES — completely different from triptych */}
      <section className="lp-section">
        <div className="lp-section-head-center">
          <h2 className="display lp-h2">Selective disclosure, natively.</h2>
          <p className="lp-section-sub">Publish everything vs. prove without surveillance. Midnight does the second.</p>
        </div>
        <div className="lp-bento">
          <div className="lp-bento-card lp-bento-large">
            <div className="lp-bento-icon">⬛</div>
            <h3>Private by default</h3>
            <p>Step <span className="redacted redacted-sm">amount</span> never leaves your wallet. The ledger holds only <code className="mono">total</code>. Same math, zero leak.</p>
            <div className="lp-bento-foot mono">Witness never disclosed · Compact private witness</div>
          </div>
          <div className="lp-bento-card">
            <div className="lp-bento-icon">◐</div>
            <h3>Disclose when you choose</h3>
            <p>Call <code className="mono">disclose()</code> to publish the running total. Otherwise it stays <span className="redacted redacted-sm">redacted</span> forever.</p>
          </div>
          <div className="lp-bento-card">
            <div className="lp-bento-icon">⦿</div>
            <h3>Audit without a wallet</h3>
            <p>Anyone at <Link to="/audit">/audit</Link> checks aggregate, totals, phase, allowlist root — no secrets, no login.</p>
          </div>
          <div className="lp-bento-card lp-bento-wide">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="mono lp-bento-kicker">WORKED EXAMPLE · CASE #07</span>
              <Link to="/about" className="mono" style={{ fontSize: '0.72rem' }}>Full table →</Link>
            </div>
            <div className="lp-bento-table">
              {[
                ['Open #07', '—', 'ACTIVE · total 0'],
                ['Batch 1', '████ a1', 'total = a1 → Verified'],
                ['Batch 2', '████ a2', 'total = a1+a2 → Verified'],
                ['Disclose', '(optional)', 'lastDisclosed = total'],
                ['Close', '—', 'CLOSED → Sealed'],
              ].map(([s, priv, pub]) => (
                <div key={s} className="lp-bento-row">
                  <strong>{s}</strong>
                  <span>{priv.includes('████') ? <span className="redacted redacted-sm">{priv}</span> : <span className="lp-muted-sm">{priv}</span>}</span>
                  <span className="mono">{pub}</span>
                </div>
              ))}
            </div>
            <div className="mono lp-bento-note">Observer sees <code className="mono">total = 42</code> (example). Never <span className="redacted redacted-sm">a1</span> <span className="redacted redacted-sm">a2</span> or who logged them.</div>
          </div>
        </div>
      </section>

      {/* TIMELINE — horizontal, connected */}
      <section className="lp-section">
        <h2 className="display lp-h2">How a case moves — 30 seconds</h2>
        <div className="lp-timeline">
          <div className="lp-timeline-line" aria-hidden />
          {[
            { n: '01', t: 'Open', d: 'Pick a number. ID on-chain, title off-chain.' },
            { n: '02', t: 'Log', d: 'Private amount. Wallet proves total\' = total + amount.' },
            { n: '03', t: 'Disclose', d: 'Publish the total you choose. Else redacted.' },
            { n: '04', t: 'Verify', d: 'Open /audit — no wallet — check the math.' },
          ].map((s) => (
            <div key={s.n} className="lp-tl-step">
              <span className="lp-tl-dot" aria-hidden />
              <span className="mono lp-tl-n">{s.n}</span>
              <strong className="lp-tl-t">{s.t}</strong>
              <span className="lp-tl-d">{s.d}</span>
            </div>
          ))}
        </div>
        <div className="lp-steps-foot">Each step is a folder insert: <span className="redacted redacted-sm">private amount</span> → public <code className="mono">total</code> <span className="stamp stamp-verify stamp-small lp-stamp-inline">Verified</span></div>
      </section>

      {/* SOCIAL PROOF — centered, different style */}
      <section className="lp-proof">
        <div className="lp-proof-grid">
          <div className="lp-video-dark">
            <div className="lp-video-dark-head">
              <span className="display" style={{ fontSize: '1rem', color: 'var(--paper)' }}>See it in 90 seconds</span>
              <span className="mono" style={{ fontSize: '0.66rem', color: 'var(--muted-ink)' }}>Demo · Preprod live</span>
            </div>
            <div className="lp-video-frame">
              <iframe src="https://drive.google.com/file/d/1yyIYfEbgvMxYRE33vYNzR-WiedLoBbSf/preview" title="MidnightTrace demo" allow="autoplay; encrypted-media" allowFullScreen loading="lazy" />
            </div>
            <div className="lp-video-foot-dark">
              <a href="https://drive.google.com/file/d/1yyIYfEbgvMxYRE33vYNzR-WiedLoBbSf/view?usp=sharing" target="_blank" rel="noreferrer" className="mono" style={{ fontSize: '0.72rem', color: 'var(--paper)' }}>Open in Drive ↗</a>
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted-ink)' }}>Mock ledger in demo · Real proofs: Lace / 1AM + tNIGHT</span>
            </div>
          </div>
          <div className="lp-quotes-dark">
            <h3 className="display" style={{ fontSize: '1.05rem', color: 'var(--text-ink)', margin: 0 }}>Auditors liked the verification</h3>
            {[
              ['Proving an investigation step without exposing underlying evidence.', 'Zeel Chauhan · 5/5'],
              ['Immutable forensic trail was the strongest part.', 'Samara · 5/5'],
              ['Audit page made verification easy to understand.', 'Rashi Achaliya · 5/5'],
            ].map(([q, a]) => (
              <div key={q} className="lp-quote-dark">
                <span className="lp-quote-mark" aria-hidden>“</span>
                <p>{q}</p>
                <span className="mono lp-quote-attr">— {a}</span>
              </div>
            ))}
            <Link to="/about" className="lp-link-strong">Privacy model →</Link>
          </div>
        </div>
      </section>

      {/* FAQ — new card style */}
      <section className="lp-section">
        <h2 className="display lp-h2">FAQ — what stays private</h2>
        <div className="lp-faq">
          {[
            { q: 'What is public vs. redacted?', a: 'Public: per-case total, lastDisclosed (only if you disclose), phase, eventCount, aggregate, allowlist root. Private forever: every step amount and member secret — only persistentHash commitments are stored. ZK shows total\' = total + amount without revealing amount.' },
            { q: 'Do I need a wallet to verify?', a: 'No. /audit reads live Preprod state from the indexer and checks aggregate == Σ totals, root, phase order, and disclosure book. Share a case ID — anyone can verify.' },
            { q: 'Does demo touch the chain?', a: 'No — in-memory mock ledger, toggled in header. Refresh resets it. Real proofs need Lace/1AM on Preprod + tNIGHT from faucet.' },
            { q: 'What does “redacted” mean?', a: 'Black bar, not blur. Amount never leaves device, never lands on-chain, never renders in UI/API. Green Verified means proof checked out; amount stayed redacted.' },
          ].map((item, i) => (
            <div key={item.q} className={`lp-faq-item ${faqOpen === i ? 'lp-faq-open' : ''}`}>
              <button className="lp-faq-q" onClick={() => setFaqOpen(faqOpen === i ? null : i)} aria-expanded={faqOpen === i}>
                <span>{item.q}</span>
                <span className="lp-faq-chevron">{faqOpen === i ? '−' : '+'}</span>
              </button>
              {faqOpen === i && <div className="lp-faq-a">{item.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA — gold on ink */}
      <section className="lp-cta-gold">
        <div>
          <h3 className="display" style={{ margin: 0, fontSize: '1.4rem', color: 'var(--ink)' }}>Try it with zero setup.</h3>
          <p style={{ margin: '6px 0 0', color: 'rgba(20,24,31,0.7)', fontSize: '0.92rem' }}>Mock ledger in demo, real proofs on Preprod with Lace / 1AM + tNIGHT.</p>
        </div>
        <div className="lp-cta-actions">
          <button className="btn btn-primary" onClick={goDemo}>{isDemo ? 'Open demo dashboard' : 'Try demo — no wallet'}</button>
          <Link to="/dashboard" className="btn btn-cream">Launch app</Link>
          <a href="https://faucet.preprod.midnight.network" target="_blank" rel="noreferrer" className="btn btn-ghost">Get tNIGHT ↗</a>
        </div>
      </section>
    </>
  );
}
