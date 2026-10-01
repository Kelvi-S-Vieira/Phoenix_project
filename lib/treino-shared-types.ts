/**
 * Shared interfaces/constants used by all three treino tiers (Básico,
 * Intermediário, Avançado). Each tier's own data module
 * (treino-basico-data.ts, treino-intermediario-data.ts,
 * treino-avancado-data.ts) keeps its own stricter `MuscleGroupKey`/
 * `SplitKey` literal unions for internal type safety and re-exports the
 * types below for backward compatibility, but the generic (string-keyed)
 * versions here are what the shared UI (`app/treino/page.tsx`,
 * `SplitPicker.tsx`, `TreinoBoard.tsx`) uses so it can work with whichever
 * tier is active without hardcoding one tier's key set.
 */

export interface Exercise {
  name: string;
  exec: string;
  erro: string;
  gif?: string[];
}

export interface MuscleGroupPortion {
  label: string;
  exercises: Exercise[];
}

export interface MuscleGroup {
  label: string;
  // Flat exercise list — used by tiers/groups with no anatomical sub-split
  // (Básico, Intermediário, and any Avançado group with only one portion).
  exercises?: Exercise[];
  // Anatomical sub-split (e.g. peito -> superior/médio/inferior) — when
  // present, the UI renders each portion as its own labeled sub-section
  // instead of one flat exercise list. Mutually exclusive with `exercises`
  // in practice, but both are optional so existing flat groups don't need
  // restructuring.
  portions?: Record<string, MuscleGroupPortion>;
}

export type DayKey = "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";

export interface DayInfo {
  key: DayKey;
  label: string;
}

// Monday-first week, identical across all three tiers in the prototype
// (each tier's module redeclared it verbatim) — kept as a single shared
// copy here so the three can't drift apart.
export const DAYS: DayInfo[] = [
  { key: "seg", label: "Segunda" },
  { key: "ter", label: "Terça" },
  { key: "qua", label: "Quarta" },
  { key: "qui", label: "Quinta" },
  { key: "sex", label: "Sexta" },
  { key: "sab", label: "Sábado" },
  { key: "dom", label: "Domingo" },
];

export type WorkoutTypeKey = "musculacao" | "calistenia";

export interface WorkoutType {
  key: WorkoutTypeKey;
  label: string;
  groups: Record<string, MuscleGroup>;
  // When set, TreinoBoard renders exactly these group keys for this workout
  // type on any training day, instead of deriving the list from the day's
  // scheduled muscle groups (`split.week[selectedDay]`). Used by Avançado's
  // calistenia tab, whose exercises are organized by movement pattern
  // (empurrar/puxar/pernas/core) rather than by whichever muscle groups the
  // day happens to schedule for musculação — see treino-avancado-data.ts.
  alwaysGroups?: string[];
}

export interface Split {
  label: string;
  desc: string;
  week: Record<DayKey, string[] | null>;
}

/** A tier's full reference-data bundle, as looked up by `profile.current_tier`. */
export interface TierWorkoutData {
  MUSCLE_GROUPS: Record<string, MuscleGroup>;
  WORKOUT_TYPES: Record<WorkoutTypeKey, WorkoutType>;
  SPLITS: Record<string, Split>;
}

/**
 * Stable per-exercise key used as `workout_log_entries.exercise_id`.
 *
 * `portionKey` is only passed for a group rendered via its `portions` map
 * (currently just Avançado); omitting it produces exactly today's id format,
 * so Básico/Intermediário (and any flat Avançado group) keep generating the
 * same ids as before this field existed — existing logged data stays valid.
 *
 * IMPORTANT — this id always starts with the day (`dayKey::...`), so
 * Monday's "Supino reto" and Thursday's "Supino reto" are different ids
 * entirely. `workout_log_entries` is keyed `(profile_id, logged_at,
 * exercise_id)` — one row per day — which is exactly right for the current
 * daily checklist feature, but it is NOT where a future 1RM/PR/progression
 * history (especially for Avançado) should live: a day-prefixed id can
 * never accumulate a time series across days for "the same exercise", only
 * across the same weekday. A future training-log/progression feature needs
 * its own table keyed WITHOUT the day, e.g.
 * `exercise_set_logs(profile_id, exercise_key, logged_at, weight, reps,
 * rpe, pain)`, allowing many dated rows per `exercise_key`. Do not build
 * that history on top of `workout_log_entries`/`exerciseId()` as they
 * stand — see also the header comment in treino-avancado-data.ts.
 */
export function exerciseId(
  dayKey: DayKey,
  typeKey: WorkoutTypeKey,
  groupKey: string,
  name: string,
  portionKey?: string
): string {
  return portionKey
    ? `${dayKey}::${typeKey}::${groupKey}::${portionKey}::${name}`
    : `${dayKey}::${typeKey}::${groupKey}::${name}`;
}

/**
 * Day-INDEPENDENT companion to `exerciseId()` — same segments, minus the
 * leading `dayKey`. Not used by anything yet (today's daily checklist only
 * ever needs the day-scoped id above); it exists so a future progression/
 * 1RM-history feature has a ready-made, stable key for "this exercise,
 * regardless of which weekday it's trained on" without having to invent one
 * under time pressure on top of the day-prefixed scheme. See the big
 * comment on `exerciseId()` above.
 */
export function exerciseKey(
  typeKey: WorkoutTypeKey,
  groupKey: string,
  name: string,
  portionKey?: string
): string {
  return portionKey
    ? `${typeKey}::${groupKey}::${portionKey}::${name}`
    : `${typeKey}::${groupKey}::${name}`;
}
