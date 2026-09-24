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
        const focusable = containerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    setTimeout(() => closeRef.current?.focus(), 0);
    return () => {
      window.removeEventListener('keydown', onKey);
      prevFocus.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const copyCmd = async () => {
    try {
      await navigator.clipboard.writeText('docker compose up -d --wait proof-server');
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'grid',
        placeItems: 'center',
        padding: 20,
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Wallet setup"
    >
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(2, 4, 8, 0.75)',
          backdropFilter: 'blur(8px)',
        }}
      />
      <div
        ref={containerRef}
        className="card"
        style={{
          position: 'relative',
          maxWidth: 580,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          background: '#0d1326',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          borderRadius: 20,
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 30px rgba(56, 189, 248, 0.15)',
        }}
      >
        <div
          className="ledger-head"
          style={{
            position: 'sticky',
            top: 0,
            background: 'rgba(13, 19, 38, 0.95)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '18px 24px',
          }}
        >
          <span className="ledger-title" style={{ color: '#fff', fontSize: '1.15rem' }}>
            Setup in 60s — Wallet & tNIGHT
          </span>
          <button
            ref={closeRef}
            className="btn btn-ghost"
            onClick={onClose}
            aria-label="Close dialog"
            style={{ padding: '6px 12px' }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: 24, display: 'grid', gap: 16 }}>
          {[
            {
              n: '01',
              t: 'Install Midnight Wallet',
              d: 'Get Lace or 1AM extension → create wallet → switch network to Preprod (top-right).',
              cta: 'Get Lace →',
              href: 'https://www.lace.io/',
            },
            {
              n: '02',
              t: 'Fund Preprod tNIGHT',
              d: 'Copy your address from wallet → paste at faucet → receive tNIGHT + DUST in ~20s.',
              cta: 'Open Faucet ↗',
              href: 'https://faucet.preprod.midnight.network',
            },
            {
              n: '03',
              t: 'Connect & Prove',
              d: 'Return here → Connect wallet → allow connection. Zero secrets or amounts ever leave your wallet.',
              cta: null,
              href: null,
            },
          ].map((s) => (
            <div
              key={s.n}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 16,
                padding: '16px 18px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.025)',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ display: 'flex', gap: 14, minWidth: 0 }}>
                <span className="mono" style={{ color: 'var(--cyan)', fontWeight: 800, fontSize: '0.95rem' }}>
                  {s.n}
                </span>
                <div>
                  <strong style={{ color: '#fff', fontSize: '0.96rem' }}>{s.t}</strong>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: 4, lineHeight: 1.5 }}>
                    {s.d}
                  </div>
                </div>
              </div>
              {s.href && (
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                  style={{ padding: '7px 14px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                >
                  {s.cta}
                </a>
              )}
            </div>
          ))}

          <div
            className="wire"
            style={{
              fontSize: '0.82rem',
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div
              style={{
                color: 'var(--cyan)',
                marginBottom: 8,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              Local Proof Server Fallback (Optional)
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <code className="mono" style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                docker compose up -d --wait proof-server
              </code>
              <button className="btn btn-ghost" onClick={copyCmd} style={{ padding: '5px 10px', fontSize: '0.76rem' }}>
                {copied ? 'Copied ✓' : 'Copy'}
              </button>
            </div>
            <div style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: 1.55 }}>
              On production/Vercel, your Midnight wallet creates proofs in-browser. No local Docker required.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
            <a
              href="https://faucet.preprod.midnight.network"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
              style={{ padding: '12px 22px' }}
            >
              Get Free tNIGHT →
            </a>
            <button className="btn btn-verify" onClick={onClose} style={{ padding: '12px 22px' }}>
              I’m funded — Return to App
            </button>
          </div>

          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              paddingTop: 12,
            }}
          >
            Want to test without a wallet? Switch on <strong>Demo Mode</strong> in the topbar to test all zero-knowledge workflows instantly with seeded cases.
          </div>
        </div>
      </div>
    </div>
  );
}
