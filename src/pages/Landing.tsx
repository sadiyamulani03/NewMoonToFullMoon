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
      {/* HERO — brand tagline + ledger anchor */}
      <section className="lp-hero">
        <div className="lp-hero-copy">
          <div className="lp-kicker">
            <span className="lp-kicker-dot" aria-hidden /> Midnight Preprod · Live · Private by default
          </div>
          <h1 className="display lp-hero-title">
            Prove a forensic<br />step without<br /><span className="lp-hero-accent">exposing the evidence.</span>
          </h1>
          <p className="lp-hero-sub">
            MidnightTrace is a folder of case files on <strong>Midnight</strong>. Each finding is a{' '}
            <span className="lp-tooltip" title="Zero-knowledge proof: proves a statement true without revealing the hidden data — see About → Glossary">
              zero-knowledge proof<span className="lp-tooltip-icon"> ⓘ</span>
            </span>{' '}
            — the ledger shows you counted, not <em>what</em> you counted. Black bars stay black.
          </p>

          <div className="lp-hero-ctas">
            <Link to="/dashboard" className="btn btn-primary lp-cta-primary">Launch app →</Link>
            <button className="btn btn-cream" onClick={goDemo}>{isDemo ? 'Open demo dashboard' : 'Try demo — no wallet'}</button>
          </div>
          <div className="lp-hero-meta">
            Don’t want to connect? <Link to="/audit" className="lp-hero-meta-link">Verify publicly — no login →</Link>
            <span className="lp-hero-meta-sep">·</span>
            <Link to="/about" className="lp-hero-meta-link">How privacy works</Link>
          </div>
          <div className="lp-hero-trust">
            <span className="lp-trust-pill">70 Preprod users · 4.5/5</span>
            <span className="lp-trust-pill lp-trust-pill-verify">● Preprod live</span>
            <a href="https://github.com/sadiyamulani03/NewMoonToFullMoon" target="_blank" rel="noreferrer" className="lp-trust-pill lp-trust-pill-link">GitHub ↗</a>
            <a href="https://x.com/Midnight__Trace" target="_blank" rel="noreferrer" className="lp-trust-pill lp-trust-pill-link">X ↗</a>
          </div>
        </div>

        {/* Redacted ledger entry — anchor visual */}
        <div className="ledger lp-hero-ledger" aria-label="Example exhibit ledger entry">
          <div className="ledger-head">
            <span className="ledger-title">Case #07 · Exhibit ledger</span>
            <span className="stamp stamp-verify stamp-small">Verified</span>
          </div>
          <div className="lp-ledger-body">
            <div className="lp-ledger-row">
              <span className="ledger-label">Filed</span>
              <span className="mono lp-ledger-val">2026-09-14 · block 412,320 · preprod</span>
            </div>
            <div className="lp-ledger-row">
              <span className="ledger-label">Finding</span>
              <span>Hidden batch <span className="redacted">██ 42 units ██</span> added</span>
            </div>
            <div className="lp-ledger-row">
              <span className="ledger-label">Public total</span>
              <span><code className="mono lp-code-verify">42</code> <span className="lp-muted-sm">(was 0 → now 42)</span></span>
            </div>
            <div className="lp-ledger-row">
              <span className="ledger-label">Receipt</span>
              <span className="mono lp-ledger-val-sm">a3f1…9c02 · <span className="redacted redacted-sm">amount redacted</span> · proof <span className="lp-verify">✓ valid</span></span>
            </div>
          </div>
          <div className="lp-ledger-foot">
            <span className="mono lp-ledger-wire">
              Wire: <span className="wire-proof">ZK proof</span> → <span className="redacted redacted-sm">amount</span> → <span className="wire-total">total&apos; = total + amount</span>
            </span>
            <span className="stamp stamp-verify lp-stamp-rotate">Proof confirmed</span>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="lp-stats" aria-label="Project stats">
        <div className="lp-stat">
          <span className="lp-stat-num">70</span>
          <span className="lp-stat-label">Preprod users · verified wallets</span>
        </div>
        <div className="lp-stat">
          <span className="lp-stat-num">4.5<span className="lp-stat-small">/5</span></span>
          <span className="lp-stat-label">Avg rating · 50 responses</span>
        </div>
        <div className="lp-stat">
          <span className="lp-stat-num">v1.1</span>
          <span className="lp-stat-label mono">df5e05…29501 · Counter 03123e…49c1</span>
        </div>
        <div className="lp-stat">
          <span className="lp-stat-num"><span className="lp-verify">✓</span> Live</span>
          <span className="lp-stat-label"> Midnight Preprod · Indexed</span>
        </div>
      </section>

      {/* FEATURE TRIPTYCH — 3 pillars */}
      <section className="lp-section">
        <div className="lp-section-head">
          <h2 className="display lp-h2">Why forensics needs selective disclosure</h2>
          <p className="lp-section-sub">Competing ledgers publish everything. Midnight proves without surveillance.</p>
        </div>
        <div className="lp-features">
          <div className="lp-feature">
            <div className="lp-feature-icon" aria-hidden>⬛</div>
            <h3 className="lp-feature-title">Private by default</h3>
            <p className="lp-feature-desc">
              Step <span className="redacted redacted-sm">amount</span> never leaves your wallet. Chain stores only <code className="mono">total</code>. Black bars are the feature.
            </p>
            <span className="lp-feature-meta mono">Witness never disclosed</span>
          </div>
          <div className="lp-feature">
            <div className="lp-feature-icon" aria-hidden>◐</div>
            <h3 className="lp-feature-title">Selective disclosure</h3>
            <p className="lp-feature-desc">
              Call <code className="mono">disclose()</code> only when you choose. Publish the running total, not the inputs. Same contract, two privacy modes.
            </p>
            <span className="lp-feature-meta mono">Compact disclose() is explicit</span>
          </div>
          <div className="lp-feature">
            <div className="lp-feature-icon" aria-hidden>⦿</div>
            <h3 className="lp-feature-title">Wallet-free audit</h3>
            <p className="lp-feature-desc">
              Anyone opens <Link to="/audit">/audit</Link> — no wallet, no secrets — and checks aggregate, totals, phase, and allowlist root.
            </p>
            <span className="lp-feature-meta mono">Indexer-direct · SHA-256 fingerprint</span>
          </div>
        </div>
      </section>

      {/* 4-step process */}
      <section className="lp-section">
        <h2 className="display lp-h2">How a case moves — 30 seconds</h2>
        <div className="lp-steps">
          {[
            { n: '01', t: 'Open case', d: 'Pick a number. The case ID goes on-chain; title stays off-chain.' },
            { n: '02', t: 'Log finding', d: 'Enter a private amount. Your wallet proves total\' = total + amount.' },
            { n: '03', t: 'Disclose', d: 'Publish only the running total you choose. Else it stays redacted.' },
            { n: '04', t: 'Verify', d: 'Anyone opens /audit — no wallet — and checks the math.' },
          ].map((s) => (
            <div key={s.n} className="lp-step">
              <span className="mono lp-step-n">{s.n}</span>
              <strong className="lp-step-t">{s.t}</strong>
              <span className="lp-step-d">{s.d}</span>
            </div>
          ))}
        </div>
        <div className="lp-steps-foot">
          Each step is a folder insert: <span className="redacted redacted-sm">private amount</span> → public <code className="mono">total</code> with a <span className="stamp stamp-verify stamp-small lp-stamp-inline">Verified</span> stamp.
        </div>
      </section>

      {/* VIDEO + TESTIMONIALS */}
      <section className="lp-split">
        <div className="lp-video">
          <div className="lp-video-head">
            <span className="ledger-title" style={{ fontSize: '1rem' }}>See it in 90 seconds</span>
            <span className="mono lp-video-kicker">Demo video · Preprod live</span>
          </div>
          <div className="lp-video-frame">
            <iframe
              src="https://drive.google.com/file/d/1yyIYfEbgvMxYRE33vYNzR-WiedLoBbSf/preview"
              title="MidnightTrace demo video"
              allow="autoplay; encrypted-media"
              allowFullScreen
              loading="lazy"
            />
          </div>
          <div className="lp-video-foot">
            <a href="https://drive.google.com/file/d/1yyIYfEbgvMxYRE33vYNzR-WiedLoBbSf/view?usp=sharing" target="_blank" rel="noreferrer" className="mono lp-video-link">Open in Drive ↗</a>
            <span className="lp-muted-sm">Mock ledger in demo · Real proofs with Lace / 1AM + tNIGHT on Preprod</span>
          </div>
        </div>

        <div className="lp-quotes">
          <h3 className="display lp-h3">Auditors liked the verification</h3>
          <div className="lp-quote">
            <p>“Proving an investigation step without exposing underlying evidence.”</p>
            <span className="mono lp-quote-attr">— Zeel Chauhan · 5/5 · Very Easy</span>
          </div>
          <div className="lp-quote">
            <p>“Immutable forensic trail was the strongest part.”</p>
            <span className="mono lp-quote-attr">— Samara · 5/5 · Very Easy</span>
          </div>
          <div className="lp-quote">
            <p>“Audit page made verification concept easy to understand.”</p>
            <span className="mono lp-quote-attr">— Rashi Achaliya · 5/5 · Very Easy</span>
          </div>
          <div className="lp-quotes-foot">
            <Link to="/about" className="lp-link-strong">Privacy model →</Link>
            <span className="lp-muted-sm">Private amounts are black bars, not blur — see the 3-batch worked example on About.</span>
          </div>
        </div>
      </section>

      {/* MINI WORKED EXAMPLE */}
      <section className="ledger lp-example">
        <div className="ledger-head">
          <span className="ledger-title">Worked example — case #07</span>
          <Link to="/about" className="mono lp-example-link">Full table on About →</Link>
        </div>
        <div className="lp-example-grid">
          <div className="lp-example-head mono">Step · What you enter · What goes on-chain</div>
          {[
            { s: 'Open #07', priv: '—', pub: 'case #07 ACTIVE · total 0' },
            { s: 'Batch 1', priv: '████ a1', pub: 'total = a1 → Verified' },
            { s: 'Batch 2', priv: '████ a2', pub: 'total = a1+a2 → Verified' },
            { s: 'Disclose', priv: '(optional)', pub: 'lastDisclosed = total' },
            { s: 'Close', priv: '—', pub: 'phase CLOSED → Sealed' },
          ].map((r) => (
            <div key={r.s} className="lp-example-row">
              <span className="lp-example-step">{r.s}</span>
              <span>{r.priv.includes('████') ? <span className="redacted redacted-sm">{r.priv}</span> : <span className="lp-muted-sm">{r.priv}</span>}</span>
              <span className="mono lp-example-pub">{r.pub}</span>
            </div>
          ))}
        </div>
        <div className="lp-example-foot mono">
          Observer sees only <code className="mono">total = 42</code> (example) and <code className="mono">phase = CLOSED</code>. Never <span className="redacted redacted-sm">a1</span> <span className="redacted redacted-sm">a2</span> or who logged them.
        </div>
      </section>

      {/* FAQ */}
      <section className="lp-section">
        <h2 className="display lp-h2">FAQ — what stays private</h2>
        <div className="lp-faq">
          {[
            { q: 'What is public vs. redacted?', a: 'Public on-chain: per-case total, lastDisclosed (only if you call disclose), phase, eventCount, aggregate, and the allowlist Merkle root. Private forever: every step amount and member secret — only their persistentHash commitments are stored. The ZK proof shows total\' = total + amount without revealing amount.' },
            { q: 'Do I need a wallet to verify?', a: 'No. Open /audit with no wallet and no secrets. It reads live Preprod ledger state from the Midnight indexer and checks aggregate == Σ totals, allowlist root, phase order, and the disclosure receipt book. Share a case ID with anyone and they can verify.' },
            { q: 'Does demo touch the chain?', a: 'No — demo is an in-memory mock ledger, gated by the header toggle or the Launch page. Enable it to try every action wallet-free; refresh resets it. Real proofs need Lace or 1AM on Preprod plus tNIGHT from the faucet.' },
            { q: 'What does “redacted” mean here?', a: 'A black bar — not blur, not hash. The amount never leaves your device, never lands on-chain, and never renders in the UI or API. The green Verified stamp means the proof checked out; the amount stayed redacted.' },
          ].map((item, i) => (
            <div key={item.q} className={`lp-faq-item ${faqOpen === i ? 'lp-faq-open' : ''}`}>
              <button className="lp-faq-q" onClick={() => setFaqOpen(faqOpen === i ? null : i)} aria-expanded={faqOpen === i}>
                <span>{item.q}</span>
                <span className="lp-faq-chevron" aria-hidden>{faqOpen === i ? '−' : '+'}</span>
              </button>
              {faqOpen === i && <div className="lp-faq-a">{item.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA — ink */}
      <section className="lp-cta">
        <div>
          <h3 className="display lp-cta-title">Try it with zero setup.</h3>
          <p className="lp-cta-sub">Mock ledger in demo, real proofs on Preprod with Lace / 1AM + tNIGHT.</p>
        </div>
        <div className="lp-cta-actions">
          <button className="btn lp-cta-btn-light" onClick={goDemo}>{isDemo ? 'Open demo dashboard' : 'Try demo — no wallet'}</button>
          <Link to="/dashboard" className="btn lp-cta-btn-ghost">Launch app</Link>
          <a href="https://faucet.preprod.midnight.network" target="_blank" rel="noreferrer" className="btn lp-cta-btn-ghost-subtle">Get tNIGHT ↗</a>
        </div>
      </section>
    </>
  );
}
