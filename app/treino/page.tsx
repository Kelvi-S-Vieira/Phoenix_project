import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import SplitPicker from "./SplitPicker";
import TreinoBoard from "./TreinoBoard";
import { DAYS, SPLITS, type DayKey, type SplitKey } from "@/lib/treino-basico-data";

// Monday-first weekday order, matching DAYS/SPLITS ("seg"..."dom").
// Date#getDay() is Sunday-first (0 = domingo), so remap it here.
const JS_DAY_TO_KEY: DayKey[] = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];

export default async function TreinoPage() {
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

  return (
    <>
      <TopBar
        title="Treino"
        nav={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/medidas", label: "Medidas" },
          { href: "/treino", label: "Treino" },
          { href: "/fotos", label: "Fotos" },
        ]}
      />
      <div className="fx-app">
        {profile.current_tier !== "treino-basico" ? (
          <div className="card">
            <h2>Treino</h2>
            <div className="fx-empty-state">
              Seu personal ainda não te atribuiu o nível Básico, ou você está
              em Intermediário/Avançado — essas versões chegam em breve nesta
              plataforma web.
            </div>
          </div>
        ) : !profile.current_split ? (
          <div className="card">
            <h2>Escolha sua frequência semanal</h2>
            <SplitPicker profileId={user.id} />
          </div>
        ) : (
          <TreinoContent profileId={user.id} splitKey={profile.current_split as SplitKey} />
        )}
      </div>
    </>
  );
}

async function TreinoContent({
  profileId,
  splitKey,
}: {
  profileId: string;
  splitKey: SplitKey;
}) {
  const split = SPLITS[splitKey];
  if (!split) {
    // Defensive: current_split holds a key from a tier this page doesn't
    // know about (shouldn't happen for treino-basico, but don't crash).
    return (
      <div className="card">
        <h2>Treino</h2>
        <div className="fx-empty-state">
          Split não reconhecido para o nível Básico. Fale com seu personal.
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data: entries } = await supabase
    .from("workout_log_entries")
    .select("exercise_id, checked, sets, reps, load")
    .eq("profile_id", profileId)
    .eq("logged_at", today);

  const initialLog: Record<
    string,
    { checked: boolean; sets: string; reps: string; load: string }
  > = {};
  for (const e of entries ?? []) {
    initialLog[e.exercise_id] = {
      checked: e.checked,
      sets: e.sets != null ? String(e.sets) : "",
      reps: e.reps != null ? String(e.reps) : "",
      load: e.load != null ? String(e.load) : "",
    };
  }

  const todayKey = JS_DAY_TO_KEY[new Date().getDay()];
  const defaultDay: DayKey | null = split.week[todayKey]
    ? todayKey
    : DAYS.find((d) => split.week[d.key])?.key ?? null;

  return (
    <div className="card">
      <h2>{split.label}</h2>
      <p className="sub" style={{ marginBottom: 16 }}>
        {split.desc}
      </p>
      <TreinoBoard
        profileId={profileId}
        split={split}
        initialLog={initialLog}
        defaultDay={defaultDay}
      />
    </div>
  );
}
