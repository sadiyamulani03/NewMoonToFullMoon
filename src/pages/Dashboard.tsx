import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getStats, listCases, type ForensicCase } from '../lib/api';
import { useMidnightContext } from '../context/MidnightContext';
import { useDemo } from '../context/DemoContext';
import { useToast } from '../context/ToastContext';
import WalletStatus from '../components/WalletStatus';
import { useCountUp } from '../hooks/useCountUp';
import { MiniSparkline } from '../components/MiniSparkline';

function fmtDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function Dashboard() {
  const { walletState, midLedger, membershipStatus, isConnected, walletInfo, connect } = useMidnightContext();
  const { isDemo, mockCases, mockLedger } = useDemo();
  const { toast } = useToast();
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

  // Animated KPI counts
  const ready = !!displayCases;
  const totalCasesCount = useCountUp(displayCases?.length ?? 0, 900, ready);
  const findingsCount = useCountUp(findings, 1100, ready);
  const verifiedWeekCount = useCountUp(verifiedWeek, 1000, ready);
  const openCount = useCountUp(open, 850, ready);

  const [queueFilter, setQueueFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'sealed'>('all');

  const filteredRows = useMemo(() => {
    let rows = tableRows;
    if (statusFilter === 'open') {
      rows = rows.filter((r) => r.stepType !== 'closeCase');
    } else if (statusFilter === 'sealed') {
      rows = rows.filter((r) => r.stepType === 'closeCase');
    }
    const q = queueFilter.trim().toLowerCase();
    if (q) {
      rows = rows.filter((r) =>
        r.caseTitle.toLowerCase().includes(q) ||
        r.txId.toLowerCase().includes(q) ||
        String(r.caseIndex ?? '').includes(q)
      );
    }
    return rows;
  }, [tableRows, queueFilter, statusFilter]);

  const handleCopyTx = async (txId: string) => {
    try {
      await navigator.clipboard.writeText(txId);
      toast(`Copied tx hash: ${txId.slice(0, 10)}…`, 'success');
    } catch {
      toast('Failed to copy hash', 'warning');
    }
  };

  return (
    <>
      {/* COMMAND CENTER MASTHEAD */}
      <header className="masthead">
        <div className="neon-badge neon-badge-emerald" style={{ alignSelf: 'flex-start' }}>
          <span className="pulse-dot" />
          Midnight Preprod · Zero-Knowledge Evidence Workspace
        </div>
        
        <div className="masthead-row" style={{ marginTop: 8 }}>
          <div style={{ minWidth: 0 }}>
            <h1 className="display masthead-title">Forensic Operations Center</h1>
            <p className="masthead-sub">
              Verify sensitive transaction flows in zero-knowledge. Amounts stay securely shielded on your device,
              while the Midnight ledger maintains verifiable, tamper-evident cryptographic proofs.
            </p>
          </div>
          <div className="masthead-actions">
            {isConnected && walletInfo ? (
              <span className="copy-chip" onClick={() => handleCopyTx(walletInfo.address)} title="Click to copy address">
                <span className="pulse-dot" style={{ width: 6, height: 6 }} />
                {walletInfo.address.slice(0, 6)}…{walletInfo.address.slice(-4)}
              </span>
            ) : (
              <button className="btn btn-secondary" onClick={() => void connect()} disabled={walletState.status === 'connecting'}>
                {walletState.status === 'connecting' ? 'Connecting…' : 'Connect Lace Wallet'}
              </button>
            )}
            <Link to="/new" className="btn btn-primary">
              + New Case Dossier
            </Link>
          </div>
        </div>

        {/* Live System Diagnostics Ribbon */}
        <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', paddingTop: 6 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: isConnected ? '#10B981' : isDemo ? '#38BDF8' : '#F59E0B' }}>●</span>
            WALLET: {isConnected ? 'LACE CONNECTED' : isDemo ? 'DEMO ACTIVE' : 'DISCONNECTED'}
          </span>
          <span>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: membershipStatus === 'member' || isDemo ? '#10B981' : '#F59E0B' }}>●</span>
            CIRCUIT PERMISSION: {membershipStatus === 'member' || isDemo ? 'AUTHORIZED INVESTIGATOR' : 'ALLOWLIST REQUIRED'}
          </span>
          <span>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#10B981' }}>●</span>
            LEDGER STATE: {ledger ? `${ledger.cases.length} DOSSIERS · AGGREGATE ${aggregate}` : 'SYNCING…'}
          </span>
        </div>
      </header>

      {/* ELEVATED 4-CARD KPI METRICS */}
      <section aria-label="Ledger at a glance">
        <div className="kpi-grid">
          <div className="kpi-card anim-fade-up anim-stagger-1">
            <div className="kpi-header">
              <span className="kpi-label">Active Dossiers</span>
              <div className="kpi-icon-pill" style={{ color: '#38BDF8' }}>📁</div>
            </div>
            <div className="kpi-value">{ready ? totalCasesCount : '—'}</div>
            <div className="kpi-bottom-row">
              <div className="kpi-sub">
                <span style={{ color: '#10B981', fontWeight: 700 }}>{ready ? openCount : '—'} active</span> · {ready ? disclosed : '—'} disclosed
              </div>
              <MiniSparkline color="#38BDF8" trend="up" />
            </div>
          </div>

          <div className="kpi-card anim-fade-up anim-stagger-2">
            <div className="kpi-header">
              <span className="kpi-label">Shielded Steps</span>
              <div className="kpi-icon-pill" style={{ color: '#10B981' }}>🔒</div>
            </div>
            <div className="kpi-value">{ready ? findingsCount : '—'}</div>
            <div className="kpi-bottom-row">
              <div className="kpi-sub">
                <span className="redacted redacted-sm">amount</span> 100% on-device
              </div>
              <MiniSparkline color="#10B981" trend="up" />
            </div>
          </div>

          <div className="kpi-card anim-fade-up anim-stagger-3">
            <div className="kpi-header">
              <span className="kpi-label">7-Day ZK Proofs</span>
              <div className="kpi-icon-pill" style={{ color: '#F59E0B' }}>🛡️</div>
            </div>
            <div className="kpi-value text-gradient-emerald">{ready ? verifiedWeekCount : '—'}</div>
            <div className="kpi-bottom-row">
              <div className="kpi-sub">
                <span style={{ color: '#10B981', fontWeight: 700 }}>✓ Verified</span> on Midnight Preprod
              </div>
              <MiniSparkline color="#34D399" trend="up" />
            </div>
          </div>

          <div className="kpi-card anim-fade-up anim-stagger-4">
            <div className="kpi-header">
              <span className="kpi-label">Pending Reviews</span>
              <div className="kpi-icon-pill" style={{ color: '#818CF8' }}>⏳</div>
            </div>
            <div className="kpi-value text-gradient-amber">{ready ? openCount : '—'}</div>
            <div className="kpi-bottom-row">
              <div className="kpi-sub">Awaiting disclosure or seal</div>
              <MiniSparkline color="#F59E0B" trend="flat" />
            </div>
          </div>
        </div>
      </section>

      {/* WORKSPACE SPLIT — Priority Queue + Verification River */}
      <div className="split anim-fade-up anim-stagger-3">
        <section className="section" aria-label="Priority queue" style={{ minWidth: 0 }}>
          <div className="section-head">
            <div>
              <h2 style={{ fontSize: '1.45rem' }}>Evidence Priority Queue</h2>
              <p>Cryptographically attested findings sorted chronologically. Open any dossier to inspect or append proof.</p>
            </div>
            <Link to="/cases" className="section-link" style={{ fontSize: '0.88rem', fontWeight: 600 }}>
              All Dossiers ({displayCases?.length ?? 0}) →
            </Link>
          </div>

          {/* Quick search and filter controls */}
          <div className="filter-bar" style={{ marginBottom: 12 }}>
            <div className="search-box" style={{ maxWidth: 360, flex: 1 }}>
              <span className="search-icon" aria-hidden="true">🔍</span>
              <input
                className="input"
                placeholder="Search matter title, tx hash, or index..."
                value={queueFilter}
                onChange={(e) => setQueueFilter(e.target.value)}
                style={{ padding: '9px 12px 9px 38px', fontSize: '0.88rem' }}
                aria-label="Filter priority queue"
              />
            </div>
            <div className="filter-pills">
              {(['all', 'open', 'sealed'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`filter-pill ${statusFilter === mode ? 'active' : ''}`}
                  onClick={() => setStatusFilter(mode)}
                >
                  {mode === 'all' ? 'All' : mode === 'open' ? 'Active' : 'Sealed'}
                </button>
              ))}
            </div>
            {queueFilter && (
              <button className="btn btn-ghost" onClick={() => setQueueFilter('')} style={{ padding: '6px 10px', fontSize: '0.78rem' }}>
                Clear
              </button>
            )}
          </div>

          {!displayCases ? (
            <div style={{ display: 'grid', gap: 12, padding: '12px 0' }}>
              <div className="skeleton" style={{ height: 60 }} />
              <div className="skeleton" style={{ height: 60, opacity: 0.6 }} />
              <div className="skeleton" style={{ height: 60, opacity: 0.35 }} />
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="empty-open">
              <div style={{ fontSize: '2rem' }}>◇</div>
              <h3>No matching evidence found</h3>
              <p>
                {tableRows.length === 0
                  ? 'No forensic cases created yet. Initialize your first dossier to log encrypted findings.'
                  : 'No records matched your current query filter.'}
              </p>
              {tableRows.length === 0 ? (
                <Link to="/new" className="btn btn-primary" style={{ marginTop: 12 }}>
                  + Create First Case
                </Link>
              ) : (
                <button
                  className="btn btn-secondary"
                  onClick={() => { setQueueFilter(''); setStatusFilter('all'); }}
                  style={{ marginTop: 12 }}
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
              <table className="queue-table">
                <thead>
                  <tr>
                    <th>Matter / Dossier</th>
                    <th>Status</th>
                    <th>Shielding</th>
                    <th>Date</th>
                    <th>ZK Verification</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r) => (
                    <tr key={r.txId}>
                      <td>
                        <Link to={`/cases/${r.caseIdStr}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <div className="queue-row-title">{r.caseTitle}</div>
                        </Link>
                        <div className="queue-row-sub" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <span className="mono" style={{ color: 'var(--cyan)' }}>#{r.caseIndex ?? '0'}</span>
                          <span>·</span>
                          <span
                            className="copy-chip"
                            onClick={() => handleCopyTx(r.txId)}
                            title="Click to copy full transaction ID"
                          >
                            {r.txId.slice(0, 8)}…
                          </span>
                          <span>·</span>
                          <span className="mono" style={{ color: 'var(--text-muted)' }}>block {r.blockHeight}</span>
                        </div>
                      </td>
                      <td>
                        {r.stepType === 'closeCase' ? (
                          <span className="badge badge-pending">● Sealed</span>
                        ) : (
                          <span className="badge badge-verify">● Active</span>
                        )}
                      </td>
                      <td>
                        <span className="redacted redacted-sm" title="Amount is kept private on client device">
                          hidden
                        </span>
                      </td>
                      <td className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {fmtDateShort(r.createdAt)}
                      </td>
                      <td>
                        <span style={{ color: '#10B981', fontWeight: 700, fontSize: '0.86rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span>✓</span> Valid Proof
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/cases/${r.caseIdStr}`} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
                          Inspect →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="wire-strip" style={{ marginTop: 16 }}>
            <span><strong style={{ color: 'var(--verify)' }}>✓ Valid Proof</strong> = Compact circuit verified</span>
            <span>·</span>
            <span>Authorized Investigators: {members}</span>
            <span>·</span>
            <span>On-Chain Aggregate: {aggregate}</span>
          </div>
        </section>

        {/* SIDEBAR: Live River + Ledger Integrity */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 24 }} aria-label="Verification">
          {/* Live Activity River */}
          <section className="section" style={{ minWidth: 0 }}>
            <div className="section-head">
              <div>
                <h2 style={{ fontSize: '1.25rem' }}>Verification River</h2>
              </div>
              <span className="neon-badge neon-badge-emerald" style={{ padding: '3px 8px', fontSize: '0.62rem' }}>
                <span className="pulse-dot" style={{ width: 5, height: 5 }} /> LIVE STREAM
              </span>
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
                      {r.stepType === 'discloseFinding' ? 'Disclosed Finding' : r.stepType === 'closeCase' ? 'Case Sealed' : 'ZK Step Logged'}
                      <Link to={`/cases/${r.caseIdStr}`} className="mono" style={{ fontWeight: 400, fontSize: '0.78rem', color: 'var(--text-secondary)', textDecoration: 'none', marginLeft: 6 }}>
                        · {r.caseTitle}
                      </Link>
                    </div>
                    <div className="mono" style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 3 }}>
                      {r.txId.slice(0, 10)}… · block #{r.blockHeight} · {fmtDateShort(r.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Ledger Integrity Card */}
          <div className="solo-card">
            <div className="solo-card-head">
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: '#fff' }}>
                Ledger Cryptographic Invariants
              </strong>
              <span className="badge badge-verify">● Preprod Verified</span>
            </div>
            <div className="solo-card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Σ Individual Totals</span>
                <strong className="mono" style={{ color: '#10B981' }}>{aggregate} (Consistent)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Allowlist Investigators</span>
                <strong className="mono">{members} Active</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Constituent Evidence</span>
                <span className="redacted redacted-sm">permanently shielded</span>
              </div>
              <Link to="/audit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
                Open Universal Audit Console →
              </Link>
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
