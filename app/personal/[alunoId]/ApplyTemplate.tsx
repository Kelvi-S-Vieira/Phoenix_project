"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TIER_LABELS, SPLIT_OPTIONS } from "@/lib/fenix-domain";
import type { WorkoutTemplate } from "@/lib/database.types";

export default function ApplyTemplate({
  alunoId,
  templates,
}: {
  alunoId: string;
  templates: WorkoutTemplate[];
}) {
  const router = useRouter();
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    const template = templates.find((t) => t.id === templateId);
    if (!template) {
      setError("Selecione um modelo.");
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ current_tier: template.tier, current_split: template.split })
      .eq("id", alunoId);
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.refresh();
  }

  if (templates.length === 0) {
    return (
      <div className="fx-empty-state">
        Você ainda não salvou nenhum modelo na Biblioteca de treinos.
      </div>
    );
  }

  return (
    <form onSubmit={handleApply} className="row2" style={{ alignItems: "end" }}>
      <div className="field" style={{ marginBottom: 0 }}>
        <label>Aplicar modelo</label>
        <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} · {TIER_LABELS[t.tier]} ·{" "}
              {SPLIT_OPTIONS[t.tier]?.find((s) => s.key === t.split)?.label ?? t.split}
            </option>
          ))}
        </select>
      </div>
      <button className="btn" type="submit" disabled={saving}>
        {saving ? "Aplicando..." : "Aplicar"}
      </button>
      {error && <div className="form-error" style={{ gridColumn: "1 / -1" }}>{error}</div>}
    </form>
  );
}
