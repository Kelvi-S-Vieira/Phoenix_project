"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { todayBR } from "@/lib/date-br";
import ExerciseMedia from "@/components/ExerciseMedia";
import {
  DAYS,
  exerciseId,
  CARDIO_ACTIVITIES,
  CARDIO_INTENSITIES,
  type DayKey,
  type Split,
  type WorkoutType,
  type WorkoutTypeKey,
  type MuscleGroup,
  type Exercise,
  type CardioIntensity,
} from "@/lib/treino-shared-types";

interface LogEntry {
  checked: boolean;
  sets: string;
  reps: string;
  load: string;
}

// One row of the simple Cardio tab log (corrida/bike/elíptico/natação +
// duração + intensidade, NO calorie/MET calculation — see
// lib/treino-shared-types.ts). `id` mirrors the `cardio_log_entries.id` uuid
// once persisted; a locally-added-but-not-yet-saved entry temporarily uses a
// client-generated id until the insert resolves.
interface CardioEntry {
  id: string;
  activityKey: string;
  duration: string;
  intensity: CardioIntensity;
}

// "Tab" the day-content area is showing — either one of the generic
// muscle-group-browsing workout types (musculação/calistenia) or the
// cardio log, which is structurally unrelated (flat activity+duration+
// intensity entries, not WorkoutType/MuscleGroup) and always available,
// even on a rest day — see renderCardioTab below.
type ActiveMode = WorkoutTypeKey | "cardio";

const EMPTY_ENTRY: LogEntry = { checked: false, sets: "", reps: "", load: "" };

