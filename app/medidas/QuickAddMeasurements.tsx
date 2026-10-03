"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { todayBR } from "@/lib/date-br";
import { MEASUREMENT_FIELDS } from "@/lib/fenix-domain";

export default function QuickAddMeasurements({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(key: string, raw: string) {
    setValues((prev) => ({ ...prev, [key]: raw }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Only fields the user actually filled in are saved, matching the
    // prototype's partial-measurement-entry approach.
    const parsed: Record<string, number> = {};
    for (const field of MEASUREMENT_FIELDS) {
      const raw = values[field.key];
      if (raw == null || raw.trim() === "") continue;
      const num = parseFloat(raw.replace(",", "."));
      if (!Number.isFinite(num) || num <= 0) {
        setError(`Valor inválido para ${field.label}.`);
        return;
      }
      parsed[field.key] = num;
    }

    if (Object.keys(parsed).length === 0) {
      setError("Preencha ao menos uma medida.");
      return;
    }

    setSaving(true);
    setError(null);
    const supabase = createClient();
    const today = todayBR();

    // Fetch today's existing row (if any) so we merge new values into it
    // instead of wiping fields the user didn't touch today.
    const { data: existing, error: fetchError } = await supabase
      .from("measurements")
      .select("values")
      .eq("profile_id", profileId)
      .eq("logged_at", today)
      .maybeSingle();

    if (fetchError) {
      setSaving(false);
      setError(fetchError.message);
      return;
    }

    const merged = { ...(existing?.values ?? {}), ...parsed };

    const { error: upsertError } = await supabase.from("measurements").upsert(
      {
        profile_id: profileId,
        logged_at: today,
        values: merged,
      },
      { onConflict: "profile_id,logged_at" }
    );

    if (upsertError) {
      setSaving(false);
      setError(upsertError.message);
      return;
    }

    // Measurements alone must NOT count as an "activity day" for streak/
    // badge purposes — only weight check-ins and checked workout exercises
    // do. See lib/badges.ts / lib/streak.ts.

    setSaving(false);
    setValues({});
    router.refresh();
  }

  return (
    <form className="entry-form" onSubmit={handleSubmit}>
      {MEASUREMENT_FIELDS.map((field) => (
        <div className="field" key={field.key}>
          <label>
            {field.label} ({field.unit})
          </label>
          <input
            type="number"
            step="0.1"
            value={values[field.key] ?? ""}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder="Ex: 82.5"
          />
        </div>
      ))}
      {error && (
        <div className="form-error" style={{ gridColumn: "1 / -1" }}>
          {error}
        </div>
      )}
      <div className="form-foot">
        <button className="btn" type="submit" disabled={saving}>
          {saving ? "Salvando..." : "+ Registrar medidas"}
        </button>
      </div>
    </form>
  );
}
