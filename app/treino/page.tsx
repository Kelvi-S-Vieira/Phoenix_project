import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { todayBR, weekRangeBR, weekdayIndexBR } from "@/lib/date-br";
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
        <TreinoContent profileId={profileId} split={split} tierData={tierData} tier={tier} />
      )}
    </>
  );
}

async function TreinoContent({
  profileId,
  split,
  tierData,
  tier,
}: {
  profileId: string;
  split: Split;
  tierData: TierWorkoutData;
  tier: Tier;
}) {
  const supabase = await createClient();
  const today = todayBR();

  // "Esta semana" (also used below for the summary) is the current BRT
  // calendar week, Monday through Sunday — see lib/date-br.ts.
  const { weekStart, weekEnd } = weekRangeBR();

  // The whole week's entries, not just today's: a given exercise_id (which
  // already encodes the weekday, e.g. "seg::musculacao::peito::Supino") can
  // have more than one dated row within the week if the user logs that same
  // weekday's workout on more than one date (e.g. doing Monday's workout as
  // a makeup on Wednesday). Loading only `today`'s rows made every other
  // day's checked state disappear whenever you viewed it on a different
  // date, and made sets/reps/load reset to blank instead of carrying
  // forward the last values logged for that exercise.
  const { data: entries } = await supabase
    .from("workout_log_entries")
    .select("exercise_id, logged_at, checked, sets, reps, load")
    .eq("profile_id", profileId)
    .gte("logged_at", weekStart)
    .lte("logged_at", weekEnd);

  const entriesByExercise = new Map<string, NonNullable<typeof entries>>();
  for (const e of entries ?? []) {
    const arr = entriesByExercise.get(e.exercise_id) ?? [];
    arr.push(e);
    entriesByExercise.set(e.exercise_id, arr);
  }

  const initialLog: Record<
    string,
    { checked: boolean; sets: string; reps: string; load: string }
  > = {};
  for (const [exerciseId, rows] of entriesByExercise) {
    const sorted = [...rows].sort((a, b) => a.logged_at.localeCompare(b.logged_at));
    const todayRow = sorted.find((r) => r.logged_at === today);
    // "Checked" is strictly per calendar day — each day's checkbox must
    // reflect that day's OWN saved state, never a different date's. Default
    // to unchecked when there's no row for today yet.
    const checked = todayRow?.checked ?? false;
    // Sets/reps/load carry forward as display defaults from the most
    // recent entry this week that actually has a value for that field
    // (today's own value wins when present, since it's the most recent).
    const latestNonNull = (get: (r: (typeof sorted)[number]) => number | null) => {
      for (let i = sorted.length - 1; i >= 0; i--) {
        const v = get(sorted[i]);
        if (v != null) return v;
      }
      return null;
    };
    const sets = latestNonNull((r) => r.sets);
    const reps = latestNonNull((r) => r.reps);
    const load = latestNonNull((r) => r.load);
    initialLog[exerciseId] = {
      checked,
      sets: sets != null ? String(sets) : "",
      reps: reps != null ? String(reps) : "",
      load: load != null ? String(load) : "",
    };
  }

  const todayKey = JS_DAY_TO_KEY[weekdayIndexBR()];
  const defaultDay: DayKey | null = split.week[todayKey]
    ? todayKey
    : DAYS.find((d) => split.week[d.key])?.key ?? null;

  // --- "4. Resumo da semana" --------------------------------------------
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
  // Avançado is the top tier — there's nothing to "level up" into, so never
  // suggest it regardless of how consistently the user trains.
  const allTrained = tier !== "treino-avancado" && scheduledDays > 0 && trainedDays >= scheduledDays;

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
