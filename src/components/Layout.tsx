import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useMidnightContext } from '../context/MidnightContext';
import { useDemo } from '../context/DemoContext';

function truncateAddr(addr: string): string {
  if (addr.length <= 20) return addr;
  return `${addr.slice(0, 14)}…${addr.slice(-6)}`;
}

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const { isConnected, walletInfo } = useMidnightContext();
  const { isDemo, toggleDemo } = useDemo();

  return (
    <div className={`app-shell ${collapsed ? 'app-shell-collapsed' : ''}`}>
      <header className="header">
        <div className="header-content">
          <div className="header-bar">
            <div className="brand-wrap">
              <div className="brand-mark">M</div>
              {!collapsed && (
                <div className="brand-block">
                  <p className="kicker">Midnight Network · preprod</p>
                  <h1>MidnightTrace</h1>
                </div>
              )}
            </div>
            <div className="header-actions">
              <button
                className="collapse-toggle"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                onClick={() => setCollapsed((v) => !v)}
                type="button"
                title={collapsed ? 'Expand' : 'Collapse sidebar — free more space'}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '0.85rem',
                }}
              >
                {collapsed ? '›' : '‹'}
              </button>
              <button
                className="menu-toggle"
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

          {/* Demo toggle — always visible */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className={`btn ${isDemo ? 'btn-primary' : 'btn-secondary'}`}
              onClick={toggleDemo}
              style={{ flex: 1, padding: '8px 10px', fontSize: '0.78rem', borderRadius: 8 }}
              title="Toggle mock ledger — no wallet needed"
            >
              {isDemo ? '● Demo on' : 'Try demo'}
            </button>
            {!collapsed && <span className="muted-text" style={{ fontSize: '0.7rem', alignSelf: 'center', opacity: 0.7 }}>{isDemo ? 'not on-chain' : 'no wallet needed'}</span>}
          </div>

          {isConnected && walletInfo && (
            <div className="header-wallet header-wallet-stack" aria-label="Wallet connection status">
              <span className="wallet-pill header-wallet-pill" title={walletInfo.address}>
                <span className="wallet-addr" aria-label="Connected wallet address">
                  {truncateAddr(walletInfo.address)}
                </span>
                {!collapsed && (
                  <>
                    <span className="network-badge" aria-label="Network">
                      {walletInfo.networkId}
                    </span>
                    <span className="status-pill status-live" style={{ padding: '3px 8px', fontSize: '0.6rem' }}>
                      ● Connected
                    </span>
                  </>
                )}
              </span>
            </div>
          )}

          <nav className={`nav${menuOpen ? ' nav-open' : ''} ${collapsed ? 'nav-collapsed' : ''}`} aria-label="Main navigation">
            <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`} onClick={closeMenu} title="Home">
              <svg className="nav-icon" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 2.5 12 7l-4 4.5-4-4.5 4-4.5Z" />
              </svg>
              {!collapsed && 'Home'}
            </NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`} onClick={closeMenu} title="Dashboard">
              <svg className="nav-icon" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M2 7.5 8 2.5 14 7.5V14H9.5v-3.5h-3V14H2z" />
              </svg>
              {!collapsed && 'Dashboard'}
            </NavLink>
            <NavLink to="/cases" className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`} onClick={closeMenu} title="Cases">
              <svg className="nav-icon" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M1.5 3h4l1.5 1.5h7.5V13a1 1 0 0 1-1 1H1.5a1 1 0 0 1-1-1z" />
              </svg>
              {!collapsed && 'Cases'}
            </NavLink>
            <NavLink to="/new" className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`} onClick={closeMenu} title="New case">
              <svg className="nav-icon" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 2.5v11M2.5 8h11" />
              </svg>
              {!collapsed && 'New case'}
            </NavLink>
            <NavLink to="/audit" className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`} onClick={closeMenu} title="Audit">
              <svg className="nav-icon" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 2.5h10V8a5 5 0 0 1-5 5 5 5 0 0 1-5-5z" />
                <path d="M5.5 8.5 7 10l3.5-3.5" />
              </svg>
              {!collapsed && 'Audit'}
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`} onClick={closeMenu} title="About">
              <svg className="nav-icon" viewBox="0 0 16 16" aria-hidden="true">
                <circle cx="8" cy="8" r="6" />
                <path d="M8 7.5v4" />
                <path d="M8 4.75v.25" />
              </svg>
              {!collapsed && 'About'}
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="container">
        <Outlet />
      </main>

      <footer className="footer">
        <p>Proofs are generated locally — your private step never reaches the chain or this screen. {isDemo && <span style={{ color: '#8be0af' }}>● Demo — not on-chain (in-memory)</span>}</p>
        <p style={{ marginTop: '8px', fontSize: '0.78rem', opacity: 0.9 }}>
          <a href="https://midnighttrace-2mzhy6bsd-sadiyamulani03s-projects.vercel.app" target="_blank" rel="noreferrer">Live</a>
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
