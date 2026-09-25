import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { listCases, type ForensicCase } from '../lib/api';
import { useDemo } from '../context/DemoContext';

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Cases() {
  const { isDemo, mockCases } = useDemo();
  const [cases, setCases] = useState<ForensicCase[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'sealed'>('all');

  useEffect(() => {
    if (isDemo) { setCases(mockCases); return; }
    listCases().then(setCases).catch((e) => setError(String(e)));
  }, [isDemo, mockCases]);

  useEffect(() => { if (isDemo) setCases(mockCases); }, [isDemo, mockCases]);

  const filtered = useMemo(() => {
    if (!cases) return null;
    let list = cases;
    if (statusFilter === 'open') {
      list = list.filter((c) => c.status !== 'closed');
    } else if (statusFilter === 'sealed') {
      list = list.filter((c) => c.status === 'closed');
    }
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter((c) =>
      [c.title, c.id, c.description, String(c.receipts[0]?.caseIndex ?? '')].some((v) => v.toLowerCase().includes(s))
    );
  }, [cases, q, statusFilter]);

  return (
    <>
      <header className="masthead">
        <div className="eyebrow">Index · {isDemo ? 'demo ledger' : 'preprod ledger'} · {cases?.length ?? '—'} matters</div>
        <div className="masthead-row">
          <div>
            <h1 className="display masthead-title">Case index</h1>
            <p className="masthead-sub">
              Every row is proof-backed. Private amounts <span className="redacted redacted-sm">stay hidden</span> unless
              disclosed — totals carry a <span style={{ color: 'var(--verify)', fontWeight: 700 }}>✓ Valid</span> stamp.
            </p>
          </div>
          <div className="masthead-actions">
            <Link to="/audit" className="btn btn-ghost">Audit without wallet</Link>
            <Link to="/new" className="btn btn-primary">Open new case →</Link>
          </div>
        </div>
      </header>

      <section className="section" aria-label="Filter and results">
        <div className="filter-bar" style={{ paddingBottom: 4 }}>
          <div className="search-box">
            <span className="search-icon" aria-hidden="true">🔍</span>
            <input
              className="input"
              placeholder="Filter by title, ID, or case # — e.g. “batches” or “7”"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search cases"
              style={{ fontSize: '0.94rem', padding: '12px 14px 12px 38px' }}
            />
          </div>

          <div className="filter-pills">
            {(['all', 'open', 'sealed'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                className={`filter-pill ${statusFilter === mode ? 'active' : ''}`}
                onClick={() => setStatusFilter(mode)}
              >
                {mode === 'all' ? 'All matters' : mode === 'open' ? 'Active / Open' : 'Sealed'}
              </button>
            ))}
          </div>

          {q && (
            <button className="btn btn-ghost" onClick={() => setQ('')} style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
              Clear search
            </button>
          )}

          <span className="mono" style={{ marginLeft: 'auto', fontSize: '0.74rem', color: 'var(--muted)' }}>
            {filtered ? `${filtered.length} / ${cases?.length ?? 0} shown` : '—'}
          </span>
        </div>

        <div className="mono" style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="stamp stamp-verify stamp-small">Verified</span> proof-backed
          <span style={{ opacity: 0.4 }}>·</span>
          <span className="stamp stamp-pending stamp-small">Sealed</span> phase closed
          <span style={{ opacity: 0.4 }}>·</span>
          <span className="redacted redacted-sm">redacted</span> never on-chain
        </div>

        {error && (
          <div role="alert" style={{ padding: '16px 20px', borderRadius: 'var(--radius-md)', background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.35)', color: '#fb7185', fontSize: '0.92rem' }}>
            We couldn&apos;t load case files. <span style={{ color: 'var(--text-secondary)' }}>{error}</span>
            <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => { setError(null); setCases(null); listCases().then(setCases).catch((e) => setError(String(e))); }}>Retry</button>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.86rem', alignSelf: 'center' }}>or enable Demo for seeded files</span>
            </div>
          </div>
        )}
        {!cases && !error && (
          <div style={{ display: 'grid', gap: 10, padding: '16px 0' }}>
            <div className="skeleton" style={{ height: 56 }} />
            <div className="skeleton" style={{ height: 56, opacity: 0.7 }} />
            <div className="skeleton" style={{ height: 56, opacity: 0.4 }} />
          </div>
        )}

        {cases && cases.length === 0 && (
          <div className="empty-open">
            <div style={{ fontSize: '1.8rem' }}>🗂️</div>
            <h3>The ledger just reset</h3>
            <p>The API store is ephemeral and clears on cold start — expected on Vercel. On-chain totals remain. Add a case or switch on demo for seeded files.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/new" className="btn btn-primary">Open first case →</Link>
              <Link to="/dashboard" className="btn btn-secondary">Try demo folder</Link>
            </div>
          </div>
        )}

        {filtered && filtered.length === 0 && cases && cases.length > 0 && (
          <div className="empty-open" style={{ padding: '36px 20px' }}>
            <div style={{ fontSize: '1.5rem', opacity: 0.7 }}>🔍</div>
            <p style={{ margin: 0 }}>No files match “{q}” with current filter.</p>
            <button className="btn btn-ghost" onClick={() => { setQ(''); setStatusFilter('all'); }} style={{ marginTop: 8 }}>Clear search & filters</button>
          </div>
        )}

        {filtered && filtered.length > 0 && (
          <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
            <table className="queue-table">
              <thead>
                <tr>
                  <th>matter</th>
                  <th>record</th>
                  <th>trail</th>
                  <th>state</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td style={{ minWidth: 260 }}>
                      <Link to={`/cases/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <span className="queue-row-title" style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>{c.title}</span>
                      </Link>
                      <div style={{ marginTop: 4, fontSize: '0.88rem', color: 'var(--muted)', maxWidth: '52ch', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</div>
                    </td>
                    <td>
                      <span className="mono" style={{ fontSize: '0.74rem', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.35)', color: 'var(--cyan)', padding: '4px 10px', borderRadius: 999, fontWeight: 700 }}>
                        #{c.receipts[0]?.caseIndex ?? c.id.slice(0, 6)}
                      </span>
                      <div className="queue-row-sub">{c.receipts.length} inserts · {fmtDate(c.createdAt)}</div>
                    </td>
                    <td>
                      <span className="redacted redacted-sm">private</span>
                      <span style={{ color: 'var(--muted)', fontSize: '0.84rem' }}> → </span>
                      <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--verify)', fontWeight: 700 }}>total verified</span>
                    </td>
                    <td>{c.status === 'closed' ? <span className="badge badge-pending">Sealed</span> : <span className="badge badge-verify">Open</span>}</td>
                    <td><Link to={`/cases/${c.id}`} className="btn btn-ghost" style={{ padding: '8px 14px' }}>Dossier →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
