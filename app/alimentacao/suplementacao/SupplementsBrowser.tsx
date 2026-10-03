"use client";

import { useState } from "react";
import {
  SUPPLEMENTS,
  SUPPLEMENT_CATEGORIES,
  GOAL_TO_SUPPLEMENT_CATEGORY,
} from "@/lib/supplements";
import type { Goal } from "@/lib/database.types";

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  SUPPLEMENT_CATEGORIES.filter((c) => c.key !== "all").map((c) => [c.key, c.label])
);

// Ported from the prototype's `suInitCategory()` (projeto_fenix_app_final.html,
// ~lines 15663-15670): pre-select the category matching the profile's goal.
// The prototype also remembered the last manual choice in localStorage
// (`fenix_supl_filter`); this port keeps it simple — session-only state,
// always starting from the goal-based default on page load.
function initialCategory(goal: Goal | null): string {
  if (goal && GOAL_TO_SUPPLEMENT_CATEGORY[goal]) {
    return GOAL_TO_SUPPLEMENT_CATEGORY[goal];
  }
  return "all";
}

export default function SupplementsBrowser({ goal }: { goal: Goal | null }) {
  const [activeCategory, setActiveCategory] = useState(() => initialCategory(goal));

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
