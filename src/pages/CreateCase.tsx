import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createCase } from '../lib/api';
import { useDemo } from '../context/DemoContext';

const STEPS = [
  { n: '01', t: 'Name the matter', d: 'Public title + owner. Only a hash touches the chain.' },
  { n: '02', t: 'Add context', d: 'Off-chain description. Never on-chain — for reviewers only.' },
  { n: '03', t: 'Review privacy', d: 'Confirm what stays redacted and what becomes public.' },
  { n: '04', t: 'File the case', d: 'Create the folder. Evidence comes next, in the dossier.' },
];

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
    } catch (err: unknown) {
      setError(String((err as Error).message || err));
    } finally { setBusy(false); }
  };

  return (
    <>
      <header className="masthead">
        <div className="eyebrow">New matter · guided filing · {step} of 4</div>
        <h1 className="display masthead-title">File a new case.</h1>
        <p className="masthead-sub">Four moves. Nothing sensitive touches the chain — you&apos;re opening a folder, not uploading evidence.</p>
        <div className="progress-hairline" aria-hidden="true"><i style={{ width: `${(step / 4) * 100}%` }} /></div>
      </header>

      <div className="flow">
        {/* LEFT — vertical stepper rail */}
        <ol className="flow-steps" style={{ listStyle: 'none', margin: 0, padding: 0 }} aria-label="Filing progress">
          {STEPS.map((s, i) => {
            const idx = i + 1;
            const cls = idx < step ? 'flow-step done' : idx === step ? 'flow-step current' : 'flow-step';
            return (
              <li key={s.n} className={cls}>
                <span className="flow-num">{idx < step ? '✓' : s.n}</span>
                <span>
                  <span className="flow-step-t">{s.t}</span>
                  <span className="flow-step-d" style={{ display: 'block' }}>{s.d}</span>
                  {idx < step && (
                    <button className="btn btn-ghost" style={{ padding: '2px 0', fontSize: '0.78rem' }} onClick={() => setStep(idx)}>Edit →</button>
                  )}
                </span>
              </li>
            );
          })}
        </ol>

        {/* RIGHT — open canvas, no card */}
        <form onSubmit={onSubmit} className="flow-canvas">
          {step === 1 && (
            <div>
              <h2>What is this matter called?</h2>
              <p style={{ color: 'var(--muted)', maxWidth: '56ch' }}>A concise public name. Think folder tab — “Northstar fund-tracing drill”, not a paragraph.</p>
              <div className="flow-field">
                <label className="field-label" htmlFor="case-title">Case title · public</label>
                <input id="case-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Northstar fund-tracing drill" required aria-required="true" autoFocus maxLength={80} />
                <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 8 }}>{title.length}/80 · min 3 chars · on-chain: only a hash of this</div>
              </div>
              <div className="flow-field">
                <label className="field-label" htmlFor="case-owner">Owner handle</label>
                <input id="case-owner" className="input" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="acc-labs  (defaults to anonymous)" style={{ maxWidth: 420 }} />
              </div>
              <div className="flow-nav">
                <Link to="/cases" className="btn btn-ghost">← Cancel</Link>
                <button type="button" className="btn btn-primary" onClick={() => canNext1 && setStep(2)} disabled={!canNext1} style={{ marginLeft: 'auto', minWidth: 180 }}>Continue →</button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <h2>Give reviewers context.</h2>
              <p style={{ color: 'var(--muted)', maxWidth: '56ch' }}>Off-chain only. This never touches the ledger — it lives in the case folder so collaborators know what “done” looks like.</p>
              <div className="flow-field">
                <label className="field-label" htmlFor="case-desc">Description · off-chain, min 10 chars</label>
                <textarea id="case-desc" className="input" rows={6} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is being traced? What would a verified total prove? Who reviews it?" style={{ fontSize: '17px', lineHeight: 1.65 }} />
                <div className="mono" style={{ fontSize: '0.72rem', color: canNext2 ? 'var(--verify)' : 'var(--muted)', marginTop: 8 }}>{description.trim().length} chars {canNext2 ? '✓ ready' : '· keep going'}</div>
              </div>
              <div style={{ marginTop: 20, padding: '16px 18px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 12, fontFamily: 'var(--font-mono)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                <span className="redacted redacted-sm">████ amount</span>
                <span style={{ color: 'var(--text-secondary)' }}> — evidence amounts are added later, inside the dossier, and never leave your device.</span>
              </div>
              <div className="flow-nav">
                <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button type="button" className="btn btn-primary" onClick={() => canNext2 && setStep(3)} disabled={!canNext2} style={{ marginLeft: 'auto', minWidth: 180 }}>Review privacy →</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h2>Check the privacy split.</h2>
              <p style={{ color: 'var(--muted)', maxWidth: '56ch' }}>Before filing, confirm what the world will see — and what it never will.</p>
              <div style={{ marginTop: 24, borderTop: '1px solid var(--line-strong)' }}>
                {[
                  { k: 'Title', v: title || '—', note: 'public label' },
                  { k: 'Owner', v: owner || 'anonymous', note: 'folder meta' },
                  { k: 'Description', v: `${description.trim().length} chars`, note: 'off-chain only' },
                  { k: 'On-chain', v: 'caseId + metadataHash', note: 'nothing sensitive' },
                  { k: 'Amounts', v: 'redacted', note: 'added later, stay local', red: true },
                ].map((r) => (
                  <div key={r.k} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '16px 0', borderBottom: '1px solid var(--line-soft)', fontSize: '0.95rem', alignItems: 'baseline' }}>
                    <span style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{r.k}</span>
                    <span style={{ textAlign: 'right' }}>
                      {r.red ? <span className="redacted redacted-sm">redacted</span> : <strong>{r.v}</strong>}
                      <span className="mono" style={{ display: 'block', fontSize: '0.7rem', color: 'var(--muted)' }}>{r.note}</span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="flow-nav">
                <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
                <button type="button" className="btn btn-primary" onClick={() => setStep(4)} style={{ marginLeft: 'auto', minWidth: 180 }}>Ready to file →</button>
              </div>
            </div>
          )}
          {step === 4 && (
            <div>
              <h2>File it.</h2>
              <p style={{ color: 'var(--muted)', maxWidth: '56ch' }}>Creates the folder{isDemo ? ' in the demo ledger (not on-chain)' : ' via API + on-chain openCase for the ledger index'}. You&apos;ll land in the dossier, ready to log the first hidden finding.</p>
              {error && <div role="alert" style={{ marginTop: 16, padding: '12px 14px', borderRadius: 10, background: 'rgba(163,46,31,0.07)', border: '1px solid rgba(163,46,31,0.22)', color: '#A32E1F', fontSize: '0.9rem' }}>{error}</div>}
              <div className="flow-nav">
                <button type="button" className="btn btn-ghost" onClick={() => setStep(3)}>← Back</button>
                <button type="submit" className="btn btn-primary" disabled={busy} style={{ marginLeft: 'auto', minWidth: 220, padding: '14px 24px' }}>{busy ? 'Filing…' : 'File case securely →'}</button>
              </div>
              <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 16 }}>{isDemo ? '● Demo — not on-chain' : 'Midnight Preprod · proof required at next step, not here'}</div>
            </div>
          )}
        </form>
      </div>
    </>
  );
}
