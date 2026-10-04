"use client";

import type { UserRecipe, UserRecipeIngredient } from "@/lib/database.types";

// Ported from the prototype's `renderRecipes()` (projeto_fenix_app_final.html,
// ~lines 15189-15250). Inputs are controlled (value from `recipes`, which
// the parent keeps updated on every keystroke via onEditField/
// onEditIngredients) and commit to Supabase on blur — same "change event,
// not input event" semantics as the prototype, without the index-shift
// bug a defaultValue/uncontrolled input would have when a row is deleted.
export default function RecipesTab({
  recipes,
  onAddRecipe,
  onEditField,
  onCommitField,
  onEditIngredients,
  onAddIngredientRow,
  onDeleteIngredientRow,
  onCommitIngredients,
  onDeleteRecipe,
  onExport,
}: {
  recipes: UserRecipe[];
  onAddRecipe: () => void;
  onEditField: (id: string, field: "name" | "yield_count", value: string | number) => void;
  onCommitField: (id: string, field: "name" | "yield_count") => void;
  onEditIngredients: (id: string, ingredients: UserRecipeIngredient[]) => void;
  onAddIngredientRow: (id: string) => void;
  onDeleteIngredientRow: (id: string, idx: number) => void;
  onCommitIngredients: (id: string) => void;
  onDeleteRecipe: (id: string) => void;
  onExport: () => void;
}) {
  function updateIngredientField(
    recipe: UserRecipe,
    idx: number,
    field: keyof UserRecipeIngredient,
    value: string | number
  ) {
    const next = recipe.ingredients.map((ing, i) => (i === idx ? { ...ing, [field]: value } : ing));
    onEditIngredients(recipe.id, next);
  }

  function confirmDelete(recipe: UserRecipe) {
    if (window.confirm(`Excluir a receita "${recipe.name || "sem nome"}"?`)) {
      onDeleteRecipe(recipe.id);
    }
  }

  return (
    <div>
      {recipes.length === 0 && (
        <div className="empty-note">
          Nenhuma receita ainda. Adicione a primeira abaixo, ou escolha uma pronta na aba
          Sugestões.
        </div>
      )}

      {recipes.map((recipe) => (
        <div className="card" key={recipe.id}>
          <div className="recipe-head">
            <input
              type="text"
              value={recipe.name}
              onChange={(e) => onEditField(recipe.id, "name", e.target.value)}
              onBlur={() => onCommitField(recipe.id, "name")}
            />
            <div className="rend">
              rende{" "}
              <input
                type="number"
                value={recipe.yield_count}
                onChange={(e) => onEditField(recipe.id, "yield_count", parseFloat(e.target.value) || 1)}
                onBlur={() => onCommitField(recipe.id, "yield_count")}
              />{" "}
              marmitas
            </div>
          </div>

          <div className="ing-header">
            <span>Ingrediente</span>
            <span>Qtd</span>
            <span>Unid.</span>
            <span></span>
          </div>
          <div className="ing-list">
            {recipe.ingredients.map((ing, idx) => (
              <div className="ing-row" key={idx}>
                <input
                  type="text"
                  value={ing.name}
                  placeholder="ex: Peito de frango"
                  onChange={(e) => updateIngredientField(recipe, idx, "name", e.target.value)}
                  onBlur={() => onCommitIngredients(recipe.id)}
                />
                <input
                  type="number"
                  step="0.1"
                  value={ing.qty}
                  onChange={(e) => updateIngredientField(recipe, idx, "qty", parseFloat(e.target.value) || 0)}
                  onBlur={() => onCommitIngredients(recipe.id)}
                />
                <input
                  type="text"
                  value={ing.unit}
                  placeholder="g / unid / xíc"
                  onChange={(e) => updateIngredientField(recipe, idx, "unit", e.target.value)}
                  onBlur={() => onCommitIngredients(recipe.id)}
                />
                <button className="rm" onClick={() => onDeleteIngredientRow(recipe.id, idx)}>
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="card-foot">
            <button className="btn ghost small" onClick={() => onAddIngredientRow(recipe.id)}>
              + Ingrediente
            </button>
            <button className="btn ghost small" onClick={() => confirmDelete(recipe)}>
              Excluir receita
            </button>
          </div>
        </div>
      ))}

      <button className="btn ghost wide" onClick={onAddRecipe}>
        + Nova receita
      </button>

      <div className="io-row">
        <button className="btn ghost small" onClick={onExport}>
          ⬇ Exportar receitas (.json)
        </button>
      </div>
    </div>
  );
}
