import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import SplitPicker from "./SplitPicker";
import TierPicker from "./TierPicker";
import TreinoBoard from "./TreinoBoard";
import { DAYS, type DayKey, type Split, type TierWorkoutData } from "@/lib/treino-shared-types";
import * as treinoBasico from "@/lib/treino-basico-data";
import * as treinoIntermediario from "@/lib/treino-intermediario-data";
import * as treinoAvancado from "@/lib/treino-avancado-data";
import type { Tier } from "@/lib/database.types";
import { TIER_LABELS } from "@/lib/fenix-domain";

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
        ) : (
          <TreinoTierPage
            profileId={user.id}
            profile={profile}
            tier={profile.current_tier as Tier}
            tierData={tierData}
          />
        )}
      </div>
    </>
  );
}

// Per-tier wording for section 1's heading — the prototype calls it
// "frequência semanal" in Básico and "divisão" in Intermediário/Avançado.
// (Avançado's prototype section 1 is actually "Ponto de partida (opcional)"
// feeding a fully-custom day builder, which is out of scope here — a prior
// migration pass already simplified Avançado to the same muscle-group-
// browsing UI as the other two tiers, so it reuses the simpler "divisão"
// wording rather than the custom-builder copy.)
const SPLIT_SECTION_TITLE: Record<Tier, string> = {
  "treino-basico": "1. Escolha sua frequência semanal",
  "treino-intermediario": "1. Escolha sua divisão",
  "treino-avancado": "1. Escolha sua divisão",
};

async function TreinoTierPage({
  profileId,
  profile,
  tier,
  tierData,
}: {
  profileId: string;
  profile: { current_split: string | null };
  tier: Tier;
  tierData: TierWorkoutData;
}) {
  const splitKey = profile.current_split;
  const split = splitKey ? tierData.SPLITS[splitKey] : null;

  return (
    <>
      <div className="card">
        <h2>
          {TIER_LABELS[tier]} — Treino
        </h2>
        <details className="fx-change-plan" style={{ marginTop: 4 }}>
          <summary>⚙️ Trocar nível</summary>
          <div style={{ marginTop: 16 }}>
            <TierPicker profileId={profileId} />
          </div>
        </details>
      </div>

      <div className="card">
        <h2>{SPLIT_SECTION_TITLE[tier]}</h2>
        <SplitPicker
          profileId={profileId}
          splits={tierData.SPLITS}
          currentSplit={splitKey}
        />
      </div>

      {!split ? (
        <>
          <div className="card">
            <h2>2. Sua semana</h2>
            <div className="fx-empty-state">
              Escolha uma divisão acima para ver sua semana.
            </div>
          </div>
          <div className="card">
            <h2>3. Treino do dia</h2>
            <div className="fx-empty-state">
              Escolha uma divisão acima para ver os exercícios.
            </div>
          </div>
          <div className="card">
            <h2>4. Resumo da semana</h2>
            <div className="fx-empty-state">
              Escolha uma divisão acima para ver seu resumo.
            </div>
          </div>
        </>
      ) : (
        <TreinoContent profileId={profileId} split={split} tierData={tierData} />
      )}
    </>
  );
}

async function TreinoContent({
  profileId,
  split,
  tierData,
}: {
  profileId: string;
  split: Split;
  tierData: TierWorkoutData;
}) {
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

  // --- "4. Resumo da semana" --------------------------------------------
  // The prototype's state.log has no date dimension at all (it's keyed only
  // by dayKey::type::group::exercise, so "checked" just means "last time you
  // logged this slot"). Our workout_log_entries table is properly date-
  // scoped (profile_id, logged_at, exercise_id), so "esta semana" needs an
  // actual definition: the current ISO week, Monday through Sunday, using
  // the server's local notion of "today" (no timezone handling needed).
  const now = new Date();
  const jsDay = now.getDay(); // 0 = domingo ... 6 = sábado
  const diffToMonday = (jsDay + 6) % 7; // Monday itself -> 0, Sunday -> 6
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const weekStart = monday.toISOString().slice(0, 10);
  const weekEnd = sunday.toISOString().slice(0, 10);

  const { data: weekEntries } = await supabase
    .from("workout_log_entries")
    .select("exercise_id")
    .eq("profile_id", profileId)
    .eq("checked", true)
    .gte("logged_at", weekStart)
    .lte("logged_at", weekEnd);

  const scheduledDayKeys = DAYS.filter((d) => split.week[d.key]).map((d) => d.key);
  const scheduledSet = new Set<string>(scheduledDayKeys);

  const trainedDaySet = new Set<string>();
  for (const e of weekEntries ?? []) {
    const dayKey = e.exercise_id.split("::")[0];
    if (scheduledSet.has(dayKey)) trainedDaySet.add(dayKey);
  }

  const scheduledDays = scheduledDayKeys.length;
  const trainedDays = trainedDaySet.size;
  const totalChecked = weekEntries?.length ?? 0;
  const allTrained = scheduledDays > 0 && trainedDays >= scheduledDays;

  return (
    <>
      <TreinoBoard
        profileId={profileId}
        split={split}
        workoutTypes={tierData.WORKOUT_TYPES}
        muscleGroups={tierData.MUSCLE_GROUPS}
        initialLog={initialLog}
        defaultDay={defaultDay}
      />

      <div className="card">
        <h2>4. Resumo da semana</h2>
        <div className="summary-grid">
          <div className="sum-card">
            <div className="label">Dias treinados esta semana</div>
            <div className="value">
              {trainedDays}
              <span className="unit"> / {scheduledDays}</span>
            </div>
          </div>
          <div className="sum-card">
            <div className="label">Exercícios marcados como feitos</div>
            <div className="value">{totalChecked}</div>
          </div>
        </div>
        {allTrained && (
          <div className="fx-grad-box">
            🔥 Você completou todos os treinos planejados desta semana! Se
            isso vem se repetindo semana após semana e os exercícios já estão
            ficando confortáveis, talvez seja hora de dar uma olhada no
            próximo nível — sem pressa, no seu tempo.
          </div>
        )}
      </div>
    </>
  );
}
