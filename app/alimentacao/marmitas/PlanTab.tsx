"use client";

import { useState } from "react";
import type { UserRecipe } from "@/lib/database.types";

// Ported from the prototype's `renderPlan()` (projeto_fenix_app_final.html,
// ~lines 15268-15290). Each input is local-controlled (so typing is
// responsive) and commits the parsed count up to the parent on blur.
export default function PlanTab({
  recipes,
  plan,
  onSetDesiredCount,
}: {
  recipes: UserRecipe[];
  plan: Record<string, number>;
  onSetDesiredCount: (recipeId: string, count: number) => void;
}) {
  const [draft, setDraft] = useState<Record<string, string>>({});

  if (recipes.length === 0) {
    return (
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
          Quantas marmitas desta receita para a semana?
        </h2>
        <div className="empty-note">Cadastre receitas primeiro na aba &quot;Receitas&quot;.</div>
      </div>
    );
  }

  return (
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
        Quantas marmitas desta receita para a semana?
      </h2>
      <div>
        {recipes.map((r) => {
          const value = draft[r.id] ?? String(plan[r.id] ?? 0);
          return (
            <div className="plan-row" key={r.id}>
              <div>
                <div className="rname">{r.name || "(sem nome)"}</div>
                <div className="ryield">rende {r.yield_count} marmitas</div>
              </div>
              <div></div>
              <input
                type="number"
                min={0}
                value={value}
                onChange={(e) => setDraft((prev) => ({ ...prev, [r.id]: e.target.value }))}
                onBlur={(e) => {
                  const count = parseFloat(e.target.value) || 0;
                  onSetDesiredCount(r.id, count);
                  setDraft((prev) => {
                    const next = { ...prev };
                    delete next[r.id];
                    return next;
                  });
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
