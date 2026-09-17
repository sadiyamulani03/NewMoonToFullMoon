import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getStats, listCases, type ForensicCase } from '../lib/api';
import { useMidnightContext } from '../context/MidnightContext';
import { useDemo } from '../context/DemoContext';
import WalletStatus from '../components/WalletStatus';

function fmtDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export default function Dashboard() {
  const { walletState, isMobile, midLedger, membershipStatus, isConnected, walletInfo, connect } = useMidnightContext();
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

  const { open, findings, disclosed, verifiedWeek, recent, tableRows } = useMemo(() => {
    const all = displayCases ?? [];
    const open = all.filter((c) => c.status === 'open').length;
    const allReceipts = all.flatMap((c) => c.receipts.map((r) => ({ ...r, caseTitle: c.title, caseIdStr: c.id, caseStatus: c.status })));
    const findings = allReceipts.filter((r) => r.stepType === 'logStep' || !r.stepType).length;
    const disclosed = allReceipts.filter((r) => r.stepType === 'discloseFinding').length;
    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const verifiedWeek = allReceipts.filter((r) => new Date(r.createdAt).getTime() > weekAgo).length;
    const recent = [...allReceipts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
    const tableRows = [...allReceipts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);
    return { open, findings, disclosed, verifiedWeek, recent, tableRows };
  }, [displayCases]);

  const aggregate = ledger?.aggregate.toString() ?? '—';
  const members = ledger?.memberCount.toString() ?? '—';

  return (
    <>
      {/* HEADER */}
      <div className="dash-header">
        <div>
          <div className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-ink)', fontWeight: 700 }}>Dashboard · {isDemo ? 'Demo — not on-chain' : 'Midnight Preprod · Live ledger'}</div>
          <h1 className="display" style={{ margin: '4px 0 6px', fontSize: 'clamp(1.5rem, 3vw, 1.9rem)', lineHeight: 1, letterSpacing: '-0.03em', color: 'var(--paper)' }}>Evidence overview</h1>
          <p style={{ margin: 0, color: 'var(--muted-ink)', fontSize: '0.88rem', maxWidth: '60ch' }}>
            Private amounts stay <span className="redacted redacted-sm">redacted</span>. Public totals carry a <span className="badge badge-verify" style={{ fontSize: '0.62rem' }}>Verified</span> stamp. Only totals are auditable.
          </p>
        </div>
        <div className="dash-header-actions">
          <div className="dash-wallet-pill">
            {isConnected && walletInfo ? (
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--verify)', fontWeight: 700 }}>● {walletInfo.address.slice(0,8)}…{walletInfo.address.slice(-6)} · {walletInfo.networkId}</span>
            ) : isDemo ? (
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--verify)' }}>● Demo — no wallet</span>
            ) : walletState.status === 'connecting' ? (
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted-ink)' }}>Connecting…</span>
            ) : (
              <button className="btn btn-primary" onClick={() => void connect()} disabled={walletState.status==='idle'} style={{ padding: '7px 14px', fontSize: '0.82rem' }}>{walletState.status==='idle' ? 'Initializing…' : 'Connect Wallet'}</button>
            )}
          </div>
          <Link to="/new" className="btn btn-primary" style={{ background: '#F4C770', color: '#0B1020', borderColor: '#F4C770', fontWeight: 700 }}>New evidence →</Link>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: '0.72rem', color: 'var(--muted-ink)', fontFamily: 'var(--font-mono)' }}>
        <span>Aggregate <strong style={{ color: 'var(--paper)' }}>{aggregate}</strong></span>
        <span>· Members <strong style={{ color: 'var(--paper)' }}>{members}</strong></span>
        <span>· {membershipStatus === 'member' || isDemo ? <span style={{ color: 'var(--verify)' }}>● Authorized</span> : <span style={{ color: 'var(--ochre)' }}>Not authorized</span>}</span>
      </div>

      {/* KPI ROW */}
      <section className="dash-kpi-row" aria-label="Key metrics">
        <div className="dash-kpi">
          <span className="dash-kpi-label">Evidence records</span>
          <strong className="dash-kpi-value">{displayCases ? findings : '—'}</strong>
          <span className="dash-kpi-meta">private <span className="redacted redacted-sm" style={{ verticalAlign: 'middle' }}>amount</span> → proof</span>
        </div>
        <div className="dash-kpi">
          <span className="dash-kpi-label" style={{ color: 'var(--verify)' }}>Verified</span>
          <strong className="dash-kpi-value" style={{ color: 'var(--verify)' }}>{displayCases ? verifiedWeek : '—'}</strong>
          <span className="dash-kpi-meta">last 7 days · ZK checked</span>
        </div>
        <div className="dash-kpi">
          <span className="dash-kpi-label" style={{ color: 'var(--ochre)' }}>Pending</span>
          <strong className="dash-kpi-value" style={{ color: 'var(--ochre)' }}>{displayCases ? open : '—'}</strong>
          <span className="dash-kpi-meta">{displayCases ? `${disclosed} disclosed` : 'loading'}</span>
        </div>
        <div className="dash-kpi">
          <span className="dash-kpi-label">Audited</span>
          <strong className="dash-kpi-value">{displayCases ? displayCases.length : '—'}</strong>
          <span className="dash-kpi-meta">cases · aggregate {aggregate}</span>
        </div>
      </section>

      {/* MAIN: table + side */}
      <div className="dash-main-grid">
        {/* TABLE */}
        <section className="ledger dash-table-card">
          <div className="ledger-head">
            <span className="ledger-title">Evidence records</span>
            <Link to="/cases" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>View all →</Link>
          </div>
          {!displayCases ? (
            <div style={{ padding: 18, display: 'grid', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span className="spinner" /><span className="mono" style={{ color: 'var(--muted-ink)', fontSize: '0.86rem' }}>Loading evidence ledger…</span></div>
              <div className="skeleton" style={{ height: 48 }} />
              <div className="skeleton" style={{ height: 48, opacity: 0.7 }} />
            </div>
          ) : tableRows.length === 0 ? (
            <div className="empty" style={{ margin: 12 }}>
              <div className="empty-icon">📁</div>
              <h3 className="empty-title">No evidence yet</h3>
              <p className="empty-text">Create your first investigation — the ledger will show a verifiable total while the amount stays <span className="redacted redacted-sm">redacted</span>.</p>
              <Link to="/new" className="btn btn-primary">Open first case</Link>
              <p className="muted-text" style={{ marginTop: 10, fontSize: '0.78rem' }}>Or enable <strong>Demo — no wallet</strong> in the header to see seeded cases.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="dash-table">
                <thead>
                  <tr><th>Evidence</th><th>Type</th><th>Status</th><th>Privacy</th><th>Timestamp</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {tableRows.map((r) => (
                    <tr key={r.txId}>
                      <td><div style={{ fontWeight: 600, color: 'var(--paper)', fontSize: '0.88rem' }}>{r.caseTitle}</div><div className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)' }}>#{r.caseIndex ?? '—'} · {r.txId.slice(0,8)}…</div></td>
                      <td><span className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted-ink)' }}>{r.stepType === 'discloseFinding' ? 'Disclose' : r.stepType === 'closeCase' ? 'Seal' : 'Finding'}</span></td>
                      <td>{r.stepType === 'closeCase' ? <span className="badge badge-pending">Sealed</span> : <span className="badge badge-verify">Verified</span>}</td>
                      <td><span className="badge badge-private"><span className="redacted redacted-sm" style={{ marginRight: 4 }}>am</span> Private</span></td>
                      <td><div className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted-ink)' }}>{fmtDateShort(r.createdAt)}</div><div className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)' }}>{fmtTime(r.createdAt)}</div></td>
                      <td><Link to={`/cases/${r.caseIdStr}`} className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.72rem' }}>View →</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ padding: '10px 14px', borderTop: '1px solid var(--line-ink)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: '0.76rem', color: 'var(--muted-ink)' }}>
            <span><span className="badge badge-verify" style={{ fontSize: '0.62rem' }}>Verified</span> = ZK proof checked · <span className="badge badge-private" style={{ fontSize: '0.62rem' }}>Private</span> = never on-chain</span>
            <Link to="/cases" style={{ fontWeight: 700 }}>Browse all cases →</Link>
          </div>
        </section>

        {/* SIDE: recent activity */}
        <aside className="ledger dash-side">
          <div className="ledger-head">
            <span className="ledger-title">Recent activity</span>
            <span className="mono" style={{ fontSize: '0.62rem', color: 'var(--muted-ink)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Timeline</span>
          </div>
          {!displayCases ? (
            <div style={{ padding: 14, color: 'var(--muted-ink)', fontSize: '0.86rem' }}>Syncing ledger…</div>
          ) : recent.length === 0 ? (
            <div style={{ padding: 18, textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem' }}>◎</div>
              <p style={{ color: 'var(--muted-ink)', fontSize: '0.86rem', margin: '6px 0 0' }}>No recent inserts.</p>
              <Link to="/new" className="btn btn-primary" style={{ marginTop: 8, padding: '6px 10px', fontSize: '0.78rem' }}>New evidence</Link>
            </div>
          ) : (
            <div className="timeline" style={{ padding: 0 }}>
              {recent.map((r) => (
                <div key={r.txId} className="timeline-item">
                  <div className={`timeline-dot ${r.stepType === 'closeCase' ? 'timeline-dot-pending' : 'timeline-dot-verify'}`} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                      <strong style={{ color: 'var(--paper)', fontSize: '0.84rem' }}>{r.stepType === 'discloseFinding' ? 'Disclosed' : r.stepType === 'closeCase' ? 'Sealed' : 'Finding logged'}</strong>
                      <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)' }}>{fmtDateShort(r.createdAt)}</span>
                    </div>
                    <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)', marginTop: 2 }}>{r.caseTitle} · #{r.caseIndex ?? '—'}</div>
                    <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)', wordBreak: 'break-all' }}>{r.txId.slice(0,12)}… · block {r.blockHeight}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ padding: '10px 12px', borderTop: '1px solid var(--line-ink)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {!isDemo && <WalletStatus walletState={walletState} isMobile={isMobile} />}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Link to="/cases" className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>Browse cases</Link>
              <Link to="/audit" className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>Audit</Link>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
