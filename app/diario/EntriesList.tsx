"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { DiaryEntry, Meal } from "@/lib/database.types";

const MEALS: { key: Meal; label: string }[] = [
  { key: "cafe", label: "Café da manhã" },
  { key: "almoco", label: "Almoço" },
  { key: "lanche", label: "Lanche" },
  { key: "jantar", label: "Jantar" },
  { key: "ceia", label: "Ceia" },
  { key: "extra", label: "Extra" },
];

// Ported from the prototype's renderEntries() (projeto_fenix_app_final.html,
// ~lines 17715-17752): the day's entries grouped by meal, each meal's kcal
// subtotal in its header, with a delete button per entry. A plain delete
// (no confirmation dialog) — matching app/personal/TemplateLibrary.tsx's
// delete pattern, since this is a low-stakes, easily re-added row like a
// template, not a photo (app/fotos/Gallery.tsx does confirm before deleting
// a photo, since that's harder to replace).
// pt-BR number, at most 1 decimal, no trailing zero ("13,3", "6", "0,5").
function fmt(n: number | null | undefined): string {
  const v = Math.round((n ?? 0) * 10) / 10;
  return v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

// Three labeled macro chips (colored dot + name + grams) — replaces the old
// one-line "P13.3g · C1.3g · G15.2g" string, which wasn't readable at a
// glance (user feedback 2026-10-05). Same colors as the Diário's macro cards.
function MacroChips({ protein, carb, fat, small }: { protein: number; carb: number; fat: number; small?: boolean }) {
  return (
    <div className={"fe2-chips" + (small ? " small" : "")}>
      <span className="fe2-chip p">
        <i /> Proteína <b>{fmt(protein)} g</b>
      </span>
      <span className="fe2-chip c">
        <i /> Carbo <b>{fmt(carb)} g</b>
      </span>
      <span className="fe2-chip f">
        <i /> Gordura <b>{fmt(fat)} g</b>
      </span>
    </div>
  );
}

export default function EntriesList({ entries }: { entries: DiaryEntry[] }) {
  const router = useRouter();

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("diary_entries").delete().eq("id", id);
    router.refresh();
  }

  function addTo(meal: Meal) {
    window.dispatchEvent(new CustomEvent<Meal>("fx-add-meal", { detail: meal }));
  }

  // Grupos vazios aparecem com o "+" (exceto "Extra", legado: só se tiver itens).
  const groups = MEALS.map((m) => ({
    meal: m,
    items: entries.filter((e) => e.meal === m.key),
  })).filter((g) => g.items.length > 0 || g.meal.key !== "extra");

  return (
    <div>
      {groups.map(({ meal, items }) => {
        const kcalSum = items.reduce((s, e) => s + e.kcal, 0);
        return (
          <div className="meal-group" key={meal.key}>
            <div className="meal-group-title">
              <span>{meal.label}</span>
              <span className="fx-mealplus-right">
                <span>{Math.round(kcalSum)} kcal</span>
                <button
                  type="button"
                  className="fx-mealplus-btn"
                  onClick={() => addTo(meal.key)}
                  aria-label={`Adicionar alimento em ${meal.label}`}
                  title={`Adicionar em ${meal.label}`}
                >
                  +
                </button>
              </span>
            </div>
            {items.length === 0 ? (
              <div className="fx-mealplus-empty">Nada registrado ainda.</div>
            ) : (
              <MacroChips
                small
                protein={items.reduce((a, e) => a + (e.protein || 0), 0)}
                carb={items.reduce((a, e) => a + (e.carb || 0), 0)}
                fat={items.reduce((a, e) => a + (e.fat || 0), 0)}
              />
            )}
            {items.map((e) => (
              <div className="food-entry fe2" key={e.id}>
                <div className="fe2-top">
                  <div className="fe2-name">
                    <span className="fe-name">{e.food_name}</span>
                    {e.quantity != null && (
                      <span className="fe-qty">
                        {fmt(e.quantity)}
                        {e.unit === "g" ? " g" : ` ${e.unit}`}
                      </span>
                    )}
                  </div>
                  <div className="fe2-kcal">
                    <b>{Math.round(e.kcal)}</b> kcal
                  </div>
                  <button
                    type="button"
                    className="fe-del"
                    onClick={() => handleDelete(e.id)}
                    aria-label={`Remover ${e.food_name}`}
                  >
                    ×
                  </button>
                </div>
                <MacroChips protein={e.protein || 0} carb={e.carb || 0} fat={e.fat || 0} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
