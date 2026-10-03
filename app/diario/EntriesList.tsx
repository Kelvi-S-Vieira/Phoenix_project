"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { DiaryEntry, Meal } from "@/lib/database.types";

const MEALS: { key: Meal; label: string }[] = [
  { key: "cafe", label: "Café da manhã" },
  { key: "almoco", label: "Almoço" },
  { key: "lanche", label: "Lanche" },
  { key: "jantar", label: "Jantar" },
  { key: "extra", label: "Extra" },
];

// Ported from the prototype's renderEntries() (projeto_fenix_app_final.html,
// ~lines 17715-17752): the day's entries grouped by meal, each meal's kcal
// subtotal in its header, with a delete button per entry. A plain delete
// (no confirmation dialog) — matching app/personal/TemplateLibrary.tsx's
// delete pattern, since this is a low-stakes, easily re-added row like a
// template, not a photo (app/fotos/Gallery.tsx does confirm before deleting
// a photo, since that's harder to replace).
export default function EntriesList({ entries }: { entries: DiaryEntry[] }) {
  const router = useRouter();

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("diary_entries").delete().eq("id", id);
    router.refresh();
  }

  if (entries.length === 0) {
    return (
      <div className="fx-chart-empty">Nenhum alimento registrado neste dia ainda.</div>
    );
  }

  const groups = MEALS.map((m) => ({
    meal: m,
    items: entries.filter((e) => e.meal === m.key),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      {groups.map(({ meal, items }) => {
        const kcalSum = items.reduce((s, e) => s + e.kcal, 0);
        return (
          <div className="meal-group" key={meal.key}>
            <div className="meal-group-title">
              <span>{meal.label}</span>
              <span>{kcalSum} kcal</span>
            </div>
            {items.map((e) => (
              <div className="food-entry" key={e.id}>
                <div>
                  <span className="fe-name">{e.food_name}</span>
                  {e.quantity != null && (
                    <span className="fe-qty">
                      {e.quantity}
                      {e.unit === "g" ? "g" : ` ${e.unit}`}
                    </span>
                  )}
                </div>
                <div className="fe-macro">
                  <span>
                    {e.kcal} kcal · P{e.protein}g · C{e.carb || 0}g · G{e.fat || 0}g
                  </span>
                  <button
                    type="button"
                    className="fe-del"
                    onClick={() => handleDelete(e.id)}
                    aria-label={`Remover ${e.food_name}`}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
