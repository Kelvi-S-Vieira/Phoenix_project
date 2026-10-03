import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { todayBR, weekRangeBR, weekdayIndexBR } from "@/lib/date-br";
import Sidebar from "@/components/Sidebar";
import { ALUNO_SIDEBAR_SECTIONS } from "@/lib/sidebar-nav";
import SplitPicker from "./SplitPicker";
import TierPicker from "./TierPicker";
import TreinoBoard from "./TreinoBoard";
import { DAYS, type DayKey, type Split, type TierWorkoutData } from "@/lib/treino-shared-types";
import * as treinoBasico from "@/lib/treino-basico-data";
import * as treinoIntermediario from "@/lib/treino-intermediario-data";
import * as treinoAvancado from "@/lib/treino-avancado-data";
import type { Tier } from "@/lib/database.types";
import { TIER_LABELS } from "@/lib/fenix-domain";
import AvancadoBuilder from "./avancado/AvancadoBuilder";
import { defaultPlan, normalizePlan, type AvancadoPlan } from "@/lib/treino-avancado-builder";
import { getServerWeightUnit } from "@/lib/weight-unit-server";

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

  const unit = await getServerWeightUnit();
  const tierData = profile.current_tier ? TIER_DATA[profile.current_tier as Tier] : null;

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
          <div className="eyebrow">Projeto Fênix · Treino</div>
          <h1>Ficha de treino</h1>
          <div className="sub">
            Registro manual de séries, carga e progressão — acompanhe seu nível e sua semana abaixo.
          </div>
        </div>

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
      </main>
    </div>
  );
}

// Per-tier page shell — hero header, intro card and each numbered section's
// heading/tag/lead copy, ported verbatim from the prototype's
// #page-treino-basico / #page-treino-intermediario markup (Básico/
// Intermediário only — Avançado never reads this: see the early return in
// TreinoTierPage; its entry below exists only so the Record stays total).
interface TierContent {
  headerClass: "tb-header" | "ti-header";
  sectionClass: "tb-section" | "ti-section";
  leadClass: "tb-lead" | "ti-lead";
  noteClass: "tb-note" | "ti-note";
  introCardClass: "tb-intro-card" | "ti-intro-card";
  headerEmoji: string;
  title: string;
  subtitle: string;
  introEmoji: string;
  introHeading: string;
  introTag: string;
  introParagraphs: ReactNode[];
  splitSectionTitle: string;
  splitTag: string;
  splitLead: string;
  weekLead: string;
  summaryNote: string;
}

