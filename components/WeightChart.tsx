"use client";

import LineChart from "@/components/LineChart";
import { toDisplayWeight, type WeightUnit } from "@/lib/weight-unit";

interface Point {
  logged_at: string;
  weight: number;
}

// Thin wrapper around the generic LineChart — kept as its own component so
// existing usage (`<WeightChart data={...} target={...} />`) doesn't change.
// `data`/`target` are always in kg (as stored); `unit` controls what's
// actually plotted/labeled, converting here so LineChart itself never needs
// to know about weight units.
export default function WeightChart({
  data,
  target,
  unit = "kg",
}: {
  data: Point[];
  target?: number | null;
  unit?: WeightUnit;
}) {
  return (
    <LineChart
      data={data.map((d) => ({ x: d.logged_at, y: toDisplayWeight(d.weight, unit) ?? d.weight }))}
      target={toDisplayWeight(target ?? null, unit) ?? undefined}
      valueUnit={unit}
      emptyMessage="Ainda sem registros de peso. Adicione o primeiro acima."
    />
  );
}
