import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { createCase } from '../lib/api';
import { useDemo } from '../context/DemoContext';

export default function CreateCase() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState('acc-labs');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isDemo, demoOpenCase } = useDemo();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('A case title is required.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (isDemo) {
        const nextIdx = Math.floor(Math.random() * 900) + 20;
        const newId = demoOpenCase(BigInt(nextIdx), title.trim(), description.trim());
        navigate(`/cases/${newId}`);
        return;
      }
      const created = await createCase({
        title: title.trim(),
        description: description.trim(),
        owner: owner.trim() || 'acc-labs',
      });
      navigate(`/cases/${created.id}`);
    } catch (err: unknown) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <>
      {isDemo && (
        <div className="card" style={{ borderStyle: 'dashed', padding: '12px 16px' }}>
          <span className="info-label" style={{ background: 'rgba(139,224,175,0.15)', color: '#8be0af' }}>Demo — not on-chain</span>
          <span className="muted-text" style={{ marginLeft: 8, fontSize: '0.88rem' }}>New case is created in-memory only — no wallet, no gas.</span>
        </div>
      )}
      <form className="card" onSubmit={onSubmit}>
        <p className="section-head">
          <span className="section-no">02</span> Open a new case
        </p>

      <label className="form-label" htmlFor="case-title">
        Case title
      </label>
      <input
        id="case-title"
        className="form-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Northstar fund-tracing drill"
      />

      <label className="form-label" htmlFor="case-desc">
        Description
      </label>
      <textarea
        id="case-desc"
        className="form-input form-textarea"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What is this case tracking? The amount stays private; only proofs are on-chain."
      />

      <label className="form-label" htmlFor="case-owner">
        Owner (optional)
      </label>
      <input
        id="case-owner"
        className="form-input"
        value={owner}
        onChange={(e) => setOwner(e.target.value)}
        placeholder="acc-labs"
      />

      {error && <p className="error-text">{error}</p>}

      <div className="wallet-actions">
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Creating…' : 'Create case'}
        </button>
        <Link
          className="btn btn-secondary"
          to="/cases"
          onClick={(e) => {
            const hasContent = title.trim() !== '' || description.trim() !== '' || (owner.trim() !== '' && owner.trim() !== 'acc-labs');
            if (hasContent && !window.confirm('Discard this case? Any text you entered will be lost.')) {
              e.preventDefault();
            }
          }}
        >
          Cancel
        </Link>
      </div>
      </form>
    </>
  );
}