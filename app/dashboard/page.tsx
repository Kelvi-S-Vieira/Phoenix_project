import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeStreak } from "@/lib/streak";
import { BADGES } from "@/lib/fenix-domain";
import { checkAndUnlockBadges } from "@/lib/badges";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import WeightChart from "@/components/WeightChart";
import ChatThread from "@/components/ChatThread";
import QuickAddWeight from "./QuickAddWeight";
import LiftsCard from "./LiftsCard";
import CardioCard from "./CardioCard";
import FlameGauge from "./FlameGauge";
import ExportDataButton from "./ExportDataButton";
import PrintSummaryButton from "./PrintSummaryButton";
import { ALUNO_SIDEBAR_SECTIONS } from "@/lib/sidebar-nav";
import type { Lift, WeeklyCardio } from "@/lib/database.types";
import { getServerWeightUnit } from "@/lib/weight-unit-server";
import { formatWeight, toDisplayWeight, type WeightUnit } from "@/lib/weight-unit";

// Ported from the prototype's defaultLifts (projeto_fenix_app_final.html,
// ~lines 5625-5629) — seeded into `lifts` the first time a profile has zero
// rows there, instead of being a hardcoded localStorage default.
const DEFAULT_LIFTS = [
  { name: "Supino", start_value: 60, current_value: 60, unit: "kg", sort_order: 0 },
  { name: "Hack", start_value: 100, current_value: 100, unit: "kg", sort_order: 1 },
  { name: "Leg Press", start_value: 150, current_value: 150, unit: "kg", sort_order: 2 },
];

