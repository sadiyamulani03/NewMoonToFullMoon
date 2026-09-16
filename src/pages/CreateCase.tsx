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
    if (!title.trim()) { setError('A case title is required.'); return; }
    setBusy(true); setError(null);
    try {
      if (isDemo) {
        const nextIdx = Math.floor(Math.random() * 900) + 20;
        const newId = demoOpenCase(BigInt(nextIdx), title.trim(), description.trim());
        navigate(`/cases/${newId}`); return;
      }
      const created = await createCase({ title: title.trim(), description: description.trim(), owner: owner.trim() || 'acc-labs' });
      navigate(`/cases/${created.id}`);
    } catch (err) { setError((err as Error).message); setBusy(false); }
  }

  return (
    <>
      {isDemo && (
        <div className="demo-bar">
          <span><strong style={{ color: 'var(--verify)' }}>Demo — not on-chain</strong> <span style={{ color: 'var(--muted-ink)' }}>New folder is in-memory only — no wallet, no gas.</span></span>
        </div>
      )}

      <section className="inspect" style={{ maxWidth: 640 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-ink)' }}>New folder</div>
            <h1 className="display" style={{ margin: '4px 0 6px', fontSize: '1.35rem', color: 'var(--paper)', lineHeight: 1 }}>Open a new case</h1>
            <p style={{ margin: 0, color: 'var(--muted-ink)', fontSize: '0.9rem', lineHeight: 1.5 }}>Pick a label. The number goes on-chain; details stay off-chain. Amounts you log later stay <span className="redacted redacted-sm">redacted</span>.</p>
          </div>
          <span className="stamp stamp-verify stamp-small" style={{ flexShrink: 0 }}>New file</span>
        </div>

        <form onSubmit={onSubmit} style={{ marginTop: 16, display: 'grid', gap: 12 }}>
          <div>
            <label className="field-label" htmlFor="case-title">Case title <span aria-hidden="true" style={{ color: 'var(--verify)' }}>*</span></label>
            <input id="case-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Northstar fund-tracing drill" required aria-required="true" autoFocus />
          </div>
          <div>
            <label className="field-label" htmlFor="case-desc">Description <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--muted-ink)' }}>(off-chain, never on ledger)</span></label>
            <textarea id="case-desc" className="input" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this case tracking? Only the case number and proofs are on-chain." style={{ resize: 'vertical' }} />
          </div>
          <div>
            <label className="field-label" htmlFor="case-owner">Owner (optional, off-chain)</label>
            <input id="case-owner" className="input" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="acc-labs" />
          </div>

          {error && <div role="alert" style={{ color: '#ff8d7a', fontSize: '0.88rem', padding: '8px 10px', border: '1px solid rgba(255,141,122,0.25)', borderRadius: 4, background: 'rgba(255,141,122,0.08)' }}>{error}</div>}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
            <button className="btn btn-primary" type="submit" disabled={busy} aria-busy={busy}>{busy ? 'Creating…' : 'Create case — new folder'}</button>
            <Link
              className="btn btn-secondary"
              to="/cases"
              onClick={(e) => {
                const hasContent = title.trim() !== '' || description.trim() !== '' || (owner.trim() !== '' && owner.trim() !== 'acc-labs');
                if (hasContent && !window.confirm('Discard this case? Any text you entered will be lost.')) e.preventDefault();
              }}
            >
              Cancel
            </Link>
          </div>

          <div className="wire" style={{ marginTop: 4, fontSize: '0.76rem', lineHeight: 1.6 }}>
            <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted-ink)' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--verify)' }} /> Next steps</span><br />
            After creation: <span className="mono" style={{ color: 'var(--paper)', background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 3 }}>Cases → #</span> → <span className="redacted redacted-sm">private amount</span> → <code className="mono" style={{ fontSize: '0.76rem' }}>total</code> with <span className="stamp stamp-verify stamp-small" style={{ verticalAlign: 'middle' }}>Verified</span>. Nothing private ever appears on-chain.
          </div>
        </form>
      </section>
    </>
  );
}
