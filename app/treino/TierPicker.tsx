"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TIER_LABELS } from "@/lib/fenix-domain";
import type { Tier } from "@/lib/database.types";
import { TRAINING_LEVELS, ALL_LEVEL_KEYS, levelFilterForLevel, normalizePlan } from "@/lib/treino-avancado-builder";

const TIER_ORDER: Tier[] = [
  "treino-basico",
  "treino-intermediario",
  "treino-avancado",
  "treino-terceira-idade",
];

export default function TierPicker({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState<Tier | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Treino Avançado needs one extra sub-step before saving: which training
  // level ("iniciante"/"intermediario"/"avancado"/"idoso" — distinct from
  // the tier itself) decides the exercise-difficulty filter inside
  // AvancadoBuilder going forward (see Fase 4, migration_avancado_level.sql),
  // instead of a live filter box the user has to manage every session.
  const [pickingAvancadoLevel, setPickingAvancadoLevel] = useState(false);

  async function choose(tier: Tier) {
    if (tier === "treino-avancado") {
      setPickingAvancadoLevel(true);
      setError(null);
      return;
    }
    setSaving(tier);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ current_tier: tier, current_split: null })
      .eq("id", profileId);
    setSaving(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.refresh();
  }

  async function chooseAvancadoWithLevel(level: string) {
    setSaving("treino-avancado");
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        current_tier: "treino-avancado",
        current_split: null,
        avancado_level: level,
        // Seed a single-level filter on top of whatever plan already
        // exists for this profile, matching the level just chosen — a
        // brand-new plan will also pick this up server-side on first load
        // (see AvancadoTreino in app/treino/page.tsx).
      })
      .eq("id", profileId);
    setSaving(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    // Also push the same single-level filter into an existing avancado_plans
    // row's `week.levelFilter`, if one already exists for this profile
    // (e.g. the user is switching back into Avançado after trying another
    // tier). A brand-new plan picks the level up on first load instead (see
    // AvancadoTreino in app/treino/page.tsx).
    const { data: existingPlan } = await supabase
      .from("avancado_plans")
      .select("week")
      .eq("profile_id", profileId)
      .maybeSingle();
    if (existingPlan) {
      const plan = normalizePlan(existingPlan.week);
      const nextWeek = { ...plan, levelFilter: levelFilterForLevel(level) };
      await supabase
        .from("avancado_plans")
        .update({ week: nextWeek as unknown as Record<string, unknown> })
        .eq("profile_id", profileId);
    }
    router.refresh();
  }

  if (pickingAvancadoLevel) {
    return (
      <div>
        <p className="sub" style={{ marginBottom: 12 }}>
          Qual seu nível de experiência? Isso decide quais exercícios aparecem
          por padrão no Treino Avançado — você pode trocar depois.
        </p>
        <div className="choice-grid">
          {ALL_LEVEL_KEYS.map((level) => (
            <div
              key={level}
              className="choice-card"
              onClick={() => chooseAvancadoWithLevel(level)}
              role="button"
            >
              <div className="cc-title">{TRAINING_LEVELS[level]}</div>
            </div>
          ))}
        </div>
        <span
          className="tv-clear-day"
          role="button"
          onClick={() => setPickingAvancadoLevel(false)}
          style={{ display: "inline-block", marginTop: 12 }}
        >
          ← voltar
        </span>
        {saving && <div className="sub" style={{ marginTop: 10 }}>Salvando...</div>}
        {error && <div className="form-error" style={{ marginTop: 10 }}>{error}</div>}
      </div>
    );
  }

  return (
    <div>
      <p className="sub" style={{ marginBottom: 12 }}>
        Você ainda não tem um personal te acompanhando — escolha seu nível
        para começar a treinar por conta própria. Dá pra trocar depois.
      </p>
      <div className="choice-grid">
        {TIER_ORDER.map((tier) => (
          <div
            key={tier}
            className="choice-card"
            onClick={() => choose(tier)}
            role="button"
          >
            <div className="cc-title">{TIER_LABELS[tier]}</div>
          </div>
        ))}
      </div>
      {saving && <div className="sub" style={{ marginTop: 10 }}>Salvando...</div>}
      {error && <div className="form-error" style={{ marginTop: 10 }}>{error}</div>}
    </div>
  );
}
