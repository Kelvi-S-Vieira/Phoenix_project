"use client";

import { toDisplayWeight, type WeightUnit } from "@/lib/weight-unit";
import type { PlanWeekRow } from "@/lib/plan-generation";

// A small multi-series inline SVG chart — same no-library approach as
// LineChart, extended to plot the plan's red/green target lines alongside
// the actually-logged weight. Kept as its own component (rather than
// stretching LineChart's single-series API) since the 3-series + dashed
// target-line styling is specific to this one use.
export default function PlanChart({
  rows,
  unit = "kg",
  height = 220,
}: {
  rows: PlanWeekRow[];
  unit?: WeightUnit;
  height?: number;
}) {
  if (rows.length === 0) {
    return <div className="fx-chart-empty">Sem dados suficientes para o gráfico.</div>;
  }

  const width = 640;
  const padding = 32;

  const red = rows.map((r) => toDisplayWeight(r.targetRed, unit) ?? r.targetRed);
  const green = rows.map((r) => toDisplayWeight(r.targetGreen, unit) ?? r.targetGreen);
  const actualPoints = rows
    .map((r, i) => ({ i, v: r.actualWeight != null ? toDisplayWeight(r.actualWeight, unit) ?? r.actualWeight : null }))
    .filter((p): p is { i: number; v: number } => p.v != null);

  const allValues = [...red, ...green, ...actualPoints.map((p) => p.v)];
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const span = max - min || 1;

  const stepX = rows.length > 1 ? (width - padding * 2) / (rows.length - 1) : 0;
  const xFor = (i: number) => padding + i * stepX;
  const yFor = (v: number) => height - padding - ((v - min) / span) * (height - padding * 2);

  const linePath = (values: number[]) => values.map((v, i) => `${xFor(i)},${yFor(v)}`).join(" ");

  return (
    <div className="fx-chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
        <polyline
          points={linePath(red)}
          fill="none"
          stroke="var(--plan-red)"
          strokeWidth={2}
          strokeDasharray="6 4"
          strokeLinejoin="round"
        />
        <polyline
          points={linePath(green)}
          fill="none"
          stroke="var(--plan-green)"
          strokeWidth={2}
          strokeDasharray="6 4"
          strokeLinejoin="round"
        />
        {actualPoints.length > 0 && (
          <polyline
            points={actualPoints.map((p) => `${xFor(p.i)},${yFor(p.v)}`).join(" ")}
            fill="none"
            stroke="var(--ember)"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {actualPoints.map((p) => (
          <circle key={p.i} cx={xFor(p.i)} cy={yFor(p.v)} r={3.5} fill="var(--ember)">
            <title>{`${rows[p.i].date}: ${p.v} ${unit}`}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}
