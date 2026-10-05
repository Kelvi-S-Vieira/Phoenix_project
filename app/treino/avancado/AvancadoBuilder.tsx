"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { todayBR } from "@/lib/date-br";
import ExerciseMedia from "@/components/ExerciseMedia";
import { DAYS, type DayKey, type Exercise, exerciseKey } from "@/lib/treino-shared-types";
import { MUSCLE_GROUPS, CALIST_GROUPS, SPLITS, type MuscleGroupKey, type SplitKey } from "@/lib/treino-avancado-data";
import { HIIT_EXERCISES, TABATA_EXERCISES, HYROX_STATIONS, CROSSFIT_EXERCISES } from "@/lib/treino-circuitos-data";
import {
  ALL_GROUP_KEYS,
  EQUIPMENT_TYPES,
  ALL_EQUIPMENT_KEYS,
  TRAINING_LEVELS,
  ALL_LEVEL_KEYS,
  exercisePassesFilters,
  defaultEquipmentFilter,
  levelFilterForLevel,
  defaultLevelFilter,
  WEEKLY_VOLUME_TARGETS,
  HIGH_VOLUME_GROUPS,
  suggestWorkSets,
  suggestWarmupSets,
  CARDIO_ACTIVITIES,
  ALL_CARDIO_KEYS,
  SPORTS_ACTIVITIES,
  ALL_SPORTS_KEYS,
  WARMUP_EXERCISES,
  GENERIC_TAB_LABELS,
  GENERIC_TYPE_KEYS,
  type GenericTypeKey,
  type Intensity,
  applyTemplate,
  weeklyVolumeByGroup,
  dayHasAnyActivity,
  kcalForDay,
  newEntryId,
  type AvancadoPlan,
  type DayPlan,
  type CircuitDayPlan,
  type CrossfitFormat,
  CROSSFIT_FORMATS,
  isCircuitFormat,
  getIntensityPresets,
  applyCircuitPreset,
  applyTimeBuilder,
  computeCircuitEstimate,
  TIME_BUILDER_OPTIONS,
  pickSwapReplacement,
} from "@/lib/treino-avancado-builder";
import {
  type SetLogEntry,
  estimate1RM,
  bestPR,
  isNewPR,
  needsDeload,
  suggestProgression,
} from "@/lib/treino-progression";

const CIRCUIT_POOLS: Record<GenericTypeKey, Exercise[]> = {
  hiit: HIIT_EXERCISES,
  tabata: TABATA_EXERCISES,
  hyrox: HYROX_STATIONS,
  crossfit: CROSSFIT_EXERCISES,
};

interface BodyInfo {
  weight: number | null;
  age: number | null;
  height: number | null;
  sex: "masculino" | "feminino" | null;
}

interface LogEntry {
  checked: boolean;
  sets: string;
  reps: string;
  load: string;
}
const EMPTY_LOG: LogEntry = { checked: false, sets: "", reps: "", load: "" };

const DAY_TABS: { key: string; label: string }[] = [
  { key: "warmup", label: "🔆 Aquecimento" },
  { key: "musculacao", label: "🏋️ Musculação" },
  { key: "calistenia", label: "🤸 Calistenia" },
  { key: "cardio", label: "🏃 Cardio" },
  { key: "hiit", label: GENERIC_TAB_LABELS.hiit },
  { key: "tabata", label: GENERIC_TAB_LABELS.tabata },
  { key: "hyrox", label: GENERIC_TAB_LABELS.hyrox },
  { key: "crossfit", label: GENERIC_TAB_LABELS.crossfit },
  { key: "esportes", label: "⚽ Esportes" },
];

