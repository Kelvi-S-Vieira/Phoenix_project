"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { todayBR } from "@/lib/date-br";
import ExerciseMedia from "@/components/ExerciseMedia";
import {
  SESSION_TYPES,
  FEELINGS,
  getSeniorSessionById,
  type SeniorSessionTypeId,
  type SeniorFeelingId,
} from "@/lib/terceira-idade-data";

const FREQ_OPTIONS = [2, 3, 4, 5];

/**
 * Terceira Idade tier board — session tabs, per-exercise checklist, weekly
 * frequency goal + summary, and the per-session "feeling" tag. Ported from
 * the prototype's TERCEIRA IDADE MODULE IIFE (renderTabs/renderFrequency/
 * renderSummary/renderSessionContent/renderFeelingButtons/toggleExercise/
 * markWeeklyCompletionIfNeeded — projeto_fenix_app_final.html, lines
 * ~11636-12143). Deliberately warm/unhurried/non-competitive in tone — no
 * "recorde"/PR language anywhere, unlike Avançado.
 *
 * One documented simplification vs. the prototype: the prototype's
 * `feelingBySession` (the last feeling picked per session, shown even
 * before the session is complete) lived in the same localStorage blob as
 * everything else, so it survived reloads. Here it's kept as plain client
 * state instead of its own DB column/table — it's a private, non-evaluative
 * UI nicety ("registrado só para você"), not something any feature reads
 * back, so persisting it server-side would add a table for no behavioral
 * gain. It still gets written onto the logged `senior_session_completions`
 * row when a session is completed, so the choice the user made while
 * finishing a session IS preserved in the data that actually matters.
 */

type ChecklistState = Record<SeniorSessionTypeId, Record<number, boolean>>;

function isFullyDone(sessionId: SeniorSessionTypeId, checklist: ChecklistState): boolean {
  const session = getSeniorSessionById(sessionId);
  const done = checklist[sessionId] ?? {};
  return session.exercises.every((_, idx) => !!done[idx]);
}

function encouragementMessage(count: number, goal: number): string {
  if (count === 0) {
    return "Quando estiver pronto(a), comece pela sessão que fizer mais sentido para você hoje.";
  }
  if (count < goal) {
    return `Você já fez ${count} sessão${count === 1 ? "" : "ões"} essa semana — continue no seu ritmo.`;
  }
  return "Você alcançou sua meta desta semana — muito bem, continue se movendo com carinho por si mesmo(a).";
}

