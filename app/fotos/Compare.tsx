"use client";

import { useState } from "react";
import type { FotoWithUrl } from "./page";

const POSE_LABELS: Record<string, string> = {
  frente: "Frente",
  lado: "Lado",
  costas: "Costas",
};

function photoLabel(foto: FotoWithUrl) {
  const date = new Date(foto.taken_at + "T00:00:00").toLocaleDateString("pt-BR");
  const pose = foto.pose ? POSE_LABELS[foto.pose] : "—";
  const weight = foto.weight_at_photo != null ? ` · ${foto.weight_at_photo}kg` : "";
  return `${date} · ${pose}${weight}`;
}

export default function Compare({ fotos }: { fotos: FotoWithUrl[] }) {
  // Fotos arrive newest-first from the server; oldest-first reads more
  // naturally as default before/after picks.
  const ordered = [...fotos].reverse();
  const [beforeId, setBeforeId] = useState(ordered[0]?.id ?? "");
  const [afterId, setAfterId] = useState(ordered[ordered.length - 1]?.id ?? "");

  if (fotos.length < 2) {
    return (
      <div className="fx-empty-state">
        Adicione pelo menos 2 fotos na galeria pra comparar.
      </div>
    );
  }

  const before = ordered.find((f) => f.id === beforeId) ?? null;
  const after = ordered.find((f) => f.id === afterId) ?? null;

  return (
    <>
      <div className="row2">
        <div className="field">
          <label>Foto &quot;antes&quot;</label>
          <select value={beforeId} onChange={(e) => setBeforeId(e.target.value)}>
            {ordered.map((f) => (
              <option key={f.id} value={f.id}>
                {photoLabel(f)}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Foto &quot;depois&quot;</label>
          <select value={afterId} onChange={(e) => setAfterId(e.target.value)}>
            {ordered.map((f) => (
              <option key={f.id} value={f.id}>
                {photoLabel(f)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="fx-compare-grid">
        <div className="fx-compare-col">
          {before?.url ? (
            // eslint-disable-next-line @next/next/no-img-element -- signed Storage URL, expires hourly.
            <img src={before.url} alt="antes" />
          ) : (
            <div className="fx-chart-empty">Imagem indisponível</div>
          )}
          <div className="fx-compare-label">{before ? photoLabel(before) : ""}</div>
        </div>
        <div className="fx-compare-col">
          {after?.url ? (
            // eslint-disable-next-line @next/next/no-img-element -- signed Storage URL, expires hourly.
            <img src={after.url} alt="depois" />
          ) : (
            <div className="fx-chart-empty">Imagem indisponível</div>
          )}
          <div className="fx-compare-label">{after ? photoLabel(after) : ""}</div>
        </div>
      </div>
    </>
  );
}
