// Offline sanity check for FOOD_DB / MARMITA_SUGGESTIONS / SUPPLEMENT_RECIPES.
// Run: node scripts/validate-nutrition-data.mjs   (Node >= 22.18 strips TS types natively)
// Checks: finite non-negative numbers, no duplicate names (case/accent-insensitive),
// kcal ~ 4P+4C+9F within 15% (or 8 kcal absolute for very low-energy items; alcoholic
// drinks are exempt because ethanol adds ~7 kcal/g not captured by P/C/F).
import { register } from "node:module";

// lib/ files import siblings without extension (bundler resolution); teach plain Node to add ".ts".
register(
  "data:text/javascript," +
    encodeURIComponent(`export async function resolve(s, c, n) {
      try { return await n(s, c); } catch (e) {
        if (s.startsWith(".") && !/\\.[a-z]+$/.test(s)) return n(s + ".ts", c);
        throw e;
      }
    }`),
  import.meta.url,
);
const { FOOD_DB } = await import("../lib/food-database.ts");
const { MARMITA_SUGGESTIONS } = await import("../lib/marmita-suggestions.ts");
const { SUPPLEMENT_RECIPES } = await import("../lib/supplement-recipes.ts");

const norm = (s) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/\s+/g, " ").trim();
const ALCOHOL = /cerveja \(|chopp|vinho|caipirinha|vodka|cacha[cç]a|whisky|espumante/i;
let problems = 0;
const bad = (m) => { problems++; console.log("  ! " + m); };
const fin = (x) => typeof x === "number" && Number.isFinite(x) && x >= 0;
const atwaterOk = (kcal, p, c, f) => {
  const e = 4 * p + 4 * c + 9 * f;
  return Math.abs(kcal - e) <= 8 || Math.abs(kcal - e) <= 0.15 * Math.max(kcal, e);
};

console.log(`FOOD_DB: ${FOOD_DB.length} items`);
const seen = new Map();
for (const f of FOOD_DB) {
  for (const k of ["per", "kcal", "protein", "carb", "fat"]) if (!fin(f[k])) bad(`${f.name}: ${k} invalid`);
  if (!f.name || !f.unit) bad(`missing name/unit: ${JSON.stringify(f)}`);
  if (f.gramsPerUnit !== undefined && !(Number.isFinite(f.gramsPerUnit) && f.gramsPerUnit > 0)) bad(`${f.name}: gramsPerUnit invalid`);
  if (f.gramsPerUnit !== undefined && (f.unit === "g" || f.unit === "ml")) bad(`${f.name}: gramsPerUnit on g/ml item`);
  const n = norm(f.name);
  if (seen.has(n)) bad(`duplicate name: ${f.name}`);
  seen.set(n, f);
  if (!ALCOHOL.test(f.name) && !atwaterOk(f.kcal, f.protein, f.carb, f.fat)) {
    bad(`Atwater outlier: ${f.name} kcal=${f.kcal} vs ${(4 * f.protein + 4 * f.carb + 9 * f.fat).toFixed(0)}`);
  }
}

console.log(`SUPPLEMENT_RECIPES: ${SUPPLEMENT_RECIPES.length} items`);
const rn = new Set();
for (const r of SUPPLEMENT_RECIPES) {
  for (const k of ["yield", "kcal", "protein", "carb", "fat"]) if (!fin(r[k])) bad(`recipe ${r.name}: ${k} invalid`);
  if (!["ganho", "emagrecimento", "geral"].includes(r.goal)) bad(`recipe ${r.name}: goal ${r.goal}`);
  if (!r.ingredients?.length || !r.prep?.length || !r.supplements) bad(`recipe ${r.name}: missing ingredients/prep/supplements`);
  if (rn.has(norm(r.name))) bad(`recipe duplicate: ${r.name}`);
  rn.add(norm(r.name));
  if (!atwaterOk(r.kcal, r.protein, r.carb, r.fat)) bad(`recipe Atwater: ${r.name} kcal=${r.kcal} vs ${4 * r.protein + 4 * r.carb + 9 * r.fat}`);
}

console.log(`MARMITA_SUGGESTIONS: ${MARMITA_SUGGESTIONS.length} items`);
const cats = new Set(["almoco", "cafe", "lanche", "sanduiche", "vegetariana", "sobremesa"]);
const mn = new Set();
for (const m of MARMITA_SUGGESTIONS) {
  if (!cats.has(m.category)) bad(`marmita ${m.name}: category ${m.category}`);
  for (const k of ["yield", "kcal", "protein"]) if (!fin(m[k])) bad(`marmita ${m.name}: ${k} invalid`);
  if (m.yield < 1) bad(`marmita ${m.name}: yield < 1`);
  if (!m.ingredients?.length || !m.prep?.length) bad(`marmita ${m.name}: missing ingredients/prep`);
  for (const i of m.ingredients) if (!i.name || !fin(i.qty) || !i.unit) bad(`marmita ${m.name}: bad ingredient ${JSON.stringify(i)}`);
  if (mn.has(norm(m.name))) bad(`marmita duplicate: ${m.name}`);
  mn.add(norm(m.name));
}

// meal-carbs coverage (informational)
const { marmitaCarbPerServing, marmitaCarbDetail } = await import("../lib/meal-carbs.ts");
let sum = 0;
for (const m of MARMITA_SUGGESTIONS) {
  const d = marmitaCarbDetail(m);
  sum += d.confidence;
  if (!Number.isFinite(d.carb) || d.carb !== marmitaCarbPerServing(m)) bad(`meal-carbs mismatch: ${m.name}`);
  // labelled diet sanity (carb is the meal-carbs estimate per serving)
  if (/^Keto/i.test(m.name) && d.carb > 15) bad(`Keto marmita with carb ~${d.carb} g: ${m.name}`);
  if (/^Low carb/i.test(m.name) && d.carb > 30) bad(`Low carb marmita with carb ~${d.carb} g: ${m.name}`);
  // protein+carb sanity: carb*4 + protein*4 must not exceed kcal by much
  if (4 * d.carb + 4 * m.protein > m.kcal * 1.35 + 40) bad(`carb+protein exceed kcal: ${m.name} kcal=${m.kcal} P=${m.protein} C~${d.carb}`);
}
console.log(`meal-carbs mean confidence: ${(sum / MARMITA_SUGGESTIONS.length).toFixed(2)}`);
console.log(problems ? `FAILED: ${problems} problem(s)` : "OK: no problems");
process.exit(problems ? 1 : 0);