const TIER_CONTENT: Record<Tier, TierContent> = {
  "treino-basico": {
    headerClass: "tb-header",
    sectionClass: "tb-section",
    leadClass: "tb-lead",
    noteClass: "tb-note",
    introCardClass: "tb-intro-card",
    headerEmoji: "🌱",
    title: "Treino Básico — Projeto Fênix",
    subtitle: "O primeiro passo, sem complicação: menos escolhas, mais consistência.",
    introEmoji: "🔰",
    introHeading: "Começando do zero",
    introTag: "leia antes de treinar",
    introParagraphs: [
      <>
        Esse módulo é para quem nunca treinou ou está voltando depois de
        muito tempo parado. Aqui você não vai encontrar divisões complicadas
        nem dezenas de exercícios avançados — só o essencial para aprender o
        movimento com segurança e criar o hábito de treinar.
      </>,
      <>
        <b>Comece leve.</b> Nas primeiras semanas, o objetivo não é levantar
        muito peso — é aprender a fazer cada exercício corretamente.
        Progredir devagar (um pouquinho de carga a mais a cada semana ou
        duas) é exatamente o jeito certo de fazer, não um sinal de que você
        está indo devagar demais.
      </>,
      <>
        Depois de algumas semanas treinando com consistência e já se
        sentindo confortável com os movimentos, você pode &quot;se
        formar&quot; para o <b>Treino Intermediário</b> — não tem pressa nem
        obrigação, isso é só uma sugestão para quando você sentir que está
        pronto.
      </>,
    ],
    splitSectionTitle: "1. Escolha sua frequência semanal",
    splitTag: "comece simples",
    splitLead: "Só duas opções — o suficiente para começar bem. Você pode trocar quando quiser.",
    weekLead: "Assim ficam distribuídos os grupos musculares nos dias de treino, com descanso nos outros dias.",
    summaryNote: "Este resumo é simples de propósito: o que mais importa nesta fase é criar o hábito de aparecer para treinar, não o volume total.",
  },
  "treino-intermediario": {
    headerClass: "ti-header",
    sectionClass: "ti-section",
    leadClass: "ti-lead",
    noteClass: "ti-note",
    introCardClass: "ti-intro-card",
    headerEmoji: "⚔️",
    title: "Treino Intermediário — Projeto Fênix",
    subtitle: "Mais volume, mais variedade, mais técnica — para quem já tem a base construída.",
    introEmoji: "🧭",
    introHeading: "Para quem é este nível",
    introTag: "leia antes de treinar",
    introParagraphs: [
      <>
        O Treino Intermediário é para quem já tem entre{" "}
        <b>6 e 18 meses de treino consistente</b>, está confortável com os
        movimentos básicos e quer mais variedade de exercícios, mais volume
        e um pouco mais de peso livre (barra e halteres) no programa.
      </>,
      <>
        Aqui a explicação de cada exercício é mais direta — assume-se que
        você já sabe montar num aparelho, aquecer e ajustar carga. O foco
        passa a ser <b>refinar a execução</b>: controlar a fase excêntrica,
        manter a conexão mente-músculo e evitar erros clássicos de quem já
        pegou confiança, como usar carga alta demais em prejuízo da forma
        (&quot;ego lifting&quot;) ou fazer o movimento no automático sem
        sentir o músculo trabalhando.
      </>,
      <>
        Depois de alguns meses treinando as três divisões deste módulo com
        boa consistência e progressão de carga, você pode &quot;se
        formar&quot; para o <b>Treino Avançado</b>, com divisões mais
        elaboradas e técnicas de intensidade. E se a consistência ou a
        técnica derem uma cambaleada — voltar para o{" "}
        <b>Treino Básico</b> por um tempo não é retrocesso, é só reforçar a
        base antes de seguir em frente.
      </>,
    ],
    splitSectionTitle: "1. Escolha sua divisão",
    splitTag: "3 opções",
    splitLead: "Mais opções que o Treino Básico, ainda sem a complexidade total do Avançado. Troque quando quiser.",
    weekLead: "Grupos musculares distribuídos ao longo dos dias conforme a divisão escolhida.",
    summaryNote: "O volume total é uma estimativa simples (séries × repetições) para acompanhar a tendência — não é uma métrica científica de carga de treino.",
  },
  // Unused — Avançado branches away in TreinoTierPage before this is read.
  "treino-avancado": {
    headerClass: "tb-header",
    sectionClass: "tb-section",
    leadClass: "tb-lead",
    noteClass: "tb-note",
    introCardClass: "tb-intro-card",
    headerEmoji: "",
    title: "",
    subtitle: "",
    introEmoji: "",
    introHeading: "",
    introTag: "",
    introParagraphs: [],
    splitSectionTitle: "1. Escolha sua divisão",
    splitTag: "",
    splitLead: "",
    weekLead: "",
    summaryNote: "",
  },
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

  // Avançado doesn't use the shared split-picker + muscle-group-browsing
  // flow at all — it has its own full custom day-by-day builder (section 0
  // body info, section 1 optional templates, section 2 fully-editable week,
  // section 3 per-day multi-group/multi-modality builder, section 4
  // summary), self-contained in AvancadoBuilder. See
  // app/treino/avancado/AvancadoBuilder.tsx and
  // lib/treino-avancado-builder.ts.
  if (tier === "treino-avancado") {
    return (
      <>
        <div className="card">
          <h2>{TIER_LABELS[tier]} — Treino</h2>
          <details className="fx-change-plan" style={{ marginTop: 4 }}>
            <summary>⚙️ Trocar nível</summary>
            <div style={{ marginTop: 16 }}>
              <TierPicker profileId={profileId} />
            </div>
          </details>
        </div>
        <AvancadoTreino profileId={profileId} />
      </>
    );
  }

  const content = TIER_CONTENT[tier];

  return (
    <>
      <header className={content.headerClass}>
        <h1>
          {content.headerEmoji} {content.title}
        </h1>
        <p>{content.subtitle}</p>
      </header>

      <details className="fx-change-plan" style={{ marginBottom: 18 }}>
        <summary>⚙️ Trocar nível</summary>
        <div style={{ marginTop: 16 }}>
          <TierPicker profileId={profileId} />
        </div>
      </details>

      <div className={content.sectionClass}>
        <h2>
          {content.introEmoji} {content.introHeading}{" "}
          <span className="tag">{content.introTag}</span>
        </h2>
        <div className={content.introCardClass}>
          {content.introParagraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>

      <div className={content.sectionClass}>
        <h2>
          {content.splitSectionTitle} <span className="tag">{content.splitTag}</span>
        </h2>
        <p className={content.leadClass}>{content.splitLead}</p>
        <SplitPicker
          profileId={profileId}
          splits={tierData.SPLITS}
          currentSplit={splitKey}
        />
      </div>

      {!split ? (
        <>
          <div className={content.sectionClass}>
            <h2>2. Sua semana</h2>
            <div className="fx-empty-state">
              Escolha uma divisão acima para ver sua semana.
            </div>
          </div>
          <div className={content.sectionClass}>
            <h2>3. Treino do dia</h2>
            <div className="fx-empty-state">
              Escolha uma divisão acima para ver os exercícios.
            </div>
          </div>
          <div className={content.sectionClass}>
            <h2>4. Resumo da semana</h2>
            <div className="fx-empty-state">
              Escolha uma divisão acima para ver seu resumo.
            </div>
          </div>
        </>
      ) : (
        <TreinoContent profileId={profileId} split={split} tierData={tierData} tier={tier} content={content} />
      )}
    </>
  );
}

async function TreinoContent({
  profileId,
  split,
  tierData,
  tier,
  content,
}: {
  profileId: string;
  split: Split;
  tierData: TierWorkoutData;
  tier: Tier;
  content: TierContent;
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
        sectionClass={content.sectionClass}
        leadClass={content.leadClass}
        weekLead={content.weekLead}
      />

      <div className={content.sectionClass}>
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
        <p className={content.noteClass}>{content.summaryNote}</p>
      </div>
    </>
  );
}

// =============================================================================
// Avançado's custom builder — loads/creates the profile's `avancado_plans`
// row (one per profile, holding body info + the whole editable-week plan as
// jsonb) and this week's `workout_log_entries` rows (the "feito hoje"
// checkbox state for musculação/calistenia/aquecimento exercises — keyed by
// the day-INDEPENDENT `exerciseKey()`, unlike Básico/Intermediário's
// day-prefixed `exerciseId()`, so a plan item's done-history can span
// weekdays; see lib/treino-shared-types.ts and lib/treino-avancado-builder.ts
// for why plan vs. log are kept separate here).
// =============================================================================
async function AvancadoTreino({ profileId }: { profileId: string }) {
  const supabase = await createClient();

  const { data: planRow } = await supabase
    .from("avancado_plans")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  let row = planRow;
  if (!row) {
    const fresh = defaultPlan();
    const { data: inserted } = await supabase
      .from("avancado_plans")
      .insert({ profile_id: profileId, week: fresh as unknown as Record<string, unknown> })
      .select("*")
      .single();
    row = inserted ?? null;
  }

  const plan: AvancadoPlan = normalizePlan(row?.week);
  const body = {
    weight: row?.body_weight ?? null,
    age: row?.body_age ?? null,
    height: row?.body_height ?? null,
    sex: row?.body_sex ?? null,
  };

  const { weekStart, weekEnd } = weekRangeBR();
  const today = todayBR();
  const { data: entries } = await supabase
    .from("workout_log_entries")
    .select("exercise_id, logged_at, checked, sets, reps, load")
    .eq("profile_id", profileId)
    .gte("logged_at", weekStart)
    .lte("logged_at", weekEnd);

  const initialLog: Record<string, { checked: boolean; sets: string; reps: string; load: string }> = {};
  const byExercise = new Map<string, NonNullable<typeof entries>>();
  for (const e of entries ?? []) {
    const arr = byExercise.get(e.exercise_id) ?? [];
    arr.push(e);
    byExercise.set(e.exercise_id, arr);
  }
  for (const [id, rows] of byExercise) {
    const todayRow = rows.find((r) => r.logged_at === today);
    initialLog[id] = {
      checked: todayRow?.checked ?? false,
      sets: todayRow?.sets != null ? String(todayRow.sets) : "",
      reps: todayRow?.reps != null ? String(todayRow.reps) : "",
      load: todayRow?.load != null ? String(todayRow.load) : "",
    };
  }

  // Training-log history (1RM/PR/progression) — exercise_set_logs, one row
  // per logged set, keyed by the day-independent exerciseKey(). Fetched
  // once here and grouped client-side; see lib/treino-progression.ts.
  const { data: setLogRows } = await supabase
    .from("exercise_set_logs")
    .select("exercise_key, logged_at, weight, reps, rpe, pain")
    .eq("profile_id", profileId)
    .order("logged_at", { ascending: true })
    .order("created_at", { ascending: true });

  const initialSetLogs: Record<string, { date: string; weight: number; reps: number; rpe: number | null; pain: boolean }[]> = {};
  for (const row of setLogRows ?? []) {
    const arr = initialSetLogs[row.exercise_key] ?? (initialSetLogs[row.exercise_key] = []);
    arr.push({ date: row.logged_at, weight: Number(row.weight), reps: Number(row.reps), rpe: row.rpe != null ? Number(row.rpe) : null, pain: row.pain });
  }

  return (
    <AvancadoBuilder
      profileId={profileId}
      initialPlan={plan}
      initialBody={body}
      initialLog={initialLog}
      initialSetLogs={initialSetLogs}
    />
  );
}
