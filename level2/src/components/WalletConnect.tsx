import type { WalletState, WalletInfo } from '../hooks/useMidnight';

export interface WalletConnectProps {
  walletState: WalletState;
  walletInfo: WalletInfo | null;
  connect: () => void;
  disconnect: () => void;
}

function shortAddress(address: string): string {
  if (address.length <= 22) return address;
  return `${address.slice(0, 14)}…${address.slice(-8)}`;
}

export function WalletConnect({ walletState, walletInfo, connect, disconnect }: WalletConnectProps) {
  const isConnected = walletState.status === 'connected';

  return (
    <section className="card wallet-card">
      <h2 className="card-title">Wallet</h2>

      <div className={`status-badge ${isConnected ? 'badge-ok' : 'badge-off'}`}>
        <span className="status-dot" />
        {isConnected ? 'Connected' : 'Not connected'}
      </div>

      {isConnected && walletInfo && (
        <div className="wallet-info">
          <p className="muted-text">
            <strong>{walletInfo.walletName}</strong> · network <code>{walletInfo.networkId}</code>
          </p>
          <p className="address-line">
            <span className="info-label">Address:</span> <code className="address">{shortAddress(walletInfo.address)}</code>
          </p>
        </div>
      )}

      {!isConnected && walletState.status === 'wallet-not-installed' && (
        <p className="error-text">
          No Midnight wallet detected. Install the{' '}
          <a href="https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk" target="_blank" rel="noreferrer">
            Lace wallet extension
          </a>{' '}
          and switch it to Preprod, then reload.
        </p>
      )}

      {!isConnected && walletState.status === 'network-mismatch' && (
        <p className="error-text">
          Wallet network mismatch: this dApp requires <strong>{walletState.expected}</strong> but the wallet is on{' '}
          <strong>{walletState.actual}</strong>. Switch your Lace wallet network to <strong>{walletState.expected}</strong>.
        </p>
      )}

      {!isConnected && walletState.status === 'rejected' && (
        <p className="error-text">Connection request was rejected in the wallet. Click Connect to try again.</p>
      )}

      {!isConnected && walletState.status === 'error' && <p className="error-text">{walletState.message}</p>}

      {walletState.status === 'connecting' && <p className="muted-text">Connecting to Lace wallet…</p>}

      <div className="wallet-actions">
        {!isConnected && (
          <button className="btn btn-primary" onClick={connect} disabled={walletState.status === 'connecting'}>
            {walletState.status === 'connecting' ? 'Connecting…' : 'Connect Wallet'}
          </button>
        )}
        {isConnected && (
          <button className="btn btn-secondary" onClick={disconnect}>
            Disconnect
          </button>
        )}
      </div>
    </section>
  );
}