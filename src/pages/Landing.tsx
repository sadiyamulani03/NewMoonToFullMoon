import { Link } from 'react-router-dom';
import OnboardingOverlay from '../components/OnboardingOverlay';

export default function Landing() {
  return (
    <>
      <OnboardingOverlay />

      {/* Hero — product identity in ~10 seconds */}
      <section className="landing-hero">
        <div className="landing-hero-copy">
          <span className="eyebrow">Private forensics · Midnight Preprod · Live</span>
          <h1>Prove work happened.<br />Keep evidence private.</h1>
          <p className="landing-lead">
            MidnightTrace is a privacy-first forensic ledger on the Midnight Network. Each investigation step
            becomes a <strong>zero-knowledge proof</strong> — the chain verifies <em>that</em> you counted, without ever seeing{' '}
            <em>what</em> you counted.
          </p>
          <p className="privacy-note" style={{ marginTop: '12px' }}>
            Your hidden <code>amount</code> stays on your device as a private witness — the proof shows{' '}
            <code>total&apos; = total + amount</code> while <code>amount</code> never goes on-chain.{' '}
            <Link to="/about#glossary" style={{ fontWeight: 700 }} title="Glossary: Zero-knowledge proof">
              What is a ZK proof? →
            </Link>
          </p>

          <div className="landing-ctas">
            <Link className="btn btn-primary" to="/dashboard">
              Launch App
            </Link>
            <Link className="btn btn-secondary" to="/audit">
              Verify publicly — no wallet
            </Link>
            <Link className="btn btn-ghost" to="/about">
              How it works
            </Link>
          </div>

          <p className="landing-subcta">
            Don&apos;t want to connect a wallet?{' '}
            <Link to="/audit" style={{ fontWeight: 700 }}>
              Audit any case without secrets
            </Link>
            .
          </p>
        </div>

        <div className="landing-hero-visual" aria-hidden="true">
          <div className="shield-card">
            <div className="shield-icon">
              <svg viewBox="0 0 64 64" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M32 8 L52 16 V32 C52 42 44 50 32 56 C20 50 12 42 12 32 V16 Z" />
                <path d="M22 30 L29 37 L42 24" strokeWidth="2" />
                <circle cx="32" cy="14" r="2" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <div className="shield-meta">
              <span className="info-label">ZK proof</span>
              <strong>total&apos; = total + amount</strong>
              <small>verified on-chain · amount stays private</small>
            </div>
            <div className="shield-labels">
              <span className="shield-label label-public">PUBLIC: total</span>
              <span className="shield-label label-private">PRIVATE: amount</span>
            </div>
          </div>
          <div className="demo-preview" aria-hidden="true">
            <div className="demo-preview-head">
              <span className="demo-dot" style={{ background: '#ff5f57' }} />
              <span className="demo-dot" style={{ background: '#febc2e' }} />
              <span className="demo-dot" style={{ background: '#28c840' }} />
              <span style={{ marginLeft: 8 }}>midnighttrace · preprod · live</span>
            </div>
            <div className="demo-lines">
              <span className="demo-line"><span className="demo-muted">$</span> openCase(7) <span className="demo-ok">✓ sealed on-chain</span></span>
              <span className="demo-line"><span className="demo-muted">$</span> logStep(7, <span className="label-private" style={{ padding: '1px 6px', borderRadius: 999 }}>hidden</span>) <span className="demo-ok">✓ ZK proof</span></span>
              <span className="demo-line"><span className="demo-muted">$</span> logStep(7, <span className="label-private" style={{ padding: '1px 6px', borderRadius: 999 }}>hidden</span>) <span className="demo-ok">✓ ZK proof</span></span>
              <span className="demo-line"><span className="demo-muted">$</span> audit — <span className="demo-ok">aggregate ✓ all checks passed</span></span>
            </div>
          </div>
          <div className="trust-strip">
            <span>Selective disclosure</span>
            <span>Private allowlist</span>
            <span>Public audit</span>
          </div>
        </div>
      </section>

      {/* Problem / Solution — side-by-side, not wall of text */}
      <section className="landing-split">
        <div className="card landing-split-card">
          <p className="section-head">
            <span className="section-no">01</span> The problem
          </p>
          <h3>Forensics needs proof without exposure.</h3>
          <p className="muted-text">
            Investigators must attest they counted, traced, or verified evidence — but sharing raw amounts leaks
            sensitive data. Most chains publish everything.
          </p>
        </div>
        <div className="card landing-split-card card-accent">
          <p className="section-head">
            <span className="section-no">02</span> The solution
          </p>
          <h3>Prove it in zero knowledge. Disclose only when you choose.</h3>
          <p className="muted-text">
            MidnightTrace keeps step amounts private by default. Only the totals you explicitly disclose become
            public — and every total is backed by a cryptographic proof.
          </p>
        </div>
      </section>

      {/* How it works — 4 steps */}
      <section className="card">
        <p className="section-head">
          <span className="section-no">03</span> How it works — 30 seconds
        </p>
        <ol className="steps-grid">
          <li className="step">
            <span className="step-no">1</span>
            <strong>Open a case</strong>
            <p>Give it a number and title. The case ID goes on-chain; metadata stays off-chain.</p>
          </li>
          <li className="step">
            <span className="step-no">2</span>
            <strong>Log a hidden step</strong>
            <p>Enter a private amount. Your wallet proves total&apos; = total + amount without revealing it.</p>
          </li>
          <li className="step">
            <span className="step-no">3</span>
            <strong>Disclose on your terms</strong>
            <p>Publish the running total only when you choose. Otherwise it stays private forever.</p>
          </li>
          <li className="step">
            <span className="step-no">4</span>
            <strong>Anyone can audit</strong>
            <p>Open the public Audit window — no wallet — and verify totals, aggregate, and allowlist.</p>
          </li>
        </ol>
      </section>

      {/* Privacy model — explicit */}
      <section className="card privacy-model-card">
        <p className="section-head">
          <span className="section-no">04</span> Privacy model
        </p>
        <div className="privacy-columns">
          <div className="privacy-col">
            <span className="info-label label-public">Public — on-chain</span>
            <ul>
              <li>Running <code>total</code> per case</li>
              <li>Disclosed totals (only if you call disclose)</li>
              <li>Case phase, event count, aggregate</li>
              <li>Allowlist membership root</li>
            </ul>
          </div>
          <div className="privacy-col">
            <span className="info-label label-private">Private — never on-chain</span>
            <ul>
              <li>Step <code>amount</code> witnesses</li>
              <li>Member secrets / identities</li>
              <li>Case descriptions (off-chain only)</li>
            </ul>
          </div>
          <div className="privacy-col">
            <span className="info-label" style={{ background: 'var(--ok-soft)', color: 'var(--ok)', borderColor: 'rgba(139,224,175,0.3)' }}>
              Proved in ZK
            </span>
            <ul>
              <li>total&apos; = total + hidden amount</li>
              <li>Caller is on the private allowlist</li>
              <li>Disclosed total matches hidden total</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Why Midnight — compact */}
      <section className="card">
        <p className="section-head">
          <span className="section-no">05</span> Why Midnight
        </p>
        <p className="muted-text">
          Midnight&apos;s Compact contracts keep witnesses private by default and require an explicit{' '}
          <code>disclose()</code> to publish anything. That gives MidnightTrace{' '}
          <strong>selective disclosure natively</strong> — verifiable without surveillance.
        </p>
        <div className="feature-pills" style={{ marginTop: '14px' }}>
          <span>Selective disclosure</span>
          <span>Private allowlist via commitments</span>
          <span>Chain-of-custody receipts</span>
          <span>Wallet-delegated proving</span>
        </div>
      </section>

      {/* Example scenario — concise */}
      <section className="card">
        <p className="section-head">
          <span className="section-no">06</span> Example — 3 hidden batches in case #7
        </p>
        <ol className="privacy-list">
          <li>
            Open <code>#7</code> with <code>openCase(7)</code>.
          </li>
          <li>
            Log three hidden steps — each a ZK proof; on-chain <code>total</code> becomes <code>a1+a2+a3</code>, but{' '}
            <code>a1, a2, a3</code> never appear on-chain.
          </li>
          <li>
            Optionally <code>discloseFinding(7)</code> to publish the total for auditors.
          </li>
          <li>
            <code>closeCase(7)</code> seals the case; the Audit window shows CLOSED and a verifiable fingerprint.
          </li>
        </ol>
        <p className="privacy-note">Try this flow on Cases → Case detail with your Preprod wallet.</p>
      </section>

      {/* Final CTA */}
      <section className="card cta-card">
        <div className="cta-copy">
          <h3>Try it in two minutes.</h3>
          <p className="muted-text">
            Install <strong>Lace</strong> or <strong>1AM</strong>, switch to <strong>Preprod</strong>, fund with tNIGHT
            at the faucet, then launch the app.
          </p>
        </div>
        <div className="quick-links">
          <Link className="btn btn-primary" to="/dashboard">
            Launch App
          </Link>
          <a className="btn btn-secondary" href="https://faucet.preprod.midnight.network" target="_blank" rel="noreferrer">
            Get tNIGHT
          </a>
          <Link className="btn btn-secondary" to="/audit">
            Audit window
          </Link>
        </div>
      </section>
    </>
  );
}
