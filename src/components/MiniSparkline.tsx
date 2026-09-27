/**
 * MiniSparkline — Tiny animated SVG sparkline for KPI cards.
 * Renders a random-ish trend line that animates in via stroke-dashoffset.
 */
export function MiniSparkline({
  color = '#38BDF8',
  width = 80,
  height = 28,
  points = 8,
  trend = 'up' as 'up' | 'down' | 'flat',
}: {
  color?: string;
  width?: number;
  height?: number;
  points?: number;
  trend?: 'up' | 'down' | 'flat';
}) {
  // Generate deterministic-looking points based on trend
  const padding = 3;
  const usableW = width - padding * 2;
  const usableH = height - padding * 2;

  const coords: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const x = padding + (usableW / (points - 1)) * i;
    let baseY: number;
    if (trend === 'up') {
      baseY = usableH - (usableH * i) / (points - 1);
    } else if (trend === 'down') {
      baseY = (usableH * i) / (points - 1);
    } else {
      baseY = usableH / 2;
    }
    // Add slight variation (seeded by index to stay stable)
    const jitter = Math.sin(i * 2.7 + 1.3) * (usableH * 0.18);
    coords.push([x, padding + Math.max(0, Math.min(usableH, baseY + jitter))]);
  }

  const pathD = coords
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ');

  // Approximate path length for dash animation
  const pathLength = coords.reduce((sum, [x, y], i) => {
    if (i === 0) return 0;
    const [px, py] = coords[i - 1];
    return sum + Math.sqrt((x - px) ** 2 + (y - py) ** 2);
  }, 0);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="sparkline-svg"
      aria-hidden="true"
    >
      {/* Gradient fill under the line */}
      <defs>
        <linearGradient id={`sparkFill-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path
        d={`${pathD} L${coords[coords.length - 1][0].toFixed(1)},${height} L${coords[0][0].toFixed(1)},${height} Z`}
        fill={`url(#sparkFill-${color.replace('#', '')})`}
        className="sparkline-area"
      />
      {/* The line */}
      <path
        d={pathD}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="sparkline-line"
        style={{
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
          animation: `sparkline-draw 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards`,
        }}
      />
      {/* End dot */}
      <circle
        cx={coords[coords.length - 1][0]}
        cy={coords[coords.length - 1][1]}
        r="2.5"
        fill={color}
        className="sparkline-dot"
        style={{
          opacity: 0,
          animation: `sparkline-dot-in 0.3s ease 1.4s forwards`,
        }}
      />
    </svg>
  );
}
