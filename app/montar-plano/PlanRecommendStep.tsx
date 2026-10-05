"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  MARMITA_SUGGESTIONS,
  type MarmitaSuggestion,
} from "@/lib/marmita-suggestions";
import {
  pickRecommendedSupplements,
  type DietaryPreference,
  type Supplement,
} from "@/lib/supplements";
import {
  SUPPLEMENT_RECIPES,
  type SupplementRecipe,
} from "@/lib/supplement-recipes";
import type { Goal } from "@/lib/database.types";
import { mealFitsDiet, getDiet, type DietType } from "@/lib/diet-types";
import { marmitaCarbPerServing } from "@/lib/meal-carbs";
import { DietFilterToggle, sortByDietFit } from "@/components/DietFit";
import type { InsertPlanResult } from "./PlanSetupForm";

// Diet compatibility (profiles.diet_type) — marmita carb is estimated from
// its ingredients (lib/meal-carbs.ts) since the catalog has no carb field.
const marmitaFits = (m: MarmitaSuggestion, diet: DietType | null) =>
  mealFitsDiet({ carb: marmitaCarbPerServing(m), protein: m.protein }, diet);
const receitaFits = (r: SupplementRecipe, diet: DietType | null) =>
  mealFitsDiet({ carb: r.carb, protein: r.protein }, diet);

// lib/supplement-recipes.ts's own goal keys ("ganho"/"emagrecimento"/
// "geral") are distinct from the profile's Goal — the prototype never
// unified them (see that file's comment), so this is this step's own
// mapping, not a shared one.
const GOAL_TO_RECEITA_FIT_GOAL: Record<string, string> = {
  perder: "emagrecimento",
  recomp: "emagrecimento",
  ganhar: "ganho",
  manter: "geral",
};

function pickMarmitas(
  goal: Goal | null,
  diet: DietType | null,
  onlyFit: boolean,
): MarmitaSuggestion[] {
  const almoco = MARMITA_SUGGESTIONS.filter(
    (m) => m.category === "almoco",
  ).filter((m) => !diet || !onlyFit || marmitaFits(m, diet));
  let sorted: MarmitaSuggestion[];
  if (goal === "perder") {
    // Prefer quick-prep items, then lighter (lower-kcal) ones — fits a
    // cutting goal without requiring a "fast" flag on every entry.
    sorted = [...almoco].sort((a, b) => {
      if (!!a.fast !== !!b.fast) return a.fast ? -1 : 1;
      return a.kcal - b.kcal;
    });
  } else if (goal === "ganhar") {
    sorted = [...almoco].sort((a, b) => b.protein - a.protein);
  } else {
    sorted = almoco;
  }
  // Compatible with the diet first (stable), then the top 4.
  return (
    diet ? sortByDietFit(sorted, (m) => marmitaFits(m, diet)) : sorted
  ).slice(0, 4);
}

// pickRecommendedSupplements() always returns items in this fixed role
// order (protein source, creatine, caffeine, recovery/health) — see its
// comment in lib/supplements.ts — so this index-matched label array is
// safe, and reads better here than the item's raw category tag.
const SUPPLEMENT_ROLE_LABELS = [
  "Fonte de proteína",
  "Força/performance",
  "Pré-treino/energia",
  "Recuperação/saúde",
];

function pickSupplements(
  goal: Goal | null,
  dietaryPreference?: DietaryPreference | null,
): Supplement[] {
  return pickRecommendedSupplements(goal, dietaryPreference);
}

function pickReceitasFit(
  goal: Goal | null,
  diet: DietType | null,
  onlyFit: boolean,
): SupplementRecipe[] {
  const goalKey = GOAL_TO_RECEITA_FIT_GOAL[goal ?? "manter"] ?? "geral";
  const pool = SUPPLEMENT_RECIPES.filter((r) => r.goal === goalKey).filter(
    (r) => !diet || !onlyFit || receitaFits(r, diet),
  );
  return (diet ? sortByDietFit(pool, (r) => receitaFits(r, diet)) : pool).slice(
    0,
    3,
  );
}

