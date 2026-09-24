/**
 * BrandMark — reusable MidnightTrace mark.
 * Used in rail, header, favicon loader, and inline.
 * Keeps branding centralized (single source of visual truth).
 */
export function BrandMark({ size = 40, showVerified = true }: { size?: number; showVerified?: boolean }) {
  const r = 9 * (size / 40);
  const font = Math.round(22 * (size / 40));
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: 'linear-gradient(135deg, #0d1424 0%, #070a12 100%)',
        border: '1.4px solid rgba(245, 158, 11, 0.45)',
        display: 'grid',
        placeItems: 'center',
        position: 'relative',
        flexShrink: 0,
        boxShadow: '0 0 16px rgba(245, 158, 11, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <span
        style={{
          fontFamily: 'Fraunces, Georgia, serif',
          fontWeight: 700,
          fontSize: font,
          color: '#F8D78D',
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}
      >
        M
      </span>
      {showVerified && (
        <span
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            width: Math.round(size * 0.28),
            height: Math.round(size * 0.28),
            borderRadius: 999,
            background: '#3FA772',
            border: '1.6px solid #0B1020',
            display: 'grid',
            placeItems: 'center',
            fontSize: Math.round(size * 0.16),
            color: 'white',
            lineHeight: 1,
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
          fontFamily: 'Fraunces, Georgia, serif',
          fontWeight: 700,
          fontSize: compact ? '1.02rem' : '1.08rem',
          letterSpacing: '-0.035em',
          color: 'var(--paper)',
          whiteSpace: 'nowrap',
        }}
      >
        Midnight<span style={{ fontWeight: 600, color: '#F4C770' }}>Trace</span>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.58rem',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--muted-ink)',
          marginTop: 2,
          whiteSpace: 'nowrap',
        }}
      >
        Midnight Network · Preprod
      </div>
    </div>
  );
}
