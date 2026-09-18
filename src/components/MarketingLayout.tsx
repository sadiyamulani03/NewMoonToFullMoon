import { NavLink, Outlet, Link } from 'react-router-dom';
import { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { useMidnightContext } from '../context/MidnightContext';
import { GITHUB_URL, DEMO_VIDEO_URL } from '../config';
import { BrandMark } from './BrandMark';

export default function MarketingLayout() {
  const { isDemo, toggleDemo } = useDemo();
  const { walletState, isConnected, walletInfo, connect } = useMidnightContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const isConnecting = walletState.status === 'connecting';
  const isIdle = walletState.status === 'idle';
  return (
    <div className="marketing-shell">
      <div className="marketing-announce">
        <span>MidnightTrace is live on Preprod — private evidence, public proof.</span>
        <Link to="/audit">Verify a case with no wallet →</Link>
      </div>
      <header className="marketing-header">
        <div className="marketing-header-inner">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
            <BrandMark size={36} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--night-paper)', letterSpacing: '-0.02em' }}>
              Midnight<span style={{ color: '#F4C770' }}>Trace</span>
            </span>
          </Link>
          <nav className={`marketing-nav-center ${menuOpen ? 'open' : ''}`} aria-label="Primary">
            <a href="/#product" className="marketing-nav-link" onClick={() => setMenuOpen(false)}>Product</a>
            <a href="/#how-it-works" className="marketing-nav-link" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="/#privacy" className="marketing-nav-link" onClick={() => setMenuOpen(false)}>Privacy</a>
            <NavLink to="/audit" className={({ isActive }) => `marketing-nav-link${isActive ? ' marketing-nav-link-active' : ''}`} onClick={() => setMenuOpen(false)}>Audit</NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `marketing-nav-link${isActive ? ' marketing-nav-link-active' : ''}`} onClick={() => setMenuOpen(false)}>Workspace</NavLink>
          </nav>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
            <button className="marketing-menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>
              <span />
              <span />
              <span />
            </button>
            <button className={`btn ${isDemo ? 'btn-verify' : 'btn-ghost'}`} onClick={toggleDemo} style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
              {isDemo ? '● Demo' : 'Demo'}
            </button>
            {isConnected && walletInfo ? (
              <span className="mono" style={{ fontSize: '0.72rem', color: '#7BD9A5', border: '1px solid rgba(123,217,165,0.35)', background: 'rgba(123,217,165,0.08)', padding: '8px 13px', borderRadius: 999, fontWeight: 700 }}>● {walletInfo.address.slice(0,6)}…{walletInfo.address.slice(-4)}</span>
            ) : (
              <button className="btn btn-primary" onClick={() => void connect()} disabled={isConnecting || isIdle} style={{ padding: '9px 18px', fontSize: '0.86rem', fontWeight: 700, opacity: isIdle ? 0.6 : 1 }}>
                {isConnecting ? 'Connecting…' : isIdle ? 'Initializing…' : 'Connect wallet'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="marketing-container">
        {isDemo && (
          <div style={{ marginTop: 20, display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', border: '1px dashed rgba(123,217,165,0.4)', borderRadius: 12, padding: '12px 16px', background: 'rgba(123,217,165,0.06)', fontSize: '0.86rem' }}>
            <span><strong style={{ color: '#7BD9A5' }}>Demo Mode</strong> <span style={{ color: 'var(--night-muted)' }}>Explore without a wallet — mock ledger.</span></span>
            <button className="btn btn-secondary" onClick={toggleDemo} style={{ padding: '7px 12px', fontSize: '0.8rem' }}>Exit demo</button>
          </div>
        )}
        <Outlet />
      </main>

      <footer className="footer">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 14px', alignItems: 'center' }}>
          <span className="mono" style={{ fontSize: '0.72rem' }}>MidnightTrace · Evidence ledger on Midnight · Private amounts stay redacted</span>
          <span className="mono" style={{ fontSize: '0.66rem', padding: '2px 7px', border: '1px solid var(--night-line)', borderRadius: 999, color: 'var(--night-muted)' }}>v1.1 · Preprod</span>
        </div>
        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, alignItems: 'center', fontSize: '0.78rem' }}>
          <a href="/audit">Audit — no wallet</a> · <a href="/about">Privacy model</a> · <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a> · <a href={DEMO_VIDEO_URL} target="_blank" rel="noreferrer">Demo video</a>
        </div>
      </footer>
    </div>
  );
}
