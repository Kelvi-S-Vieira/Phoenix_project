"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { todayBR } from "@/lib/date-br";
import {
  ACTIVITY_LEVELS,
  GOALS,
  computeTargets,
  activityLabel,
} from "@/lib/fenix-domain";
import type { ActivityLevel, Goal } from "@/lib/database.types";
import type { DietaryPreference } from "@/lib/supplements";
import {
  DEFAULT_FASTING_WINDOW,
  DIETS,
  getDiet,
  macrosForDiet,
  suggestedDietForGoal,
  type DietType,
} from "@/lib/diet-types";
import { getWeightUnit, toDisplayWeight, fromDisplayWeight } from "@/lib/weight-unit";
import { getPaceSuggestions, getEndDateHint, getPaceFeedback } from "@/lib/pace-suggestions";

const TOTAL_STEPS = 5;

// Optional question on the goal step; drives plant-based supplement picks
// (lib/supplements.ts). Stored as profiles.dietary_preference.
const DIETARY_OPTIONS: { key: DietaryPreference; title: string }[] = [
  { key: "onivoro", title: "Onívoro" },
  { key: "vegetariano", title: "Vegetariano" },
  { key: "vegano", title: "Vegano" },
];

interface WizardState {
  sex: "M" | "F" | "";
  age: string;
  height: string;
  weight: string;
  activity: ActivityLevel | "";
  goal: Goal | "";
  dietaryPreference: DietaryPreference | "";
  // "" = not answered yet, "later" = explicit "Decidir depois" (both save
  // diet_type = null). A diet is only ever saved when the user picks one —
  // the goal-based suggestion is just a highlight, never a default.
  dietType: DietType | "later" | "";
  targetWeight: string;
  timeframeWeeks: string;
}

/** Profile fields this wizard reads/writes, as loaded from Supabase for edit mode. */
export interface OnboardingInitialProfile {
  sex: "M" | "F" | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  activity: ActivityLevel | null;
  goal: Goal | null;
  dietaryPreference?: DietaryPreference | null;
  dietType?: DietType | null;
  fastingWindow?: string | null;
  targetWeight: number | null;
}

function stateFromProfile(p?: OnboardingInitialProfile): WizardState {
  return {
    sex: p?.sex ?? "",
    age: p?.age != null ? String(p.age) : "",
    height: p?.height != null ? String(p.height) : "",
    weight: p?.weight != null ? String(p.weight) : "",
    activity: p?.activity ?? "",
    goal: p?.goal ?? "",
    dietaryPreference: p?.dietaryPreference ?? "",
    dietType: p?.dietType ?? "",
    targetWeight: p?.targetWeight != null ? String(p.targetWeight) : "",
    // Not a stored profile column (only ever used to shape the deficit %
    // during this session) — always starts blank, even in edit mode.
    timeframeWeeks: "",
  };
}

