"use client";

import LineChart from "@/components/LineChart";

interface Point {
  logged_at: string;
  weight: number;
}

// Thin wrapper around the generic LineChart — kept as its own component so
// existing usage (`<WeightChart data={...} target={...} />`) doesn't change.
export default function WeightChart({
  data,
  target,
}: {
  data: Point[];
  target?: number | null;
}) {
  return (
    <LineChart
      data={data.map((d) => ({ x: d.logged_at, y: d.weight }))}
      target={target}
      emptyMessage="Ainda sem registros de peso. Adicione o primeiro acima."
    />
  );
}
