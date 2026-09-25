import { NavLink, Outlet, Link } from 'react-router-dom';
import { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { useMidnightContext } from '../context/MidnightContext';
import { useToast } from '../context/ToastContext';
import { GITHUB_URL, DEMO_VIDEO_URL } from '../config';
import { BrandMark } from './BrandMark';
import FaucetDrawer from './FaucetDrawer';

export default function MarketingLayout() {
  const { isDemo, toggleDemo } = useDemo();
  const { walletState, isConnected, walletInfo, connect } = useMidnightContext();
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [faucetOpen, setFaucetOpen] = useState(false);
  const isConnecting = walletState.status === 'connecting';

  const handleCopyAddress = async () => {
    if (!walletInfo?.address) return;
    try {
      await navigator.clipboard.writeText(walletInfo.address);
      toast(`Copied address: ${walletInfo.address.slice(0, 8)}…${walletInfo.address.slice(-4)}`, 'success');
    } catch {
      toast('Failed to copy address', 'warning');
    }
  };

  const handleToggleDemo = () => {
    toggleDemo();
    toast(
      !isDemo ? '✓ Demo sandbox active — zero-token mock ledger' : 'Switched back to live Preprod view',
      'info'
    );
  };

  return (
    <div className="marketing-shell">
      <div className="marketing-announce">
        <span>● Live on Midnight Preprod — Private evidence, zero-knowledge on-chain proofs.</span>
        <Link to="/audit">Verify contract without a wallet →</Link>
      </div>

      <header className="marketing-header">
        <div className="marketing-header-inner">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
            <BrandMark size={38} />
            <div style={{ lineHeight: 1.15 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', color: '#ffffff', letterSpacing: '-0.03em' }}>
                Midnight<span style={{ color: '#F59E0B' }}>Trace</span>
              </span>
              <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                ZK Forensics Desk
              </span>
            </div>
          </Link>

          <nav className={`marketing-nav-center ${menuOpen ? 'open' : ''}`} aria-label="Primary">
            <a href="/#product" className="marketing-nav-link" onClick={() => setMenuOpen(false)}>Product</a>
            <a href="/#how-it-works" className="marketing-nav-link" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="/#privacy" className="marketing-nav-link" onClick={() => setMenuOpen(false)}>Privacy</a>
            <NavLink to="/audit" className={({ isActive }) => `marketing-nav-link${isActive ? ' marketing-nav-link-active' : ''}`} onClick={() => setMenuOpen(false)}>Public Audit</NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `marketing-nav-link${isActive ? ' marketing-nav-link-active' : ''}`} onClick={() => setMenuOpen(false)}>Workspace</NavLink>
          </nav>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
            <button
              className="btn btn-ghost"
              onClick={() => setFaucetOpen(true)}
              title="Get Preprod wallet & tNIGHT faucet tokens"
              style={{ padding: '6px 10px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}
            >
              Faucet ↗
            </button>

            <span className="net-dot" title="Midnight Preprod">
              <i /> Preprod
            </span>

            <button className="marketing-menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>
              <span />
              <span />
              <span />
            </button>

            <button
              className={`demo-pill${isDemo ? ' demo-pill-on' : ''}`}
              onClick={handleToggleDemo}
              title="Toggle mock ledger — no wallet, no tokens"
            >
              {isDemo ? '● Demo on' : 'Try demo'}
            </button>

            {isConnected && walletInfo ? (
              <button
                className="wallet-pill wallet-pill-connected"
                onClick={handleCopyAddress}
                title="Click to copy full address"
                style={{ cursor: 'pointer' }}
              >
                ● {walletInfo.address.slice(0, 6)}…{walletInfo.address.slice(-4)}
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => void connect()}
                disabled={isConnecting}
                style={{ padding: '9px 18px', fontSize: '0.86rem', fontWeight: 700 }}
              >
                {isConnecting ? 'Connecting…' : 'Connect wallet'}
              </button>
            )}
          </div>
        </div>
      </header>

      <FaucetDrawer open={faucetOpen} onClose={() => setFaucetOpen(false)} />

      <main className="marketing-container">
        {isDemo && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: 14, padding: '12px 18px', background: 'rgba(16, 185, 129, 0.08)', fontSize: '0.88rem' }}>
            <span>
              <strong style={{ color: '#34D399' }}>● Demo Sandbox Active</strong>{' '}
              <span style={{ color: 'var(--text-secondary)' }}>Explore all workflows without a wallet — mock ledger with zero tokens.</span>
            </span>
            <button className="btn btn-secondary" onClick={toggleDemo} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>Exit demo</button>
          </div>
        )}
        <Outlet />
      </main>

      <footer className="footer">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 18px', alignItems: 'center' }}>
          <span className="mono" style={{ fontSize: '0.75rem' }}>MidnightTrace · Zero-Knowledge Evidence Ledger on Midnight · Private amounts stay redacted</span>
          <span className="mono" style={{ fontSize: '0.68rem', padding: '3px 9px', border: '1px solid var(--border-medium)', borderRadius: 999, color: 'var(--text-muted)' }}>v1.1 · Preprod</span>
        </div>
        <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14, alignItems: 'center', fontSize: '0.82rem' }}>
          <Link to="/audit">Public Audit (No Wallet)</Link> · <Link to="/about">Privacy Architecture</Link> · <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub Repository</a> · <a href={DEMO_VIDEO_URL} target="_blank" rel="noreferrer">Product Demo Video</a>
        </div>
      </footer>
    </div>
  );
}
