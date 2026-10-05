"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { todayBR } from "@/lib/date-br";
import { SUPPLEMENT_RECIPES, SUPPLEMENT_RECIPE_GOALS, type SupplementRecipe } from "@/lib/supplement-recipes";
import type { Meal } from "@/lib/database.types";
import { mealFitsDiet, type DietType } from "@/lib/diet-types";
import { DietFilterToggle, DietFitBadge, sortByDietFit } from "@/components/DietFit";

const MEALS: { key: Meal; label: string }[] = [
  { key: "cafe", label: "Café da manhã" },
  { key: "almoco", label: "Almoço" },
  { key: "lanche", label: "Lanche" },
  { key: "jantar", label: "Jantar" },
  { key: "extra", label: "Extra" },
];

// Two actions added per user feedback (2026-10-04: "não vi botão de
// selecionar receita fit, para caber no plano da semana e monitorar as
// calorias ingeridas no dia"). Browsing here had no way to actually DO
// anything with a recipe besides read it.
//   - "Adicionar à semana": same mechanism as a Marmitas suggestion
//     (user_recipes + meal_prep_plan — see app/alimentacao/marmitas/
//     MarmitasTabs.tsx's addRecipeFromSuggestion) so it shows up in the
//     weekly meal-prep plan and shopping list, not just here.
//   - "Registrar no diário hoje": inserts straight into diary_entries for
//     today, so eating it actually counts toward today's calorie total in
//     Diário, without having to re-type the macros by hand there.
export default function RecipesFitBrowser({
  profileId,
  recommendedNames = [],
  dietType = null,
}: {
  profileId: string;
  // Names recorded in plan_recommendation_picks (kind="receita_fit") for
  // the current user's plan — see app/montar-plano/PlanRecommendStep.tsx.
  recommendedNames?: string[];
  // profiles.diet_type: orders compatible recipes first, badges them and
  // offers an "only compatible" filter (on by default when set).
  dietType?: DietType | null;
}) {
  const [activeGoal, setActiveGoal] = useState("all");
  const [onlyFit, setOnlyFit] = useState(dietType != null);
  const recommendedSet = new Set(recommendedNames);

  const [mealByRecipe, setMealByRecipe] = useState<Record<string, Meal>>({});
  const [busyRecipe, setBusyRecipe] = useState<string | null>(null);
  const [statusByRecipe, setStatusByRecipe] = useState<Record<string, string>>({});

  const fits = (r: SupplementRecipe) => mealFitsDiet({ carb: r.carb, protein: r.protein }, dietType);
  const filtered = SUPPLEMENT_RECIPES.filter((r) => activeGoal === "all" || r.goal === activeGoal).filter(
    (r) => !dietType || !onlyFit || fits(r)
  );
  const list = dietType ? sortByDietFit(filtered, fits) : filtered;

  function mealFor(name: string): Meal {
    return mealByRecipe[name] ?? "almoco";
  }

  function flashStatus(name: string, message: string) {
    setStatusByRecipe((prev) => ({ ...prev, [name]: message }));
    setTimeout(() => {
      setStatusByRecipe((prev) => {
        const next = { ...prev };
        if (next[name] === message) delete next[name];
        return next;
      });
    }, 4000);
  }

  async function addToWeek(r: SupplementRecipe) {
    setBusyRecipe(r.name);
    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("user_recipes")
      .insert({ profile_id: profileId, name: r.name, yield_count: r.yield, ingredients: r.ingredients })
      .select("id")
      .single();
    if (insertError || !data) {
      setBusyRecipe(null);
      flashStatus(r.name, insertError?.message ?? "Erro ao adicionar à semana.");
      return;
    }
    const { error: upsertError } = await supabase
      .from("meal_prep_plan")
      .upsert(
        { profile_id: profileId, user_recipe_id: data.id, desired_count: 1 },
        { onConflict: "profile_id,user_recipe_id" }
      );
    setBusyRecipe(null);
    flashStatus(r.name, upsertError ? upsertError.message : "Adicionada ao plano da semana (Marmitas).");
  }

  async function logToday(r: SupplementRecipe) {
    setBusyRecipe(r.name);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("diary_entries").insert({
      profile_id: profileId,
      logged_at: todayBR(),
      meal: mealFor(r.name),
      food_name: r.name,
      quantity: null,
      unit: null,
      kcal: r.kcal,
      protein: r.protein,
      carb: r.carb,
      fat: r.fat,
      source: "manual",
    });
    setBusyRecipe(null);
    flashStatus(r.name, insertError ? insertError.message : "Registrada no Diário de hoje.");
  }

  return (
    <>
      <div className="sugg-filters">
        {SUPPLEMENT_RECIPE_GOALS.map((g) => (
          <div
            key={g.key}
            className={"sugg-filter" + (g.key === activeGoal ? " active" : "")}
            onClick={() => setActiveGoal(g.key)}
          >
            {g.label}
          </div>
        ))}
      </div>

      {dietType && <DietFilterToggle diet={dietType} on={onlyFit} onToggle={() => setOnlyFit((v) => !v)} />}

      <div className="suggestions-grid rs-grid">
        {list.map((r) => {
          const unitLabel = r.yield === 1 ? "porção" : "porções";
          const recipeFits = fits(r);
          return (
            <div className={"rs-card" + (dietType && !recipeFits ? " fx-diet-mismatch" : "")} key={r.name}>
              {dietType && <DietFitBadge fits={recipeFits} diet={dietType} />}
              {recommendedSet.has(r.name) && (
                <span className="fx-rec-badge">⭐ Recomendado no seu plano</span>
              )}
              <h4>{r.name}</h4>
              <div className="rs-yield">
                rende {r.yield} {unitLabel}
              </div>
              <div className="rs-macro">
                ~{r.kcal} kcal · ~{r.protein}g proteína · ~{r.carb}g carbo · ~{r.fat}g gordura
              </div>
              <div className="rs-supps">
                <b>Suplementos:</b> {r.supplements.join(", ")}
              </div>
              <ul>
                {r.ingredients.map((i, idx) => (
                  <li key={idx}>
                    <b>
                      {i.qty}
                      {i.unit ? ` ${i.unit}` : ""}
                    </b>{" "}
                    {i.name}
                  </li>
                ))}
              </ul>
              <div className="rs-prep">
                <span className="prep-label">Modo de preparo</span>
                <ol>
                  {r.prep.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ol>
              </div>

              <div className="fx-rs-actions">
                <button
                  type="button"
                  className="btn secondary"
                  disabled={busyRecipe === r.name}
                  onClick={() => addToWeek(r)}
                >
                  + Adicionar à semana
                </button>
                <div className="fx-rs-log-row">
                  <select value={mealFor(r.name)} onChange={(e) => setMealByRecipe((prev) => ({ ...prev, [r.name]: e.target.value as Meal }))}>
                    {MEALS.map((m) => (
                      <option key={m.key} value={m.key}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn secondary"
                    disabled={busyRecipe === r.name}
                    onClick={() => logToday(r)}
                  >
                    + Registrar no diário hoje
                  </button>
                </div>
              </div>
              {statusByRecipe[r.name] && <div className="fx-rs-status">{statusByRecipe[r.name]}</div>}
            </div>
          );
        })}
      </div>
      {list.length === 0 && (
        <div className="empty-note">Nenhuma receita nesse objetivo ainda.</div>
      )}
    </>
  );
}
