"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  DEFAULT_FASTING_WINDOW,
  DIETS,
  getDiet,
  macrosForDiet,
  type DietType,
} from "@/lib/diet-types";

function parseWindow(w: string | null | undefined): { start: string; end: string } {
  const re = /^(\d{2}:\d{2})-(\d{2}:\d{2})$/;
  const m = (w ? re.exec(w) : null) ?? re.exec(DEFAULT_FASTING_WINDOW)!;
  return { start: m[1], end: m[2] };
}

// Carrossel de cartões + detalhe + "Seguir esta dieta" (modelo aprovado).
// Ao confirmar, só o profiles é atualizado: o Diário, o Montar Plano e as
// listas de Marmitas/Receitas leem diet_type e as metas P/C/G direto do
// perfil, então nada mais precisa ser recalculado no banco. A meta calórica
// (calorie_target) nunca é alterada aqui.
export default function DietPicker({
  profileId,
  calorieTarget,
  currentDiet,
  currentFastingWindow,
}: {
  profileId: string;
  calorieTarget: number;
  currentDiet: DietType | null;
  currentFastingWindow: string | null;
}) {
  const router = useRouter();
  const [activeDiet, setActiveDiet] = useState<DietType | null>(currentDiet);
  const [preview, setPreview] = useState<DietType>(currentDiet ?? DIETS[0].key);
  const initialWindow = parseWindow(currentFastingWindow);
  const [start, setStart] = useState(initialWindow.start);
  const [end, setEnd] = useState(initialWindow.end);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const d = getDiet(preview)!;
  const m = macrosForDiet(calorieTarget, preview);
  const current = getDiet(activeDiet);
  const isCurrent = activeDiet === preview;
  const isFasting = preview === "jejum";
  const windowValid = !isFasting || (!!start && !!end && start !== end);

  async function apply() {
    if (!windowValid) {
      setError("Informe um horário de início e fim diferentes para a janela de alimentação.");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        diet_type: preview,
        fasting_window: isFasting ? `${start}-${end}` : null,
        protein_target: m.proteinG,
        carb_target: m.carbG,
        fat_target: m.fatG,
      })
      .eq("id", profileId);
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setActiveDiet(preview);
    setSaved(true);
    router.refresh();
  }

  return (
    <>
      <div className="fx-diet-current">
        <span>
          Dieta atual: <b>{current ? `${current.emoji} ${current.label}` : "nenhuma escolhida"}</b>
        </span>
        <span style={{ color: "var(--text-muted)" }}>Meta: {calorieTarget} kcal/dia</span>
      </div>

      <div className="fx-diet-car">
        {DIETS.map((x) => (
          <button
            type="button"
            key={x.key}
            data-diet={x.key}
            className={"fx-diet-card" + (x.key === preview ? " sel" : "")}
            onClick={() => {
              setPreview(x.key);
              setSaved(false);
              setError(null);
            }}
          >
            <span className="fx-diet-card-emoji">{x.emoji}</span>
            <b>{x.label}</b>
            <small>
              {calorieTarget} kcal · {x.split.p}/{x.split.c}/{x.split.f}%
            </small>
          </button>
        ))}
      </div>

      <div className="fx-diet-detail">
        <div className="fx-diet-detail-head">
          <b>
            {d.emoji} {d.label}
          </b>
          {isCurrent && <span className="fx-diet-detail-flag">● sua dieta atual</span>}
        </div>
        <p className="sub" style={{ margin: "6px 0 0" }}>
          {d.description}
        </p>
        <div className="fx-diet-split">
          <i className="p" style={{ width: `${d.split.p}%` }} />
          <i className="c" style={{ width: `${d.split.c}%` }} />
          <i className="f" style={{ width: `${d.split.f}%` }} />
        </div>
        <div className="fx-diet-legend">
          <div className="p">
            Proteína<b>{m.proteinG}g</b>
            {d.split.p}%
          </div>
          <div className="c">
            Carbo<b>{m.carbG}g</b>
            {d.split.c}%
          </div>
          <div className="f">
            Gordura<b>{m.fatG}g</b>
            {d.split.f}%
          </div>
        </div>
        <ul className="fx-diet-rules">
          {d.rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>

        {isFasting && (
          <div className="fx-diet-fasting">
            <div className="fx-plan-desc" style={{ marginBottom: 8 }}>
              Janela de alimentação (fora dela: água, café e chá sem açúcar)
            </div>
            <div className="fx-diet-fasting-row">
              <label htmlFor="fx_fast_start">Das</label>
              <input id="fx_fast_start" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
              <label htmlFor="fx_fast_end">às</label>
              <input id="fx_fast_end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
        )}

        <button
          type="button"
          className="btn fx-diet-go"
          disabled={saving || (isCurrent && !isFasting)}
          onClick={apply}
        >
          {saving ? "Salvando..." : isCurrent ? (isFasting ? "Atualizar janela" : "Dieta atual") : "Seguir esta dieta"}
        </button>
        {error && <div className="form-error" style={{ marginTop: 10 }}>{error}</div>}
        {saved && <div className="fx-diet-ok">Pronto! Suas metas de proteína, carboidrato e gordura foram atualizadas.</div>}
        <div className="fx-diet-note">
          Orientação geral, não substitui nutricionista. Metas recalculadas no Diário e no Montar Plano.
        </div>
      </div>
    </>
  );
}
