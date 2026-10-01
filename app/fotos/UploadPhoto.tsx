"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Pose } from "@/lib/database.types";

function extensionFor(file: File): string {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 5 && /^[a-zA-Z0-9]+$/.test(fromName)) {
    return fromName.toLowerCase();
  }
  const fromType = file.type.split("/").pop();
  return fromType || "jpg";
}

export default function UploadPhoto({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [pose, setPose] = useState<Pose>("frente");
  const [weight, setWeight] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!file) {
      setError("Escolha uma foto.");
      return;
    }

    let weightValue: number | null = null;
    if (weight.trim() !== "") {
      const num = parseFloat(weight.replace(",", "."));
      if (!Number.isFinite(num) || num <= 0) {
        setError("Peso inválido.");
        return;
      }
      weightValue = num;
    }

    setSaving(true);
    setError(null);
    const supabase = createClient();

    const ext = extensionFor(file);
    const suffix = crypto.randomUUID().slice(0, 8);
    const path = `${profileId}/${date}-${pose}-${suffix}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("progress-photos")
      .upload(path, file);

    if (uploadError) {
      setSaving(false);
      setError(uploadError.message);
      return;
    }

    const { error: insertError } = await supabase.from("progress_photos").insert({
      profile_id: profileId,
      storage_path: path,
      taken_at: date,
      pose,
      weight_at_photo: weightValue,
    });

    if (insertError) {
      setSaving(false);
      setError(insertError.message);
      return;
    }

    setSaving(false);
    setFile(null);
    setWeight("");
    setDate(new Date().toISOString().slice(0, 10));
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row2">
        <div className="field">
          <label>Data</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>Ângulo</label>
          <select value={pose} onChange={(e) => setPose(e.target.value as Pose)}>
            <option value="frente">Frente</option>
            <option value="lado">Lado</option>
            <option value="costas">Costas</option>
          </select>
        </div>
        <div className="field">
          <label>Peso no dia (opcional, kg)</label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Ex: 78.4"
          />
        </div>
        <div className="field">
          <label>Foto</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
          />
        </div>
      </div>
      {error && <div className="form-error">{error}</div>}
      <button className="btn" type="submit" disabled={saving}>
        {saving ? "Enviando..." : "+ Adicionar foto"}
      </button>
    </form>
  );
}
