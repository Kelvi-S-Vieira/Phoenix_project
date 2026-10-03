"use client";

import { useState } from "react";
import { MARMITA_CATEGORIES, MARMITA_SUGGESTIONS, type MarmitaSuggestion } from "@/lib/marmita-suggestions";

// Ported from the prototype's `renderSuggestions()`/`renderSuggestionFilters()`
// (projeto_fenix_app_final.html, ~lines 15020-15078). "Added" state is kept
// per-card (by suggestion name) just for this render, like the prototype's
// disabled "✓ Adicionada" button — it resets on tab switch, which is fine
// since the suggestion can always be re-added (it has no identity to reuse).
export default function SuggestionsTab({ onAdd }: { onAdd: (s: MarmitaSuggestion) => void }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [onlyFast, setOnlyFast] = useState(false);
  const [added, setAdded] = useState<Set<string>>(new Set());

  const list = MARMITA_SUGGESTIONS.filter(
    (s) => activeCategory === "all" || s.category === activeCategory
  ).filter((s) => !onlyFast || s.fast === true);

  function handleAdd(s: MarmitaSuggestion) {
    onAdd(s);
    setAdded((prev) => new Set(prev).add(s.name));
  }

  return (
    <div>
      <div className="sub" style={{ marginBottom: 12 }}>
        Ideias de marmita proteica prontas, com kcal/proteína estimados e modo de preparo.
        Clique em &quot;Adicionar&quot; pra jogar direto na sua lista de receitas.{" "}
        <b style={{ color: "var(--gold)" }}>Os valores nutricionais são médias aproximadas</b> —
        variam com marca, corte e preparo; ajuste conforme sua meta de kcal/proteína do dia.
      </div>

      <div className="sugg-filters">
        {MARMITA_CATEGORIES.map((c) => (
          <div
            key={c.key}
            className={"sugg-filter" + (c.key === activeCategory ? " active" : "")}
            onClick={() => setActiveCategory(c.key)}
          >
            {c.label}
          </div>
        ))}
      </div>

      <div className="sugg-fast-toggle-wrap">
        <div
          className={"sugg-fast-toggle" + (onlyFast ? " active" : "")}
          onClick={() => setOnlyFast((v) => !v)}
        >
          ⚡ Só rápidas (&lt;15 min)
        </div>
      </div>

      <div className="suggestions-grid">
        {list.map((s) => {
          const unitLabel =
            s.yield === 1
              ? "porção"
              : s.category === "lanche" || s.category === "sanduiche" || s.category === "sobremesa"
                ? "porções"
                : "marmitas";
          const isAdded = added.has(s.name);
          return (
            <div className="sugg-card" key={s.name}>
              <div className="sugg-card-head">
                <h4>{s.name}</h4>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  {s.fast && <span className="sugg-fast-badge">⚡ Rápida</span>}
                  {s.vegan && <span className="sugg-vegan-badge">🌱 Vegano</span>}
                </div>
              </div>
              <div className="sugg-yield">
                rende {s.yield} {unitLabel}
              </div>
              <div className="sugg-macro">
                ~{s.kcal} kcal · ~{s.protein}g proteína{" "}
                <span>por {unitLabel === "porções" ? "porção" : unitLabel.replace(/s$/, "")}</span>
              </div>
              <ul>
                {s.ingredients.map((i, idx) => (
                  <li key={idx}>
                    <b>
                      {i.qty}
                      {i.unit ? ` ${i.unit}` : ""}
                    </b>{" "}
                    {i.name}
                  </li>
                ))}
              </ul>
              <div className="sugg-prep">
                <span className="prep-label">Modo de preparo</span>
                <ol>
                  {s.prep.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ol>
              </div>
              <button className="btn small" disabled={isAdded} onClick={() => handleAdd(s)}>
                {isAdded ? "✓ Adicionada" : "+ Adicionar à minha lista"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
