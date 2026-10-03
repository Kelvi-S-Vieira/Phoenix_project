import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import OnboardingWizard from "./OnboardingWizard";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "role, onboarding_completed, sex, age, height, current_weight, target_weight, activity_level, goal"
    )
    .eq("id", user.id)
    .single();

  if (!profile?.role) redirect("/complete-profile");
  if (profile.role === "personal") redirect("/personal");

  // First-time setup (onboarding_completed = false) always lands here on the
  // blank wizard, same as before. Once it's true, this page stays reachable
  // (via the sidebar's "Meu Perfil" link) but switches to "edit" mode: the
  // same wizard, pre-filled from the saved profile, instead of redirecting
  // past it to /dashboard.
  const mode = profile.onboarding_completed ? "edit" : "setup";

  return (
    <>
      <TopBar title="Projeto Fênix" />
      <div className="fx-app">
        <OnboardingWizard
          mode={mode}
          initialProfile={{
            sex: profile.sex,
            age: profile.age,
            height: profile.height,
            weight: profile.current_weight,
            activity: profile.activity_level,
            goal: profile.goal,
            targetWeight: profile.target_weight,
          }}
        />
      </div>
    </>
  );
}
