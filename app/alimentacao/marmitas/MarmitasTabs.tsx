"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserRecipe, UserRecipeIngredient, ShoppingExtra } from "@/lib/database.types";
import type { MarmitaSuggestion } from "@/lib/marmita-suggestions";
import RecipesTab from "./RecipesTab";
import SuggestionsTab from "./SuggestionsTab";
import type { DietType } from "@/lib/diet-types";
import PlanTab from "./PlanTab";
import ShoppingTab from "./ShoppingTab";

type View = "recipes" | "suggestions" | "plan" | "shopping";

const TABS: { key: View; label: string }[] = [
  { key: "recipes", label: "Receitas" },
  { key: "suggestions", label: "Sugestões" },
  { key: "plan", label: "Planejar semana" },
  { key: "shopping", label: "Lista de compras" },
];

// Owns all of this page's client-side state (recipes, the week plan, and
// the shopping extras list) so the 4 tabs below stay in sync without a
// server round-trip between tab switches — e.g. adding a suggestion in
// "Sugestões" immediately shows up in "Receitas" and "Planejar semana".
// Each mutation below writes to Supabase first and only updates local
// state on success (simple optimistic-after-confirm, not optimistic-then-
// rollback) — ported from the prototype's localStorage read-modify-write
// functions (projeto_fenix_app_final.html, ~lines 12935-15172).
export default function MarmitasTabs({
  profileId,
  initialRecipes,
  initialPlan,
  initialExtras,
  dietType = null,
}: {
  profileId: string;
  initialRecipes: UserRecipe[];
  initialPlan: Record<string, number>;
  initialExtras: ShoppingExtra[];
  dietType?: DietType | null;
}) {
  const [view, setView] = useState<View>("recipes");
  const [recipes, setRecipes] = useState<UserRecipe[]>(initialRecipes);
  // Mirrors `recipes` synchronously (unlike the state itself, which only
  // updates on the next render) so the commit-on-blur handlers below always
  // read the latest edited value, even if blur fires right after a local
  // edit in the same tick.
  const recipesRef = useRef<UserRecipe[]>(initialRecipes);
  const [plan, setPlan] = useState<Record<string, number>>(initialPlan);
  const [extras, setExtras] = useState<ShoppingExtra[]>(initialExtras);
  const [error, setError] = useState<string | null>(null);

  function reportError(message: string) {
    setError(message);
  }

  function updateRecipesLocal(updater: (prev: UserRecipe[]) => UserRecipe[]) {
    setRecipes((prev) => {
      const next = updater(prev);
      recipesRef.current = next;
      return next;
    });
  }

  // ---- recipes ----
  async function addRecipe() {
    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("user_recipes")
      .insert({ profile_id: profileId, name: "Nova receita", yield_count: 4, ingredients: [] })
      .select("*")
      .single();
    if (insertError || !data) return reportError(insertError?.message ?? "Erro ao criar receita.");
    updateRecipesLocal((prev) => [...prev, data]);
  }

  async function addRecipeFromSuggestion(s: MarmitaSuggestion) {
    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("user_recipes")
      .insert({
        profile_id: profileId,
        name: s.name,
        yield_count: s.yield,
        ingredients: s.ingredients,
      })
      .select("*")
      .single();
    if (insertError || !data) return reportError(insertError?.message ?? "Erro ao adicionar receita.");
    updateRecipesLocal((prev) => [...prev, data]);
  }

  // Local-only edit (no network write) — called on every keystroke so
  // controlled inputs stay correct even when ingredient rows are
  // added/removed elsewhere in the same recipe (index-keyed rows would go
  // stale with uncontrolled/defaultValue inputs once an earlier row is
  // deleted and later rows shift up).
  function editRecipeField(id: string, field: "name" | "yield_count", value: string | number) {
    updateRecipesLocal((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function editIngredients(id: string, ingredients: UserRecipeIngredient[]) {
    updateRecipesLocal((prev) => (prev.map((r) => (r.id === id ? { ...r, ingredients } : r))));
  }

  // Commit-on-blur: writes whatever is currently in recipesRef for this
  // recipe, so a burst of local edits only produces one network write.
  async function commitRecipeField(id: string, field: "name" | "yield_count") {
    const recipe = recipesRef.current.find((r) => r.id === id);
    if (!recipe) return;
    const supabase = createClient();
    const patch: { name?: string; yield_count?: number } =
      field === "name" ? { name: recipe.name } : { yield_count: recipe.yield_count };
    const { error: updateError } = await supabase.from("user_recipes").update(patch).eq("id", id);
    if (updateError) reportError(updateError.message);
  }

  async function commitIngredients(id: string) {
    const recipe = recipesRef.current.find((r) => r.id === id);
    if (!recipe) return;
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("user_recipes")
      .update({ ingredients: recipe.ingredients })
      .eq("id", id);
    if (updateError) reportError(updateError.message);
  }

  // Structural ingredient changes (add/delete row) commit immediately —
  // only per-field text/number edits are deferred to blur.
  function addIngredientRow(id: string) {
    editIngredients(id, [
      ...(recipesRef.current.find((r) => r.id === id)?.ingredients ?? []),
      { name: "", qty: 0, unit: "" },
    ]);
    commitIngredients(id);
  }

  function deleteIngredientRow(id: string, idx: number) {
    const recipe = recipesRef.current.find((r) => r.id === id);
    if (!recipe) return;
    editIngredients(
      id,
      recipe.ingredients.filter((_, i) => i !== idx)
    );
    commitIngredients(id);
  }

  async function deleteRecipe(id: string) {
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("user_recipes").delete().eq("id", id);
    if (deleteError) return reportError(deleteError.message);
    updateRecipesLocal((prev) => prev.filter((r) => r.id !== id));
    setPlan((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  // ---- plan ----
  async function setDesiredCount(recipeId: string, count: number) {
    setPlan((prev) => ({ ...prev, [recipeId]: count }));
    const supabase = createClient();
    if (count > 0) {
      const { error: upsertError } = await supabase
        .from("meal_prep_plan")
        .upsert(
          { profile_id: profileId, user_recipe_id: recipeId, desired_count: count },
          { onConflict: "profile_id,user_recipe_id" }
        );
      if (upsertError) reportError(upsertError.message);
    } else {
      const { error: deleteError } = await supabase
        .from("meal_prep_plan")
        .delete()
        .eq("profile_id", profileId)
        .eq("user_recipe_id", recipeId);
      if (deleteError) reportError(deleteError.message);
    }
  }

  // ---- shopping extras ----
  async function addExtra(name: string) {
    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("shopping_extras")
      .insert({ profile_id: profileId, name })
      .select("*")
      .single();
    if (insertError || !data) return reportError(insertError?.message ?? "Erro ao adicionar item.");
    setExtras((prev) => [...prev, data]);
  }

  async function toggleExtra(id: string) {
    const current = extras.find((e) => e.id === id);
    if (!current) return;
    const nextChecked = !current.checked;
    setExtras((prev) => prev.map((e) => (e.id === id ? { ...e, checked: nextChecked } : e)));
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("shopping_extras")
      .update({ checked: nextChecked })
      .eq("id", id);
    if (updateError) reportError(updateError.message);
  }

  async function deleteExtra(id: string) {
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("shopping_extras").delete().eq("id", id);
    if (deleteError) return reportError(deleteError.message);
    setExtras((prev) => prev.filter((e) => e.id !== id));
  }

  function exportJson() {
    const payload = {
      recipes,
      plan,
      extras,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fenix_marmitas_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="fx-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={"fx-tab-btn" + (view === t.key ? " active" : "")}
            onClick={() => setView(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</div>
      )}

      {view === "recipes" && (
        <RecipesTab
          recipes={recipes}
          onAddRecipe={addRecipe}
          onEditField={editRecipeField}
          onCommitField={commitRecipeField}
          onEditIngredients={editIngredients}
          onAddIngredientRow={addIngredientRow}
          onDeleteIngredientRow={deleteIngredientRow}
          onCommitIngredients={commitIngredients}
          onDeleteRecipe={deleteRecipe}
          onExport={exportJson}
        />
      )}

      {view === "suggestions" && <SuggestionsTab onAdd={addRecipeFromSuggestion} dietType={dietType} />}

      {view === "plan" && <PlanTab recipes={recipes} plan={plan} onSetDesiredCount={setDesiredCount} />}

      {view === "shopping" && (
        <ShoppingTab
          recipes={recipes}
          plan={plan}
          extras={extras}
          onAddExtra={addExtra}
          onToggleExtra={toggleExtra}
          onDeleteExtra={deleteExtra}
        />
      )}
    </>
  );
}
