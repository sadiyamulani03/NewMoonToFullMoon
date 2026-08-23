import { Link } from 'react-router-dom';
import { useMidnightContext } from '../context/MidnightContext';
import type { WalletState } from '../hooks/useMidnight';

interface Props {
  walletState: WalletState;
  isMobile: boolean;
}

export default function WalletStatus({ walletState, isMobile }: Props) {
  const { connect } = useMidnightContext();

  switch (walletState.status) {
    case 'detected':
      return (
        <div>
          <p className="ok-text">Midnight wallet found — click Connect to authorize.</p>
          <button className="btn btn-primary" onClick={() => void connect()}>
            Connect
          </button>
        </div>
      );
    case 'connecting':
      return <p className="ok-text">Connecting… check the wallet extension popup to approve.</p>;
    case 'network-mismatch':
      return (
        <p className="error-text">
          Wrong network: the wallet is on <strong>{walletState.actual}</strong>, but this app needs{' '}
          <strong>{walletState.expected}</strong>. Switch the network inside your wallet, then connect again.
        </p>
      );
    case 'rejected':
      return (
        <div>
          <p className="error-text">You declined the connection. Nothing was shared — click Connect to try again.</p>
          <button className="btn btn-primary" onClick={() => void connect()}>
            Connect
          </button>
        </div>
      );
    case 'error':
      return (
        <div>
          <p className="error-text">Wallet connection failed: {walletState.message}</p>
          <button className="btn btn-primary" onClick={() => void connect()}>
            Retry
          </button>
        </div>
      );
    case 'wallet-not-installed':
      if (isMobile) {
        return (
          <div>
            <p className="error-text">
              Wallet connection isn&apos;t supported on mobile yet — Midnight wallets (1AM/Lace) connect through a
              desktop browser extension. Meanwhile, you can browse the live on-chain ledger right here.
            </p>
            <p className="wallet-actions">
              <Link className="btn btn-primary" to="/audit">
                Open the Audit window
              </Link>
            </p>
          </div>
        );
      }
      return <p className="error-text">No Midnight wallet found in this browser. Install 1AM or Lace and switch to Preprod.</p>;
    case 'idle':
    default:
      return null;
  }
}