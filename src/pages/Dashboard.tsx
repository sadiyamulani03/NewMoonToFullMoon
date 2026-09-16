import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getStats, listCases, type ForensicCase } from '../lib/api';
import { useMidnightContext } from '../context/MidnightContext';
import { useDemo } from '../context/DemoContext';
import WalletStatus from '../components/WalletStatus';

export default function Dashboard() {
  const { walletState, isMobile, midLedger, membershipStatus } = useMidnightContext();
  const { isDemo, mockCases, mockLedger } = useDemo();
  const [cases, setCases] = useState<ForensicCase[] | null>(null);
  const ledger = isDemo ? mockLedger : midLedger;
  const displayCases = isDemo ? mockCases : cases;

  useEffect(() => {
    if (isDemo) { setCases(mockCases); return; }
    getStats().catch(() => {});
    listCases().then(setCases).catch(() => setCases([]));
  }, [isDemo, mockCases]);

  useEffect(() => {
    if (isDemo) setCases(mockCases);
  }, [isDemo, mockCases]);

  const { open, findings, disclosed, verifiedWeek, recent } = useMemo(() => {
    const all = displayCases ?? [];
    const open = all.filter((c) => c.status === 'open').length;
    const allReceipts = all.flatMap((c) => c.receipts.map((r) => ({ ...r, caseTitle: c.title, caseIdStr: c.id })));
    const findings = allReceipts.filter((r) => r.stepType === 'logStep' || !r.stepType).length;
    const disclosed = allReceipts.filter((r) => r.stepType === 'discloseFinding').length;
    // verified this week = receipts in last 7 days that are not failed (all in demo are verified)
    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const verifiedWeek = allReceipts.filter((r) => new Date(r.createdAt).getTime() > weekAgo).length;
    const recent = [...allReceipts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
    return { open, findings, disclosed, verifiedWeek, recent };
  }, [displayCases]);

  const aggregate = ledger?.aggregate.toString() ?? '—';
  const members = ledger?.memberCount.toString() ?? '—';

  return (
    <>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-ink)' }}>
        Dashboard · {isDemo ? 'Demo — not on-chain' : 'Midnight Preprod · Live ledger'}
      </div>
      {/* HERO — clear page definition */}
      <section className="ledger" style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 18px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h1 className="display" style={{ margin: 0, fontSize: 'clamp(1.6rem, 3vw, 2rem)', lineHeight: 0.98, letterSpacing: '-0.03em', color: 'var(--paper)' }}>
            Your findings.<br />Provably filed.
          </h1>
          <p style={{ margin: 0, color: 'var(--muted-ink)', fontSize: '0.92rem', lineHeight: 1.6, maxWidth: '52ch' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--paper)', color: 'var(--redact)', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '2px 6px', borderRadius: 3, fontWeight: 700, verticalAlign: 'middle' }}>🔒 PRIVATE</span>{' '}
            Each insert is a <span className="redacted redacted-sm">private amount</span> → public <code className="mono" style={{ fontSize: '0.82rem', background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: 3, border: '1px solid var(--line-ink)' }}>total</code> with a{' '}
            <span className="stamp stamp-verify stamp-small" style={{ verticalAlign: 'middle' }}>Verified</span> stamp. The amount never leaves your wallet.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
            <Link to="/new" className="btn btn-primary">Open a new case</Link>
            <Link to="/cases" className="btn btn-secondary">View cases</Link>
            <Link to="/audit" className="btn btn-ghost" aria-label="Open wallet-free audit">Audit — no wallet required</Link>
          </div>
          <div style={{ marginTop: 6, paddingTop: 10, borderTop: '1px solid var(--line-ink)', display: 'flex', gap: 14, flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted-ink)' }}>
            <span>Aggregate <strong style={{ color: 'var(--paper)' }} className="mono">{aggregate}</strong></span>
            <span>Members <strong style={{ color: 'var(--paper)' }}>{members}</strong></span>
            <span>{membershipStatus === 'member' || isDemo ? <span style={{ color: 'var(--verify)' }}>● Authorized</span> : 'Not authorized'}</span>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', borderLeft: '1px solid var(--line-ink)', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-ink)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <span>Live ledger excerpt</span>
            <span style={{ background: isDemo ? 'rgba(255,255,255,0.06)' : 'var(--verify-soft)', color: isDemo ? 'var(--muted-ink)' : 'var(--verify)', border: `1px solid ${isDemo ? 'var(--line-ink)' : 'var(--verify-border)'}`, padding: '2px 6px', borderRadius: 999, fontSize: '0.62rem', fontWeight: 700 }}>{isDemo ? 'Demo' : '● Preprod live'}</span>
          </div>
          <div className="wire" style={{ padding: 12, background: '#0F131A', borderColor: 'var(--line-ink)' }}>
            <div style={{ color: 'var(--muted-ink)', fontSize: '0.72rem' }}>case <span className="mono" style={{ color: 'var(--paper)' }}>#07</span> · total <span className="wire-total">42</span> · <span className="redacted redacted-sm">hidden</span> → proof <span style={{ color: 'var(--verify)' }}>✓</span></div>
            <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="redacted" style={{ minWidth: '7ch' }}>████</span>
              <span style={{ color: 'var(--muted-ink)' }}>→</span>
              <code className="mono" style={{ background: 'var(--verify-soft)', border: '1px solid var(--verify-border)', padding: '2px 6px', borderRadius: 3, color: 'var(--verify)', fontWeight: 700 }}>= 42</code>
              <span className="stamp stamp-verify stamp-small" style={{ marginLeft: 'auto' }}>Verified</span>
            </div>
            <div className="mono" style={{ marginTop: 8, fontSize: '0.66rem', color: 'var(--muted-ink)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span>Midnight Preprod</span><span>·</span><span>aggregate {aggregate}</span><span>·</span><span>indexer-direct</span>
            </div>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--muted-ink)', lineHeight: 1.5 }}>
            <span style={{ color: 'var(--paper)', fontWeight: 600 }}>Private:</span> <span className="redacted redacted-sm">amount</span> never leaves device. <span style={{ color: 'var(--paper)', fontWeight: 600 }}>Verifiable:</span> <code className="mono" style={{ fontSize: '0.78rem' }}>total&apos; = total + amount</code> proven in ZK.
          </div>
          {!isDemo && (
            <div style={{ marginTop: 'auto' }}>
              <WalletStatus walletState={walletState} isMobile={isMobile} />
            </div>
          )}
        </div>
      </section>

      {/* SINGLE STATS ROW */}
      <section className="stats-row" aria-label="Overview">
        <div className="stat-cell">
          <span className="stat-label">Open cases</span>
          <strong className="stat-num">{displayCases ? open : '—'}</strong>
          <span className="stat-label" style={{ textTransform: 'none', letterSpacing: 0 }}>{displayCases ? `${displayCases.length - open} closed` : 'loading'}</span>
        </div>
        <div className="stat-cell">
          <span className="stat-label">Findings logged</span>
          <strong className="stat-num">{displayCases ? findings : '—'}</strong>
          <span className="stat-label" style={{ textTransform: 'none', letterSpacing: 0 }}>private <span className="redacted redacted-sm" style={{ verticalAlign: 'middle' }}>amount</span> → proof</span>
        </div>
        <div className="stat-cell">
          <span className="stat-label" style={{ color: 'var(--ochre)' }}>Disclosed</span>
          <strong className="stat-num" style={{ color: 'var(--ochre)' }}>{displayCases ? disclosed : '—'}</strong>
          <span className="stat-label" style={{ textTransform: 'none', letterSpacing: 0 }}>totals made public</span>
        </div>
        <div className="stat-cell">
          <span className="stat-label" style={{ color: 'var(--verify)' }}>Verified this week</span>
          <strong className="stat-num" style={{ color: 'var(--verify)' }}>{displayCases ? verifiedWeek : '—'}</strong>
          <span className="stat-label" style={{ textTransform: 'none', letterSpacing: 0 }}>receipts checked</span>
        </div>
      </section>

      {/* ONE RECENT-ACTIVITY LEDGER */}
      <section className="ledger">
        <div className="ledger-head">
          <span className="ledger-title">Recent activity · Folder inserts</span>
          <Link to="/cases" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>View all →</Link>
        </div>
        {!displayCases ? (
          <div style={{ padding: 18 }}>
            <div className="ledger-row" style={{ opacity: 0.6 }}><span className="mono" style={{ color: 'var(--muted-ink)' }}>Loading ledger…</span><span className="stamp stamp-small" style={{ borderColor: 'var(--line-ink)', color: 'var(--muted-ink)' }}>Syncing</span></div>
            <div className="ledger-row" style={{ opacity: 0.4 }}><span className="mono" style={{ color: 'var(--muted-ink)' }}>Fetching Preprod indexer…</span></div>
          </div>
        ) : recent.length === 0 ? (
          <div className="empty" style={{ margin: 12 }}>
            <div className="empty-icon">📁</div>
            <h3 className="empty-title">No investigations yet</h3>
            <p className="empty-text">Create your first investigation to generate a privacy-preserving proof — the ledger will show a verifiable total while the amount stays <span className="redacted redacted-sm">redacted</span>.</p>
            <Link to="/new" className="btn btn-primary">Open first case</Link>
            <p className="muted-text" style={{ marginTop: 10, fontSize: '0.78rem' }}>Or enable <strong>Demo — no wallet</strong> in the header to see seeded cases.</p>
          </div>
        ) : (
          <div>
            {recent.map((r) => (
              <div key={r.txId} className="ledger-row">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--paper)' }}>{r.stepType === 'discloseFinding' ? 'Disclosed' : r.stepType === 'closeCase' ? 'Sealed' : 'Finding logged'} · <span className="mono" style={{ fontSize: '0.82rem', color: 'var(--muted-ink)' }}>#{r.caseIndex ?? '—'}</span></span>
                  <span className="mono" style={{ fontSize: '0.76rem', color: 'var(--muted-ink)', wordBreak: 'break-all' }}>{r.txId.slice(0, 16)}… · block {r.blockHeight} · <span className="redacted redacted-sm">redacted</span></span>
                </div>
                <span className={r.stepType === 'closeCase' ? 'stamp stamp-pending stamp-small' : 'stamp stamp-verify stamp-small'}>{r.stepType === 'closeCase' ? 'Sealed' : 'Verified'}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link to="/new" className="btn btn-primary">Open a new case</Link>
        <Link to="/cases" className="btn btn-secondary">Browse cases</Link>
        <Link to="/audit" className="btn btn-ghost">Auditor — no wallet</Link>
      </div>
    </>
  );
}
