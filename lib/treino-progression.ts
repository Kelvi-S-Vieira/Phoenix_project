/**
 * Training-log / 1RM / PR / progression-suggestion / deload engine for the
 * Avançado tier's Musculação (and Calistenia) exercise rows
 * (app/treino/avancado/AvancadoBuilder.tsx), ported verbatim from the
 * prototype (projeto_fenix_app_final.html, lines 8977-9141):
 *   - estimate1RM — Epley formula
 *   - parseRepRange, nextLowerRepZone
 *   - consecutiveStagnantSessions, suggestProgression (full reps → carga →
 *     volume → rezone → swap escalation ladder, exact thresholds)
 *   - bestPR, isNewPR, needsDeload
 *
 * Backed by the day-independent `exerciseKey()` (lib/treino-shared-types.ts)
 * and a new `exercise_set_logs` table (supabase/migration_exercise_set_logs.sql)
 * — many dated rows per key, NOT `workout_log_entries` (day-prefixed,
 * one-row-per-day, wrong shape for a time series). See the header comments
 * on `exerciseKey()` and in treino-avancado-data.ts for why.
 *
 * All functions here are pure (take a log array in, return a value) instead
 * of mutating a global `state.log[id]` like the prototype — the log for a
 * given exerciseKey lives in AvancadoBuilder's React state, fetched/written
 * through Supabase by the component, not by this module.
 */

export interface SetLogEntry {
  date: string; // YYYY-MM-DD (America/Sao_Paulo, see lib/date-br.ts)
  weight: number;
  reps: number;
  rpe: number | null;
  pain: boolean;
}

/** Epley formula — approximate, useful only to see a trend over time. */
export function estimate1RM(weight: number, reps: number): number {
  if (!weight || !reps) return 0;
  return Math.round(weight * (1 + reps / 30));
}

/**
 * Extracts [min,max] from a rep-range string like "8-12" or a single number
 * like "12" (also handles calisthenics-style "12-20 (ou até a falha)" — it
 * just grabs the first two numbers). Returns null if nothing is found.
 */
export function parseRepRange(repsStr: string | null | undefined): [number, number] | null {
  if (!repsStr) return null;
  const m = String(repsStr).match(/(\d+)\s*-\s*(\d+)/);
  if (m) return [Number(m[1]), Number(m[2])];
  const single = String(repsStr).match(/(\d+)/);
  if (single) return [Number(single[1]), Number(single[1])];
  return null;
}

/**
 * How many sessions in a row (counting back from the most recent) failed to
 * beat the estimated 1RM of the session before it.
 */
export function consecutiveStagnantSessions(log: SetLogEntry[]): number {
  if (log.length < 2) return 0;
  let streak = 0;
  for (let i = log.length - 1; i > 0; i--) {
    const cur = estimate1RM(log[i].weight, log[i].reps);
    const prevRM = estimate1RM(log[i - 1].weight, log[i - 1].reps);
    if (cur <= prevRM) streak++;
    else break;
  }
  return streak;
}

/** Rep zone "below" the current one (more load, fewer reps) — e.g. 8-12 -> 6-8, 10-12 -> 8-9. */
export function nextLowerRepZone(range: [number, number]): string {
  const lo = Math.max(3, range[0] - 2);
  const hi = Math.max(lo + 1, range[1] - 4);
  return `${lo}-${hi}`;
}

export type ProgressionStage = "sem-dados" | "dor" | "swap" | "rezone" | "volume" | "reps" | "carga";

export interface ProgressionSuggestion {
  message: string;
  stage: ProgressionStage;
  suggestedZone?: string;
}

/**
 * Full progression/swap ladder, in order: reps -> carga (load) -> (stuck)
 * volume -> (stuck again) change rep zone (heavier, fewer reps) -> (stuck
 * again) swap the exercise. `stage` drives which action button the UI shows.
 */
export function suggestProgression(log: SetLogEntry[], targetReps: string | null | undefined): ProgressionSuggestion {
  if (log.length === 0) {
    return {
      message: "Ainda sem registros — anote peso e reps da sua próxima sessão pra começar a receber sugestões.",
      stage: "sem-dados",
    };
  }
  const last = log[log.length - 1];
  if (last.pain) {
    return {
      message:
        "⚠️ Você registrou desconforto/dor nessa última sessão — troque esse exercício por uma variação que não incomode essa articulação, independente da progressão.",
      stage: "dor",
    };
  }
  const range = parseRepRange(targetReps);
  const streak = consecutiveStagnantSessions(log);

  if (streak >= 6) {
    return {
      message: `⛔ Sem evoluir há ${streak} sessões mesmo depois de ajustar volume e zona de reps — hora de trocar esse exercício por outro da mesma região.`,
      stage: "swap",
    };
  }
  if (streak >= 4) {
    const zone = range ? nextLowerRepZone(range) : undefined;
    return {
      message: `🔁 Ainda travado há ${streak} sessões — considere mudar a zona de repetição${zone ? ` para ${zone} (mais carga, menos reps)` : ""}.`,
      stage: "rezone",
      suggestedZone: zone,
    };
  }

  let msg: string;
  if (!range) {
    msg = `Último registro: ${last.weight}kg × ${last.reps} reps.`;
  } else if (last.reps < range[1]) {
    msg = `Na próxima sessão, tente ${last.reps + 1} reps com os mesmos ${last.weight}kg (ainda dá pra evoluir repetição antes de subir carga).`;
  } else {
    msg = `Você bateu o topo da faixa (${range[1]} reps) com ${last.weight}kg — na próxima sessão suba a carga e volte para ${range[0]} reps.`;
  }
  if (streak >= 2) {
    msg += ` Sem evoluir há ${streak} sessões — considere adicionar mais 1 série de trabalho (volume) ou descansar menos entre as séries (densidade).`;
    return { message: msg, stage: "volume" };
  }
  return { message: msg, stage: last.reps < (range ? range[1] : Infinity) ? "reps" : "carga" };
}

/**
 * PR = the log entry with the highest estimated 1RM (not necessarily the
 * heaviest raw kg — 5x90kg can out-estimate 1x95kg, for example).
 */
export function bestPR(log: SetLogEntry[]): { entry: SetLogEntry; oneRM: number } | null {
  if (log.length === 0) return null;
  let best = log[0];
  let bestRM = estimate1RM(best.weight, best.reps);
  log.forEach((e) => {
    const rm = estimate1RM(e.weight, e.reps);
    if (rm > bestRM) {
      bestRM = rm;
      best = e;
    }
  });
  return { entry: best, oneRM: bestRM };
}

/** Did the most recently logged session beat the previous record? */
export function isNewPR(log: SetLogEntry[]): boolean {
  if (log.length === 0) return false;
  if (log.length === 1) return false; // first session is the baseline, not a "beaten record" yet
  const last = log[log.length - 1];
  const lastRM = estimate1RM(last.weight, last.reps);
  const prevBestRM = Math.max(...log.slice(0, -1).map((e) => estimate1RM(e.weight, e.reps)));
  return lastRM > prevBestRM;
}

/**
 * Flags deload when the estimated 1RM doesn't rise (ties or drops) across
 * the last 3 sessions in a row — a sign of accumulated fatigue, not just a
 * bad day.
 */
export function needsDeload(log: SetLogEntry[]): boolean {
  if (log.length < 3) return false;
  const lastThree = log.slice(-3).map((e) => estimate1RM(e.weight, e.reps));
  return lastThree[1] <= lastThree[0] && lastThree[2] <= lastThree[1];
}
