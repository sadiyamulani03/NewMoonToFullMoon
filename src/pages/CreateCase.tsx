import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createCase } from '../lib/api';
import { useDemo } from '../context/DemoContext';

export default function CreateCase() {
  const navigate = useNavigate();
  const { isDemo, demoOpenCase } = useDemo();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canNext1 = title.trim().length >= 3;
  const canNext2 = description.trim().length >= 10;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError(null);
    try {
      if (isDemo) {
        const cid = BigInt(Math.floor(Math.random() * 9000) + 10);
        const id = demoOpenCase(cid, title.trim(), description.trim());
        navigate(`/cases/${id}`);
        return;
      }
      const c = await createCase({ title: title.trim(), description: description.trim(), owner: owner.trim() || 'anonymous' });
      navigate(`/cases/${c.id}`);
    } catch (err: any) {
      setError(String(err.message || err));
    } finally { setBusy(false); }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', display: 'grid', gap: 24 }}>
      <div>
        <Link to="/cases" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted-ink)', textDecoration: 'none' }}>← Back to cases</Link>
        <h1 className="display" style={{ margin: '8px 0 0', fontSize: 'clamp(28px, 4vw, 36px)', color: 'var(--paper)', lineHeight: 1 }}>Create a case</h1>
        <p style={{ margin: '8px 0 0', color: 'var(--muted-ink)', fontSize: '0.92rem' }}>A focused workflow — private evidence stays on-device, only verification goes on-chain.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {[
          { n: '01', t: 'Case details' },
          { n: '02', t: 'Private evidence' },
          { n: '03', t: 'Review' },
          { n: '04', t: 'Submit' },
        ].map((s, i) => (
          <div key={s.n} style={{ padding: '12px', borderRadius: '10px', border: step === i + 1 ? '1px solid var(--ochre-border)' : '1px solid var(--line-ink)', background: step === i + 1 ? 'var(--ochre-soft)' : 'rgba(255,255,255,0.01)', textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.08em', color: step === i + 1 ? 'var(--ochre)' : 'var(--muted-ink)', fontWeight: 700 }}>{s.n}</div>
            <div style={{ fontSize: '0.84rem', fontWeight: 600, color: step === i + 1 ? 'var(--paper)' : 'var(--muted-ink)', marginTop: 4 }}>{s.t}</div>
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 20, border: '1px solid var(--line-ink)', borderRadius: '16px', padding: '20px', background: '#121824' }}>
        {step === 1 && (
          <div style={{ display: 'grid', gap: 14 }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--paper)' }}>Case details</h3>
            <div>
              <label className="field-label" htmlFor="case-title">Case title</label>
              <input id="case-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Northstar fund-tracing drill" required aria-required="true" autoFocus />
              <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)', marginTop: 4 }}>{title.length}/80 — concise, public</div>
            </div>
            <div>
              <label className="field-label" htmlFor="case-desc">Description</label>
              <textarea id="case-desc" className="input" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this case tracking? Only the title/ID will be hashed on-chain." style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label className="field-label" htmlFor="case-owner">Owner</label>
              <input id="case-owner" className="input" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="acc-labs" />
              <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)', marginTop: 4 }}>On-chain: only caseId + metadataHash</div>
            </div>
            <button type="button" className="btn btn-primary" onClick={() => canNext1 && setStep(2)} disabled={!canNext1} style={{ justifySelf: 'start' }}>Continue →</button>
          </div>
        )}
        {step === 2 && (
          <div style={{ display: 'grid', gap: 14 }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--paper)' }}>Private evidence</h3>
            <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--redact)', border: '1px solid var(--line-ink)', color: 'var(--muted-ink)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
              <span className="redacted redacted-sm">████ amount</span> — this witness never leaves your device. You will prove <code className="mono">total' = total + amount</code> without revealing amount.
            </div>
            <p style={{ margin: 0, color: 'var(--muted-ink)', fontSize: '0.88rem' }}>Evidence will be added after the case is created — in the case workspace, where you can log findings privately.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button type="button" className="btn btn-primary" onClick={() => canNext2 && setStep(3)} disabled={!canNext2}>Review →</button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div style={{ display: 'grid', gap: 14 }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--paper)' }}>Review</h3>
            <div style={{ display: 'grid', gap: 8, padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line-ink)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}><span style={{ color: 'var(--muted-ink)' }}>Title</span><strong style={{ color: 'var(--paper)' }}>{title || '—'}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}><span style={{ color: 'var(--muted-ink)' }}>Owner</span><span className="mono" style={{ color: 'var(--paper)' }}>{owner || 'anonymous'}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}><span style={{ color: 'var(--muted-ink)' }}>Privacy</span><span className="badge badge-private">Private witness</span></div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
              <button type="button" className="btn btn-primary" onClick={() => setStep(4)}>Review case →</button>
            </div>
          </div>
        )}
        {step === 4 && (
          <div style={{ display: 'grid', gap: 14 }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--paper)' }}>Submit securely</h3>
            <p style={{ margin: 0, color: 'var(--muted-ink)', fontSize: '0.88rem' }}>Case creation will be recorded on-chain as <code className="mono">caseId</code> + <code className="mono">metadataHash</code>. No sensitive amount yet.</p>
            {error && <div role="alert" style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.18)', color: '#ff8d7a', fontSize: '0.84rem' }}>{error}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setStep(3)}>← Back</button>
              <button type="submit" className="btn btn-primary" disabled={busy} style={{ flex: 1, justifyContent: 'center' }}>{busy ? 'Creating…' : 'Submit securely →'}</button>
            </div>
            <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)', textAlign: 'center' }}>{isDemo ? 'Demo — not on-chain' : 'Midnight Preprod · proof required'}</div>
          </div>
        )}
      </form>
    </div>
  );
}
