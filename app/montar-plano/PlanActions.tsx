"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Ported from the prototype's edit-weeks/delete-plan handlers
// (projeto_fenix_app_final.html, ~lines 18912-18945). Editing weeks only
// changes `weeks` — the end date (and the whole generated weekly schedule)
// is always derived from start_date + weeks, never stored separately.
export default function PlanActions({ planId, currentWeeks }: { planId: string; currentWeeks: number }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [weeks, setWeeks] = useState(currentWeeks);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveWeeks() {
    const newWeeks = Math.max(1, Math.min(52, weeks));
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("custom_plans")
      .update({ weeks: newWeeks, updated_at: new Date().toISOString() })
      .eq("id", planId);
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function deletePlan() {
    if (!confirm("Excluir o plano ativo? Isso não apaga seus registros de peso.")) return;
    setSaving(true);
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("custom_plans").delete().eq("id", planId);
    setSaving(false);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <button className="btn ghost" onClick={() => setEditing((v) => !v)}>
        Editar semanas
      </button>{" "}
      <button className="btn ghost" onClick={deletePlan} disabled={saving}>
        Excluir plano
      </button>
      {editing && (
        <div className="fx-plan-edit-row">
          <input
            type="number"
            min={1}
            max={52}
            value={weeks}
            onChange={(e) => setWeeks(parseInt(e.target.value, 10) || 0)}
          />
          <button className="btn" onClick={saveWeeks} disabled={saving}>
            Salvar
          </button>
        </div>
      )}
      {error && (
        <div className="form-error" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}
    </div>
  );
}
