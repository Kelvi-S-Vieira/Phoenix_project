import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import { ALUNO_SIDEBAR_SECTIONS } from "@/lib/sidebar-nav";
import { getServerWeightUnit } from "@/lib/weight-unit-server";
import DietPicker from "./DietPicker";

// Tipo de dieta — escolhe como a meta calórica diária é dividida em
// proteína/carboidrato/gordura. Modelo visual aprovado: aba "Escolher dieta"
// de modelo-diario-dieta.html. A escolha grava em profiles (diet_type,
// fasting_window e metas P/C/G); a meta calórica NÃO muda.
export default async function DietaPage() {
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
            <div className="eyebrow">Projeto Fênix · Nutrição</div>
            <h1>Tipo de dieta</h1>
            <div className="sub">
              Escolha como distribuir suas calorias. A meta diária vem do seu perfil e do objetivo;
              a dieta muda a proporção de proteína, carboidrato e gordura.
            </div>
          </div>

          {profile.calorie_target == null ? (
            <div className="fx-diet-warning">
              Defina sua meta calórica antes de escolher uma dieta: abra{" "}
              <Link href="/onboarding">Editar metas</Link> e conclua o cálculo.
            </div>
          ) : (
            <DietPicker
              profileId={user.id}
              calorieTarget={profile.calorie_target}
              currentDiet={profile.diet_type}
              currentFastingWindow={profile.fasting_window}
            />
          )}

          <div className="footer-note">PROJETO FÊNIX — mesma energia, outra divisão.</div>
        </div>
      </main>
    </div>
  );
}
