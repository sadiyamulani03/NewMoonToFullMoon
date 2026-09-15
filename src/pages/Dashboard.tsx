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
      {/* Wallet — always visible, explicit states */}
      <section className="card wallet-section">
        <p className="section-head">
          <span className="section-no">01</span> Wallet
        </p>
        <WalletStatus walletState={walletState} isMobile={isMobile} />
        {isConnected && midLedger && (
          <p className="ok-text" style={{ marginTop: '10px', fontSize: '0.9rem' }}>
            Connected on <strong>Preprod</strong> · on-chain aggregate <code>{midLedger.aggregate.toString()}</code> ·
            you&apos;re <strong>{membershipStatus === 'member' ? 'authorized' : 'not yet authorized'}</strong>
            {membershipStatus !== 'member' && ' — ask an allowlisted member to grant access'}
          </p>
        )}
        {isConnected && !midLedger && (
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
      </section>

      {/* Privacy at a glance — dashed, distinct */}
      <section className="card" style={{ borderStyle: 'dashed', borderColor: 'rgba(244,199,112,0.42)' }}>
        <p className="section-head">
          <span className="section-no">00</span> Privacy at a glance
        </p>
        <p className="muted-text">
          Your hidden <code>amount</code> never leaves your wallet — the proof shows{' '}
          <code>total&apos; = total + amount</code> while <code>amount</code> stays private on your device. Only totals
          you choose to disclose become public.{' '}
          <Link to="/about#glossary" style={{ fontWeight: 700 }} title="Glossary: Zero-knowledge proof, Aggregate, Disclose">
            Glossary →
          </Link>
        </p>
        <p className="privacy-note">
          New here? Start on the Home landing page or open the Audit window — no wallet needed to verify.
        </p>
      </section>

      {/* Hero — primary action dominant */}
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
              <span className="status-pill status-live">Live</span>
              <span className="panel-chip">Preprod</span>
            </div>

            <div className="mini-grid">
              <div className="mini-stat">
                <span className="info-label">Aggregate</span>
                {midLedger ? (
                  <strong>{midLedger.aggregate.toString()}</strong>
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
                {midLedger ? (
                  <strong>{midLedger.memberCount.toString()}</strong>
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

      <FirstTimeGuide />

      {/* Real stats — no fake percentages, no fabricated activity */}
      <section className="card">
        <p className="section-head">
          <span className="section-no">02</span> Overview — real counts
        </p>
        {error && <p className="error-text">{error}</p>}
        {!stats && !error && <Loading label="Loading case stats…" />}
        {stats && (
          <div className="stats-grid">
            <div className="stat-box">
              <span className="info-label">Cases</span>
              <strong className="stat-value">{stats.totalCases}</strong>
              <span className="muted-text">{stats.openCases} open · {stats.totalCases - stats.openCases} closed</span>
            </div>
            <div className="stat-box">
              <span className="info-label">On-chain cases</span>
              {midLedger ? (
                <>
                  <strong className="stat-value">{midLedger.cases.length}</strong>
                  <span className="muted-text">in the MidnightTrace ledger</span>
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
              <strong className="stat-value">{stats.totalProofs}</strong>
              <span className="muted-text">on-chain receipts</span>
            </div>
            <div className="stat-box">
              <span className="info-label">Allowlist</span>
              {midLedger ? (
                <>
                  <strong className="stat-value">{midLedger.memberCount.toString()}</strong>
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
        {!midContractAddress && (
          <p className="muted-text">
            MidnightTrace contract not configured — set <code>VITE_MIDNIGHTTRACE_CONTRACT_ADDRESS</code> to see on-chain
            case stats.
          </p>
        )}
      </section>

      {/* Next steps — clear, grouped */}
      {stats && stats.totalCases === 0 && (
        <section className="card" style={{ background: 'linear-gradient(180deg, rgba(244,199,112,0.08), rgba(15,22,34,0.9))' }}>
          <p className="section-head">
            <span className="section-no">03</span> What to do next
          </p>
          <p className="muted-text">No cases yet — open the first one. Each case starts on-chain with a number; receipts accumulate as you log hidden steps.</p>
          <p className="muted-text" style={{ fontSize: '0.82rem', opacity: 0.85 }}>
            Demo note: case titles live in the demo API and reset on redeploy — your on-chain proofs and totals are permanent and always verifiable in <Link to="/audit">Audit</Link>.
          </p>
          <div className="quick-links" style={{ marginTop: '14px' }}>
            <Link className="btn btn-primary" to="/new">
              Create the first case
            </Link>
            <Link className="btn btn-secondary" to="/audit">
              See how auditing works
            </Link>
          </div>
        </section>
      )}

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
