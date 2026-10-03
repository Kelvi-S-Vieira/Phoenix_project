"use client";

import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { FotoWithUrl } from "./page";
import { formatWeight, type WeightUnit } from "@/lib/weight-unit";

const POSE_LABELS: Record<string, string> = {
  frente: "Frente",
  lado: "Lado",
  costas: "Costas",
};

function photoLabel(foto: FotoWithUrl, unit: WeightUnit) {
  const date = new Date(foto.taken_at + "T00:00:00").toLocaleDateString("pt-BR");
  const pose = foto.pose ? POSE_LABELS[foto.pose] : "—";
  const weight = foto.weight_at_photo != null ? ` · ${formatWeight(foto.weight_at_photo, unit)}` : "";
  return `${date} · ${pose}${weight}`;
}

export default function Compare({
  fotos,
  unit = "kg",
}: {
  fotos: FotoWithUrl[];
  unit?: WeightUnit;
}) {
  // Fotos arrive newest-first from the server; oldest-first reads more
  // naturally as default before/after picks.
  const ordered = [...fotos].reverse();
  const [beforeId, setBeforeId] = useState(ordered[0]?.id ?? "");
  const [afterId, setAfterId] = useState(ordered[ordered.length - 1]?.id ?? "");
  const [pct, setPct] = useState(50);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  if (fotos.length < 2) {
    return (
      <div className="fx-empty-state">
        Adicione pelo menos 2 fotos na galeria pra comparar.
      </div>
    );
  }

  const before = ordered.find((f) => f.id === beforeId) ?? null;
  const after = ordered.find((f) => f.id === afterId) ?? null;

  function setPositionFromClientX(clientX: number) {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const x = clientX - rect.left;
    const next = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPct(next);
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setPositionFromClientX(e.clientX);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    setPositionFromClientX(e.clientX);
  }

  function handlePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    draggingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  function handleWrapClick(e: ReactPointerEvent<HTMLDivElement>) {
    setPositionFromClientX(e.clientX);
  }

  return (
    <>
      <div className="row2">
        <div className="field">
          <label>Foto &quot;antes&quot;</label>
          <select value={beforeId} onChange={(e) => setBeforeId(e.target.value)}>
            {ordered.map((f) => (
              <option key={f.id} value={f.id}>
                {photoLabel(f, unit)}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Foto &quot;depois&quot;</label>
          <select value={afterId} onChange={(e) => setAfterId(e.target.value)}>
            {ordered.map((f) => (
              <option key={f.id} value={f.id}>
                {photoLabel(f, unit)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {before?.url && after?.url ? (
        <>
          <div
            className="fx-slider-wrap"
            ref={wrapRef}
            onPointerDown={handleWrapClick}
          >
            {/* Base layer: "depois" (after), shown in full. */}
            {/* eslint-disable-next-line @next/next/no-img-element -- signed Storage URL, expires hourly. */}
            <img src={after.url} alt="depois" />
            {/* Top layer: "antes" (before), clipped to the left pct% of the
                box so the "depois" layer shows through on the right. This
                matches the original prototype's compare slider. */}
            {/* eslint-disable-next-line @next/next/no-img-element -- signed Storage URL, expires hourly. */}
            <img
              src={before.url}
              alt="antes"
              className="fx-slider-before"
              style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
            />
            <div
              className="fx-slider-handle"
              style={{ left: `${pct}%` }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />
          </div>
          <div className="fx-slider-labels">
            <span>{photoLabel(before, unit)}</span>
            <span>{photoLabel(after, unit)}</span>
          </div>
        </>
      ) : (
        <div className="fx-chart-empty">Imagem indisponível</div>
      )}
    </>
  );
}
