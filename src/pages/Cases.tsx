import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { listCases, type ForensicCase } from '../lib/api';
import { useMidnightContext } from '../context/MidnightContext';
import Loading from '../components/Loading';

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Cases() {
  const [cases, setCases] = useState<ForensicCase[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, midLedger, membershipStatus } = useMidnightContext();

  useEffect(() => {
    listCases().then(setCases).catch((e: unknown) => setError(String(e)));
  }, []);

  return (
    <>
      {isConnected && midLedger && (
        <section className="card">
          <p className="section-head">
            <span className="section-no">02</span> Live ledger
          </p>
          <p className="muted-text">
            On-chain aggregate <code>{midLedger.aggregate.toString()}</code> · {midLedger.cases.length} case file(s) ·{' '}
            {midLedger.memberCount.toString()} authorized member(s) · allowlist root{' '}
            <code className="tx-id">0x{midLedger.allowlistRoot ? midLedger.allowlistRoot.field.toString(16) : '—'}</code>{' '}
            · you: {membershipStatus === 'member' ? 'member' : 'not authorized'}
          </p>
        </section>
      )}

      <section className="card">
        <p className="section-head">
          <span className="section-no">03</span> Cases
        </p>
        <div className="case-legend" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px', alignItems: 'center' }}>
          <span className="muted-text" style={{ fontSize: '0.8rem' }}>Case states:</span>
          <span className="status-tag">OPEN</span>
          <span className="muted-text">→</span>
          <span className="status-tag status-closed">CLOSED / Sealed</span>
          <span className="muted-text" style={{ fontSize: '0.8rem' }}>(Open → Closed/Sealed — sealed totals are permanent)</span>
        </div>
        {error && <p className="error-text">{error}</p>}
        {!cases && !error && <Loading label="Loading cases…" />}
        {cases && cases.length === 0 && (
          <>
            <p className="muted-text">No cases yet — open the first one. Your proof receipts will appear below in finalization order.</p>
            <p className="muted-text" style={{ fontSize: '0.82rem', opacity: 0.85 }}>
              Demo data resets on redeploy; on-chain totals remain — verify any case in{' '}
              <Link to="/audit" style={{ fontWeight: 700 }}>Audit</Link>.
            </p>
          </>
        )}
        {cases && cases.length > 0 && (
          <ul className="case-list">
            {cases.map((c) => (
              <li key={c.id}>
                <Link className="case-row" to={`/cases/${c.id}`}>
                  <div>
                    <strong className="case-title">{c.title}</strong>
                    <span className="info-label" title="Zero-knowledge proofs — each receipt is a ZK proof that total' = total + hidden amount. See About → Glossary.">
                      {' '}
                      · {c.receipts.length}{' '}
                      <Link to="/about" onClick={(e) => e.stopPropagation()} style={{ color: 'inherit', textDecoration: 'underline' }}>
                        proof{c.receipts.length === 1 ? '' : 's'}
                      </Link>{' '}
                      · opened {fmtDate(c.createdAt)}
                    </span>
                    <p className="muted-text">{c.description}</p>
                  </div>
                  <span className="status-tag">{c.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <div className="quick-links">
        <Link className="btn btn-primary" to="/new">
          Open a new case
        </Link>
        <Link className="btn btn-secondary" to="/audit">
          Auditors: verify on-chain state
        </Link>
      </div>
    </>
  );
}