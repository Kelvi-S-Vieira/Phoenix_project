import type { DiaryEntry } from "@/lib/database.types";

interface Targets {
  kcal: number | null;
  protein: number | null;
  carb: number | null;
  fat: number | null;
}

const CARDS: {
  key: "protein" | "carb" | "fat";
  label: string;
  emoji: string;
  color: string;
}[] = [
  { key: "protein", label: "Proteína", emoji: "🍗", color: "var(--danger)" },
  { key: "carb", label: "Carboidrato", emoji: "🌾", color: "var(--gold)" },
  { key: "fat", label: "Gordura", emoji: "🥑", color: "#6aa6e0" },
];

// Cards de macros "consumido /meta" com barra (modelo-diario-dieta). As
// calorias agora ficam no medidor FlameBar; aqui só os três macros.
export default function SummaryCards({
  entries,
  targets,
}: {
  entries: DiaryEntry[];
  targets: Targets;
}) {
  const totals = {
    protein: round1(entries.reduce((s, e) => s + e.protein, 0)),
    carb: round1(entries.reduce((s, e) => s + e.carb, 0)),
    fat: round1(entries.reduce((s, e) => s + e.fat, 0)),
  };
  return (
    <div className="fx-dday-macros">
      {CARDS.map((c) => {
        const target = targets[c.key];
        const total = totals[c.key];
        const pct = target ? Math.min((total / target) * 100, 100) : 0;
        return (
          <div className="fx-dday-m" key={c.key}>
            <small>
              {c.emoji} {c.label}
            </small>
            <b>
              {total}
              <s>g /{target ? `${target}g` : "—"}</s>
            </b>
            <div
              className="fx-dday-bar"
              role="progressbar"
              aria-label={c.label}
              aria-valuemin={0}
              aria-valuemax={target ?? 0}
              aria-valuenow={total}
            >
              <i style={{ width: `${pct}%`, background: c.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
