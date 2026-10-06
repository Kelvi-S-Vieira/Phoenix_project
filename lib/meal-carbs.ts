import type { MarmitaSuggestion, MarmitaIngredient } from "./marmita-suggestions";
import { FOOD_DB, type FoodDbItem } from "./food-database";

/**
 * Carbohydrate ESTIMATE for marmita suggestions.
 *
 * MARMITA_SUGGESTIONS (lib/marmita-suggestions.ts, ported verbatim from the
 * prototype) only carries `kcal` and `protein`, not `carb`. To let the diet
 * filter (lib/diet-types.ts `mealFitsDiet`) judge low-carb / keto
 * compatibility, the carb per serving is DERIVED here from the ingredient
 * list.
 *
 * Resolution order for each ingredient:
 *   1. FOOD_DB match (normalized name / token containment) whose unit can be
 *      converted to the ingredient's quantity (g/ml per 100, same counted unit,
 *      or `gramsPerUnit`) -> real carb = per-100 g carb x quantity.
 *   2. Keyword RULES below (typical carb g per 100 g/ml or per unit).
 *   3. Known "trace" ingredients (water, salt, spices, herbs...) -> 0 g, counted
 *      as resolved.
 *   4. Anything else is assumed carb-free (meats, oils...) but counted as
 *      UNRESOLVED, which lowers the `confidence` returned by
 *      `marmitaCarbDetail`.
 *
 * HONESTY NOTE: FOOD_DB and RULES values come from the author's knowledge of
 * TACO/USDA tables, not an online lookup. The result is an approximation —
 * good enough to separate "arroz + batata-doce" from "frango + salada" but not
 * for exact macro tracking. The catalog's own `kcal`/`protein` stay untouched.
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

// ---------------------------------------------------------------------------
// FOOD_DB matching
// ---------------------------------------------------------------------------

const STOPWORDS = new Set(["de", "da", "do", "das", "dos", "em", "com", "ao", "a", "o", "e", "ou", "para", "sem", "tipo"]);
// Words that make a FOOD_DB entry a *prepared* variant; avoid picking it for a plain ingredient.
const PREPARED_PENALTY = new Set(["frito", "frita", "fritas", "saute", "empanado", "rustica", "carreteiro", "tutu", "molho"]);

function stripAccents(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

function tokenize(s: string, dropParens = true): string[] {
  const base = dropParens ? s.replace(/\([^)]*\)/g, " ") : s;
  return stripAccents(base)
    .split(/[^a-z0-9]+/)
    .filter((t) => t && !STOPWORDS.has(t) && !/^\d+$/.test(t))
    .map((t) => (t.length > 3 && t.endsWith("s") ? t.slice(0, -1) : t));
}

interface IndexedFood {
  item: FoodDbItem;
  norm: string;
  /** Tokens outside parentheses (used for scoring "extra" words). */
  tokens: Set<string>;
  /** Tokens outside + inside parentheses (used for containment). */
  allTokens: Set<string>;
}

let FOOD_INDEX: IndexedFood[] | null = null;
function foodIndex(): IndexedFood[] {
  if (!FOOD_INDEX) {
    FOOD_INDEX = FOOD_DB.map((item) => ({
      item,
      norm: stripAccents(item.name).replace(/\s+/g, " ").trim(),
      tokens: new Set(tokenize(item.name)),
      allTokens: new Set(tokenize(item.name, false)),
    }));
  }
  return FOOD_INDEX;
}

/** Unit aliases so "dente", "xícara" etc. line up with FOOD_DB units. */
function normUnit(u: string): string {
  const x = stripAccents(u).trim();
  if (x === "xicara" || x === "xic") return "xicara";
  if (x === "unid grande" || x === "unidade" || x === "dente") return "unid";
  return x;
}

const MASS_UNITS = new Set(["g", "ml"]);

/**
 * FOOD_DB candidates for an ingredient name, best first: the exact normalized
 * name, then entries containing ALL the ingredient's tokens ordered by fewest
 * extra tokens (prepared/fried variants are penalized).
 */
export function matchFoodCandidates(ingredientName: string): FoodDbItem[] {
  const idx = foodIndex();
  const n = stripAccents(ingredientName).replace(/\s+/g, " ").trim();
  const out: FoodDbItem[] = [];
  for (const f of idx) if (f.norm === n) out.push(f.item);
  const toks = tokenize(ingredientName);
  if (toks.length === 0) return out;
  const scored: { item: FoodDbItem; score: number }[] = [];
  for (const f of idx) {
    if (f.norm === n || !toks.every((t) => f.allTokens.has(t))) continue;
    let score = Math.max(0, f.tokens.size - toks.length);
    for (const t of f.tokens) if (!toks.includes(t) && PREPARED_PENALTY.has(t)) score += 2;
    scored.push({ item: f.item, score });
  }
  scored.sort((a, b) => a.score - b.score); // stable: ties keep FOOD_DB order
  return out.concat(scored.map((x) => x.item));
}

