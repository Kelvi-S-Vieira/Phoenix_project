import type { MarmitaSuggestion, MarmitaIngredient } from "@/lib/marmita-suggestions";

/**
 * Carbohydrate ESTIMATE for marmita suggestions.
 *
 * MARMITA_SUGGESTIONS (lib/marmita-suggestions.ts, ported verbatim from the
 * prototype) only carries `kcal` and `protein`, not `carb`. To let the diet
 * filter (lib/diet-types.ts `mealFitsDiet`) judge low-carb / keto
 * compatibility, the carb per serving is DERIVED here from the ingredient
 * list, using typical carb values (g) per 100 g/ml or per unit.
 *
 * Ingredients that match no rule are assumed carb-free (meats, eggs, oils,
 * spices, cheeses...), so the result is an approximation — good enough to
 * separate "arroz + batata-doce" from "frango + salada" but not for exact
 * macro tracking. The catalog's own `kcal`/`protein` remain untouched.
 */

type CarbRule = {
  re: RegExp;
  /** carb g per 100 g or 100 ml */
  per100?: number;
  /** carb g per 1 of a counted unit (unid, fatia, xíc, colher sopa...) */
  perUnit?: Record<string, number>;
  /** fallback per-unit value for units not listed in perUnit */
  perUnitDefault?: number;
};

// Order matters: first match wins (specific before generic).
const RULES: CarbRule[] = [
  { re: /baguete/, perUnit: { unid: 40 }, perUnitDefault: 40 },
  { re: /ciabatta/, perUnit: { unid: 30 }, perUnitDefault: 30 },
  { re: /p[aã]o integral \(tipo hamb/, perUnit: { unid: 25 }, perUnitDefault: 25 },
  { re: /p[aã]o/, perUnit: { fatia: 12, unid: 12 }, perUnitDefault: 12, per100: 48 },
  { re: /rap10/, perUnitDefault: 14 },
  { re: /tortilha/, perUnitDefault: 22 },
  { re: /couve-flor/, perUnitDefault: 20 },
  { re: /biscoito de arroz/, perUnitDefault: 7 },
  { re: /arroz/, per100: 28, perUnit: { "xíc": 42 }, perUnitDefault: 42 },
  { re: /aveia/, per100: 66, perUnit: { "colher sopa": 5 }, perUnitDefault: 5 },
  { re: /batata-doce/, per100: 20 },
  { re: /batata/, per100: 17 },
  { re: /mandioquinha/, per100: 25 },
  { re: /mandioca/, per100: 30, perUnit: { "colher sopa": 10 }, perUnitDefault: 10 },
  { re: /inhame/, per100: 27 },
  { re: /ab[oó]bora/, per100: 7 },
  { re: /macarr[aã]o/, per100: 25 },
  { re: /quinoa/, per100: 21, perUnit: { "xíc": 39 }, perUnitDefault: 39 },
  { re: /cuscuz marroquino/, per100: 23 },
  { re: /floc[aã]o de milho/, per100: 78 },
  { re: /hidratada/, per100: 40 },
  { re: /tapioca/, per100: 88 },
  { re: /farinha panko/, per100: 75 },
  { re: /farinha de gr[aã]o/, per100: 58 },
  { re: /farinha integral/, per100: 70 },
  { re: /farinha de aveia/, per100: 66, perUnitDefault: 5 },
  { re: /granola/, per100: 65 },
  { re: /feij[aã]o|gr[aã]o-de-bico|lentilha|ervilha/, per100: 17 },
  { re: /homus|hommus/, per100: 14 },
  { re: /milho verde/, per100: 19 },
  { re: /soja texturizada|pts/, per100: 30 },
  { re: /seitan/, per100: 14 },
  { re: /banana/, perUnitDefault: 23 },
  { re: /ma[cç][aã]|pera/, perUnitDefault: 25, per100: 14 },
  { re: /damasco|frutas secas/, per100: 60 },
  { re: /frutas|morango|abacaxi/, per100: 11 },
  { re: /tomate seco/, per100: 55 },
  { re: /tomate cereja/, per100: 4 },
  { re: /\bmel\b/, per100: 110, perUnit: { "colher sopa": 8 }, perUnitDefault: 8 },
  { re: /a[cç][uú]car demerara/, per100: 100 },
  { re: /molho barbecue/, per100: 25 },
  { re: /molho de tomate/, per100: 6 },
  { re: /leite de coco/, per100: 3 },
  { re: /leite/, per100: 5 },
  { re: /suco natural/, per100: 10 },
  { re: /iogurte/, per100: 5 },
  { re: /queijo cottage|requeij[aã]o|cream cheese/, per100: 4 },
  { re: /pasta de amendoim/, per100: 20, perUnitDefault: 3 },
  { re: /amendoim|am[eê]ndoa/, per100: 18 },
  { re: /cacau/, perUnitDefault: 3 },
  { re: /chia/, perUnitDefault: 4 },
  { re: /whey/, perUnitDefault: 3 },
  { re: /cebola/, perUnitDefault: 10 },
  { re: /cenoura/, perUnitDefault: 7, per100: 10 },
  { re: /abobrinha|pimentão|pimentao/, perUnitDefault: 6 },
  { re: /berinjela/, perUnitDefault: 8 },
  { re: /brócolis|brocolis/, perUnitDefault: 15 },
  { re: /tomate/, perUnitDefault: 5 },
  { re: /limão|limao/, perUnitDefault: 4 },
  { re: /repolho|vagem|quiabo|espinafre|couve|alface|r[uú]cula/, per100: 5 },
];

function ingredientCarb(ing: MarmitaIngredient): number {
  const name = ing.name.toLowerCase();
  const rule = RULES.find((r) => r.re.test(name));
  if (!rule) return 0;
  const unit = ing.unit.toLowerCase();
  if ((unit === "g" || unit === "ml") && rule.per100 != null) return (ing.qty / 100) * rule.per100;
  const perUnit = rule.perUnit?.[unit] ?? rule.perUnitDefault;
  if (perUnit != null) return ing.qty * perUnit;
  return 0;
}

/** Estimated carbs (g) per serving of a marmita suggestion, derived from its ingredients. */
export function marmitaCarbPerServing(s: MarmitaSuggestion): number {
  const total = s.ingredients.reduce((sum, i) => sum + ingredientCarb(i), 0);
  return Math.round(total / Math.max(1, s.yield));
}
