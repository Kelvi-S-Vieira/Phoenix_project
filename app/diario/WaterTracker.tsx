"use client";

import { useSyncExternalStore } from "react";

// Água: o schema (lib/database.types.ts) NÃO tem tabela/coluna de água
// (diary_entries só guarda alimentos), então o consumo do dia fica no
// localStorage do aparelho, por data (`fenix_water_ml_YYYY-MM-DD`), com
// try/catch (modo privado/storage bloqueado = funciona só na sessão atual
// via cache em memória). Se o schema ganhar uma tabela de água, troque
// read/write abaixo por chamadas ao Supabase.
const EVT = "fx-water-change";
const mem = new Map<string, number>();

function key(date: string) {
  return `fenix_water_ml_${date}`;
}
function read(date: string): number {
  try {
    const v = window.localStorage.getItem(key(date));
    if (v != null) return Math.max(0, Number(v) || 0);
  } catch {
    /* storage indisponível */
  }
  return mem.get(date) ?? 0;
}
function write(date: string, ml: number) {
  mem.set(date, ml);
  try {
    window.localStorage.setItem(key(date), String(ml));
  } catch {
    /* ignora */
  }
  window.dispatchEvent(new Event(EVT));
}
function subscribe(cb: () => void) {
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
}

const STEP = 250;
const fmtL = (ml: number) => (ml / 1000).toFixed(2).replace(/0$/, "").replace(".", ",");

export default function WaterTracker({ date, targetMl }: { date: string; targetMl: number }) {
  const ml = useSyncExternalStore(
    subscribe,
    () => read(date),
    () => 0,
  );
  const pct = Math.min(100, (ml / targetMl) * 100);

  return (
    <div className="fx-dday-water">
      <button
        type="button"
        className="fx-dday-water-btn"
        onClick={() => write(date, Math.min(targetMl + 1000, ml + STEP))}
        aria-label={`Registrar ${STEP} ml de água. Hoje: ${fmtL(ml)} de ${fmtL(targetMl)} litros`}
      >
        💧 Toque para registrar água · <b>{fmtL(ml)}</b> / {fmtL(targetMl)} L
      </button>
      {ml > 0 && (
        <button
          type="button"
          className="fx-dday-water-undo"
          onClick={() => write(date, Math.max(0, ml - STEP))}
          aria-label={`Remover ${STEP} ml de água`}
        >
          −
        </button>
      )}
      <div className="fx-dday-water-track" aria-hidden="true">
        <i style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
