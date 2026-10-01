"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { todayBR } from "@/lib/date-br";
import ExerciseMedia from "@/components/ExerciseMedia";
import {
  DAYS,
  exerciseId,
  type DayKey,
  type Split,
  type WorkoutType,
  type WorkoutTypeKey,
  type MuscleGroup,
  type Exercise,
} from "@/lib/treino-shared-types";

interface LogEntry {
  checked: boolean;
  sets: string;
  reps: string;
  load: string;
}

const EMPTY_ENTRY: LogEntry = { checked: false, sets: "", reps: "", load: "" };

export default function TreinoBoard({
  profileId,
  split,
  workoutTypes,
  muscleGroups,
  initialLog,
  defaultDay,
}: {
  profileId: string;
  split: Split;
  workoutTypes: Record<WorkoutTypeKey, WorkoutType>;
  muscleGroups: Record<string, MuscleGroup>;
  initialLog: Record<string, LogEntry>;
  defaultDay: DayKey | null;
}) {
  const [selectedDay, setSelectedDay] = useState<DayKey | null>(defaultDay);
  const [activeTab, setActiveTab] = useState<WorkoutTypeKey>("musculacao");
  const [log, setLog] = useState<Record<string, LogEntry>>(initialLog);
  const [savingId, setSavingId] = useState<string | null>(null);

  function entryFor(id: string): LogEntry {
    return log[id] ?? EMPTY_ENTRY;
  }

  function dayHasChecked(dayKey: DayKey) {
    const prefix = dayKey + "::";
    return Object.entries(log).some(
      ([id, entry]) => id.startsWith(prefix) && entry.checked
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
  const typeInfo = workoutTypes[activeTab];
  // Some workout types (e.g. Avançado's calistenia, organized by movement
  // pattern rather than by the day's scheduled muscle groups) declare a
  // fixed `alwaysGroups` list that should render on any training day,
  // instead of the day-specific `groups` list above (which only applies to
  // musculação-style, muscle-group-scheduled tabs).
  const renderGroups = typeInfo.alwaysGroups ?? groups;

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

  return (
    <>
      <div className="card">
        <h2>2. Sua semana</h2>
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
              <div className="fx-day-check">{dayHasChecked(d.key) ? "✅" : ""}</div>
            </div>
          );
        })}
        </div>
      </div>

      <div className="card">
        <h2>3. Treino do dia</h2>
      {!selectedDay && (
        <div className="fx-empty-state">
          Selecione um dia da semana acima para ver os exercícios.
        </div>
      )}

      {selectedDay && !renderGroups && (
        <div className="fx-empty-state">
          Hoje é dia de descanso nesse plano. Aproveite para recuperar — o
          descanso também faz parte do treino.
        </div>
      )}

      {selectedDay && renderGroups && (
        <>
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
          </div>

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
