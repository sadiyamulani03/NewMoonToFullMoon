import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { listCases, type ForensicCase } from '../lib/api';
import { useMidnightContext } from '../context/MidnightContext';
import { useDemo } from '../context/DemoContext';
import Loading from '../components/Loading';

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Cases() {
  const [cases, setCases] = useState<ForensicCase[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const { isConnected, midLedger, membershipStatus } = useMidnightContext();
  const { isDemo, mockCases, mockLedger } = useDemo();

  useEffect(() => {
    if (isDemo) {
      setCases(mockCases);
      return;
    }
    listCases().then(setCases).catch((e: unknown) => setError(String(e)));
  }, [isDemo, mockCases]);

  const ledger = isDemo ? mockLedger : midLedger;

  const filtered = useMemo(() => {
    if (!cases) return null;
    const q = filter.trim().toLowerCase();
    if (!q) return cases;
    return cases.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.receipts.some((r) => String(r.caseIndex ?? '').includes(q)),
    );
  }, [cases, filter]);

  return (
    <>
      {isDemo && (
        <div className="card" style={{ borderStyle: 'dashed', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <span className="muted-text" style={{ fontSize: '0.88rem' }}>
            <span className="info-label" style={{ background: 'rgba(139,224,175,0.15)', color: '#8be0af' }}>Demo — not on-chain</span>
            Mock cases • actions work without wallet
          </span>
          <span className="muted-text" style={{ fontSize: '0.8rem' }}>{mockCases.length} demo case(s)</span>
        </div>
      )}

      {isConnected && ledger && !isDemo && (
        <section className="card">
          <p className="section-head">
            <span className="section-no">01</span> Live ledger
          </p>
          <p className="muted-text">
            On-chain aggregate <code>{ledger.aggregate.toString()}</code> · {ledger.cases.length} case file(s) ·{' '}
            {ledger.memberCount.toString()} authorized member(s) · allowlist root{' '}
            <code className="tx-id">0x{ledger.allowlistRoot ? ledger.allowlistRoot.field.toString(16) : '—'}</code>{' '}
            · you: {membershipStatus === 'member' ? 'member' : 'not authorized'}
          </p>
        </section>
      )}

      <section className="card">
        <p className="section-head">
          <span className="section-no">02</span> Cases
        </p>

        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="form-input"
            style={{ flex: '1 1 220px', maxWidth: 360 }}
            placeholder="Search by title, case ID or description…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Search cases"
          />
          {filter && (
            <button className="btn btn-ghost" onClick={() => setFilter('')} style={{ padding: '8px 12px' }}>
              Clear
            </button>
          )}
          <span className="muted-text" style={{ fontSize: '0.82rem' }}>
            {filtered ? `${filtered.length} / ${cases?.length ?? 0}` : ''}
          </span>
        </div>

        <div className="case-legend" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px', alignItems: 'center' }}>
          <span className="muted-text" style={{ fontSize: '0.8rem' }}>Case states:</span>
          <span className="status-tag">OPEN</span>
          <span className="muted-text">→</span>
          <span className="status-tag status-closed">CLOSED / Sealed</span>
          <span className="muted-text" style={{ fontSize: '0.8rem' }}>(sealed totals are permanent)</span>
        </div>

        {error && <p className="error-text">{error}</p>}
        {!cases && !error && <Loading label="Loading cases…" />}

        {cases && cases.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 16px', border: '1px dashed var(--line)', borderRadius: 10, background: 'rgba(255,255,255,0.02)' }}>
            <p style={{ fontSize: '2rem', margin: 0 }}>📂</p>
            <h3 style={{ margin: '10px 0 6px', fontFamily: 'var(--font-display)' }}>No cases yet</h3>
            <p className="muted-text" style={{ maxWidth: 420, margin: '0 auto 14px' }}>
              The demo API is ephemeral and resets on redeploy — that’s expected. Create a case or try the demo to see seeded data.
            </p>
            <div className="quick-links" style={{ justifyContent: 'center' }}>
              <Link className="btn btn-primary" to="/new">Open a new case</Link>
              <Link className="btn btn-secondary" to="/dashboard">Try demo</Link>
            </div>
          </div>
        )}

        {filtered && filtered.length === 0 && cases && cases.length > 0 && (
          <div style={{ textAlign: 'center', padding: '24px 16px' }}>
            <p className="muted-text">No cases match “{filter}”.</p>
            <button className="btn btn-ghost" onClick={() => setFilter('')}>Clear search</button>
          </div>
        )}

        {filtered && filtered.length > 0 && (
          <ul className="case-list">
            {filtered.map((c) => (
              <li key={c.id}>
                <Link className="case-row" to={`/cases/${c.id}`}>
                  <div>
                    <strong className="case-title">{c.title}</strong>
                    <span className="info-label" title="Zero-knowledge proofs — each receipt is a ZK proof that total' = total + hidden amount. See About → Glossary.">
                      {' '}
                      · {c.receipts.length}{' '}
                      <span style={{ color: 'inherit', textDecoration: 'underline' }}>
                        proof{c.receipts.length === 1 ? '' : 's'}
                      </span>{' '}
                      · opened {fmtDate(c.createdAt)}
                    </span>
                    <p className="muted-text" style={{ margin: '6px 0 0' }}>{c.description}</p>
                  </div>
                  <span className={`status-tag ${c.status === 'closed' ? 'status-closed' : ''}`}>{c.status}</span>
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
