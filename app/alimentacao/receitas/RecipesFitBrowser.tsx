"use client";

import { useState } from "react";
import { SUPPLEMENT_RECIPES, SUPPLEMENT_RECIPE_GOALS } from "@/lib/supplement-recipes";

export default function RecipesFitBrowser() {
  const [activeGoal, setActiveGoal] = useState("all");

  const list = SUPPLEMENT_RECIPES.filter((r) => activeGoal === "all" || r.goal === activeGoal);

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

      <div className="suggestions-grid rs-grid">
        {list.map((r) => {
          const unitLabel = r.yield === 1 ? "porção" : "porções";
          return (
            <div className="rs-card" key={r.name}>
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
