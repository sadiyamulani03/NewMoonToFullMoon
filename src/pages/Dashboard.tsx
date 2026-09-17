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
      {/* COMMAND HEADER */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 16, borderBottom: '1px solid var(--line-ink)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <h1 className="display" style={{ margin: 0, fontSize: 'clamp(28px, 4vw, 36px)', letterSpacing: '-0.03em', color: 'var(--paper)', lineHeight: 1 }}>Your Cases</h1>
            <p style={{ margin: '6px 0 0', color: 'var(--muted-ink)', fontSize: '0.92rem', maxWidth: '52ch' }}>
              Private evidence, publicly verifiable. No sensitive witness leaves your device.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--muted-ink)', border: '1px solid var(--line-ink)', padding: '6px 10px', borderRadius: 999 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--verify)', display: 'inline-block' }} /> Midnight Preprod
              <span style={{ opacity: 0.3 }}>·</span> {aggregate} aggregate
            </div>
            {isConnected && walletInfo ? (
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--verify)', border: '1px solid var(--verify-border)', background: 'var(--verify-soft)', padding: '7px 12px', borderRadius: 999, fontWeight: 700 }}>● {walletInfo.address.slice(0,6)}…</span>
            ) : (
              <button className="btn btn-primary" onClick={() => void connect()} disabled={walletState.status === 'idle' || walletState.status === 'connecting'} style={{ padding: '8px 16px', fontSize: '0.84rem' }}>{walletState.status === 'connecting' ? 'Connecting…' : 'Connect wallet'}</button>
            )}
            <Link to="/new" className="btn btn-primary" style={{ background: 'var(--ochre)', color: 'var(--ink)', borderColor: 'var(--ochre)', fontWeight: 700 }}>New case</Link>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--muted-ink)' }}>
          <span>WALLET {isConnected ? 'Connected' : isDemo ? 'Demo' : 'Not connected'}</span>
          <span>·</span>
          <span>SYSTEM {membershipStatus === 'member' || isDemo ? 'Ready' : 'Not authorized'}</span>
          <span>·</span>
          <span>LEDGER {ledger ? `${ledger.cases.length} cases` : '—'}</span>
        </div>
      </div>

      {/* METRIC STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: '1px solid var(--line-ink)', borderRadius: '12px', overflow: 'hidden', background: '#121824' }}>
        {[
          { label: 'Cases', value: displayCases ? displayCases.length : '—', sub: `${open} open` },
          { label: 'Evidence', value: displayCases ? findings : '—', sub: 'private → proof' },
          { label: 'Verified', value: displayCases ? verifiedWeek : '—', sub: 'last 7 days', color: 'var(--verify)' },
          { label: 'Open', value: displayCases ? open : '—', sub: `${disclosed} disclosed`, color: 'var(--ochre)' },
        ].map((k) => (
          <div key={k.label} style={{ padding: '16px 20px', borderRight: '1px solid var(--line-ink)', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-ink)', fontWeight: 700 }}>{k.label}</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', lineHeight: 1, color: (k as any).color || 'var(--paper)', fontWeight: 700 }}>{k.value}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--muted-ink)' }}>{k.sub}</span>
          </div>
        ))}
      </div>

      {/* MAIN TABLE */}
      <section style={{ border: '1px solid var(--line-ink)', borderRadius: '16px', overflow: 'hidden', background: '#121824' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--line-ink)', background: 'rgba(255,255,255,0.01)' }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--paper)' }}>Cases</h2>
          <Link to="/cases" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--blue)' }}>View all →</Link>
        </div>
        {!displayCases ? (
          <div style={{ padding: 24, display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span className="spinner" /><span className="mono" style={{ color: 'var(--muted-ink)' }}>Loading cases…</span></div>
            <div className="skeleton" style={{ height: 44 }} />
            <div className="skeleton" style={{ height: 44, opacity: 0.6 }} />
          </div>
        ) : tableRows.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line-ink)', display: 'grid', placeItems: 'center', margin: '0 auto', color: 'var(--muted-ink)' }}>◇</div>
            <h3 style={{ margin: '12px 0 6px', fontFamily: 'var(--font-display)', color: 'var(--paper)' }}>No cases yet</h3>
            <p style={{ margin: 0, color: 'var(--muted-ink)', fontSize: '0.88rem', maxWidth: '36ch', marginInline: 'auto' }}>Create your first case to begin building a verifiable evidence record.</p>
            <Link to="/new" className="btn btn-primary" style={{ marginTop: 16 }}>Create case</Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-ink)', borderBottom: '1px solid var(--line-ink)', background: 'rgba(255,255,255,0.01)' }}>
                  <th style={{ padding: '10px 20px', fontWeight: 700 }}>Case</th>
                  <th style={{ padding: '10px 16px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '10px 16px', fontWeight: 700 }}>Evidence</th>
                  <th style={{ padding: '10px 16px', fontWeight: 700 }}>Last activity</th>
                  <th style={{ padding: '10px 16px', fontWeight: 700 }}>Verification</th>
                  <th style={{ padding: '10px 16px', fontWeight: 700 }}></th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((r) => (
                  <tr key={r.txId} style={{ borderBottom: '1px solid var(--line-ink)' }}>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--paper)', fontSize: '0.88rem' }}>{r.caseTitle}</div>
                      <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)' }}>#{r.caseIndex ?? '—'} · {r.txId.slice(0, 8)}…</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{r.stepType === 'closeCase' ? <span className="badge badge-pending">Sealed</span> : <span className="badge badge-verify">Verified</span>}</td>
                    <td style={{ padding: '12px 16px' }}><span className="badge badge-private">Private</span></td>
                    <td style={{ padding: '12px 16px' }}><span className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted-ink)' }}>{fmtDateShort(r.createdAt)}</span></td>
                    <td style={{ padding: '12px 16px' }}><span style={{ color: 'var(--verify)', fontWeight: 700, fontSize: '0.78rem' }}>✓ Valid</span></td>
                    <td style={{ padding: '12px 16px' }}><Link to={`/cases/${r.caseIdStr}`} className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>Open →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--line-ink)', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--muted-ink)' }}>
          <span><span className="badge badge-verify" style={{ fontSize: '0.62rem' }}>Verified</span> = ZK proof checked</span>
          <span>Members {members} · Aggregate {aggregate}</span>
        </div>
      </section>

      {/* RECENT ACTIVITY */}
      <section style={{ border: '1px solid var(--line-ink)', borderRadius: '16px', overflow: 'hidden', background: '#121824' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line-ink)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--paper)' }}>Recent activity</h3>
          <span className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-ink)' }}>Timeline</span>
        </div>
        {!displayCases ? (
          <div style={{ padding: 20, color: 'var(--muted-ink)', fontSize: '0.86rem' }}>Syncing ledger…</div>
        ) : recent.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted-ink)', fontSize: '0.86rem' }}>No recent activity.</div>
        ) : (
          <div style={{ display: 'grid' }}>
            {recent.map((r) => (
              <div key={r.txId} style={{ display: 'grid', gridTemplateColumns: '16px 1fr auto', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--line-ink)', alignItems: 'center' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.stepType === 'closeCase' ? 'var(--ochre)' : 'var(--verify)', display: 'inline-block', marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--paper)', fontSize: '0.86rem' }}>{r.stepType === 'discloseFinding' ? 'Disclosed' : r.stepType === 'closeCase' ? 'Sealed' : 'Finding logged'} <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted-ink)', fontWeight: 400 }}>· {r.caseTitle}</span></div>
                  <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)' }}>{r.txId.slice(0, 10)}… · block {r.blockHeight}</div>
                </div>
                <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted-ink)' }}>{fmtDateShort(r.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--line-ink)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <WalletStatus walletState={walletState} isMobile={isMobile} />
        </div>
      </section>
    </>
  );
}
