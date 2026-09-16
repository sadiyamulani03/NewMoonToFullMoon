import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="ledger" style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-ink)' }}>404 · Not found</div>
      <h1 className="display" style={{ margin: '12px 0 8px', fontSize: '1.8rem', color: 'var(--paper)' }}>This folder doesn’t exist</h1>
      <p style={{ color: 'var(--muted-ink)', maxWidth: '52ch', margin: '0 auto 18px', lineHeight: 1.6 }}>
        The page you requested isn’t on the ledger. Your case files and on-chain state are safe.
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/" className="btn btn-primary">Go to Landing</Link>
        <Link to="/dashboard" className="btn btn-secondary">Open Dashboard</Link>
        <Link to="/audit" className="btn btn-ghost">Audit — no wallet</Link>
      </div>
    </div>
  );
}
