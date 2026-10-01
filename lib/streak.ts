import { dateStrOffsetBR } from "@/lib/date-br";

/**
 * Consecutive-day streak, ported from the prototype's `fxComputeStreak()`.
 * Counts backward from today; if today has no activity yet, starts counting
 * from yesterday instead (so logging weight once a day doesn't "break" the
 * streak before the day is over).
 *
 * "Today" (and every offset day) is resolved in America/Sao_Paulo, not the
 * server's own time zone — see lib/date-br.ts.
 */
export function computeStreak(activityDates: string[]): number {
  const set = new Set(activityDates);

  function dateStr(offsetDays: number): string {
    return dateStrOffsetBR(-offsetDays);
  }

  const startOffset = set.has(dateStr(0)) ? 0 : 1;
  let streak = 0;
  let i = startOffset;
  while (set.has(dateStr(i))) {
    streak++;
    i++;
  }
  return streak;
}
