"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { todayBR } from "@/lib/date-br";

export default function QuickAddWeight({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [weight, setWeight] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(weight.replace(",", "."));
    if (!value || value <= 0) {
      setError("Informe um peso válido.");
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const today = todayBR();

    const { error: weightError } = await supabase.from("weight_logs").upsert(
      {
        profile_id: profileId,
        weight: value,
        logged_at: today,
      },
      { onConflict: "profile_id,logged_at" }
    );
    if (weightError) {
      setSaving(false);
      setError(weightError.message);
      return;
    }

    await supabase.from("activity_days").upsert(
      { profile_id: profileId, activity_date: today },
      { onConflict: "profile_id,activity_date" }
    );
    await supabase
      .from("profiles")
      .update({ current_weight: value })
      .eq("id", profileId);

    setSaving(false);
    setWeight("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="row2" style={{ alignItems: "end" }}>
      <div className="field" style={{ marginBottom: 0 }}>
        <label>Registrar peso hoje (kg)</label>
        <input
          type="number"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Ex: 78.4"
        />
      </div>
      <button className="btn" type="submit" disabled={saving}>
        {saving ? "Salvando..." : "Registrar"}
      </button>
      {error && <div className="form-error" style={{ gridColumn: "1 / -1" }}>{error}</div>}
    </form>
  );
}
