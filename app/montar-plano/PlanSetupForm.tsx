"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DIET_OPTIONS } from "@/lib/plan-generation";
import { TIER_LABELS, SPLIT_OPTIONS } from "@/lib/fenix-domain";
import type { Tier } from "@/lib/database.types";
import { todayBR } from "@/lib/date-br";

const TIER_ORDER: Tier[] = ["treino-basico", "treino-intermediario", "treino-avancado"];

// Ported from the prototype's `createPlan()` (projeto_fenix_app_final.html,
// ~line 18892): weeks are clamped 1-52, startDate = now.
export default function PlanSetupForm({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [weeks, setWeeks] = useState(12);
  const [diet, setDiet] = useState(DIET_OPTIONS[0].key);
  const [tier, setTier] = useState<Tier>(TIER_ORDER[0]);
  const [split, setSplit] = useState(SPLIT_OPTIONS[TIER_ORDER[0]][0].key);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTierChange(nextTier: Tier) {
    setTier(nextTier);
    setSplit(SPLIT_OPTIONS[nextTier][0]?.key ?? "");
  }

  async function createPlan() {
    setSaving(true);
    setError(null);
    const clampedWeeks = Math.max(1, Math.min(52, weeks || 12));
    const supabase = createClient();

    // One active plan per profile, enforced here rather than a DB
    // constraint (see supabase/migration_plano.sql): refuse to create a
    // second plan while one already exists.
    const { data: existing } = await supabase
      .from("custom_plans")
      .select("id")
      .eq("profile_id", profileId)
      .maybeSingle();
    if (existing) {
      setSaving(false);
      setError("Você já tem um plano ativo. Exclua-o antes de criar outro.");
      router.refresh();
      return;
    }

    const { error: insertError } = await supabase.from("custom_plans").insert({
      profile_id: profileId,
      weeks: clampedWeeks,
      diet_choice: diet,
      tier,
      split,
      start_date: todayBR(),
    });
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    router.refresh();
  }

  const dietDesc = DIET_OPTIONS.find((d) => d.key === diet)?.desc ?? "";

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Novo plano</h2>

      <div className="field">
        <label htmlFor="mp_weeks">Duração (semanas)</label>
        <input
          type="number"
          id="mp_weeks"
          min={1}
          max={52}
          value={weeks}
          onChange={(e) => setWeeks(parseInt(e.target.value, 10) || 0)}
        />
      </div>

      <div className="field">
        <label htmlFor="mp_diet">Abordagem nutricional</label>
        <select id="mp_diet" value={diet} onChange={(e) => setDiet(e.target.value)}>
          {DIET_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="fx-plan-desc">{dietDesc}</div>
      </div>

      <div className="field">
        <label htmlFor="mp_tier">Nível de treino</label>
        <select id="mp_tier" value={tier} onChange={(e) => handleTierChange(e.target.value as Tier)}>
          {TIER_ORDER.map((t) => (
            <option key={t} value={t}>
              {TIER_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="mp_split">Split</label>
        <select id="mp_split" value={split} onChange={(e) => setSplit(e.target.value)}>
          {SPLIT_OPTIONS[tier].map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <button className="btn" onClick={createPlan} disabled={saving}>
        {saving ? "Criando..." : "Criar plano"}
      </button>
      {error && (
        <div className="form-error" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}
    </div>
  );
}
