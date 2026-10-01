"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TIER_LABELS, SPLIT_OPTIONS } from "@/lib/fenix-domain";
import type { Tier, WorkoutTemplate } from "@/lib/database.types";

const TIER_KEYS = Object.keys(TIER_LABELS) as Tier[];

export default function TemplateLibrary({
  personalId,
  templates,
}: {
  personalId: string;
  templates: WorkoutTemplate[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [tier, setTier] = useState<Tier>(TIER_KEYS[0]);
  const [splitKey, setSplitKey] = useState(SPLIT_OPTIONS[TIER_KEYS[0]][0]?.key ?? "");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const splitOptions = useMemo(() => SPLIT_OPTIONS[tier] ?? [], [tier]);

  function handleTierChange(nextTier: Tier) {
    setTier(nextTier);
    const options = SPLIT_OPTIONS[nextTier] ?? [];
    setSplitKey(options[0]?.key ?? "");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !splitKey) {
      setError("Preencha nome, nível e divisão.");
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("workout_templates").insert({
      personal_id: personalId,
      name: name.trim(),
      tier,
      split: splitKey,
      note: note.trim() || null,
    });
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setName("");
    setNote("");
    router.refresh();
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("workout_templates")
      .delete()
      .eq("id", id);
    setDeletingId(null);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      {templates.length === 0 ? (
        <div className="fx-empty-state">Nenhum modelo salvo ainda.</div>
      ) : (
        <div style={{ marginBottom: 18 }}>
          {templates.map((t) => (
            <div key={t.id} className="fx-template-item">
              <div>
                <div className="name">{t.name}</div>
                <div className="meta">
                  {TIER_LABELS[t.tier]} ·{" "}
                  {SPLIT_OPTIONS[t.tier]?.find((s) => s.key === t.split)?.label ?? t.split}
                  {t.note ? ` · ${t.note}` : ""}
                </div>
              </div>
              <button
                type="button"
                className="btn ghost small"
                disabled={deletingId === t.id}
                onClick={() => handleDelete(t.id)}
              >
                {deletingId === t.id ? "Removendo..." : "Remover"}
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleCreate}>
        <div className="field">
          <label>Nome do modelo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Iniciante - Full Body"
          />
        </div>
        <div className="row2">
          <div className="field">
            <label>Nível</label>
            <select value={tier} onChange={(e) => handleTierChange(e.target.value as Tier)}>
              {TIER_KEYS.map((key) => (
                <option key={key} value={key}>
                  {TIER_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Divisão</label>
            <select value={splitKey} onChange={(e) => setSplitKey(e.target.value)}>
              {splitOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label>Nota (opcional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex: foco em técnica nas primeiras semanas"
          />
        </div>
        {error && <div className="form-error">{error}</div>}
        <button className="btn" type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Salvar modelo"}
        </button>
      </form>
    </div>
  );
}
