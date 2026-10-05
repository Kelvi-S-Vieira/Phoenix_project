"use client";

import { useState } from "react";
import { FOOD_DB } from "@/lib/food-database";

// Shared review sheet (FitCal-style) for the Diário's AI modes ("Foto (IA)",
// "Descrever (IA)") and the barcode mode. The item macros are ALWAYS
// per100 × grams / 100, computed here on every render, so editing grams or the
// portion stepper never needs a round-trip to the API.

export type ReviewMealKey = "cafe" | "almoco" | "lanche" | "jantar" | "ceia";

export const REVIEW_MEALS: { key: ReviewMealKey; label: string }[] = [
  { key: "cafe", label: "Café da manhã" },
  { key: "almoco", label: "Almoço" },
  { key: "lanche", label: "Lanche" },
  { key: "jantar", label: "Jantar" },
  { key: "ceia", label: "Ceia" },
];

/** Shape returned by app/api/diario/estimar (already sanitized server-side). */
export interface AiDishResponse {
  dish_name: string;
  description: string;
  health_score: number;
  meal_type_guess: ReviewMealKey | null;
  items: {
    name: string;
    grams: number;
    kcal_per_100g: number;
    protein_per_100g: number;
    carb_per_100g: number;
    fat_per_100g: number;
    is_packaged_product: boolean;
    source_note: string;
  }[];
}

export interface ReviewItem {
  id: string;
  name: string;
  grams: string; // kept as string so the input can be cleared while typing
  kcal100: number;
  p100: number;
  c100: number;
  f100: number;
  packaged: boolean;
  source: string;
  custom: boolean; // blank ingredient: per-100 g values are user-editable
}

/** A row ready to be inserted into diary_entries (minus profile/date/meal/source). */
export interface ReviewSaveRow {
  food_name: string;
  quantity: number;
  unit: "g";
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
}

let nextId = 0;
function newId(): string {
  return `ri-${Date.now()}-${nextId++}`;
}

export function dishToItems(dish: AiDishResponse): ReviewItem[] {
  return dish.items.map((it) => ({
    id: newId(),
    name: it.name,
    grams: String(Math.round(it.grams)),
    kcal100: it.kcal_per_100g,
    p100: it.protein_per_100g,
    c100: it.carb_per_100g,
    f100: it.fat_per_100g,
    packaged: it.is_packaged_product,
    source: it.source_note,
    custom: false,
  }));
}

