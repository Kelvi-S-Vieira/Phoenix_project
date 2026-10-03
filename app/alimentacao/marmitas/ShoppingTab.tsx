"use client";

import { useState } from "react";
import type { ShoppingExtra, UserRecipe } from "@/lib/database.types";

interface AggregatedIngredient {
  name: string;
  unit: string;
  qty: number;
}

// Ported from the prototype's `renderShopping()` (projeto_fenix_app_final.html,
// ~lines 15293-15353). Ingredient aggregation (plan[recipeId] * recipe
// .ingredients[].qty, grouped by name+unit) is computed client-side from
// props already in memory — no extra fetch needed. Per-ingredient checked
// state is local-only UI state (the prototype's CHECKED_KEY localStorage
// map) since the data model only persists checked state for shopping_extras,
// not for computed ingredients, which regenerate every time the plan changes.
export default function ShoppingTab({
  recipes,
  plan,
  extras,
  onAddExtra,
  onToggleExtra,
  onDeleteExtra,
}: {
  recipes: UserRecipe[];
  plan: Record<string, number>;
  extras: ShoppingExtra[];
  onAddExtra: (name: string) => void;
  onToggleExtra: (id: string) => void;
  onDeleteExtra: (id: string) => void;
}) {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [extraInput, setExtraInput] = useState("");

  const aggregated = new Map<string, AggregatedIngredient>();
  recipes.forEach((r) => {
    const desired = plan[r.id] || 0;
    if (desired <= 0) return;
    const factor = desired / (r.yield_count || 1);
    r.ingredients.forEach((ing) => {
      if (!ing.name) return;
      const key = `${ing.name.trim().toLowerCase()}|${ing.unit.trim().toLowerCase()}`;
      const existing = aggregated.get(key);
      if (existing) {
        existing.qty += ing.qty * factor;
      } else {
        aggregated.set(key, { name: ing.name, unit: ing.unit, qty: ing.qty * factor });
      }
    });
  });
  const items = Array.from(aggregated.values()).sort((a, b) => a.name.localeCompare(b.name));

  function toggleIngredient(key: string) {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleAddExtra() {
    const name = extraInput.trim();
    if (!name) return;
    onAddExtra(name);
    setExtraInput("");
  }

  return (
    <>
      <div className="card">
        <h2
          style={{
            fontFamily: "'Oswald',sans-serif",
            textTransform: "uppercase",
            fontSize: 15,
            color: "var(--text-muted)",
            margin: "0 0 16px",
          }}
        >
          Ingredientes (calculados a partir do planejamento)
        </h2>
        {items.length === 0 ? (
          <div className="empty-note">
            Defina quantas marmitas quer de cada receita na aba &quot;Planejar semana&quot;.
          </div>
        ) : (
          items.map((item) => {
            const key = `${item.name.toLowerCase()}|${item.unit.toLowerCase()}`;
            const isChecked = checkedIngredients.has(key);
            const qtyDisplay = Number.isInteger(item.qty) ? item.qty : item.qty.toFixed(1);
            return (
              <div
                key={key}
                className={"shop-item" + (isChecked ? " checked" : "")}
                onClick={() => toggleIngredient(key)}
              >
                <div className={"check" + (isChecked ? " on" : "")}>{isChecked ? "✓" : ""}</div>
                <span className="iname">{item.name}</span>
                <span className="iqty">
                  {qtyDisplay} {item.unit}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="card">
        <h2
          style={{
            fontFamily: "'Oswald',sans-serif",
            textTransform: "uppercase",
            fontSize: 15,
            color: "var(--text-muted)",
            margin: "0 0 16px",
          }}
        >
          Outros itens
        </h2>
        {extras.length === 0 && <div className="empty-note">Nenhum item extra adicionado.</div>}
        {extras.map((ex) => (
          <div key={ex.id} className={"shop-item" + (ex.checked ? " checked" : "")}>
            <div
              className={"check" + (ex.checked ? " on" : "")}
              onClick={(e) => {
                e.stopPropagation();
                onToggleExtra(ex.id);
              }}
            >
              {ex.checked ? "✓" : ""}
            </div>
            <span className="iname">{ex.name}</span>
            <button
              className="rm"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteExtra(ex.id);
              }}
            >
              ×
            </button>
          </div>
        ))}
        <div className="extra-add">
          <input
            type="text"
            placeholder="Adicionar item (ex: água, temperos...)"
            value={extraInput}
            onChange={(e) => setExtraInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddExtra();
              }
            }}
          />
          <button className="btn" onClick={handleAddExtra}>
            Adicionar
          </button>
        </div>
      </div>
    </>
  );
}
