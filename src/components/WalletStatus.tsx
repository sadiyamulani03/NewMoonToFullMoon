import { Link } from 'react-router-dom';
import { useMidnightContext } from '../context/MidnightContext';
import type { WalletState } from '../hooks/useMidnight';

interface Props {
  walletState: WalletState;
  isMobile: boolean;
}

export default function WalletStatus({ walletState, isMobile }: Props) {
  const { connect, walletInfo, isConnected } = useMidnightContext();

  // Connected — show explicit success state with address (secondary to header pill)
  if (isConnected && walletInfo) {
    return (
      <div>
        <p className="ok-text">
          ● Connected as <code className="code" title={walletInfo.address}>{walletInfo.address.slice(0, 18)}…{walletInfo.address.slice(-6)}</code> on{' '}
          <strong>{walletInfo.networkId}</strong>
        </p>
        <p className="muted-text" style={{ fontSize: '0.88rem', marginTop: '4px' }}>
          Your hidden amounts stay in this wallet. Proofs are generated locally — nothing private leaves the device.
        </p>
      </div>
    );
  }

  switch (walletState.status) {
    case 'detected':
      return (
        <div>
          <p className="muted-text" style={{ marginBottom: '10px' }}>
            Midnight wallet detected. Connect to prove steps and read the live ledger.
          </p>
          <button className="btn btn-primary" onClick={() => void connect()}>
            Connect wallet
          </button>
          <p className="muted-text" style={{ marginTop: '8px', fontSize: '0.82rem' }}>
            Requires the 1AM or Lace extension on Preprod. No seed leaves your wallet.
          </p>
        </div>
      );
    case 'connecting':
      return (
        <div className="wallet-connecting">
          <p className="ok-text">Waiting for wallet approval…</p>
          <p className="muted-text" style={{ fontSize: '0.88rem' }}>
            Check the wallet extension popup and approve. This usually takes a few seconds.
          </p>
          <div className="loading-row" style={{ marginTop: '10px' }}>
            <span className="spinner" />
            <span className="muted-text">Connecting</span>
          </div>
        </div>
      );
    case 'network-mismatch':
      return (
        <div>
          <p className="error-text">
            Wrong network — wallet is on <strong>{walletState.actual}</strong>, app needs{' '}
            <strong>{walletState.expected}</strong>.
          </p>
          <p className="muted-text" style={{ marginTop: '6px', fontSize: '0.88rem' }}>
            Switch network inside your wallet to <strong>{walletState.expected}</strong>, then connect again.
          </p>
          <button className="btn btn-secondary" style={{ marginTop: '10px' }} onClick={() => void connect()}>
            Retry after switching
          </button>
        </div>
      );
    case 'rejected':
      return (
        <div>
          <p className="error-text">Connection declined — nothing was shared.</p>
          <button className="btn btn-primary" onClick={() => void connect()}>
            Try again
          </button>
        </div>
      );
    case 'error':
      return (
        <div>
          <p className="error-text">Connection failed — {walletState.message}</p>
          <p className="muted-text" style={{ marginTop: '6px', fontSize: '0.88rem' }}>
            Check the extension is unlocked and on Preprod, then retry. If it persists, reload the page.
          </p>
          <button className="btn btn-primary" onClick={() => void connect()}>
            Retry
          </button>
        </div>
      );
    case 'wallet-not-installed':
      if (isMobile) {
        return (
          <div>
            <p className="muted-text">
              Wallet connection needs a desktop browser extension (1AM or Lace). On mobile, you can still verify
              everything publicly.
            </p>
            <p className="wallet-actions">
              <Link className="btn btn-primary" to="/audit">
                Open Audit window
              </Link>
            </p>
          </div>
        );
      }
      return (
        <div>
          <p className="error-text">No Midnight wallet found.</p>
          <p className="muted-text" style={{ marginTop: '6px' }}>
            Install <a href="https://midnight.network" target="_blank" rel="noreferrer">1AM or Lace</a>, switch to{' '}
            <strong>Preprod</strong>, and reload.
          </p>
        </div>
      );
    case 'idle':
    default:
      return (
        <div>
          <p className="muted-text">Wallet not connected yet.</p>
          <button className="btn btn-secondary" style={{ marginTop: '8px' }} onClick={() => void connect()}>
            Connect wallet
          </button>
        </div>
      );
  }
}