import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useDemo } from '../context/DemoContext';
import { useMidnightContext } from '../context/MidnightContext';
import { useToast } from '../context/ToastContext';
import FaucetDrawer from '../components/FaucetDrawer';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface PinItem {
  id: string;
  category: 'defi' | 'circuit' | 'bridge' | 'treasury' | 'allowlist';
  categoryLabel: string;
  title: string;
  desc: string;
  badge: string;
  badgeType: 'emerald' | 'cyan' | 'amber' | 'indigo';
  icon: string;
  gradientClass: string;
  block: string;
  tags: string[];
  metrics: { label: string; val: string }[];
}

const PIN_ITEMS: PinItem[] = [
  {
    id: 'demo-7-multisig',
    category: 'defi',
    categoryLabel: 'DeFi Exploit Trace',
    title: 'Flash Loan Pool Drain Invariant #0042',
    desc: 'Tracing 4 AMM pools where liquidity imbalances occurred without leaking constituent wallet amounts.',
    badge: '● Active Proving',
    badgeType: 'emerald',
    icon: '⚡',
    gradientClass: 'pin-banner-gradient-1',
    block: '#412,398',
    tags: ['ZK-SNARK', 'AMM Invariant', 'Redacted Witness'],
    metrics: [
      { label: 'Inserts', val: '12 Steps' },
      { label: 'Disclosed', val: '1,420 tNIGHT' }
    ]
  },
  {
    id: 'circuit-01',
    category: 'circuit',
    categoryLabel: 'Compact ZK Circuit',
    title: 'Non-Interactive Ledger Arithmetic Verifier',
    desc: 'Mathematical constraint verifying total\' = total + amount strictly within browser client memory.',
    badge: '● Math Enforced',
    badgeType: 'cyan',
    icon: '⬢',
    gradientClass: 'pin-banner-gradient-4',
    block: 'Circuit v1.1',
    tags: ['Compact Lang', 'Zero Knowledge', 'Merkle Proof'],
    metrics: [
      { label: 'Prover Time', val: '480ms' },
      { label: 'Leakage', val: '0 Bytes' }
    ]
  },
  {
    id: 'demo-2-bridge',
    category: 'bridge',
    categoryLabel: 'Cross-Chain Bridge',
    title: 'Sovereign Bridge Settlement Reconciliation',
    desc: 'Verifying deposit-mint equivalence between L1 rollup contracts and Midnight sovereign execution layers.',
    badge: '● Verified Chain',
    badgeType: 'emerald',
    icon: '🌉',
    gradientClass: 'pin-banner-gradient-2',
    block: '#409,112',
    tags: ['Cross-Chain', 'Deposit Quorum', 'Preprod'],
    metrics: [
      { label: 'Inserts', val: '8 Steps' },
      { label: 'Disclosed', val: '840 tNIGHT' }
    ]
  },
  {
    id: 'demo-1-exchange',
    category: 'treasury',
    categoryLabel: 'Treasury Audit',
    title: 'Institutional Proof of Reserves Solvency',
    desc: 'Cryptographic attestation proving non-negative liabilities without exposing private client deposit balances.',
    badge: '● Sealed Dossier',
    badgeType: 'amber',
    icon: '🏛️',
    gradientClass: 'pin-banner-gradient-3',
    block: '#398,540',
    tags: ['Solvency', 'Liabilities Proof', 'Institutional'],
    metrics: [
      { label: 'Inserts', val: '19 Steps' },
      { label: 'Disclosed', val: '4,650 tNIGHT' }
    ]
  },
  {
    id: 'allowlist-tree',
    category: 'allowlist',
    categoryLabel: 'Identity & Access',
    title: 'Merkle Tree Membership Privacy Engine',
    desc: 'Investigator secrets hashed and committed to Merkle tree root. Identity never stored or broadcast.',
    badge: '● Cryptographic Root',
    badgeType: 'cyan',
    icon: '🔑',
    gradientClass: 'pin-banner-gradient-1',
    block: 'Root Pinned',
    tags: ['Merkle Tree', 'Access Control', 'Private Key'],
    metrics: [
      { label: 'Members', val: '3 Active' },
      { label: 'Privacy', val: '100% Shielded' }
    ]
  },
  {
    id: 'demo-3-mixer',
    category: 'defi',
    categoryLabel: 'Forensic Taint',
    title: 'Selective Disclosure Arbiter Statement',
    desc: 'Court-admissible compliance dossier revealing aggregated damage claims while shielding proprietary telemetry.',
    badge: '● Ready to Audit',
    badgeType: 'emerald',
    icon: '📜',
    gradientClass: 'pin-banner-gradient-2',
    block: '#411,890',
    tags: ['Compliance', 'Court Proof', 'Zero Gas'],
    metrics: [
      { label: 'Auditable', val: 'Wallet-Free' },
      { label: 'Total', val: '920 tNIGHT' }
    ]
  }
];

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
  const [activeTab, setActiveTab] = useState(0);
  const demoCase = mockCases.find((c) => c.id.startsWith('demo-7')) ?? mockCases[0];
  const [faucetOpen, setFaucetOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const scrollRevealRef = useScrollReveal();

  // Pinterest-Style Discovery Filter & Search State
  const [discoveryFilter, setDiscoveryFilter] = useState<string>('all');
  const [discoverySearch, setDiscoverySearch] = useState<string>('');

  const filteredPins = useMemo(() => {
    return PIN_ITEMS.filter((item) => {
      const matchCat = discoveryFilter === 'all' || item.category === discoveryFilter;
      const q = discoverySearch.trim().toLowerCase();
      const matchSearch = !q || item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q) || item.tags.some(t => t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [discoveryFilter, discoverySearch]);

  // Local live timeline entries for real-time interactive demo feel
  const [liveRows, setLiveRows] = useState([
    { id: '1', t: 'OPENED', d: 'Matter #0042 initialized — Status ACTIVE', s: 'Open', c: '#94A3B8' },
    { id: '2', t: 'EVIDENCE', d: 'Private step logged — Amount redacted, ZK-Proof valid', s: 'Verified', c: '#10B981' },
    { id: '3', t: 'EVIDENCE', d: 'Private step logged — Amount redacted, ZK-Proof valid', s: 'Verified', c: '#10B981' },
    { id: '4', t: 'DISCLOSED', d: 'Selective disclosure published by case investigator', s: 'Public', c: '#F59E0B' },
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
          d: `Private step logged — Amount [${n}] redacted, ZK-Proof valid`,
          s: 'Verified',
          c: '#10B981'
        }
      ]);

      setTimeout(() => setDemoMsg(null), 3500);
    }, 600);
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
        d: `Selective disclosure recorded — Ledger reflects new aggregate total`,
        s: 'Public',
        c: '#F59E0B'
      }
    ]);
    setTimeout(() => setDemoMsg(null), 3000);
  };

  return (
    <div ref={scrollRevealRef as React.Ref<HTMLDivElement>}>
      {/* FLAGSHIP HERO SECTION WITH FLOATING INTERACTIVE PINS */}
      <section className="mk-hero hero-float-container" aria-label="Hero">
        {/* Left Floating Interactive Card */}
        <div className="hero-floating-badge hero-badge-left" onClick={goDemo} title="Click to test live witness prover">
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', display: 'grid', placeItems: 'center', fontSize: '1.2rem' }}>
            🔒
          </div>
          <div>
            <div className="mono" style={{ fontSize: '0.64rem', color: '#10B981', fontWeight: 700 }}>
              ZK WITNESS SHIELDED
            </div>
            <div style={{ fontSize: '0.84rem', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>+250 tNIGHT</span>
              <span className="badge badge-verify" style={{ fontSize: '0.58rem', padding: '2px 6px' }}>✓ Verified</span>
            </div>
          </div>
        </div>

        {/* Right Floating Interactive Card */}
        <div className="hero-floating-badge hero-badge-right" onClick={() => navigate('/audit')} title="Click to open public audit console">
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.4)', display: 'grid', placeItems: 'center', fontSize: '1.2rem' }}>
            🛡️
          </div>
          <div>
            <div className="mono" style={{ fontSize: '0.64rem', color: '#38BDF8', fontWeight: 700 }}>
              INVARIANT QUORUM
            </div>
            <div style={{ fontSize: '0.84rem', color: '#fff', fontWeight: 600 }}>
              Σ Totals == Aggregate · 100%
            </div>
          </div>
        </div>

        <span className="neon-badge neon-badge-emerald anim-fade-up">
          <span className="pulse-dot" />
          MIDNIGHT PREPROD · ZERO-KNOWLEDGE FORENSICS DESK
        </span>
        
        <h1 className="mk-title anim-fade-up anim-stagger-1">
          Prove what happened. <br />
          <span className="hero-gradient-text">Keep evidence shielded.</span>
        </h1>
        
        <p className="mk-sub anim-fade-up anim-stagger-2">
          The visual discovery and verification suite for sensitive blockchain investigations.
          Amounts stay encrypted on your device — the Midnight ledger carries only zero-knowledge proofs.
          Anyone can independently audit. Zero records leaked.
        </p>

        <div className="mk-ctas anim-fade-up anim-stagger-3">
          <button className="btn btn-primary" onClick={goDemo} style={{ padding: '14px 28px', fontSize: '1rem', fontWeight: 700 }}>
            Launch Live Demo →
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => { if (isConnected) navigate('/dashboard'); else void connect(); }}
            style={{ padding: '14px 24px', fontSize: '1rem' }}
          >
            {isConnected ? 'Open Workspace' : 'Connect Lace Wallet'}
          </button>
          <button className="btn btn-ghost" onClick={() => setFaucetOpen(true)} style={{ padding: '14px 20px', fontSize: '0.94rem' }}>
            Setup in 60s ↗
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

      {/* PINTEREST-INSPIRED VISUAL DISCOVERY BOARD SECTION */}
      <section className="mk-section" aria-label="Forensic Discovery Pinboard" data-reveal>
        <div className="mk-section-head" style={{ textAlign: 'center', alignItems: 'center' }}>
          <span className="bento-tag">Visual Investigation Board</span>
          <h2>Explore Active Cryptographic Vectors</h2>
          <p style={{ marginInline: 'auto' }}>
            Discover active investigation matters, zero-knowledge circuits, and audit proofs. Filter by category or search vectors below.
          </p>
        </div>

        {/* Pinterest-Style Search & Tag Filter Bar */}
        <div className="discovery-bar-wrapper">
          <div className="discovery-search-box">
            <span style={{ fontSize: '1.2rem', opacity: 0.8 }}>🔍</span>
            <input
              className="discovery-search-input"
              placeholder="Search dossiers, circuits, bridge anomalies, or ZK tags..."
              value={discoverySearch}
              onChange={(e) => setDiscoverySearch(e.target.value)}
              aria-label="Search discovery pinboard"
            />
            {discoverySearch && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setDiscoverySearch('')}
                style={{ padding: '2px 8px', fontSize: '0.75rem' }}
              >
                Clear
              </button>
            )}
          </div>

          <div className="discovery-tags-row">
            {[
              { id: 'all', label: 'All Vectors' },
              { id: 'defi', label: '⚡ DeFi Exploits' },
              { id: 'circuit', label: '⬢ ZK Circuits' },
              { id: 'bridge', label: '🌉 Cross-Chain' },
              { id: 'treasury', label: '🏛️ Treasury Audits' },
              { id: 'allowlist', label: '🔑 Allowlist Identity' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`discovery-tag ${discoveryFilter === cat.id ? 'active' : ''}`}
                onClick={() => setDiscoveryFilter(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pinterest-Style Masonry Pinboard Grid */}
        <div className="pinboard-grid">
          {filteredPins.map((pin) => (
            <div
              key={pin.id}
              className="pin-card"
              onClick={() => {
                if (pin.id.startsWith('demo-')) {
                  navigate(`/cases/${pin.id}`);
                } else if (pin.id.startsWith('circuit')) {
                  setActiveTab(1);
                  document.getElementById('terminal-simulator')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/audit');
                }
              }}
            >
              {/* Visual Banner Header */}
              <div className={`pin-banner ${pin.gradientClass}`}>
                <div className="pin-banner-pattern" />
                <span className="pin-banner-icon">{pin.icon}</span>
                <span className="pin-banner-chip">{pin.categoryLabel}</span>
                <span className={`neon-badge neon-badge-${pin.badgeType} pin-banner-badge`} style={{ fontSize: '0.62rem' }}>
                  {pin.badge}
                </span>
              </div>

              {/* Pin Body Content */}
              <div className="pin-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--cyan)', fontWeight: 700 }}>
                    BLOCK {pin.block}
                  </span>
                  <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    PREPROD
                  </span>
                </div>

                <h3 className="pin-title">{pin.title}</h3>
                <p className="pin-desc">{pin.desc}</p>

                <div className="pin-tags-list">
                  {pin.tags.map((tag) => (
                    <span key={tag} className="pin-tag-badge">#{tag}</span>
                  ))}
                </div>

                <div className="pin-footer">
                  <div style={{ display: 'flex', gap: 14 }}>
                    {pin.metrics.map((m) => (
                      <div key={m.label} style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{m.label}</span>
                        <strong className="mono" style={{ fontSize: '0.8rem', color: '#fff' }}>{m.val}</strong>
                      </div>
                    ))}
                  </div>

                  <button className="pin-quick-btn" onClick={(e) => {
                    e.stopPropagation();
                    if (pin.id.startsWith('demo-')) navigate(`/cases/${pin.id}`);
                    else navigate('/audit');
                  }}>
                    Inspect →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FULL-WIDTH INTERACTIVE TERMINAL SIMULATOR */}
      <section id="how-it-works" aria-label="Product visualization" style={{ scrollMarginTop: 90 }}>
        <div className="mk-section-head" style={{ textAlign: 'center', marginBottom: 12 }}>
          <span className="bento-tag">Interactive Proving Studio</span>
          <h2>Test Client-Side Zero-Knowledge Proving</h2>
          <p style={{ marginInline: 'auto' }}>
            Run the actual proof generation circuit right in your browser. Watch sensitive input stay local while the ledger verifies the result.
          </p>
        </div>

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
                BLOCK: #412,398
              </span>
              <span className="neon-badge neon-badge-emerald" style={{ padding: '3px 9px', fontSize: '0.62rem' }}>
                ● PREPROD SYNCED
              </span>
            </div>
          </div>

          {/* Terminal Body */}
          <div className="mk-viz-body">
            {/* Left Rail — Interactive View Switcher */}
            <div className="mk-viz-rail">
              <div className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8 }}>
                Forensic Console
              </div>
              {[
                { title: 'Evidence Timeline', badge: 'Live' },
                { title: 'ZK Circuit Pipeline', badge: 'Math' },
                { title: 'Selective Disclosure', badge: 'Access' },
                { title: 'Public Audit Log', badge: 'Zero-Wallet' }
              ].map((t, i) => (
                <div
                  key={t.title}
                  className={`mk-viz-railitem${activeTab === i ? ' on' : ''}`}
                  onClick={() => setActiveTab(i)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span>{t.title}</span>
                  <span className="mono" style={{ fontSize: '0.58rem', opacity: activeTab === i ? 1 : 0.6, background: activeTab === i ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)', padding: '1px 6px', borderRadius: 4 }}>
                    {t.badge}
                  </span>
                </div>
              ))}
              <div style={{ marginTop: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
                <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>Ledger Aggregate:</span> {mockLedger.aggregate.toString()}<br />
                <span style={{ color: 'var(--text-secondary)' }}>Indexed Cases:</span> {mockLedger.cases.length}
              </div>
            </div>

            {/* Main Interactive Work Area */}
            <div className="mk-viz-main">
              {activeTab === 0 && (
                <>
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
                        Preset Evidence Value (Witness):
                      </span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {['10', '25', '50', '100', '250'].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setDemoAmt(val)}
                            style={{
                              background: demoAmt === val ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                              border: demoAmt === val ? '1px solid var(--cyan)' : '1px solid var(--border-subtle)',
                              color: demoAmt === val ? 'var(--cyan)' : 'var(--text-secondary)',
                              borderRadius: 6,
                              padding: '3px 9px',
                              fontSize: '0.72rem',
                              fontFamily: 'var(--font-mono)',
                              cursor: 'pointer',
                              fontWeight: demoAmt === val ? 700 : 500
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
                </>
              )}

              {activeTab === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="mono" style={{ fontSize: '0.64rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--cyan)', fontWeight: 700 }}>
                    Compact Zero-Knowledge Circuit Flow
                  </div>
                  <div className="circuit-visualizer" style={{ marginTop: 0 }}>
                    <div className="circuit-step-box">
                      <span className="circuit-step-num">Step 01</span>
                      <strong className="circuit-step-title">Client Witness</strong>
                      <p className="circuit-step-body">Amount: <span className="redacted redacted-sm">hidden</span></p>
                      <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Kept strictly in browser RAM</div>
                    </div>
                    <div className="circuit-step-box" style={{ borderColor: 'rgba(56, 189, 248, 0.4)' }}>
                      <span className="circuit-step-num" style={{ color: 'var(--cyan)' }}>Step 02</span>
                      <strong className="circuit-step-title">Compact ZK Circuit</strong>
                      <p className="circuit-step-body">total&apos; = total + amount</p>
                      <div className="mono" style={{ fontSize: '0.7rem', color: '#38BDF8' }}>Generates non-interactive SNARK</div>
                    </div>
                    <div className="circuit-step-box" style={{ borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                      <span className="circuit-step-num" style={{ color: '#10B981' }}>Step 03</span>
                      <strong className="circuit-step-title">Midnight Preprod</strong>
                      <p className="circuit-step-body">Ledger registers increment</p>
                      <div className="mono" style={{ fontSize: '0.7rem', color: '#10B981' }}>Zero transaction details exposed</div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '12px 16px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    <strong>Mathematical Invariant:</strong> The Midnight network verifies that arithmetic was computed accurately against an authorized investigator key without observing the operands.
                  </div>
                </div>
              )}

              {activeTab === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="mono" style={{ fontSize: '0.64rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--amber)', fontWeight: 700 }}>
                    Selective Disclosure Deck
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Selective disclosure allows the case investigator to reveal the running total to judges, regulators, or clients without exposing any individual evidence steps.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
                    <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                      <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>CURRENT DISCLOSED TOTAL</div>
                      <div className="display" style={{ fontSize: '1.6rem', color: '#F59E0B', marginTop: 4 }}>42 tNIGHT</div>
                      <span className="badge badge-pending" style={{ marginTop: 8 }}>Public on Ledger</span>
                    </div>
                    <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                      <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>INDIVIDUAL STEPS</div>
                      <div className="display" style={{ fontSize: '1.6rem', color: '#94A3B8', marginTop: 4 }}>[REDACTED]</div>
                      <span className="badge badge-verify" style={{ marginTop: 8 }}>Never Transmitted</span>
                    </div>
                  </div>
                  <button className="btn btn-secondary" onClick={handleDisclose} style={{ alignSelf: 'flex-start' }}>
                    Publish Updated Disclosure Statement →
                  </button>
                </div>
              )}

              {activeTab === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="mono" style={{ fontSize: '0.64rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#10B981', fontWeight: 700 }}>
                    Universal Invariant Auditor
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Every user, compliance officer, or member of the public can independently audit the state of the Midnight contract without connecting a wallet or paying gas fees.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 8, fontSize: '0.84rem' }}>
                      <span>Σ Case Totals = On-Chain Aggregate</span>
                      <strong style={{ color: '#10B981' }}>✓ 100% Consistent</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 8, fontSize: '0.84rem' }}>
                      <span>Allowlist Merkle Root Pinned</span>
                      <strong style={{ color: '#10B981' }}>✓ Verified</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 8, fontSize: '0.84rem' }}>
                      <span>Phase Ordering (ACTIVE → CLOSED)</span>
                      <strong style={{ color: '#10B981' }}>✓ Strictly Enforced</strong>
                    </div>
                  </div>
                  <Link to="/audit" className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.84rem' }}>
                    Open Public Audit Console →
                  </Link>
                </div>
              )}
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

              <Link to="/audit" style={{ color: '#38BDF8', fontWeight: 700, fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 'auto' }}>
                Verify On-Chain Audit →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4 CORE STARTUP PILLARS — BENTO GRID */}
      <section id="privacy" className="mk-section" aria-label="Platform Architecture" style={{ scrollMarginTop: 90 }}>
        <div className="mk-section-head">
          <span className="bento-tag">Zero-Knowledge Architecture</span>
          <h2>Engineered for confidential compliance.</h2>
          <p>
            Standard blockchains leak transaction volumes and participant identities. MidnightTrace combines client-side zero-knowledge proofs with the Midnight Network to eliminate evidence leakage.
          </p>
        </div>

        <div className="bento-grid">
          <div className="bento-card bento-card-8">
            <div className="bento-icon-badge" style={{ color: '#10B981' }}>🛡️</div>
            <span className="bento-tag" style={{ color: '#10B981' }}>01 / Core Shield</span>
            <h3 className="bento-title">Client-Side Witness Isolation</h3>
            <p className="bento-desc">
              All transaction values, private finding parameters, and investigator notes are compiled into private zero-knowledge witnesses in your browser&apos;s isolated memory space. Not a single byte of sensitive evidence is dispatched to an RPC node or block explorer.
            </p>
            <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span className="neon-badge neon-badge-emerald">100% Local Witness</span>
              <span className="neon-badge neon-badge-cyan">Sub-Second Proofs</span>
              <span className="neon-badge neon-badge-amber">Zero RPC Exposure</span>
            </div>
          </div>

          <div className="bento-card bento-card-4">
            <div className="bento-icon-badge" style={{ color: '#38BDF8' }}>⚡</div>
            <span className="bento-tag">02 / Execution</span>
            <h3 className="bento-title">Compact ZK Circuits</h3>
            <p className="bento-desc">
              Written in Midnight&apos;s Compact smart contract language. State transitions are verified by succinct cryptographic proofs rather than public re-execution.
            </p>
          </div>

          <div className="bento-card bento-card-4">
            <div className="bento-icon-badge" style={{ color: '#F59E0B' }}>🔑</div>
            <span className="bento-tag" style={{ color: '#F59E0B' }}>03 / Governance</span>
            <h3 className="bento-title">Selective Disclosure</h3>
            <p className="bento-desc">
              Retain absolute sovereignty over when and how much finding data is published to counterparties, arbiters, or regulatory bodies.
            </p>
          </div>

          <div className="bento-card bento-card-8">
            <div className="bento-icon-badge" style={{ color: '#818CF8' }}>🌐</div>
            <span className="bento-tag" style={{ color: '#818CF8' }}>04 / Universal Access</span>
            <h3 className="bento-title">Wallet-Free Public Audit Console</h3>
            <p className="bento-desc">
              External stakeholders, courts, and independent auditors can inspect on-chain ledger state directly at <Link to="/audit">/audit</Link>. No crypto wallet required, no gas fees, no friction. Cryptographic proofs speak for themselves.
            </p>
            <div style={{ marginTop: 20 }}>
              <Link to="/audit" className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '0.86rem' }}>
                Open Public Audit Console →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* EDITORIAL PROBLEM VS OUTCOME COMPARISON */}
      <section id="product" className="mk-section">
        <div className="mk-section-head">
          <span className="bento-tag" style={{ color: '#F43F5E' }}>Comparative Analysis</span>
          <h2>Evidence that does not leak when verified.</h2>
          <p>
            Traditional audit logs require handing over full constituent records. MidnightTrace keeps sensitive transaction amounts hidden while mathematically proving the ledger total.
          </p>
        </div>

        <div className="mk-compare">
          <div className="mk-compare-old">
            <span className="mono" style={{ fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#F43F5E', fontWeight: 700 }}>
              Traditional Forensics — Vulnerable & Exposed
            </span>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.55rem', color: '#fff' }}>
              Verification requires total disclosure
            </h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 14, color: 'var(--text-secondary)', fontSize: '0.94rem' }}>
              <li>✗ Raw transaction values shared over unencrypted email and PDFs</li>
              <li>✗ Auditing an aggregate balance requires disclosing every evidence item</li>
              <li>✗ Custody logs rely on institutional trust rather than math</li>
              <li>✗ Public audit impossible without granting complete data access</li>
            </ul>
          </div>

          <div className="mk-compare-new">
            <span className="mono" style={{ fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#10B981', fontWeight: 700 }}>
              With MidnightTrace — Shielded by Zero-Knowledge
            </span>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.55rem', color: '#fff' }}>
              Private inputs, cryptographic truth
            </h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 14, fontSize: '0.94rem', color: 'var(--text-secondary)' }}>
              <li>✓ Private witness stays on your local device — permanently redacted</li>
              <li>✓ Every forensic increment carries a verifiable zero-knowledge proof</li>
              <li>✓ Chain of custody anchored immutably on Midnight Preprod</li>
              <li>✓ Independent auditors verify invariants at /audit without a wallet</li>
            </ul>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 10 }}>
              <Link to="/dashboard" className="btn btn-primary">
                Open Workspace →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE FAQ ACCORDION */}
      <section className="mk-section" aria-label="Frequently Asked Questions" data-reveal>
        <div className="mk-section-head">
          <span className="bento-tag">Frequently Asked Questions</span>
          <h2>Everything you need to know.</h2>
          <p>
            Clear answers about MidnightTrace, zero-knowledge privacy, and our Midnight Preprod implementation.
          </p>
        </div>

        <div className="faq-grid">
          {[
            {
              q: 'How does MidnightTrace guarantee that raw transaction values never leak?',
              a: 'All evidence calculations happen client-side using Zero-Knowledge proofs. When you log a step, your browser computes a cryptographic witness and compiles a succinct proof verifying that total\' = total + amount. Only the proof and cryptographic commitments touch the Midnight ledger; the raw operand remains strictly in your device RAM.'
            },
            {
              q: 'Can external auditors verify my investigation without a crypto wallet?',
              a: 'Yes. MidnightTrace provides a dedicated, wallet-free public verification portal at /audit. Anyone with a web browser can query the on-chain contract state to verify that the aggregate total matches the sum of case totals, that the allowlist Merkle root is securely pinned, and that phase ordering rules were respected.'
            },
            {
              q: 'What is the Demo mode and do I need testnet tokens to try it?',
              a: 'Demo mode is a full-featured in-memory sandbox that lets you test all forensic workflows — opening cases, logging redacted findings, generating ZK witness simulations, and disclosing totals — instantly with zero wallet extensions and zero tokens.'
            },
            {
              q: 'How does Selective Disclosure work in practice?',
              a: 'During an active investigation, all finding steps remain private. When you are ready to produce a formal report for a court or client, you can publish a selective disclosure transaction that records the confirmed running total on the public ledger without exposing the individual granular steps.'
            },
            {
              q: 'What blockchain network does MidnightTrace run on?',
              a: 'MidnightTrace is built specifically for the Midnight Network (currently live on Preprod testnet), leveraging Midnight\'s native Compact smart contracts and privacy-preserving ledger architecture.'
            }
          ].map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className={`faq-card ${isOpen ? 'open' : ''}`}>
                <button
                  className="faq-trigger"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  aria-expanded={String(isOpen) as 'true' | 'false'}
                >
                  <span>{item.q}</span>
                  <span className="faq-chevron">+</span>
                </button>
                <div className="faq-body-wrapper">
                  <div className="faq-body-inner">
                    <div className="faq-body">
                      {item.a}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HIGH-IMPACT FINAL CTA BAND */}
      <section className="mk-cta-band">
        <div>
          <h2>Ready to audit with zero leaks?</h2>
          <p>
            Experience privacy-preserving blockchain forensics on Midnight. Zero setup required to explore the sandbox.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button onClick={goDemo} className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '0.96rem' }}>
            Open Demo Sandbox →
          </button>
          <Link to="/audit" className="btn btn-secondary" style={{ padding: '14px 24px', fontSize: '0.96rem' }}>
            Audit Public Ledger
          </Link>
        </div>
      </section>
    </div>
  );
}
