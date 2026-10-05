import type { Goal } from "@/lib/database.types";

export type DietType = "equilibrada" | "mediterranea" | "lowcarb" | "cetogenica" | "altaproteina" | "jejum";

export type DietDef = {
  key: DietType;
  label: string;
  emoji: string;
  /** % of calories from protein / carb / fat (sums to 100). */
  split: { p: number; c: number; f: number };
  description: string;
  rules: string[];
  /** Max carbs (g) a marmita/receita may have to count as compatible; undefined = no limit. */
  maxCarbPerMeal?: number;
  /** Min protein (g) per meal to count as compatible. */
  minProteinPerMeal?: number;
};

export const DIETS: DietDef[] = [
  { key: "equilibrada", label: "Equilibrada", emoji: "⚖️", split: { p: 25, c: 50, f: 25 },
    description: "Distribuição clássica, flexível e fácil de manter.",
    rules: ["Sem alimentos proibidos", "Boa para começar e para manutenção", "Foco em comida de verdade e porções"] },
  { key: "mediterranea", label: "Mediterrânea", emoji: "🫒", split: { p: 20, c: 45, f: 35 },
    description: "Rica em azeite, peixes, legumes, grãos e frutas.",
    rules: ["Prefira azeite, peixe, castanhas e leguminosas", "Reduza carnes vermelhas e ultraprocessados", "Boa para saúde cardiovascular"] },
  { key: "lowcarb", label: "Low Carb", emoji: "🥩", split: { p: 35, c: 25, f: 40 },
    description: "Menos carboidrato, mais proteína e gordura boa.",
    rules: ["Reduza pães, massas, açúcar e doces", "Priorize carnes, ovos, laticínios e vegetais", "Atenção à fibra e à hidratação"],
    maxCarbPerMeal: 40 },
  { key: "cetogenica", label: "Cetogênica", emoji: "🥑", split: { p: 20, c: 5, f: 75 },
    description: "Carboidrato mínimo para o corpo usar gordura como combustível.",
    rules: ["Carboidrato bem baixo (≈ 20–50 g/dia)", "Gordura como principal fonte de energia", "Mais restritiva: ideal ter acompanhamento profissional"],
    maxCarbPerMeal: 15 },
  { key: "altaproteina", label: "Alta proteína", emoji: "💪", split: { p: 40, c: 35, f: 25 },
    description: "Proteína elevada para preservar e ganhar massa magra.",
    rules: ["Proteína em todas as refeições", "Boa para cutting e recomposição", "Beba mais água"],
    minProteinPerMeal: 20 },
  { key: "jejum", label: "Jejum Intermitente", emoji: "⏱️", split: { p: 30, c: 40, f: 30 },
    description: "Mesmas calorias, concentradas numa janela de alimentação (ex.: 16:8).",
    rules: ["Janela de 8 h para comer (ex.: 12h–20h)", "Fora da janela: água, café e chá sem açúcar", "O Diário mostra a janela de alimentação"] },
];

export const DEFAULT_FASTING_WINDOW = "12:00-20:00";

export function getDiet(key: string | null | undefined): DietDef | null {
  return DIETS.find((d) => d.key === key) ?? null;
}

/**
 * Re-splits a calorie target into protein/carb/fat grams for a diet type.
 * Calories are kept; only the split changes (4/4/9 kcal per g).
 */
export function macrosForDiet(calorieTarget: number, diet: DietType): { proteinG: number; carbG: number; fatG: number } {
  const d = getDiet(diet) ?? DIETS[0];
  return {
    proteinG: Math.round((calorieTarget * d.split.p) / 100 / 4),
    carbG: Math.round((calorieTarget * d.split.c) / 100 / 4),
    fatG: Math.round((calorieTarget * d.split.f) / 100 / 9),
  };
}

/** Suggested diet for a goal when the user hasn't picked one (onboarding default highlight). */
export function suggestedDietForGoal(goal: Goal | null): DietType {
  if (goal === "perder" || goal === "recomp") return "altaproteina";
  return "equilibrada";
}

/** Does a meal (marmita/receita) fit the diet's per-meal limits? */
export function mealFitsDiet(meal: { carb?: number; protein?: number }, diet: DietType | null | undefined): boolean {
  const d = getDiet(diet);
  if (!d) return true;
  if (d.maxCarbPerMeal != null && meal.carb != null && meal.carb > d.maxCarbPerMeal) return false;
  if (d.minProteinPerMeal != null && meal.protein != null && meal.protein < d.minProteinPerMeal) return false;
  return true;
}
