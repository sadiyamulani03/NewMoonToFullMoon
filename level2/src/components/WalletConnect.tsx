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
      <p className="section-head">
        <span className="section-no">01</span> Wallet
      </p>

      <div className={`stamp ${isConnected ? 'stamp-live' : 'stamp-standby'}`}>
        {isConnected ? '● Live' : '○ Standby'}
      </div>

      {isConnected && walletInfo && (
        <div className="wallet-info">
          <p className="muted-text">
            <strong>{walletInfo.walletName}</strong> · network <code>{walletInfo.networkId}</code>
          </p>
          <p className="address-line">
            <span className="info-label">Shielded address</span>
            <code className="address">{shortAddress(walletInfo.address)}</code>
          </p>
        </div>
      )}

      {!isConnected && walletState.status === 'wallet-not-installed' && (
        <p className="error-text">
          No Midnight wallet in this browser. Grab{' '}
          <a href="https://chromewebstore.google.com/detail/1am/bphnkdkcnfhompoegfpgnkidcjfbojjp" target="_blank" rel="noreferrer">
            1AM
          </a>{' '}
          or{' '}
          <a href="https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk" target="_blank" rel="noreferrer">
            Lace
          </a>
          , switch it to Preprod, and reload.
        </p>
      )}

      {!isConnected && walletState.status === 'network-mismatch' && (
        <p className="error-text">
          Wallet network mismatch: this dApp expects <strong>{walletState.expected}</strong> but the wallet is on{' '}
          <strong>{walletState.actual}</strong>. Switch the wallet network to <strong>{walletState.expected}</strong>.
        </p>
      )}

      {!isConnected && walletState.status === 'rejected' && (
        <p className="error-text">Connection was declined in the wallet. Hit Connect to have another go.</p>
      )}

      {!isConnected && walletState.status === 'error' && <p className="error-text">{walletState.message}</p>}

      {walletState.status === 'connecting' && <p className="muted-text">Waiting on the wallet…</p>}

      <div className="wallet-actions">
        {!isConnected && (
          <button className="btn btn-primary" onClick={connect} disabled={walletState.status === 'connecting'}>
            {walletState.status === 'connecting' ? 'Connecting…' : 'Connect wallet'}
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