import { Link } from 'react-router-dom';

export default function About() {
  return (
    <>
      <header className="masthead">
        <div className="eyebrow">Field guide · how MidnightTrace holds truth</div>
        <h1 className="display masthead-title" style={{ maxWidth: '16ch' }}>Private proof, public trust.</h1>
        <p className="masthead-sub" style={{ maxWidth: '64ch' }}>
          Step amounts stay <span className="redacted redacted-sm">redacted</span> — black bars, not blur. The ledger shows a
          total that is <span style={{ color: 'var(--verify)', fontWeight: 700 }}>✓ Verified</span> by a ZK proof, not by trust.
        </p>
      </header>

      <section className="section">
        <div className="section-head">
          <h2>What is public, what stays redacted</h2>
          <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>The one rule</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }} className="about-3">
          <div>
            <div className="mono" style={{ fontSize: '0.66rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--verify)', fontWeight: 700 }}>Public — on-chain</div>
            <ul style={{ margin: '10px 0 0', paddingLeft: 18, color: 'var(--muted)', fontSize: '0.92rem', lineHeight: 1.75 }}>
              <li><code className="mono">total</code> per case</li>
              <li><code className="mono">lastDisclosed</code> only on disclose</li>
              <li>Phase, event count, <code className="mono">aggregate</code></li>
              <li>Allowlist root (membership hash)</li>
            </ul>
          </div>
          <div style={{ borderLeft: '1px solid var(--line)', paddingLeft: 32 }}>
            <div className="mono" style={{ fontSize: '0.66rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, background: 'var(--ink)', color: 'var(--paper)', display: 'inline-block', padding: '3px 8px', borderRadius: 4 }}>Private — never on-chain</div>
            <ul style={{ margin: '10px 0 0', paddingLeft: 18, color: 'var(--muted)', fontSize: '0.92rem', lineHeight: 1.75 }}>
              <li>Step <span className="redacted">amount a1</span> <span className="redacted">a2</span></li>
              <li>Member secrets / identities</li>
              <li>Case descriptions (off-chain only)</li>
              <li><span className="redacted redacted-sm">██ 18 ██</span> — a black bar, not a number</li>
            </ul>
          </div>
          <div style={{ borderLeft: '1px solid var(--line)', paddingLeft: 32 }}>
            <div className="mono" style={{ fontSize: '0.66rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--blue)', fontWeight: 700 }}>Proved in ZK</div>
            <ul style={{ margin: '10px 0 0', paddingLeft: 18, color: 'var(--muted)', fontSize: '0.92rem', lineHeight: 1.75 }}>
              <li><code className="mono">total&apos; = total + amount</code></li>
              <li>Caller on private allowlist (Merkle proof)</li>
              <li>Disclosed total matches hidden total</li>
            </ul>
            <p style={{ margin: '12px 0 0', fontSize: '0.88rem', color: 'var(--muted)' }}>
              Observer sees: “a proof moved <code className="mono">total</code> by <span className="redacted redacted-sm">hidden</span>.” Proof is <span style={{ color: 'var(--verify)', fontWeight: 700 }}>✓ Verified</span>.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>The wire — private → ZK → verifiable</h2>
            <p>Judge-readable in 60 seconds. No cryptography degree required.</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: 12, alignItems: 'stretch', textAlign: 'center' }}>
          <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 14, padding: '22px 16px' }}>
            <div className="mono" style={{ fontSize: '0.64rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>🔒 Private</div>
            <div style={{ marginTop: 8, fontSize: '0.9rem', color: 'rgba(244,239,228,0.75)', lineHeight: 1.6 }}>Sensitive input<br /><span className="redacted redacted-sm" style={{ background: '#000' }}>amount</span> · witness<br />Your device only</div>
          </div>
          <span style={{ alignSelf: 'center', color: 'var(--blue)', fontWeight: 700, fontSize: '1.2rem' }}>→</span>
          <div style={{ background: 'var(--blue-soft)', border: '1.5px solid var(--blue)', borderRadius: 14, padding: '22px 16px' }}>
            <div className="mono" style={{ fontSize: '0.64rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--blue)', fontWeight: 700 }}>Midnight · ZK proof</div>
            <div style={{ marginTop: 8, fontSize: '0.9rem', lineHeight: 1.6 }}><code className="mono">total&apos; = total + amount</code><br />Membership proved</div>
          </div>
          <span style={{ alignSelf: 'center', color: 'var(--verify)', fontWeight: 700, fontSize: '1.2rem' }}>→</span>
          <div style={{ background: 'var(--verify-soft)', border: '1.5px solid var(--verify-border)', borderRadius: 14, padding: '22px 16px' }}>
            <div className="mono" style={{ fontSize: '0.64rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--verify)', fontWeight: 700 }}>✓ Verifiable</div>
            <div style={{ marginTop: 8, fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.6 }}><code className="mono">total</code> · phase · aggregate<br />No secret revealed ✓</div>
          </div>
        </div>
        <ol style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 10, color: 'var(--muted)', fontSize: '0.94rem', lineHeight: 1.7, maxWidth: '72ch' }}>
          <li><strong style={{ color: 'var(--ink)' }}>You pick a private amount.</strong> It never leaves your wallet — redacted on every screen.</li>
          <li><strong style={{ color: 'var(--ink)' }}>Your wallet builds a proof.</strong> It proves <em>“new total = old total + my amount”</em> without leaking the amount.</li>
          <li><strong style={{ color: 'var(--ink)' }}>Chain checks, then stores total.</strong> If the proof verifies, the ledger accepts the new total.</li>
          <li><strong style={{ color: 'var(--ink)' }}>Anyone verifies wallet-free at /audit.</strong> The checklist is public; amounts stay redacted forever.</li>
        </ol>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Worked example — three hidden batches in case #07</h2>
            <p>What you type, what the chain sees. Amounts on the left never appear on the right.</p>
          </div>
          <span className="badge badge-verify">Provably real</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="queue-table">
            <thead><tr><th>step</th><th>what you enter</th><th>what goes on-chain</th></tr></thead>
            <tbody>
              {[
                { s: 'Open #07', priv: '—', pub: 'case #07 ACTIVE · total 0' },
                { s: 'Batch 1', priv: '████ a1', pub: 'total = a1 → ✓ Verified' },
                { s: 'Batch 2', priv: '████ a2', pub: 'total = a1+a2 → ✓ Verified' },
                { s: 'Batch 3', priv: '████ a3', pub: 'total = a1+a2+a3 → ✓ Verified' },
                { s: 'Disclose', priv: '(optional publish)', pub: 'lastDisclosed = total' },
                { s: 'Close', priv: '—', pub: 'phase CLOSED → Sealed' },
              ].map((r) => (
                <tr key={r.s}>
                  <td style={{ fontWeight: 700 }}>{r.s}</td>
                  <td>{r.priv.includes('████') ? <span className="redacted redacted-sm">{r.priv}</span> : <span style={{ color: 'var(--muted)' }}>{r.priv}</span>}</td>
                  <td className="mono" style={{ fontSize: '0.86rem' }}>{r.pub}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="wire-strip">
          <span>Ledger shows <code className="mono">total = 42</code> (example). Never <span className="redacted redacted-sm">a1</span> <span className="redacted redacted-sm">a2</span>.</span>
          <span style={{ marginLeft: 'auto' }}><Link to="/audit?case=7" style={{ fontWeight: 700 }}>Audit case #07 →</Link></span>
        </div>
      </section>

      <section className="section">
        <div className="section-head"><h2>Ledger language</h2></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0 40px' }}>
          {[
            ['Aggregate', 'Σ of all case totals on-chain. Visible to anyone.'],
            ['Allowlist', 'Merkle tree of member commitments; membership proved in ZK.'],
            ['Commitment', 'Persistent hash of a secret — stored, secret never stored.'],
            ['Zero-knowledge proof', 'Proves a statement true without revealing hidden data.'],
            ['Redacted', 'Black bar — private amount never leaves device, never on-chain.'],
            ['Verified', 'Green stamp — ZK proof checked out, total is trustworthy.'],
            ['Disclosed', 'Ochre stamp — running total the owner chose to publish.'],
            ['Phase', 'ACTIVE (open) or CLOSED (sealed — totals permanent).'],
          ].map(([k, v]) => (
            <div key={k} style={{ padding: '14px 0', borderBottom: '1px solid var(--line-soft)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem' }}>{k}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
          <Link to="/cases" className="btn btn-primary">Go to cases →</Link>
          <Link to="/audit" className="btn btn-secondary">Auditor — no wallet</Link>
        </div>
      </section>
      <style>{`@media(max-width:860px){.about-3{grid-template-columns:1fr !important;}.about-3>div{border-left:none !important;padding-left:0 !important;border-top:1px solid var(--line);padding-top:20px;}.about-3>div:first-child{border-top:none;padding-top:0;}}`}</style>
    </>
  );
}
