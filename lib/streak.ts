/**
 * Consecutive-day streak, ported from the prototype's `fxComputeStreak()`.
 * Counts backward from today; if today has no activity yet, starts counting
 * from yesterday instead (so logging weight once a day doesn't "break" the
 * streak before the day is over).
 */
export function computeStreak(activityDates: string[]): number {
  const set = new Set(activityDates);

  function dateStr(offsetDays: number): string {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    return d.toISOString().slice(0, 10);
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
