import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeStreak } from "@/lib/streak";
import { TIER_LABELS } from "@/lib/fenix-domain";
import TopBar from "@/components/TopBar";
import WeightChart from "@/components/WeightChart";
import ChatThread from "@/components/ChatThread";
import QuickAddWeight from "./QuickAddWeight";

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
  const currentWeight = profile.current_weight;
  const targetWeight = profile.target_weight;
  const diff =
    currentWeight != null && targetWeight != null
      ? +(currentWeight - targetWeight).toFixed(1)
      : null;

  return (
    <>
      <TopBar
        title="Painel de evolução"
        nav={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/medidas", label: "Medidas" },
          { href: "/treino", label: "Treino" },
          { href: "/fotos", label: "Fotos" },
        ]}
      />
      <div className="fx-app">
        {personal && (
          <div className="card">
            <h2>💬 Conversa com seu personal{personal.name ? ` (${personal.name})` : ""}</h2>
            <ChatThread
              alunoId={user.id}
              personalId={personal.id}
              senderRole="aluno"
              compact
            />
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
            <div className={"fx-streak-pill" + (streak === 0 ? " fx-streak-zero" : "")}>
              <span>🔥</span>
              <span>{streak} dia{streak === 1 ? "" : "s"} seguidos</span>
            </div>
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
    </>
  );
}
