import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import { ALUNO_SIDEBAR_SECTIONS } from "@/lib/sidebar-nav";
import { getServerWeightUnit } from "@/lib/weight-unit-server";
import { buildWeeklyPlan, dietLabel } from "@/lib/plan-generation";
import { formatWeight } from "@/lib/weight-unit";
import PlanChart from "@/components/PlanChart";
import PlanWeekTable from "@/components/PlanWeekTable";

// Generalized replacement for the prototype's hardcoded, name-gated
// "Plano 17 semanas" (#page-plano17, ~lines 4799-4854 and 16768-16916 of
// projeto_fenix_app_final.html): instead of `/kelvin/i` gating and an
// 18-row dataset of one person's real dates/targets, this page reads
// whichever Montar Plano the signed-in aluno has active and generates the
// same kind of weekly schedule from lib/plan-generation.ts — available to
// everyone, gated only on "do you have an active plan".
export default async function Plano17Page() {
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

  const currentWeight = profile.current_weight;
  const targetWeight = profile.target_weight;
  const hasTargets = currentWeight != null && targetWeight != null;

  let rows: ReturnType<typeof buildWeeklyPlan> = [];
  if (plan && currentWeight != null && targetWeight != null) {
    const { data: weightLogs } = await supabase
      .from("weight_logs")
      .select("logged_at, weight")
      .eq("profile_id", user.id)
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

  const recorded = rows.filter((r) => r.actualWeight != null);
  const latest = recorded[recorded.length - 1] ?? null;

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
            <div className="eyebrow">Projeto Fênix · Plano semanal</div>
            <h1>{plan ? `Seu plano · ${plan.weeks} semanas` : "Seu plano semanal"}</h1>
            <div className="sub">
              Duas metas por semana — só gordura vs. cenário real com ganho de massa — e o que você de fato registrou.
              A duração abaixo é a que você escolheu em Montar Plano, não um número fixo.
            </div>
          </div>

          {!plan ? (
            <div className="card">
              <div className="fx-empty-state">
                Você ainda não tem um plano ativo. Crie um em{" "}
                <Link href="/montar-plano">Montar Plano</Link> para ver sua tabela semanal aqui.
              </div>
            </div>
          ) : !hasTargets ? (
            <div className="card">
              <div className="fx-empty-state">
                Preencha seu peso atual e peso-alvo em{" "}
                <Link href="/onboarding">Meu Perfil</Link> para gerar as metas semanais.
              </div>
            </div>
          ) : (
            <>
              <div className="summary-grid">
                <div className="sum-card">
                  <div className="label">Semanas registradas</div>
                  <div className="value">
                    {recorded.length}
                    <span className="unit"> / {rows.length}</span>
                  </div>
                </div>
                <div className="sum-card">
                  <div className="label">Dieta do plano</div>
                  <div className="value">{dietLabel(plan.diet_choice)}</div>
                </div>
                {latest && (
                  <>
                    <div className="sum-card">
                      <div className="label">Último peso registrado</div>
                      <div className="value">{formatWeight(latest.actualWeight, unit)}</div>
                    </div>
                    <div className="sum-card red">
                      <div className="label">Meta 🔴 daquela semana</div>
                      <div className="value">{formatWeight(latest.targetRed, unit)}</div>
                    </div>
                    <div className="sum-card green">
                      <div className="label">Meta 🟢 daquela semana</div>
                      <div className="value">{formatWeight(latest.targetGreen, unit)}</div>
                    </div>
                  </>
                )}
              </div>

              <div className="card">
                <h2 style={{ marginTop: 0 }}>Evolução: metas vs. real</h2>
                <PlanChart rows={rows} unit={unit} />
              </div>

              <div className="card">
                <h2 style={{ marginTop: 0 }}>Semanas e ações estratégicas</h2>
                <PlanWeekTable rows={rows} unit={unit} />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
