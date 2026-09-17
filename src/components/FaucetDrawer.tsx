import { useState, useEffect, useRef } from 'react';

export default function FaucetDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    prevFocus.current = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && containerRef.current) {
        const focusable = containerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        const first = focusable[0]; const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    setTimeout(() => closeRef.current?.focus(), 0);
    return () => { window.removeEventListener('keydown', onKey); prevFocus.current?.focus(); };
  }, [open, onClose]);
  if (!open) return null;
  const copyCmd = async () => {
    try { await navigator.clipboard.writeText('docker compose up -d --wait proof-server'); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'grid', placeItems: 'center', padding: 16 }} role="dialog" aria-modal="true" aria-label="Wallet setup">
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }} />
      <div ref={containerRef} className="ledger" style={{ position: 'relative', maxWidth: 560, width: '100%', maxHeight: '90vh', overflow: 'auto', background: 'var(--ink-2)', borderColor: 'var(--line-ink-strong)' }}>
        <div className="ledger-head" style={{ position: 'sticky', top: 0 }}>
          <span className="ledger-title">Setup in 60s — wallet + tNIGHT</span>
          <button ref={closeRef} className="btn btn-ghost" onClick={onClose} aria-label="Close dialog">✕</button>
        </div>
        <div style={{ padding: 16, display: 'grid', gap: 14 }}>
          {[
            { n: '01', t: 'Install wallet', d: 'Lace or 1AM extension → create wallet → switch network to Preprod (top-right).', cta: 'Get Lace', href: 'https://www.lace.io/' },
            { n: '02', t: 'Fund tNIGHT', d: 'Copy your address from wallet → paste at faucet → receive tNIGHT + DUST in ~20s.', cta: 'Open faucet ↗', href: 'https://faucet.preprod.midnight.network' },
            { n: '03', t: 'Connect', d: 'Return here → Connect wallet → allow. If proving fails, auto-fallback to proof server.', cta: null, href: null },
          ].map((s) => (
            <div key={s.n} className="ledger-row" style={{ alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 12, minWidth: 0 }}>
                <span className="mono" style={{ color: 'var(--blue)', fontWeight: 700 }}>{s.n}</span>
                <div>
                  <strong style={{ color: 'var(--paper)' }}>{s.t}</strong>
                  <div style={{ color: 'var(--muted-ink)', fontSize: '0.86rem', marginTop: 2 }}>{s.d}</div>
                </div>
              </div>
              {s.href && <a href={s.href} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{s.cta}</a>}
            </div>
          ))}
          <div className="wire" style={{ fontSize: '0.78rem' }}>
            <div style={{ color: 'var(--muted-ink)', marginBottom: 6, fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Proof server fallback — local dev only</div>
            <code className="mono" style={{ background: 'rgba(255,255,255,0.06)', padding: '4px 8px', borderRadius: 3, border: '1px solid var(--line-ink)' }}>docker compose up -d --wait proof-server</code>
            <button className="btn btn-ghost" onClick={copyCmd} style={{ marginLeft: 8, padding: '4px 8px', fontSize: '0.72rem' }}>{copied ? 'Copied ✓' : 'Copy'}</button>
            <div style={{ marginTop: 6, color: 'var(--muted-ink)' }}>On localhost, wallet proving auto-retries http://localhost:6300 on Failed to fetch — set <span className="mono">VITE_PROOF_SERVER_URI</span> to speed first proof. On Vercel/production this fallback is never used — your Midnight wallet (IAM Wallet) proves in-wallet or Demo covers you.</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a href="https://faucet.preprod.midnight.network" target="_blank" rel="noreferrer" className="btn btn-primary">Get tNIGHT →</a>
            <button className="btn btn-verify" onClick={onClose}>I’m funded — continue</button>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--muted-ink)', borderTop: '1px solid var(--line-ink)', paddingTop: 10 }}>
            Prefer demo? Keep Demo on — no wallet, mock ledger, same UI. Toggle in header rail.
          </div>
        </div>
      </div>
    </div>
  );
}
