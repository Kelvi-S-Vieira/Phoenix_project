import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { todayBR } from "@/lib/date-br";
import Sidebar from "@/components/Sidebar";
import { ALUNO_SIDEBAR_SECTIONS } from "@/lib/sidebar-nav";
import { getServerWeightUnit } from "@/lib/weight-unit-server";
import DateNav from "./DateNav";
import SummaryCards from "./SummaryCards";
import AddFood from "./AddFood";
import EntriesList from "./EntriesList";

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

          <SummaryCards entries={entries ?? []} targets={targets} />

          <div className="card">
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
