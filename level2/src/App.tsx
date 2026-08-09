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
          <p className="kicker">Midnight Network · preprod</p>
          <h1>MidnightTrace</h1>
          <p className="subtitle">
            A pocket case-file that watches a private counter. Connect a wallet, run the circuit, and get a receipt you
            can keep.
          </p>
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
          <p className="section-head">
            <span className="section-no">02</span> Contract on file
          </p>
          <p className="muted-text">
            The counter contract this case follows, parked on Preprod:{' '}
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
          <p>
            Proofs are generated locally — your private step never reaches the chain or this screen.
          </p>
        </footer>
      </main>
    </div>
  );
}