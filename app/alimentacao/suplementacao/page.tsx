import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import { ALUNO_SIDEBAR_SECTIONS } from "@/lib/sidebar-nav";
import { getServerWeightUnit } from "@/lib/weight-unit-server";
import SupplementsBrowser from "./SupplementsBrowser";

// Suplementação — ported from the prototype's #page-suplementacao
// (projeto_fenix_app_final.html, markup ~lines 4487-4502, module logic
// ~lines 15397-15663). Pure reference content (SUPPLEMENTS, static TS data
// in lib/supplements.ts) filtered client-side by category, with the
// initial category pre-selected from the profile's goal (GOAL_TO_CATEGORY
// in the prototype) — there's no per-user state to persist server-side.
export default async function SuplementacaoPage() {
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

  // Badge any catalog item the user accepted in Montar Plano's "plano
  // inicial recomendado" step (see app/montar-plano/PlanRecommendStep.tsx).
  const { data: picks } = await supabase
    .from("plan_recommendation_picks")
    .select("ref_name")
    .eq("profile_id", user.id)
    .eq("kind", "supplement");
  const recommendedNames = (picks ?? []).map((p) => p.ref_name);

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
            <div className="eyebrow">Projeto Fênix · Suplementação</div>
            <h1>Suplementação por objetivo</h1>
            <div className="sub">
              Suplemento não substitui treino nem dieta — é só o último 5%. Escolha pelo seu
              objetivo atual.
            </div>
          </div>

          <div className="sup-disclaimer">
            ⚠️ Conteúdo informativo, não é indicação médica. Antes de começar a usar qualquer
            suplemento, converse com um nutricionista ou médico.
          </div>

          <SupplementsBrowser recommendedNames={recommendedNames} />

          <div className="footer-note">
            PROJETO FÊNIX — suplemento ajuda quem já treina e come direito.
          </div>
        </div>
      </main>
    </div>
  );
}
