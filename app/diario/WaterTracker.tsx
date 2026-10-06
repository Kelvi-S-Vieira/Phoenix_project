"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Água: tabela `water_logs` (supabase/migration_water_logs.sql), uma linha por
// (profile_id, logged_at), gravada por upsert. A página busca o ml da data e
// passa em `initialMl`. A atualização é otimista; se o upsert falhar (offline,
// migration ainda não aplicada), o valor fica no localStorage do aparelho como
// fallback (`fenix_water_ml_YYYY-MM-DD`), sempre com try/catch.
const STEP = 250;
const fmtL = (ml: number) => (ml / 1000).toFixed(2).replace(/0$/, "").replace(".", ",");

function lsKey(date: string) {
  return `fenix_water_ml_${date}`;
}
function lsRead(date: string): number | null {
  try {
    const v = window.localStorage.getItem(lsKey(date));
    if (v != null) return Math.max(0, Number(v) || 0);
  } catch {
    /* storage indisponível */
  }
  return null;
}
function lsWrite(date: string, ml: number) {
  try {
    window.localStorage.setItem(lsKey(date), String(ml));
  } catch {
    /* ignora */
  }
}
function lsClear(date: string) {
  try {
    window.localStorage.removeItem(lsKey(date));
  } catch {
    /* ignora */
  }
}

export default function WaterTracker({
  profileId,
  date,
  targetMl,
  initialMl,
}: {
  profileId: string;
  date: string;
  targetMl: number;
  initialMl: number | null;
}) {
  // Sem linha no banco: usa o fallback local (ex.: gravado antes da migration).
  const [ml, setMl] = useState<number>(() => initialMl ?? (typeof window === "undefined" ? 0 : lsRead(date) ?? 0));
  const seq = useRef(0);
  const pct = Math.min(100, (ml / targetMl) * 100);

  async function change(next: number) {
    const id = ++seq.current;
    setMl(next);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("water_logs")
        .upsert(
          { profile_id: profileId, logged_at: date, ml: next, updated_at: new Date().toISOString() },
          { onConflict: "profile_id,logged_at" },
        );
      if (error) throw error;
      lsClear(date);
    } catch {
      // Falhou: mantém o valor (otimista) e guarda no aparelho como fallback.
      if (id === seq.current) lsWrite(date, next);
    }
  }

  return (
    <div className="fx-dday-water">
      <button
        type="button"
        className="fx-dday-water-btn"
        onClick={() => change(Math.min(targetMl + 1000, ml + STEP))}
        aria-label={`Registrar ${STEP} ml de água. Hoje: ${fmtL(ml)} de ${fmtL(targetMl)} litros`}
      >
        💧 Toque para registrar água · <b>{fmtL(ml)}</b> / {fmtL(targetMl)} L
      </button>
      {ml > 0 && (
        <button
          type="button"
          className="fx-dday-water-undo"
          onClick={() => change(Math.max(0, ml - STEP))}
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