export default function TreinoBoard({
  profileId,
  split,
  workoutTypes,
  muscleGroups,
  initialLog,
  initialCardio,
  defaultDay,
  sectionClass,
  leadClass,
  weekLead,
}: {
  profileId: string;
  split: Split;
  workoutTypes: Record<WorkoutTypeKey, WorkoutType>;
  muscleGroups: Record<string, MuscleGroup>;
  initialLog: Record<string, LogEntry>;
  initialCardio: Record<DayKey, CardioEntry[]>;
  defaultDay: DayKey | null;
  // Tier-specific section wrapper/lead classes ("tb-section"/"tb-lead" or
  // "ti-section"/"ti-lead") and the "2. Sua semana" lead paragraph text,
  // ported from the prototype's #page-treino-basico/#page-treino-intermediario
  // markup — see app/treino/page.tsx's TIER_CONTENT.
  sectionClass: string;
  leadClass: string;
  weekLead: string;
}) {
  const [selectedDay, setSelectedDay] = useState<DayKey | null>(defaultDay);
  const [activeTab, setActiveTab] = useState<ActiveMode>("musculacao");
  const [log, setLog] = useState<Record<string, LogEntry>>(initialLog);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [cardio, setCardio] = useState<Record<DayKey, CardioEntry[]>>(initialCardio);
  const [cardioForm, setCardioForm] = useState<{ activityKey: string; duration: string; intensity: CardioIntensity }>({
    activityKey: CARDIO_ACTIVITIES[0].key,
    duration: "",
    intensity: "moderado",
  });

  function entryFor(id: string): LogEntry {
    return log[id] ?? EMPTY_ENTRY;
  }

  function dayHasChecked(dayKey: DayKey) {
    const prefix = dayKey + "::";
    return Object.entries(log).some(
      ([id, entry]) => id.startsWith(prefix) && entry.checked
    );
  }

  function dayHasCardio(dayKey: DayKey) {
    return (cardio[dayKey]?.length ?? 0) > 0;
  }

  async function addCardioEntry(dayKey: DayKey) {
    const duration = cardioForm.duration === "" ? null : Number(cardioForm.duration);
    const supabase = createClient();
    const { data } = await supabase
      .from("cardio_log_entries")
      .insert({
        profile_id: profileId,
        day_key: dayKey,
        activity_key: cardioForm.activityKey,
        duration,
        intensity: cardioForm.intensity,
      })
      .select("id")
      .single();
    const entry: CardioEntry = {
      id: data?.id ?? `local_${crypto.randomUUID()}`,
      activityKey: cardioForm.activityKey,
      duration: duration != null ? String(duration) : "",
      intensity: cardioForm.intensity,
    };
    setCardio((prev) => ({ ...prev, [dayKey]: [...(prev[dayKey] ?? []), entry] }));
    setCardioForm({ activityKey: CARDIO_ACTIVITIES[0].key, duration: "", intensity: "moderado" });
  }

  async function removeCardioEntry(dayKey: DayKey, id: string) {
    setCardio((prev) => ({
      ...prev,
      [dayKey]: (prev[dayKey] ?? []).filter((e) => e.id !== id),
    }));
    const supabase = createClient();
    await supabase.from("cardio_log_entries").delete().eq("id", id).eq("profile_id", profileId);
  }

  function renderCardioTab(dayKey: DayKey) {
    const entries = cardio[dayKey] ?? [];
    return (
      <div>
        <div className="fx-cardio-form">
          <label>
            Atividade
            <select
              value={cardioForm.activityKey}
              onChange={(e) => setCardioForm((f) => ({ ...f, activityKey: e.target.value }))}
            >
              {CARDIO_ACTIVITIES.map((a) => (
                <option key={a.key} value={a.key}>
                  {a.icon} {a.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Duração (min)
            <input
              type="number"
              min="0"
              placeholder="30"
              value={cardioForm.duration}
              onChange={(e) => setCardioForm((f) => ({ ...f, duration: e.target.value }))}
            />
          </label>
          <label>
            Intensidade
            <select
              value={cardioForm.intensity}
              onChange={(e) => setCardioForm((f) => ({ ...f, intensity: e.target.value as CardioIntensity }))}
            >
              {CARDIO_INTENSITIES.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="fx-cardio-add-btn" onClick={() => addCardioEntry(dayKey)}>
            + Registrar
          </button>
        </div>

        {entries.length === 0 ? (
          <div className="fx-empty-state">
            Nenhuma atividade de cardio registrada para este dia ainda.
          </div>
        ) : (
          entries.map((entry) => {
            const activityDef = CARDIO_ACTIVITIES.find((a) => a.key === entry.activityKey);
            const intensityDef = CARDIO_INTENSITIES.find(([key]) => key === entry.intensity);
            return (
              <div className="fx-cardio-entry" key={entry.id}>
                <span className="fx-cardio-icon">{activityDef?.icon ?? "🏃"}</span>
                <span className="fx-cardio-info">
                  <b>{activityDef?.label ?? entry.activityKey}</b>
                  {entry.duration ? ` — ${entry.duration} min` : ""}
                  {intensityDef ? ` — ${intensityDef[1]}` : ""}
                </span>
                <button
                  type="button"
                  className="fx-cardio-del"
                  onClick={() => removeCardioEntry(dayKey, entry.id)}
                >
                  Remover
                </button>
              </div>
            );
          })
        )}
      </div>
    );
  }

  async function persist(id: string, entry: LogEntry) {
    setSavingId(id);
    const supabase = createClient();
    const today = todayBR();
    await supabase.from("workout_log_entries").upsert(
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
    );
    if (entry.checked) {
      await supabase.from("activity_days").upsert(
        { profile_id: profileId, activity_date: today },
        { onConflict: "profile_id,activity_date" }
      );
    }
    setSavingId(null);
  }

  function updateField(id: string, field: keyof LogEntry, value: string | boolean, persistNow: boolean) {
    setLog((prev) => {
      const current = prev[id] ?? EMPTY_ENTRY;
      const updated = { ...current, [field]: value };
      const next = { ...prev, [id]: updated };
      if (persistNow) persist(id, updated);
      return next;
    });
  }

  const groups = selectedDay ? split.week[selectedDay] : null;
  // "cardio" is not a WorkoutTypeKey (it's a structurally different flat
  // log, not a muscle-group-browsing type), so typeInfo/renderGroups only
  // apply to the musculação/calistenia tabs — see renderCardioTab above for
  // the cardio tab's own render path.
  const typeInfo = activeTab !== "cardio" ? workoutTypes[activeTab] : null;
  // Some workout types (e.g. Avançado's calistenia, organized by movement
  // pattern rather than by the day's scheduled muscle groups) declare a
  // fixed `alwaysGroups` list that should render on any training day,
  // instead of the day-specific `groups` list above (which only applies to
  // musculação-style, muscle-group-scheduled tabs).
  const renderGroups = activeTab !== "cardio" ? (typeInfo?.alwaysGroups ?? groups) : null;

  function renderExerciseCard(
    ex: Exercise,
    dayKey: DayKey,
    typeKey: WorkoutTypeKey,
    groupKey: string,
    portionKey?: string
  ) {
    const id = exerciseId(dayKey, typeKey, groupKey, ex.name, portionKey);
    const entry = entryFor(id);
    return (
      <div
        className={"fx-exercise-card" + (entry.checked ? " checked" : "")}
        key={id}
      >
        <div className="fx-exercise-main">
          <input
            type="checkbox"
            checked={entry.checked}
            onChange={(e) =>
              updateField(id, "checked", e.target.checked, true)
            }
          />
          <div className="fx-exercise-name">{ex.name}</div>
        </div>
        {ex.gif && <ExerciseMedia name={ex.name} frames={ex.gif} />}
        <div className="fx-exercise-details">
          <p>
            <b>Como fazer:</b> {ex.exec}
          </p>
          <p className="fx-exercise-erro">
            <b>Erro comum:</b> {ex.erro}
          </p>
        </div>
        <div className="fx-exercise-fields">
          <label>
            Séries
            <input
              type="number"
              value={entry.sets}
              onChange={(e) => updateField(id, "sets", e.target.value, false)}
              onBlur={() => persist(id, entryFor(id))}
            />
          </label>
          <label>
            Repetições
            <input
              type="number"
              value={entry.reps}
              onChange={(e) => updateField(id, "reps", e.target.value, false)}
              onBlur={() => persist(id, entryFor(id))}
            />
          </label>
          <label>
            Carga (kg)
            <input
              type="number"
              value={entry.load}
              onChange={(e) => updateField(id, "load", e.target.value, false)}
              onBlur={() => persist(id, entryFor(id))}
            />
          </label>
          {savingId === id && (
            <span className="sub" style={{ fontSize: 11 }}>
              Salvando...
            </span>
          )}
        </div>
      </div>
    );
  }

  const selectedDayInfo = selectedDay ? DAYS.find((d) => d.key === selectedDay) : null;

  return (
    <>
      <div className={sectionClass}>
        <h2>2. Sua semana</h2>
        <p className={leadClass}>{weekLead}</p>
        <div className="fx-day-strip">
        {DAYS.map((d) => {
          const dayGroups = split.week[d.key];
          const groupsLabel = dayGroups
            ? dayGroups.map((g) => muscleGroups[g]?.label ?? g).join(", ")
            : "Descanso";
          return (
            <div
              key={d.key}
              className={
                "fx-day-chip" +
                (selectedDay === d.key ? " active" : "") +
                (!dayGroups ? " rest" : "")
              }
              onClick={() => setSelectedDay(d.key)}
              role="button"
            >
              <div className="fx-day-name">{d.label.slice(0, 3)}</div>
              <div className="fx-day-groups">{groupsLabel}</div>
              <div className="fx-day-check">
                {dayHasChecked(d.key) || dayHasCardio(d.key) ? "✅" : ""}
              </div>
            </div>
          );
        })}
        </div>
      </div>

      <div className={sectionClass}>
        <h2>
          3. Treino do dia{" "}
          {selectedDayInfo && (
            <span className="day-label">— {selectedDayInfo.label}</span>
          )}
        </h2>
      {!selectedDay && (
        <div className="fx-empty-state">
          Selecione um dia da semana acima para ver os exercícios.
        </div>
      )}

      {/* Tabs — sempre visíveis quando há um dia selecionado: o cardio
          funciona também em dia de descanso, ao contrário de
          musculação/calistenia (ported from the prototype's comment
          "tabs — sempre visíveis, o cardio funciona também em dia de
          descanso", projeto_fenix_app_final.html ~line 7586). */}
      {selectedDay && (
        <div className="fx-nav-row" style={{ marginBottom: 14 }}>
          {(Object.keys(workoutTypes) as WorkoutTypeKey[]).map((typeKey) => (
            <button
              key={typeKey}
              type="button"
              className={"btn small" + (activeTab === typeKey ? "" : " secondary")}
              onClick={() => setActiveTab(typeKey)}
            >
              {workoutTypes[typeKey].label}
            </button>
          ))}
          <button
            type="button"
            className={"btn small" + (activeTab === "cardio" ? "" : " secondary")}
            onClick={() => setActiveTab("cardio")}
          >
            🏃 Cardio
          </button>
        </div>
      )}

      {selectedDay && activeTab === "cardio" && renderCardioTab(selectedDay)}

      {selectedDay && activeTab !== "cardio" && !renderGroups && (
        <div className="fx-empty-state">
          Hoje é dia de descanso nesse plano. Aproveite para recuperar — o
          descanso também faz parte do treino. Você ainda pode registrar uma
          atividade na aba Cardio, se quiser.
        </div>
      )}

      {selectedDay && activeTab !== "cardio" && renderGroups && typeInfo && (
        <>
          {renderGroups.map((groupKey) => {
            const groupDef = typeInfo.groups[groupKey];
            // Prefer the group's own label from this workout type (e.g.
            // Avançado's "calistenia" pseudo-group, labeled "Calistenia" and
            // unrelated to any `muscleGroups` entry) over the musculação
            // muscle-group label, so a tab whose groups aren't muscle-group
            // keyed never shows a misleading heading like "Quadríceps" for
            // what's actually a "Pernas" bodyweight pattern.
            const label = groupDef?.label ?? muscleGroups[groupKey]?.label ?? groupKey;
            const portions = groupDef?.portions;
            const exercises = groupDef?.exercises ?? [];
            const totalCount = portions
              ? Object.values(portions).reduce((sum, p) => sum + p.exercises.length, 0)
              : exercises.length;
            return (
              <div className="fx-group-block" key={groupKey}>
                <h4>
                  {label}{" "}
                  <span className="fx-group-count">
                    ({totalCount}{" "}
                    {totalCount === 1 ? "exercício" : "exercícios"})
                  </span>
                </h4>
                {portions ? (
                  Object.entries(portions).map(([portionKey, portion]) => (
                    <div className="fx-portion-block" key={portionKey}>
                      <div className="fx-portion-title">
                        {label} — {portion.label}
                      </div>
                      {portion.exercises.length === 0 ? (
                        <div className="fx-empty-state">
                          Ainda não há exercício cadastrado para essa porção.
                        </div>
                      ) : (
                        portion.exercises.map((ex) =>
                          renderExerciseCard(ex, selectedDay, activeTab, groupKey, portionKey)
                        )
                      )}
                    </div>
                  ))
                ) : exercises.length === 0 ? (
                  <div className="fx-empty-state">
                    Ainda não há exercício de peso corporal para esse grupo —
                    use a aba Musculação.
                  </div>
                ) : (
                  exercises.map((ex) =>
                    renderExerciseCard(ex, selectedDay, activeTab, groupKey)
                  )
                )}
              </div>
            );
          })}
        </>
      )}
      </div>
    </>
  );
}
