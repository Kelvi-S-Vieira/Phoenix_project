import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeStreak } from "@/lib/streak";
import { TIER_LABELS, BADGES } from "@/lib/fenix-domain";
import { checkAndUnlockBadges } from "@/lib/badges";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import WeightChart from "@/components/WeightChart";
import ChatThread from "@/components/ChatThread";
import QuickAddWeight from "./QuickAddWeight";
import { ALUNO_SIDEBAR_SECTIONS } from "@/lib/sidebar-nav";

export default async function DashboardPage() {
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

  const [{ data: weightLogs }, { data: activityDays }, { data: personal }] =
    await Promise.all([
      supabase
        .from("weight_logs")
        .select("logged_at, weight")
        .eq("profile_id", user.id)
        .order("logged_at", { ascending: true }),
      supabase
        .from("activity_days")
        .select("activity_date")
        .eq("profile_id", user.id),
      profile.linked_personal_id
        ? supabase
            .from("profiles")
            .select("id, name")
            .eq("id", profile.linked_personal_id)
            .single()
        : Promise.resolve({ data: null as { id: string; name: string | null } | null }),
    ]);

  const streak = computeStreak((activityDays ?? []).map((d) => d.activity_date));

  // Cheap enough to run on every dashboard load (same call the prototype
  // made on every Dashboard open) — persists any newly-earned badges.
  await checkAndUnlockBadges(supabase, user.id);
  const { data: unlockedBadges } = await supabase
    .from("badges_unlocked")
    .select("badge_key")
    .eq("profile_id", user.id);
  const unlockedBadgeKeys = new Set((unlockedBadges ?? []).map((b) => b.badge_key));

  const currentWeight = profile.current_weight;
  const targetWeight = profile.target_weight;
  const diff =
    currentWeight != null && targetWeight != null
      ? +(currentWeight - targetWeight).toFixed(1)
      : null;

  return (
    <div className="app-shell">
      <Sidebar
        variant="aluno"
        accountName={`${profile.name ?? "Aluno"} · Aluno`}
        currentWeight={currentWeight}
        targetWeight={targetWeight}
        sections={ALUNO_SIDEBAR_SECTIONS}
      />
      <main className="main-content">
      <div className="fx-app">
        <div className="top">
          <div className="eyebrow">Projeto Fênix</div>
          <h1>Painel de evolução</h1>
        </div>

        {personal ? (
          <div className="card">
            <h2>💬 Conversa com seu personal{personal.name ? ` (${personal.name})` : ""}</h2>
            <ChatThread
              alunoId={user.id}
              personalId={personal.id}
              senderRole="aluno"
              compact
            />
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

        <div className="summary-grid">
          <div className="sum-card">
            <div className="label">Peso atual</div>
            <div className="value">
              {currentWeight != null ? currentWeight : "—"}
              <span className="unit"> kg</span>
            </div>
          </div>
          <div className="sum-card">
            <div className="label">Meta</div>
            <div className="value">
              {targetWeight != null ? targetWeight : "—"}
              <span className="unit"> kg</span>
            </div>
            {diff != null && (
              <div className="sub" style={{ marginTop: 2, fontSize: 12 }}>
                {diff > 0 ? `faltam ${diff}kg` : diff < 0 ? `${Math.abs(diff)}kg abaixo` : "na meta!"}
              </div>
            )}
          </div>
          <div className="sum-card">
            <div className="label">Meta calórica</div>
            <div className="value" style={{ fontSize: 20 }}>
              {profile.calorie_target ?? "—"} <span className="unit">kcal</span>
            </div>
          </div>
          <div className="sum-card">
            <div className="label">Sequência</div>
            <div
              className={
                "fx-streak-pill" +
                (streak === 0 ? " fx-streak-zero" : "") +
                (streak >= 30 ? " fx-streak-tier2" : streak >= 7 ? " fx-streak-tier1" : "")
              }
            >
              <span className="fx-streak-flame">{streak >= 30 ? "🔥🔥" : "🔥"}</span>
              <span>{streak} dia{streak === 1 ? "" : "s"} seguidos</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>🏆 Conquistas</h2>
          <div className="fx-badges-row">
            {Object.entries(BADGES).map(([key, badge]) => {
              const unlocked = unlockedBadgeKeys.has(key);
              return (
                <div
                  key={key}
                  className={"fx-badge-chip" + (unlocked ? " unlocked" : " locked")}
                  title={unlocked ? badge.label : `Bloqueada: ${badge.label}`}
                >
                  <span className="fx-badge-icon">{unlocked ? badge.icon : "🔒"}</span>
                  <span className="fx-badge-label">{badge.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h2>Registrar peso</h2>
          <QuickAddWeight profileId={user.id} />
        </div>

        <div className="card">
          <h2>Evolução do peso</h2>
          <WeightChart data={weightLogs ?? []} target={targetWeight} />
        </div>

        {profile.current_tier && (
          <div className="card">
            <h2>Treino atual</h2>
            <div className="sub">
              Tier: <strong>{TIER_LABELS[profile.current_tier]}</strong>
              {profile.current_split ? ` · Split: ${profile.current_split}` : ""}
            </div>
          </div>
        )}

        <div className="footer-note">
          PROJETO FÊNIX — cada registro é um dado a mais, não um julgamento.
        </div>
      </div>
      </main>
    </div>
  );
}
