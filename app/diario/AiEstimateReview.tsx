"use client";

// Shared editable review-list UI for AddFood's two AI modes ("foto" and
// "texto") — both call app/api/diario/estimar and get back the same
// `{ items: [...] }` shape, so this one component renders the editable
// list for either, instead of duplicating the per-row markup twice inside
// AddFood.tsx (see AddFood.tsx's own file-split note for the convention).
export interface AiReviewItem {
  id: string;
  name: string;
  kcal: string;
  protein: string;
  carb: string;
  fat: string;
  included: boolean;
}

let nextId = 0;
export function makeReviewItems(
  items: { name: string; kcal: number; protein: number; carb: number; fat: number }[]
): AiReviewItem[] {
  return items.map((it) => ({
    id: `ai-${Date.now()}-${nextId++}`,
    name: it.name,
    kcal: String(Math.round(it.kcal) || 0),
    protein: String(it.protein ?? 0),
    carb: String(it.carb ?? 0),
    fat: String(it.fat ?? 0),
    included: true,
  }));
}

export default function AiEstimateReview({
  items,
  onChange,
  onConfirm,
  saving,
}: {
  items: AiReviewItem[];
  onChange: (items: AiReviewItem[]) => void;
  onConfirm: () => void;
  saving: boolean;
}) {
  function updateItem(id: string, patch: Partial<AiReviewItem>) {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function removeItem(id: string) {
    onChange(items.filter((it) => it.id !== id));
  }

  const includedCount = items.filter((it) => it.included).length;

  return (
    <div className="fx-ai-review">
      <div className="fx-ai-review-list">
        {items.map((it) => (
          <div key={it.id} className={"fx-ai-review-row" + (it.included ? "" : " fx-ai-review-row-excluded")}>
            <input
              type="checkbox"
              checked={it.included}
              onChange={(e) => updateItem(it.id, { included: e.target.checked })}
              title="Incluir ao adicionar"
            />
            <input
              type="text"
              className="fx-ai-review-name"
              value={it.name}
              onChange={(e) => updateItem(it.id, { name: e.target.value })}
            />
            <input
              type="number"
              className="fx-ai-review-num"
              value={it.kcal}
              onChange={(e) => updateItem(it.id, { kcal: e.target.value })}
              title="Calorias"
            />
            <input
              type="number"
              className="fx-ai-review-num"
              value={it.protein}
              onChange={(e) => updateItem(it.id, { protein: e.target.value })}
              title="Proteína (g)"
            />
            <input
              type="number"
              className="fx-ai-review-num"
              value={it.carb}
              onChange={(e) => updateItem(it.id, { carb: e.target.value })}
              title="Carboidrato (g)"
            />
            <input
              type="number"
              className="fx-ai-review-num"
              value={it.fat}
              onChange={(e) => updateItem(it.id, { fat: e.target.value })}
              title="Gordura (g)"
            />
            <button
              type="button"
              className="fx-ai-review-remove"
              onClick={() => removeItem(it.id)}
              title="Remover"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {items.length === 0 ? (
        <div className="fx-ai-review-empty">Nenhum item identificado.</div>
      ) : (
        <button
          className="btn"
          disabled={saving || includedCount === 0}
          onClick={onConfirm}
        >
          + Adicionar ao diário ({includedCount})
        </button>
      )}
    </div>
  );
}
