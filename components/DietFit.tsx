"use client";

import { getDiet, type DietType } from "@/lib/diet-types";

/**
 * Small pieces shared by Marmitas (Sugestões), Receitas Fit and the Montar
 * Plano recommendation step to relate a meal to the profile's diet_type
 * (see lib/diet-types.ts `mealFitsDiet`).
 */

/** "Só compatíveis com minha dieta" toggle chip. Render only when a diet is set. */
export function DietFilterToggle({
  diet,
  on,
  onToggle,
}: {
  diet: DietType;
  on: boolean;
  onToggle: () => void;
}) {
  const d = getDiet(diet);
  return (
    <div
      className={"fx-diet-toggle" + (on ? " active" : "")}
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      {d?.emoji} Só compatíveis com minha dieta
    </div>
  );
}

/** Badge for a card: positive for a compatible meal, a soft warning otherwise. */
export function DietFitBadge({ fits, diet }: { fits: boolean; diet: DietType }) {
  const d = getDiet(diet);
  if (fits) return <span className="fx-diet-badge">✅ Combina com sua dieta</span>;
  return <span className="fx-diet-badge no">⚠️ Foge da dieta {d?.label ?? ""}</span>;
}

/** Stable sort: compatible meals first, original order otherwise. */
export function sortByDietFit<T>(items: T[], fits: (item: T) => boolean): T[] {
  return items
    .map((item, idx) => ({ item, idx, ok: fits(item) }))
    .sort((a, b) => (a.ok === b.ok ? a.idx - b.idx : a.ok ? -1 : 1))
    .map((x) => x.item);
}
