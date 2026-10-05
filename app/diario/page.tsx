import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { todayBR, dateStrOffsetBR } from "@/lib/date-br";
import { computeStreak } from "@/lib/streak";
import { computeWaterTargetMl } from "@/lib/fenix-domain";
import Sidebar from "@/components/Sidebar";
import { ALUNO_SIDEBAR_SECTIONS } from "@/lib/sidebar-nav";
import { getServerWeightUnit } from "@/lib/weight-unit-server";
import DateNav from "./DateNav";
import SummaryCards from "./SummaryCards";
import AddFood from "./AddFood";
import EntriesList from "./EntriesList";
import DiaryTop from "./DiaryTop";
import WeekStrip from "./WeekStrip";
import DietChip from "./DietChip";
import WaterTracker from "./WaterTracker";
import type { FlameGoal } from "./FlameBar";

function weekDaysOf(dateStr: string): string[] {
  const [y, m, d] = dateStr.split("-").map(Number);
  const anchor = new Date(Date.UTC(y, m - 1, d));
  const diffToMonday = (anchor.getUTCDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) => {
    const t = new Date(anchor);
    t.setUTCDate(anchor.getUTCDate() - diffToMonday + i);
    return t.toISOString().slice(0, 10);
  });
}

// Diário alimentar — ported from the prototype's #page-diario
// (projeto_fenix_app_final.html, lines 3812-3909 + the Diário module
// ~lines 17550-17808). The prototype kept the whole log in localStorage
// (`fenix_diary_log`, keyed by date); here it's the `diary_entries` table,
// one row per logged item, filtered by the selected date server-side.
export default async function DiarioPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
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

  const { date } = await searchParams;
  const selectedDate = date || todayBR();

  const { data: entries } = await supabase
    .from("diary_entries")
    .select("*")
    .eq("profile_id", user.id)
    .eq("logged_at", selectedDate)
    .order("created_at", { ascending: true });

  const today = todayBR();
  const weekDays = weekDaysOf(selectedDate);
  // Dias com registro (semana exibida + últimos 60 dias) para a tira da
  // semana e a sequência de dias seguidos.
  const sinceDate = [weekDays[0], dateStrOffsetBR(-60)].sort()[0];
  const { data: logged } = await supabase
    .from("diary_entries")
    .select("logged_at")
    .eq("profile_id", user.id)
    .gte("logged_at", sinceDate);
  const loggedDates = Array.from(new Set((logged ?? []).map((r) => r.logged_at)));
  const streak = computeStreak(loggedDates);

  const list = entries ?? [];
  const sum = (f: (e: (typeof list)[number]) => number) => list.reduce((s, e) => s + f(e), 0);
  const mealKcal = {
    cafe: sum((e) => (e.meal === "cafe" ? e.kcal : 0)),
    almoco: sum((e) => (e.meal === "almoco" ? e.kcal : 0)),
    lanche: sum((e) => (e.meal === "lanche" ? e.kcal : 0)),
    jantar: sum((e) => (e.meal === "jantar" ? e.kcal : 0)),
  };
  const goal: FlameGoal =
    profile.goal === "ganhar" ? "ganhar" : profile.goal === "manter" ? "manter" : "emagrecer";
  const waterTargetMl = profile.current_weight
    ? computeWaterTargetMl(profile.current_weight, profile.activity_level)
    : 2000;

  const targets = {
    kcal: profile.calorie_target,
    protein: profile.protein_target,
    carb: profile.carb_target,
    fat: profile.fat_target,
  };

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
            <div>
              <div className="eyebrow">Projeto Fênix · Diário</div>
              <h1>Diário alimentar</h1>
              <div className="sub">
                Registre o que comeu, veja o total do dia contra sua meta.
              </div>
            </div>
            <DateNav selectedDate={selectedDate} />
          </div>

          <WeekStrip
            weekDays={weekDays}
            selectedDate={selectedDate}
            today={today}
            loggedDates={loggedDates}
            streak={streak}
          />
          <DietChip dietType={profile.diet_type} fastingWindow={profile.fasting_window} />

          <DiaryTop
            isToday={selectedDate === today}
            kcalTarget={targets.kcal ?? 0}
            kcalConsumed={sum((e) => e.kcal)}
            macros={{
              protein: sum((e) => e.protein),
              carb: sum((e) => e.carb),
              fat: sum((e) => e.fat),
            }}
            macroTargets={{ protein: targets.protein, carb: targets.carb, fat: targets.fat }}
            mealKcal={mealKcal}
            goal={goal}
            streak={streak}
          />

          <WaterTracker key={selectedDate} date={selectedDate} targetMl={waterTargetMl} />

          <SummaryCards entries={list} targets={targets} />

          <div className="card" id="adicionar">
            <h2>Adicionar alimento</h2>
            <AddFood profileId={user.id} selectedDate={selectedDate} />
          </div>

          <div className="card">
            <h2>Refeições do dia</h2>
            <EntriesList entries={entries ?? []} />
          </div>
        </div>
      </main>
    </div>
  );
}