// Second step of Montar Plano's wizard, shown only when the profile has no
// linked personal trainer (see PlanSetupForm). Offers a short "plano
// inicial recomendado" the user can accept as-is (everything checked by
// default), trim item by item, or skip entirely with "Montar do zero".
export default function PlanRecommendStep({
  profileId,
  goal,
  dietaryPreference,
  dietType = null,
  createPlan,
  onBack,
  onDone,
}: {
  profileId: string;
  goal: Goal | null;
  dietaryPreference?: DietaryPreference | null;
  dietType?: DietType | null;
  createPlan: () => Promise<InsertPlanResult>;
  onBack: () => void;
  onDone: () => void;
}) {
  // "Só compatíveis com minha dieta": on by default when the profile has one.
  const [onlyFit, setOnlyFit] = useState(dietType != null);
  const marmitas = useMemo(
    () => pickMarmitas(goal, dietType, onlyFit),
    [goal, dietType, onlyFit],
  );
  const supplements = useMemo(
    () => pickSupplements(goal, dietaryPreference),
    [goal, dietaryPreference],
  );
  const receitasFit = useMemo(
    () => pickReceitasFit(goal, dietType, onlyFit),
    [goal, dietType, onlyFit],
  );

  // Everything starts checked; these sets hold what the user UNchecked (so
  // the lists can change with the diet filter without resetting state).
  const [marmitaOff, setMarmitaOff] = useState<Set<string>>(() => new Set());
  const [suppOff, setSuppOff] = useState<Set<string>>(() => new Set());
  const [receitaOff, setReceitaOff] = useState<Set<string>>(() => new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(
    set: Set<string>,
    setSet: (next: Set<string>) => void,
    name: string,
  ) {
    const next = new Set(set);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setSet(next);
  }

  async function finalize(skipAll: boolean) {
    setSaving(true);
    setError(null);

    const planResult = await createPlan();
    if (!planResult.ok) {
      setSaving(false);
      setError(planResult.message);
      return;
    }

    const marmitasToAdd = skipAll
      ? []
      : marmitas.filter((m) => !marmitaOff.has(m.name));
    const supplementsToAdd = skipAll
      ? []
      : supplements.filter((s) => !suppOff.has(s.name));
    const receitasToAdd = skipAll
      ? []
      : receitasFit.filter((r) => !receitaOff.has(r.name));

    const supabase = createClient();
    try {
      await Promise.all([
        ...marmitasToAdd.map(async (m) => {
          const { data, error: insertError } = await supabase
            .from("user_recipes")
            .insert({
              profile_id: profileId,
              name: m.name,
              yield_count: m.yield,
              ingredients: m.ingredients,
            })
            .select("id")
            .single();
          if (insertError || !data) {
            throw new Error(
              insertError?.message ?? `Erro ao adicionar "${m.name}".`,
            );
          }
          const { error: upsertError } = await supabase
            .from("meal_prep_plan")
            .upsert(
              {
                profile_id: profileId,
                user_recipe_id: data.id,
                desired_count: 1,
              },
              { onConflict: "profile_id,user_recipe_id" },
            );
          if (upsertError) throw new Error(upsertError.message);
        }),
        ...supplementsToAdd.map(async (s) => {
          const { error: insertError } = await supabase
            .from("plan_recommendation_picks")
            .insert({
              profile_id: profileId,
              kind: "supplement",
              ref_name: s.name,
            });
          if (insertError) throw new Error(insertError.message);
        }),
        ...receitasToAdd.map(async (r) => {
          // A receita fit also needs to actually count toward the week —
          // same mechanism as a marmita (user_recipes + meal_prep_plan) —
          // per user feedback (2026-10-04): picking one here should "fit
          // into the weekly plan", not just leave a record. The
          // plan_recommendation_picks row below is kept too, purely so the
          // Receitas Fit page can still badge it as "recomendado".
          const { data, error: insertError } = await supabase
            .from("user_recipes")
            .insert({
              profile_id: profileId,
              name: r.name,
              yield_count: r.yield,
              ingredients: r.ingredients,
            })
            .select("id")
            .single();
          if (insertError || !data) {
            throw new Error(
              insertError?.message ?? `Erro ao adicionar "${r.name}".`,
            );
          }
          const { error: upsertError } = await supabase
            .from("meal_prep_plan")
            .upsert(
              {
                profile_id: profileId,
                user_recipe_id: data.id,
                desired_count: 1,
              },
              { onConflict: "profile_id,user_recipe_id" },
            );
          if (upsertError) throw new Error(upsertError.message);

          const { error: pickError } = await supabase
            .from("plan_recommendation_picks")
            .insert({
              profile_id: profileId,
              kind: "receita_fit",
              ref_name: r.name,
            });
          if (pickError) throw new Error(pickError.message);
        }),
      ]);
    } catch (e) {
      setSaving(false);
      setError(
        e instanceof Error ? e.message : "Erro ao salvar recomendações.",
      );
      return;
    }

    setSaving(false);
    onDone();
  }

  function handleMontarDoZero() {
    finalize(true);
  }

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Plano inicial recomendado</h2>
      <div className="fx-planrec-intro">
        Sugestões com base no seu objetivo. Você pode desmarcar o que não
        quiser, ou pular tudo.
      </div>
      {dietType && (
        <DietFilterToggle
          diet={dietType}
          on={onlyFit}
          onToggle={() => setOnlyFit((v) => !v)}
        />
      )}

      {marmitas.length > 0 && (
        <div className="fx-planrec-group">
          <div className="fx-planrec-group-title">Marmitas</div>
          {marmitas.map((m) => {
            const fits = marmitaFits(m, dietType);
            return (
              <label
                className={
                  "fx-planrec-row" +
                  (dietType && !fits ? " fx-diet-planrec-row-mismatch" : "")
                }
                key={m.name}
              >
                <input
                  type="checkbox"
                  checked={!marmitaOff.has(m.name)}
                  onChange={() => toggle(marmitaOff, setMarmitaOff, m.name)}
                />
                <span className="fx-planrec-row-main">
                  {m.name}
                  {dietType &&
                    (fits ? (
                      <span className="fx-diet-planrec-tag">
                        ✅ Combina com sua dieta
                      </span>
                    ) : (
                      <span
                        className="fx-diet-planrec-tag"
                        style={{ color: "var(--warn)" }}
                      >
                        ⚠️ Foge da dieta {getDiet(dietType)?.label}
                      </span>
                    ))}
                </span>
                <span className="fx-planrec-row-stat">{m.kcal} kcal</span>
              </label>
            );
          })}
        </div>
      )}

      {supplements.length > 0 && (
        <div className="fx-planrec-group">
          <div className="fx-planrec-group-title">Suplementos</div>
          {supplements.map((s, idx) => (
            <label className="fx-planrec-row" key={s.name}>
              <input
                type="checkbox"
                checked={!suppOff.has(s.name)}
                onChange={() => toggle(suppOff, setSuppOff, s.name)}
              />
              <span className="fx-planrec-row-main">{s.name}</span>
              <span className="fx-planrec-row-stat">
                {SUPPLEMENT_ROLE_LABELS[idx] ?? ""}
              </span>
            </label>
          ))}
        </div>
      )}

      {receitasFit.length > 0 && (
        <div className="fx-planrec-group">
          <div className="fx-planrec-group-title">Receitas Fit</div>
          <div className="fx-planrec-group-note">
            As marcadas entram no seu cardápio da semana (Marmitas) e ficam
            disponíveis para registrar no Diário quando comer.
          </div>
          {receitasFit.map((r) => {
            const fits = receitaFits(r, dietType);
            return (
              <label
                className={
                  "fx-planrec-row" +
                  (dietType && !fits ? " fx-diet-planrec-row-mismatch" : "")
                }
                key={r.name}
              >
                <input
                  type="checkbox"
                  checked={!receitaOff.has(r.name)}
                  onChange={() => toggle(receitaOff, setReceitaOff, r.name)}
                />
                <span className="fx-planrec-row-main">
                  {r.name}
                  {dietType &&
                    (fits ? (
                      <span className="fx-diet-planrec-tag">
                        ✅ Combina com sua dieta
                      </span>
                    ) : (
                      <span
                        className="fx-diet-planrec-tag"
                        style={{ color: "var(--warn)" }}
                      >
                        ⚠️ Foge da dieta {getDiet(dietType)?.label}
                      </span>
                    ))}
                </span>
                <span className="fx-planrec-row-stat">
                  {r.kcal} kcal · {r.protein}g proteína
                </span>
              </label>
            );
          })}
        </div>
      )}

      <div className="fx-planrec-actions">
        <button
          type="button"
          className="btn ghost"
          onClick={onBack}
          disabled={saving}
        >
          Voltar
        </button>
        <button
          type="button"
          className="btn secondary"
          onClick={handleMontarDoZero}
          disabled={saving}
        >
          Montar do zero
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => finalize(false)}
          disabled={saving}
        >
          {saving ? "Criando..." : "Finalizar e criar plano"}
        </button>
      </div>

      {error && (
        <div className="form-error" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}
    </div>
  );
}
