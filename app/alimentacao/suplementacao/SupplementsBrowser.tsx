"use client";

import { useState } from "react";
import { SUPPLEMENTS, SUPPLEMENT_CATEGORIES } from "@/lib/supplements";

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  SUPPLEMENT_CATEGORIES.filter((c) => c.key !== "all").map((c) => [c.key, c.label])
);

// The prototype's `suInitCategory()` (projeto_fenix_app_final.html, ~lines
// 15663-15670) pre-selected the category matching the profile's goal
// (GOAL_TO_SUPPLEMENT_CATEGORY in lib/supplements.ts) and remembered the last
// manual choice in localStorage. Per user feedback (2026-10-04) this made the
// page look "stuck" on one category, so it now always starts on "Todos"
// regardless of goal — no `goal` prop needed anymore (dropped cleanly rather
// than kept unused; see the call site in page.tsx).
export default function SupplementsBrowser() {
  const [activeCategory, setActiveCategory] = useState("all");

  const list = SUPPLEMENTS.filter(
    (s) => activeCategory === "all" || s.tags.includes(activeCategory)
  );

  return (
    <>
      <div className="sugg-filters">
        {SUPPLEMENT_CATEGORIES.map((c) => (
          <div
            key={c.key}
            className={"sugg-filter" + (c.key === activeCategory ? " active" : "")}
            onClick={() => setActiveCategory(c.key)}
          >
            {c.label}
          </div>
        ))}
      </div>

      <div className="suggestions-grid sup-grid">
        {list.map((s) => (
          <div className="sup-card" key={s.name}>
            <h4>{s.name}</h4>
            <div className="sup-tags">
              {s.tags.map((t) => (
                <span className="sup-tag" key={t}>
                  {CATEGORY_LABEL[t] ?? t}
                </span>
              ))}
            </div>
            <p className="sup-desc">{s.desc}</p>
            <div className="sup-dose">
              <b>Dosagem / timing</b>
              {s.dose}
            </div>
          </div>
        ))}
      </div>
      {list.length === 0 && (
        <div className="empty-note">Nenhum suplemento nessa categoria ainda.</div>
      )}
    </>
  );
}
