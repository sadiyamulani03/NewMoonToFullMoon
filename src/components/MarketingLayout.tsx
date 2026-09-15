import { NavLink, Outlet, Link } from 'react-router-dom';
import { useDemo } from '../context/DemoContext';

export default function MarketingLayout() {
  const { isDemo, toggleDemo } = useDemo();
  return (
    <div className="marketing-shell">
      <header className="marketing-header">
        <div className="marketing-header-inner">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div className="rail-mark marketing-rail-mark">M</div>
            <div>
              <div className="rail-kicker" style={{ color: 'var(--muted)' }}>Midnight Network · Preprod</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-ink)', lineHeight: 1 }}>MidnightTrace</div>
            </div>
          </Link>

          <nav className="marketing-nav" aria-label="Primary">
            <NavLink to="/" end className={({ isActive }) => `marketing-nav-link${isActive ? ' marketing-nav-link-active' : ''}`}>Home</NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `marketing-nav-link${isActive ? ' marketing-nav-link-active' : ''}`}>Dashboard</NavLink>
            <NavLink to="/cases" className={({ isActive }) => `marketing-nav-link${isActive ? ' marketing-nav-link-active' : ''}`}>Cases</NavLink>
            <NavLink to="/audit" className={({ isActive }) => `marketing-nav-link${isActive ? ' marketing-nav-link-active' : ''}`}>Auditor</NavLink>
            <NavLink to="/about" className={({ isActive }) => `marketing-nav-link${isActive ? ' marketing-nav-link-active' : ''}`}>About</NavLink>
          </nav>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className={`btn ${isDemo ? 'btn-verify' : 'btn-cream'}`} onClick={toggleDemo} style={{ padding: '7px 12px', fontSize: '0.82rem' }}>
              {isDemo ? '● Demo on' : 'Try demo — no wallet'}
            </button>
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '7px 12px', fontSize: '0.82rem' }}>Launch app</Link>
          </div>
        </div>
      </header>

      <main className="marketing-container">
        {isDemo && (
          <div className="demo-bar" style={{ background: 'white', borderStyle: 'dashed' }}>
            <span><strong style={{ color: 'var(--verify)' }}>Demo — not on-chain</strong> <span style={{ color: 'var(--muted)' }}>Mock ledger in memory across all pages. Exit in header.</span></span>
            <button className="btn btn-ghost" onClick={toggleDemo} style={{ padding: '6px 10px' }}>Exit demo</button>
          </div>
        )}
        <Outlet />
      </main>

      <footer className="footer">
        <span className="mono" style={{ fontSize: '0.72rem' }}>MidnightTrace · Evidence ledger on Midnight · Private amounts stay redacted</span>
        {' · '}<a href="/audit">Audit</a> · <a href="/about">Privacy model</a> · <a href="https://x.com/Midnight__Trace" target="_blank" rel="noreferrer">X</a>
      </footer>
    </div>
  );
}
