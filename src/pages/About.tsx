import { Link } from 'react-router-dom';

export default function About() {
  return (
    <>
      <header className="masthead">
        <div className="eyebrow eyebrow-verify">Field guide · Zero-Knowledge Cryptography on Midnight</div>
        <h1 className="display masthead-title" style={{ maxWidth: '18ch' }}>Private proof, public trust.</h1>
        <p className="masthead-sub" style={{ maxWidth: '66ch' }}>
          Step amounts stay <span className="redacted redacted-sm">redacted</span> on your device. The public ledger records only a
          running total that is <span style={{ color: 'var(--verify)', fontWeight: 700 }}>✓ Verified</span> by a zero-knowledge SNARK proof.
        </p>
      </header>

      <section className="section">
        <div className="section-head">
          <h2>What is public, what stays redacted</h2>
          <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--cyan)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>Cryptographic Rules</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }} className="about-3">
          <div>
            <div className="mono" style={{ fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--verify)', fontWeight: 700 }}>
              ✓ Public — On-Chain
            </div>
            <ul style={{ margin: '12px 0 0', paddingLeft: 18, color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.75 }}>
              <li><code className="mono">total</code> per case dossier</li>
              <li><code className="mono">lastDisclosed</code> only when owner publishes</li>
              <li>Phase (ACTIVE/CLOSED), event count, <code className="mono">aggregate</code></li>
              <li>Allowlist Merkle root (membership anchor)</li>
            </ul>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: 32 }}>
            <div className="mono" style={{ fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff', display: 'inline-block', padding: '3px 10px', borderRadius: 6 }}>
              🔒 Private — Never Transmitted
            </div>
            <ul style={{ margin: '12px 0 0', paddingLeft: 18, color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.75 }}>
              <li>Step <span className="redacted">amount a1</span> <span className="redacted">a2</span></li>
              <li>Investigator member secrets & identities</li>
              <li>Case descriptions & notes (off-chain only)</li>
              <li><span className="redacted redacted-sm">██ 18 ██</span> — cryptographically shielded</li>
            </ul>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: 32 }}>
            <div className="mono" style={{ fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cyan)', fontWeight: 700 }}>
              ⬢ Proved in ZK
            </div>
            <ul style={{ margin: '12px 0 0', paddingLeft: 18, color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.75 }}>
              <li><code className="mono">total&apos; = total + amount</code></li>
              <li>Caller Merkle proof in private allowlist</li>
              <li>Disclosed total matches ledger state</li>
            </ul>
            <p style={{ margin: '12px 0 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Observer sees: “a proof moved <code className="mono">total</code> by <span className="redacted redacted-sm">hidden</span>.” Proof is <span style={{ color: 'var(--verify)', fontWeight: 700 }}>✓ Verified</span>.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>The wire — private → ZK → verifiable</h2>
            <p>Auditor-readable in 60 seconds. Zero cryptography degree required.</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: 14, alignItems: 'stretch', textAlign: 'center' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.035)', border: '1px solid var(--border-medium)', color: '#fff', borderRadius: 16, padding: '24px 18px', backdropFilter: 'blur(12px)' }}>
            <div className="mono" style={{ fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>🔒 1. Private Client</div>
            <div style={{ marginTop: 10, fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Sensitive input<br /><span className="redacted redacted-sm">amount</span> · private witness<br />Your device only</div>
          </div>
          <span style={{ alignSelf: 'center', color: 'var(--cyan)', fontWeight: 800, fontSize: '1.4rem' }}>→</span>
          <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1.5px solid rgba(56, 189, 248, 0.35)', borderRadius: 16, padding: '24px 18px', backdropFilter: 'blur(12px)' }}>
            <div className="mono" style={{ fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cyan)', fontWeight: 700 }}>⬢ 2. Compact Circuit</div>
            <div style={{ marginTop: 10, fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.6 }}><code className="mono">total&apos; = total + amount</code><br />Allowlist membership proved</div>
          </div>
          <span style={{ alignSelf: 'center', color: 'var(--verify)', fontWeight: 800, fontSize: '1.4rem' }}>→</span>
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1.5px solid rgba(16, 185, 129, 0.4)', borderRadius: 16, padding: '24px 18px', backdropFilter: 'blur(12px)' }}>
            <div className="mono" style={{ fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--verify)', fontWeight: 700 }}>✓ 3. Preprod Ledger</div>
            <div style={{ marginTop: 10, fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}><code className="mono">total</code> · phase · aggregate<br />Zero secrets revealed ✓</div>
          </div>
        </div>
        <ol style={{ margin: 0, paddingLeft: 22, display: 'grid', gap: 12, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '74ch' }}>
          <li><strong style={{ color: '#fff' }}>You specify a private amount.</strong> It never leaves your wallet — redacted across all UI views and network logs.</li>
          <li><strong style={{ color: '#fff' }}>Your browser synthesizes a proof.</strong> It proves <em>“new total = old total + hidden amount”</em> without disclosing the amount.</li>
          <li><strong style={{ color: '#fff' }}>Midnight validator checks the proof.</strong> If mathematically valid, the on-chain ledger records the new total.</li>
          <li><strong style={{ color: '#fff' }}>Independent auditors verify wallet-free at /audit.</strong> All invariants are public; amounts stay confidential forever.</li>
        </ol>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Worked example — three hidden batches in case #07</h2>
            <p>What you type on your machine vs what is committed to Midnight Preprod.</p>
          </div>
          <span className="badge badge-verify">Provably True</span>
        </div>
        <div style={{ overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 16, background: 'var(--bg-card)' }}>
          <table className="queue-table">
            <thead><tr><th>step</th><th>what you enter (private)</th><th>what is committed on-chain (public)</th></tr></thead>
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
                  <td>{r.priv.includes('████') ? <span className="redacted redacted-sm">{r.priv}</span> : <span style={{ color: 'var(--text-muted)' }}>{r.priv}</span>}</td>
                  <td className="mono" style={{ fontSize: '0.86rem', color: 'var(--cyan)' }}>{r.pub}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="wire-strip">
          <span>Ledger shows <code className="mono">total = 42</code> (example). Never <span className="redacted redacted-sm">a1</span> <span className="redacted redacted-sm">a2</span>.</span>
          <span style={{ marginLeft: 'auto' }}><Link to="/audit?case=7" style={{ fontWeight: 700, color: 'var(--cyan)' }}>Audit case #07 →</Link></span>
        </div>
      </section>

      <section className="section">
        <div className="section-head"><h2>Ledger Vocabulary</h2></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0 40px' }}>
          {[
            ['Aggregate', 'Sum of all active dossier totals on-chain. Provably verified by contract invariant.'],
            ['Allowlist', 'Merkle tree of member persistent hashes; access proved in zero-knowledge.'],
            ['Commitment', 'Cryptographic hash of investigator secret — identity never stored.'],
            ['Zero-knowledge proof', 'Mathematically proves a calculation without leaking underlying witnesses.'],
            ['Redacted', 'Sensitive input — shielded locally on client, never leaves device memory.'],
            ['Verified', 'Cryptographically verified — Compact ZK-SNARK checked and finalized on-chain.'],
            ['Disclosed', 'Selectively revealed — running total published by case owner.'],
            ['Phase', 'ACTIVE (open for evidence inserts) or CLOSED (sealed — immutable totals).'],
          ].map(([k, v]) => (
            <div key={k} style={{ padding: '16px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.02rem', color: '#fff' }}>{k}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
          <Link to="/cases" className="btn btn-primary">Browse Case Dossiers →</Link>
          <Link to="/audit" className="btn btn-secondary">Public Auditor (No Wallet)</Link>
        </div>
      </section>
      <style>{`@media(max-width:860px){.about-3{grid-template-columns:1fr !important;}.about-3>div{border-left:none !important;padding-left:0 !important;border-top:1px solid var(--border-subtle);padding-top:20px;}.about-3>div:first-child{border-top:none;padding-top:0;}}`}</style>
    </>
  );
}
