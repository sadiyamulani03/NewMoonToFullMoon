import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useMidnightContext } from '../context/MidnightContext';

function shortAddress(address: string): string {
  if (address.length <= 22) return address;
  return `${address.slice(0, 14)}…${address.slice(-8)}`;
}

function WalletPill() {
  const { walletState, walletInfo, isConnected, connect, disconnect, isMobile } = useMidnightContext();

  if (isConnected && walletInfo) {
    return (
      <button className="btn btn-secondary wallet-pill" onClick={disconnect}>
        <span className="stamp stamp-live pill-stamp">● Live</span>
        <code className="address">{shortAddress(walletInfo.address)}</code>
      </button>
    );
  }

  // On mobile the Midnight wallets can't inject a browser extension, so the
  // header button would only ever fail. Hide it and keep the Audit-window CTA
  // that the wallet card already offers — avoids the duplicate-button UX
  // testers flagged.
  if (isMobile && walletState.status === 'wallet-not-installed') {
    return <span className="wallet-pill wallet-pill-muted">Mobile · use Audit</span>;
  }

  const label =
    walletState.status === 'connecting'
      ? 'Connecting…'
      : walletState.status === 'error' || walletState.status === 'rejected' || walletState.status === 'network-mismatch'
        ? 'Retry wallet'
        : 'Connect wallet';
  return (
    <button className="btn btn-primary wallet-pill" onClick={() => void connect()}>
      {label}
    </button>
  );
}

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="app-shell">
      <header className="header">
        <div className="header-content">
<div className="header-bar">
        <div className="brand-wrap">
          <div className="brand-mark">M</div>
          <div className="brand-block">
            <p className="kicker">Midnight Network · preprod</p>
            <h1>MidnightTrace</h1>
          </div>
        </div>
        <div className="header-wallet">
          <WalletPill />
        </div>
      </div>

      <div className="header-actions">
        <button
          type="button"
          className="menu-toggle"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

          <p className="subtitle">
            A pocket case-file that watches a private counter. Track cases, connect a wallet, run the circuit, and get
            receipts you can keep.
          </p>

          <nav className={`nav${menuOpen ? ' nav-open' : ''}`} aria-label="Main navigation">
            <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`} onClick={closeMenu}>
              <svg className="nav-icon" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M2 7.5 8 2.5 14 7.5V14H9.5v-3.5h-3V14H2z" />
              </svg>
              Dashboard
            </NavLink>
            <NavLink to="/cases" className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`} onClick={closeMenu}>
              <svg className="nav-icon" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M1.5 3h4l1.5 1.5h7.5V13a1 1 0 0 1-1 1H1.5a1 1 0 0 1-1-1z" />
              </svg>
              Cases
            </NavLink>
            <NavLink to="/new" className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`} onClick={closeMenu}>
              <svg className="nav-icon" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 2.5v11M2.5 8h11" />
              </svg>
              New case
            </NavLink>
            <NavLink to="/audit" className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`} onClick={closeMenu}>
              <svg className="nav-icon" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 2.5h10V8a5 5 0 0 1-5 5 5 5 0 0 1-5-5z" />
                <path d="M5.5 8.5 7 10l3.5-3.5" />
              </svg>
              Audit
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`} onClick={closeMenu}>
              <svg className="nav-icon" viewBox="0 0 16 16" aria-hidden="true">
                <circle cx="8" cy="8" r="6" />
                <path d="M8 7.5v4" />
                <path d="M8 4.75v.25" />
              </svg>
              About
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="container">
        <Outlet />
      </main>

      <footer className="footer">
        <p>Proofs are generated locally — your private step never reaches the chain or this screen.</p>
      </footer>
    </div>
  );
}