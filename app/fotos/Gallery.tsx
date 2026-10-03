"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { FotoWithUrl } from "./page";
import { formatWeight, type WeightUnit } from "@/lib/weight-unit";

const POSE_LABELS: Record<string, string> = {
  frente: "Frente",
  lado: "Lado",
  costas: "Costas",
};

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");
}

export default function Gallery({
  fotos,
  unit = "kg",
}: {
  fotos: FotoWithUrl[];
  unit?: WeightUnit;
}) {
  const router = useRouter();
  const [lightbox, setLightbox] = useState<FotoWithUrl | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(foto: FotoWithUrl) {
    if (!window.confirm("Excluir esta foto?")) return;
    setDeletingId(foto.id);
    const supabase = createClient();

    await supabase.storage.from("progress-photos").remove([foto.storage_path]);
    await supabase.from("progress_photos").delete().eq("id", foto.id);

    setDeletingId(null);
    router.refresh();
  }

  if (fotos.length === 0) {
    return (
      <div className="fx-empty-state">Ainda sem fotos. Adicione a primeira acima.</div>
    );
  }

  return (
    <>
      <div className="fx-gallery-grid">
        {fotos.map((foto) => (
          <div className="fx-photo-tile" key={foto.id}>
            {foto.url ? (
              // eslint-disable-next-line @next/next/no-img-element -- signed Storage URL, expires hourly; not worth a next/image remote-patterns entry.
              <img
                src={foto.url}
                alt={`foto ${foto.taken_at}`}
                onClick={() => setLightbox(foto)}
              />
            ) : (
              <div className="fx-chart-empty" style={{ aspectRatio: "3 / 4" }}>
                Imagem indisponível
              </div>
            )}
            <button
              type="button"
              className="fx-photo-del"
              onClick={() => handleDelete(foto)}
              disabled={deletingId === foto.id}
              aria-label="Excluir foto"
            >
              ×
            </button>
            <div className="fx-photo-meta">
              <div>{formatDate(foto.taken_at)}</div>
              <div>
                <span className="pose">{foto.pose ? POSE_LABELS[foto.pose] : "—"}</span>
                {foto.weight_at_photo != null ? ` · ${formatWeight(foto.weight_at_photo, unit)}` : ""}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={"fx-overlay" + (lightbox ? " open" : "")} onClick={() => setLightbox(null)}>
        <button
          type="button"
          className="fx-overlay-close"
          onClick={() => setLightbox(null)}
          aria-label="Fechar"
        >
          ×
        </button>
        {lightbox && (
          <div onClick={(e) => e.stopPropagation()}>
            {lightbox.url && (
              // eslint-disable-next-line @next/next/no-img-element -- signed Storage URL, expires hourly.
              <img src={lightbox.url} alt="foto" />
            )}
            <div className="fx-overlay-info">
              {formatDate(lightbox.taken_at)}
              {lightbox.pose ? ` · ${POSE_LABELS[lightbox.pose]}` : ""}
              {lightbox.weight_at_photo != null ? ` · ${formatWeight(lightbox.weight_at_photo, unit)}` : ""}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