export default function OnboardingWizard({
  mode = "setup",
  initialProfile,
}: {
  /** "setup": first-time flow (blank form, step 1). "edit": reopened from the sidebar, pre-filled from the saved profile. */
  mode?: "setup" | "edit";
  initialProfile?: OnboardingInitialProfile;
}) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<WizardState>(() => stateFromProfile(initialProfile));
  // Weight is always stored/kept in kg (used directly below in the BMR
  // formula) — `unit` only controls what the two weight inputs show/accept.
  const [unit] = useState(getWeightUnit);

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

  const currentWeightKg = state.weight ? parseFloat(state.weight) : null;
  const targetWeightKg = state.targetWeight ? parseFloat(state.targetWeight) : null;
  const timeframeWeeksNum = state.timeframeWeeks ? parseFloat(state.timeframeWeeks) : null;

  const pctPerWeek = (() => {
    const w = parseFloat(state.weight);
    const t = parseFloat(state.targetWeight);
    const wk = parseFloat(state.timeframeWeeks);
    if (w && t && wk && wk > 0) return (Math.abs(w - t) / wk / w) * 100;
    return null;
  })();

  const paceSuggestions = getPaceSuggestions(currentWeightKg, targetWeightKg, timeframeWeeksNum);
  const endDateHint = getEndDateHint(timeframeWeeksNum);
  const paceFeedback = getPaceFeedback(currentWeightKg, targetWeightKg, timeframeWeeksNum);

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

  // Diet applied on top of computeTargets(): the calorie target stays, only
  // the protein/carb/fat grams are re-split (lib/diet-types.ts). Nothing else
  // in the DB needs recomputing — Diário, Montar Plano, Marmitas and Receitas
  // read diet_type and the P/C/G targets straight from profiles.
  const chosenDiet: DietType | null = state.dietType && state.dietType !== "later" ? state.dietType : null;
  const chosenDietDef = getDiet(chosenDiet);
  const finalMacros =
    targets && chosenDiet
      ? macrosForDiet(targets.calorieTarget, chosenDiet)
      : targets
        ? { proteinG: targets.proteinG, carbG: targets.carbG, fatG: targets.fatG }
        : null;
  const suggestedDiet = suggestedDietForGoal(state.goal || null);

  async function handleSave() {
    if (!targets || !finalMacros || !state.sex || !state.goal || !state.activity) return;
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
        // Optional: blank (never answered / deselected) saves as null.
        dietary_preference: state.dietaryPreference || null,
        diet_type: chosenDiet,
        // Keep an existing window when staying on "jejum" (editable in /dieta).
        fasting_window:
          chosenDiet === "jejum" ? (initialProfile?.fastingWindow ?? DEFAULT_FASTING_WINDOW) : null,
        calorie_target: targets.calorieTarget,
        protein_target: finalMacros.proteinG,
        // Diário targets (see /diario) — computeTargets() derives them with
        // the prototype's formula; macrosForDiet() overrides the split when
        // a diet type was chosen.
        carb_target: finalMacros.carbG,
        fat_target: finalMacros.fatG,
        timeframe_weeks: timeframeWeeksNum,
        onboarding_completed: true,
      })
      .eq("id", user.id);

    if (profileError) {
      setSaving(false);
      setError(profileError.message);
      return;
    }

    // upsert (not insert): editing an already-onboarded profile can run this
    // more than once on the same day, and weight_logs has a unique
    // (profile_id, logged_at) constraint — same pattern as QuickAddWeight.
    await supabase.from("weight_logs").upsert(
      {
        profile_id: user.id,
        weight: parseFloat(state.weight),
        logged_at: today,
      },
      { onConflict: "profile_id,logged_at" }
    );
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
        <div className="eyebrow">{isEdit ? "Fênix · Meu Perfil" : "Fênix · Definir objetivo"}</div>
        <h1>
          {step === 1 && "Dados básicos"}
          {step === 2 && "Nível de atividade"}
          {step === 3 && "Objetivo principal"}
          {step === 4 && "Sua meta"}
          {step === 5 && "Seu plano calculado"}
        </h1>
        <div className="sub">
          {isEdit
            ? "Revise ou ajuste seus dados — suas metas de calorias e proteína são recalculadas na hora."
            : "5 passos rápidos pra calcular sua meta calórica, proteína e ritmo."}
        </div>
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
              <label>Peso atual ({unit})</label>
              <input
                type="number"
                step="0.1"
                value={state.weight ? (toDisplayWeight(parseFloat(state.weight), unit) ?? "") : ""}
                onChange={(e) =>
                  update(
                    "weight",
                    e.target.value === "" ? "" : String(fromDisplayWeight(e.target.value, unit))
                  )
                }
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
            <div className="field" style={{ marginTop: 20 }}>
              <label>Alguma preferência alimentar? (opcional)</label>
              <div className="choice-grid cols2">
                {DIETARY_OPTIONS.map((d) => (
                  <div
                    key={d.key}
                    className={"choice-card" + (state.dietaryPreference === d.key ? " selected" : "")}
                    onClick={() =>
                      update("dietaryPreference", state.dietaryPreference === d.key ? "" : d.key)
                    }
                  >
                    <div className="cc-title">{d.title}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="field" style={{ marginTop: 20 }}>
              <label>Qual tipo de dieta você quer seguir? (opcional)</label>
              <div className="sub" style={{ marginBottom: 10 }}>
                Muda só a divisão de proteína, carboidrato e gordura — as calorias continuam as
                do seu objetivo. Você pode trocar depois em Dieta.
              </div>
              <div className="choice-grid">
                {DIETS.map((d) => (
                  <div
                    key={d.key}
                    className={"choice-card" + (state.dietType === d.key ? " selected" : "")}
                    onClick={() => update("dietType", state.dietType === d.key ? "" : d.key)}
                  >
                    <div className="cc-title">
                      {d.emoji} {d.label}
                      {state.goal && d.key === suggestedDiet && (
                        <span className="fx-diet-suggested-tag">sugerida p/ seu objetivo</span>
                      )}
                    </div>
                    <div className="cc-desc">{d.description}</div>
                    <div className="fx-diet-choice-split">
                      P {d.split.p}% · C {d.split.c}% · G {d.split.f}%
                    </div>
                  </div>
                ))}
                <div
                  className={"choice-card" + (state.dietType === "later" ? " selected" : "")}
                  onClick={() => update("dietType", state.dietType === "later" ? "" : "later")}
                >
                  <div className="cc-title">Decidir depois</div>
                  <div className="cc-desc">Usa a divisão padrão por objetivo, sem dieta específica.</div>
                </div>
              </div>
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
              <label>Peso alvo ({unit})</label>
              <input
                type="number"
                step="0.1"
                value={
                  state.targetWeight ? (toDisplayWeight(parseFloat(state.targetWeight), unit) ?? "") : ""
                }
                onChange={(e) =>
                  update(
                    "targetWeight",
                    e.target.value === "" ? "" : String(fromDisplayWeight(e.target.value, unit))
                  )
                }
              />
            </div>
            {paceSuggestions && (
              <div id="pf_paceSuggestions">
                <div className="pace-sugg-hint">Sugestões de ritmo (clique pra preencher o prazo):</div>
                <div className="pace-sugg-grid">
                  {paceSuggestions.map((card) => (
                    <div
                      key={card.key}
                      className={"pace-sugg-card" + ` ${card.key}` + (card.active ? " active" : "")}
                      onClick={() => update("timeframeWeeks", String(card.weeks))}
                    >
                      <div className="ps-label">{card.label}</div>
                      <div className="ps-weeks">
                        {card.weeks}
                        <span className="unit"> sem</span>
                      </div>
                      <div className="ps-date">
                        ~{card.pct}%/sem · {card.dateStr}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="field" style={{ marginTop: 16 }}>
              <label>Prazo (semanas)</label>
              <input
                type="number"
                value={state.timeframeWeeks}
                onChange={(e) => update("timeframeWeeks", e.target.value)}
              />
              {endDateHint && (
                <div className="pace-sugg-hint" style={{ marginTop: 6 }}>
                  Começando hoje ({endDateHint.startStr}), {endDateHint.weeks} semana
                  {endDateHint.weeks === 1 ? "" : "s"} terminaria em{" "}
                  <b style={{ color: "var(--gold)" }}>{endDateHint.endStr}</b>.
                </div>
              )}
            </div>
            {paceFeedback && (
              <div className={`pace-feedback ${paceFeedback.cls}`}>
                <b>{paceFeedback.title}</b> {paceFeedback.message}
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
                  {finalMacros?.proteinG ?? targets.proteinG}{" "}
                  <span className="unit">
                    g{chosenDiet ? "" : ` (${targets.proteinPerKg}g/kg)`}
                  </span>
                </div>
              </div>
              <div className="sum-card">
                <div className="label">Carboidrato / Gordura</div>
                <div className="value" style={{ fontSize: 18 }}>
                  {finalMacros?.carbG ?? targets.carbG}g / {finalMacros?.fatG ?? targets.fatG}g
                </div>
              </div>
              <div className="sum-card">
                <div className="label">Ritmo estimado</div>
                <div className="value">
                  {pctPerWeek !== null ? (
                    <>
                      {pctPerWeek.toFixed(2)} <span className="unit">%/sem</span>
                    </>
                  ) : (
                    "—"
                  )}
                </div>
              </div>
            </div>
            <div className="breakdown" style={{ marginTop: 12 }}>
              <div className="b-row">
                <span>Fórmula usada</span>
                <b>Mifflin-St Jeor</b>
              </div>
              <div className="b-row">
                <span>Nível de atividade</span>
                <b>{activityLabel(state.activity)}</b>
              </div>
              <div className="b-row">
                <span>Tipo de dieta</span>
                <b>{chosenDietDef ? `${chosenDietDef.emoji} ${chosenDietDef.label}` : "A definir"}</b>
              </div>
              <hr />
              <div className="b-row">
                <span>Estratégia</span>
                <span style={{ maxWidth: "60%", textAlign: "right" }}>{targets.rationale}</span>
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
            {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Salvar perfil"}
          </button>
        )}
      </div>

      <div className="footer-note">
        FÊNIX — o plano começa por entender pra onde você quer ir.
      </div>
    </>
  );
}
