import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { listCases, type ForensicCase } from '../lib/api';

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Cases() {
  const [cases, setCases] = useState<ForensicCase[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listCases().then(setCases).catch((e: unknown) => setError(String(e)));
  }, []);

  return (
    <>
      <section className="card">
        <p className="section-head">
          <span className="section-no">02</span> Cases
        </p>
        {error && <p className="error-text">{error}</p>}
        {!cases && !error && <p className="muted-text">Loading cases…</p>}
        {cases && cases.length === 0 && <p className="muted-text">No cases yet — open the first one.</p>}
        {cases && cases.length > 0 && (
          <ul className="case-list">
            {cases.map((c) => (
              <li key={c.id}>
                <Link className="case-row" to={`/cases/${c.id}`}>
                  <div>
                    <strong className="case-title">{c.title}</strong>
                    <span className="info-label">
                      {' '}
                      · {c.receipts.length} proof{c.receipts.length === 1 ? '' : 's'} · opened {fmtDate(c.createdAt)}
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
      <Link className="btn btn-primary" to="/new">
        Open a new case
      </Link>
    </>
  );
}