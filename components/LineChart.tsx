"use client";

export interface LineChartPoint {
  x: string;
  y: number;
}

// Plain inline SVG line chart — no charting library needed for a single
// series over time. Generic over any {x, y} series so both the weight chart
// and the Medidas evolution charts can share one implementation.
export default function LineChart({
  data,
  target,
  height = 180,
  color = "var(--ember)",
  emptyMessage = "Ainda sem dados.",
}: {
  data: LineChartPoint[];
  target?: number | null;
  height?: number;
  color?: string;
  emptyMessage?: string;
}) {
  if (data.length === 0) {
    return <div className="fx-chart-empty">{emptyMessage}</div>;
  }

  const width = 560;
  const padding = 28;

  const values = data.map((d) => d.y);
  const allValues = target != null ? [...values, target] : values;
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const span = max - min || 1;

  const stepX = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;

  function xFor(i: number) {
    return padding + i * stepX;
  }
  function yFor(v: number) {
    return height - padding - ((v - min) / span) * (height - padding * 2);
  }

  const linePoints = data.map((d, i) => `${xFor(i)},${yFor(d.y)}`).join(" ");

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
          stroke={color}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {data.map((d, i) => (
          <circle key={d.x} cx={xFor(i)} cy={yFor(d.y)} r={3.5} fill={color} />
        ))}
      </svg>
    </div>
  );
}
