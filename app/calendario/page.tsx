import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import { ALUNO_SIDEBAR_SECTIONS } from "@/lib/sidebar-nav";
import { getServerWeightUnit } from "@/lib/weight-unit-server";
import { todayBR } from "@/lib/date-br";
import CalendarGrid from "./CalendarGrid";

const DEFAULT_WINDOW_DAYS = 84; // 12 weeks, matching the prototype's own default length.

export default async function CalendarioPage() {
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
    .select("start_date, weeks")
    .eq("profile_id", user.id)
    .maybeSingle();

  let startDate: string;
  let totalDays: number;

  if (plan) {
    // An active Montar Plano owns the window — size the grid to its actual
    // duration instead of the fixed 84-day fallback.
    startDate = plan.start_date;
    totalDays = plan.weeks * 7;
  } else if (profile.calendar_start_date) {
    startDate = profile.calendar_start_date;
    totalDays = DEFAULT_WINDOW_DAYS;
  } else {
    // First time this profile opens Calendário with no active plan — anchor
    // the rolling window to today and persist it, so future visits (even
    // after today rolls over) use the same start date instead of drifting.
    startDate = todayBR();
    totalDays = DEFAULT_WINDOW_DAYS;
    await supabase.from("profiles").update({ calendar_start_date: startDate }).eq("id", user.id);
  }

  const endDate = new Date(startDate + "T00:00:00Z");
  endDate.setUTCDate(endDate.getUTCDate() + totalDays - 1);
  const endDateIso = endDate.toISOString().slice(0, 10);

  const { data: days } = await supabase
    .from("calendar_days")
    .select("day_date, status, note")
    .eq("profile_id", user.id)
    .gte("day_date", startDate)
    .lte("day_date", endDateIso);

  const initialData: Record<string, { status: "treino" | "cardio" | "descanso" | null; note: string | null }> = {};
  for (const d of days ?? []) {
    initialData[d.day_date] = { status: d.status, note: d.note };
  }

  const subtitle =
    profile.current_weight != null && profile.target_weight != null
      ? `${Math.ceil(totalDays / 7)} semanas, acompanhando seu progresso rumo à meta. Clique num dia pra registrar o que aconteceu.`
      : `${Math.ceil(totalDays / 7)} semanas. Clique num dia pra registrar o que aconteceu.`;

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
            <div className="eyebrow">Projeto Fênix · {totalDays} dias</div>
            <h1>Calendário de execução</h1>
            <div className="sub">{subtitle}</div>
          </div>

          <CalendarGrid
            profileId={user.id}
            startDate={startDate}
            totalDays={totalDays}
            todayIso={todayBR()}
            initialData={initialData}
          />

          <footer className="footer-note">PROJETO FÊNIX — {totalDays} dias, um de cada vez.</footer>
        </div>
      </main>
    </div>
  );
}
