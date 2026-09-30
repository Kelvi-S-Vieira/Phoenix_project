"use client";

interface Point {
  logged_at: string;
  weight: number;
}

// Plain inline SVG line chart — no charting library needed for a single
// series over time. Keeps the vertical slice dependency-free.
export default function WeightChart({
  data,
  target,
}: {
  data: Point[];
  target?: number | null;
}) {
  if (data.length === 0) {
    return (
      <div className="fx-chart-empty">
        Ainda sem registros de peso. Adicione o primeiro acima.
      </div>
    );
  }

  const width = 560;
  const height = 180;
  const padding = 28;

  const weights = data.map((d) => d.weight);
  const allValues = target ? [...weights, target] : weights;
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const span = max - min || 1;

  const stepX =
    data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;

  function xFor(i: number) {
    return padding + i * stepX;
  }
  function yFor(v: number) {
    return height - padding - ((v - min) / span) * (height - padding * 2);
  }

  const linePoints = data.map((d, i) => `${xFor(i)},${yFor(d.weight)}`).join(" ");

  return (
    <div className="fx-chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
        {target != null && (
          <line
            x1={padding}
            x2={width - padding}
            y1={yFor(target)}
            y2={yFor(target)}
            stroke="var(--gold)"
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />
        )}
        <polyline
          points={linePoints}
          fill="none"
          stroke="var(--ember)"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {data.map((d, i) => (
          <circle key={d.logged_at} cx={xFor(i)} cy={yFor(d.weight)} r={3.5} fill="var(--ember)" />
        ))}
      </svg>
    </div>
  );
}
