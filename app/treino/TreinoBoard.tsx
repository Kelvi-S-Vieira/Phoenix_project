"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ExerciseMedia from "@/components/ExerciseMedia";
import {
  DAYS,
  WORKOUT_TYPES,
  MUSCLE_GROUPS,
  exerciseId,
  type DayKey,
  type Split,
  type WorkoutTypeKey,
  type MuscleGroupKey,
} from "@/lib/treino-basico-data";

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
  initialLog,
  defaultDay,
}: {
  profileId: string;
  split: Split;
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
    const today = new Date().toISOString().slice(0, 10);
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
  const typeInfo = WORKOUT_TYPES[activeTab];

  return (
    <div>
      <div className="fx-day-strip">
        {DAYS.map((d) => {
          const dayGroups = split.week[d.key];
          const groupsLabel = dayGroups
            ? dayGroups.map((g) => MUSCLE_GROUPS[g]?.label ?? g).join(", ")
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

      {!selectedDay && (
        <div className="fx-empty-state">
          Selecione um dia da semana acima para ver os exercícios.
        </div>
      )}

      {selectedDay && !groups && (
        <div className="fx-empty-state">
          Hoje é dia de descanso nesse plano. Aproveite para recuperar — o
          descanso também faz parte do treino.
        </div>
      )}

      {selectedDay && groups && (
        <>
          <div className="fx-nav-row" style={{ marginBottom: 14 }}>
            {(Object.keys(WORKOUT_TYPES) as WorkoutTypeKey[]).map((typeKey) => (
              <button
                key={typeKey}
                type="button"
                className={"btn small" + (activeTab === typeKey ? "" : " secondary")}
                onClick={() => setActiveTab(typeKey)}
              >
                {WORKOUT_TYPES[typeKey].label}
              </button>
            ))}
          </div>

          {groups.map((groupKey) => {
            const groupDef = typeInfo.groups[groupKey as MuscleGroupKey];
            const label = MUSCLE_GROUPS[groupKey as MuscleGroupKey]?.label ?? groupKey;
            const exercises = groupDef?.exercises ?? [];
            return (
              <div className="fx-group-block" key={groupKey}>
                <h4>
                  {label}{" "}
                  <span className="fx-group-count">
                    ({exercises.length}{" "}
                    {exercises.length === 1 ? "exercício" : "exercícios"})
                  </span>
                </h4>
                {exercises.length === 0 ? (
                  <div className="fx-empty-state">
                    Ainda não há exercício de peso corporal para esse grupo —
                    use a aba Musculação.
                  </div>
                ) : (
                  exercises.map((ex) => {
                    const id = exerciseId(
                      selectedDay,
                      activeTab,
                      groupKey as MuscleGroupKey,
                      ex.name
                    );
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
                  })
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