function guessMealByHour(): ReviewMealKey {
  const h = new Date().getHours();
  if (h < 10) return "cafe";
  if (h < 15) return "almoco";
  if (h < 18) return "lanche";
  if (h < 22) return "jantar";
  return "ceia";
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function fmtScore(n: number): string {
  return n.toFixed(1).replace(".", ",");
}

function toNum(s: string): number {
  const n = parseFloat(s);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export default function AiEstimateReview({
  dish,
  imageUrl,
  source,
  onSave,
  onCorrect,
  onDiscard,
  saving,
}: {
  dish: AiDishResponse;
  imageUrl?: string | null;
  source: "photo" | "text" | "barcode";
  onSave: (meal: ReviewMealKey, rows: ReviewSaveRow[]) => void;
  /** Re-sends the original photo/text + correction + current list. Omit to hide "Corrigir". */
  onCorrect?: (correction: string, current: AiDishResponse) => Promise<AiDishResponse | null>;
  onDiscard: () => void;
  saving: boolean;
}) {
  const [dishName, setDishName] = useState(dish.dish_name);
  const [description, setDescription] = useState(dish.description);
  const [score, setScore] = useState(dish.health_score);
  const [items, setItems] = useState<ReviewItem[]>(() => dishToItems(dish));
  const [qty, setQty] = useState(1);
  const [meal, setMeal] = useState<ReviewMealKey>(dish.meal_type_guess ?? guessMealByHour());

  const [adding, setAdding] = useState(false);
  const [addQuery, setAddQuery] = useState("");

  const [correcting, setCorrecting] = useState(false);
  const [correctionText, setCorrectionText] = useState("");
  const [correctionBusy, setCorrectionBusy] = useState(false);
  const [correctionError, setCorrectionError] = useState<string | null>(null);

  const [timeLabel] = useState(() =>
    new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  );

  function itemTotals(it: ReviewItem) {
    const g = toNum(it.grams) * qty;
    return {
      grams: g,
      kcal: (it.kcal100 * g) / 100,
      p: (it.p100 * g) / 100,
      c: (it.c100 * g) / 100,
      f: (it.f100 * g) / 100,
    };
  }

  const totals = items.reduce(
    (acc, it) => {
      const t = itemTotals(it);
      return { kcal: acc.kcal + t.kcal, p: acc.p + t.p, c: acc.c + t.c, f: acc.f + t.f };
    },
    { kcal: 0, p: 0, c: 0, f: 0 }
  );

  function updateItem(id: string, patch: Partial<ReviewItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function stepQty(delta: number) {
    setQty((q) => Math.max(0.5, Math.round((q + delta) * 2) / 2));
  }

  const addMatches =
    addQuery.trim().length > 0
      ? FOOD_DB.filter(
          // Only foods stored per gram can be converted to per-100 g; items
          // measured per unit (ovo, fatia...) have no gram weight in the base.
          (f) => f.unit === "g" && f.per > 0 && f.name.toLowerCase().includes(addQuery.trim().toLowerCase())
        ).slice(0, 6)
      : [];

  function addFromDb(f: (typeof FOOD_DB)[number]) {
    const k = 100 / f.per;
    setItems((prev) => [
      ...prev,
      {
        id: newId(),
        name: f.name,
        grams: "100",
        kcal100: round1(f.kcal * k),
        p100: round1(f.protein * k),
        c100: round1(f.carb * k),
        f100: round1(f.fat * k),
        packaged: false,
        source: "base de alimentos",
        custom: false,
      },
    ]);
    setAddQuery("");
    setAdding(false);
  }

  function addBlank() {
    setItems((prev) => [
      ...prev,
      {
        id: newId(),
        name: addQuery.trim(),
        grams: "100",
        kcal100: 0,
        p100: 0,
        c100: 0,
        f100: 0,
        packaged: false,
        source: "informado por você",
        custom: true,
      },
    ]);
    setAddQuery("");
    setAdding(false);
  }

  function currentAsDish(): AiDishResponse {
    return {
      dish_name: dishName.trim() || dish.dish_name,
      description,
      health_score: score,
      meal_type_guess: meal,
      items: items.map((it) => ({
        name: it.name,
        grams: Math.max(1, toNum(it.grams)),
        kcal_per_100g: it.kcal100,
        protein_per_100g: it.p100,
        carb_per_100g: it.c100,
        fat_per_100g: it.f100,
        is_packaged_product: it.packaged,
        source_note: it.source,
      })),
    };
  }

  async function submitCorrection() {
    if (!onCorrect || !correctionText.trim()) return;
    setCorrectionBusy(true);
    setCorrectionError(null);
    const fixed = await onCorrect(correctionText.trim(), currentAsDish());
    setCorrectionBusy(false);
    if (!fixed) {
      setCorrectionError("Não foi possível reanalisar agora. Tente novamente.");
      return;
    }
    setDishName(fixed.dish_name);
    setDescription(fixed.description);
    setScore(fixed.health_score);
    setItems(dishToItems(fixed));
    setQty(1);
    if (fixed.meal_type_guess) setMeal(fixed.meal_type_guess);
    setCorrecting(false);
    setCorrectionText("");
  }

  function handleSave() {
    const valid = items.filter((it) => toNum(it.grams) > 0);
    if (valid.length === 0) return;
    const rows: ReviewSaveRow[] = valid.map((it) => {
      const t = itemTotals(it);
      return {
        // A single-ingredient dish (e.g. a scanned product) keeps the dish name.
        food_name:
          (valid.length === 1 ? dishName.trim() : "") || it.name.trim() || "Item sem nome",
        quantity: round1(t.grams),
        unit: "g",
        kcal: Math.round(t.kcal),
        protein: round1(t.p),
        carb: round1(t.c),
        fat: round1(t.f),
      };
    });
    onSave(meal, rows);
  }

  const scorePct = Math.round((score / 10) * 100);
  const canSave = !saving && items.some((it) => toNum(it.grams) > 0);

  return (
    <div className="fx-aifc">
      <div
        className="fx-aifc-photo"
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
      >
        {!imageUrl && (
          <span className="fx-aifc-photo-icon">{source === "barcode" ? "🏷️" : "🍽️"}</span>
        )}
        <span className="fx-aifc-chip">
          {source === "barcode" ? "🏷️ Open Food Facts" : "🔥 Analisado por IA"}
        </span>
        <span className="fx-aifc-chip">{timeLabel}</span>
      </div>

      <div className="fx-aifc-sheet">
        <div className="fx-aifc-head">
          <input
            type="text"
            className="fx-aifc-title"
            value={dishName}
            onChange={(e) => setDishName(e.target.value)}
            aria-label="Nome do prato"
          />
          <div className="fx-aifc-stepper" aria-label="Quantidade de porções">
            <button type="button" onClick={() => stepQty(-0.5)} disabled={qty <= 0.5} aria-label="Diminuir">
              −
            </button>
            <span>{String(qty).replace(".", ",")}</span>
            <button type="button" onClick={() => stepQty(0.5)} aria-label="Aumentar">
              +
            </button>
          </div>
        </div>

        <div className="fx-aifc-kcal">
          <span className="fx-aifc-kcal-ic">🔥</span>
          <div>
            <small>Calorias</small>
            <b>{Math.round(totals.kcal)}</b> <small className="fx-aifc-inline">kcal</small>
          </div>
        </div>

        <div className="fx-aifc-macros">
          <div className="fx-aifc-macro">
            <small>🍗 Proteína</small>
            <b>{Math.round(totals.p)}g</b>
            <i style={{ background: "var(--danger)" }} />
          </div>
          <div className="fx-aifc-macro">
            <small>🌾 Carboidrato</small>
            <b>{Math.round(totals.c)}g</b>
            <i style={{ background: "var(--gold)" }} />
          </div>
          <div className="fx-aifc-macro">
            <small>🥑 Gordura</small>
            <b>{Math.round(totals.f)}g</b>
            <i style={{ background: "#6aa6e0" }} />
          </div>
        </div>

        {source !== "barcode" && (
          <div className="fx-aifc-health">
            <div className="fx-aifc-row">
              <span>❤️ Pontuação de saúde</span>
              <b>{fmtScore(score)}/10</b>
            </div>
            <div className="fx-aifc-bar">
              <i style={{ width: `${scorePct}%` }} />
            </div>
            {description && <p>{description}</p>}
          </div>
        )}

        <h3 className="fx-aifc-h">
          Ingredientes <span>(ajuste as gramas)</span>
        </h3>
        {items.length === 0 && <div className="fx-aifc-empty">Nenhum ingrediente. Adicione um abaixo.</div>}
        {items.map((it) => {
          const t = itemTotals(it);
          return (
            <div className="fx-aifc-ing" key={it.id}>
              <div className="fx-aifc-ing-top">
                <input
                  type="text"
                  className="fx-aifc-ing-name"
                  value={it.name}
                  placeholder="Nome do ingrediente"
                  onChange={(e) => updateItem(it.id, { name: e.target.value })}
                  aria-label="Nome do ingrediente"
                />
                <em>{Math.round(t.kcal)} kcal</em>
              </div>
              <div className="fx-aifc-ing-bottom">
                <input
                  type="number"
                  min="0"
                  inputMode="decimal"
                  value={it.grams}
                  onChange={(e) => updateItem(it.id, { grams: e.target.value })}
                  aria-label="Gramas"
                />
                <span>g</span>
                <span className="fx-aifc-src">
                  {it.packaged ? "📦 " : ""}
                  {it.source ? `· ${it.source}` : ""}
                </span>
                <button type="button" className="fx-aifc-rm" onClick={() => removeItem(it.id)}>
                  remover
                </button>
              </div>
              {it.custom && (
                <div className="fx-aifc-custom">
                  {(
                    [
                      ["kcal100", "kcal/100 g"],
                      ["p100", "P/100 g"],
                      ["c100", "C/100 g"],
                      ["f100", "G/100 g"],
                    ] as const
                  ).map(([field, label]) => (
                    <label key={field}>
                      <small>{label}</small>
                      <input
                        type="number"
                        min="0"
                        inputMode="decimal"
                        value={it[field] === 0 ? "" : it[field]}
                        placeholder="0"
                        onChange={(e) => updateItem(it.id, { [field]: toNum(e.target.value) })}
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {adding ? (
          <div className="fx-aifc-addbox">
            <input
              type="text"
              autoFocus
              placeholder="Buscar na base (ex: arroz, banana) ou digitar novo"
              value={addQuery}
              onChange={(e) => setAddQuery(e.target.value)}
            />
            {addMatches.map((f) => (
              <button type="button" key={f.name} className="fx-aifc-opt" onClick={() => addFromDb(f)}>
                <span>{f.name}</span>
                <small>{Math.round((f.kcal * 100) / f.per)} kcal/100 g</small>
              </button>
            ))}
            <div className="fx-aifc-addbox-actions">
              <button type="button" className="fx-aifc-link" onClick={addBlank}>
                + Ingrediente em branco{addQuery.trim() ? ` “${addQuery.trim()}”` : ""}
              </button>
              <button
                type="button"
                className="fx-aifc-link fx-aifc-link-muted"
                onClick={() => {
                  setAdding(false);
                  setAddQuery("");
                }}
              >
                cancelar
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="fx-aifc-add" onClick={() => setAdding(true)}>
            + Adicionar ingrediente
          </button>
        )}

        <h3 className="fx-aifc-h">Refeição</h3>
        <div className="fx-aifc-meals">
          {REVIEW_MEALS.map((m) => (
            <button
              type="button"
              key={m.key}
              className={m.key === meal ? "on" : ""}
              onClick={() => setMeal(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>

        {correcting && onCorrect && (
          <div className="fx-aifc-correct">
            <label>O que a IA errou?</label>
            <textarea
              rows={3}
              autoFocus
              placeholder="Ex: era arroz integral, e a porção de frango era menor"
              value={correctionText}
              onChange={(e) => setCorrectionText(e.target.value)}
              disabled={correctionBusy}
            />
            {correctionError && <div className="fx-aifc-error">{correctionError}</div>}
            <div className="fx-aifc-correct-actions">
              <button
                type="button"
                className="btn secondary small"
                onClick={() => setCorrecting(false)}
                disabled={correctionBusy}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn small"
                onClick={submitCorrection}
                disabled={correctionBusy || !correctionText.trim()}
              >
                {correctionBusy ? "Reanalisando..." : "Reanalisar"}
              </button>
            </div>
          </div>
        )}

        <div className="fx-aifc-acts">
          {onCorrect ? (
            <button
              type="button"
              className="fx-aifc-ghost"
              onClick={() => setCorrecting((v) => !v)}
              disabled={saving || correctionBusy}
            >
              ✏️ Corrigir
            </button>
          ) : (
            <button type="button" className="fx-aifc-ghost" onClick={onDiscard} disabled={saving}>
              Descartar
            </button>
          )}
          <button type="button" className="fx-aifc-main" onClick={handleSave} disabled={!canSave}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
        {onCorrect && (
          <button type="button" className="fx-aifc-link fx-aifc-link-muted fx-aifc-discard" onClick={onDiscard}>
            Descartar análise
          </button>
        )}

        <div className="fx-aifc-foot">
          Macros calculados a partir de valores por 100 g × gramas · estimativa, ajuste se necessário
        </div>
      </div>
    </div>
  );
}
