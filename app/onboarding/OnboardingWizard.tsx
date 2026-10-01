"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { todayBR } from "@/lib/date-br";
import {
  ACTIVITY_LEVELS,
  GOALS,
  computeTargets,
} from "@/lib/fenix-domain";
import type { ActivityLevel, Goal } from "@/lib/database.types";

const TOTAL_STEPS = 5;

interface WizardState {
  sex: "M" | "F" | "";
  age: string;
  height: string;
  weight: string;
  activity: ActivityLevel | "";
  goal: Goal | "";
  targetWeight: string;
  timeframeWeeks: string;
}

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<WizardState>({
    sex: "",
    age: "",
    height: "",
    weight: "",
    activity: "",
    goal: "",
    targetWeight: "",
    timeframeWeeks: "",
  });

  function update<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function canAdvance(): boolean {
    if (step === 1) return !!(state.sex && state.age && state.height && state.weight);
    if (step === 2) return !!state.activity;
    if (step === 3) return !!state.goal;
    if (step === 4) return !!state.targetWeight;
    return true;
  }

  const pctPerWeek = (() => {
    const w = parseFloat(state.weight);
    const t = parseFloat(state.targetWeight);
    const wk = parseFloat(state.timeframeWeeks);
    if (w && t && wk && wk > 0) return (Math.abs(w - t) / wk / w) * 100;
    return null;
  })();

  const targets =
    state.sex && state.age && state.height && state.weight && state.activity && state.goal
      ? computeTargets({
          weight: parseFloat(state.weight),
          height: parseFloat(state.height),
          age: parseFloat(state.age),
          sex: state.sex,
          activity: state.activity,
          goal: state.goal,
          pctPerWeek,
        })
      : null;

  async function handleSave() {
    if (!targets || !state.sex || !state.goal || !state.activity) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const today = todayBR();

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        sex: state.sex,
        age: parseInt(state.age, 10),
        height: parseFloat(state.height),
        current_weight: parseFloat(state.weight),
        target_weight: parseFloat(state.targetWeight),
        activity_level: state.activity,
        goal: state.goal,
        calorie_target: targets.calorieTarget,
        protein_target: targets.proteinG,
        onboarding_completed: true,
      })
      .eq("id", user.id);

    if (profileError) {
      setSaving(false);
      setError(profileError.message);
      return;
    }

    await supabase.from("weight_logs").insert({
      profile_id: user.id,
      weight: parseFloat(state.weight),
      logged_at: today,
    });
    await supabase.from("activity_days").upsert(
      { profile_id: user.id, activity_date: today },
      { onConflict: "profile_id,activity_date" }
    );

    setSaving(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <>
      <div className="fx-top">
        <div className="eyebrow">Fênix · Definir objetivo</div>
        <h1>
          {step === 1 && "Dados básicos"}
          {step === 2 && "Nível de atividade"}
          {step === 3 && "Objetivo principal"}
          {step === 4 && "Sua meta"}
          {step === 5 && "Seu plano calculado"}
        </h1>
        <div className="sub">5 passos rápidos pra calcular sua meta calórica, proteína e ritmo.</div>
      </div>

      <div className="progress-steps">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={
              "step-dot" +
              (i + 1 < step ? " done" : i + 1 === step ? " current" : "")
            }
          />
        ))}
      </div>

      <div className="card">
        {error && <div className="form-error">{error}</div>}

        {step === 1 && (
          <>
            <div className="field">
              <label>Sexo biológico</label>
              <div className="choice-grid cols2">
                <div
                  className={"choice-card" + (state.sex === "M" ? " selected" : "")}
                  onClick={() => update("sex", "M")}
                >
                  <div className="cc-title">Masculino</div>
                </div>
                <div
                  className={"choice-card" + (state.sex === "F" ? " selected" : "")}
                  onClick={() => update("sex", "F")}
                >
                  <div className="cc-title">Feminino</div>
                </div>
              </div>
            </div>
            <div className="row2">
              <div className="field">
                <label>Idade</label>
                <input
                  type="number"
                  value={state.age}
                  onChange={(e) => update("age", e.target.value)}
                />
              </div>
              <div className="field">
                <label>Altura (cm)</label>
                <input
                  type="number"
                  value={state.height}
                  onChange={(e) => update("height", e.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label>Peso atual (kg)</label>
              <input
                type="number"
                step="0.1"
                value={state.weight}
                onChange={(e) => update("weight", e.target.value)}
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="sub" style={{ marginBottom: 14 }}>
              Considere trabalho + exercício combinados — seja realista, não otimista.
            </div>
            <div className="choice-grid">
              {ACTIVITY_LEVELS.map((a) => (
                <div
                  key={a.key}
                  className={"choice-card" + (state.activity === a.key ? " selected" : "")}
                  onClick={() => update("activity", a.key)}
                >
                  <div className="cc-title">{a.title}</div>
                  <div className="cc-desc">{a.desc}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="sub" style={{ marginBottom: 14 }}>
              Isso define como calculamos suas calorias e proteína.
            </div>
            <div className="choice-grid">
              {GOALS.map((g) => (
                <div
                  key={g.key}
                  className={"choice-card" + (state.goal === g.key ? " selected" : "")}
                  onClick={() => update("goal", g.key)}
                >
                  <div className="cc-title">{g.title}</div>
                  <div className="cc-desc">{g.desc}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="sub" style={{ marginBottom: 14 }}>
              {state.goal === "manter"
                ? "Como o objetivo é manter, o prazo não é obrigatório."
                : "Isso define o ritmo do seu plano."}
            </div>
            <div className="field">
              <label>Peso alvo (kg)</label>
              <input
                type="number"
                step="0.1"
                value={state.targetWeight}
                onChange={(e) => update("targetWeight", e.target.value)}
              />
            </div>
            <div className="field">
              <label>Prazo (semanas)</label>
              <input
                type="number"
                value={state.timeframeWeeks}
                onChange={(e) => update("timeframeWeeks", e.target.value)}
              />
            </div>
            {pctPerWeek !== null && (
              <div
                className={pctPerWeek > 1.2 ? "form-error" : "form-success"}
                style={{ marginTop: 4 }}
              >
                Ritmo: ~{pctPerWeek.toFixed(2)}%/semana
                {pctPerWeek > 1.2
                  ? " — prazo muito curto, considere um período mais longo."
                  : pctPerWeek > 0.7
                    ? " — ritmo agressivo, preste atenção à proteína e ao treino de força."
                    : " — ritmo seguro."}
              </div>
            )}
          </>
        )}

        {step === 5 && targets && (
          <>
            <div className="summary-grid" style={{ gridTemplateColumns: "1fr" }}>
              <div className="sum-card">
                <div className="label">Meta calórica diária</div>
                <div className="value">
                  {targets.calorieTarget} <span className="unit">kcal</span>
                </div>
              </div>
            </div>
            <div className="row2" style={{ marginTop: 12 }}>
              <div className="sum-card">
                <div className="label">TMB (basal)</div>
                <div className="value">
                  {targets.bmr} <span className="unit">kcal</span>
                </div>
              </div>
              <div className="sum-card">
                <div className="label">Gasto total (TDEE)</div>
                <div className="value">
                  {targets.tdee} <span className="unit">kcal</span>
                </div>
              </div>
              <div className="sum-card">
                <div className="label">Proteína</div>
                <div className="value">
                  {targets.proteinG} <span className="unit">g</span>
                </div>
              </div>
              <div className="sum-card">
                <div className="label">Carboidrato / Gordura</div>
                <div className="value" style={{ fontSize: 18 }}>
                  {targets.carbG}g / {targets.fatG}g
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="step-nav">
        <button
          className="btn ghost"
          disabled={step === 1}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
        >
          Voltar
        </button>
        {step < TOTAL_STEPS ? (
          <button
            className="btn"
            disabled={!canAdvance()}
            onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
          >
            Continuar
          </button>
        ) : (
          <button className="btn" disabled={saving} onClick={handleSave}>
            {saving ? "Salvando..." : "Salvar perfil"}
          </button>
        )}
      </div>

      <div className="footer-note">
        FÊNIX — o plano começa por entender pra onde você quer ir.
      </div>
    </>
  );
}
