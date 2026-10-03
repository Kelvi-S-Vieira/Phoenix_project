import type { DiaryEntry } from "@/lib/database.types";

interface Targets {
  kcal: number | null;
  protein: number | null;
  carb: number | null;
  fat: number | null;
}

// Ported from the prototype's renderSummary() (projeto_fenix_app_final.html,
// ~lines 17755-17787): 4 cards (Kcal/Proteína/Carboidrato/Gordura), each
// totaling the day's entries against the profile's target with a progress
// bar capped at 100%, plus the kcal value turning --warn when it's more
// than 5% over target.
export default function SummaryCards({
  entries,
  targets,
}: {
  entries: DiaryEntry[];
  targets: Targets;
}) {
  const kcalTotal = entries.reduce((s, e) => s + e.kcal, 0);
  const proteinTotal = round1(entries.reduce((s, e) => s + e.protein, 0));
  const carbTotal = round1(entries.reduce((s, e) => s + e.carb, 0));
  const fatTotal = round1(entries.reduce((s, e) => s + e.fat, 0));

  const kcalOver = targets.kcal != null && kcalTotal > targets.kcal * 1.05;

  return (
    <div className="summary-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
      <SummaryCard
        label="Kcal"
        target={targets.kcal}
        targetSuffix=""
        total={kcalTotal}
        totalSuffix=""
        fillClass="kcal"
        valueClassName={kcalOver ? "sc-value sum-over" : "sc-value"}
      />
      <SummaryCard
        label="Proteína"
        target={targets.protein}
        targetSuffix="g"
        total={proteinTotal}
        totalSuffix="g"
        fillClass="protein"
      />
      <SummaryCard
        label="Carboidrato"
        target={targets.carb}
        targetSuffix="g"
        total={carbTotal}
        totalSuffix="g"
        fillClass="carb"
      />
      <SummaryCard
        label="Gordura"
        target={targets.fat}
        targetSuffix="g"
        total={fatTotal}
        totalSuffix="g"
        fillClass="fat"
      />
    </div>
  );
}

function SummaryCard({
  label,
  target,
  targetSuffix,
  total,
  totalSuffix,
  fillClass,
  valueClassName = "sc-value",
}: {
  label: string;
  target: number | null;
  targetSuffix: string;
  total: number;
  totalSuffix: string;
  fillClass: string;
  valueClassName?: string;
}) {
  const pct = target ? Math.min((total / target) * 100, 100) : 0;
  return (
    <div className="sum-card">
      <div className="sc-top">
        <span className="sc-label">{label}</span>
        <span className="sc-target">
          {target ? `meta: ${target}${targetSuffix}` : "meta: definir no Perfil"}
        </span>
      </div>
      <div className={valueClassName}>
        {total}
        {totalSuffix && <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{totalSuffix}</span>}
      </div>
      <div className="sum-track">
        <div className={`sum-fill ${fillClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
