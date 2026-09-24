/**
 * BrandMark — reusable MidnightTrace mark.
 * Used in rail, header, favicon loader, and inline.
 * Keeps branding centralized (single source of visual truth).
 */
export function BrandMark({ size = 40, showVerified = true }: { size?: number; showVerified?: boolean }) {
  const r = Math.round(10 * (size / 40));
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: 'linear-gradient(135deg, #10162a 0%, #060913 100%)',
        border: '1.5px solid rgba(245, 158, 11, 0.5)',
        display: 'grid',
        placeItems: 'center',
        position: 'relative',
        flexShrink: 0,
        boxShadow: '0 0 20px rgba(245, 158, 11, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <svg
        width={Math.round(size * 0.62)}
        height={Math.round(size * 0.62)}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2L4 5.5V11.5C4 16.5 7.5 21 12 22C16.5 21 20 16.5 20 11.5V5.5L12 2Z"
          stroke="url(#shieldGrad)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M12 6C9.2 6 7 8.2 7 11C7 13.8 9.2 16 12 16C13.6 16 15 15.2 15.8 14C13.2 14 11 11.8 11 9.2C11 7.8 11.6 6.6 12.6 6.2C12.4 6.1 12.2 6 12 6Z"
          fill="url(#moonGrad)"
        />
        <circle cx="16" cy="8" r="1.5" fill="#38BDF8" />
        <defs>
          <linearGradient id="shieldGrad" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F59E0B" />
            <stop offset="1" stopColor="#38BDF8" />
          </linearGradient>
          <linearGradient id="moonGrad" x1="7" y1="6" x2="16" y2="16" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE68A" />
            <stop offset="1" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
      </svg>
      {showVerified && (
        <span
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            width: Math.round(size * 0.32),
            height: Math.round(size * 0.32),
            borderRadius: 999,
            background: '#10B981',
            border: '2px solid #050811',
            display: 'grid',
            placeItems: 'center',
            fontSize: Math.round(size * 0.17),
            color: 'white',
            fontWeight: 800,
            lineHeight: 1,
            boxShadow: '0 0 10px rgba(16, 185, 129, 0.7)',
          }}
        >
          ✓
        </span>
      )}
    </div>
  );
}

export function BrandWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div style={{ lineHeight: 1, minWidth: 0 }}>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: compact ? '1.05rem' : '1.15rem',
          letterSpacing: '-0.03em',
          color: '#ffffff',
          whiteSpace: 'nowrap',
        }}
      >
        Midnight<span style={{ fontWeight: 700, color: '#F59E0B' }}>Trace</span>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.62rem',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginTop: 2,
          whiteSpace: 'nowrap',
        }}
      >
        Midnight Network · Preprod
      </div>
    </div>
  );
}
