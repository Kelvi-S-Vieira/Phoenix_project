import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import { ALUNO_SIDEBAR_SECTIONS } from "@/lib/sidebar-nav";
import { getServerWeightUnit } from "@/lib/weight-unit-server";
import MarmitasTabs from "./MarmitasTabs";
import type { UserRecipe } from "@/lib/database.types";

// Ported from the prototype's `defaultRecipes` (projeto_fenix_app_final.html,
// ~lines 12940-12952) — seeded into `user_recipes` the first time a profile
// has zero rows there, same pattern as the Dashboard's DEFAULT_LIFTS
// (app/dashboard/page.tsx / migration_dashboard_lifts_cardio.sql).
const DEFAULT_RECIPES = [
  {
    name: "Frango grelhado, arroz e legumes",
    yield_count: 4,
    ingredients: [
      { name: "Peito de frango", qty: 800, unit: "g" },
      { name: "Arroz", qty: 2, unit: "xíc" },
      { name: "Brócolis", qty: 1, unit: "unid" },
      { name: "Cenoura", qty: 2, unit: "unid" },
    ],
  },
];

// Marmitas — ported from the prototype's #page-marmitas (projeto_fenix_app_
// final.html, markup ~lines 4419-4466, module logic ~lines 12935-15172).
// The prototype kept recipes/plan/extras in localStorage (RECIPES_KEY,
// PLAN_KEY, EXTRAS_KEY); here they're real per-user tables (user_recipes,
// meal_prep_plan, shopping_extras — see supabase/migration_alimentacao.sql).
// SUGGESTED_RECIPES stays static TS data (lib/marmita-suggestions.ts).
export default async function MarmitasPage() {
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

  const [{ data: recipes }, { data: planRows }, { data: extras }] = await Promise.all([
    supabase
      .from("user_recipes")
      .select("*")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: true }),
    supabase.from("meal_prep_plan").select("*").eq("profile_id", user.id),
    supabase
      .from("shopping_extras")
      .select("*")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: true }),
  ]);

  // Seed the default recipe the first time this profile has none.
  let recipeRows: UserRecipe[] = recipes ?? [];
  if (recipeRows.length === 0) {
    const { data: seeded } = await supabase
      .from("user_recipes")
      .insert(DEFAULT_RECIPES.map((r) => ({ ...r, profile_id: user.id })))
      .select("*")
      .order("created_at", { ascending: true });
    recipeRows = seeded ?? [];
  }

  const planMap: Record<string, number> = {};
  for (const row of planRows ?? []) {
    planMap[row.user_recipe_id] = row.desired_count;
  }

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
            <div className="eyebrow">Projeto Fênix · Volume 3</div>
            <h1>Marmitas &amp; lista de compras</h1>
            <div className="sub">
              Cadastre suas receitas, defina quantas marmitas quer na semana e a lista de
              compras se monta sozinha.
            </div>
          </div>

          <MarmitasTabs
            profileId={user.id}
            initialRecipes={recipeRows}
            initialPlan={planMap}
            initialExtras={extras ?? []}
          />

          <div className="footer-note">PROJETO FÊNIX — a lista muda, o hábito fica.</div>
        </div>
      </main>
    </div>
  );
}
