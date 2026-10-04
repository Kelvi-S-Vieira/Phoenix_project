/**
 * Shared week-by-week plan generation engine.
 *
 * Unifies the prototype's two disconnected systems (see MIGRATION_PLAN.md,
 * "Product decisions" section, and the `#page-montar-plano` /
 * `#page-plano17` modules in projeto_fenix_app_final.html, ~lines
 * 18753-18954 and 16768-16916): "Montar Plano" (weeks/diet/tier/split setup,
 * no schedule) and "Plano 17 semanas" (a hardcoded 18-row week-by-week
 * schedule with a conservative/optimistic target pair, gated to one named
 * user). This module takes a Montar Plano's own setup (weeks, start date,
 * diet choice) plus the aluno's own current/target weight and produces the
 * same kind of week-by-week schedule, generically, for anyone — both
 * `/montar-plano` and `/plano17` read from it, so there is exactly one
 * engine instead of two parallel plan systems.
 */

import type { CustomPlan } from "@/lib/database.types";

export const DIET_OPTIONS: { key: string; label: string; desc: string }[] = [
  {
    key: "cutting",
    label: "Cutting",
    desc: "Déficit calórico focado em perder gordura preservando o máximo de massa magra.",
  },
  {
    key: "manutencao",
    label: "Manutenção",
    desc: "Calorias na manutenção — foco em recomposição corporal ou estabilizar o peso.",
  },
  {
    key: "bulking_limpo",
    label: "Bulking limpo",
    desc: "Leve superávit calórico, priorizando ganho de massa com o mínimo de gordura extra.",
  },
  {
    key: "bulking",
    label: "Bulking",
    desc: "Superávit calórico maior, priorizando velocidade de ganho de massa muscular.",
  },
];

export function dietLabel(key: string | null | undefined): string {
  return DIET_OPTIONS.find((d) => d.key === key)?.label ?? key ?? "—";
}

export interface PlanWeekRow {
  /** 0-based week index (0 = plan start). */
  index: number;
  /** "Início" (index 0), "Semana N" (0 < index < weeks), "Final" (index === weeks). */
  label: string;
  /** YYYY-MM-DD for this week's checkpoint. */
  date: string;
  /** Conservative ("só gordura") target weight in kg, 1 decimal. */
  targetRed: number;
  /** Optimistic ("cenário real com ganho de massa") target weight in kg, 1 decimal. */
  targetGreen: number;
  /** Short, generic, non-personal tip for the week. */
  actionTip: string;
  /** The closest logged weight (kg) to this week's date, if any, within ACTUAL_MATCH_TOLERANCE_DAYS. */
  actualWeight: number | null;
}

// Generic, universal action tips — rotated week by week. These intentionally
// replace the prototype's hardcoded personal tips (owner's futsal games,
// specific meals, etc. — see MIGRATION_PLAN.md) with categories that apply
// to any user, ported by CATEGORY not by wording.
const ACTION_TIP_ROTATION: string[] = [
  "Hidratação: beba água suficiente ao longo do dia — ajuda a controlar a fome e reduz retenção de líquido que mascara o progresso na balança.",
  "Passos diários: mantenha uma meta de passos consistente, mesmo nos dias sem treino — é o gasto calórico mais fácil de sustentar.",
  "Sono: durma o suficiente e em horários regulares — é quando o corpo recupera e consolida os ganhos do treino.",
  "Proteína: priorize bater sua meta diária de proteína — é o que mais protege a massa magra, ganhando ou perdendo peso.",
  "Intensidade de treino: mantenha a carga/esforço no treino de força — é o principal estímulo para reter ou ganhar músculo.",
  "Checagem visual: tire uma foto ou olhe no espelho além da balança — composição corporal muda de formas que o peso sozinho não mostra.",
];
const DELOAD_TIP =
  "Deload: considere uma semana mais leve de treino (menos volume/intensidade) para recuperar antes da reta final.";

// A single muscle-gain offset constant, applied cumulatively, week by week,
// only to the optimistic ("green") line — see buildWeeklyPlan() below for
// the full rationale.
const MUSCLE_GAIN_KG_PER_WEEK = 0.15;

