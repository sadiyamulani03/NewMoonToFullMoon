import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { useMidnightContext } from '../context/MidnightContext';
import { useToast } from '../context/ToastContext';
import FaucetDrawer from '../components/FaucetDrawer';

export default function Landing() {
  const { isDemo, enableDemo, mockCases, mockLedger, demoLogStep, demoDisclose } = useDemo();
  const { isConnected, connect } = useMidnightContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const goDemo = () => {
    if (!isDemo) enableDemo();
    toast('✓ Launching interactive demo sandbox', 'info');
    navigate('/dashboard');
  };
  
  const [demoAmt, setDemoAmt] = useState('25');
  const [demoMsg, setDemoMsg] = useState<string | null>(null);
  const [isProving, setIsProving] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const demoCase = mockCases.find((c) => c.id.startsWith('demo-7')) ?? mockCases[0];
  const [faucetOpen, setFaucetOpen] = useState(false);

  // Local live timeline entries for real-time interactive demo feel
  const [liveRows, setLiveRows] = useState([
    { id: '1', t: 'OPENED', d: 'Case #0042 initialized — Phase ACTIVE', s: 'Open', c: '#94A3B8' },
    { id: '2', t: 'EVIDENCE', d: 'Private step logged — Amount redacted, ZK-Proof valid', s: 'Verified', c: '#10B981' },
    { id: '3', t: 'EVIDENCE', d: 'Private step logged — Amount redacted, ZK-Proof valid', s: 'Verified', c: '#10B981' },
    { id: '4', t: 'DISCLOSED', d: 'Selective disclosure published by case owner', s: 'Public', c: '#F59E0B' },
  ]);

  const handleLogStep = () => {
    const n = BigInt(parseInt(demoAmt || '0', 10) || 0);
    if (n <= 0n) { setDemoMsg('Enter amount > 0'); return; }
    if (n > 65535n) { setDemoMsg('Max 65,535 per step'); return; }

    setIsProving(true);
    setDemoMsg('Generating ZK witness proof...');
    
    setTimeout(() => {
      demoLogStep(7n, n, demoCase.id);
      setIsProving(false);
      setDemoMsg(`Proof verified on-chain: Total incremented by [REDACTED] ✓`);
      toast(`✓ ZK Witness generated — amount redacted, total verified`, 'success');
      
      setLiveRows(prev => [
        ...prev,
        {
          id: String(Date.now()),
          t: 'EVIDENCE',
          d: `Private step logged — Amount redacted, ZK-Proof valid`,
          s: 'Verified',
          c: '#10B981'
        }
      ]);

      setTimeout(() => setDemoMsg(null), 3500);
    }, 500);
  };

  const handleDisclose = () => {
    const n = BigInt(parseInt(demoAmt || '0', 10) || 0);
    demoDisclose(7n, n || 42n, demoCase.id);
    setDemoMsg(`Disclosed to public ledger → lastDisclosed updated ✓`);
    toast('✓ Disclosed running total to public ledger', 'info');
    setLiveRows(prev => [
      ...prev,
      {
        id: String(Date.now()),
        t: 'DISCLOSED',
        d: `Selective disclosure recorded — Ledger reflects new total`,
        s: 'Public',
        c: '#F59E0B'
      }
    ]);
    setTimeout(() => setDemoMsg(null), 3000);
  };

  return (
    <>
      {/* FLAGSHIP HERO SECTION */}
      <section className="mk-hero" aria-label="Hero">
        <span className="mk-eyebrow">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 10px #10B981' }} />
          LIVE ON MIDNIGHT PREPROD · ZERO-KNOWLEDGE FORENSICS
        </span>
        
        <h1 className="mk-title">
          Prove what matters. <em>Keep evidence shielded.</em>
        </h1>
        
        <p className="mk-sub">
          MidnightTrace is the privacy-first compliance workspace for sensitive blockchain investigations.
          Amounts stay redacted on your device — the ledger carries only verified cryptographic proofs.
          Anyone can audit. Zero evidence leaked.
        </p>

        <div className="mk-ctas">
          <button className="btn btn-primary" onClick={goDemo} style={{ padding: '14px 28px', fontSize: '0.96rem', fontWeight: 700 }}>
            Launch Live Demo →
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => { if (isConnected) navigate('/dashboard'); else void connect(); }}
            style={{ padding: '14px 24px', fontSize: '0.96rem' }}
          >
            {isConnected ? 'Open Workspace' : 'Connect Wallet'}
          </button>
          <button className="btn btn-ghost" onClick={() => setFaucetOpen(true)} style={{ padding: '14px 20px', fontSize: '0.92rem' }}>
            Setup in 60s →
          </button>
        </div>

        <div className="mk-proofline">
          <span><strong style={{ color: '#10B981' }}>✓</strong> Compact Smart Contracts</span>
          <span>·</span>
          <span><strong style={{ color: '#38BDF8' }}>✓</strong> Private Witness ZK-Proofs</span>
          <span>·</span>
          <span><strong style={{ color: '#F59E0B' }}>✓</strong> Selective Disclosure</span>
          <span>·</span>
          <span><strong style={{ color: '#818CF8' }}>✓</strong> Wallet-Free Public Audit</span>
        </div>

        <FaucetDrawer open={faucetOpen} onClose={() => setFaucetOpen(false)} />
      </section>

      {/* FULL-WIDTH INTERACTIVE TERMINAL SIMULATOR */}
      <section aria-label="Product visualization">
        <div className="mk-viz">
          {/* Top Window Bar */}
          <div className="mk-viz-bar">
            <span className="mk-viz-dot" style={{ background: '#ff5f56' }} />
            <span className="mk-viz-dot" style={{ background: '#ffbd2e' }} />
            <span className="mk-viz-dot" style={{ background: '#27c93f' }} />
            <span className="mono" style={{ marginLeft: 14, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              midnighttrace.desk / evidence-suite — Dossier #0042
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="mono" style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                BLOCK: 412,398
              </span>
              <span className="mono" style={{ fontSize: '0.64rem', color: '#10B981', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '3px 10px', borderRadius: 999, fontWeight: 700 }}>
                ● PREPROD SYNCED
              </span>
            </div>
          </div>

          {/* Terminal Body */}
          <div className="mk-viz-body">
            {/* Left Rail — Navigation Tabs */}
            <div className="mk-viz-rail">
              <div className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8 }}>
                Forensic Views
              </div>
              {['Case Overview', 'Evidence Timeline', 'ZK Circuit Decks', 'Public Audit Log'].map((t, i) => (
                <div
                  key={t}
                  className={`mk-viz-railitem${activeTab === i ? ' on' : ''}`}
                  onClick={() => setActiveTab(i)}
                >
                  {t}
                </div>
              ))}
              <div style={{ marginTop: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
                <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>Ledger Aggregate:</span> {mockLedger.aggregate.toString()}<br />
                <span style={{ color: 'var(--text-secondary)' }}>Cases Indexed:</span> {mockLedger.cases.length}
              </div>
            </div>

            {/* Main Interactive Work Area */}
            <div className="mk-viz-main">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="mono" style={{ fontSize: '0.64rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Cryptographic Timeline · Case #0042
                </div>
                <span className="mono" style={{ fontSize: '0.66rem', color: '#10B981' }}>
                  {liveRows.length} Verified Proofs Filed
                </span>
              </div>

              {/* Live Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 220, overflowY: 'auto' }}>
                {liveRows.map((r) => (
                  <div key={r.id} className="mk-viz-row">
                    <span className="mono" style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      {r.t}
                    </span>
                    <span style={{ color: '#fff', fontSize: '0.86rem' }}>{r.d}</span>
                    <span className="mono" style={{ fontSize: '0.64rem', color: r.c, border: `1px solid ${r.c}55`, background: `${r.c}15`, padding: '3px 9px', borderRadius: 999, fontWeight: 700 }}>
                      {r.s}
                    </span>
                  </div>
                ))}
              </div>

              {/* Interactive Simulator Deck */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Step Amount (Private Witness):
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['10', '25', '50', '100'].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setDemoAmt(val)}
                        style={{
                          background: demoAmt === val ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          border: demoAmt === val ? '1px solid var(--cyan)' : '1px solid var(--border-subtle)',
                          color: demoAmt === val ? 'var(--cyan)' : 'var(--text-secondary)',
                          borderRadius: 6,
                          padding: '3px 8px',
                          fontSize: '0.72rem',
                          fontFamily: 'var(--font-mono)',
                          cursor: 'pointer'
                        }}
                      >
                        +{val}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    className="input"
                    value={demoAmt}
                    onChange={e => setDemoAmt(e.target.value.replace(/[^0-9]/g,''))}
                    placeholder="amount"
                    inputMode="numeric"
                    maxLength={5}
                    aria-label="Demo private amount"
                    style={{ maxWidth: 110, padding: '9px 12px', fontSize: '0.88rem' }}
                  />
                  <button
                    className="btn btn-primary"
                    style={{ padding: '9px 18px', fontSize: '0.84rem' }}
                    onClick={handleLogStep}
                    disabled={isProving}
                  >
                    {isProving ? 'Proving ZK Circuit…' : 'Log Hidden Finding'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '9px 16px', fontSize: '0.84rem' }}
                    onClick={handleDisclose}
                  >
                    Disclose Total
                  </button>
                </div>

                {demoMsg && (
                  <div role="status" style={{ fontSize: '0.84rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                    {demoMsg}
                  </div>
                )}
              </div>
            </div>

            {/* Right Telemetry Column */}
            <div className="mk-viz-side">
              <div>
                <div className="mono" style={{ fontSize: '0.64rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Private · On-Device Witness
                </div>
                <div style={{ marginTop: 8, padding: '12px 14px', background: '#020409', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 10, fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#94A3B8' }}>
                  <span className="redacted" style={{ color: 'transparent' }}>amount: {demoAmt}</span>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Never transmitted on-chain
                  </div>
                </div>
              </div>

              <div>
                <div className="mono" style={{ fontSize: '0.64rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#10B981', fontWeight: 700 }}>
                  Public · Preprod Ledger
                </div>
                <div style={{ marginTop: 8, padding: '12px 14px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: 10, fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#34D399', fontWeight: 700 }}>
                  total = 42 · VERIFIED
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 400, marginTop: 4 }}>
                    Compact state confirmed
                  </div>
                </div>
              </div>

              <div>
                <div className="mono" style={{ fontSize: '0.64rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Circuit Proof Attestation
                </div>
                <div className="mono" style={{ marginTop: 8, fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  total&apos; = total + amount<br />
                  <span style={{ color: '#10B981', fontWeight: 700 }}>✓ Compact Circuit Valid</span><br />
                  Block: #412,398
                </div>
              </div>

              <Link to="/audit" style={{ color: '#38BDF8', fontWeight: 700, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 'auto' }}>
                Verify On-Chain Audit →
              </Link>
            </div>
          </div>
        </div>

        <div className="mk-caption">
          Live Interactive Simulator — test private zero-knowledge proving above or open the complete investigation workspace.
        </div>
      </section>

      {/* REPUTATION & PLATFORM CAPABILITIES STRIP */}
      <div className="mk-logo-strip" aria-label="Assurances">
        <span>Zero-Knowledge Proofs</span>
        <span>·</span>
        <span>Compact Circuit Enforced</span>
        <span>·</span>
        <span>Selective Disclosure</span>
        <span>·</span>
        <span>Append-Only Immutability</span>
        <span>·</span>
        <span>Wallet-Free Public Audit</span>
      </div>

      {/* EDITORIAL PROBLEM VS OUTCOME COMPARISON */}
      <section id="product" className="mk-section">
        <div className="mk-section-head">
          <h2>Evidence that does not leak when verified.</h2>
          <p>
            Spreadsheets expose private identities. Paper logs cannot be audited remotely. MidnightTrace keeps sensitive amounts shielded while proving the exact calculation outcome on-chain.
          </p>
        </div>

        <div className="mk-compare">
          <div className="mk-compare-old">
            <span className="mono" style={{ fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#F43F5E', fontWeight: 700 }}>
              Traditional Forensics — Vulnerable
            </span>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.55rem', color: '#fff' }}>
              Verification means exposure
            </h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 12, color: 'var(--text-secondary)', fontSize: '0.94rem' }}>
              <li>✗ Raw transaction amounts leaked across email threads and PDFs</li>
              <li>✗ Auditing a balance requires disclosing every constituent evidence item</li>
              <li>✗ Chain of custody relies on institutional goodwill, not math</li>
              <li>✗ Public audit impossible without granting complete data access</li>
            </ul>
          </div>

          <div className="mk-compare-new">
            <span className="mono" style={{ fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#10B981', fontWeight: 700 }}>
              With MidnightTrace — Shielded by ZK
            </span>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.55rem', color: '#fff' }}>
              Private inputs, cryptographic truth
            </h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 12, fontSize: '0.94rem', color: 'var(--text-secondary)' }}>
              <li>✓ Private witness stays on your local device — forever redacted</li>
              <li>✓ Every forensic increment carries a verifiable zero-knowledge proof</li>
              <li>✓ Chain of custody anchored immutably on Midnight Preprod</li>
              <li>✓ Independent auditors verify invariants at /audit without a wallet</li>
            </ul>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              <Link to="/dashboard" className="btn btn-primary">
                Open Workspace →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — 4-STEP WORKFLOW */}
      <section id="how-it-works" className="mk-section">
        <div className="mk-section-head">
          <h2>From intake to audit in four moves.</h2>
          <p>
            No complex setup. Connect your wallet or explore in one-click demo mode. Open a dossier, log findings in zero-knowledge, and selectively disclose when you choose.
          </p>
        </div>

        <div className="mk-steps">
          {[
            {
              n: '01',
              t: 'Connect or Demo',
              d: 'Pair Lace or 1AM extension on Midnight Preprod — or click Demo mode for instant wallet-free testing.'
            },
            {
              n: '02',
              t: 'Open Case Dossier',
              d: 'Define the investigation matter. Only the numeric caseId and cryptographic metadata hash land on-chain.'
            },
            {
              n: '03',
              t: 'Log Step in ZK',
              d: 'Enter sensitive transaction amounts. They stay completely redacted while your browser proves the ledger increment.'
            },
            {
              n: '04',
              t: 'Disclose & Seal',
              d: 'Publish running totals selectively or close the case to lock totals. Public audit portal remains accessible forever.'
            },
          ].map((s) => (
            <div key={s.n} className="mk-step">
              <div className="mk-step-num">{s.n}</div>
              <strong style={{ color: '#fff', fontSize: '1.08rem' }}>{s.t}</strong>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRIVACY MODEL MATRIX */}
      <section id="privacy" className="mk-section">
        <div className="mk-section-head">
          <h2>Zero-knowledge architecture, verified.</h2>
          <p>
            Three cryptographic planes enforced by Compact smart contract rules — not marketing promises.
          </p>
        </div>

        <div className="mk-privacy">
          <div className="mk-privacy-card">
            <div className="mono" style={{ fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>
              🔒 Private Plane
            </div>
            <strong style={{ color: '#fff', fontSize: '1.1rem' }}>Witness · Amounts · Secrets</strong>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.65 }}>
              Step amounts and investigator secrets never touch the chain, indexer, or RPC node. They exist strictly in client memory.
            </p>
          </div>

          <div style={{ alignSelf: 'center', color: 'var(--cyan)', fontWeight: 700, fontSize: '1.4rem' }}>→</div>

          <div className="mk-privacy-card">
            <div className="mono" style={{ fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--cyan)' }}>
              ⬢ Circuit Prover
            </div>
            <strong style={{ color: '#fff', fontSize: '1.1rem' }}>total&apos; = total + amount</strong>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.65 }}>
              Merkle allowlist membership and arithmetic validity are compiled into a succinct zero-knowledge SNARK.
            </p>
          </div>

          <div style={{ alignSelf: 'center', color: '#10B981', fontWeight: 700, fontSize: '1.4rem' }}>→</div>

          <div className="mk-privacy-card accent">
            <div className="mono" style={{ fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, color: '#10B981' }}>
              ✓ Public Plane
            </div>
            <strong style={{ color: '#fff', fontSize: '1.1rem' }}>Totals · Phases · Audit Proofs</strong>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.65 }}>
              On-chain totals and proof receipts are universally verifiable at <Link to="/audit">/audit</Link> without passwords or keys.
            </p>
          </div>
        </div>
      </section>

      {/* LIVE LEDGER PREVIEW */}
      <section className="mk-section">
        <div className="mk-section-head">
          <h2>Active Preprod evidence ledger.</h2>
          <p>Live sample data below. Connect your wallet to inspect live contract state.</p>
        </div>

        <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 20, overflow: 'hidden', background: 'var(--bg-card)', backdropFilter: 'blur(16px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)', alignItems: 'center' }}>
            <span className="mono" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cyan)', fontWeight: 700 }}>
              Evidence Ledger · Aggregate {mockLedger.aggregate.toString()}
            </span>
            <Link to="/cases" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
              Browse All Cases →
            </Link>
          </div>

          {mockCases.slice(0, 4).map((c) => (
            <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 0.7fr 0.8fr auto', gap: 16, alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.92rem' }}>
              <span style={{ fontWeight: 600, color: '#fff' }}>{c.title}</span>
              <span className="mono" style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                {c.receipts[0]?.stepType ?? 'logStep'}
              </span>
              <span className="badge badge-verify">Verified</span>
              <span className="mono" style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                {new Date(c.createdAt).toLocaleDateString()}
              </span>
              <Link to={`/cases/${c.id}`} style={{ color: 'var(--cyan)', fontSize: '0.86rem', fontWeight: 600 }}>
                View Dossier →
              </Link>
            </div>
          ))}

          <div className="mono" style={{ padding: '14px 24px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Cryptographically anchored on Midnight Preprod.
          </div>
        </div>
      </section>

      {/* HIGH-IMPACT FINAL CTA BAND */}
      <section className="mk-cta-band">
        <div>
          <h2>Ready to audit with zero leaks?</h2>
          <p>
            Experience privacy-preserving blockchain forensics on Midnight. Zero setup required to explore.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Link to="/dashboard" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '0.96rem' }}>
            Open MidnightTrace →
          </Link>
          <Link to="/audit" className="btn btn-secondary" style={{ padding: '14px 24px', fontSize: '0.96rem' }}>
            Audit Public Ledger
          </Link>
        </div>
      </section>
    </>
  );
}
