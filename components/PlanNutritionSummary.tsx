import Link from "next/link";
import { computeWaterTargetMl } from "@/lib/fenix-domain";
import { SUPPLEMENTS, GOAL_TO_SUPPLEMENT_CATEGORY, SUPPLEMENT_CATEGORIES } from "@/lib/supplements";
import type { ActivityLevel, Goal } from "@/lib/database.types";

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  SUPPLEMENT_CATEGORIES.filter((c) => c.key !== "all").map((c) => [c.key, c.label])
);

// "Resumo nutricional do plano" — added per user feedback (2026-10-04):
// Montar Plano had no clear, at-a-glance visualization of what's actually
// recommended to consume day to day (food targets, water, supplements) —
// the calorie/macro targets already existed on `profiles` (set during
// onboarding via computeTargets(), lib/fenix-domain.ts) but were never
// surfaced here, water had no target anywhere in the app, and supplements
// only showed up as a one-time checklist inside the "plano inicial
// recomendado" wizard step (PlanRecommendStep.tsx), not as a standing
// reference. This card is reused in both the active-plan view
// (app/montar-plano/page.tsx) and, in a lighter form, the recommend step
// itself, so the same numbers show up in both places.
export default function PlanNutritionSummary({
  weight,
  goal,
  activity,
  calorieTarget,
  proteinTarget,
  carbTarget,
  fatTarget,
}: {
  weight: number | null;
  goal: Goal | null;
  activity: ActivityLevel | null;
  calorieTarget: number | null;
  proteinTarget: number | null;
  carbTarget: number | null;
  fatTarget: number | null;
}) {
  const waterMl = weight != null ? computeWaterTargetMl(weight, activity) : null;
  const supplementCategory = GOAL_TO_SUPPLEMENT_CATEGORY[goal ?? "manter"] ?? "recuperacao";
  const recommendedSupplements = SUPPLEMENTS.filter((s) => s.tags.includes(supplementCategory)).slice(0, 4);

  const hasFoodTargets = calorieTarget != null;

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>O que recomendamos ingerir por dia</h2>

      {hasFoodTargets ? (
        <div className="summary-grid">
          <div className="sum-card">
            <div className="label">Calorias</div>
            <div className="value">
              {calorieTarget} <span className="unit">kcal</span>
            </div>
          </div>
          <div className="sum-card">
            <div className="label">Proteína</div>
            <div className="value">
              {proteinTarget ?? "—"} <span className="unit">g</span>
            </div>
          </div>
          <div className="sum-card">
            <div className="label">Carboidrato</div>
            <div className="value">
              {carbTarget ?? "—"} <span className="unit">g</span>
            </div>
          </div>
          <div className="sum-card">
            <div className="label">Gordura</div>
            <div className="value">
              {fatTarget ?? "—"} <span className="unit">g</span>
            </div>
          </div>
          <div className="sum-card">
            <div className="label">Água</div>
            <div className="value">
              {waterMl != null ? (waterMl / 1000).toFixed(waterMl % 1000 === 0 ? 0 : 1) : "—"}{" "}
              <span className="unit">L</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="fx-empty-state">
          Preencha seu peso, altura, idade e sexo em{" "}
          <Link href="/onboarding">Editar metas</Link> para calcular suas metas de calorias e
          macros.
        </div>
      )}

      <p className="sub" style={{ marginTop: 12, marginBottom: 0 }}>
        Registre o que comeu no <Link href="/diario">Diário</Link> para acompanhar o quanto já
        bateu da meta hoje.
      </p>

      {recommendedSupplements.length > 0 && (
        <>
          <div className="fx-plan-desc" style={{ marginTop: 16, marginBottom: 6 }}>
            Suplementos recomendados para o seu objetivo ({CATEGORY_LABEL[supplementCategory] ?? supplementCategory}):
          </div>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {recommendedSupplements.map((s) => (
              <li key={s.name}>{s.name}</li>
            ))}
          </ul>
          <p className="sub" style={{ marginTop: 8, marginBottom: 0 }}>
            Veja dosagem e detalhes em{" "}
            <Link href="/alimentacao/suplementacao">Suplementação</Link> e receitas prontas em{" "}
            <Link href="/alimentacao/receitas">Receitas Fit</Link>.
          </p>
        </>
      )}
    </div>
  );
}
