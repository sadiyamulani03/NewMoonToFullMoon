import { NavLink, Outlet } from 'react-router-dom';
import { useMidnightContext } from '../context/MidnightContext';
import { useDemo } from '../context/DemoContext';
import { GITHUB_URL } from '../config';

function shortAddr(a: string): string {
  return a.length <= 18 ? a : `${a.slice(0, 10)}…${a.slice(-6)}`;
}

export default function Layout() {
  const { isConnected, walletInfo } = useMidnightContext();
  const { isDemo, toggleDemo } = useDemo();

  return (
    <div className="app-shell">
      <aside className="rail" aria-label="Primary">
        <div className="rail-head">
          <div className="rail-mark">M</div>
          <div>
            <span className="rail-kicker">Midnight Network · Preprod</span>
            <div className="rail-title">MidnightTrace</div>
          </div>
        </div>

        <div className="rail-demo">
          <span className="rail-demo-label">{isDemo ? 'Demo — not on-chain' : 'Reviewer mode'}</span>
          <button
            className={`btn btn-rail ${isDemo ? 'btn-rail-demo-on' : 'btn-rail-demo-off'}`}
            onClick={toggleDemo}
            title="Toggle mock ledger — no wallet, no tokens"
          >
            {isDemo ? '● Demo on' : 'Try demo — no wallet'}
          </button>
          <span style={{ fontSize: '0.7rem', color: 'var(--muted-ink)', lineHeight: 1.4 }}>
            {isDemo ? 'In-memory mock ledger. Every page works.' : 'Enable to use every action wallet-free.'}
          </span>
        </div>

        <nav className="rail-nav" aria-label="Sections">
          <NavLink to="/" end className={({ isActive }) => `rail-tab${isActive ? ' rail-tab-active' : ''}`} aria-label="Home — landing">
            <svg className="rail-icon" viewBox="0 0 16 16"><path d="M3 5.5h10v5H3z" /><path d="M3 3h4l1.5 1.5H13" /></svg>
            Home
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `rail-tab${isActive ? ' rail-tab-active' : ''}`}>
            <svg className="rail-icon" viewBox="0 0 16 16"><rect x="2.5" y="2.5" width="11" height="11" rx="1" /><path d="M5 8h6M8 5v6" /></svg>
            Dashboard
          </NavLink>
          <NavLink to="/cases" className={({ isActive }) => `rail-tab${isActive ? ' rail-tab-active' : ''}`}>
            <svg className="rail-icon" viewBox="0 0 16 16"><path d="M2.5 4.5h4l1 1H13.5v6H2.5z" /></svg>
            Cases
          </NavLink>
          <NavLink to="/new" className={({ isActive }) => `rail-tab${isActive ? ' rail-tab-active' : ''}`}>
            <svg className="rail-icon" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10" /></svg>
            New
          </NavLink>
          <NavLink to="/audit" className={({ isActive }) => `rail-tab${isActive ? ' rail-tab-active' : ''}`}>
            <svg className="rail-icon" viewBox="0 0 16 16"><path d="M3 3h10v4.5A5 5 0 0 1 8 13 5 5 0 0 1 3 7.5z" /><path d="M5.5 8.5 7 10l3.5-3.5" /></svg>
            Auditor
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `rail-tab${isActive ? ' rail-tab-active' : ''}`}>
            <svg className="rail-icon" viewBox="0 0 16 16"><circle cx="8" cy="8" r="5" /><path d="M8 7v3" /><path d="M8 5h.01" /></svg>
            About
          </NavLink>
        </nav>

        <div className="rail-foot">
          {isConnected && walletInfo ? (
            <div className="rail-wallet" title={walletInfo.address}>
              <div style={{ color: 'var(--verify)', fontWeight: 700, fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>● Connected · {walletInfo.networkId}</div>
              <div className="mono" style={{ marginTop: 4 }}>{shortAddr(walletInfo.address)}</div>
            </div>
          ) : (
            <div className="rail-wallet" style={{ opacity: 0.85 }}>
              No wallet · <span style={{ color: isDemo ? 'var(--verify)' : 'var(--muted-ink)' }}>{isDemo ? 'demo covers you' : 'or try demo'}</span>
            </div>
          )}
          <div style={{ marginTop: 10, fontSize: '0.7rem', color: 'var(--muted-ink)', lineHeight: 1.5 }}>
            Private amounts never leave your device.<br />Only totals are public.
          </div>
        </div>
      </aside>

      <main className="app-main">
        <div className="ledger-wrap">
          {isDemo && (
            <div className="demo-bar">
              <span><strong style={{ color: 'var(--verify)' }}>Demo — not on-chain</strong> <span style={{ color: 'var(--muted-ink)' }}>Mock ledger in memory. Refresh resets. Real chain untouched.</span></span>
              <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.78rem' }} onClick={toggleDemo}>Exit demo</button>
            </div>
          )}
          <Outlet />
        </div>
        <footer className="footer">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 12px', alignItems: 'center' }}>
            <span className="mono" style={{ fontSize: '0.72rem' }}>v1.1 · Preprod · MidnightTrace</span>
            <span>·</span><a href="/audit">Audit</a> · <a href="/about">How it works</a> · <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
          </div>
          {isDemo && <div className="mono" style={{ marginTop: 6, fontSize: '0.66rem', opacity: 0.85, lineHeight: 1.4, textAlign: 'center', color: 'var(--verify)' }}>● Demo — not on-chain</div>}
        </footer>
      </main>
    </div>
  );
}
