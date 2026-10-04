import Link from "next/link";
import { computeMaintenanceCalories } from "@/lib/fenix-domain";
import type { ActivityLevel } from "@/lib/database.types";

// Shown once a Montar Plano/Plano semanal's duration is complete (see
// computePlanProgress().isComplete in lib/plan-generation.ts) — today
// nothing tells the user what to eat to hold the result once the plan
// itself ends (MIGRATION_PLAN.md, "P1 — Lacunas entre níveis de treino").
// Reused as-is by both /plano17 and /montar-plano so the copy/number agree.
export default function PlanCompleteCard({
  weeks,
  targetWeight,
  height,
  age,
  sex,
  activity,
}: {
  weeks: number;
  targetWeight: number;
  height: number;
  age: number;
  sex: "M" | "F";
  activity: ActivityLevel;
}) {
  // Maintenance at the profile's current activity level, using the TARGET
  // weight (not current weight) as the basis — by plan-completion the user
  // should be at or near it, and that's the weight the "manutenção" number
  // is meant to hold.
  const maintenanceCalories = computeMaintenanceCalories({
    weight: targetWeight,
    height,
    age,
    sex,
    activity,
  });

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>🎉 Plano concluído</h2>
      <div className="fx-grad-box">
        <p style={{ margin: "0 0 12px" }}>
          As {weeks} semana{weeks === 1 ? "" : "s"} deste plano já passaram. Seja qual tenha
          sido o resultado, esse é um bom momento para decidir o próximo passo — e, enquanto
          isso, aqui está uma estimativa do que comer por dia para <b>manter</b> o resultado
          atingido.
        </p>
        <div className="summary-grid" style={{ gridTemplateColumns: "1fr" }}>
          <div className="sum-card">
            <div className="label">Calorias de manutenção estimadas</div>
            <div className="value">
              {maintenanceCalories} <span className="unit">kcal/dia</span>
            </div>
          </div>
        </div>
        <p className="sub" style={{ marginTop: 12, marginBottom: 12 }}>
          Estimativa baseada na fórmula de Mifflin-St Jeor com seu nível de atividade atual —
          manutenção real costuma variar ±100-200 kcal de pessoa para pessoa, então ajuste pelo
          que a balança mostrar nas próximas semanas.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/montar-plano" className="btn">
            Montar novo plano
          </Link>
        </div>
        <p className="sub" style={{ marginTop: 10, marginBottom: 0 }}>
          Preferir não montar um novo plano agora? Use os {maintenanceCalories} kcal/dia acima
          como sua nova meta diária em <Link href="/diario">Diário</Link>.
        </p>
      </div>
    </div>
  );
}
