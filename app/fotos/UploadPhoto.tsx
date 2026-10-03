"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { todayBR } from "@/lib/date-br";
import type { Pose } from "@/lib/database.types";
import { fromDisplayWeight, type WeightUnit } from "@/lib/weight-unit";

const MAX_DIM = 900; // px, longest side after resize
const JPEG_QUALITY = 0.78;

// Resizes the given image file client-side: draws it onto an off-screen
// canvas scaled down so the longest side is capped at MAX_DIM (never
// upscaled), then re-encodes it as JPEG. Always returns a .jpg, regardless
// of the original file's format, so the caller's extension/filename stays
// consistent with the actual uploaded bytes.
function resizeImageToJpeg(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > MAX_DIM || h > MAX_DIM) {
        if (w >= h) {
          h = Math.round(h * (MAX_DIM / w));
          w = MAX_DIM;
        } else {
          w = Math.round(w * (MAX_DIM / h));
          h = MAX_DIM;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Canvas 2D context indisponível."));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (!blob) {
            reject(new Error("Falha ao gerar imagem redimensionada."));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Falha ao carregar a imagem."));
    };
    img.src = objectUrl;
  });
}

export default function UploadPhoto({
  profileId,
  unit = "kg",
}: {
  profileId: string;
  unit?: WeightUnit;
}) {
  const router = useRouter();
  const [date, setDate] = useState(() => todayBR());
  const [pose, setPose] = useState<Pose>("frente");
  const [weight, setWeight] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
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
      weightValue = fromDisplayWeight(num, unit);
    }

    setSaving(true);
    setError(null);
    const supabase = createClient();

    setOptimizing(true);
    let resized: Blob;
    try {
      resized = await resizeImageToJpeg(file);
    } catch (err) {
      setOptimizing(false);
      setSaving(false);
      setError(err instanceof Error ? err.message : "Falha ao processar a imagem.");
      return;
    }
    setOptimizing(false);

    // Resizing always re-encodes to JPEG, regardless of the original
    // format, so the stored filename reflects the actual uploaded bytes.
    const suffix = crypto.randomUUID().slice(0, 8);
    const path = `${profileId}/${date}-${pose}-${suffix}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("progress-photos")
      .upload(path, resized, { contentType: "image/jpeg" });

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
    setDate(todayBR());
    router.refresh();
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
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
        <label>Peso no dia (opcional, {unit})</label>
        <input
          type="number"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder={unit === "lb" ? "Ex: 172.8" : "Ex: 78.4"}
        />
      </div>
      <div className="field full">
        <label>Foto</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required
        />
      </div>
      {error && (
        <div className="form-error" style={{ gridColumn: "1 / -1" }}>
          {error}
        </div>
      )}
      <div className="field full">
        <button className="btn" type="submit" disabled={saving}>
          {optimizing ? "Otimizando imagem..." : saving ? "Enviando..." : "+ Adicionar foto"}
        </button>
      </div>
    </form>
  );
}
