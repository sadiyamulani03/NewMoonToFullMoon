import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDemo } from '../context/DemoContext';
import { GITHUB_URL } from '../config';
import FaucetDrawer from '../components/FaucetDrawer';

export default function Landing() {
  const { isDemo, enableDemo, mockCases, mockLedger, demoLogStep, demoDisclose } = useDemo();
  const navigate = useNavigate();
  const goDemo = () => { if (!isDemo) enableDemo(); navigate('/dashboard'); };
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [demoAmt, setDemoAmt] = useState('15');
  const [demoMsg, setDemoMsg] = useState<string | null>(null);

  // Landing IS demo — auto-enable mock ledger so reviewers see working app without wallet
  useEffect(() => { if (!isDemo) enableDemo(); }, [isDemo, enableDemo]);

  const demoCase = mockCases.find((c) => c.id.startsWith('demo-7')) ?? mockCases[0];
  const [faucetOpen, setFaucetOpen] = useState(false);

  return (
    <>
      {/* Announce — same ink as dashboard rail */}
      <div className="lp-announce">
        <span className="lp-announce-pill">NEW</span>
        <span>MidnightTrace v1.1 on Preprod · <span className="mono">df5e05…29501</span> · Uint32 + metadataHash</span>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub ↗</a>
      </div>

      {/* HERO — same forensic ledger as Dashboard (now launch=demo, dark ink) */}
      <section className="ledger" style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 18px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted-ink)' }}>
            Midnight Network · Preprod · Private by default · Verifiable without secrets
          </div>
          <h1 className="display" style={{ margin: 0, fontSize: 'clamp(2rem, 4vw, 2.9rem)', lineHeight: 0.96, letterSpacing: '-0.035em', color: 'var(--paper)' }}>
            Prove a forensic<br />step without<br /><span style={{ color: 'var(--paper)', textDecoration: 'underline', textDecorationColor: '#F4C770', textDecorationThickness: 4, textUnderlineOffset: 6 }}>exposing the evidence.</span>
          </h1>
          <p style={{ margin: 0, color: 'var(--muted-ink)', fontSize: '0.96rem', lineHeight: 1.6, maxWidth: '52ch' }}>
            MidnightTrace is a folder of case files on <strong style={{ color: 'var(--paper)' }}>Midnight</strong>. Each finding is a <span title="Zero-knowledge proof — proves total' = total + amount without revealing amount" style={{ borderBottom: '1px dotted var(--muted-ink)', cursor: 'help' }}>zero-knowledge proof</span> — the ledger shows you counted, not <em>what</em> you counted.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
            <Link to="/dashboard" className="btn btn-primary">Launch app →</Link>
            <button className="btn btn-secondary" onClick={goDemo}>{isDemo ? 'Open demo dashboard' : 'Try demo — no wallet'}</button>
            <button className="btn btn-ghost" onClick={() => setFaucetOpen(true)}>Setup wallet → faucet</button>
            <Link to="/audit" className="btn btn-ghost">Verify — no login</Link>
          </div>
          <FaucetDrawer open={faucetOpen} onClose={() => setFaucetOpen(false)} />
          <div style={{ marginTop: 6, paddingTop: 10, borderTop: '1px solid var(--line-ink)', display: 'flex', gap: 14, flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted-ink)' }}>
            <span>Users <strong style={{ color: 'var(--paper)' }} className="mono">70</strong> <span style={{ color: 'var(--verify)' }}>● 4.5/5</span></span>
            <span>Contract <strong style={{ color: 'var(--paper)' }} className="mono">df5e05…29501</strong></span>
            <span style={{ color: 'var(--verify)', fontWeight: 700 }}>● Preprod live</span>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', borderLeft: '1px solid var(--line-ink)', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-ink)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <span>Live ledger excerpt · Case #07</span>
            <span className="stamp stamp-verify stamp-small">Verified</span>
          </div>
          <div className="wire" style={{ padding: 12, background: '#0F131A' }}>
            <div style={{ color: 'var(--muted-ink)', fontSize: '0.72rem' }}>case <span className="mono" style={{ color: 'var(--paper)' }}>#07</span> · filed <span className="mono">2026-09-14</span> · block 412,320</div>
            <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="redacted" style={{ minWidth: '7ch' }}>████ 42</span>
              <span style={{ color: 'var(--muted-ink)' }}>→</span>
              <code className="mono" style={{ background: 'var(--verify-soft)', border: '1px solid var(--verify-border)', padding: '2px 6px', borderRadius: 3, color: 'var(--verify)', fontWeight: 700 }}>total = 42</code>
              <span style={{ color: 'var(--muted-ink)', fontSize: '0.72rem' }}>(was 0 → now 42)</span>
              <span className="stamp stamp-verify stamp-small" style={{ marginLeft: 'auto' }}>Verified</span>
            </div>
            <div className="mono" style={{ marginTop: 8, fontSize: '0.68rem', wordBreak: 'break-all', color: 'var(--muted-ink)' }}>
              a3f1…9c02 · <span className="redacted redacted-sm">amount redacted</span> · proof <span style={{ color: 'var(--verify)', fontWeight: 700 }}>✓ valid</span> · wire: <span className="wire-proof">ZK proof</span> → <span className="wire-total">total&apos; = total + amount</span>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted-ink)', lineHeight: 1.5 }}>
            Black bars are the feature. Amount never leaves your wallet, never lands on-chain, never renders in UI or API. <Link to="/about" style={{ fontWeight: 600 }}>Privacy model →</Link>
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link to="/audit" className="mono" style={{ fontSize: '0.72rem', fontWeight: 600 }}>Try /audit — no wallet →</Link>
            <span style={{ color: 'var(--muted-ink)', fontSize: '0.72rem' }}>Anyone can verify · SHA-256 receipt</span>
          </div>
        </div>
      </section>

      {/* STATS — same stats-row as Dashboard */}
      <section className="stats-row" aria-label="Launch stats">
        <div className="stat-cell">
          <span className="stat-label">Preprod users</span>
          <strong className="stat-num">70</strong>
          <span className="stat-label" style={{ textTransform: 'none', letterSpacing: 0 }}>verified wallets</span>
        </div>
        <div className="stat-cell">
          <span className="stat-label">Avg rating</span>
          <strong className="stat-num">4.5<span style={{ fontSize: '1rem', color: 'var(--muted)' }}>/5</span></strong>
          <span className="stat-label" style={{ textTransform: 'none', letterSpacing: 0 }}>50 responses · 0 × 1–2/5</span>
        </div>
        <div className="stat-cell">
          <span className="stat-label">Contract</span>
          <strong className="stat-num" style={{ fontSize: '1.25rem' }}>v1.1</strong>
          <span className="stat-label mono" style={{ textTransform: 'none', letterSpacing: 0 }}>df5e05…29501</span>
        </div>
        <div className="stat-cell">
          <span className="stat-label" style={{ color: 'var(--verify)' }}>● Preprod live</span>
          <strong className="stat-num" style={{ color: 'var(--verify)' }}>Live</strong>
          <span className="stat-label" style={{ textTransform: 'none', letterSpacing: 0 }}>indexed · faucet ready</span>
        </div>
      </section>

      {/* FEATURES — 3 ledgers like dashboard sections (dark forensic) */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12 }}>
        {[
          { k: 'PRIVATE BY DEFAULT', t: 'Witness never disclosed', d: 'Step amount stays in your wallet. Chain stores only total. Black bars are not a bug — they are the guarantee. Compact witness is private by default.' },
          { k: 'SELECTIVE DISCLOSURE', t: 'Disclose when you choose', d: 'Same contract, two modes. Call disclose() to publish lastDisclosed. Otherwise it stays redacted forever. Deliberate, not leaky.' },
          { k: 'WALLET-FREE AUDIT', t: 'Anyone at /audit', d: 'No wallet, no secrets. Indexer-direct check: aggregate == Σ totals, allowlist root, phase order, disclosure book. Share a case ID.' },
        ].map((f) => (
          <div key={f.k} className="ledger" style={{ padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-ink)' }}>{f.k}</span>
            <strong style={{ color: 'var(--paper)', fontSize: '0.98rem' }}>{f.t}</strong>
            <span style={{ fontSize: '0.86rem', color: 'var(--muted-ink)', lineHeight: 1.5 }}>{f.d}</span>
          </div>
        ))}
      </section>

      {/* HOW IT MOVES — ledger timeline like Recent activity */}
      <section className="ledger">
        <div className="ledger-head">
          <span className="ledger-title">How a case moves — 30 seconds</span>
          <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Folder inserts → Verified</span>
        </div>
        <div>
          {[
            { n: '01', t: 'Open case', d: 'Pick a number. ID on-chain; title stays off-chain.', meta: 'phase ACTIVE' },
            { n: '02', t: 'Log finding', d: 'Enter a private amount. Wallet proves total\' = total + amount.', meta: 'wire ZK proof → redacted → total' },
            { n: '03', t: 'Disclose', d: 'Publish only the running total you choose. Else it stays redacted.', meta: 'lastDisclosed (optional)' },
            { n: '04', t: 'Verify', d: 'Anyone opens /audit — no wallet — and checks the math.', meta: 'aggregate, root, phase' },
          ].map((s) => (
            <div key={s.n} className="ledger-row">
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
                <span className="mono" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--blue)', minWidth: 22 }}>{s.n}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--paper)' }}>{s.t} <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted-ink)', fontWeight: 400 }}>· {s.meta}</span></span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--muted-ink)' }}>{s.d}</span>
                </div>
              </div>
              <span className="stamp stamp-verify stamp-small">Verified</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--line-ink)', background: 'rgba(255,255,255,0.03)', fontSize: '0.78rem', color: 'var(--muted-ink)' }}>
          Each step is a folder insert: <span className="redacted redacted-sm">private amount</span> → public <code className="mono" style={{ fontSize: '0.78rem', color: 'var(--paper)', background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: 3, border: '1px solid var(--line-ink)' }}>total</code> with a <span className="stamp stamp-verify stamp-small" style={{ verticalAlign: 'middle' }}>Verified</span> stamp.
        </div>
      </section>

      {/* PROOF — video + quotes as two ledgers */}
      <section style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 12, alignItems: 'start' }}>
        <div className="ledger" style={{ overflow: 'hidden' }}>
          <div className="ledger-head">
            <span className="ledger-title">See it in 90 seconds</span>
            <span className="mono" style={{ fontSize: '0.66rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-ink)' }}>Demo · Preprod live</span>
          </div>
          <div style={{ aspectRatio: '16/9', background: '#0F131A', display: 'grid', placeItems: 'center' }}>
            <iframe src="https://drive.google.com/file/d/1tlD3U0O164p6D210Y_KyC3-TF1Ku_ZJA/preview" title="MidnightTrace demo" allow="autoplay; encrypted-media" allowFullScreen loading="lazy" style={{ width: '100%', height: '100%', border: 0, display: 'block' }} />
          </div>
          <div style={{ padding: '10px 14px', borderTop: '1px solid var(--line-ink)', background: 'rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="https://drive.google.com/file/d/1tlD3U0O164p6D210Y_KyC3-TF1Ku_ZJA/view?usp=sharing" target="_blank" rel="noreferrer" className="mono" style={{ fontSize: '0.72rem', fontWeight: 600 }}>Open in Drive ↗</a>
            <span style={{ fontSize: '0.72rem', color: 'var(--muted-ink)' }}>Mock ledger in demo · Real proofs: Lace / 1AM + tNIGHT</span>
          </div>
        </div>

        <div className="ledger" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="ledger-head">
            <span className="ledger-title">Auditors liked</span>
            <span className="mono" style={{ fontSize: '0.66rem', color: 'var(--muted-ink)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>5/5 · Very Easy</span>
          </div>
          <div style={{ padding: '10px 12px', display: 'grid', gap: 10 }}>
            {[
              ['Proving an investigation step without exposing underlying evidence.', 'Zeel Chauhan · 5/5'],
              ['Immutable forensic trail was the strongest part.', 'Samara · 5/5'],
              ['Audit page made verification easy to understand.', 'Rashi Achaliya · 5/5'],
            ].map(([q, a]) => (
              <div key={q} style={{ border: '1px solid var(--line-ink)', borderRadius: 4, padding: '10px 12px', background: 'rgba(255,255,255,0.03)' }}>
                <p style={{ margin: '0 0 4px', fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--paper)', fontStyle: 'italic' }}>“{q}”</p>
                <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)' }}>— {a}</span>
              </div>
            ))}
            <Link to="/about" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Privacy model → full table on About</Link>
          </div>
        </div>
      </section>

      {/* WORKED EXAMPLE — compact ledger table */}
      <section className="ledger">
        <div className="ledger-head">
          <span className="ledger-title">Worked example — case #07</span>
          <Link to="/about" className="mono" style={{ fontSize: '0.72rem', fontWeight: 600 }}>Full table on About →</Link>
        </div>
        <div style={{ padding: '12px 14px', display: 'grid', gap: 0 }}>
          <div className="mono" style={{ fontSize: '0.64rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-ink)', paddingBottom: 8, borderBottom: '1px solid var(--line-ink)' }}>Step · What you enter · What goes on-chain</div>
          {[
            ['Open #07', '—', 'ACTIVE · total 0'],
            ['Batch 1', '████ a1', 'total = a1 → Verified'],
            ['Batch 2', '████ a2', 'total = a1+a2 → Verified'],
            ['Disclose', '(optional)', 'lastDisclosed = total'],
            ['Close', '—', 'CLOSED → Sealed'],
          ].map(([s, priv, pub]) => (
            <div key={s} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr', gap: 0, padding: '9px 0', borderBottom: '1px solid var(--line-ink)', fontSize: '0.84rem', alignItems: 'center' }}>
              <strong style={{ color: 'var(--paper)' }}>{s}</strong>
              <span>{priv.includes('████') ? <span className="redacted redacted-sm">{priv}</span> : <span style={{ color: 'var(--muted-ink)' }}>{priv}</span>}</span>
              <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--paper)' }}>{pub}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--line-ink)', background: 'rgba(255,255,255,0.03)', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--muted-ink)' }}>
          Observer sees only <code className="mono" style={{ color: 'var(--paper)', background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: 3, border: '1px solid var(--line-ink)' }}>total = 42</code> (example). Never <span className="redacted redacted-sm">a1</span> <span className="redacted redacted-sm">a2</span> or who logged them.
        </div>
      </section>

      {/* FAQ — ledger */}
      <section className="ledger">
        <div className="ledger-head"><span className="ledger-title">FAQ — what stays private</span></div>
        <div>
          {[
            { q: 'What is public vs. redacted?', a: 'Public: per-case total, lastDisclosed (only if you disclose), phase, eventCount, aggregate, allowlist root. Private forever: every step amount and member secret — only persistentHash commitments are stored. ZK shows total\' = total + amount without revealing amount.' },
            { q: 'Do I need a wallet to verify?', a: 'No. /audit reads live Preprod state from the indexer and checks aggregate == Σ totals, root, phase order, and disclosure book. Share a case ID — anyone can verify.' },
            { q: 'Does demo touch the chain?', a: 'No — in-memory mock ledger, toggled in header. Refresh resets it. Real proofs need Lace/1AM on Preprod + tNIGHT from faucet.' },
            { q: 'What does “redacted” mean?', a: 'Black bar, not blur. Amount never leaves device, never lands on-chain, never renders in UI/API. Green Verified means proof checked out; amount stayed redacted.' },
          ].map((item, i) => (
            <div key={item.q} style={{ borderBottom: '1px solid var(--line-ink)' }}>
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} aria-expanded={faqOpen === i} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '12px 14px', background: faqOpen === i ? 'rgba(255,255,255,0.04)' : 'transparent', border: 0, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--paper)', textAlign: 'left' }}>
                <span>{item.q}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted-ink)' }}>{faqOpen === i ? '−' : '+'}</span>
              </button>
              {faqOpen === i && <div style={{ padding: '0 14px 12px', fontSize: '0.86rem', color: 'var(--muted-ink)', lineHeight: 1.6 }}>{item.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* LIVE DEMO — landing IS demo (no wallet, no redirect needed) */}
      <section className="ledger" style={{ borderColor: 'var(--verify-border)', overflow: 'hidden' }}>
        <div className="ledger-head" style={{ background: 'rgba(63,167,114,0.14)', borderBottomColor: 'var(--verify-border)' }}>
          <span className="ledger-title" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span className="stamp stamp-verify stamp-small" style={{ transform: 'none' }}>Demo</span> Live demo — no wallet · Case #07</span>
          <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--verify)', fontWeight: 700 }}>aggregate {mockLedger.aggregate.toString()} · {mockCases.length} cases · mock ledger</span>
        </div>
        <div style={{ padding: '14px 14px', display: 'grid', gap: 12 }}>
          <div className="wire" style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: 'var(--paper)' }}>{demoCase.title} <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted-ink)' }}>· {demoCase.status} · {demoCase.receipts.length} receipts</span></span>
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted-ink)' }}>total {mockLedger.cases.find(c => c.caseId === 7n)?.total.toString() ?? '—'} · lastDisclosed {mockLedger.cases.find(c => c.caseId === 7n)?.lastDisclosed.toString() ?? '0'}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="redacted">████ {demoAmt || '—'}</span>
              <span style={{ color: 'var(--muted-ink)' }}>→</span>
              <code className="mono" style={{ background: 'var(--verify-soft)', border: '1px solid var(--verify-border)', padding: '2px 6px', borderRadius: 3, color: 'var(--verify)', fontWeight: 700 }}>total&apos; = total + amount</code>
              <span className="stamp stamp-verify stamp-small" style={{ transform: 'none' }}>Verified</span>
            </div>
            <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {demoCase.receipts.slice(-3).map(r => <span key={r.txId} title={r.txId}>{r.txId.slice(0,12)}… · {r.stepType} · block {r.blockHeight}</span>)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <input className="input" value={demoAmt} onChange={e => setDemoAmt(e.target.value.replace(/[^0-9]/g,''))} placeholder="amount" inputMode="numeric" style={{ maxWidth: 120 }} aria-label="Demo private amount" />
            <button className="btn btn-primary" onClick={() => {
              const n = BigInt(parseInt(demoAmt || '0', 10) || 0);
              if (n <= 0n) { setDemoMsg('Enter amount > 0'); return; }
              demoLogStep(7n, n, demoCase.id);
              setDemoMsg(`Logged hidden ${n} → total updated (amount stays redacted) ✓`);
              setTimeout(() => setDemoMsg(null), 2500);
            }}>Log hidden step</button>
            <button className="btn btn-secondary" onClick={() => {
              const n = BigInt(parseInt(demoAmt || '0', 10) || 0);
              demoDisclose(7n, n || mockLedger.cases.find(c => c.caseId === 7n)?.total || 0n, demoCase.id);
              setDemoMsg(`Disclosed ${n || 'total'} → lastDisclosed ✓`);
              setTimeout(() => setDemoMsg(null), 2500);
            }} style={{ borderColor: 'var(--line-ink-strong)' }}>Disclose</button>
            <Link to="/dashboard" className="btn btn-ghost">Open full dashboard →</Link>
            <Link to="/cases" className="btn btn-ghost">Cases</Link>
          </div>
          {demoMsg && <div style={{ fontSize: '0.82rem', color: 'var(--verify)', fontWeight: 600 }}>{demoMsg}</div>}
          <div style={{ fontSize: '0.78rem', color: 'var(--muted-ink)', lineHeight: 1.5 }}>
            This is the real demo ledger (same mock ledger as <Link to="/dashboard" style={{ fontWeight: 600 }}>/dashboard</Link>). Amount is <span className="redacted redacted-sm">redacted</span> — never leaves the input, never on-chain. Verify wallet-free at <Link to="/audit" style={{ fontWeight: 600 }}>/audit</Link>. Refresh resets.
          </div>
        </div>
      </section>

      {/* Product profile + CTA */}
      <section className="ledger" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="ledger-head">
          <span className="ledger-title">Product profile — verify in 10 seconds</span>
          <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>GitHub · Demo</span>
        </div>
        <div style={{ padding: '14px 14px', display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn btn-primary">GitHub repo ↗</a>
            <a href="https://drive.google.com/file/d/1tlD3U0O164p6D210Y_KyC3-TF1Ku_ZJA/view?usp=sharing" target="_blank" rel="noreferrer" className="btn btn-secondary">Demo video ↗</a>
            <Link to="/about" className="btn btn-ghost">Privacy model →</Link>
          </div>
          <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted-ink)', lineHeight: 1.6 }}>
            Verify via <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a> + demo video + <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: 3, border: '1px solid var(--line-ink)', color: 'var(--paper)' }}>docs/posts.md</code> — all CI-pinned.
          </div>
        </div>
      </section>

      {/* CTA — dark ledger like Dashboard but gold accent */}
      <section className="ledger" style={{ background: 'var(--ink)', borderColor: 'var(--ink)', color: 'var(--paper)', padding: '18px 16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h3 className="display" style={{ margin: 0, fontSize: '1.3rem', color: 'var(--paper)' }}>Try it with zero setup.</h3>
          <p style={{ margin: '6px 0 0', color: 'rgba(237,231,216,0.82)', fontSize: '0.9rem' }}>Mock ledger in demo, real proofs on Preprod with Lace / 1AM + tNIGHT.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn" onClick={goDemo} style={{ background: '#F4C770', color: '#0B1020', borderColor: '#F4C770', fontWeight: 700 }}>{isDemo ? 'Open demo dashboard' : 'Try demo — no wallet'}</button>
          <Link to="/dashboard" className="btn" style={{ background: 'transparent', color: 'var(--paper)', borderColor: 'rgba(237,231,216,0.25)' }}>Launch app</Link>
          <a href="https://faucet.preprod.midnight.network" target="_blank" rel="noreferrer" className="btn" style={{ background: 'transparent', color: 'var(--paper)', borderColor: 'rgba(237,231,216,0.18)' }}>Get tNIGHT ↗</a>
        </div>
      </section>

      <style>{`@media(max-width: 860px){ .ledger[style*="1.15fr"]{ grid-template-columns:1fr !important } .ledger[style*="1.15fr"] > div:nth-child(2){ border-left:none !important; border-top:1px solid var(--line) } section[style*="repeat(3"]{ grid-template-columns:1fr !important } section[style*="1.15fr 0.85fr"]{ grid-template-columns:1fr !important } }`}</style>
    </>
  );
}
