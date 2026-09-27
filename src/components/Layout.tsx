import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useMidnightContext } from '../context/MidnightContext';
import { useDemo } from '../context/DemoContext';
import { useToast } from '../context/ToastContext';
import { GITHUB_URL } from '../config';
import { BrandMark } from './BrandMark';
import FaucetDrawer from './FaucetDrawer';
import { useScrolledPast } from '../hooks/useScrolledPast';

export default function Layout() {
  const { isConnected, walletInfo, walletState, connect } = useMidnightContext();
  const { isDemo, toggleDemo } = useDemo();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [faucetOpen, setFaucetOpen] = useState(false);
  const connecting = walletState.status === 'connecting';
  const scrolled = useScrolledPast(32);

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
    <div className="shell">
      <header className={`topbar${scrolled ? ' topbar-scrolled' : ''}`}>
        <div className="topbar-inner">
          <Link to="/dashboard" className="brand-link" aria-label="MidnightTrace workspace">
            <BrandMark size={38} />
            <span>
              <span className="brand-name">
                Midnight<em>Trace</em>
              </span>
              <span className="brand-kicker" style={{ display: 'block' }}>
                Evidence workspace · Preprod
              </span>
            </span>
          </Link>

          <nav className={`topnav ${mobileMenuOpen ? 'open' : ''}`} aria-label="Workspace">
            <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `topnav-link${isActive ? ' topnav-link-active' : ''}`}>
              Workspace
            </NavLink>
            <NavLink to="/cases" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `topnav-link${isActive ? ' topnav-link-active' : ''}`}>
              Cases
            </NavLink>
            <NavLink to="/new" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `topnav-link${isActive ? ' topnav-link-active' : ''}`}>
              New case
            </NavLink>
            <NavLink to="/audit" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `topnav-link${isActive ? ' topnav-link-active' : ''}`}>
              Auditor
            </NavLink>
            <NavLink to="/about" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `topnav-link${isActive ? ' topnav-link-active' : ''}`}>
              Guide
            </NavLink>
          </nav>

          <div className="topbar-right">
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
            ) : connecting ? (
              <button className="wallet-pill wallet-pill-connecting" disabled title="Check your wallet extension popup">
                <span className="spinner" style={{ width: 10, height: 10, borderWidth: 1.5 }} />
                Check wallet popup…
              </button>
            ) : (
              <button
                className="wallet-pill"
                onClick={() => void connect()}
                title={walletState.status === 'error' ? `Last error: ${(walletState as {status:'error';message:string}).message} — click to retry` : 'Connect Midnight wallet'}
              >
                {walletState.status === 'error' || walletState.status === 'rejected' ? 'Retry connect' : 'Connect'}
              </button>
            )}

            <button
              className="marketing-menu-toggle"
              aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={String(mobileMenuOpen) as 'true' | 'false'}
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <FaucetDrawer open={faucetOpen} onClose={() => setFaucetOpen(false)} />

      {isDemo && (
        <div className="context-ribbon" role="status">
          <div className="context-ribbon-inner">
            <span>
              <strong style={{ color: 'var(--verify)' }}>Demo ledger in memory</strong>
              <span style={{ color: 'var(--muted)' }}> — every action works wallet-free. Refresh resets. Real chain untouched.</span>
            </span>
            <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={handleToggleDemo}>
              Exit demo
            </button>
          </div>
        </div>
      )}

      <main className="workspace">
        <Outlet />
      </main>

      <footer className="shell-foot">
        <div className="shell-foot-inner">
          <span className="mono" style={{ fontSize: '0.72rem' }}>
            MidnightTrace · v1.1 · Preprod · private amounts never leave your device
          </span>
          <span style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link to="/audit">Audit</Link>
            <Link to="/about">Privacy model</Link>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <Link to="/">Marketing site</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
