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
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 14px', alignItems: 'center' }}>
          <span className="mono" style={{ fontSize: '0.72rem' }}>MidnightTrace · Evidence ledger on Midnight · Private amounts stay redacted</span>
          <span className="mono" style={{ fontSize: '0.66rem', padding: '2px 7px', border: '1px solid var(--line)', borderRadius: 999, background: 'white' }}>v1.1 · Preprod · df5e05…29501</span>
        </div>
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, fontSize: '0.78rem' }}>
          <a href="/audit">Audit — no wallet</a> · <a href="/about">Privacy model</a> · <a href="https://github.com/sadiyamulani03/NewMoonToFullMoon" target="_blank" rel="noreferrer">GitHub</a> · <a href="https://x.com/Midnight__Trace" target="_blank" rel="noreferrer">X</a> · <a href="https://drive.google.com/file/d/1tlD3U0O164p6D210Y_KyC3-TF1Ku_ZJA/view?usp=sharing" target="_blank" rel="noreferrer">Demo video</a>
        </div>
      </footer>
    </div>
  );
}
