"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { todayBR } from "@/lib/date-br";
import ExerciseMedia from "@/components/ExerciseMedia";
import { DAYS, type DayKey, exerciseKey } from "@/lib/treino-shared-types";
import { MUSCLE_GROUPS, CALIST_GROUPS, SPLITS, type MuscleGroupKey, type SplitKey } from "@/lib/treino-avancado-data";
import {
  ALL_GROUP_KEYS,
  EQUIPMENT_TYPES,
  ALL_EQUIPMENT_KEYS,
  TRAINING_LEVELS,
  ALL_LEVEL_KEYS,
  exercisePassesFilters,
  defaultEquipmentFilter,
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
} from "@/lib/treino-avancado-builder";

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
}: {
  profileId: string;
  initialPlan: AvancadoPlan;
  initialBody: BodyInfo;
  initialLog: Record<string, LogEntry>;
}) {
  const [plan, setPlan] = useState<AvancadoPlan>(initialPlan);
  const [body, setBody] = useState<BodyInfo>(initialBody);
  const [log, setLog] = useState<Record<string, LogEntry>>(initialLog);
  const [selectedDay, setSelectedDay] = useState<DayKey | null>(null);
  const [activeTab, setActiveTab] = useState<string>("musculacao");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [openDetails, setOpenDetails] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

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
    setLog((prev) => {
      const current = prev[id] ?? EMPTY_LOG;
      const updated = { ...current, checked: !current.checked };
      persistLogEntry(id, updated);
      return { ...prev, [id]: updated };
    });
  }

  function entryFor(id: string): LogEntry {
    return log[id] ?? EMPTY_LOG;
  }

  // -------------------------------------------------------------------------
  function chooseTemplate(key: SplitKey) {
    setPlan((prev) => {
      const next = applyTemplate(prev, key);
      latestPlan.current = next;
      return next;
    });
    scheduleSave(true);
  }

  function selectDay(dayKey: DayKey) {
    setSelectedDay((prev) => (prev === dayKey ? null : dayKey));
    setOpenGroups({});
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

  function addGenericEntry(dayKey: DayKey, type: GenericTypeKey) {
    updateDay(
      dayKey,
      (day) => ({
        ...day,
        generic: {
          ...day.generic,
          [type]: [...day.generic[type], { id: newEntryId("g"), label: "", intensity: "moderado" as Intensity, minutes: 20 }],
        },
      }),
      true
    );
  }
  function removeGenericEntry(dayKey: DayKey, type: GenericTypeKey, id: string) {
    updateDay(dayKey, (day) => ({ ...day, generic: { ...day.generic, [type]: day.generic[type].filter((e) => e.id !== id) } }), true);
  }
  function updateGenericEntry(dayKey: DayKey, type: GenericTypeKey, id: string, patch: Partial<DayPlan["generic"][GenericTypeKey][number]>) {
    updateDay(dayKey, (day) => ({
      ...day,
      generic: { ...day.generic, [type]: day.generic[type].map((e) => (e.id === id ? { ...e, ...patch } : e)) },
    }));
  }

  function toggleEquipment(key: string) {
    setPlan((prev) => {
      const next = { ...prev, equipmentFilter: { ...prev.equipmentFilter, [key]: prev.equipmentFilter[key] === false } };
      latestPlan.current = next;
      return next;
    });
    scheduleSave(true);
  }
  function resetEquipment() {
    setPlan((prev) => {
      const next = { ...prev, equipmentFilter: defaultEquipmentFilter() };
      latestPlan.current = next;
      return next;
    });
    scheduleSave(true);
  }
  function toggleLevel(key: string) {
    setPlan((prev) => {
      const next = { ...prev, levelFilter: { ...prev.levelFilter, [key]: prev.levelFilter[key] === false } };
      latestPlan.current = next;
      return next;
    });
    scheduleSave(true);
  }
  function resetLevel() {
    setPlan((prev) => {
      const next = { ...prev, levelFilter: defaultLevelFilter() };
      latestPlan.current = next;
      return next;
    });
    scheduleSave(true);
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

  return (
    <>
      <div className="card">
        <h2>
          0. Seus dados <span className="tv-tag">para calcular calorias</span>
        </h2>
        <p className="sub" style={{ margin: "-6px 0 14px" }}>
          Usamos peso + tempo de atividade para estimar o gasto calórico (fórmula MET). Idade e altura são opcionais.
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
              if (dp.generic[k].length) labels.push(GENERIC_TAB_LABELS[k].replace(/^\S+\s/, ""));
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

            <RestTimer />

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
                  onToggleLevel={toggleLevel}
                  onResetLevel={resetLevel}
                  openGroups={openGroups}
                  setOpenGroups={setOpenGroups}
                  openDetails={openDetails}
                  setOpenDetails={setOpenDetails}
                  entryFor={entryFor}
                  onToggleDone={toggleDone}
                />
              )}
              {activeTab === "calistenia" && (
                <CalisteniaTab
                  day={day}
                  plan={plan}
                  onToggleExercise={(name) => toggleCalistExercise(selectedDay, name)}
                  onUpdateField={(name, field, value) => updateCalistField(selectedDay, name, field, value)}
                  onBlurPersist={() => scheduleSave(true)}
                  onChangeDuration={(v) => updateDay(selectedDay, (d) => ({ ...d, calistenia: { ...d.calistenia, durationMin: v } }))}
                  onToggleEquipment={toggleEquipment}
                  onResetEquipment={resetEquipment}
                  onToggleLevel={toggleLevel}
                  onResetLevel={resetLevel}
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
                <GenericTab
                  type={activeTab as GenericTypeKey}
                  day={day}
                  weight={body.weight}
                  onAdd={() => addGenericEntry(selectedDay, activeTab as GenericTypeKey)}
                  onRemove={(id) => removeGenericEntry(selectedDay, activeTab as GenericTypeKey, id)}
                  onUpdate={(id, patch) => updateGenericEntry(selectedDay, activeTab as GenericTypeKey, id, patch)}
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
  );
}

// =============================================================================
// Rest timer — visible on every tab, matches the prototype's 30/60/90/120s
// presets + pause/resume/reset + a short beep on completion. Local-only
// (not persisted): it's a workout-session aid, not plan data.
// =============================================================================
function RestTimer() {
  const [total, setTotal] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const display = `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;

  return (
    <div className="tv-subblock tv-rest-timer-box">
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
// Equipment / training-level filter pill boxes — shared by Musculação and
// Calistenia (both filter the same way, same underlying keyword detection).
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
  return (
    <div className="tv-editor-box">
      <div className="tv-editor-title">
        <span>🎒 Equipamentos disponíveis (desmarque o que você não tem)</span>
      </div>
      <div className="tv-pill-row">
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
    </div>
  );
}

function LevelFilterBox({
  filter,
  onToggle,
  onReset,
}: {
  filter: Record<string, boolean>;
  onToggle: (key: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="tv-editor-box">
      <div className="tv-editor-title">
        <span>🎯 Nível de treino (filtre por dificuldade)</span>
      </div>
      <div className="tv-pill-row">
        {ALL_LEVEL_KEYS.map((key) => {
          const active = filter[key] !== false;
          return (
            <div key={key} className={"tv-pill" + (active ? " active" : "")} role="button" onClick={() => onToggle(key)}>
              {TRAINING_LEVELS[key]}
            </div>
          );
        })}
      </div>
      <span className="tv-clear-day" onClick={onReset}>
        marcar todos
      </span>
      {filter.idoso !== false && (
        <div className="sub" style={{ marginTop: 8 }}>
          🧓 Recomendamos validar esses exercícios com um profissional de educação física, especialmente se você tem
          alguma condição pré-existente.
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
  onToggleLevel,
  onResetLevel,
  openGroups,
  setOpenGroups,
  openDetails,
  setOpenDetails,
  entryFor,
  onToggleDone,
}: {
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
  onToggleLevel: (k: string) => void;
  onResetLevel: () => void;
  openGroups: Record<string, boolean>;
  setOpenGroups: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  openDetails: Record<string, boolean>;
  setOpenDetails: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  entryFor: (id: string) => LogEntry;
  onToggleDone: (id: string) => void;
}) {
  const weeklyVolume = weeklyVolumeByGroup(plan);

  return (
    <>
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

      <TrainingTips />

      {day.groups.length === 0 ? (
        <div className="tv-empty-note">Nenhum grupo muscular selecionado para este dia — escolha acima.</div>
      ) : (
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
          <LevelFilterBox filter={plan.levelFilter} onToggle={onToggleLevel} onReset={onResetLevel} />

          {day.groups.map((groupKey) => {
            const group = MUSCLE_GROUPS[groupKey];
            if (!group?.portions) return null;
            const portionEntries = Object.entries(group.portions);
            const totalEx = portionEntries.reduce(
              (sum, [, p]) => sum + p.exercises.filter((ex) => exercisePassesFilters(ex.name, plan.equipmentFilter, plan.levelFilter)).length,
              0
            );
            const selectedCount = Object.keys(day.selections).filter((k) => k.split("::")[1] === groupKey).length;
            const range = WEEKLY_VOLUME_TARGETS[groupKey] || [8, 12];
            const weekTotal = weeklyVolume[groupKey] || 0;
            const isOpen = !!openGroups[groupKey];
            const tier = HIGH_VOLUME_GROUPS.includes(groupKey) ? "volume alto" : "volume baixo";

            return (
              <div className="tv-group-block" key={groupKey}>
                <div
                  className={"tv-group-header" + (isOpen ? " open" : "")}
                  role="button"
                  onClick={() => setOpenGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }))}
                >
                  <h3>{group.label}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span className="tv-badge">
                      {selectedCount}/{totalEx} selecionados
                    </span>
                    <span className="tv-badge" title={`Meta: ${range[0]}-${range[1]} séries de trabalho/semana (${tier})`}>
                      📊 {weekTotal}/{range[0]}-{range[1]} séries/sem
                    </span>
                    <span className="chevron">▶</span>
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
                        const passes = exercisePassesFilters(ex.name, plan.equipmentFilter, plan.levelFilter);
                        if (!passes && !isChecked) return null;
                        const detailsKey = "m::" + id;
                        const detailsOpen = !!openDetails[detailsKey];
                        return (
                          <div className={"tv-exercise-row" + (isChecked ? " checked" : "")} key={id}>
                            <div className="tv-exercise-main" role="button" onClick={() => onToggleExercise(groupKey, ex.name, portionKey)}>
                              <input type="checkbox" checked={isChecked} readOnly />
                              <span className="exname">{ex.name}</span>
                              <span
                                className="toggle-details"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDetails((prev) => ({ ...prev, [detailsKey]: !prev[detailsKey] }));
                                }}
                              >
                                detalhes
                              </span>
                            </div>
                            {isChecked && sel && (
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
                                <DoneToggle checked={entryFor(id).checked} onToggle={() => onToggleDone(id)} />
                              </div>
                            )}
                            <ExerciseDetails ex={ex} open={detailsOpen} />
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
  day,
  plan,
  onToggleExercise,
  onUpdateField,
  onBlurPersist,
  onChangeDuration,
  onToggleEquipment,
  onResetEquipment,
  onToggleLevel,
  onResetLevel,
  openDetails,
  setOpenDetails,
  log,
  onToggleDone,
}: {
  day: DayPlan;
  plan: AvancadoPlan;
  onToggleExercise: (name: string) => void;
  onUpdateField: (name: string, field: "sets" | "reps", value: number | string) => void;
  onBlurPersist: () => void;
  onChangeDuration: (v: number) => void;
  onToggleEquipment: (k: string) => void;
  onResetEquipment: () => void;
  onToggleLevel: (k: string) => void;
  onResetLevel: () => void;
  openDetails: Record<string, boolean>;
  setOpenDetails: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  log: Record<string, LogEntry>;
  onToggleDone: (id: string) => void;
}) {
  const portions = CALIST_GROUPS.calistenia.portions!;
  const portionEntries = Object.entries(portions);
  const totalEx = portionEntries.reduce(
    (sum, [, p]) => sum + p.exercises.filter((ex) => exercisePassesFilters(ex.name, plan.equipmentFilter, plan.levelFilter)).length,
    0
  );
  const selectedCount = Object.keys(day.calistenia.exercises).length;

  return (
    <div className="tv-subblock">
      <div className="tv-subblock-title">
        <h4>🤸 Calistenia (peso corporal)</h4>
        <span className="tv-kcal-tag">
          {selectedCount}/{totalEx} selecionados
        </span>
      </div>
      <EquipmentFilterBox filter={plan.equipmentFilter} onToggle={onToggleEquipment} onReset={onResetEquipment} />
      <LevelFilterBox filter={plan.levelFilter} onToggle={onToggleLevel} onReset={onResetLevel} />

      {selectedCount > 0 && (
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
            const passes = exercisePassesFilters(ex.name, plan.equipmentFilter, plan.levelFilter);
            if (!passes && !isChecked) return null;
            const detailsKey = "c::" + portionKey + "::" + ex.name;
            const detailsOpen = !!openDetails[detailsKey];
            const logId = exerciseKey("calistenia", "calistenia", ex.name, portionKey);
            return (
              <div className="tv-calist-check-row" key={ex.name}>
                <input type="checkbox" checked={isChecked} onChange={() => onToggleExercise(ex.name)} />
                <div className="cc-body">
                  <div className="cc-name">
                    {ex.name}{" "}
                    <span
                      className="cc-toggle"
                      onClick={() => setOpenDetails((prev) => ({ ...prev, [detailsKey]: !prev[detailsKey] }))}
                    >
                      detalhes
                    </span>
                  </div>
                  {isChecked && entry && (
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
// Generic fallback tab for HIIT / Tabata / HYROX / CrossFit — free-form
// "what + how long + how hard" entries instead of the prototype's curated
// 30-45-exercise pools and circuit-round builder (documented scope cut —
// see the header comment in lib/treino-avancado-builder.ts).
// =============================================================================
function GenericTab({
  type,
  day,
  weight,
  onAdd,
  onRemove,
  onUpdate,
  onBlurPersist,
}: {
  type: GenericTypeKey;
  day: DayPlan;
  weight: number | null;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<DayPlan["generic"][GenericTypeKey][number]>) => void;
  onBlurPersist: () => void;
}) {
  const entries = day.generic[type];
  return (
    <div className="tv-subblock">
      <div className="tv-subblock-title">
        <h4>{GENERIC_TAB_LABELS[type]}</h4>
      </div>
      <p className="sub" style={{ marginTop: -4 }}>
        Descreva o que vai treinar (estações, exercícios do circuito, formato) e informe duração/intensidade para a
        estimativa de calorias.
      </p>
      {entries.map((entry) => {
        return (
          <div className="tv-entry-row" key={entry.id}>
            <input
              type="text"
              placeholder="O que vai treinar?"
              defaultValue={entry.label}
              style={{ flex: "1 1 180px" }}
              onChange={(e) => onUpdate(entry.id, { label: e.target.value })}
              onBlur={onBlurPersist}
            />
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
              onChange={(e) => onUpdate(entry.id, { minutes: Number(e.target.value) || 20 })}
              onBlur={onBlurPersist}
            />
            <span className="tv-unit-label">min</span>
            <span className="tv-remove-entry" role="button" onClick={() => onRemove(entry.id)}>
              ✕
            </span>
          </div>
        );
      })}
      <button type="button" className="tv-add-entry-btn" onClick={onAdd}>
        + Adicionar atividade
      </button>
      {!weight && entries.length > 0 && <div className="sub" style={{ marginTop: 6 }}>Informe seu peso na seção 0 para ver a estimativa de calorias.</div>}
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
