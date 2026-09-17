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
      <header className="marketing-header">
        <div className="marketing-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
              <BrandMark size={36} />
              <div>
                <div className="rail-kicker" style={{ color: 'var(--muted-ink)' }}>Midnight Network · Preprod</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.08rem', color: 'var(--paper)', lineHeight: 1, letterSpacing: '-0.02em' }}>MidnightTrace</div>
              </div>
            </Link>
            <nav className={`marketing-nav ${menuOpen ? 'marketing-nav-open' : ''}`} aria-label="Primary">
              <a href="/#product" className="marketing-nav-link" onClick={() => setMenuOpen(false)}>Product</a>
              <a href="/#how-it-works" className="marketing-nav-link" onClick={() => setMenuOpen(false)}>How it works</a>
              <a href="/#privacy" className="marketing-nav-link" onClick={() => setMenuOpen(false)}>Privacy</a>
              <NavLink to="/audit" className={({ isActive }) => `marketing-nav-link${isActive ? ' marketing-nav-link-active' : ''}`} onClick={() => setMenuOpen(false)}>Audit</NavLink>
            </nav>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
            <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)', border: '1px solid var(--line-ink)', padding: '6px 10px', borderRadius: 999, display: 'none' } as any}></span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem', color: 'var(--muted-ink)', fontFamily: 'var(--font-mono)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--verify)', display: 'inline-block' }} /> Preprod
            </div>
            <button className="marketing-menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>
              <span />
              <span />
              <span />
            </button>
            <button className={`btn ${isDemo ? 'btn-verify' : 'btn-ghost'}`} onClick={toggleDemo} style={{ padding: '7px 12px', fontSize: '0.80rem' }}>
              {isDemo ? '● Demo' : 'Demo'}
            </button>
            {isConnected && walletInfo ? (
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--verify)', border: '1px solid var(--verify-border)', background: 'var(--verify-soft)', padding: '7px 12px', borderRadius: 999, fontWeight: 700 }}>● {walletInfo.address.slice(0,6)}…{walletInfo.address.slice(-4)}</span>
            ) : (
              <button className="btn btn-primary" onClick={() => void connect()} disabled={isConnecting || isIdle} style={{ padding: '8px 16px', fontSize: '0.84rem', fontWeight: 700, opacity: isIdle ? 0.6 : 1 }}>
                {isConnecting ? 'Connecting…' : isIdle ? 'Initializing…' : 'Connect wallet'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="marketing-container">
        {isDemo && (
          <div className="demo-bar" style={{ borderStyle: 'dashed' }}>
            <span><strong style={{ color: 'var(--verify)' }}>Demo Mode</strong> <span style={{ color: 'var(--muted-ink)' }}>Explore without a wallet — mock ledger.</span></span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" onClick={toggleDemo} style={{ padding: '6px 10px', fontSize: '0.78rem' }}>Exit demo</button>
              <button className="btn btn-ghost" onClick={() => void connect()} style={{ padding: '6px 10px', fontSize: '0.78rem' }}>Connect wallet</button>
            </div>
          </div>
        )}
        <Outlet />
      </main>

      <footer className="footer">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 14px', alignItems: 'center' }}>
          <span className="mono" style={{ fontSize: '0.72rem' }}>MidnightTrace · Evidence ledger on Midnight · Private amounts stay redacted</span>
          <span className="mono" style={{ fontSize: '0.66rem', padding: '2px 7px', border: '1px solid var(--line-ink)', borderRadius: 999, background: 'rgba(255,255,255,0.02)', color: 'var(--muted-ink)' }}>v1.1 · Preprod · df5e05…29501</span>
        </div>
        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, alignItems: 'center', fontSize: '0.78rem' }}>
          <a href="/audit">Audit — no wallet</a> · <a href="/about" style={{ color: 'var(--blue)' }}>Privacy model</a> · <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a> · <a href={DEMO_VIDEO_URL} target="_blank" rel="noreferrer">Demo video</a>
        </div>
      </footer>
    </div>
  );
}
