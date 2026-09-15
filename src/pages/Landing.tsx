import { Link, useNavigate } from 'react-router-dom';
import OnboardingOverlay from '../components/OnboardingOverlay';
import { useDemo } from '../context/DemoContext';

export default function Landing() {
  const { isDemo, enableDemo } = useDemo();
  const navigate = useNavigate();

  const handleDemo = () => {
    if (!isDemo) enableDemo();
    navigate('/dashboard');
  };

  return (
    <>
      <OnboardingOverlay />

      {/* Section 1: Hero */}
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
            <button className="btn btn-secondary" onClick={handleDemo}>
              {isDemo ? 'Open demo dashboard' : 'Try demo — no wallet'}
            </button>
            <Link className="btn btn-ghost" to="/audit">
              Verify publicly — no wallet
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

      {/* Section 2: How it works — 4 steps */}
      <section className="card">
        <p className="section-head">
          <span className="section-no">01</span> How it works — 30 seconds
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

      {/* Section 3: Final CTA */}
      <section className="card cta-card">
        <div className="cta-copy">
          <h3>Try it in two minutes.</h3>
          <p className="muted-text">
            Install <strong>Lace</strong> or <strong>1AM</strong> on <strong>Preprod</strong> for real proofs, or run the demo with zero setup.
          </p>
        </div>
        <div className="quick-links">
          <button className="btn btn-primary" onClick={handleDemo}>
            {isDemo ? 'Open demo dashboard' : 'Try demo — no wallet'}
          </button>
          <Link className="btn btn-secondary" to="/dashboard">
            Launch App
          </Link>
          <a className="btn btn-secondary" href="https://faucet.preprod.midnight.network" target="_blank" rel="noreferrer">
            Get tNIGHT
          </a>
          <Link className="btn btn-ghost" to="/about">
            How it works
          </Link>
        </div>
      </section>
    </>
  );
}