function fmtKg(v: number): number {
  return Math.round(v * 10) / 10;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function actionTipFor(index: number, weeks: number): string {
  // One deload tip near the end of a long-enough plan (last ~15% of weeks,
  // at least 2 weeks out from the final checkpoint) instead of the regular
  // rotation — mirrors the prototype's own idea of flagging fatigue near
  // the finish line, without inventing a personal reason for it.
  if (weeks >= 8 && index === Math.max(1, weeks - 2)) {
    return DELOAD_TIP;
  }
  return ACTION_TIP_ROTATION[index % ACTION_TIP_ROTATION.length];
}

/**
 * Generates one row per week (index 0..weeks, inclusive — "Início" through
 * "Final") from a Montar Plano's own setup plus the aluno's current/target
 * weight.
 *
 * Target formula (documented here since this is a product-judgment call,
 * not something to leave implicit):
 *  - `targetRed` ("só gordura", the conservative/guaranteed line) is a
 *    straight linear interpolation from `currentWeight` to `targetWeight`
 *    over `weeks` weeks: red(i) = current + (target - current) * (i/weeks).
 *    This is the pace you'd hit if 100% of the scale-weight change is fat.
 *  - `targetGreen` ("cenário real com ganho de massa", the optimistic line)
 *    only diverges from red when the plan is a `cutting` plan whose target
 *    is a real weight LOSS: in that case some of what you're building in
 *    the gym (muscle) is added back on top of the pure-fat-loss curve, so
 *    green(i) = red(i) + MUSCLE_GAIN_KG_PER_WEEK * i (a flat assumed
 *    muscle-gain rate of 0.15kg/week, cumulative — a deliberately modest,
 *    generic rate; real muscle gain varies a lot by training history).
 *    For every other diet choice (bulking/bulking_limpo, where the goal IS
 *    mass gain, or manutenção, where there's no fat-loss pace to begin
 *    with) the dual-line concept doesn't add information, so green = red.
 */
export function buildWeeklyPlan(params: {
  startDate: string; // YYYY-MM-DD
  weeks: number;
  dietChoice: string | null;
  currentWeight: number;
  targetWeight: number;
  weightLogs?: { logged_at: string; weight: number }[];
}): PlanWeekRow[] {
  const { startDate, weeks, dietChoice, currentWeight, targetWeight, weightLogs = [] } = params;
  const isCuttingWithLoss = dietChoice === "cutting" && targetWeight < currentWeight;

  const rows: PlanWeekRow[] = [];
  for (let i = 0; i <= weeks; i++) {
    const frac = weeks > 0 ? i / weeks : 1;
    const red = currentWeight + (targetWeight - currentWeight) * frac;
    const green = isCuttingWithLoss ? red + MUSCLE_GAIN_KG_PER_WEEK * i : red;
    const date = addDays(startDate, i * 7);
    const label = i === 0 ? "Início" : i === weeks ? "Final" : `Semana ${i}`;

    rows.push({
      index: i,
      label,
      date,
      targetRed: fmtKg(red),
      targetGreen: fmtKg(green),
      actionTip: actionTipFor(i, weeks),
      actualWeight: closestWeight(weightLogs, date),
    });
  }
  return rows;
}

// How many days away a weight_logs entry can be from a week's checkpoint
// date and still count as that week's "peso real".
const ACTUAL_MATCH_TOLERANCE_DAYS = 3;

function closestWeight(
  logs: { logged_at: string; weight: number }[],
  targetDate: string
): number | null {
  if (logs.length === 0) return null;
  const targetMs = new Date(targetDate + "T00:00:00Z").getTime();
  let best: { weight: number; diffDays: number } | null = null;
  for (const log of logs) {
    const diffDays = Math.abs(new Date(log.logged_at + "T00:00:00Z").getTime() - targetMs) / 86400000;
    if (diffDays <= ACTUAL_MATCH_TOLERANCE_DAYS && (!best || diffDays < best.diffDays)) {
      best = { weight: log.weight, diffDays };
    }
  }
  return best ? best.weight : null;
}

export interface PlanProgress {
  currentWeek: number; // 1-based, clamped to [1, weeks]
  pct: number; // 0-100
  startDate: string;
  endDate: string;
  /** True once the current date is at or past the plan's calculated end date (start_date + weeks weeks). */
  isComplete: boolean;
}

/** Current-week / elapsed-% math shared by the Montar Plano progress view and Calendário's grid sizing. */
export function computePlanProgress(plan: Pick<CustomPlan, "start_date" | "weeks">): PlanProgress {
  const start = new Date(plan.start_date + "T00:00:00Z");
  const totalDays = plan.weeks * 7;
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + totalDays);
  const now = new Date();
  const daysElapsed = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000));
  const currentWeek = Math.min(plan.weeks, Math.floor(daysElapsed / 7) + 1);
  const pct = Math.max(0, Math.min(100, Math.round((daysElapsed / totalDays) * 100)));
  return {
    currentWeek,
    pct,
    startDate: plan.start_date,
    endDate: end.toISOString().slice(0, 10),
    isComplete: now.getTime() >= end.getTime(),
  };
}
