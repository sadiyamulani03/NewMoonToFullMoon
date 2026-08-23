import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getStats, type Stats } from '../lib/api';
import { useMidnightContext } from '../context/MidnightContext';
import WalletStatus from '../components/WalletStatus';
import FirstTimeGuide from '../components/FirstTimeGuide';
import Loading from '../components/Loading';

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
      <section className="dashboard-shell">
        <div className="dashboard-hero">
          <div className="hero-copy">
            <span className="eyebrow">Private evidence ledger</span>
            <h2>Track forensic steps without exposing the truth.</h2>
            <p>
              MidnightTrace keeps every hidden amount private, proves the mathematics with zero-knowledge, and records
              only the facts the chain can verify.
            </p>
            <div className="quick-links">
              <Link className="btn btn-primary" to="/cases">
                View all cases
              </Link>
              <Link className="btn btn-secondary" to="/new">
                Open a new case
              </Link>
            </div>
          </div>

          <div className="hero-panel">
            <div className="panel-topline">
              <span className="status-pill status-live">Live</span>
              <span className="panel-chip">Preprod</span>
            </div>

            <div className="mini-grid">
              <div className="mini-stat">
                <span className="info-label">Aggregate</span>
                <strong>{midLedger ? midLedger.aggregate.toString() : '—'}</strong>
              </div>
              <div className="mini-stat">
                <span className="info-label">Members</span>
                <strong>{midLedger ? midLedger.memberCount.toString() : '—'}</strong>
              </div>
            </div>

            <ul className="mini-list">
              <li>
                <span className="dot dot-ok" />
                <span>Proof-backed case integrity</span>
              </li>
              <li>
                <span className="dot dot-gold" />
                <span>Selective disclosure enabled</span>
              </li>
              <li>
                <span className="dot dot-slate" />
                <span>Audit window ready</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <FirstTimeGuide />

      <section className="dashboard-grid">
        <div className="card analytics-card">
          <div className="panel-header">
            <div>
              <span className="eyebrow eyebrow-soft">Network health</span>
              <h3>Operational signal</h3>
            </div>
            <span className="status-pill status-live">Operational</span>
          </div>

          <div className="signal-grid">
            <div className="signal-box">
              <span className="info-label">Case throughput</span>
              <strong>{stats?.totalCases ?? '—'}</strong>
              <small>cases processed</small>
            </div>
            <div className="signal-box">
              <span className="info-label">Proof attestations</span>
              <strong>{stats?.totalProofs ?? '—'}</strong>
              <small>receipts generated</small>
            </div>
            <div className="signal-box">
              <span className="info-label">Membership</span>
              <strong>{midLedger ? midLedger.memberCount.toString() : '—'}</strong>
              <small>authorized actors</small>
            </div>
          </div>

          <div className="trend-panel">
            <div className="trend-row">
              <span>Case integrity</span>
              <strong>96.4%</strong>
            </div>
            <div className="progress-track">
              <span className="progress-bar bar-amber" style={{ width: '96.4%' }} />
            </div>

            <div className="trend-row">
              <span>Disclosure coverage</span>
              <strong>88.1%</strong>
            </div>
            <div className="progress-track">
              <span className="progress-bar bar-green" style={{ width: '88.1%' }} />
            </div>
          </div>
        </div>

        <div className="card activity-card">
          <div className="panel-header">
            <div>
              <span className="eyebrow eyebrow-soft">Live feed</span>
              <h3>Recent activity</h3>
            </div>
          </div>

          <ul className="activity-list">
            <li>
              <span className="activity-dot dot-ok" />
              <div>
                <strong>Case checksum validated</strong>
                <small>2 minutes ago</small>
              </div>
            </li>
            <li>
              <span className="activity-dot dot-gold" />
              <div>
                <strong>Access grant issued</strong>
                <small>11 minutes ago</small>
              </div>
            </li>
            <li>
              <span className="activity-dot dot-slate" />
              <div>
                <strong>Audit window opened</strong>
                <small>27 minutes ago</small>
              </div>
            </li>
          </ul>
        </div>
      </section>

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
        {!stats && !error && <Loading label="Loading case stats…" />}
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