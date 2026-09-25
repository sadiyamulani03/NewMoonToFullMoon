import { NavLink, Outlet, Link } from 'react-router-dom';
import { useMidnightContext } from '../context/MidnightContext';
import { useDemo } from '../context/DemoContext';
import { GITHUB_URL } from '../config';
import { BrandMark } from './BrandMark';

export default function Layout() {
  const { isConnected, walletInfo, walletState, connect } = useMidnightContext();
  const { isDemo, toggleDemo } = useDemo();
  const connecting = walletState.status === 'connecting';

  return (
    <div className="shell">
      <header className="topbar">
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

          <nav className="topnav" aria-label="Workspace">
            <NavLink to="/dashboard" className={({ isActive }) => `topnav-link${isActive ? ' topnav-link-active' : ''}`}>
              Workspace
            </NavLink>
            <NavLink to="/cases" className={({ isActive }) => `topnav-link${isActive ? ' topnav-link-active' : ''}`}>
              Cases
            </NavLink>
            <NavLink to="/new" className={({ isActive }) => `topnav-link${isActive ? ' topnav-link-active' : ''}`}>
              New case
            </NavLink>
            <NavLink to="/audit" className={({ isActive }) => `topnav-link${isActive ? ' topnav-link-active' : ''}`}>
              Auditor
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => `topnav-link${isActive ? ' topnav-link-active' : ''}`}>
              Guide
            </NavLink>
          </nav>

          <div className="topbar-right">
            <span className="net-dot" title="Midnight Preprod">
              <i /> Preprod
            </span>
            <button
              className={`demo-pill${isDemo ? ' demo-pill-on' : ''}`}
              onClick={toggleDemo}
              title="Toggle mock ledger — no wallet, no tokens"
            >
              {isDemo ? '● Demo on' : 'Try demo'}
            </button>
            {isConnected && walletInfo ? (
              <span className="wallet-pill wallet-pill-connected" title={walletInfo.address}>
                ● {walletInfo.address.slice(0, 6)}…{walletInfo.address.slice(-4)}
              </span>
            ) : (
              <button className="wallet-pill" onClick={() => void connect()} disabled={connecting}>
                {walletState.status === 'connecting' ? 'Connecting…' : 'Connect'}
              </button>
            )}
          </div>
        </div>
      </header>

      {isDemo && (
        <div className="context-ribbon" role="status">
          <div className="context-ribbon-inner">
            <span>
              <strong style={{ color: 'var(--verify)' }}>Demo ledger in memory</strong>
              <span style={{ color: 'var(--muted)' }}> — every action works wallet-free. Refresh resets. Real chain untouched.</span>
            </span>
            <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={toggleDemo}>
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
