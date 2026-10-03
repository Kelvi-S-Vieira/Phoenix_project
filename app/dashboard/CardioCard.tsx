"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { WeeklyCardio } from "@/lib/database.types";

const DAY_LABELS = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];
const DAY_KEYS: (keyof Omit<WeeklyCardio, "profile_id" | "updated_at">)[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];

// Ported from the prototype's renderCardio() (projeto_fenix_app_final.html,
// ~lines 5810-5828): 7 clickable day pills, toggled against the
// `weekly_cardio` row for this profile instead of a localStorage array.
// Manual-reset only, same as the prototype — no automatic weekly clear.
export default function CardioCard({
  profileId,
  initialCardio,
}: {
  profileId: string;
  initialCardio: WeeklyCardio;
}) {
  const [cardio, setCardio] = useState(initialCardio);
  const [saving, setSaving] = useState(false);

  async function toggleDay(key: (typeof DAY_KEYS)[number]) {
    const next = { ...cardio, [key]: !cardio[key] };
    setCardio(next);
    setSaving(true);
    const supabase = createClient();
    const update: Partial<WeeklyCardio> = { [key]: next[key] } as Partial<WeeklyCardio>;
    await supabase.from("weekly_cardio").update(update).eq("profile_id", profileId);
    setSaving(false);
  }

  const count = DAY_KEYS.filter((k) => cardio[k]).length;

  return (
    <>
      <div className="cardio-count">
        Meta: <b>4x</b> por semana · 30 min pós-treino{" "}
        <span className="tag" style={{ marginLeft: 8 }}>
          {count}/4
        </span>
      </div>
      <div className="week-grid" aria-busy={saving}>
        {DAY_KEYS.map((key, i) => (
          <div
            key={key}
            className={"day-pill" + (cardio[key] ? " done" : "")}
            onClick={() => toggleDay(key)}
          >
            {DAY_LABELS[i]}
          </div>
        ))}
      </div>
      <div className="cardio-note">
        Clique nos dias em que fez cardio. Reinicia toda segunda-feira (controle manual).
      </div>
    </>
  );
}
