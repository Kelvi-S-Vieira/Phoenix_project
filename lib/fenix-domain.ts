/**
 * Domain constants ported verbatim (keys + Portuguese labels) from the
 * original prototype (projeto_fenix_app_final.html) so the schema, UI copy
 * and future sprints all agree on the same vocabulary.
 */
import type { ActivityLevel, Goal, Tier } from "@/lib/database.types";

export const TIER_LABELS: Record<Tier, string> = {
  "treino-basico": "🌱 Básico",
  "treino-intermediario": "⚔️ Intermediário",
  "treino-avancado": "🔥 Avançado",
};

export interface SplitOption {
  key: string;
  label: string;
}

// Ported from `SPLIT_OPTIONS` in the prototype's auth IIFE.
export const SPLIT_OPTIONS: Record<Tier, SplitOption[]> = {
  "treino-basico": [
    { key: "full_2x", label: "Full Body 2x/semana" },
    { key: "full_3x", label: "Full Body 3x/semana" },
    { key: "div_5x", label: "5x/semana (treinos menores)" },
  ],
  "treino-intermediario": [
    { key: "upper_lower", label: "Upper/Lower (4x/semana)" },
    { key: "abc", label: "ABC (3x/semana)" },
    { key: "abcd", label: "ABCD (4x/semana)" },
    { key: "abcde", label: "ABCDE (5x/semana)" },
  ],
  "treino-avancado": [
    { key: "full_body", label: "Full Body (3x/semana)" },
    { key: "upper_lower", label: "Upper / Lower (4 dias)" },
    { key: "abc", label: "ABC (3 dias, com descanso)" },
    { key: "abcde", label: "ABCDE (5 dias seguidos)" },
    { key: "ppl", label: "Push / Pull / Legs (6 dias)" },
  ],
};

export const GOAL_LABELS: Record<Goal, string> = {
  perder: "Perder gordura",
  ganhar: "Ganhar massa muscular",
  manter: "Manter o peso",
  recomp: "Recomposição corporal",
};

export const GOALS: { key: Goal; title: string; desc: string }[] = [
  {
    key: "perder",
    title: "Perder gordura",
    desc: "Reduzir peso/gordura corporal preservando o máximo de massa magra",
  },
  {
    key: "ganhar",
    title: "Ganhar massa muscular",
    desc: "Aumentar massa magra, aceitando algum ganho de gordura junto",
  },
  {
    key: "manter",
    title: "Manter o peso",
    desc: "Estabilizar o peso atual, focando em composição corporal",
  },
  {
    key: "recomp",
    title: "Recomposição corporal",
    desc: "Perder gordura e ganhar músculo ao mesmo tempo (déficit leve + proteína alta)",
  },
];

export const ACTIVITY_LEVELS: {
  key: ActivityLevel;
  title: string;
  desc: string;
  factor: number;
}[] = [
  {
    key: "sedentario",
    title: "Sedentário",
    desc: "Trabalho de escritório, pouco ou nenhum exercício",
    factor: 1.2,
  },
  {
    key: "leve",
    title: "Levemente ativo",
    desc: "Exercício leve 1-3x/semana, ou trabalho que exige caminhar bastante",
    factor: 1.375,
  },
  {
    key: "moderado",
    title: "Moderadamente ativo",
    desc: "Exercício moderado 3-5x/semana",
    factor: 1.55,
  },
  {
    key: "intenso",
    title: "Muito ativo",
    desc: "Exercício pesado 6-7x/semana, ou trabalho fisicamente exigente",
    factor: 1.725,
  },
  {
    key: "atleta",
    title: "Atleta / extremo",
    desc: "Treino intenso 2x/dia, ou trabalho braçal muito pesado",
    factor: 1.9,
  },
];

// Ported from the Medidas module's `FIELDS` array. All measurements are
// circumferences in centimeters.
export const MEASUREMENT_FIELDS: { key: string; label: string; unit: string }[] = [
  { key: "cintura", label: "Cintura", unit: "cm" },
  { key: "quadril", label: "Quadril", unit: "cm" },
  { key: "peito", label: "Peito", unit: "cm" },
  { key: "braco", label: "Braço", unit: "cm" },
  { key: "coxa", label: "Coxa", unit: "cm" },
  { key: "panturrilha", label: "Panturrilha", unit: "cm" },
  { key: "abdomen", label: "Abdômen", unit: "cm" },
  { key: "pescoco", label: "Pescoço", unit: "cm" },
];

export interface ProfileTargets {
  bmr: number;
  tdee: number;
  calorieTarget: number;
  proteinG: number;
  fatG: number;
  carbG: number;
}

/**
 * Mifflin-St Jeor BMR + goal-based calorie/protein targets, ported from
 * `computeProfile()` in the prototype's Perfil module. `pctPerWeek` (the
 * user-chosen pace, from target weight/current weight/timeframe) is
 * optional here — when omitted we fall back to the prototype's flat
 * defaults for each goal, same as when the prototype has no timeframe.
 */
export function computeTargets(input: {
  weight: number;
  height: number;
  age: number;
  sex: "M" | "F";
  activity: ActivityLevel;
  goal: Goal;
  pctPerWeek?: number | null;
}): ProfileTargets {
  const { weight: w, height: h, age: a, sex, activity, goal, pctPerWeek } = input;

  const bmr = 10 * w + 6.25 * h - 5 * a + (sex === "M" ? 5 : -161);
  const activityFactor =
    ACTIVITY_LEVELS.find((x) => x.key === activity)?.factor ?? 1.2;
  const tdee = bmr * activityFactor;

  let calorieTarget: number;
  let proteinPerKg: number;

  if (goal === "perder") {
    const deficitPct = pctPerWeek
      ? Math.min(Math.max((pctPerWeek / 0.7) * 0.18, 0.12), 0.28)
      : 0.18;
    calorieTarget = tdee * (1 - deficitPct);
    proteinPerKg = 2.1;
  } else if (goal === "ganhar") {
    calorieTarget = tdee * 1.12;
    proteinPerKg = 1.8;
  } else if (goal === "recomp") {
    calorieTarget = tdee * 0.95;
    proteinPerKg = 2.2;
  } else {
    calorieTarget = tdee;
    proteinPerKg = 1.7;
  }

  const proteinG = proteinPerKg * w;
  const proteinKcal = proteinG * 4;
  const fatG = Math.round((calorieTarget * 0.28) / 9);
  const fatKcal = fatG * 9;
  const carbG = Math.max(0, Math.round((calorieTarget - proteinKcal - fatKcal) / 4));

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calorieTarget: Math.round(calorieTarget),
    proteinG: Math.round(proteinG),
    fatG,
    carbG,
  };
}

// Ported from `window.FX_BADGES` in the prototype's streak/achievements module.
export const BADGES: Record<string, { label: string; icon: string }> = {
  primeiro_treino: { label: "Primeiro treino", icon: "💪" },
  primeira_semana: { label: "Primeira semana", icon: "📅" },
  primeira_foto: { label: "Primeira foto", icon: "📸" },
  primeira_medida: { label: "Primeira medida", icon: "📏" },
  streak_30: { label: "30 dias seguidos", icon: "🔥" },
  meta_batida: { label: "Meta batida", icon: "🏆" },
};

/** Generates a short, shareable invite code for a new `personal` account. */
export function generateInviteCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}
