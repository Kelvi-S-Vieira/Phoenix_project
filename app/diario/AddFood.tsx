"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FOOD_DB, type FoodDbItem } from "@/lib/food-database";
import type { Meal } from "@/lib/database.types";

const MEALS: { key: Meal; label: string }[] = [
  { key: "cafe", label: "Café da manhã" },
  { key: "almoco", label: "Almoço" },
  { key: "lanche", label: "Lanche" },
  { key: "jantar", label: "Jantar" },
  { key: "extra", label: "Extra" },
];

type Mode = "db" | "manual";

// Ported from the prototype's "Adicionar alimento" card (meal tabs + mode
// toggle + food-search/manual flows, projeto_fenix_app_final.html,
// ~lines 3867-3892 markup, ~lines 17580-17704 logic). Unlike the prototype
// (one shared module-level `activeMeal`/`selectedFood`), everything here is
// local component state, and both add paths insert into `diary_entries`
// then `router.refresh()` the Server Component page instead of re-rendering
// the entries list by hand.
export default function AddFood({
  profileId,
  selectedDate,
}: {
  profileId: string;
  selectedDate: string;
}) {
  const router = useRouter();
  const [activeMeal, setActiveMeal] = useState<Meal>("cafe");
  const [mode, setMode] = useState<Mode>("db");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- DB search mode ---
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodDbItem | null>(null);
  const [qty, setQty] = useState<string>("");
  const searchWrapRef = useRef<HTMLDivElement>(null);

  const matches =
    query.trim().length > 0
      ? FOOD_DB.filter((f) => f.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8)
      : [];

  function selectFood(food: FoodDbItem) {
    setSelectedFood(food);
    setQuery("");
    setDropdownOpen(false);
    setQty(food.unit === "g" ? "100" : "1");
  }

  function clearSelectedFood() {
    setSelectedFood(null);
    setQty("");
  }

  const qtyNum = parseFloat(qty) || 0;
  const factor = selectedFood ? qtyNum / selectedFood.per : 0;
  const preview = selectedFood
    ? {
        kcal: Math.round(selectedFood.kcal * factor),
        protein: round1(selectedFood.protein * factor),
        carb: round1(selectedFood.carb * factor),
        fat: round1(selectedFood.fat * factor),
      }
    : null;

  async function handleAddDb() {
    if (!selectedFood) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("diary_entries").insert({
      profile_id: profileId,
      logged_at: selectedDate,
      meal: activeMeal,
      food_name: selectedFood.name,
      quantity: qtyNum,
      unit: selectedFood.unit,
      kcal: Math.round(selectedFood.kcal * factor),
      protein: round1(selectedFood.protein * factor),
      carb: round1(selectedFood.carb * factor),
      fat: round1(selectedFood.fat * factor),
      source: "db",
    });
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    clearSelectedFood();
    router.refresh();
  }

  // --- Manual mode ---
  const [manName, setManName] = useState("");
  const [manKcal, setManKcal] = useState("");
  const [manProtein, setManProtein] = useState("");
  const [manCarb, setManCarb] = useState("");
  const [manFat, setManFat] = useState("");

  async function handleAddManual() {
    const name = manName.trim();
    const kcal = parseFloat(manKcal);
    if (!name || isNaN(kcal)) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("diary_entries").insert({
      profile_id: profileId,
      logged_at: selectedDate,
      meal: activeMeal,
      food_name: name,
      quantity: null,
      unit: null,
      kcal: Math.round(kcal),
      protein: parseFloat(manProtein) || 0,
      carb: parseFloat(manCarb) || 0,
      fat: parseFloat(manFat) || 0,
      source: "manual",
    });
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setManName("");
    setManKcal("");
    setManProtein("");
    setManCarb("");
    setManFat("");
    router.refresh();
  }

  return (
    <div>
      <div className="meal-tabs">
        {MEALS.map((m) => (
          <div
            key={m.key}
            className={"meal-tab" + (m.key === activeMeal ? " active" : "")}
            onClick={() => setActiveMeal(m.key)}
          >
            {m.label}
          </div>
        ))}
      </div>

      <div className="entry-mode">
        <div
          className={"mode-btn" + (mode === "db" ? " active" : "")}
          onClick={() => setMode("db")}
        >
          Buscar na lista
        </div>
        <div
          className={"mode-btn" + (mode === "manual" ? " active" : "")}
          onClick={() => setMode("manual")}
        >
          Digitar manualmente
        </div>
      </div>

      {error && (
        <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</div>
      )}

      {mode === "db" && (
        <div>
          <div className="food-search" ref={searchWrapRef}>
            <input
              type="text"
              placeholder="Buscar alimento (ex: frango, arroz, banana...)"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setDropdownOpen(e.target.value.trim().length > 0);
              }}
              onFocus={() => setDropdownOpen(query.trim().length > 0)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
            />
            <div className={"food-dropdown" + (dropdownOpen && matches.length > 0 ? " open" : "")}>
              {matches.map((f) => (
                <div
                  key={f.name}
                  className="food-opt"
                  onMouseDown={() => selectFood(f)}
                >
                  <div>{f.name}</div>
                  <div className="fo-macro">
                    {f.kcal} kcal · {f.protein}g proteína / {f.per}
                    {f.unit === "g" ? "g" : ` ${f.unit}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedFood && (
            <div className="selected-food">
              <div>
                <div className="sf-name">{selectedFood.name}</div>
                <div className="sf-macro">
                  {selectedFood.kcal} kcal / {selectedFood.per}
                  {selectedFood.unit === "g" ? "g" : ` ${selectedFood.unit}`}
                </div>
              </div>
              <button type="button" className="sf-clear" onClick={clearSelectedFood}>
                ×
              </button>
            </div>
          )}

          <div className="row2">
            <div className="field">
              <label>Quantidade</label>
              <input
                type="number"
                step="1"
                placeholder="100"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Unidade</label>
              <select value={selectedFood?.unit ?? ""} disabled>
                {selectedFood && <option value={selectedFood.unit}>{selectedFood.unit}</option>}
              </select>
            </div>
          </div>

          {preview && (
            <div className="computed-preview">
              <span>≈ {preview.kcal} kcal</span>
              <span>P: {preview.protein}g</span>
              <span>C: {preview.carb}g</span>
              <span>G: {preview.fat}g</span>
            </div>
          )}

          <button className="btn" disabled={!selectedFood || saving} onClick={handleAddDb}>
            + Adicionar ao diário
          </button>
        </div>
      )}

      {mode === "manual" && (
        <div>
          <div className="row3">
            <div className="field">
              <label>Nome do alimento</label>
              <input
                type="text"
                placeholder="Ex: Marmita da vovó"
                value={manName}
                onChange={(e) => setManName(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Calorias</label>
              <input
                type="number"
                placeholder="kcal"
                value={manKcal}
                onChange={(e) => setManKcal(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Proteína (g)</label>
              <input
                type="number"
                placeholder="g (opcional)"
                value={manProtein}
                onChange={(e) => setManProtein(e.target.value)}
              />
            </div>
          </div>
          <div className="row2">
            <div className="field">
              <label>Carboidrato (g)</label>
              <input
                type="number"
                placeholder="g (opcional)"
                value={manCarb}
                onChange={(e) => setManCarb(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Gordura (g)</label>
              <input
                type="number"
                placeholder="g (opcional)"
                value={manFat}
                onChange={(e) => setManFat(e.target.value)}
              />
            </div>
          </div>
          <button
            className="btn"
            disabled={saving || !manName.trim() || manKcal.trim() === ""}
            onClick={handleAddManual}
          >
            + Adicionar ao diário
          </button>
        </div>
      )}
    </div>
  );
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