export default function AvancadoBuilder({
  profileId,
  initialPlan,
  initialBody,
  initialLog,
  initialSetLogs,
  initialAvancadoLevel,
  weekTrainedDays,
  trainedToday,
}: {
  profileId: string;
  initialPlan: AvancadoPlan;
  initialBody: BodyInfo;
  initialLog: Record<string, LogEntry>;
  initialSetLogs: Record<string, SetLogEntry[]>;
  initialAvancadoLevel: string | null;
  weekTrainedDays: number;
  trainedToday: boolean;
}) {
  const [plan, setPlan] = useState<AvancadoPlan>(initialPlan);
  const [body, setBody] = useState<BodyInfo>(initialBody);
  const [log, setLog] = useState<Record<string, LogEntry>>(initialLog);
  const [setLogs, setSetLogs] = useState<Record<string, SetLogEntry[]>>(initialSetLogs);
  const [selectedDay, setSelectedDay] = useState<DayKey | null>(null);
  const [activeTab, setActiveTab] = useState<string>("musculacao");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [openDetails, setOpenDetails] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  // "montar" = setup (templates, group/exercise selection, filters) vs.
  // "treino" = a leaner day-tracking view (selected exercises only, GIF,
  // logging, rest timer) — see Fase 4 (2026-10-04 feedback).
  const [mode, setMode] = useState<"montar" | "treino">("montar");
  const [avancadoLevel, setAvancadoLevel] = useState<string | null>(initialAvancadoLevel);
  const [levelPickerOpen, setLevelPickerOpen] = useState(false);
  // Bumped by toggleDone only when an exercise becomes checked; RestTimer
  // auto-starts on each change (treino mode only — it's only mounted there).
  const [restAutoStartSignal, setRestAutoStartSignal] = useState(0);
  // Seeded from the server (distinct activity_days this week); bumped
  // locally the first time today gets an activity row so the stat stays live.
  const [trainedDaysCount, setTrainedDaysCount] = useState(weekTrainedDays);
  const countedToday = useRef(trainedToday);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestPlan = useRef(plan);
  const latestBody = useRef(body);
  useEffect(() => {
    latestPlan.current = plan;
  }, [plan]);
  useEffect(() => {
    latestBody.current = body;
  }, [body]);

  async function flushSave() {
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("avancado_plans")
      .update({
        week: latestPlan.current as unknown as Record<string, unknown>,
        body_weight: latestBody.current.weight,
        body_age: latestBody.current.age,
        body_height: latestBody.current.height,
        body_sex: latestBody.current.sex,
      })
      .eq("profile_id", profileId);
    setSaving(false);
  }

  function scheduleSave(immediate = false) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (immediate) {
      flushSave();
      return;
    }
    saveTimer.current = setTimeout(flushSave, 500);
  }

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  function updateDay(dayKey: DayKey, updater: (day: DayPlan) => DayPlan, immediate = false) {
    setPlan((prev) => {
      const next = { ...prev, week: { ...prev.week, [dayKey]: updater(prev.week[dayKey]) } };
      latestPlan.current = next;
      return next;
    });
    scheduleSave(immediate);
  }

  function persistLogEntry(id: string, entry: LogEntry) {
    const supabase = createClient();
    const today = todayBR();
    supabase
      .from("workout_log_entries")
      .upsert(
        {
          profile_id: profileId,
          logged_at: today,
          exercise_id: id,
          checked: entry.checked,
          sets: entry.sets === "" ? null : parseFloat(entry.sets.replace(",", ".")),
          reps: entry.reps === "" ? null : parseFloat(entry.reps.replace(",", ".")),
          load: entry.load === "" ? null : parseFloat(entry.load.replace(",", ".")),
        },
        { onConflict: "profile_id,logged_at,exercise_id" }
      )
      .then(() => {});
    if (entry.checked) {
      supabase
        .from("activity_days")
        .upsert({ profile_id: profileId, activity_date: today }, { onConflict: "profile_id,activity_date" })
        .then(() => {});
    }
  }

  function toggleDone(id: string) {
    // Decide from the committed `log` (not inside the setLog updater, which
    // React may double-invoke in dev) so side effects fire exactly once.
    const current = log[id] ?? EMPTY_LOG;
    const updated = { ...current, checked: !current.checked };
    persistLogEntry(id, updated);
    setLog((prev) => ({ ...prev, [id]: updated }));
    if (updated.checked) {
      setRestAutoStartSignal((n) => n + 1);
      if (!countedToday.current) {
        countedToday.current = true;
        setTrainedDaysCount((n) => n + 1);
      }
    }
  }

  function entryFor(id: string): LogEntry {
    return log[id] ?? EMPTY_LOG;
  }

  // -------------------------------------------------------------------------
  // Training log (1RM/PR/progression) — exercise_set_logs, keyed by the
  // day-independent exerciseKey(). Saves immediately on click (not
  // debounced), unlike the plan's scheduleSave — ported from the
  // prototype's synchronous addLogEntry.
  function logFor(id: string): SetLogEntry[] {
    return setLogs[id] ?? [];
  }

  async function saveSetLog(id: string, weight: number, reps: number, rpe: number | null, pain: boolean) {
    const entry: SetLogEntry = { date: todayBR(), weight, reps, rpe, pain };
    setSetLogs((prev) => ({ ...prev, [id]: [...(prev[id] ?? []), entry] }));
    const supabase = createClient();
    await supabase.from("exercise_set_logs").insert({
      profile_id: profileId,
      exercise_key: id,
      logged_at: entry.date,
      weight,
      reps,
      rpe,
      pain,
    });
  }

  // Swaps a selected exercise for a random different one from the same
  // group/portion, keeping the user's sets/reps/warmupSets config. The old
  // exercise's own log history is left untouched under its own key (not
  // deleted) — see lib/treino-progression.ts header comment.
  function swapExerciseInSelection(dayKey: DayKey, oldId: string, groupKey: MuscleGroupKey, portionKey: string, portionExercises: Exercise[]) {
    const candidates = portionExercises.filter((ex) => exerciseKey("musculacao", groupKey, ex.name, portionKey) !== oldId);
    const pick = pickSwapReplacement(candidates);
    if (!pick) return;
    const newId = exerciseKey("musculacao", groupKey, pick.name, portionKey);
    updateDay(
      dayKey,
      (day) => {
        const sel = day.selections[oldId];
        if (!sel) return day;
        const next = { ...day.selections };
        delete next[oldId];
        next[newId] = sel;
        return { ...day, selections: next };
      },
      true
    );
  }

  function updateCircuitDay(dayKey: DayKey, type: GenericTypeKey, patch: Partial<CircuitDayPlan>, immediate = false) {
    updateDay(
      dayKey,
      (day) => ({ ...day, generic: { ...day.generic, [type]: { ...day.generic[type], ...patch } } }),
      immediate
    );
  }
  function toggleCircuitExercise(dayKey: DayKey, type: GenericTypeKey, exName: string) {
    updateDay(
      dayKey,
      (day) => {
        const current = day.generic[type];
        const has = current.exercises.includes(exName);
        const exercises = has ? current.exercises.filter((n) => n !== exName) : [...current.exercises, exName];
        return { ...day, generic: { ...day.generic, [type]: { ...current, exercises } } };
      },
      true
    );
  }
  function applyCircuitPresetToDay(dayKey: DayKey, type: GenericTypeKey, intensity: Intensity) {
    updateDay(
      dayKey,
      (day) => ({ ...day, generic: { ...day.generic, [type]: applyCircuitPreset(type, day.generic[type], intensity, CIRCUIT_POOLS[type]) } }),
      true
    );
  }
  function applyTimeBuilderToDay(dayKey: DayKey, type: GenericTypeKey, targetMinutes: number) {
    updateDay(
      dayKey,
      (day) => ({ ...day, generic: { ...day.generic, [type]: applyTimeBuilder(type, day.generic[type], targetMinutes, CIRCUIT_POOLS[type]) } }),
      true
    );
  }

  function chooseTemplate(key: SplitKey) {
    setPlan((prev) => {
      const next = applyTemplate(prev, key);
      latestPlan.current = next;
      return next;
    });
    scheduleSave(true);
  }

  function selectDay(dayKey: DayKey) {
    setSelectedDay((prev) => {
      const next = prev === dayKey ? null : dayKey;
      // Default mode when opening a day: if it already has something
      // selected, the user is most likely here to train, not reconfigure —
      // otherwise start in setup mode since there's nothing to track yet.
      if (next) setMode(dayHasAnyActivity(plan.week[next]) ? "treino" : "montar");
      return next;
    });
    setOpenGroups({});
  }

  // Compact day picker used inside "treino" mode — always selects (never
  // toggles off), so the day-tracking view never collapses to an empty
  // state just from re-tapping the current day.
  function pickDayForTreino(dayKey: DayKey) {
    setSelectedDay(dayKey);
    setOpenGroups({});
  }

  // Training-level ("iniciante"/"intermediario"/"avancado"/"idoso") is now
  // decided once here instead of a live filter box — writes both the
  // profile's own avancado_level (so TierPicker/future sessions remember
  // it) and the current plan's levelFilter (so it actually takes effect).
  async function changeLevel(level: string) {
    setLevelPickerOpen(false);
    if (level === ALL_LEVELS_KEY) {
      // "Todos os níveis": a VIEW option, not a level — shows exercises of
      // every level at once (the single-level mode stays available). The
      // profile's own avancado_level is deliberately left untouched.
      setPlan((prev) => {
        const next = { ...prev, levelFilter: defaultLevelFilter() };
        latestPlan.current = next;
        return next;
      });
      scheduleSave(true);
      return;
    }
    setAvancadoLevel(level);
    setPlan((prev) => {
      const next = { ...prev, levelFilter: levelFilterForLevel(level) };
      latestPlan.current = next;
      return next;
    });
    scheduleSave(true);
    const supabase = createClient();
    await supabase.from("profiles").update({ avancado_level: level }).eq("id", profileId);
  }

  function toggleGroupInDay(dayKey: DayKey, groupKey: MuscleGroupKey) {
    updateDay(
      dayKey,
      (day) => {
        const has = day.groups.includes(groupKey);
        if (has) {
          const nextSelections = { ...day.selections };
          Object.keys(nextSelections).forEach((k) => {
            if (k.split("::")[1] === groupKey) delete nextSelections[k];
          });
          return { ...day, groups: day.groups.filter((g) => g !== groupKey), selections: nextSelections };
        }
        return { ...day, groups: [...day.groups, groupKey] };
      },
      true
    );
  }

  function clearDay(dayKey: DayKey) {
    updateDay(dayKey, () => ({ ...plan.week[dayKey], groups: [], selections: {} }), true);
  }

  function toggleExerciseSelection(dayKey: DayKey, groupKey: MuscleGroupKey, exName: string, portionKey: string) {
    const id = exerciseKey("musculacao", groupKey, exName, portionKey);
    updateDay(
      dayKey,
      (day) => {
        const next = { ...day.selections };
        if (next[id]) {
          delete next[id];
        } else {
          next[id] = {
            sets: suggestWorkSets(plan.week, dayKey, groupKey),
            reps: "10-12",
            warmupSets: suggestWarmupSets(exName),
          };
        }
        return { ...day, selections: next };
      },
      true
    );
  }

  function updateSelectionField(dayKey: DayKey, id: string, field: "sets" | "reps" | "warmupSets", value: number | string) {
    updateDay(dayKey, (day) => {
      const sel = day.selections[id];
      if (!sel) return day;
      return { ...day, selections: { ...day.selections, [id]: { ...sel, [field]: value } } };
    });
  }

  function toggleCalistExercise(dayKey: DayKey, exName: string) {
    updateDay(
      dayKey,
      (day) => {
        const next = { ...day.calistenia.exercises };
        if (next[exName]) {
          delete next[exName];
        } else {
          next[exName] = { sets: 3, reps: "12-20 (ou até a falha)" };
        }
        return { ...day, calistenia: { ...day.calistenia, exercises: next } };
      },
      true
    );
  }

  function updateCalistField(dayKey: DayKey, exName: string, field: "sets" | "reps", value: number | string) {
    updateDay(dayKey, (day) => {
      const entry = day.calistenia.exercises[exName];
      if (!entry) return day;
      return {
        ...day,
        calistenia: { ...day.calistenia, exercises: { ...day.calistenia.exercises, [exName]: { ...entry, [field]: value } } },
      };
    });
  }

  function toggleWarmupExercise(dayKey: DayKey, exName: string) {
    updateDay(
      dayKey,
      (day) => {
        const has = day.warmupExercises.includes(exName);
        return {
          ...day,
          warmupExercises: has ? day.warmupExercises.filter((n) => n !== exName) : [...day.warmupExercises, exName],
        };
      },
      true
    );
  }

  function addCardioEntry(dayKey: DayKey) {
    updateDay(
      dayKey,
      (day) => ({
        ...day,
        cardio: [...day.cardio, { id: newEntryId("c"), activityKey: ALL_CARDIO_KEYS[0], intensity: "moderado" as Intensity, minutes: 30 }],
      }),
      true
    );
  }
  function removeCardioEntry(dayKey: DayKey, id: string) {
    updateDay(dayKey, (day) => ({ ...day, cardio: day.cardio.filter((e) => e.id !== id) }), true);
  }
  function updateCardioEntry(dayKey: DayKey, id: string, patch: Partial<DayPlan["cardio"][number]>) {
    updateDay(dayKey, (day) => ({ ...day, cardio: day.cardio.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
  }

  function addSportEntry(dayKey: DayKey) {
    updateDay(
      dayKey,
      (day) => ({ ...day, sports: [...day.sports, { id: newEntryId("s"), activityKey: ALL_SPORTS_KEYS[0], minutes: 60 }] }),
      true
    );
  }
  function removeSportEntry(dayKey: DayKey, id: string) {
    updateDay(dayKey, (day) => ({ ...day, sports: day.sports.filter((e) => e.id !== id) }), true);
  }
  function updateSportEntry(dayKey: DayKey, id: string, patch: Partial<DayPlan["sports"][number]>) {
    updateDay(dayKey, (day) => ({ ...day, sports: day.sports.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
  }

  // Profile-level equipment preference (profiles.avancado_equipment_filter):
  // written through (fire-and-forget) whenever the user changes the filter, so
  // a recreated plan seeds from it instead of resetting to all-true. Only the
  // user's own toggle/reset reach here — never an automatic or existing-plan
  // rewrite.
  function persistEquipmentPref(filter: Record<string, boolean>) {
    createClient()
      .from("profiles")
      .update({ avancado_equipment_filter: filter })
      .eq("id", profileId)
      .then(() => {});
  }
  function toggleEquipment(key: string) {
    const next = { ...latestPlan.current, equipmentFilter: { ...latestPlan.current.equipmentFilter, [key]: latestPlan.current.equipmentFilter[key] === false } };
    latestPlan.current = next;
    setPlan(next);
    scheduleSave(true);
    persistEquipmentPref(next.equipmentFilter);
  }
  function resetEquipment() {
    const next = { ...latestPlan.current, equipmentFilter: defaultEquipmentFilter() };
    latestPlan.current = next;
    setPlan(next);
    scheduleSave(true);
    persistEquipmentPref(next.equipmentFilter);
  }
  function updateBodyField(field: keyof BodyInfo, value: string) {
    const v = field === "sex" ? (value || null) : value === "" ? null : Number(value);
    setBody((prev) => {
      const next = { ...prev, [field]: v } as BodyInfo;
      latestBody.current = next;
      return next;
    });
    scheduleSave(false);
  }

  // -------------------------------------------------------------------------
  const dayInfo = selectedDay ? DAYS.find((d) => d.key === selectedDay) : null;
  const day = selectedDay ? plan.week[selectedDay] : null;
  const showingAllLevels = ALL_LEVEL_KEYS.every((k) => plan.levelFilter[k] !== false);
  const levelLabel = showingAllLevels
    ? ALL_LEVELS_LABEL
    : avancadoLevel
      ? TRAINING_LEVELS[avancadoLevel] ?? avancadoLevel
      : null;
  const suggestedRestSeconds = day ? computeSuggestedRestSeconds(day, activeTab) : undefined;

  const tabPane = day && selectedDay && (
    <div className="tv-tab-pane">
      {activeTab === "warmup" && (
        <WarmupTab
          dayKey={selectedDay}
          day={day}
          onToggleExercise={toggleWarmupExercise}
          onChangeMinutes={(v) => updateDay(selectedDay, (d) => ({ ...d, warmupMinutes: v }))}
          onChangeIntensity={(v) => updateDay(selectedDay, (d) => ({ ...d, warmupIntensity: v }), true)}
          onBlurPersist={() => scheduleSave(true)}
          log={log}
          onToggleDone={toggleDone}
          openDetails={openDetails}
          setOpenDetails={setOpenDetails}
        />
      )}
      {activeTab === "musculacao" && (
        <MusculacaoTab
          mode={mode}
          dayLabel={dayInfo!.label}
          day={day}
          plan={plan}
          onToggleGroup={(g) => toggleGroupInDay(selectedDay, g)}
          onClearDay={() => clearDay(selectedDay)}
          onToggleExercise={(g, name, portion) => toggleExerciseSelection(selectedDay, g, name, portion)}
          onUpdateSelection={(id, field, value) => updateSelectionField(selectedDay, id, field, value)}
          onBlurPersist={() => scheduleSave(true)}
          onChangeDuration={(v) => updateDay(selectedDay, (d) => ({ ...d, strengthDurationMin: v }))}
          onToggleEquipment={toggleEquipment}
          onResetEquipment={resetEquipment}
          levelLabel={levelLabel}
          levelPickerOpen={levelPickerOpen}
          onToggleLevelPicker={() => setLevelPickerOpen((v) => !v)}
          onChangeLevel={changeLevel}
          openGroups={openGroups}
          setOpenGroups={setOpenGroups}
          openDetails={openDetails}
          setOpenDetails={setOpenDetails}
          entryFor={entryFor}
          onToggleDone={toggleDone}
          logFor={logFor}
          onSaveLog={saveSetLog}
          onSwapExercise={(groupKey, portionKey, oldId, portionExercises) =>
            swapExerciseInSelection(selectedDay, oldId, groupKey, portionKey, portionExercises)
          }
          onRezone={(id, zone) => {
            updateSelectionField(selectedDay, id, "reps", zone);
            scheduleSave(true);
          }}
        />
      )}
      {activeTab === "calistenia" && (
        <CalisteniaTab
          mode={mode}
          day={day}
          plan={plan}
          onToggleExercise={(name) => toggleCalistExercise(selectedDay, name)}
          onUpdateField={(name, field, value) => updateCalistField(selectedDay, name, field, value)}
          onBlurPersist={() => scheduleSave(true)}
          onChangeDuration={(v) => updateDay(selectedDay, (d) => ({ ...d, calistenia: { ...d.calistenia, durationMin: v } }))}
          onToggleEquipment={toggleEquipment}
          onResetEquipment={resetEquipment}
          levelLabel={levelLabel}
          levelPickerOpen={levelPickerOpen}
          onToggleLevelPicker={() => setLevelPickerOpen((v) => !v)}
          onChangeLevel={changeLevel}
          openDetails={openDetails}
          setOpenDetails={setOpenDetails}
          log={log}
          onToggleDone={toggleDone}
        />
      )}
      {activeTab === "cardio" && (
        <CardioTab
          day={day}
          weight={body.weight}
          onAdd={() => addCardioEntry(selectedDay)}
          onRemove={(id) => removeCardioEntry(selectedDay, id)}
          onUpdate={(id, patch) => updateCardioEntry(selectedDay, id, patch)}
          onBlurPersist={() => scheduleSave(true)}
        />
      )}
      {(["hiit", "tabata", "hyrox", "crossfit"] as GenericTypeKey[]).includes(activeTab as GenericTypeKey) && (
        <CircuitTab
          mode={mode}
          type={activeTab as GenericTypeKey}
          day={day}
          weight={body.weight}
          levelFilter={plan.levelFilter}
          openDetails={openDetails}
          setOpenDetails={setOpenDetails}
          onUpdateField={(patch, immediate) => updateCircuitDay(selectedDay, activeTab as GenericTypeKey, patch, immediate)}
          onToggleExercise={(name) => toggleCircuitExercise(selectedDay, activeTab as GenericTypeKey, name)}
          onApplyPreset={(intensity) => applyCircuitPresetToDay(selectedDay, activeTab as GenericTypeKey, intensity)}
          onApplyTimeBuilder={(minutes) => applyTimeBuilderToDay(selectedDay, activeTab as GenericTypeKey, minutes)}
          onClearExercises={() => updateCircuitDay(selectedDay, activeTab as GenericTypeKey, { exercises: [] }, true)}
          onBlurPersist={() => scheduleSave(true)}
        />
      )}
      {activeTab === "esportes" && (
        <SportsTab
          day={day}
          weight={body.weight}
          onAdd={() => addSportEntry(selectedDay)}
          onRemove={(id) => removeSportEntry(selectedDay, id)}
          onUpdate={(id, patch) => updateSportEntry(selectedDay, id, patch)}
          onBlurPersist={() => scheduleSave(true)}
        />
      )}
    </div>
  );

  return (
    <>
      <div className="card tv-mode-card">
        <div className="tv-mode-toggle">
          <div
            className={"tv-mode-btn" + (mode === "montar" ? " active" : "")}
            role="button"
            onClick={() => setMode("montar")}
          >
            ⚙️ Montar treino
          </div>
          <div
            className={"tv-mode-btn" + (mode === "treino" ? " active" : "")}
            role="button"
            onClick={() => setMode("treino")}
          >
            📋 Treino do dia
          </div>
        </div>
        <p className="sub" style={{ margin: "8px 0 0" }}>
          {mode === "montar"
            ? "Configure seus dias de treino — modelos, grupos musculares, exercícios e metas de séries/reps."
            : "Acompanhe o treino de hoje — só o que você já selecionou, pronto para marcar e registrar."}
        </p>
      </div>

      {mode === "montar" ? (
        <>
          <div className="card">
            <h2>
              0. Seus dados <span className="tv-tag">para calcular calorias</span>
            </h2>
            <p className="sub" style={{ margin: "-6px 0 14px" }}>
              Usamos peso + tempo de atividade para estimar o gasto calórico (fórmula MET). Idade e altura são
              opcionais.
            </p>
            <div className="tv-userinfo-grid">
              <label>
                Peso (kg) *
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={body.weight ?? ""}
                  onChange={(e) => updateBodyField("weight", e.target.value)}
                  onBlur={() => scheduleSave(true)}
                />
              </label>
              <label>
                Idade (opcional)
                <input
                  type="number"
                  min="0"
                  value={body.age ?? ""}
                  onChange={(e) => updateBodyField("age", e.target.value)}
                  onBlur={() => scheduleSave(true)}
                />
              </label>
              <label>
                Altura cm (opcional)
                <input
                  type="number"
                  min="0"
                  value={body.height ?? ""}
                  onChange={(e) => updateBodyField("height", e.target.value)}
                  onBlur={() => scheduleSave(true)}
                />
              </label>
              <label>
                Sexo (opcional)
                <select value={body.sex ?? ""} onChange={(e) => updateBodyField("sex", e.target.value)}>
                  <option value="">—</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                </select>
              </label>
            </div>
            {saving && (
              <div className="sub" style={{ marginTop: 8 }}>
                Salvando...
              </div>
            )}
          </div>

          <div className="card">
            <h2>
              1. Ponto de partida (opcional) <span className="tv-tag">modelos prontos</span>
            </h2>
            <p className="sub" style={{ margin: "-6px 0 14px" }}>
              Escolha um modelo para preencher a semana rapidamente — depois edite cada dia como quiser, misturando
              qualquer grupo muscular.
            </p>
            <div className="tv-split-grid">
              {(Object.entries(SPLITS) as [SplitKey, (typeof SPLITS)[SplitKey]][]).map(([key, s]) => (
                <div
                  key={key}
                  className={"tv-split-card" + (plan.lastTemplate === key ? " active" : "")}
                  role="button"
                  onClick={() => chooseTemplate(key)}
                >
                  <h3>{s.label}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2>2. Sua semana</h2>
            <div className="tv-week-strip">
              {DAYS.map((d) => {
                const dp = plan.week[d.key];
                const hasActivity = dayHasAnyActivity(dp);
                const kcalInfo = kcalForDay(dp, body.weight);
                const labels: string[] = [];
                if (dp.groups.length) labels.push(dp.groups.map((g) => MUSCLE_GROUPS[g]?.label ?? g).join("+"));
                if (Object.keys(dp.calistenia.exercises).length) labels.push("Calistenia");
                if (dp.warmupExercises.length) labels.push("Aquecimento");
                if (dp.cardio.length) labels.push("Cardio");
                if (dp.sports.length) labels.push("Esporte");
                GENERIC_TYPE_KEYS.forEach((k) => {
                  if (dp.generic[k].exercises.length) labels.push(GENERIC_TAB_LABELS[k].replace(/^\S+\s/, ""));
                });
                return (
                  <div
                    key={d.key}
                    className={"tv-day-chip" + (!hasActivity ? " rest" : "") + (selectedDay === d.key ? " active" : "")}
                    role="button"
                    onClick={() => selectDay(d.key)}
                  >
                    <div className="dname">{d.label.slice(0, 3)}</div>
                    {hasActivity ? (
                      <>
                        <div className="dgroups">{labels.join(" · ")}</div>
                        <div className="dcount">{kcalInfo.total > 0 ? `🔥 ${kcalInfo.total} kcal` : "informe seu peso ↑"}</div>
                      </>
                    ) : (
                      <div className="dgroups">Descanso · toque para editar</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h2>
              3. Monte o treino do dia {dayInfo ? <span className="sub">— {dayInfo.label}</span> : null}
            </h2>
            {!selectedDay || !day ? (
              <div className="fx-empty-state">Selecione um dia da semana acima para editar os grupos e montar os exercícios.</div>
            ) : (
              <>
                <div className="tv-tab-bar">
                  {DAY_TABS.map((t) => (
                    <div
                      key={t.key}
                      className={"tv-tab-btn" + (activeTab === t.key ? " active" : "")}
                      role="button"
                      onClick={() => setActiveTab(t.key)}
                    >
                      {t.label}
                    </div>
                  ))}
                </div>

                {tabPane}

                <DayKcalTotal day={day} weight={body.weight} />
              </>
            )}
          </div>

          <div className="card">
            <h2>4. Resumo do plano</h2>
            <Summary plan={plan} weight={body.weight} />
            <p className="tv-note">
              Os vídeos de execução não podem ser incorporados diretamente aqui — cada exercício traz um link de busca
              no YouTube com o nome correto do movimento.
            </p>
          </div>
        </>
      ) : (
        <div className="card">
          <h2>Treino do dia {dayInfo ? <span className="sub">— {dayInfo.label}</span> : null}</h2>
          <div className="tv-week-stat">
            <span className="num">{trainedDaysCount}</span>{" "}
            {trainedDaysCount === 1 ? "dia treinado" : "dias treinados"} esta semana
          </div>
          <div className="tv-compact-day-strip">
            {DAYS.map((d) => {
              const dp = plan.week[d.key];
              const hasActivity = dayHasAnyActivity(dp);
              return (
                <div
                  key={d.key}
                  className={"tv-compact-day-chip" + (!hasActivity ? " rest" : "") + (selectedDay === d.key ? " active" : "")}
                  role="button"
                  onClick={() => pickDayForTreino(d.key)}
                >
                  {d.label.slice(0, 3)}
                </div>
              );
            })}
          </div>

          {!selectedDay || !day ? (
            <div className="fx-empty-state">Escolha um dia acima para ver o treino de hoje.</div>
          ) : !dayHasAnyActivity(day) ? (
            <div className="fx-empty-state">
              Esse dia ainda não tem nada montado — volte para &quot;⚙️ Montar treino&quot; para escolher os
              exercícios primeiro.
            </div>
          ) : (
            <>
              <div className="tv-tab-bar">
                {DAY_TABS.map((t) => (
                  <div
                    key={t.key}
                    className={"tv-tab-btn" + (activeTab === t.key ? " active" : "")}
                    role="button"
                    onClick={() => setActiveTab(t.key)}
                  >
                    {t.label}
                  </div>
                ))}
              </div>

              <RestTimer suggestedSeconds={suggestedRestSeconds} autoStartSignal={restAutoStartSignal} />

              {tabPane}

              <DayKcalTotal day={day} weight={body.weight} />
            </>
          )}
        </div>
      )}
    </>
  );
}

// =============================================================================
// Rest-timer auto-suggestion (Fase 4, point 6): total session time budget ÷
// number of rest pauses (≈ total planned work sets) for whichever of
// Musculação/Calistenia the active tab is, clamped to a sane range so a
// tiny/huge input never produces a useless timer. Only meaningful for those
// two tabs — everything else falls back to RestTimer's own 60s default.
// =============================================================================
function computeSuggestedRestSeconds(day: DayPlan, activeTab: string): number | undefined {
  function clamp(n: number): number {
    return Math.max(20, Math.min(240, Math.round(n)));
  }
  if (activeTab === "musculacao") {
    const totalSets = Object.values(day.selections).reduce((sum, sel) => sum + (Number(sel.sets) || 0), 0);
    if (totalSets <= 0) return undefined;
    return clamp(((day.strengthDurationMin || 60) * 60) / totalSets);
  }
  if (activeTab === "calistenia") {
    const totalSets = Object.values(day.calistenia.exercises).reduce((sum, ex) => sum + (Number(ex.sets) || 0), 0);
    if (totalSets <= 0) return undefined;
    return clamp(((day.calistenia.durationMin || 30) * 60) / totalSets);
  }
  return undefined;
}

// =============================================================================
// Rest timer — visible on every tab, matches the prototype's 30/60/90/120s
// presets + pause/resume/reset + a short beep on completion. Local-only
// (not persisted): it's a workout-session aid, not plan data. Rendered as a
// fixed/floating widget (.tv-rest-timer-floating, Fase 3 P0 item 5) so it
// stays reachable while scrolling the exercise list, instead of scrolling
// out of view with the rest of the page.
// =============================================================================
function RestTimer({ suggestedSeconds, autoStartSignal }: { suggestedSeconds?: number; autoStartSignal?: number }) {
  const initial = suggestedSeconds ?? 60;
  const [total, setTotal] = useState(initial);
  const [remaining, setRemaining] = useState(initial);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Re-initialize from a new suggestion when the active tab/day changes —
  // only while idle, so it never yanks the timer mid-countdown. Adjusted
  // during render (React's own pattern for resetting state from a changed
  // prop) rather than in an effect, which would cause an extra render.
  // Deliberately scoped to "right when this mounts/the tab changes", not a
  // live in-session pacing engine.
  const [lastSuggested, setLastSuggested] = useState(suggestedSeconds);
  if (suggestedSeconds !== lastSuggested && !running) {
    setLastSuggested(suggestedSeconds);
    if (suggestedSeconds) {
      setTotal(suggestedSeconds);
      setRemaining(suggestedSeconds);
    }
  }

  function clearTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function playBeep() {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.25, ctx.currentTime);
      o.start();
      o.stop(ctx.currentTime + 0.35);
    } catch {
      // ignore — audio isn't essential
    }
  }

  function start(seconds?: number) {
    if (seconds) {
      setTotal(seconds);
      setRemaining(seconds);
    }
    clearTimer();
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearTimer();
          setRunning(false);
          playBeep();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  }
  function pause() {
    clearTimer();
    setRunning(false);
  }
  function reset() {
    clearTimer();
    setRunning(false);
    setRemaining(total);
  }
  useEffect(() => () => clearTimer(), []);

  // Auto-start when the parent bumps `autoStartSignal` (an exercise was just
  // checked off). `lastSignal` is initialised to the prop value at mount, so
  // the first run (and a remount, e.g. switching back to "treino") never
  // fires — only a later change does. start() only touches setters/refs, so
  // the effect can depend solely on the signal.
  const lastSignal = useRef(autoStartSignal);
  useEffect(() => {
    if (autoStartSignal === lastSignal.current) return;
    lastSignal.current = autoStartSignal;
    start(suggestedSeconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStartSignal]);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const display = `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;

  return (
    <div className="tv-subblock tv-rest-timer-box tv-rest-timer-floating">
      <div className="tv-subblock-title">
        <h4>⏱ Cronômetro de descanso</h4>
      </div>
      <div className={"tv-timer-display" + (running ? " running" : "") + (remaining === 0 && !running ? " done" : "")}>
        {display}
      </div>
      <div className="tv-pill-row" style={{ marginBottom: 10 }}>
        {[30, 60, 90, 120].map((sec) => (
          <div key={sec} className="tv-pill" role="button" onClick={() => start(sec)}>
            {sec}s
          </div>
        ))}
        {suggestedSeconds && (
          <div className="tv-pill tv-pill-suggested" role="button" onClick={() => start(suggestedSeconds)}>
            ✨ usar sugestão ({suggestedSeconds}s)
          </div>
        )}
      </div>
      <div className="tv-duration-row">
        <button type="button" className="tv-add-entry-btn" onClick={pause}>
          ⏸ Pausar
        </button>
        <button type="button" className="tv-add-entry-btn" onClick={() => start()}>
          ▶ Retomar
        </button>
        <button type="button" className="tv-add-entry-btn" onClick={reset}>
          ↺ Reiniciar
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// Equipment filter — collapsed by default (Fase 4, point 4): a small
// disclosure toggle instead of an always-open pill box, matching this
// file's existing openGroups/openDetails local-toggle pattern. Montar mode
// only.
// =============================================================================
function EquipmentFilterBox({
  filter,
  onToggle,
  onReset,
}: {
  filter: Record<string, boolean>;
  onToggle: (key: string) => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="tv-editor-box tv-equipment-disclosure">
      <div
        className={"tv-editor-title tv-disclosure-toggle" + (open ? " open" : "")}
        role="button"
        onClick={() => setOpen((v) => !v)}
      >
        <span>⚙️ Filtrar por equipamento disponível</span>
        <span className="chevron">▶</span>
      </div>
      {open && (
        <>
          <div className="tv-pill-row" style={{ marginTop: 10 }}>
            {ALL_EQUIPMENT_KEYS.map((key) => {
              const active = filter[key] !== false;
              return (
                <div key={key} className={"tv-pill" + (active ? " active" : "")} role="button" onClick={() => onToggle(key)}>
                  {EQUIPMENT_TYPES[key]}
                </div>
              );
            })}
          </div>
          <span className="tv-clear-day" onClick={onReset}>
            marcar todos
          </span>
        </>
      )}
    </div>
  );
}

const ALL_LEVELS_KEY = "todos";
const ALL_LEVELS_LABEL = "Todos os níveis";

// =============================================================================
// Training level — decided once at cadastro (TierPicker.tsx) instead of a
// live filter box (Fase 4, point 5). Shown as a read-only line with a
// "mudar" link that reopens the same 4-option picker inline, writing to
// both profiles.avancado_level and the current plan's levelFilter. Montar
// mode only.
// =============================================================================
function LevelMiniPicker({
  levelLabel,
  pickerOpen,
  onTogglePicker,
  onChangeLevel,
}: {
  levelLabel: string | null;
  pickerOpen: boolean;
  onTogglePicker: () => void;
  onChangeLevel: (level: string) => void;
}) {
  return (
    <div className="tv-editor-box tv-level-mini">
      <div className="tv-editor-title">
        <span>
          🎯 Nível: <b>{levelLabel ?? "não definido"}</b>
        </span>
        <span className="tv-clear-day" role="button" onClick={onTogglePicker}>
          mudar
        </span>
      </div>
      {pickerOpen && (
        <div className="tv-pill-row" style={{ marginTop: 10 }}>
          {ALL_LEVEL_KEYS.map((key) => (
            <div
              key={key}
              className={"tv-pill" + (levelLabel === TRAINING_LEVELS[key] ? " active" : "")}
              role="button"
              onClick={() => onChangeLevel(key)}
            >
              {TRAINING_LEVELS[key]}
            </div>
          ))}
          <div
            className={"tv-pill" + (levelLabel === ALL_LEVELS_LABEL ? " active" : "")}
            role="button"
            title="Mostra os exercícios de todos os níveis de uma vez"
            onClick={() => onChangeLevel(ALL_LEVELS_KEY)}
          >
            👁 {ALL_LEVELS_LABEL}
          </div>
        </div>
      )}
      {!levelLabel && (
        <div className="sub" style={{ marginTop: 8 }}>
          Escolha seu nível para filtrar os exercícios por dificuldade.
        </div>
      )}
    </div>
  );
}

function DoneToggle({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <label className="tv-done-toggle" onClick={(e) => e.stopPropagation()}>
      <input type="checkbox" checked={checked} onChange={onToggle} />
      feito hoje
    </label>
  );
}

function ExerciseDetails({
  ex,
  open,
}: {
  ex: { name: string; exec: string; erro: string; gif?: string[] };
  open: boolean;
}) {
  if (!open) return null;
  const ytUrl = "https://www.youtube.com/results?search_query=" + encodeURIComponent(ex.name + " execução exercício");
  return (
    <div className="tv-exercise-details open">
      {ex.gif && <ExerciseMedia name={ex.name} frames={ex.gif} />}
      <p>
        <b>Como fazer:</b> {ex.exec}
      </p>
      <p>
        <b>Erro comum:</b> {ex.erro}
      </p>
      <a className="yt-link" target="_blank" rel="noopener noreferrer" href={ytUrl}>
        ▶ Ver execução no YouTube
      </a>
    </div>
  );
}

// =============================================================================
// Training-log box (1RM/PR/progression/deload/swap + "registrar hoje" form)
// — ported from the prototype's `tv-log-box` block (lines ~10628-10770).
// Rendered inside a selected musculação exercise row, collapsed behind the
// same "detalhes" toggle as ExerciseDetails to keep the list scannable.
// =============================================================================
function OneRMSparkline({ log }: { log: SetLogEntry[] }) {
  const last10 = log.slice(-10);
  if (last10.length < 2) return null;
  const values = last10.map((e) => estimate1RM(e.weight, e.reps));
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const svgW = 220;
  const svgH = 50;
  const pad = 6;
  const range = maxV - minV || 1;
  const stepX = values.length > 1 ? (svgW - pad * 2) / (values.length - 1) : 0;
  const coords = values.map((v, i) => ({
    x: pad + i * stepX,
    y: svgH - pad - ((v - minV) / range) * (svgH - pad * 2),
  }));
  const points = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ opacity: 0.6, fontSize: 11, marginBottom: 2 }}>📉 1RM estimado — últimas {last10.length} sessões</div>
      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ display: "block" }}>
        <polyline points={points} style={{ fill: "none", stroke: "var(--ember)", strokeWidth: 2 }} />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={2.5} style={{ fill: "var(--ember)" }} />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, opacity: 0.6, width: svgW }}>
        <span>{minV}kg</span>
        <span>{maxV}kg</span>
      </div>
    </div>
  );
}

function ExerciseLogBox({
  targetReps,
  log,
  onSave,
  onSwap,
  onRezone,
}: {
  targetReps: string;
  log: SetLogEntry[];
  onSave: (weight: number, reps: number, rpe: number | null, pain: boolean) => void;
  onSwap: () => void;
  onRezone: (zone: string) => void;
}) {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [rpe, setRpe] = useState("");
  const [pain, setPain] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const progression = suggestProgression(log, targetReps);
  const lastEntry = log.length > 0 ? log[log.length - 1] : null;
  const pr = bestPR(log);

  function handleSave(e: React.MouseEvent) {
    e.stopPropagation();
    const w = Number(weight);
    const r = Number(reps);
    if (!w || !r) {
      alert("Informe pelo menos o peso e as reps executadas.");
      return;
    }
    onSave(w, r, rpe === "" ? null : Number(rpe), pain);
    setWeight("");
    setReps("");
    setRpe("");
    setPain(false);
  }

  return (
    <div
      className="tv-log-box"
      onClick={(e) => e.stopPropagation()}
      style={{ width: "100%", marginTop: 8, padding: "8px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 8, fontSize: 13 }}
    >
      <div style={{ opacity: 0.85, marginBottom: 6 }}>
        {progression.stage === "dor" || progression.stage === "swap" || progression.stage === "rezone" ? "" : "📈 "}
        {progression.message}
      </div>

      {progression.stage === "rezone" && progression.suggestedZone && (
        <button type="button" className="tv-add-entry-btn" style={{ marginBottom: 6 }} onClick={() => onRezone(progression.suggestedZone!)}>
          Mudar zona de reps para {progression.suggestedZone}
        </button>
      )}

      {(progression.stage === "swap" || progression.stage === "dor") && (
        <button
          type="button"
          className="tv-add-entry-btn"
          style={{ marginBottom: 6 }}
          title="O histórico deste exercício fica salvo, associado a ele, caso você o marque de novo no futuro."
          onClick={onSwap}
        >
          🔄 Trocar exercício (mesma região)
        </button>
      )}

      {lastEntry && (
        <>
          <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 6 }}>
            Último registro ({lastEntry.date}): {lastEntry.weight}kg × {lastEntry.reps} reps
            {lastEntry.rpe != null ? ` · RPE ${lastEntry.rpe}` : ""}
            {(() => {
              const oneRM = estimate1RM(lastEntry.weight, lastEntry.reps);
              return oneRM ? ` · 1RM estimado: ~${oneRM}kg` : "";
            })()}
          </div>
          {isNewPR(log) && (
            <div style={{ color: "var(--ember)", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
              🎉 Novo recorde nessa última sessão!
            </div>
          )}
          {needsDeload(log) && (
            <div style={{ color: "#e8a33d", fontSize: 12, marginBottom: 6 }}>
              ⚠️ 1RM estimado sem subir há 3 registros seguidos — considere uma semana de deload (reduza ~40% do volume
              ou da carga) antes de tentar progredir de novo.
            </div>
          )}
        </>
      )}

      {pr && (
        <div style={{ opacity: 0.8, fontSize: 12, marginBottom: 6 }}>
          🏆 PR: {pr.entry.weight}kg × {pr.entry.reps} reps (1RM ~{pr.oneRM}kg) em {pr.entry.date}
        </div>
      )}

      <OneRMSparkline log={log} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        <span>Registrar hoje:</span>
        <input type="number" min="0" step="0.5" placeholder="kg" style={{ width: 60 }} value={weight} onChange={(e) => setWeight(e.target.value)} />
        <span>kg ×</span>
        <input type="number" min="0" placeholder="reps" style={{ width: 55 }} value={reps} onChange={(e) => setReps(e.target.value)} />
        <span>reps · RPE</span>
        <input type="number" min="1" max="10" placeholder="opc." style={{ width: 50 }} value={rpe} onChange={(e) => setRpe(e.target.value)} />
        <label style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, opacity: 0.85 }}>
          <input type="checkbox" checked={pain} onChange={(e) => setPain(e.target.checked)} />
          senti dor/desconforto
        </label>
        <button type="button" className="tv-add-entry-btn" onClick={handleSave}>
          Salvar
        </button>
      </div>

      {log.length > 0 && (
        <>
          <span className="toggle-details" style={{ display: "inline-block", marginTop: 6, cursor: "pointer" }} onClick={() => setShowHistory((v) => !v)}>
            ver histórico ({log.length})
          </span>
          {showHistory && (
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
              {log
                .slice()
                .reverse()
                .slice(0, 8)
                .map((entry, i) => (
                  <div key={i}>
                    {entry.date}: {entry.weight}kg × {entry.reps} reps
                    {entry.rpe != null ? ` · RPE ${entry.rpe}` : ""}
                    {entry.pain ? " · ⚠️ dor/desconforto" : ""}
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// =============================================================================
// Tips panel (static reference text, ported verbatim from the prototype) —
// shown once, at the top of the Musculação tab.
// =============================================================================
function TrainingTips() {
  return (
    <div className="tv-editor-box" style={{ marginTop: 12 }}>
      <div className="tv-editor-title">
        <span>📘 Dicas de treino avançado</span>
      </div>
      <details style={{ marginTop: 8 }}>
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>📈 Formas de evoluir (progressão)</summary>
        <div className="tv-tips-body">
          <b>1. Repetições:</b> se está numa faixa como 8-12, primeiro suba as repetições até o topo da faixa (12)
          mantendo a mesma carga.
          <br />
          <b>2. Carga:</b> quando conseguir o topo da faixa com folga, aumente o peso e volte para o início dela (8),
          repetindo o ciclo.
          <br />
          <b>3. Volume:</b> se não conseguir evoluir carga nem repetição, adicione mais uma série de trabalho a esse
          exercício.
          <br />
          <b>4. Densidade:</b> com a mesma carga e o mesmo número de repetições, descanse menos entre as séries.
        </div>
      </details>
      <details style={{ marginTop: 10 }}>
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>🔥 Técnicas avançadas (opcional, por exercício)</summary>
        <div className="tv-tips-body">
          <b>Drop Set:</b> faça a série até a falha, reduza a carga (cerca de 20-30%) e continue até a falha
          novamente, sem descanso.
          <br />
          <br />
          <b>Rest-Pause:</b> faça a série até a falha, descanse de 10 a 15 segundos, e faça mais repetições até
          falhar de novo com a mesma carga.
          <br />
          <br />
          <b>Cluster Set:</b> divida a série em mini-blocos com 10-20s de pausa entre eles, mantendo a mesma carga.
        </div>
      </details>
      <details style={{ marginTop: 10 }}>
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>🔢 Ordem certa dos exercícios</summary>
        <div className="tv-tips-body">
          1) Comece pelo exercício de maior dificuldade/prioridade para você.
          <br />
          2) Multiarticulares (compostos) antes dos isolados.
          <br />
          3) Se o dia treina dois grupos, o grupo muscular maior vai primeiro.
        </div>
      </details>
    </div>
  );
}

// =============================================================================
// Musculação tab
// =============================================================================
function MusculacaoTab({
  mode,
  dayLabel,
  day,
  plan,
  onToggleGroup,
  onClearDay,
  onToggleExercise,
  onUpdateSelection,
  onBlurPersist,
  onChangeDuration,
  onToggleEquipment,
  onResetEquipment,
  levelLabel,
  levelPickerOpen,
  onToggleLevelPicker,
  onChangeLevel,
  openGroups,
  setOpenGroups,
  openDetails,
  setOpenDetails,
  entryFor,
  onToggleDone,
  logFor,
  onSaveLog,
  onSwapExercise,
  onRezone,
}: {
  mode: "montar" | "treino";
  dayLabel: string;
  day: DayPlan;
  plan: AvancadoPlan;
  onToggleGroup: (g: MuscleGroupKey) => void;
  onClearDay: () => void;
  onToggleExercise: (g: MuscleGroupKey, name: string, portion: string) => void;
  onUpdateSelection: (id: string, field: "sets" | "reps" | "warmupSets", value: number | string) => void;
  onBlurPersist: () => void;
  onChangeDuration: (v: number) => void;
  onToggleEquipment: (k: string) => void;
  onResetEquipment: () => void;
  levelLabel: string | null;
  levelPickerOpen: boolean;
  onToggleLevelPicker: () => void;
  onChangeLevel: (level: string) => void;
  openGroups: Record<string, boolean>;
  setOpenGroups: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  openDetails: Record<string, boolean>;
  setOpenDetails: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  entryFor: (id: string) => LogEntry;
  onToggleDone: (id: string) => void;
  logFor: (id: string) => SetLogEntry[];
  onSaveLog: (id: string, weight: number, reps: number, rpe: number | null, pain: boolean) => void;
  onSwapExercise: (groupKey: MuscleGroupKey, portionKey: string, oldId: string, portionExercises: Exercise[]) => void;
  onRezone: (id: string, zone: string) => void;
}) {
  const weeklyVolume = weeklyVolumeByGroup(plan);
  const isMontar = mode === "montar";

  if (day.groups.length === 0 && !isMontar) {
    return <div className="tv-empty-note">Nenhum exercício de musculação selecionado para este dia.</div>;
  }

  return (
    <>
      {isMontar && (
        <div className="tv-editor-box">
          <div className="tv-editor-title">
            <span>Grupos musculares de {dayLabel}</span>
            {day.groups.length > 0 && (
              <span className="tv-clear-day" onClick={onClearDay}>
                limpar dia
              </span>
            )}
          </div>
          <div className="tv-pill-row">
            {ALL_GROUP_KEYS.map((groupKey) => {
              const active = day.groups.includes(groupKey);
              return (
                <div key={groupKey} className={"tv-pill" + (active ? " active" : "")} role="button" onClick={() => onToggleGroup(groupKey)}>
                  {MUSCLE_GROUPS[groupKey].label}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isMontar && <TrainingTips />}

      {day.groups.length === 0 ? (
        <div className="tv-empty-note">Nenhum grupo muscular selecionado para este dia — escolha acima.</div>
      ) : (
        <>
          {isMontar && (
            <>
              <div className="tv-duration-row">
                <span>⏱ Duração estimada da sessão de musculação:</span>
                <input
                  type="number"
                  min="10"
                  step="5"
                  defaultValue={day.strengthDurationMin || 60}
                  onChange={(e) => onChangeDuration(Number(e.target.value) || 60)}
                  onBlur={onBlurPersist}
                />
                <span>min</span>
              </div>

              <EquipmentFilterBox filter={plan.equipmentFilter} onToggle={onToggleEquipment} onReset={onResetEquipment} />
              <LevelMiniPicker
                levelLabel={levelLabel}
                pickerOpen={levelPickerOpen}
                onTogglePicker={onToggleLevelPicker}
                onChangeLevel={onChangeLevel}
              />
            </>
          )}

          {day.groups.map((groupKey) => {
            const group = MUSCLE_GROUPS[groupKey];
            if (!group?.portions) return null;
            const portionEntries = Object.entries(group.portions);
            const totalEx = portionEntries.reduce(
              (sum, [, p]) => sum + p.exercises.filter((ex) => exercisePassesFilters(ex.name, plan.equipmentFilter, plan.levelFilter)).length,
              0
            );
            const selectedCount = Object.keys(day.selections).filter((k) => k.split("::")[1] === groupKey).length;
            if (!isMontar && selectedCount === 0) return null;
            const range = WEEKLY_VOLUME_TARGETS[groupKey] || [8, 12];
            const weekTotal = weeklyVolume[groupKey] || 0;
            const isOpen = isMontar ? !!openGroups[groupKey] : true;
            const tier = HIGH_VOLUME_GROUPS.includes(groupKey) ? "volume alto" : "volume baixo";

            return (
              <div className="tv-group-block" key={groupKey}>
                <div
                  className={"tv-group-header" + (isOpen ? " open" : "") + (isMontar ? "" : " tv-group-header-static")}
                  role={isMontar ? "button" : undefined}
                  onClick={isMontar ? () => setOpenGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] })) : undefined}
                >
                  <h3>{group.label}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    {isMontar && (
                      <>
                        <span className="tv-badge">
                          {selectedCount}/{totalEx} selecionados
                        </span>
                        <span className="tv-badge" title={`Meta: ${range[0]}-${range[1]} séries de trabalho/semana (${tier})`}>
                          📊 {weekTotal}/{range[0]}-{range[1]} séries/sem
                        </span>
                        <span className="chevron">▶</span>
                      </>
                    )}
                  </div>
                </div>
                <div className={"tv-group-body" + (isOpen ? " open" : "")}>
                  {portionEntries.map(([portionKey, portion]) => (
                    <div className="tv-portion-block" key={portionKey}>
                      <div className="tv-portion-title">{portion.label}</div>
                      {portion.exercises.map((ex) => {
                        const id = exerciseKey("musculacao", groupKey, ex.name, portionKey);
                        const sel = day.selections[id];
                        const isChecked = !!sel;
                        if (!isMontar && !isChecked) return null;
                        const passes = exercisePassesFilters(ex.name, plan.equipmentFilter, plan.levelFilter);
                        if (isMontar && !passes && !isChecked) return null;
                        const detailsKey = "m::" + id;
                        const detailsOpen = isMontar ? !!openDetails[detailsKey] : openDetails[detailsKey] !== false;
                        return (
                          <div className={"tv-exercise-row" + (isChecked ? " checked" : "")} key={id}>
                            <div
                              className="tv-exercise-main"
                              role={isMontar ? "button" : undefined}
                              onClick={isMontar ? () => onToggleExercise(groupKey, ex.name, portionKey) : undefined}
                            >
                              {isMontar && <input type="checkbox" checked={isChecked} readOnly />}
                              <span className="exname">{ex.name}</span>
                              <span
                                className="toggle-details"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDetails((prev) => {
                                    const current = isMontar ? !!prev[detailsKey] : prev[detailsKey] !== false;
                                    return { ...prev, [detailsKey]: !current };
                                  });
                                }}
                              >
                                detalhes
                              </span>
                            </div>
                            {isMontar && isChecked && sel && (
                              <div className="tv-setsreps-row">
                                <span title="Séries de preparação (aquecimento, não contam no volume)">Aquecimento:</span>
                                <input
                                  type="number"
                                  min="0"
                                  className="tv-sets-input"
                                  defaultValue={sel.warmupSets}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => onUpdateSelection(id, "warmupSets", Number(e.target.value) || 0)}
                                  onBlur={onBlurPersist}
                                />
                                <span title="Séries de trabalho — contam para a meta de volume semanal">· Trabalho:</span>
                                <input
                                  type="number"
                                  min="1"
                                  className="tv-sets-input"
                                  defaultValue={sel.sets}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => onUpdateSelection(id, "sets", Number(e.target.value) || 3)}
                                  onBlur={onBlurPersist}
                                />
                                <span>× Reps:</span>
                                <input
                                  type="text"
                                  className="tv-reps-input"
                                  defaultValue={sel.reps}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => onUpdateSelection(id, "reps", e.target.value)}
                                  onBlur={onBlurPersist}
                                />
                              </div>
                            )}
                            {!isMontar && sel && (
                              <div className="tv-setsreps-row">
                                <span className="tv-badge">
                                  {sel.sets} séries × {sel.reps}
                                </span>
                                <DoneToggle checked={entryFor(id).checked} onToggle={() => onToggleDone(id)} />
                              </div>
                            )}
                            <ExerciseDetails ex={ex} open={detailsOpen} />
                            {!isMontar && sel && (
                              <ExerciseLogBox
                                targetReps={sel.reps}
                                log={logFor(id)}
                                onSave={(weight, reps, rpe, pain) => onSaveLog(id, weight, reps, rpe, pain)}
                                onSwap={() => onSwapExercise(groupKey, portionKey, id, portion.exercises)}
                                onRezone={(zone) => onRezone(id, zone)}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}
    </>
  );
}

// =============================================================================
// Calistenia tab — same "always all 4 patterns visible" model already used
// by the shared TreinoBoard for the simplified tiers (CALIST_GROUPS).
// =============================================================================
function CalisteniaTab({
  mode,
  day,
  plan,
  onToggleExercise,
  onUpdateField,
  onBlurPersist,
  onChangeDuration,
  onToggleEquipment,
  onResetEquipment,
  levelLabel,
  levelPickerOpen,
  onToggleLevelPicker,
  onChangeLevel,
  openDetails,
  setOpenDetails,
  log,
  onToggleDone,
}: {
  mode: "montar" | "treino";
  day: DayPlan;
  plan: AvancadoPlan;
  onToggleExercise: (name: string) => void;
  onUpdateField: (name: string, field: "sets" | "reps", value: number | string) => void;
  onBlurPersist: () => void;
  onChangeDuration: (v: number) => void;
  onToggleEquipment: (k: string) => void;
  onResetEquipment: () => void;
  levelLabel: string | null;
  levelPickerOpen: boolean;
  onToggleLevelPicker: () => void;
  onChangeLevel: (level: string) => void;
  openDetails: Record<string, boolean>;
  setOpenDetails: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  log: Record<string, LogEntry>;
  onToggleDone: (id: string) => void;
}) {
  const isMontar = mode === "montar";
  const portions = CALIST_GROUPS.calistenia.portions!;
  const portionEntries = Object.entries(portions);
  const totalEx = portionEntries.reduce(
    (sum, [, p]) => sum + p.exercises.filter((ex) => exercisePassesFilters(ex.name, plan.equipmentFilter, plan.levelFilter)).length,
    0
  );
  const selectedCount = Object.keys(day.calistenia.exercises).length;

  if (selectedCount === 0 && !isMontar) {
    return <div className="tv-empty-note">Nenhum exercício de calistenia selecionado para este dia.</div>;
  }

  return (
    <div className="tv-subblock">
      <div className="tv-subblock-title">
        <h4>🤸 Calistenia (peso corporal)</h4>
        <span className="tv-kcal-tag">
          {selectedCount}/{totalEx} selecionados
        </span>
      </div>
      {isMontar && (
        <>
          <EquipmentFilterBox filter={plan.equipmentFilter} onToggle={onToggleEquipment} onReset={onResetEquipment} />
          <LevelMiniPicker
            levelLabel={levelLabel}
            pickerOpen={levelPickerOpen}
            onTogglePicker={onToggleLevelPicker}
            onChangeLevel={onChangeLevel}
          />
        </>
      )}

      {isMontar && selectedCount > 0 && (
        <div className="tv-duration-row">
          <span>⏱ Duração estimada:</span>
          <input
            type="number"
            min="5"
            step="5"
            defaultValue={day.calistenia.durationMin || 30}
            onChange={(e) => onChangeDuration(Number(e.target.value) || 30)}
            onBlur={onBlurPersist}
          />
          <span>min</span>
        </div>
      )}

      {portionEntries.map(([portionKey, portion]) => (
        <div key={portionKey}>
          <div className="tv-portion-title" style={{ marginTop: 10 }}>
            {portion.label}
          </div>
          {portion.exercises.map((ex) => {
            const entry = day.calistenia.exercises[ex.name];
            const isChecked = !!entry;
            if (!isMontar && !isChecked) return null;
            const passes = exercisePassesFilters(ex.name, plan.equipmentFilter, plan.levelFilter);
            if (isMontar && !passes && !isChecked) return null;
            const detailsKey = "c::" + portionKey + "::" + ex.name;
            const detailsOpen = isMontar ? !!openDetails[detailsKey] : openDetails[detailsKey] !== false;
            const logId = exerciseKey("calistenia", "calistenia", ex.name, portionKey);
            return (
              <div className="tv-calist-check-row" key={ex.name}>
                {isMontar && <input type="checkbox" checked={isChecked} onChange={() => onToggleExercise(ex.name)} />}
                <div className="cc-body">
                  <div className="cc-name">
                    {ex.name}{" "}
                    <span
                      className="cc-toggle"
                      onClick={() =>
                        setOpenDetails((prev) => {
                          const current = isMontar ? !!prev[detailsKey] : prev[detailsKey] !== false;
                          return { ...prev, [detailsKey]: !current };
                        })
                      }
                    >
                      detalhes
                    </span>
                  </div>
                  {isMontar && isChecked && entry && (
                    <div className="tv-setsreps-row">
                      <span>Séries:</span>
                      <input
                        type="number"
                        min="1"
                        className="tv-sets-input"
                        defaultValue={entry.sets}
                        onChange={(e) => onUpdateField(ex.name, "sets", Number(e.target.value) || 3)}
                        onBlur={onBlurPersist}
                      />
                      <span>× Reps:</span>
                      <input
                        type="text"
                        className="tv-reps-input"
                        defaultValue={entry.reps}
                        onChange={(e) => onUpdateField(ex.name, "reps", e.target.value)}
                        onBlur={onBlurPersist}
                      />
                    </div>
                  )}
                  {!isMontar && entry && (
                    <div className="tv-setsreps-row">
                      <span className="tv-badge">
                        {entry.sets} séries × {entry.reps}
                      </span>
                      <DoneToggle checked={(log[logId] ?? EMPTY_LOG).checked} onToggle={() => onToggleDone(logId)} />
                    </div>
                  )}
                  <ExerciseDetails ex={ex} open={detailsOpen} />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// Warmup tab — small curated checklist (14 exercises), duration + intensity.
// =============================================================================
function WarmupTab({
  dayKey: _dayKey,
  day,
  onToggleExercise,
  onChangeMinutes,
  onChangeIntensity,
  onBlurPersist,
  log,
  onToggleDone,
  openDetails,
  setOpenDetails,
}: {
  dayKey: DayKey;
  day: DayPlan;
  onToggleExercise: (dayKey: DayKey, name: string) => void;
  onChangeMinutes: (v: number) => void;
  onChangeIntensity: (v: Intensity) => void;
  onBlurPersist: () => void;
  log: Record<string, LogEntry>;
  onToggleDone: (id: string) => void;
  openDetails: Record<string, boolean>;
  setOpenDetails: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) {
  return (
    <div className="tv-subblock">
      <div className="tv-subblock-title">
        <h4>🔆 Aquecimento Dinâmico</h4>
        <span className="tv-kcal-tag">{day.warmupExercises.length}/{WARMUP_EXERCISES.length} selecionados</span>
      </div>
      {day.warmupExercises.length > 0 && (
        <div className="tv-duration-row">
          <span>⏱ Duração:</span>
          <input
            type="number"
            min="5"
            step="5"
            defaultValue={day.warmupMinutes || 10}
            onChange={(e) => onChangeMinutes(Number(e.target.value) || 10)}
            onBlur={onBlurPersist}
          />
          <span>min ·</span>
          <select defaultValue={day.warmupIntensity} onChange={(e) => onChangeIntensity(e.target.value as Intensity)}>
            <option value="leve">Leve</option>
            <option value="moderado">Moderado</option>
            <option value="intenso">Intenso</option>
          </select>
        </div>
      )}
      {WARMUP_EXERCISES.map((ex) => {
        const isChecked = day.warmupExercises.includes(ex.name);
        const detailsKey = "w::" + ex.name;
        const detailsOpen = !!openDetails[detailsKey];
        return (
          <div className="tv-calist-check-row" key={ex.name}>
            <input type="checkbox" checked={isChecked} onChange={() => onToggleExercise(_dayKey, ex.name)} />
            <div className="cc-body">
              <div className="cc-name">
                {ex.name}{" "}
                <span className="cc-toggle" onClick={() => setOpenDetails((prev) => ({ ...prev, [detailsKey]: !prev[detailsKey] }))}>
                  detalhes
                </span>
              </div>
              {isChecked && (
                <DoneToggle
                  checked={(log["warmup::" + ex.name] ?? EMPTY_LOG).checked}
                  onToggle={() => onToggleDone("warmup::" + ex.name)}
                />
              )}
              <ExerciseDetails ex={ex} open={detailsOpen} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// Cardio tab — full CARDIO_ACTIVITIES catalog (23 activities), matches the
// prototype exactly: select activity + intensity, minutes, kcal estimate.
// =============================================================================
function CardioTab({
  day,
  weight,
  onAdd,
  onRemove,
  onUpdate,
  onBlurPersist,
}: {
  day: DayPlan;
  weight: number | null;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<DayPlan["cardio"][number]>) => void;
  onBlurPersist: () => void;
}) {
  return (
    <div className="tv-subblock">
      <div className="tv-subblock-title">
        <h4>🏃 Cardio</h4>
      </div>
      {day.cardio.map((entry) => {
        const act = CARDIO_ACTIVITIES[entry.activityKey];
        const met = act.met[entry.intensity] || act.met.moderado;
        const kcal = weight ? Math.round(met * weight * (entry.minutes / 60)) : 0;
        return (
          <div key={entry.id}>
            <div className="tv-entry-row">
              <select value={entry.activityKey} onChange={(e) => onUpdate(entry.id, { activityKey: e.target.value })}>
                {ALL_CARDIO_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {CARDIO_ACTIVITIES[k].label}
                  </option>
                ))}
              </select>
              <select value={entry.intensity} onChange={(e) => onUpdate(entry.id, { intensity: e.target.value as Intensity })}>
                <option value="leve">Leve</option>
                <option value="moderado">Moderado</option>
                <option value="intenso">Intenso</option>
              </select>
              <input
                type="number"
                min="5"
                step="5"
                style={{ width: 60 }}
                defaultValue={entry.minutes}
                onChange={(e) => onUpdate(entry.id, { minutes: Number(e.target.value) || 30 })}
                onBlur={onBlurPersist}
              />
              <span className="tv-unit-label">min</span>
              <span className="tv-entry-kcal">{weight ? `${kcal} kcal` : "informe seu peso"}</span>
              <span className="tv-remove-entry" role="button" onClick={() => onRemove(entry.id)}>
                ✕
              </span>
            </div>
            <div className="tv-entry-dica">💡 {act.dica}</div>
          </div>
        );
      })}
      <button type="button" className="tv-add-entry-btn" onClick={onAdd}>
        + Adicionar atividade de cardio
      </button>
    </div>
  );
}

// =============================================================================
// Esportes tab — full SPORTS_ACTIVITIES catalog (32 sports), matches the
// prototype exactly: select activity, minutes, kcal estimate (fixed MET).
// =============================================================================
function SportsTab({
  day,
  weight,
  onAdd,
  onRemove,
  onUpdate,
  onBlurPersist,
}: {
  day: DayPlan;
  weight: number | null;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<DayPlan["sports"][number]>) => void;
  onBlurPersist: () => void;
}) {
  return (
    <div className="tv-subblock">
      <div className="tv-subblock-title">
        <h4>⚽ Outras atividades / Esportes</h4>
      </div>
      {day.sports.map((entry) => {
        const act = SPORTS_ACTIVITIES[entry.activityKey];
        const kcal = weight ? Math.round(act.met * weight * (entry.minutes / 60)) : 0;
        return (
          <div className="tv-entry-row" key={entry.id}>
            <select value={entry.activityKey} onChange={(e) => onUpdate(entry.id, { activityKey: e.target.value })}>
              {ALL_SPORTS_KEYS.map((k) => (
                <option key={k} value={k}>
                  {SPORTS_ACTIVITIES[k].label}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="5"
              step="5"
              style={{ width: 60 }}
              defaultValue={entry.minutes}
              onChange={(e) => onUpdate(entry.id, { minutes: Number(e.target.value) || 60 })}
              onBlur={onBlurPersist}
            />
            <span className="tv-unit-label">min</span>
            <span className="tv-entry-kcal">{weight ? `${kcal} kcal` : "informe seu peso"}</span>
            <span className="tv-remove-entry" role="button" onClick={() => onRemove(entry.id)}>
              ✕
            </span>
          </div>
        );
      })}
      <button type="button" className="tv-add-entry-btn" onClick={onAdd}>
        + Adicionar esporte/atividade
      </button>
    </div>
  );
}

// =============================================================================
// Curated circuit tab for HIIT / Tabata / HYROX / CrossFit — ported from the
// prototype's renderWorkoutBlock (lines ~11112-11392): format select
// (CrossFit only), duration (non-circuit formats only), intensity (always),
// rounds/work/rest + "montar circuito sugerido" + "montar por tempo total"
// (circuit formats only), and the exercise-pool checkbox list (grouped by
// `categoria` sub-heading for HYROX's oficial/alternativa split).
// =============================================================================
function CircuitTab({
  mode,
  type,
  day,
  weight,
  levelFilter,
  openDetails,
  setOpenDetails,
  onUpdateField,
  onToggleExercise,
  onApplyPreset,
  onApplyTimeBuilder,
  onClearExercises,
  onBlurPersist,
}: {
  mode: "montar" | "treino";
  type: GenericTypeKey;
  day: DayPlan;
  weight: number | null;
  levelFilter: Record<string, boolean>;
  openDetails: Record<string, boolean>;
  setOpenDetails: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onUpdateField: (patch: Partial<CircuitDayPlan>, immediate?: boolean) => void;
  onToggleExercise: (name: string) => void;
  onApplyPreset: (intensity: Intensity) => void;
  onApplyTimeBuilder: (minutes: number) => void;
  onClearExercises: () => void;
  onBlurPersist: () => void;
}) {
  const isMontar = mode === "montar";
  const circuitDay = day.generic[type];
  const pool = CIRCUIT_POOLS[type];
  const circuit = isCircuitFormat(type, circuitDay);
  const presets = getIntensityPresets(type);
  const preset = presets[circuitDay.intensity] || presets.moderado;
  const presetLabel = circuitDay.intensity === "leve" ? "leve" : circuitDay.intensity === "intenso" ? "intensa" : "moderada";
  const est = computeCircuitEstimate(type, circuitDay, weight);
  const hasCategories = pool.some((ex) => !!ex.categoria);
  const visiblePool = isMontar ? pool : pool.filter((ex) => circuitDay.exercises.includes(ex.name));

  if (!isMontar && circuitDay.exercises.length === 0) {
    return <div className="tv-empty-note">Nenhum exercício de {GENERIC_TAB_LABELS[type]} selecionado para este dia.</div>;
  }

  return (
    <div className="tv-subblock">
      <div className="tv-subblock-title">
        <h4>{GENERIC_TAB_LABELS[type]}</h4>
        {isMontar && (
          <span className="tv-kcal-tag">
            {circuitDay.exercises.length}/{pool.length} selecionados
          </span>
        )}
        {isMontar && circuitDay.exercises.length > 0 && (
          <span
            className="tv-clear-day"
            role="button"
            onClick={() => {
              if (window.confirm(`Desmarcar todos os ${circuitDay.exercises.length} exercícios selecionados em ${GENERIC_TAB_LABELS[type]}?`)) {
                onClearExercises();
              }
            }}
          >
            limpar seleção
          </span>
        )}
      </div>

      {isMontar && levelFilter.idoso !== false && (
        <div className="tv-empty-note" style={{ marginBottom: 12 }}>
          🧓 <b>{GENERIC_TAB_LABELS[type]}</b> normalmente não é recomendado para o perfil 60+/baixo impacto (alto
          impacto, saltos e/ou alta intensidade). Considere usar as abas 🏋️ Musculação ou 🤸 Calistenia com o filtro
          de nível &quot;{TRAINING_LEVELS.idoso}&quot; ativado em vez desta.
        </div>
      )}

      {!isMontar && (
        <div className="tv-duration-row" style={{ marginTop: 8 }}>
          {weight ? (
            <span>
              ⏱ Duração estimada: <b>{est.minutes} min</b> · 🔥 Estimativa: <b>{est.kcal} kcal</b>
            </span>
          ) : (
            <span>⏱ Duração estimada: <b>{est.minutes} min</b></span>
          )}
        </div>
      )}

      {isMontar && (
      <>
      <div className="tv-duration-row" style={{ flexWrap: "wrap" }}>
        {type === "crossfit" && (
          <>
            <span>Formato:</span>
            <select value={circuitDay.format ?? "amrap"} onChange={(e) => onUpdateField({ format: e.target.value as CrossfitFormat }, true)}>
              {CROSSFIT_FORMATS.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
          </>
        )}

        {!circuit && (
          <>
            <span>⏱ Duração:</span>
            <input
              type="number"
              min="5"
              step="5"
              defaultValue={circuitDay.duration}
              onChange={(e) => onUpdateField({ duration: Number(e.target.value) || 20 })}
              onBlur={onBlurPersist}
            />
            <span>min</span>
          </>
        )}

        <select
          value={circuitDay.intensity}
          onChange={(e) => {
            const intensity = e.target.value as Intensity;
            if (circuit && circuitDay.exercises.length === 0) {
              onApplyPreset(intensity);
            } else {
              onUpdateField({ intensity }, true);
            }
          }}
        >
          <option value="leve">Leve</option>
          <option value="moderado">Moderado</option>
          <option value="intenso">Intenso</option>
        </select>

        {circuit && (
          <>
            <span>· Rounds:</span>
            <input
              type="number"
              min="1"
              style={{ width: 50 }}
              defaultValue={circuitDay.rounds}
              onChange={(e) => onUpdateField({ rounds: Number(e.target.value) || 4 })}
              onBlur={onBlurPersist}
            />
            <span>· Trabalho:</span>
            <input
              type="number"
              min="5"
              style={{ width: 50 }}
              defaultValue={circuitDay.workSec}
              onChange={(e) => onUpdateField({ workSec: Number(e.target.value) || 40 })}
              onBlur={onBlurPersist}
            />
            <span>s</span>
            <span>· Descanso:</span>
            <input
              type="number"
              min="0"
              style={{ width: 50 }}
              defaultValue={circuitDay.restSec}
              onChange={(e) => onUpdateField({ restSec: Number(e.target.value) || 20 })}
              onBlur={onBlurPersist}
            />
            <span>s</span>
          </>
        )}
      </div>

      {type === "crossfit" && !circuit && (
        <div className="tv-duration-row" style={{ marginTop: 6 }}>
          <span style={{ opacity: 0.8, fontSize: 13 }}>
            {circuitDay.format === "amrap"
              ? "AMRAP: esforço contínuo dentro do tempo — sem descanso programado, por isso o gasto usa duração × intensidade."
              : "For Time: esforço contínuo até terminar — sem descanso programado, por isso o gasto usa duração × intensidade."}
          </span>
        </div>
      )}

      {circuit && (
        <>
          <div className="tv-duration-row" style={{ flexWrap: "wrap", marginTop: 8 }}>
            <button type="button" className="tv-add-entry-btn" onClick={() => onApplyPreset(circuitDay.intensity)}>
              {circuitDay.exercises.length === 0
                ? `✨ Montar circuito sugerido (intensidade ${presetLabel})`
                : `✨ Sortear novo circuito para intensidade ${presetLabel}`}
            </button>
            <span style={{ opacity: 0.8, fontSize: 13 }}>
              Sugestão: {preset.rounds} rounds · {preset.workSec}s trabalho / {preset.restSec}s descanso ·{" "}
              {preset.exerciseRange} exercícios (sorteados automaticamente, você pode trocar depois na lista abaixo)
            </span>
          </div>

          <div className="tv-duration-row" style={{ flexWrap: "wrap", marginTop: 8 }}>
            <span>🕐 Montar treino por tempo total:</span>
            <select
              defaultValue=""
              onChange={(e) => {
                if (!e.target.value) return;
                onApplyTimeBuilder(Number(e.target.value));
                e.target.value = "";
              }}
            >
              <option value="">Escolher duração...</option>
              {TIME_BUILDER_OPTIONS.map((mins) => (
                <option key={mins} value={mins}>
                  {mins >= 75 ? "60+ min" : `${mins} min`}
                </option>
              ))}
            </select>
            <span style={{ opacity: 0.8, fontSize: 13 }}>
              Escolhe quantos exercícios entram no circuito e calcula os rounds pra fechar perto do tempo total (usando
              a intensidade {presetLabel} atual) — depois ajuste à vontade.
            </span>
          </div>

          <div className="tv-duration-row" style={{ marginTop: 8 }}>
            {circuitDay.exercises.length === 0 ? (
              <span>⏱ Nenhum exercício marcado ainda — use o botão acima ou marque manualmente na lista abaixo para ver a duração e as calorias estimadas.</span>
            ) : weight ? (
              <span>
                ⏱ Duração estimada: <b>{est.minutes} min</b> ({circuitDay.exercises.length} exercícios × {circuitDay.rounds} rounds × [
                {circuitDay.workSec}s trabalho + {circuitDay.restSec}s descanso]) · 🔥 Estimativa: <b>{est.kcal} kcal</b>
              </span>
            ) : (
              <span>
                ⏱ Duração estimada: <b>{est.minutes} min</b> · informe seu peso na seção 0 para ver a estimativa de
                calorias
              </span>
            )}
          </div>
        </>
      )}
      </>
      )}

      {visiblePool.map((ex, idx) => {
        const isChecked = circuitDay.exercises.includes(ex.name);
        const detailsKey = `g::${type}::${ex.name}`;
        const detailsOpen = isMontar ? !!openDetails[detailsKey] : openDetails[detailsKey] !== false;
        const prevCategoria = idx > 0 ? visiblePool[idx - 1].categoria ?? null : null;
        const showCategoryHeading = isMontar && hasCategories && (ex.categoria ?? null) !== prevCategoria;
        return (
            <div key={ex.name}>
              {showCategoryHeading && (
                <div className="tv-portion-title" style={{ marginTop: 12 }}>
                  {ex.categoria === "oficial"
                    ? "🏁 As 8 estações oficiais da prova"
                    : "🔁 Variações/alternativas para treinar sem o equipamento oficial"}
                </div>
              )}
              <div className="tv-calist-check-row">
                {isMontar && <input type="checkbox" checked={isChecked} onChange={() => onToggleExercise(ex.name)} />}
                <div className="cc-body">
                  <div className="cc-name">
                    {ex.name}{" "}
                    <span
                      className="cc-toggle"
                      onClick={() =>
                        setOpenDetails((prev) => {
                          const current = isMontar ? !!prev[detailsKey] : prev[detailsKey] !== false;
                          return { ...prev, [detailsKey]: !current };
                        })
                      }
                    >
                      detalhes
                    </span>
                  </div>
                  <ExerciseDetails ex={ex} open={detailsOpen} />
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}

// =============================================================================
function DayKcalTotal({ day, weight }: { day: DayPlan; weight: number | null }) {
  const info = kcalForDay(day, weight);
  if (!weight) {
    return (
      <div className="tv-day-kcal-total">
        <div className="tv-no-weight-warning">Informe seu peso na seção 0 acima para ver a estimativa de calorias deste dia.</div>
      </div>
    );
  }
  if (info.breakdown.length === 0) {
    return (
      <div className="tv-day-kcal-total">
        <div className="small">Adicione musculação, calistenia, cardio ou um esporte para ver a estimativa de calorias.</div>
      </div>
    );
  }
  return (
    <div className="tv-day-kcal-total">
      <div className="big">🔥 {info.total} kcal</div>
      <div className="small">{info.breakdown.map((b) => `${b.label}: ${b.kcal} kcal`).join(" · ")}</div>
      <div className="small" style={{ marginTop: 4 }}>
        Estimativa por MET (peso × tempo × intensidade) — valor aproximado.
      </div>
    </div>
  );
}

// =============================================================================
function Summary({ plan, weight }: { plan: AvancadoPlan; weight: number | null }) {
  let totalSelected = 0;
  let activeDays = 0;
  let weeklyKcal = 0;
  const groupCount: Record<string, number> = {};

  DAYS.forEach((d) => {
    const dp = plan.week[d.key];
    if (dayHasAnyActivity(dp)) activeDays++;
    weeklyKcal += kcalForDay(dp, weight).total;
    Object.keys(dp.selections).forEach((key) => {
      totalSelected++;
      const g = key.split("::")[1];
      groupCount[g] = (groupCount[g] || 0) + 1;
    });
  });

  const stats = [
    { num: activeDays, lbl: "Dias com atividade/semana" },
    { num: totalSelected, lbl: "Exercícios de musculação" },
    { num: Object.keys(groupCount).length, lbl: "Grupos musculares ativos" },
    { num: DAYS.length - activeDays, lbl: "Dias de descanso" },
  ];

  const weeklyVolume = weeklyVolumeByGroup(plan);
  const volumeRows = ALL_GROUP_KEYS.filter((g) => (weeklyVolume[g] || 0) > 0);

  return (
    <>
      <div className="tv-summary-grid">
        {stats.map((s) => (
          <div className="tv-stat" key={s.lbl}>
            <div className="num">{s.num}</div>
            <div className="lbl">{s.lbl}</div>
          </div>
        ))}
        <div className="tv-stat tv-stat-wide">
          {weight ? (
            <>
              <div className="num ember">🔥 {weeklyKcal} kcal</div>
              <div className="lbl">Estimativa de gasto calórico da semana toda</div>
            </>
          ) : (
            <>
              <div className="num">Informe seu peso ↑ (seção 0)</div>
              <div className="lbl">para ver a estimativa calórica da semana</div>
            </>
          )}
        </div>
      </div>

      {volumeRows.length > 0 && (
        <div className="tv-stat tv-stat-wide tv-volume-card">
          <div className="lbl" style={{ marginBottom: 6 }}>
            📊 Volume semanal de séries de trabalho por grupo muscular
          </div>
          {volumeRows.map((g) => {
            const total = weeklyVolume[g] || 0;
            const range = WEEKLY_VOLUME_TARGETS[g] || [8, 12];
            const tier = HIGH_VOLUME_GROUPS.includes(g) ? "alto" : "baixo";
            const status = total < range[0] ? "⬇ abaixo da faixa" : total > range[1] ? "⬆ acima da faixa" : "✅ dentro da faixa";
            return (
              <div className="tv-volume-row" key={g}>
                <span>
                  {MUSCLE_GROUPS[g].label} <span className="dim">(volume {tier}, meta {range[0]}-{range[1]})</span>
                </span>
                <span>
                  {total} séries/sem · {status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
