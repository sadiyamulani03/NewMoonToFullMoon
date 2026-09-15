import { Link, useNavigate } from 'react-router-dom';
import { useDemo } from '../context/DemoContext';

export default function Landing() {
  const { isDemo, enableDemo } = useDemo();
  const navigate = useNavigate();
  const goDemo = () => { if (!isDemo) enableDemo(); navigate('/dashboard'); };

  return (
    <>
      {/* HERO — concrete redacted entry being verified */}
      <section style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.9fr', gap: 22, alignItems: 'start' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>
            Midnight Preprod · Private by default · Verifiable without secrets
          </div>
          <h1 className="display" style={{ fontSize: 'clamp(2rem, 4vw, 2.9rem)', lineHeight: 0.98, letterSpacing: '-0.03em', margin: 0, color: 'var(--text-ink)' }}>
            Prove the math.<br />Redact the evidence.
          </h1>
          <p style={{ margin: '14px 0 0', color: 'var(--muted)', maxWidth: '52ch', fontSize: '1.02rem', lineHeight: 1.6 }}>
            MidnightTrace is a folder of case files on Midnight. Each finding is a <strong style={{ color: 'var(--text-ink)' }}>zero-knowledge proof</strong>: the ledger shows you counted, not <em>what</em> you counted.
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
            <Link to="/dashboard" className="btn btn-primary">Launch app</Link>
            <button className="btn btn-cream" onClick={goDemo}>{isDemo ? 'Open demo dashboard' : 'Try demo — no wallet'}</button>
            <Link to="/audit" className="btn btn-ghost">Verify a case — no login</Link>
          </div>
          <div style={{ marginTop: 12, fontSize: '0.82rem', color: 'var(--muted)' }}>
            Wallet-free verification at <Link to="/audit" style={{ fontWeight: 600 }}>/audit</Link> · Privacy model lives on <Link to="/about" style={{ fontWeight: 600 }}>/about</Link> only.
          </div>
        </div>

        {/* Redacted ledger entry being verified — the anchor visual */}
        <div className="ledger" style={{ position: 'relative' }}>
          <div className="ledger-head">
            <span className="ledger-title">Case #07 · Exhibit ledger</span>
            <span className="stamp stamp-verify stamp-small">Verified</span>
          </div>

          <div style={{ padding: '14px 14px 12px', display: 'grid', gap: 10, fontSize: '0.88rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 8, alignItems: 'center' }}>
              <span className="ledger-label">Filed</span>
              <span className="mono" style={{ fontSize: '0.82rem' }}>2026-09-14 · block 412,320 · preprod</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 8, alignItems: 'center' }}>
              <span className="ledger-label">Finding</span>
              <span>Hidden batch <span className="redacted">██ 42 units ██</span> added</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 8, alignItems: 'center' }}>
              <span className="ledger-label">Public total</span>
              <span><code className="mono" style={{ background: 'var(--verify-soft)', border: '1px solid var(--verify-border)', padding: '2px 6px', borderRadius: 3, fontWeight: 700 }}>42</code> <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>(was 0 → now 42)</span></span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 8, alignItems: 'center' }}>
              <span className="ledger-label">Receipt</span>
              <span className="mono" style={{ fontSize: '0.78rem', wordBreak: 'break-all' }}>a3f1…9c02 · <span className="redacted redacted-sm">amount redacted</span> · proof <span style={{ color: 'var(--verify)', fontWeight: 700 }}>✓ valid</span></span>
            </div>
          </div>

          <div style={{ padding: '10px 14px', borderTop: '1px solid var(--line)', background: 'var(--paper-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              Wire: <span className="wire-proof">ZK proof</span> → <span className="redacted redacted-sm">amount</span> → <span className="wire-total">total' = total + amount</span>
            </span>
            <span className="stamp stamp-verify" style={{ transform: 'rotate(-3deg)', fontSize: '0.62rem', padding: '4px 8px' }}>Proof confirmed</span>
          </div>
        </div>
      </section>

      {/* 4-step process */}
      <section>
        <h2 className="display" style={{ fontSize: '1.45rem', margin: '6px 0 14px', color: 'var(--text-ink)' }}>How a case moves — 30 seconds</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12 }}>
          {[
            { n: '01', t: 'Open case', d: 'Pick a number. The case ID goes on-chain; title stays off-chain.' },
            { n: '02', t: 'Log finding', d: 'Enter a private amount. Your wallet proves total\' = total + amount.' },
            { n: '03', t: 'Disclose', d: 'Publish only the running total you choose. Else it stays redacted.' },
            { n: '04', t: 'Verify', d: 'Anyone opens /audit — no wallet — and checks the math.' },
          ].map((s) => (
            <div key={s.n} style={{ border: '1px solid var(--line)', borderRadius: 4, padding: '14px 12px', background: 'white', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className="mono" style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--blue)' }}>{s.n}</span>
              <strong style={{ fontSize: '0.98rem', color: 'var(--text-ink)' }}>{s.t}</strong>
              <span style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.5 }}>{s.d}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: '0.82rem', color: 'var(--muted)' }}>
          Each step is a folder insert: <span className="redacted redacted-sm">private amount</span> → public <code className="mono" style={{ fontSize: '0.82rem' }}>total</code> with a <span className="stamp stamp-verify stamp-small" style={{ verticalAlign: 'middle', marginLeft: 4 }}>Verified</span> stamp.
        </div>
      </section>

      {/* Single CTA */}
      <section style={{ border: '1px solid var(--ink)', borderRadius: 6, background: 'var(--ink)', color: 'var(--paper)', padding: '20px 18px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h3 className="display" style={{ margin: '0 0 6px', fontSize: '1.35rem', color: 'var(--paper)' }}>Try it with zero setup.</h3>
          <p style={{ margin: 0, color: 'rgba(237,231,216,0.82)', fontSize: '0.92rem' }}>Mock ledger in demo, real proofs on Preprod with Lace / 1AM + tNIGHT.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn" onClick={goDemo} style={{ background: 'var(--paper)', color: 'var(--ink)', borderColor: 'var(--paper)' }}>{isDemo ? 'Open demo dashboard' : 'Try demo — no wallet'}</button>
          <Link to="/dashboard" className="btn" style={{ background: 'transparent', color: 'var(--paper)', borderColor: 'rgba(237,231,216,0.25)' }}>Launch app</Link>
          <a href="https://faucet.preprod.midnight.network" target="_blank" rel="noreferrer" className="btn" style={{ background: 'transparent', color: 'var(--paper)', borderColor: 'rgba(237,231,216,0.18)' }}>Get tNIGHT</a>
        </div>
      </section>

      <style>{`@media(max-width: 860px){ section[style*="1.15fr"]{ grid-template-columns:1fr !important } }`}</style>
    </>
  );
}
