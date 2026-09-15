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

  useEffect(() => {
    if (isDemo) { setCases(mockCases); return; }
    listCases().then(setCases).catch((e) => setError(String(e)));
  }, [isDemo, mockCases]);

  useEffect(() => { if (isDemo) setCases(mockCases); }, [isDemo, mockCases]);

  const filtered = useMemo(() => {
    if (!cases) return null;
    const s = q.trim().toLowerCase();
    if (!s) return cases;
    return cases.filter((c) =>
      [c.title, c.id, c.description, String(c.receipts[0]?.caseIndex ?? '')].some((v) => v.toLowerCase().includes(s))
    );
  }, [cases, q]);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 className="display" style={{ margin: 0, fontSize: '1.6rem', color: 'var(--paper)', lineHeight: 1 }}>Case files</h1>
          <p style={{ margin: '6px 0 0', color: 'var(--muted-ink)', fontSize: '0.9rem' }}>
            Folder inserts on ledger {isDemo && <span style={{ color: 'var(--verify)' }}>· Demo — not on-chain</span>} · amounts <span className="redacted redacted-sm">redacted</span> unless disclosed
          </p>
        </div>
        <Link to="/new" className="btn btn-primary">Open new case</Link>
      </div>

      <div className="ledger">
        <div className="ledger-head" style={{ gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: '1 1 260px' }}>
            <input
              className="input"
              placeholder="Search title, ID or case #"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search cases"
              style={{ maxWidth: 360 }}
            />
            {q && <button className="btn btn-ghost" onClick={() => setQ('')} style={{ padding: '6px 10px' }}>Clear</button>}
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted-ink)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {filtered ? `${filtered.length} / ${cases?.length ?? 0}` : '—'}
          </span>
        </div>

        <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--line-ink)', background: 'rgba(255,255,255,0.02)', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--muted-ink)' }}>
          <span className="stamp stamp-verify stamp-small">Verified</span> proof-backed row
          <span style={{ opacity: 0.5 }}>·</span>
          <span className="stamp stamp-pending stamp-small">Pending</span> not yet disclosed
        </div>

        {error && <div style={{ padding: 14, color: '#ff8d7a', fontSize: '0.88rem' }}>{error}</div>}
        {!cases && !error && <div style={{ padding: 18, color: 'var(--muted-ink)' }}>Loading folder…</div>}

        {cases && cases.length === 0 && (
          <div className="empty" style={{ margin: 12 }}>
            <div className="empty-icon">🗂️</div>
            <h3 className="empty-title">Ledger just reset</h3>
            <p className="empty-text">
              The API store is ephemeral and clears on cold start — expected on Vercel. Your on-chain totals remain. Add a case or switch on demo for seeded files.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/new" className="btn btn-primary">Open first case</Link>
              <Link to="/dashboard" className="btn btn-secondary">Try demo folder</Link>
            </div>
          </div>
        )}

        {filtered && filtered.length === 0 && cases && cases.length > 0 && (
          <div style={{ padding: 22, textAlign: 'center', color: 'var(--muted-ink)' }}>
            No files match “{q}”. <button className="btn btn-ghost" onClick={() => setQ('')} style={{ padding: '4px 8px' }}>Clear search</button>
          </div>
        )}

        {filtered && filtered.length > 0 && (
          <div>
            {filtered.map((c) => (
              <Link key={c.id} to={`/cases/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="ledger-row" style={{ alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--paper)' }}>{c.title}</strong>
                      <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted-ink)', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--line-ink)', padding: '2px 6px', borderRadius: 3 }}>
                        #{c.receipts[0]?.caseIndex ?? c.id.slice(0, 6)}
                      </span>
                      <span style={{ fontSize: '0.76rem', color: 'var(--muted-ink)' }}>· {c.receipts.length} insert{c.receipts.length === 1 ? '' : 's'} · {fmtDate(c.createdAt)}</span>
                    </div>
                    <div style={{ marginTop: 4, fontSize: '0.86rem', color: 'var(--muted-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.description}</div>
                    <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span className="redacted redacted-sm">private amount</span>
                      <span style={{ color: 'var(--muted-ink)', fontSize: '0.78rem' }}>→</span>
                      <code className="mono" style={{ fontSize: '0.78rem', background: 'var(--verify-soft)', border: '1px solid var(--verify-border)', padding: '1px 6px', borderRadius: 3, color: 'var(--verify)', fontWeight: 700 }}>total verified</code>
                    </div>
                  </div>
                  <span className={`stamp ${c.status === 'closed' ? 'stamp-pending' : 'stamp-verify'} stamp-small`} style={{ flexShrink: 0, marginTop: 2 }}>{c.status === 'closed' ? 'Sealed' : 'Open'}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link to="/new" className="btn btn-primary">Open a new case</Link>
        <Link to="/audit" className="btn btn-ghost">Audit without wallet</Link>
      </div>
    </>
  );
}