// Body-weight values (always stored in kg) formatted per the viewer's kg/lb
// preference — see lib/weight-unit.ts. `lifts`/cardio weights above are a
// different quantity (load lifted, not body weight) and are left in kg.
function fmtKg(n: number, unit: WeightUnit): string {
  return formatWeight(n, unit);
}

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

  const unit = await getServerWeightUnit();

  const [
    { data: weightLogs },
    { data: activityDays },
    { data: personal },
    { data: lifts },
    { data: weeklyCardio },
  ] = await Promise.all([
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
    supabase
      .from("lifts")
      .select("*")
      .eq("profile_id", user.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("weekly_cardio")
      .select("*")
      .eq("profile_id", user.id)
      .maybeSingle(),
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

  // Seed the 3 default lifts the first time this profile has none, instead
  // of a DB trigger — see supabase/migration_dashboard_lifts_cardio.sql.
  let liftsRows: Lift[] = lifts ?? [];
  if (liftsRows.length === 0) {
    const { data: seeded } = await supabase
      .from("lifts")
      .insert(DEFAULT_LIFTS.map((l) => ({ ...l, profile_id: user.id })))
      .select("*")
      .order("sort_order", { ascending: true });
    liftsRows = seeded ?? [];
  }

  // Likewise, ensure a weekly_cardio row exists for this profile.
  let cardioRow: WeeklyCardio | null = weeklyCardio ?? null;
  if (!cardioRow) {
    const { data: seededCardio } = await supabase
      .from("weekly_cardio")
      .insert({ profile_id: user.id })
      .select("*")
      .single();
    cardioRow = seededCardio ?? null;
  }

  const logs = weightLogs ?? [];
  const currentWeight =
    logs.length > 0 ? logs[logs.length - 1].weight : profile.current_weight ?? 0;
  const goalStart = logs.length > 0 ? logs[0].weight : profile.current_weight ?? currentWeight;
  const targetWeight = profile.target_weight;
  const hasTarget = targetWeight != null;

  const lost = goalStart - currentWeight;
  const left = hasTarget ? Math.max(currentWeight - targetWeight!, 0) : null;
  const totalRange = hasTarget ? goalStart - targetWeight! : null;
  const pct = hasTarget && totalRange ? Math.min(Math.max(lost / totalRange, 0), 1) : 0;

  const lastUpdate =
    logs.length > 0
      ? new Date(logs[logs.length - 1].logged_at + "T00:00:00").toLocaleDateString("pt-BR")
      : "—";

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

          <div className="hero">
            <div className="eyebrow">
              {profile.name ? `${profile.name} · ` : ""}
              {hasTarget ? `${fmtKg(goalStart, unit)} → ${fmtKg(targetWeight!, unit)}` : "mantendo o peso"}
            </div>
            <h1>Painel de evolução</h1>
            <div className="hero-main">
              <FlameGauge
                pct={pct}
                label={hasTarget ? `${Math.round(pct * 100)}% até a meta` : "sem meta definida"}
              />
              <div className="weight-block">
                <span className="label">Peso atual</span>
                <div className="weight-row">
                  <span className="big-number">{toDisplayWeight(currentWeight, unit)}</span>
                  <span className="unit">{unit}</span>
                </div>
                <div className="stats-row">
                  <div className="stat">
                    <span className="n">{(lost >= 0 ? "" : "+") + fmtKg(Math.abs(lost), unit)}</span>
                    <span className="l">Perdido</span>
                  </div>
                  <div className="stat">
                    <span className="n">{hasTarget ? fmtKg(left!, unit) : "—"}</span>
                    <span className="l">{hasTarget ? "Faltam p/ meta" : "Sem meta definida"}</span>
                  </div>
                  <div className="stat">
                    <span className="n">{hasTarget ? fmtKg(targetWeight!, unit) : "—"}</span>
                    <span className="l">Meta final</span>
                  </div>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${(pct * 100).toFixed(1)}%` }} />
                </div>
                <div className="progress-labels">
                  <span>{fmtKg(goalStart, unit)}</span>
                  <span>{hasTarget ? fmtKg(targetWeight!, unit) : "— (manutenção)"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="fx-streak-badges-strip">
            <div
              className={
                "fx-streak-pill" +
                (streak === 0 ? " fx-streak-zero" : "") +
                (streak >= 30 ? " fx-streak-tier2" : streak >= 7 ? " fx-streak-tier1" : "")
              }
            >
              <span className="fx-streak-flame">{streak >= 30 ? "🔥🔥" : "🔥"}</span>
              <span>
                {streak} dia{streak === 1 ? "" : "s"} seguidos
              </span>
            </div>
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

          <div className="dash-grid">
            <div className="card chart-card full">
              <h2>
                Evolução do peso <span className="tag">{lastUpdate}</span>
              </h2>
              <WeightChart data={logs} target={targetWeight} unit={unit} />
              <div className="checkin-form">
                <QuickAddWeight profileId={user.id} unit={unit} />
              </div>
            </div>

            <div className="card">
              <h2>
                Cargas <span className="tag">desde o início</span>
              </h2>
              <LiftsCard profileId={user.id} initialLifts={liftsRows} />
            </div>

            <div className="card">
              <h2>Cardio</h2>
              {cardioRow && <CardioCard profileId={user.id} initialCardio={cardioRow} />}
            </div>

            <div className="card">
              <h2>Composição corporal</h2>
              <div className="kv-list">
                <div className="kv-item">
                  <span className="k">Massa muscular</span>
                  <span className="v arrow-up">↑ preservar/ganhar</span>
                </div>
                <div className="kv-item">
                  <span className="k">Gordura corporal</span>
                  <span className="v arrow-down">↓ reduzindo</span>
                </div>
                <div className="kv-item">
                  <span className="k">Fase atual</span>
                  <span className="v">
                    {hasTarget ? `${fmtKg(goalStart, unit)} → ${fmtKg(targetWeight!, unit)}` : "Manutenção"}
                  </span>
                </div>
              </div>
            </div>

            <div className="card">
              <h2>Metas da fase</h2>
              <div className="kv-list">
                <div className="kv-item">
                  <span className="k">Calorias/dia</span>
                  <span className="v">
                    {profile.calorie_target ? `${profile.calorie_target} kcal` : "— (definir no Perfil)"}
                  </span>
                </div>
                <div className="kv-item">
                  <span className="k">Proteína/dia</span>
                  <span className="v">
                    {profile.protein_target ? `${profile.protein_target} g` : "— (definir no Perfil)"}
                  </span>
                </div>
                <div className="kv-item">
                  <span className="k">Cardio</span>
                  <span className="v">4x · 30 min</span>
                </div>
                <div className="kv-item">
                  <span className="k">Meta final</span>
                  <span className="v">{hasTarget ? fmtKg(targetWeight!, unit) : "—"}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h2>Conta &amp; dados</h2>
              <div className="fx-account-actions">
                <PrintSummaryButton />
                <div className="fx-account-hint">
                  Abre a janela de impressão do navegador — escolha &quot;Salvar como PDF&quot; no
                  destino.
                </div>
                <div className="fx-account-divider" />
                <ExportDataButton />
              </div>
            </div>
          </div>

          <div className="footer-note">
            PROJETO FÊNIX — atualizado por você, semana a semana.
          </div>
        </div>
      </main>
    </div>
  );
}
