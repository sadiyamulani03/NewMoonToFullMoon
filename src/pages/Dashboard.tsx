import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getStats, listCases, type ForensicCase } from '../lib/api';
import { useMidnightContext } from '../context/MidnightContext';
import { useDemo } from '../context/DemoContext';
import WalletStatus from '../components/WalletStatus';

function fmtDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function Dashboard() {
  const { walletState, midLedger, membershipStatus, isConnected, walletInfo, connect } = useMidnightContext();
  const { isDemo, mockCases, mockLedger } = useDemo();
  const [cases, setCases] = useState<ForensicCase[] | null>(null);
  const ledger = isDemo ? mockLedger : midLedger;
  const displayCases = isDemo ? mockCases : cases;

  useEffect(() => {
    if (isDemo) { setCases(mockCases); return; }
    getStats().catch(() => {});
    listCases().then(setCases).catch(() => setCases([]));
  }, [isDemo, mockCases]);
  useEffect(() => { if (isDemo) setCases(mockCases); }, [isDemo, mockCases]);

  const { open, findings, disclosed, verifiedWeek, recent, tableRows } = useMemo(() => {
    const all = displayCases ?? [];
    const open = all.filter((c) => c.status === 'open').length;
    const allReceipts = all.flatMap((c) => c.receipts.map((r) => ({ ...r, caseTitle: c.title, caseIdStr: c.id, caseStatus: c.status })));
    const findings = allReceipts.filter((r) => r.stepType === 'logStep' || !r.stepType).length;
    const disclosed = allReceipts.filter((r) => r.stepType === 'discloseFinding').length;
    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const verifiedWeek = allReceipts.filter((r) => new Date(r.createdAt).getTime() > weekAgo).length;
    const recent = [...allReceipts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
    const tableRows = [...allReceipts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);
    return { open, findings, disclosed, verifiedWeek, recent, tableRows };
  }, [displayCases]);

  const aggregate = ledger?.aggregate.toString() ?? '—';
  const members = ledger?.memberCount.toString() ?? '—';

  return (
    <>
      {/* MASTHEAD — editorial, not command bar */}
      <header className="masthead">
        <div className="eyebrow eyebrow-verify">Evidence workspace · Midnight Preprod</div>
        <div className="masthead-row">
          <div style={{ minWidth: 0 }}>
            <h1 className="display masthead-title">What needs proof today?</h1>
            <p className="masthead-sub">
              Private findings in, verified totals out. Amounts never leave your device —
              the ledger carries only what zero-knowledge allows.
            </p>
          </div>
          <div className="masthead-actions">
            {isConnected && walletInfo ? (
              <span className="mono" style={{ fontSize: '0.76rem', color: 'var(--verify)', fontWeight: 700 }}>● {walletInfo.address.slice(0, 6)}… connected</span>
            ) : (
              <button className="btn btn-secondary" onClick={() => void connect()} disabled={walletState.status === 'idle' || walletState.status === 'connecting'}>
                {walletState.status === 'connecting' ? 'Connecting…' : 'Connect wallet'}
              </button>
            )}
            <Link to="/new" className="btn btn-primary">New case →</Link>
          </div>
        </div>
        <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--muted)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span>WALLET — {isConnected ? 'connected' : isDemo ? 'demo covers you' : 'not connected'}</span>
          <span>·</span>
          <span>SYSTEM — {membershipStatus === 'member' || isDemo ? 'ready to prove' : 'join required'}</span>
          <span>·</span>
          <span>LEDGER — {ledger ? `${ledger.cases.length} cases · aggregate ${aggregate}` : 'syncing…'}</span>
        </div>
      </header>

      {/* OPEN STATS — dividers, no boxes */}
      <section aria-label="Ledger at a glance">
        <div className="stat-strip">
          <div className="stat-open">
            <span className="stat-open-label">Cases on ledger</span>
            <span className="stat-open-value">{displayCases ? displayCases.length : '—'}</span>
            <span className="stat-open-sub">{open} open · {disclosed} disclosed</span>
          </div>
          <div className="stat-open">
            <span className="stat-open-label">Private findings</span>
            <span className="stat-open-value">{displayCases ? findings : '—'}</span>
            <span className="stat-open-sub">amounts stay redacted</span>
          </div>
          <div className="stat-open">
            <span className="stat-open-label">Verified · 7 days</span>
            <span className="stat-open-value" style={{ color: 'var(--verify)' }}>{displayCases ? verifiedWeek : '—'}</span>
            <span className="stat-open-sub">proofs checked</span>
          </div>
          <div className="stat-open">
            <span className="stat-open-label">Awaiting review</span>
            <span className="stat-open-value" style={{ color: 'var(--ochre)' }}>{displayCases ? open : '—'}</span>
            <span className="stat-open-sub">open matters</span>
          </div>
        </div>
      </section>

      {/* WORKSPACE SPLIT — queue + river */}
      <div className="split">
        <section className="section" aria-label="Priority queue">
          <div className="section-head">
            <div>
              <h2>Priority queue</h2>
              <p>Most recent inserts first. Each row is proof-backed — open the dossier to act.</p>
            </div>
            <Link to="/cases" className="section-link">All cases →</Link>
          </div>
          {!displayCases ? (
            <div style={{ display: 'grid', gap: 12, padding: '12px 0' }}>
              <div className="skeleton" style={{ height: 52 }} />
              <div className="skeleton" style={{ height: 52, opacity: 0.6 }} />
              <div className="skeleton" style={{ height: 52, opacity: 0.35 }} />
            </div>
          ) : tableRows.length === 0 ? (
            <div className="empty-open">
              <div style={{ fontSize: '1.6rem' }}>◇</div>
              <h3>No evidence yet</h3>
              <p>Create your first case — log a hidden finding and watch the total verify without revealing the amount.</p>
              <Link to="/new" className="btn btn-primary">Create case →</Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="queue-table">
                <thead>
                  <tr>
                    <th> matter</th>
                    <th>state</th>
                    <th>privacy</th>
                    <th>activity</th>
                    <th>proof</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((r) => (
                    <tr key={r.txId}>
                      <td>
                        <div className="queue-row-title">{r.caseTitle}</div>
                        <div className="queue-row-sub">#{r.caseIndex ?? '—'} · {r.txId.slice(0, 8)}… · block {r.blockHeight}</div>
                      </td>
                      <td>{r.stepType === 'closeCase' ? <span className="badge badge-pending">Sealed</span> : <span className="badge badge-verify">Open</span>}</td>
                      <td><span className="badge badge-private">Redacted</span></td>
                      <td className="mono" style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{fmtDateShort(r.createdAt)}</td>
                      <td style={{ color: 'var(--verify)', fontWeight: 700, fontSize: '0.86rem' }}>✓ Valid</td>
                      <td><Link to={`/cases/${r.caseIdStr}`} className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: '0.82rem' }}>Open →</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="wire-strip">
            <span><span style={{ color: 'var(--verify)', fontWeight: 700 }}>✓ Valid</span> = ZK proof checked</span>
            <span>·</span>
            <span>Members {members} · Aggregate {aggregate}</span>
          </div>
        </section>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 28 }} aria-label="Verification">
          <section className="section">
            <div className="section-head">
              <div>
                <h2 style={{ fontSize: '1.3rem' }}>Verification river</h2>
              </div>
              <span className="mono" style={{ fontSize: '0.66rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Live</span>
            </div>
            {!displayCases ? (
              <div className="mono" style={{ color: 'var(--muted)', fontSize: '0.86rem' }}>Syncing ledger…</div>
            ) : recent.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No recent activity.</div>
            ) : (
              <div className="river">
                {recent.map((r) => (
                  <div key={r.txId} className="river-item">
                    <span className={`river-dot ${r.stepType === 'closeCase' ? 'river-dot-warn' : 'river-dot-verify'}`} />
                    <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                      {r.stepType === 'discloseFinding' ? 'Disclosed' : r.stepType === 'closeCase' ? 'Sealed' : 'Finding logged'}
                      <span className="mono" style={{ fontWeight: 400, fontSize: '0.76rem', color: 'var(--muted)' }}> · {r.caseTitle}</span>
                    </div>
                    <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 2 }}>{r.txId.slice(0, 10)}… · block {r.blockHeight} · {fmtDateShort(r.createdAt)}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* THE one selective container on this page */}
          <div className="solo-card">
            <div className="solo-card-head">
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Ledger integrity</strong>
              <span className="badge badge-verify">● Preprod</span>
            </div>
            <div className="solo-card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--muted)' }}>Aggregate total</span>
                <strong className="mono">{aggregate}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--muted)' }}>Investigators</span>
                <strong className="mono">{members}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--muted)' }}>Private amounts</span>
                <span className="redacted redacted-sm">always hidden</span>
              </div>
              <Link to="/audit" className="btn btn-primary" style={{ width: '100%' }}>Open verification console →</Link>
            </div>
            <div className="solo-card-foot">
              <WalletStatus walletState={walletState} isMobile={false} />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
