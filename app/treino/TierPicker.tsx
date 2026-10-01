"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TIER_LABELS } from "@/lib/fenix-domain";
import type { Tier } from "@/lib/database.types";

const TIER_ORDER: Tier[] = ["treino-basico", "treino-intermediario", "treino-avancado"];

export default function TierPicker({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState<Tier | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choose(tier: Tier) {
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
