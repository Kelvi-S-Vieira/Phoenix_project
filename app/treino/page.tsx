import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import SplitPicker from "./SplitPicker";
import TierPicker from "./TierPicker";
import TreinoBoard from "./TreinoBoard";
import { DAYS, type DayKey, type TierWorkoutData } from "@/lib/treino-shared-types";
import * as treinoBasico from "@/lib/treino-basico-data";
import * as treinoIntermediario from "@/lib/treino-intermediario-data";
import * as treinoAvancado from "@/lib/treino-avancado-data";
import type { Tier } from "@/lib/database.types";

// Each tier's own data module keeps its own stricter MuscleGroupKey/SplitKey
// unions; this lookup only needs the generic (string-keyed) shape so the
// page/components can work with whichever tier is active.
const TIER_DATA: Record<Tier, TierWorkoutData> = {
  "treino-basico": {
    MUSCLE_GROUPS: treinoBasico.MUSCLE_GROUPS,
    WORKOUT_TYPES: treinoBasico.WORKOUT_TYPES,
    SPLITS: treinoBasico.SPLITS,
  },
  "treino-intermediario": {
    MUSCLE_GROUPS: treinoIntermediario.MUSCLE_GROUPS,
    WORKOUT_TYPES: treinoIntermediario.WORKOUT_TYPES,
    SPLITS: treinoIntermediario.SPLITS,
  },
  "treino-avancado": {
    MUSCLE_GROUPS: treinoAvancado.MUSCLE_GROUPS,
    WORKOUT_TYPES: treinoAvancado.WORKOUT_TYPES,
    SPLITS: treinoAvancado.SPLITS,
  },
};

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

  const tierData = profile.current_tier ? TIER_DATA[profile.current_tier as Tier] : null;

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
        {!profile.current_tier || !tierData ? (
          profile.linked_personal_id ? (
            <div className="card">
              <h2>Treino</h2>
              <div className="fx-empty-state">
                Seu personal ainda não te atribuiu um nível de treino. Fale
                com ele(a) ou, se preferir, escolha um por conta própria mais
                abaixo.
              </div>
              <div style={{ marginTop: 16 }}>
                <TierPicker profileId={user.id} />
              </div>
            </div>
          ) : (
            <div className="card">
              <h2>Escolha seu nível</h2>
              <TierPicker profileId={user.id} />
            </div>
          )
        ) : !profile.current_split ? (
          <div className="card">
            <h2>Escolha sua frequência semanal</h2>
            <SplitPicker profileId={user.id} splits={tierData.SPLITS} />
          </div>
        ) : (
          <TreinoContent
            profileId={user.id}
            splitKey={profile.current_split}
            tierData={tierData}
          />
        )}
      </div>
    </>
  );
}

async function TreinoContent({
  profileId,
  splitKey,
  tierData,
}: {
  profileId: string;
  splitKey: string;
  tierData: TierWorkoutData;
}) {
  const split = tierData.SPLITS[splitKey];
  if (!split) {
    // Defensive: current_split holds a key from a different tier (e.g. the
    // aluno's tier changed after picking a split) — don't crash.
    return (
      <div className="card">
        <h2>Treino</h2>
        <div className="fx-empty-state">
          Split não reconhecido para o seu nível atual. Fale com seu personal.
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
        workoutTypes={tierData.WORKOUT_TYPES}
        muscleGroups={tierData.MUSCLE_GROUPS}
        initialLog={initialLog}
        defaultDay={defaultDay}
      />
    </div>
  );
}
