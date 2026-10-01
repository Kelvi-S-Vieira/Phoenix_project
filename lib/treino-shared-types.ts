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

export interface MuscleGroup {
  label: string;
  exercises: Exercise[];
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

/** Stable per-exercise key used as `workout_log_entries.exercise_id`. */
export function exerciseId(
  dayKey: DayKey,
  typeKey: WorkoutTypeKey,
  groupKey: string,
  name: string
): string {
  return `${dayKey}::${typeKey}::${groupKey}::${name}`;
}
