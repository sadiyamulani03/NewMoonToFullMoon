import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { createCase } from '../lib/api';

export default function CreateCase() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState('acc-labs');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('A case title is required.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
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
        <Link className="btn btn-secondary" to="/cases">
          Cancel
        </Link>
      </div>
    </form>
  );
}