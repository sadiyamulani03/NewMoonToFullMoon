import { useCallback } from 'react';

import { useMidnight } from './hooks/useMidnight';
import { WalletConnect } from './components/WalletConnect';
import { CircuitCall } from './components/CircuitCall';
import './styles.css';

export default function App() {
  const midnight = useMidnight();

  const callCircuit = useCallback(async () => {
    const contract = midnight.contract;
    if (!contract) {
      throw new Error('Wallet not connected / contract not joined.');
    }

    const result = await contract.callTx.increment(7n);
    await midnight.refreshLedger();
    return { txId: result.public.txId, blockHeight: result.public.blockHeight } as {
      txId: string;
      blockHeight: number | bigint;
    };
  }, [midnight.contract, midnight.refreshLedger]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>MidnightTrace</h1>
          <p className="subtitle">Private Blockchain Forensics on Midnight</p>
        </div>
      </header>

      <main className="container">
        <WalletConnect
          walletState={midnight.walletState}
          walletInfo={midnight.walletInfo}
          connect={() => {
            void midnight.connect();
          }}
          disconnect={midnight.disconnect}
        />

        <section className="card contract-card">
          <h2 className="card-title">Contract</h2>
          <p className="muted-text">
            <span className="info-label">Address (Preprod):</span>{' '}
            <code className="address">{midnight.contractAddress}</code>
          </p>
        </section>

        <CircuitCall
          contract={midnight.contract}
          callCircuit={callCircuit}
          total={midnight.ledgerTotal}
          lastDisclosed={midnight.lastDisclosed}
          proofMode="wallet"
        />

        <footer className="footer">
          <p className="muted-text">
            MidnightTrace — private blockchain forensics. Proofs are generated locally; your private input never
            appears on-chain or in this interface.
          </p>
        </footer>
      </main>
    </div>
  );
}