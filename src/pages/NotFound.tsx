import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '72px 24px', maxWidth: 640, margin: '0 auto' }}>
      <div className="eyebrow" style={{ justifyContent: 'center' }}>404 · Not found</div>
      <h1 className="display" style={{ margin: '16px 0 8px', fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>This folder doesn&apos;t exist</h1>
      <p style={{ color: 'var(--muted)', maxWidth: '52ch', margin: '0 auto 24px', lineHeight: 1.6 }}>
        The page you requested isn&apos;t on the ledger. Your case files and on-chain state are safe.
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/" className="btn btn-secondary">Landing</Link>
        <Link to="/dashboard" className="btn btn-primary">Open workspace →</Link>
        <Link to="/audit" className="btn btn-ghost">Audit — no wallet</Link>
      </div>
    </div>
  );
}
