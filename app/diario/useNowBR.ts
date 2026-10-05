"use client";

import { useSyncExternalStore } from "react";

const TZ = "America/Sao_Paulo";
const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function minutesOfDayBR(): number {
  const parts = fmt.formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h * 60 + m;
}

function subscribe(cb: () => void) {
  const id = setInterval(cb, 30_000);
  return () => clearInterval(id);
}

/** Minutos desde 00:00 em America/Sao_Paulo (null no servidor/hidratação). */
export function useMinutesBR(): number | null {
  return useSyncExternalStore(subscribe, minutesOfDayBR, () => null);
}
