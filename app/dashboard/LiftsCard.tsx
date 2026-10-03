"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Lift } from "@/lib/database.types";

// Ported from the prototype's renderLifts() (projeto_fenix_app_final.html,
// ~lines 5776-5808): per-lift progress bar (start -> current, clamped
// against an editable goal) plus editable "current"/"goal" number inputs.
// Edits upsert straight to the `lifts` table instead of localStorage.
export default function LiftsCard({
  profileId,
  initialLifts,
}: {
  profileId: string;
  initialLifts: Lift[];
}) {
  const [lifts, setLifts] = useState(initialLifts);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function handleChange(id: string, field: "current_value" | "goal_value", raw: string) {
    const value = parseFloat(raw.replace(",", "."));
    const safeValue = isNaN(value) ? 0 : value;

    setLifts((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: safeValue } : l))
    );
    setSavingId(id);

    const supabase = createClient();
    const update: Partial<Lift> =
      field === "current_value" ? { current_value: safeValue } : { goal_value: safeValue };
    await supabase.from("lifts").update(update).eq("id", id).eq("profile_id", profileId);
    setSavingId(null);
  }

  if (lifts.length === 0) {
    return <div className="sub">Nenhuma carga cadastrada ainda.</div>;
  }

  return (
    <div id="da_liftsWrap">
      {lifts.map((l) => {
        const goal = l.goal_value ?? l.current_value + 10;
        const pct = Math.min(
          ((l.current_value - l.start_value) / (goal - l.start_value || 1)) * 100,
          100
        );
        return (
          <div className="lift" key={l.id}>
            <div className="lift-top">
              <span className="lift-name">{l.name}</span>
              <span className="lift-values">
                {l.start_value}
                {l.unit} → <b>{l.current_value}{l.unit}</b>
              </span>
            </div>
            <div className="lift-track">
              <div className="lift-fill" style={{ width: `${Math.max(pct, 4)}%` }} />
            </div>
            <div className="lift-meta">
              <input
                type="number"
                value={l.current_value}
                disabled={savingId === l.id}
                onChange={(e) => handleChange(l.id, "current_value", e.target.value)}
              />
              <span>meta:</span>
              <input
                type="number"
                value={goal}
                disabled={savingId === l.id}
                onChange={(e) => handleChange(l.id, "goal_value", e.target.value)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
