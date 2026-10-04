import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import { ALUNO_SIDEBAR_SECTIONS } from "@/lib/sidebar-nav";
import { getServerWeightUnit } from "@/lib/weight-unit-server";
import { formatWeight } from "@/lib/weight-unit";
import { GOAL_LABELS, TIER_LABELS } from "@/lib/fenix-domain";
import WeightChart from "@/components/WeightChart";
import { weekRangeBR } from "@/lib/date-br";

// Real "Meu Perfil" landing page (MIGRATION_PLAN.md, "P1 — Lacunas entre
// níveis de treino"): previously the sidebar's "Meu Perfil" item pointed
// straight at /onboarding, which always launches OnboardingWizard from
// scratch (in edit mode). This page is the actual profile summary — who the
// user is, linked personal, weight evolution, this week's training — with
// a separate "Editar metas" button that is the only remaining way into the
// wizard. OnboardingWizard itself is untouched.
export default async function PerfilPage() {
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

  const { weekStart, weekEnd } = weekRangeBR();

  const [{ data: weightLogs }, { data: personal }, { data: weekEntries }] = await Promise.all([
    supabase
      .from("weight_logs")
      .select("logged_at, weight")
      .eq("profile_id", user.id)
      .order("logged_at", { ascending: true }),
    profile.linked_personal_id
      ? supabase
          .from("profiles")
          .select("id, name")
          .eq("id", profile.linked_personal_id)
          .single()
      : Promise.resolve({ data: null as { id: string; name: string | null } | null }),
    // Light, generic duplicate of app/treino/page.tsx's "Resumo da semana"
    // query — that page's full trained-days-vs-scheduled-days number needs
    // the active tier's split data (Básico/Intermediário/Avançado/Terceira
    // Idade each shape that differently), which is out of scope for this
    // summary page. Here we just show what was actually logged this week.
    supabase
      .from("workout_log_entries")
      .select("exercise_id, logged_at")
      .eq("profile_id", user.id)
      .eq("checked", true)
      .gte("logged_at", weekStart)
      .lte("logged_at", weekEnd),
  ]);

  const logs = weightLogs ?? [];
  const currentWeight = logs.length > 0 ? logs[logs.length - 1].weight : profile.current_weight;
  const targetWeight = profile.target_weight;

  const trainedDaysThisWeek = new Set((weekEntries ?? []).map((e) => e.logged_at)).size;
  const checkedExercisesThisWeek = weekEntries?.length ?? 0;

  return (
    <div className="app-shell">
      <Sidebar
        variant="aluno"
        accountName={`${profile.name ?? "Aluno"} · Aluno`}
        currentWeight={profile.current_weight}
        targetWeight={targetWeight}
        sections={ALUNO_SIDEBAR_SECTIONS}
        unit={unit}
      />
      <main className="main-content">
        <div className="fx-app">
          <div className="top">
            <div className="eyebrow">Projeto Fênix · Meu Perfil</div>
            <h1>{profile.name || "Meu Perfil"}</h1>
            <div className="sub">
              {profile.goal ? GOAL_LABELS[profile.goal] : "Objetivo não definido"}
            </div>
          </div>

          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <h2 style={{ marginTop: 0 }}>Resumo</h2>
              <Link href="/onboarding" className="btn ghost">
                ⚙️ Editar metas
              </Link>
            </div>
            <div className="summary-grid">
              <div className="sum-card">
                <div className="label">Nível atual</div>
                <div className="value" style={{ fontSize: 16 }}>
                  {profile.current_tier ? TIER_LABELS[profile.current_tier] : "—"}
                </div>
              </div>
              <div className="sum-card">
                <div className="label">Objetivo</div>
                <div className="value" style={{ fontSize: 16 }}>
                  {profile.goal ? GOAL_LABELS[profile.goal] : "—"}
                </div>
              </div>
              <div className="sum-card">
                <div className="label">Peso atual</div>
                <div className="value">
                  {currentWeight != null ? formatWeight(currentWeight, unit) : "—"}
                </div>
              </div>
              <div className="sum-card">
                <div className="label">Peso-alvo</div>
                <div className="value">
                  {targetWeight != null ? formatWeight(targetWeight, unit) : "—"}
                </div>
              </div>
            </div>
          </div>

          {personal ? (
            <div className="card">
              <h2>🔗 Personal vinculado</h2>
              <div className="sub" style={{ marginBottom: 12 }}>
                Você está vinculado a <b>{personal.name ?? "um personal"}</b>.
              </div>
              <Link href="/perfil/vincular-personal" className="btn ghost">
                Trocar vínculo
              </Link>
            </div>
          ) : (
            <div className="card">
              <h2>🔗 Sem personal vinculado</h2>
              <div className="sub" style={{ marginBottom: 12 }}>
                Tem um código de convite? Vincule-se ao seu personal para liberar
                o acompanhamento e o chat.
              </div>
              <Link href="/perfil/vincular-personal" className="btn">
                Vincular personal
              </Link>
            </div>
          )}

          <div className="card">
            <h2>Evolução do peso</h2>
            <WeightChart data={logs} target={targetWeight} unit={unit} />
          </div>

          <div className="card">
            <h2>Treino desta semana</h2>
            <div className="summary-grid">
              <div className="sum-card">
                <div className="label">Dias com treino registrado</div>
                <div className="value">{trainedDaysThisWeek}</div>
              </div>
              <div className="sum-card">
                <div className="label">Exercícios marcados como feitos</div>
                <div className="value">{checkedExercisesThisWeek}</div>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <Link href="/treino" className="btn ghost">
                Ir para o treino
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
