import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useMidnightContext } from '../context/MidnightContext';

function truncateAddr(addr: string): string {
  if (addr.length <= 20) return addr;
  return `${addr.slice(0, 14)}…${addr.slice(-6)}`;
}

export default function MarketingLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const { isConnected, walletInfo } = useMidnightContext();

  return (
    <div className="marketing-shell">
      <header className="marketing-header">
        <div className="marketing-header-inner">
          <Link to="/" className="brand-wrap marketing-brand" onClick={closeMenu}>
            <div className="brand-mark">M</div>
            <div className="brand-block">
              <p className="kicker" style={{ marginBottom: 2 }}>Midnight Network · preprod</p>
              <span className="marketing-brand-title">MidnightTrace</span>
            </div>
          </Link>

          <nav className={`marketing-nav${menuOpen ? ' marketing-nav-open' : ''}`} aria-label="Main navigation">
            <NavLink to="/" end className={({ isActive }) => `nav-link marketing-nav-link${isActive ? ' nav-link-active' : ''}`} onClick={closeMenu}>
              Home
            </NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link marketing-nav-link${isActive ? ' nav-link-active' : ''}`} onClick={closeMenu}>
              Dashboard
            </NavLink>
            <NavLink to="/cases" className={({ isActive }) => `nav-link marketing-nav-link${isActive ? ' nav-link-active' : ''}`} onClick={closeMenu}>
              Cases
            </NavLink>
            <NavLink to="/audit" className={({ isActive }) => `nav-link marketing-nav-link${isActive ? ' nav-link-active' : ''}`} onClick={closeMenu}>
              Audit
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => `nav-link marketing-nav-link${isActive ? ' nav-link-active' : ''}`} onClick={closeMenu}>
              About
            </NavLink>
          </nav>

          <div className="marketing-header-actions">
            {isConnected && walletInfo ? (
              <span className="wallet-pill header-wallet-pill" title={walletInfo.address}>
                <span className="wallet-addr">{truncateAddr(walletInfo.address)}</span>
                <span className="network-badge">{walletInfo.networkId}</span>
                <span className="status-pill status-live" style={{ padding: '3px 8px', fontSize: '0.6rem' }}>● Connected</span>
              </span>
            ) : (
              <Link to="/dashboard" className="btn btn-primary marketing-cta">Launch App</Link>
            )}
            <button
              className="menu-toggle marketing-menu-toggle"
              aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              type="button"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <main className="container marketing-container">
        <Outlet />
      </main>

      <footer className="footer">
        <p>Proofs are generated locally — your private step never reaches the chain or this screen.</p>
        <p style={{ marginTop: '8px', fontSize: '0.78rem', opacity: 0.9 }}>
          <a href="https://midnighttrace.vercel.app" target="_blank" rel="noreferrer">Live</a>
          {' · '}
          <a href="/audit">Audit</a>
          {' · '}
          <a href="/about">How it works</a>
          {' · '}
          <a href="https://x.com/Midnight__Trace" target="_blank" rel="noreferrer">X @Midnight__Trace</a>
          {' · '}
          <a href="https://github.com/sadiyamulani03/NewMoonToFullMoon" target="_blank" rel="noreferrer">GitHub</a>
          <span style={{ marginLeft: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', opacity: 0.7 }}>v1.0 · Preprod · MidnightTrace</span>
        </p>
      </footer>
    </div>
  );
}
