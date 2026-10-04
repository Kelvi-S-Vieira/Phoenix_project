import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import { ALUNO_SIDEBAR_SECTIONS } from "@/lib/sidebar-nav";
import { getServerWeightUnit } from "@/lib/weight-unit-server";
import RecipesFitBrowser from "./RecipesFitBrowser";

// Receitas Fit c/ Suplementos — ported from the prototype's
// #page-receitas-supl (projeto_fenix_app_final.html, markup ~lines
// 4504-4517, module logic ~lines 15767-15821). Pure reference content
// (SUPPLEMENT_RECIPES, static TS data in lib/supplement-recipes.ts)
// filtered client-side by goal — no per-user state.
export default async function ReceitasFitPage() {
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
    .eq("kind", "receita_fit");
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
            <div className="eyebrow">Projeto Fênix · Receitas com suplementos</div>
            <h1>Receitas Fit c/ Suplementos</h1>
            <div className="sub">
              Shakes, panquecas e lanches usando whey, hipercalórico e afins — pra bater a meta
              de proteína/kcal do dia sem enrolação.
            </div>
          </div>

          <RecipesFitBrowser profileId={user.id} recommendedNames={recommendedNames} />

          <div className="footer-note">
            PROJETO FÊNIX — proteína também pode ser gostosa.
          </div>
        </div>
      </main>
    </div>
  );
}