/** Best FOOD_DB entry for an ingredient name, or null when nothing contains it. */
export function matchFoodForIngredient(ingredientName: string): FoodDbItem | null {
  return matchFoodCandidates(ingredientName)[0] ?? null;
}

/** Scale a FOOD_DB item to an ingredient quantity; returns the multiplier on the item's per-`per` values, or null if units are not convertible. */
function foodFactor(food: FoodDbItem, ing: MarmitaIngredient): number | null {
  const iu = normUnit(ing.unit);
  const fu = normUnit(food.unit);
  if (MASS_UNITS.has(iu)) {
    if (MASS_UNITS.has(fu)) return ing.qty / food.per; // g or ml per `per` (ml ~ g)
    if (food.gramsPerUnit) return ing.qty / (food.gramsPerUnit * food.per);
    return null;
  }
  if (iu === fu) return ing.qty / food.per;
  if (MASS_UNITS.has(fu) && food.gramsPerUnit == null && iu === "unid") return null;
  if (MASS_UNITS.has(fu) && iu === "unid" && food.per === 100) return null; // no unit weight known
  return null;
}

// Herbs, spices, liquids, seasonings and carb-free staples (meats, fish, eggs, tofu,
// cheeses, oils, olives, mushrooms) with negligible carbs per serving. They are
// "resolved" at 0 g so they do not drag the confidence indicator down.
const TRACE =
  /^(agua|sal\b|pimenta|tempero|especiaria|canela|curcuma|cominho|paprica|oregano|salsinha|salsa\b|cebolinha|coentro|manjericao|louro|vinagre|gelo|pedra|erva|noz-moscada|colorau|acafrao|alecrim|hortela|tomilho|gengibre|baunilha|essencia|fermento|bicarbonato|shoyu|molho shoyu|molho de soja|curry|gergelim|mostarda|caldo|cafe|cha\b|gelatina|adocante|sucralose|stevia|alcaparra|azeite|oleo|azeitona|dende|champignon|cogumelo|pepino|abacate|aspargo|frango|peito de|file|sobrecoxa|coxa|peru|patinho|acem|musculo|costela|lombo|bife|carne|charque|camarao|peixe|tilapia|salmao|atum|sardinha|bacalhau|linguica|bacon|presunto|ovo|clara|tofu|queijo|ricota|manteiga)/;

export type CarbSource = "db" | "rule" | "trace" | "none";

export interface IngredientCarb {
  name: string;
  carb: number;
  source: CarbSource;
}

function ruleCarb(ing: MarmitaIngredient, name: string): number | null {
  const rule = RULES.find((r) => r.re.test(name));
  if (!rule) return null;
  const unit = ing.unit.toLowerCase();
  if ((unit === "g" || unit === "ml") && rule.per100 != null) return (ing.qty / 100) * rule.per100;
  const perUnit = rule.perUnit?.[unit] ?? rule.perUnitDefault;
  if (perUnit != null) return ing.qty * perUnit;
  return 0; // rule matched but unit not convertible (legacy behaviour: 0)
}

/** Carb (g) for ONE ingredient (whole recipe quantity) plus how it was resolved. */
export function ingredientCarbDetail(ing: MarmitaIngredient): IngredientCarb {
  const name = ing.name.toLowerCase();
  for (const food of matchFoodCandidates(ing.name)) {
    const factor = foodFactor(food, ing);
    if (factor != null && Number.isFinite(factor)) return { name: ing.name, carb: factor * food.carb, source: "db" };
  }
  const r = ruleCarb(ing, name);
  if (r != null) return { name: ing.name, carb: r, source: "rule" };
  if (TRACE.test(stripAccents(ing.name).trim())) return { name: ing.name, carb: 0, source: "trace" };
  return { name: ing.name, carb: 0, source: "none" };
}

export interface MarmitaCarbDetail {
  /** Estimated carbs (g) per serving (rounded). */
  carb: number;
  /** Fraction (0-1) of ingredients resolved via FOOD_DB, keyword rules or known trace items. */
  confidence: number;
  resolved: number;
  total: number;
  ingredients: IngredientCarb[];
}

/** Same estimate as `marmitaCarbPerServing`, plus a confidence indicator and per-ingredient sources. */
export function marmitaCarbDetail(s: MarmitaSuggestion): MarmitaCarbDetail {
  const ingredients = s.ingredients.map(ingredientCarbDetail);
  const total = ingredients.reduce((sum, i) => sum + i.carb, 0);
  const resolved = ingredients.filter((i) => i.source !== "none").length;
  return {
    carb: Math.round(total / Math.max(1, s.yield)),
    confidence: ingredients.length ? resolved / ingredients.length : 1,
    resolved,
    total: ingredients.length,
    ingredients,
  };
}

/** Estimated carbs (g) per serving of a marmita suggestion, derived from its ingredients. */
export function marmitaCarbPerServing(s: MarmitaSuggestion): number {
  return marmitaCarbDetail(s).carb;
}
