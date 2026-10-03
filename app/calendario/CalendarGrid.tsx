"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CalendarDayStatus } from "@/lib/database.types";

interface DayEntry {
  status: CalendarDayStatus | null;
  note: string | null;
}

const STATUS_OPTIONS: { key: CalendarDayStatus | ""; label: string; color: string }[] = [
  { key: "treino", label: "Treino de força", color: "var(--ember)" },
  { key: "cardio", label: "Cardio", color: "var(--good)" },
  { key: "descanso", label: "Descanso", color: "var(--rest)" },
  { key: "", label: "Sem registro", color: "var(--surface-2)" },
];

const DAY_NAMES = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function fmtShort(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function fmtLong(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Ported from the prototype's Calendário module (projeto_fenix_app_final.html,
// ~lines 12766-12930): per-day status/note grid + overview stats. Generalized
// to any start date / total days (plan-derived or the rolling-window
// fallback — see app/calendario/page.tsx), instead of the hardcoded
// 2026-07-08/84-day window. Also fixes a known prototype bug: its
// click-outside-to-close checked `e.target.id === 'overlay'` against an
// element whose real id was `ca_overlay`, so it never actually closed that
// way — here the handler checks the actual backdrop element.
export default function CalendarGrid({
  profileId,
  startDate,
  totalDays,
  todayIso,
  initialData,
}: {
  profileId: string;
  startDate: string;
  totalDays: number;
  todayIso: string;
  initialData: Record<string, DayEntry>;
}) {
  const [data, setData] = useState<Record<string, DayEntry>>(initialData);
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [draftStatus, setDraftStatus] = useState<CalendarDayStatus | "">("");
  const [draftNote, setDraftNote] = useState("");
  const [saving, setSaving] = useState(false);

  const totalWeeks = Math.ceil(totalDays / 7);
  const midpointDay = Math.round(totalDays / 2);

  function dateForDay(n: number): string {
    return addDays(startDate, n - 1);
  }

  const overview = useMemo(() => {
    let dayNum = Math.floor((new Date(todayIso + "T00:00:00Z").getTime() - new Date(startDate + "T00:00:00Z").getTime()) / 86400000) + 1;
    dayNum = Math.max(1, Math.min(dayNum, totalDays));

    let treinos = 0;
    let cardios = 0;
    let streak = 0;
    let streakBroken = false;
    for (let n = totalDays; n >= 1; n--) {
      const iso = dateForDay(n);
      const entry = data[iso];
      if (entry) {
        if (entry.status === "treino") treinos++;
        if (entry.status === "cardio") cardios++;
      }
      if (n <= dayNum && !streakBroken) {
        if (entry && (entry.status === "treino" || entry.status === "cardio")) streak++;
        else if (n < dayNum) streakBroken = true;
      }
    }
    return { dayNum, treinos, cardios, streak, pct: (dayNum / totalDays) * 100 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, startDate, totalDays, todayIso]);

  function openModal(dayNum: number) {
    const iso = dateForDay(dayNum);
    const entry = data[iso];
    setDraftStatus(entry?.status ?? "");
    setDraftNote(entry?.note ?? "");
    setOpenDay(dayNum);
  }

  async function save() {
    if (openDay == null) return;
    const iso = dateForDay(openDay);
    setSaving(true);
    const supabase = createClient();
    if (!draftStatus && !draftNote) {
      await supabase.from("calendar_days").delete().eq("profile_id", profileId).eq("day_date", iso);
      setData((prev) => {
        const next = { ...prev };
        delete next[iso];
        return next;
      });
    } else {
      await supabase.from("calendar_days").upsert({
        profile_id: profileId,
        day_date: iso,
        status: draftStatus || null,
        note: draftNote || null,
        updated_at: new Date().toISOString(),
      });
      setData((prev) => ({ ...prev, [iso]: { status: draftStatus || null, note: draftNote || null } }));
    }
    setSaving(false);
    setOpenDay(null);
  }

  const weeks = Array.from({ length: totalWeeks }, (_, w) => w);

  return (
    <>
      <div className="fx-cal-overview">
        <div className="fx-cal-ov-card">
          <span className="n">{overview.dayNum}</span>
          <br />
          <span className="l">Dia atual</span>
        </div>
        <div className="fx-cal-ov-card">
          <span className="n">{overview.treinos}</span>
          <br />
          <span className="l">Treinos feitos</span>
        </div>
        <div className="fx-cal-ov-card">
          <span className="n">{overview.cardios}</span>
          <br />
          <span className="l">Cardios feitos</span>
        </div>
        <div className="fx-cal-ov-card">
          <span className="n">{overview.streak}</span>
          <br />
          <span className="l">Sequência atual</span>
        </div>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${overview.pct.toFixed(1)}%` }} />
      </div>

      <div className="fx-cal-legend-row">
        <span>
          <span className="dot" style={{ background: "var(--ember)" }}></span>Treino de força
        </span>
        <span>
          <span className="dot" style={{ background: "var(--good)" }}></span>Cardio
        </span>
        <span>
          <span className="dot" style={{ background: "var(--rest)" }}></span>Descanso
        </span>
        <span>
          <span className="dot" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}></span>
          Sem registro
        </span>
        <span>⭐ Marco (metade / final do plano)</span>
      </div>

      {weeks.map((w) => {
        const weekStartDay = w * 7 + 1;
        const weekEndDay = Math.min(weekStartDay + 6, totalDays);
        const weekStart = dateForDay(weekStartDay);
        const weekEnd = dateForDay(weekEndDay);
        let weekCount = 0;
        for (let d = weekStartDay; d <= weekEndDay; d++) {
          if (data[dateForDay(d)]?.status) weekCount++;
        }
        const daysInWeek = weekEndDay - weekStartDay + 1;

        return (
          <div className="fx-cal-week-block" key={w}>
            <div className="fx-cal-week-head">
              <h3>Semana {w + 1}</h3>
              <span className="range">
                {fmtShort(weekStart)} – {fmtShort(weekEnd)}
              </span>
              <span className="wcount">
                {weekCount}/{daysInWeek} registrados
              </span>
            </div>
            <div className="fx-cal-days-row">
              {Array.from({ length: daysInWeek }, (_, i) => {
                const dNum = weekStartDay + i;
                const iso = dateForDay(dNum);
                const entry = data[iso];
                const isMilestone = dNum === midpointDay || dNum === totalDays;
                const isToday = iso === todayIso;
                return (
                  <div
                    key={dNum}
                    className={
                      "fx-cal-day-cell" +
                      (entry?.status ? ` ${entry.status}` : "") +
                      (isMilestone ? " milestone" : "") +
                      (isToday ? " today" : "")
                    }
                    onClick={() => openModal(dNum)}
                  >
                    <span className="dn">{DAY_NAMES[i % 7]}</span>
                    <span className="num">
                      {dNum}
                      {isMilestone ? " ⭐" : ""}
                    </span>
                    <span className="status-dot"></span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div
        className={"fx-cal-overlay" + (openDay != null ? " open" : "")}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpenDay(null);
        }}
      >
        {openDay != null && (
          <div className="fx-cal-modal">
            <h3>
              Dia {openDay} de {totalDays}
            </h3>
            <div className="day-date">{fmtLong(dateForDay(openDay))}</div>
            <div className="fx-cal-status-options">
              {STATUS_OPTIONS.map((opt) => (
                <div
                  key={opt.key || "none"}
                  className={"fx-cal-status-opt" + (draftStatus === opt.key ? " selected" : "")}
                  onClick={() => setDraftStatus(opt.key as CalendarDayStatus | "")}
                >
                  <span className="dot" style={{ background: opt.color }}></span>
                  {opt.label}
                </div>
              ))}
            </div>
            <textarea
              placeholder="Nota do dia (peso, sensações, o que treinou...)"
              value={draftNote}
              onChange={(e) => setDraftNote(e.target.value)}
            />
            <div className="fx-cal-modal-actions">
              <button className="btn ghost" onClick={() => setOpenDay(null)}>
                Cancelar
              </button>
              <button className="btn" onClick={save} disabled={saving}>
                Salvar
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
