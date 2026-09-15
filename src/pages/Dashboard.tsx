import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getStats, type Stats } from '../lib/api';
import { useMidnightContext } from '../context/MidnightContext';
import { useDemo } from '../context/DemoContext';
import WalletStatus from '../components/WalletStatus';
import Loading from '../components/Loading';

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { walletState, isConnected, isMobile, midLedger, membershipStatus, midContractAddress } =
    useMidnightContext();
  const { isDemo, mockLedger, mockCases, enableDemo, disableDemo } = useDemo();

  useEffect(() => {
    if (isDemo) return;
    getStats().then(setStats).catch((e: unknown) => setError(String(e)));
  }, [isDemo]);

  const ledger = isDemo ? mockLedger : midLedger;
  const displayStats: Stats | null = isDemo
    ? {
        totalCases: mockCases.length,
        openCases: mockCases.filter((c) => c.status === 'open').length,
        totalProofs: mockCases.reduce((a, c) => a + c.receipts.length, 0),
        lastReceipt: null,
      }
    : stats;

  return (
    <>
      {/* Demo banner */}
      <section className="card" style={{ borderStyle: 'dashed', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 16px' }}>
        <span className="muted-text" style={{ fontSize: '0.88rem' }}>
          <span className="info-label" style={{ background: isDemo ? 'rgba(139,224,175,0.15)' : 'rgba(244,199,112,0.12)', color: isDemo ? '#8be0af' : '#f4dba2' }}>
            {isDemo ? 'Demo — not on-chain' : 'Live · Preprod'}
          </span>
          {isDemo ? 'Demo ledger in memory — logStep/disclose/close work with zero wallet.' : 'No wallet? Try demo — mock ledger, zero setup.'}
        </span>
        {isDemo ? (
          <button className="btn btn-secondary" onClick={disableDemo} style={{ padding: '8px 14px' }}>
            Exit demo — use real chain
          </button>
        ) : (
          <button className="btn btn-primary" onClick={enableDemo} style={{ padding: '8px 14px' }}>
            Try demo — no wallet
          </button>
        )}
      </section>

      {/* Wallet — always visible */}
      <section className="card">
        <p className="section-head">
          <span className="section-no">01</span> Wallet
        </p>
        {isDemo ? (
          <p className="ok-text" style={{ fontSize: '0.9rem' }}>
            Demo mode — wallet not required. Actions update the in-memory ledger instantly.
            <button className="btn btn-ghost" style={{ marginLeft: 8, padding: '4px 8px', fontSize: '0.8rem' }} onClick={disableDemo}>Exit demo</button>
          </p>
        ) : (
          <>
            <WalletStatus walletState={walletState} isMobile={isMobile} />
            {isConnected && ledger && (
              <p className="ok-text" style={{ marginTop: '10px', fontSize: '0.9rem' }}>
                Connected on <strong>Preprod</strong> · on-chain aggregate <code>{ledger.aggregate.toString()}</code> ·
                you&apos;re <strong>{membershipStatus === 'member' ? 'authorized' : 'not yet authorized'}</strong>
                {membershipStatus !== 'member' && ' — ask an allowlisted member to grant access'}
              </p>
            )}
            {isConnected && !ledger && (
              <p className="muted-text" style={{ marginTop: '8px' }}>
                Reading on-chain ledger… proofs and cases will appear once synced. No wallet? Use{' '}
                <Link to="/audit" style={{ fontWeight: 700 }}>Audit</Link> to verify without connecting.
              </p>
            )}
            {!isConnected && (
              <p className="muted-text" style={{ marginTop: '8px' }}>
                Not connected — connect Lace or 1AM on Preprod to run proofs, or{' '}
                <Link to="/audit" style={{ fontWeight: 700 }}>open the Audit window</Link> to verify publicly with no wallet.
              </p>
            )}
          </>
        )}
      </section>

      {/* Hero */}
      <section className="dashboard-shell">
        <div className="dashboard-hero">
          <div className="hero-copy">
            <span className="eyebrow">Private evidence ledger</span>
            <h2>Track forensic steps without exposing the truth.</h2>
            <p>
              MidnightTrace keeps every hidden amount private, proves the math in zero knowledge, and records only what
              the chain can verify. Open a case to begin — proofs and receipts follow.
            </p>
            <div className="quick-links">
              <Link className="btn btn-primary btn-hero-primary" to="/new">
                Open a new case
              </Link>
              <Link className="btn btn-secondary" to="/cases">
                View all cases
              </Link>
              <Link className="btn btn-ghost" to="/audit">
                Audit window
              </Link>
            </div>
            <p className="muted-text" style={{ marginTop: '10px', fontSize: '0.85rem' }}>
              Need a wallet? Install Lace or 1AM on Preprod — or{' '}
              <Link to="/audit" style={{ fontWeight: 700 }}>
                verify publicly without one
              </Link>
              .
            </p>
          </div>

          <div className="hero-panel">
            <div className="panel-topline">
              <span className="status-pill status-live">{isDemo ? 'Demo' : 'Live'}</span>
              <span className="panel-chip">{isDemo ? 'In-memory' : 'Preprod'}</span>
            </div>

            <div className="mini-grid">
              <div className="mini-stat">
                <span className="info-label">Aggregate</span>
                {ledger ? (
                  <strong>{ledger.aggregate.toString()}</strong>
                ) : (
                  <>
                    <div className="skeleton skeleton-text" aria-hidden="true" />
                    <small className="muted-text" style={{ display: 'block', marginTop: '8px' }}>
                      <Link to="/audit" style={{ fontWeight: 700 }}>Audit</Link> without wallet — or connect to read live
                    </small>
                  </>
                )}
              </div>
              <div className="mini-stat">
                <span className="info-label">Members</span>
                {ledger ? (
                  <strong>{ledger.memberCount.toString()}</strong>
                ) : (
                  <>
                    <div className="skeleton skeleton-text" style={{ width: 46 }} aria-hidden="true" />
                    <small className="muted-text" style={{ display: 'block', marginTop: '8px' }}>Connect wallet to see</small>
                  </>
                )}
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
                <span>Audit window ready — no wallet needed</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ONE stats-grid */}
      <section className="card">
        <p className="section-head">
          <span className="section-no">02</span> Overview — real counts
        </p>
        {error && <p className="error-text">{error}</p>}
        {!displayStats && !error && !isDemo && <Loading label="Loading case stats…" />}
        {displayStats && (
          <div className="stats-grid">
            <div className="stat-box">
              <span className="info-label">Cases</span>
              <strong className="stat-value">{displayStats.totalCases}</strong>
              <span className="muted-text">{displayStats.openCases} open · {displayStats.totalCases - displayStats.openCases} closed</span>
            </div>
            <div className="stat-box">
              <span className="info-label">On-chain cases</span>
              {ledger ? (
                <>
                  <strong className="stat-value">{ledger.cases.length}</strong>
                  <span className="muted-text">in the {isDemo ? 'demo' : 'MidnightTrace'} ledger</span>
                </>
              ) : (
                <>
                  <div className="skeleton skeleton-text" style={{ width: 36 }} aria-hidden="true" />
                  <span className="muted-text"><Link to="/audit" style={{ fontWeight: 700 }}>Audit</Link> to verify without wallet</span>
                </>
              )}
            </div>
            <div className="stat-box">
              <span className="info-label" title="Zero-knowledge proofs — see About → Glossary">
                Proofs run{' '}
                <Link to="/about" style={{ fontSize: '0.7rem' }} title="Glossary: Zero-knowledge proof">
                  ⓘ
                </Link>
              </span>
              <strong className="stat-value">{displayStats.totalProofs}</strong>
              <span className="muted-text">{isDemo ? 'demo receipts' : 'on-chain receipts'}</span>
            </div>
            <div className="stat-box">
              <span className="info-label">Allowlist</span>
              {ledger ? (
                <>
                  <strong className="stat-value">{ledger.memberCount.toString()}</strong>
                  <span className="muted-text">members (commitments on-chain)</span>
                </>
              ) : (
                <>
                  <div className="skeleton skeleton-text" style={{ width: 36 }} aria-hidden="true" />
                  <span className="muted-text">Connect wallet</span>
                </>
              )}
            </div>
          </div>
        )}
        {!isDemo && !midContractAddress && (
          <p className="muted-text">
            MidnightTrace contract not configured — set <code>VITE_MIDNIGHTTRACE_CONTRACT_ADDRESS</code> to see on-chain
            case stats.
          </p>
        )}
      </section>

      <div className="quick-links">
        <Link className="btn btn-primary" to="/new">
          Open a new case
        </Link>
        <Link className="btn btn-secondary" to="/cases">
          View all cases
        </Link>
        <Link className="btn btn-secondary" to="/audit">
          Audit window
        </Link>
      </div>
    </>
  );
}
