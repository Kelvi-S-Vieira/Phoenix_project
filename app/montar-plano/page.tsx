import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import { ALUNO_SIDEBAR_SECTIONS } from "@/lib/sidebar-nav";
import { getServerWeightUnit } from "@/lib/weight-unit-server";
import { dietLabel, buildWeeklyPlan, computePlanProgress } from "@/lib/plan-generation";
import { TIER_LABELS, SPLIT_OPTIONS } from "@/lib/fenix-domain";
import type { ActivityLevel, Tier } from "@/lib/database.types";
import PlanSetupForm from "./PlanSetupForm";
import PlanActions from "./PlanActions";
import PlanChart from "@/components/PlanChart";
import PlanWeekTable from "@/components/PlanWeekTable";
import PlanCompleteCard from "@/components/PlanCompleteCard";

export default async function MontarPlanoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.role) redirect("/complete-profile");
  if (profile.role === "personal") redirect("/personal");
  if (!profile.onboarding_completed) redirect("/onboarding");

  const unit = await getServerWeightUnit();

  const { data: plan } = await supabase
    .from("custom_plans")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  return (
    <div className="app-shell">
      <Sidebar
        variant="aluno"
        accountName={`${profile.name ?? "Aluno"} · Aluno`}
        currentWeight={profile.current_weight}
        targetWeight={profile.target_weight}
        sections={ALUNO_SIDEBAR_SECTIONS}
        unit={unit}
      />
      <main className="main-content">
        <div className="fx-app">
          <div className="top">
            <div className="eyebrow">Projeto Fênix · Meu Plano</div>
            <h1>Montar Plano</h1>
            <div className="sub">
              Defina duração, dieta e treino. O progresso e o gráfico de peso aparecem assim que você criar o plano.
            </div>
          </div>

          {!plan ? (
            <PlanSetupForm profileId={user.id} />
          ) : (
            <PlanProgressView
              plan={plan}
              currentWeight={profile.current_weight}
              targetWeight={profile.target_weight}
              height={profile.height}
              age={profile.age}
              sex={profile.sex}
              activityLevel={profile.activity_level}
              unit={unit}
              profileId={user.id}
            />
          )}
        </div>
      </main>
    </div>
  );
}

async function PlanProgressView({
  plan,
  currentWeight,
  targetWeight,
  height,
  age,
  sex,
  activityLevel,
  unit,
  profileId,
}: {
  plan: { id: string; weeks: number; diet_choice: string | null; tier: Tier | null; split: string | null; start_date: string };
  currentWeight: number | null;
  targetWeight: number | null;
  height: number | null;
  age: number | null;
  sex: "M" | "F" | null;
  activityLevel: ActivityLevel | null;
  unit: "kg" | "lb";
  profileId: string;
}) {
  const supabase = await createClient();
  const progress = computePlanProgress(plan);
  const canShowMaintenance =
    progress.isComplete &&
    targetWeight != null &&
    height != null &&
    age != null &&
    sex != null &&
    activityLevel != null;
  const tierLabel = plan.tier ? TIER_LABELS[plan.tier] : "—";
  const splitLabel = plan.tier && plan.split
    ? SPLIT_OPTIONS[plan.tier].find((o) => o.key === plan.split)?.label ?? plan.split
    : "—";

  let rows: ReturnType<typeof buildWeeklyPlan> = [];
  if (currentWeight != null && targetWeight != null) {
    const { data: weightLogs } = await supabase
      .from("weight_logs")
      .select("logged_at, weight")
      .eq("profile_id", profileId)
      .order("logged_at", { ascending: true });

    rows = buildWeeklyPlan({
      startDate: plan.start_date,
      weeks: plan.weeks,
      dietChoice: plan.diet_choice,
      currentWeight,
      targetWeight,
      weightLogs: weightLogs ?? [],
    });
  }

  return (
    <>
      {canShowMaintenance && (
        <PlanCompleteCard
          weeks={plan.weeks}
          targetWeight={targetWeight!}
          height={height!}
          age={age!}
          sex={sex!}
          activity={activityLevel!}
        />
      )}

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Plano ativo</h2>
        <div className="fx-plan-summary-row">
          <div className="fx-plan-summary-item">
            <b>
              {progress.currentWeek}/{plan.weeks}
            </b>
            <span>Semana</span>
          </div>
          <div className="fx-plan-summary-item">
            <b>{dietLabel(plan.diet_choice)}</b>
            <span>Dieta</span>
          </div>
          <div className="fx-plan-summary-item">
            <b>{tierLabel}</b>
            <span>Nível</span>
          </div>
          <div className="fx-plan-summary-item">
            <b>{splitLabel}</b>
            <span>Split</span>
          </div>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress.pct}%` }} />
        </div>
        <div className="fx-plan-desc">
          {new Date(progress.startDate + "T00:00:00").toLocaleDateString("pt-BR")} →{" "}
          {new Date(progress.endDate + "T00:00:00").toLocaleDateString("pt-BR")} ({progress.pct}% concluído)
        </div>
        <div style={{ marginTop: 16 }}>
          <PlanActions planId={plan.id} currentWeeks={plan.weeks} />
        </div>
      </div>

      {currentWeight == null || targetWeight == null ? (
        <div className="card">
          <div className="fx-empty-state">
            Preencha seu peso atual e peso-alvo em{" "}
            <Link href="/onboarding">Editar metas</Link> para ver as metas semanais e o gráfico.
          </div>
        </div>
      ) : (
        <>
          <div className="card">
            <h2 style={{ marginTop: 0 }}>Peso ao longo do plano</h2>
            <PlanChart rows={rows} unit={unit} />
          </div>
          <div className="card">
            <h2 style={{ marginTop: 0 }}>Semanas e ações estratégicas</h2>
            <PlanWeekTable rows={rows} unit={unit} />
          </div>
        </>
      )}
    </>
  );
}