export default function TerceiraIdadeBoard({
  profileId,
  initialFreqGoal,
  initialChecklist,
  initialWeekCompletedCount,
}: {
  profileId: string;
  initialFreqGoal: number;
  initialChecklist: ChecklistState;
  initialWeekCompletedCount: number;
}) {
  const [freqGoal, setFreqGoal] = useState(initialFreqGoal);
  const [activeSession, setActiveSession] = useState<SeniorSessionTypeId>(SESSION_TYPES[0].id);
  const [checklist, setChecklist] = useState<ChecklistState>(initialChecklist);
  const [weekCount, setWeekCount] = useState(initialWeekCompletedCount);
  // Mirrors the prototype's `state._openLog[sessionId]`: true once this
  // completion cycle has already been logged, so re-rendering (or just
  // reloading the page) while the session stays fully checked never logs a
  // second completion. Initialized from whatever arrived from the server —
  // a session that's already fully checked on first load is treated as
  // already logged (it can only have gotten that way through a previous
  // toggle, which would have logged it then).
  const [openLog, setOpenLog] = useState<Record<SeniorSessionTypeId, boolean>>(() => {
    const init = {} as Record<SeniorSessionTypeId, boolean>;
    for (const s of SESSION_TYPES) init[s.id] = isFullyDone(s.id, initialChecklist);
    return init;
  });
  const [feelingBySession, setFeelingBySession] = useState<Record<SeniorSessionTypeId, SeniorFeelingId | null>>({
    mobilidade: null,
    equilibrio: null,
    fortalecimento: null,
  });

  const session = getSeniorSessionById(activeSession);
  const sessionChecks = checklist[activeSession] ?? {};

  async function changeFreqGoal(n: number) {
    setFreqGoal(n);
    const supabase = createClient();
    await supabase.from("profiles").update({ senior_freq_goal: n }).eq("id", profileId);
  }

  function persistChecklistRow(sessionId: SeniorSessionTypeId, idx: number, checked: boolean) {
    const supabase = createClient();
    if (checked) {
      supabase
        .from("senior_session_checklist")
        .upsert(
          { profile_id: profileId, session_type: sessionId, exercise_idx: idx, checked: true },
          { onConflict: "profile_id,session_type,exercise_idx" }
        )
        .then(() => {});
    } else {
      supabase
        .from("senior_session_checklist")
        .delete()
        .eq("profile_id", profileId)
        .eq("session_type", sessionId)
        .eq("exercise_idx", idx)
        .then(() => {});
    }
  }

  function logCompletion(sessionId: SeniorSessionTypeId) {
    const supabase = createClient();
    const feeling = feelingBySession[sessionId];
    supabase
      .from("senior_session_completions")
      .insert({
        profile_id: profileId,
        session_type: sessionId,
        completed_at: todayBR(),
        feeling: feeling ?? null,
      })
      .then(() => {});
    setWeekCount((c) => c + 1);
  }

  function toggleExercise(sessionId: SeniorSessionTypeId, idx: number) {
    setChecklist((prev) => {
      const sessionState = prev[sessionId] ?? {};
      const willBeChecked = !sessionState[idx];
      const nextSessionState = { ...sessionState, [idx]: willBeChecked };
      if (!willBeChecked) delete nextSessionState[idx];
      const next = { ...prev, [sessionId]: nextSessionState };

      persistChecklistRow(sessionId, idx, willBeChecked);

      const fullyDone = isFullyDone(sessionId, next);
      if (fullyDone && !openLog[sessionId]) {
        logCompletion(sessionId);
        setOpenLog((o) => ({ ...o, [sessionId]: true }));
      } else if (!fullyDone && openLog[sessionId]) {
        setOpenLog((o) => ({ ...o, [sessionId]: false }));
      }

      return next;
    });
  }

  function pickFeeling(sessionId: SeniorSessionTypeId, feeling: SeniorFeelingId) {
    setFeelingBySession((prev) => ({ ...prev, [sessionId]: feeling }));
  }

  const currentFeeling = feelingBySession[activeSession];

  return (
    <>
      <div className="card">
        <h2>1. Sua meta semanal</h2>
        <p className="sub" style={{ marginBottom: 12 }}>
          Quantas sessões por semana fazem sentido para você agora? Você pode trocar quando quiser.
        </p>
        <div className="tv-tab-bar">
          {FREQ_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              className={"tv-tab-btn" + (freqGoal === n ? " active" : "")}
              onClick={() => changeFreqGoal(n)}
            >
              {n}x
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>2. Resumo da semana</h2>
        <div className="stats-row">
          <div className="stat">
            <span className="n">{weekCount}</span>
            <span className="l">
              sessão{weekCount === 1 ? "" : "ões"} concluída{weekCount === 1 ? "" : "s"} esta semana (meta: {freqGoal}x)
            </span>
          </div>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(100, Math.round((weekCount / freqGoal) * 100))}%` }}
          />
        </div>
        <p className="sub" style={{ marginTop: 10 }}>{encouragementMessage(weekCount, freqGoal)}</p>
      </div>

      <div className="card">
        <h2>3. Sessão de hoje</h2>
        <div className="tv-tab-bar">
          {SESSION_TYPES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={"tv-tab-btn" + (activeSession === s.id ? " active" : "")}
              onClick={() => setActiveSession(s.id)}
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </div>
        <p className="sub" style={{ marginBottom: 16 }}>{session.desc}</p>

        <div className="tid-exercise-list">
          {session.exercises.map((ex, idx) => {
            const done = !!sessionChecks[idx];
            return (
              <div key={idx} className={"tid-exercise" + (done ? " done" : "")}>
                <button
                  type="button"
                  className={"tid-check" + (done ? " checked" : "")}
                  aria-label="Marcar exercício concluído"
                  onClick={() => toggleExercise(activeSession, idx)}
                >
                  {done ? "✓" : ""}
                </button>
                <div className="tid-exercise-body">
                  <div className="tid-exercise-top">
                    <span className="tid-exercise-name">{ex.name}</span>
                    <span className="tid-exercise-dur">{ex.duracaoOuReps}</span>
                  </div>
                  {ex.gif && <ExerciseMedia name={ex.name} frames={ex.gif} />}
                  <div className="tid-exercise-exec">{ex.exec}</div>
                  <div className="tid-exercise-cuidado">
                    <b>Atenção:</b> {ex.cuidado}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="tid-feeling">
          <div className="sub" style={{ marginBottom: 8 }}>Como foi esta sessão para você?</div>
          <div className="tv-tab-bar">
            {FEELINGS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={"tv-pill" + (currentFeeling === f.id ? " active" : "")}
                onClick={() => pickFeeling(activeSession, f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          {currentFeeling && (
            <p className="sub" style={{ marginTop: 8 }}>
              Registrado só para você — não é usado para nenhum tipo de avaliação ou comparação.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
