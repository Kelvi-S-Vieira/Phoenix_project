/**
 * Pace-suggestion helpers for onboarding step 4 ("Sua meta"), ported
 * verbatim (formulas + pt-BR copy) from `renderPaceSuggestions`,
 * `updateEndDateHint` and `updatePaceFeedback` in the prototype
 * (projeto_fenix_app_final.html, ~lines 17079-17157).
 *
 * All weights taken/returned here are in KG — callers convert to the
 * display unit (kg/lb) only for what's shown, same as the rest of this
 * wizard (see lib/weight-unit.ts).
 *
 * "Today" is whatever moment the form is being filled/saved in the
 * user's browser — the prototype has no separate stored "plan start
 * date" concept, and neither does this onboarding flow, so we match it
 * exactly rather than inventing one.
 */

export interface PacePreset {
  key: "conservador" | "recomendado" | "agressivo";
  label: string;
  pct: number;
}

export const PACE_PRESETS: PacePreset[] = [
  { key: "conservador", label: "Conservador", pct: 0.3 },
  { key: "recomendado", label: "Recomendado", pct: 0.6 },
  { key: "agressivo", label: "Agressivo", pct: 1.0 },
];

export interface PaceSuggestionCard extends PacePreset {
  weeks: number;
  dateStr: string;
  active: boolean;
}

/** `dd mmm aaaa` in pt-BR, e.g. "15 out 2026" — matches the prototype's card date format. */
function formatCardDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * The 3 pace-preset cards (Conservador/Recomendado/Agressivo), or `null`
 * when there isn't enough info to compute them (no current/target weight,
 * or they're equal) — same guard as the prototype.
 */
export function getPaceSuggestions(
  currentWeightKg: number | null | undefined,
  targetWeightKg: number | null | undefined,
  currentWeeks: number | null | undefined
): PaceSuggestionCard[] | null {
  const w = currentWeightKg;
  const t = targetWeightKg;
  if (!w || !t || w === t) return null;

  const diffKg = Math.abs(w - t);

  return PACE_PRESETS.map((preset) => {
    const weeklyLossKg = (preset.pct / 100) * w;
    const weeks = Math.max(1, Math.round(diffKg / weeklyLossKg));
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + weeks * 7);
    return {
      ...preset,
      weeks,
      dateStr: formatCardDate(targetDate),
      active: currentWeeks === weeks,
    };
  });
}

export interface EndDateHint {
  startStr: string;
  endStr: string;
  weeks: number;
}

/** The "Começando hoje (dd/mm), X semana(s) terminaria em dd/mm/aaaa" hint, or `null` when weeks isn't a positive number. */
export function getEndDateHint(weeks: number | null | undefined): EndDateHint | null {
  if (!weeks || weeks <= 0) return null;

  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + weeks * 7);

  return {
    startStr: start.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    endStr: end.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }),
    weeks,
  };
}

export type PaceFeedbackClass = "conservador" | "recomendado" | "agressivo" | "perigoso";

export interface PaceFeedback {
  cls: PaceFeedbackClass;
  pctPerWeek: number;
  title: string;
  message: string;
}

/**
 * Color-coded pace risk feedback (<0.4%/wk conservative ... >1.2%/wk too
 * fast), or `null` when weight/weeks info is incomplete — exact thresholds
 * and wording from the prototype's `updatePaceFeedback`.
 */
export function getPaceFeedback(
  currentWeightKg: number | null | undefined,
  targetWeightKg: number | null | undefined,
  weeks: number | null | undefined
): PaceFeedback | null {
  const w = currentWeightKg;
  const t = targetWeightKg;
  const wk = weeks;
  if (!w || !t || !wk || wk <= 0) return null;

  const diffKg = Math.abs(w - t);
  const pctPerWeek = (diffKg / wk / w) * 100;
  const pct = pctPerWeek.toFixed(2);

  if (pctPerWeek < 0.4) {
    return {
      cls: "conservador",
      pctPerWeek,
      title: "Ritmo conservador",
      message: `(~${pct}%/semana). Bem seguro, prioriza preservar massa magra ao máximo.`,
    };
  }
  if (pctPerWeek <= 0.8) {
    return {
      cls: "recomendado",
      pctPerWeek,
      title: "Ritmo recomendado",
      message: `(~${pct}%/semana). Bom equilíbrio entre velocidade e preservação de massa magra.`,
    };
  }
  if (pctPerWeek <= 1.2) {
    return {
      cls: "agressivo",
      pctPerWeek,
      title: "Ritmo agressivo",
      message: `(~${pct}%/semana). Funciona, mas exige atenção redobrada à proteína e ao treino de força pra não perder massa magra junto.`,
    };
  }
  return {
    cls: "perigoso",
    pctPerWeek,
    title: "Prazo muito curto",
    message: `(~${pct}%/semana). Isso passa da faixa geralmente considerada segura (até ~1%/semana). Alto risco de perder massa magra. Considere um prazo mais longo.`,
  };
}
