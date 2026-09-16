import { Link } from 'react-router-dom';
import { XProfileLink } from '../components/SocialLinks';

export default function About() {
  return (
    <>
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted-ink)' }}>Forensics, reimagined — Privacy model lives here only</div>
        <h1 className="display" style={{ margin: '8px 0 8px', fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', lineHeight: 0.98, letterSpacing: '-0.03em', color: 'var(--paper)' }}>Private proof,<br />public trust.</h1>
        <p style={{ margin: 0, color: 'var(--muted-ink)', maxWidth: '60ch', lineHeight: 1.6 }}>
          MidnightTrace keeps step amounts <span className="redacted redacted-sm">redacted</span> — black bars, not blur. The ledger shows a <code className="mono" style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: 3, border: '1px solid var(--line-ink)' }}>total</code> that is <span className="stamp stamp-verify stamp-small" style={{ verticalAlign: 'middle', marginLeft: 4 }}>Verified</span> by a ZK proof, not by trust.
        </p>
      </div>

      {/* Privacy model — single home */}
      <section className="ledger">
        <div className="ledger-head">
          <span className="ledger-title">Privacy model — what is public vs. redacted</span>
          <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Evidence ledger rule</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 0 }}>
          <div style={{ padding: '14px 14px', borderRight: '1px solid var(--line-ink)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--verify)', fontWeight: 700 }}>Public — on-chain</div>
            <ul style={{ margin: '8px 0 0', paddingLeft: 16, color: 'var(--muted-ink)', fontSize: '0.88rem', lineHeight: 1.7 }}>
              <li><code className="mono">total</code> per case</li>
              <li><code className="mono">lastDisclosed</code> only if you call disclose</li>
              <li>Case phase, event count, <code className="mono">aggregate</code></li>
              <li>Allowlist <span className="mono">root</span> (hash of membership tree)</li>
            </ul>
          </div>
          <div style={{ padding: '14px 14px', borderRight: '1px solid var(--line-ink)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--redact)', fontWeight: 700, background: 'var(--paper)', display: 'inline-block', padding: '2px 6px', borderRadius: 3 }}>Private — never on-chain</div>
            <ul style={{ margin: '8px 0 0', paddingLeft: 16, color: 'var(--muted-ink)', fontSize: '0.88rem', lineHeight: 1.7 }}>
              <li>Step <span className="redacted">amount a1</span> <span className="redacted">a2</span> <span className="redacted">a3</span></li>
              <li>Member secrets / identities</li>
              <li>Case descriptions (off-chain only)</li>
              <li style={{ color: 'var(--paper)' }}><span className="redacted redacted-sm">██ 18 ██</span> — you see a black bar, not a number</li>
            </ul>
          </div>
          <div style={{ padding: '14px 14px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--blue)', fontWeight: 700 }}>Proved in ZK — without revealing</div>
            <ul style={{ margin: '8px 0 0', paddingLeft: 16, color: 'var(--muted-ink)', fontSize: '0.88rem', lineHeight: 1.7 }}>
              <li><code className="mono">total' = total + amount</code></li>
              <li>Caller is on private allowlist (Merkle proof)</li>
              <li>Disclosed total matches hidden total</li>
            </ul>
            <div style={{ marginTop: 10, padding: '8px 10px', border: '1px solid var(--line-ink)', borderRadius: 4, background: 'rgba(255,255,255,0.03)', fontSize: '0.82rem', color: 'var(--muted-ink)' }}>
              Observer sees: “a proof moved <code className="mono">total</code> by <span className="redacted redacted-sm">hidden</span>.” Proof is <span className="stamp stamp-verify stamp-small" style={{ verticalAlign: 'middle' }}>Verified</span>.
            </div>
          </div>
        </div>
      </section>

      {/* How ZK works — grounded in mechanic */}
      <section className="ledger">
        <div className="ledger-head">
          <span className="ledger-title">How the wire works</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--muted-ink)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Private amount → public total</span>
        </div>
        <div style={{ padding: 14, display: 'grid', gap: 12 }}>
          <div className="wire" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center', textAlign: 'center' }}>
            <span>Your device: <span className="redacted">amount</span></span>
            <span style={{ color: 'var(--blue)' }}>—ZK proof—›</span>
            <span>Chain stores: <code className="mono" style={{ background: 'var(--verify-soft)', border: '1px solid var(--verify-border)', padding: '2px 6px', borderRadius: 3, color: 'var(--verify)', fontWeight: 700 }}>total</code></span>
            <span className="stamp stamp-verify stamp-small">Verified</span>
          </div>
          <ol style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 8, color: 'var(--muted-ink)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            <li><strong style={{ color: 'var(--paper)' }}>You pick a private amount.</strong> It never leaves your wallet — it is <span className="redacted redacted-sm">redacted</span> on every screen.</li>
            <li><strong style={{ color: 'var(--paper)' }}>Your wallet builds a proof.</strong> It proves <em>“new total = old total + my amount”</em> without leaking the amount. Wire color is <span style={{ color: 'var(--blue)', fontWeight: 700 }}>soft blue</span>.</li>
            <li><strong style={{ color: 'var(--paper)' }}>Chain checks, then stores total.</strong> If the proof is green <span className="stamp stamp-verify stamp-small" style={{ verticalAlign: 'middle' }}>Verified</span>, the ledger accepts the new total. Black bars stay black.</li>
            <li><strong style={{ color: 'var(--paper)' }}>Anyone verifies wallet-free at /audit.</strong> The checklist is public; the amounts stay redacted forever.</li>
          </ol>
        </div>
      </section>

      {/* Concrete worked example — 3 hidden batches */}
      <section className="ledger">
        <div className="ledger-head">
          <span className="ledger-title">Worked example — three hidden batches in case #07</span>
          <span className="stamp stamp-verify stamp-small">Provably real, partially redacted</span>
        </div>
        <div style={{ padding: 14, display: 'grid', gap: 14 }}>
          <div style={{ border: '1px solid var(--line-ink)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr', gap: 0, fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-ink)', background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderBottom: '1px solid var(--line-ink)' }}>
              <span>Step</span><span>What you enter</span><span>What goes on-chain</span>
            </div>
            {[
              { s: 'Open #07', priv: '—', pub: 'case #07 ACTIVE · total 0' },
              { s: 'Batch 1', priv: '████ a1', pub: 'total = a1 → stamp Verified' },
              { s: 'Batch 2', priv: '████ a2', pub: 'total = a1+a2 → Verified' },
              { s: 'Batch 3', priv: '████ a3', pub: 'total = a1+a2+a3 → Verified' },
              { s: 'Disclose', priv: '(optional publish)', pub: 'lastDisclosed = total (ochre)' },
              { s: 'Close', priv: '—', pub: 'phase CLOSED → Sealed' },
            ].map((r) => (
              <div key={r.s} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr', gap: 0, padding: '9px 12px', borderBottom: '1px solid var(--line-ink)', fontSize: '0.86rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: 'var(--paper)' }}>{r.s}</span>
                <span>{r.priv.includes('████') ? <span className="redacted redacted-sm">{r.priv}</span> : <span style={{ color: 'var(--muted-ink)' }}>{r.priv}</span>}</span>
                <span className="mono" style={{ fontSize: '0.82rem', color: r.s === 'Disclose' ? 'var(--ochre)' : 'var(--paper)' }}>{r.pub}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="wire" style={{ background: '#0F131A' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-ink)', marginBottom: 6 }}>What an on-chain observer sees</div>
              <div style={{ color: 'var(--paper)', fontSize: '0.86rem', lineHeight: 1.6 }}>
                Ledger shows: <code className="mono">total = 42</code> (example), <code className="mono">lastDisclosed = 42</code> after disclose, <code className="mono">phase = CLOSED</code>.<br />
                Never shows: <span className="redacted">a1</span> <span className="redacted">a2</span> <span className="redacted">a3</span> or who logged them.
              </div>
            </div>
            <div style={{ border: '1px solid var(--verify-border)', borderRadius: 4, padding: 12, background: 'var(--verify-soft)', display: 'grid', gap: 6 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--verify)', fontWeight: 700 }}>Auditor sees at /audit</div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.86rem', lineHeight: 1.6, color: 'var(--muted-ink)' }}>
                <li><span style={{ color: 'var(--verify)' }}>✓</span> Aggregate == Σ totals</li>
                <li><span style={{ color: 'var(--verify)' }}>✓</span> Allowlist root pinned</li>
                <li><span style={{ color: 'var(--verify)' }}>✓</span> Phase order valid</li>
                <li><span style={{ color: 'var(--verify)' }}>✓</span> No future-block refs</li>
              </ul>
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--muted-ink)' }}>
            Try this flow now: <Link to="/cases" style={{ fontWeight: 600 }}>Cases → Case #07</Link> (demo has it pre-seeded) or <Link to="/audit" style={{ fontWeight: 600 }}>/audit → enter 7</Link> to see the checklist pass.
          </div>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ border: '1px solid var(--line-ink)', borderRadius: 4, padding: 14, background: 'var(--ink-2)' }}>
          <h3 className="display" style={{ margin: '0 0 6px', fontSize: '1.05rem', color: 'var(--paper)' }}>Why Midnight</h3>
          <p style={{ margin: 0, color: 'var(--muted-ink)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Compact keeps witnesses private by default — an explicit <code className="mono">disclose()</code> is needed to publish. That gives <strong style={{ color: 'var(--paper)' }}>selective disclosure natively</strong>.
          </p>
        </div>
        <div style={{ border: '1px solid var(--line-ink)', borderRadius: 4, padding: 14, background: 'var(--ink-2)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h3 className="display" style={{ margin: 0, fontSize: '1.05rem', color: 'var(--paper)' }}>Go verify</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link to="/cases" className="btn btn-primary">Go to cases</Link>
            <Link to="/audit" className="btn btn-secondary">Auditor — no wallet</Link>
          </div>
        </div>
      </section>

      <XProfileLink variant="card" />

      <section className="ledger" style={{ padding: '14px 14px', display: 'grid', gap: 8 }}>
        <div className="ledger-title" style={{ fontSize: '0.98rem' }}>Why the X badge says “Appeal”</div>
        <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--muted-ink)', lineHeight: 1.6 }}>
          X flagged <span className="mono">@Midnight__Trace</span> as suspended (automated moderation). This is common for new product handles posting builder threads. Appeal is filed — while pending, every claim on X is mirrored 1:1 in <code className="mono">docs/posts.md</code> + GitHub + the live demo, so reviewers never hit a dead link. Update the handle instantly via <code className="mono">VITE_X_PROFILE_URL</code> without a code change.
        </p>
      </section>

      <section id="glossary" className="ledger">
        <div className="ledger-head"><span className="ledger-title">Glossary — ledger language</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 0 }}>
          {[
            ['Aggregate', 'Σ of all case totals on-chain. Visible to anyone.'],
            ['Allowlist', 'Merkle tree of member commitments; membership proved in ZK.'],
            ['Commitment', 'Persistent hash of a secret — stored, secret never stored.'],
            ['Zero-knowledge proof', 'Proves a statement true without revealing hidden data — blue wire.'],
            ['Redacted', 'Black bar — private amount never leaves device, never on-chain.'],
            ['Verified', 'Green stamp — ZK proof checked out, total is trustworthy.'],
            ['Disclosed', 'Ochre stamp — running total the owner chose to publish.'],
            ['Phase', 'ACTIVE (open) or CLOSED (sealed — totals permanent).'],
          ].map(([k, v]) => (
            <div key={k} style={{ padding: '12px 14px', borderRight: '1px solid var(--line-ink)', borderBottom: '1px solid var(--line-ink)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--paper)', fontSize: '0.96rem' }}>{k}</div>
              <div style={{ fontSize: '0.86rem', color: 'var(--muted-ink)', marginTop: 4, lineHeight: 1.5 }}>{v}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
