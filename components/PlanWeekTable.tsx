import { formatWeight, type WeightUnit } from "@/lib/weight-unit";
import type { PlanWeekRow } from "@/lib/plan-generation";

// Pure presentational — no manual "peso real" entry (the prototype's
// per-week input is redundant with weight_logs in this architecture: the
// Dashboard's own weight check-ins already feed `actualWeight` via
// lib/plan-generation.ts's closestWeight() match, so there's no separate
// manual-entry UI to build here — a simplification over the prototype).
export default function PlanWeekTable({ rows, unit = "kg" }: { rows: PlanWeekRow[]; unit?: WeightUnit }) {
  return (
    <div>
      <div className="fx-plan-legend-row">
        <span>
          <span className="dot" style={{ background: "var(--plan-red)" }}></span>Meta só gordura
        </span>
        <span>
          <span className="dot" style={{ background: "var(--plan-green)" }}></span>Meta real (c/ massa)
        </span>
        <span>
          <span className="dot" style={{ background: "var(--ember)" }}></span>Peso registrado
        </span>
      </div>

      <div className="fx-plan-week-row header-row">
        <span>Semana</span>
        <span>Meta 🔴</span>
        <span>Meta 🟢</span>
        <span>Ação da semana</span>
        <span>Peso real</span>
      </div>
      {rows.map((row) => (
        <div className="fx-plan-week-row" key={row.index}>
          <div>
            <div className="fx-plan-week-label">{row.label}</div>
            <div className="fx-plan-week-date">
              {new Date(row.date + "T00:00:00").toLocaleDateString("pt-BR")}
            </div>
          </div>
          <div className="fx-plan-target-red">{formatWeight(row.targetRed, unit)}</div>
          <div className="fx-plan-target-green">{formatWeight(row.targetGreen, unit)}</div>
          <div className="fx-plan-action-text">{row.actionTip}</div>
          <div className="fx-plan-actual">
            {row.actualWeight != null ? formatWeight(row.actualWeight, unit) : "—"}
          </div>
        </div>
      ))}
    </div>
  );
}
