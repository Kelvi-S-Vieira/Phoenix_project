"use client";

import Link from "next/link";
import { DEFAULT_FASTING_WINDOW, getDiet } from "@/lib/diet-types";
import { useMinutesBR } from "./useNowBR";

function parseWindow(w: string): { start: number; end: number } | null {
  const m = /^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/.exec(w.trim());
  if (!m) return null;
  return { start: Number(m[1]) * 60 + Number(m[2]), end: Number(m[3]) * 60 + Number(m[4]) };
}

export default function DietChip({
  dietType,
  fastingWindow,
}: {
  dietType: string | null;
  fastingWindow: string | null;
}) {
  const minutes = useMinutesBR();
  const diet = getDiet(dietType);
  const win = parseWindow(fastingWindow || DEFAULT_FASTING_WINDOW) ?? parseWindow(DEFAULT_FASTING_WINDOW)!;
  const label = (fastingWindow && parseWindow(fastingWindow) ? fastingWindow : DEFAULT_FASTING_WINDOW).replace("-", " – ");

  let inside: boolean | null = null;
  if (minutes != null) {
    inside =
      win.start <= win.end
        ? minutes >= win.start && minutes < win.end
        : minutes >= win.start || minutes < win.end;
  }

  return (
    <div className="fx-dday-dietwrap">
      <Link href="/dieta" className="fx-dday-dietchip">
        <span>
          Dieta: <b>{diet ? `${diet.emoji} ${diet.label}` : "não definida"}</b>
        </span>
        <span className="fx-dday-muted">trocar ›</span>
      </Link>
      {diet?.key === "jejum" && (
        <div className={`fx-dday-fast${inside === true ? " in" : inside === false ? " out" : ""}`}>
          ⏱️ Janela de alimentação: <b>{label}</b>
          {inside === true && " · você está dentro da janela"}
          {inside === false && " · fora da janela (água, café e chá sem açúcar)"}
        </div>
      )}
    </div>
  );
}
