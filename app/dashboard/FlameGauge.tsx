// Presentational SVG "flame fill" gauge, ported from the prototype's
// #page-dashboard hero markup (projeto_fenix_app_final.html, ~lines
// 3925-3942) and its updateHero() clip-rect math (~lines 5698-5719):
// the flame fills from the bottom as `pct` (0-1) rises, via a clip-rect
// whose height/y are driven here from a prop instead of direct DOM writes.
export default function FlameGauge({
  pct,
  label,
}: {
  pct: number; // 0..1
  label: string;
}) {
  const clamped = Math.min(Math.max(pct, 0), 1);
  const rectHeight = 150 * clamped;
  const rectY = 172 - rectHeight;

  return (
    <div className="flame-wrap">
      <svg viewBox="0 0 200 190">
        <defs>
          <linearGradient id="da_flameGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#C1272D" />
            <stop offset="55%" stopColor="#FF6B35" />
            <stop offset="100%" stopColor="#F2A65A" />
          </linearGradient>
          <clipPath id="da_flameClip">
            <rect x={0} y={rectY} width={200} height={rectHeight} />
          </clipPath>
        </defs>
        <path
          d="M100,18 C128,55 152,88 142,128 C136,156 116,172 100,172 C84,172 64,156 58,128 C48,88 72,55 100,18 Z"
          fill="none"
          stroke="rgba(245,237,228,0.15)"
          strokeWidth={2}
        />
        <path
          d="M100,18 C128,55 152,88 142,128 C136,156 116,172 100,172 C84,172 64,156 58,128 C48,88 72,55 100,18 Z"
          fill="url(#da_flameGrad)"
          clipPath="url(#da_flameClip)"
        />
      </svg>
      <div className="flame-pct">{label}</div>
    </div>
  );
}
