import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getStats, type Stats } from '../lib/api';
import { useMidnightContext } from '../context/MidnightContext';
import WalletStatus from '../components/WalletStatus';

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { walletState, isConnected, isMobile, midLedger, membershipStatus, midContractAddress } =
    useMidnightContext();

  useEffect(() => {
    getStats().then(setStats).catch((e: unknown) => setError(String(e)));
  }, []);

  return (
    <>
      <section className="card">
        <p className="section-head">
          <span className="section-no">01</span> Wallet
        </p>
        <WalletStatus walletState={walletState} isMobile={isMobile} />
        {isConnected && midLedger && (
          <p className="ok-text">
            Wallet connected on Preprod · on-chain aggregate: <code>{midLedger.aggregate.toString()}</code> ·
            membership token: {membershipStatus === 'member' ? 'member' : 'not authorized'}
          </p>
        )}
      </section>

      <section className="card">
        <p className="section-head">
          <span className="section-no">02</span> Overview
        </p>
        {error && <p className="error-text">{error}</p>}
        {!stats && !error && <p className="muted-text">Loading case stats…</p>}
        {stats && (
          <div className="stats-grid">
            <div className="stat-box">
              <span className="info-label">Cases</span>
              <strong className="stat-value">{stats.totalCases}</strong>
              <span className="muted-text">{stats.openCases} open</span>
            </div>
            <div className="stat-box">
              <span className="info-label">On-chain cases</span>
              <strong className="stat-value">{midLedger ? midLedger.cases.length : '…'}</strong>
              <span className="muted-text">in the midnighttrace ledger</span>
            </div>
            <div className="stat-box">
              <span className="info-label">Proofs run</span>
              <strong className="stat-value">{stats.totalProofs}</strong>
              <span className="muted-text">on-chain receipts</span>
            </div>
            <div className="stat-box">
              <span className="info-label">Allowlist members</span>
              <strong className="stat-value">{midLedger ? midLedger.memberCount.toString() : '…'}</strong>
              <span className="muted-text">commitments on-chain</span>
            </div>
          </div>
        )}
        {!midContractAddress && (
          <p className="muted-text">
            MidnightTrace contract not configured yet — set <code>VITE_MIDNIGHTTRACE_CONTRACT_ADDRESS</code> to see
            on-chain case stats.
          </p>
        )}
      </section>

      <div className="quick-links">
        <Link className="btn btn-primary" to="/cases">
          View all cases
        </Link>
        <Link className="btn btn-secondary" to="/new">
          Open a new case
        </Link>
        <Link className="btn btn-secondary" to="/audit">
          Audit window
        </Link>
      </div>
    </>
  );
}