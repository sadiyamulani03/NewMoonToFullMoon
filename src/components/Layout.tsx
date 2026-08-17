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
  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <p className="kicker">Midnight Network · preprod</p>
          <h1>MidnightTrace</h1>
          <p className="subtitle">
            A pocket case-file that watches a private counter. Track cases, connect a wallet, run the circuit, and get
            receipts you can keep.
          </p>
<nav className="nav">
              <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}>
                Dashboard
              </NavLink>
              <NavLink to="/cases" className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}>
                Cases
              </NavLink>
              <NavLink to="/new" className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}>
                New case
              </NavLink>
              <NavLink to="/audit" className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}>
                Audit
              </NavLink>
              <NavLink to="/about" className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}>
                About
              </NavLink>
            </nav>
          <div className="header-wallet">
            <WalletPill />
          </div>
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