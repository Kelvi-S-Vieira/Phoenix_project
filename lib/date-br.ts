/**
 * Date helpers that compute "today" (and the current week / weekday) in
 * America/Sao_Paulo time, instead of whatever time zone the server or
 * browser happens to be running in.
 *
 * Most hosting runs servers in UTC, and Brazil currently observes no DST
 * (BRT is a fixed UTC-3), so the gap is simple but real: from 21:00 UTC to
 * 23:59 UTC, it's already a new calendar day in São Paulo (00:00-02:59
 * BRT). A plain `new Date().toISOString().slice(0, 10)` (or `.getDay()`)
 * evaluated on a UTC server reports the PREVIOUS day during that window —
 * wrong "today" for logging, streaks, badges and week-range math. These
 * helpers always resolve the date/weekday as seen in America/Sao_Paulo,
 * via `Intl.DateTimeFormat`, so they give the right answer regardless of
 * the runtime's own time zone.
 */

const TZ = "America/Sao_Paulo";

// en-CA formats as YYYY-MM-DD directly — no manual string building.
const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  weekday: "short",
});

const WEEKDAY_TO_JS_DAY: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/** YYYY-MM-DD for `date` (default: now) as seen in America/Sao_Paulo. */
export function dateStrBR(date: Date = new Date()): string {
  return dateFormatter.format(date);
}

/** Today's date (YYYY-MM-DD) in America/Sao_Paulo. */
export function todayBR(): string {
  return dateStrBR();
}

/**
 * `Date#getDay()`-equivalent (0 = domingo ... 6 = sábado), evaluated in
 * America/Sao_Paulo rather than the runtime's own time zone.
 */
export function weekdayIndexBR(date: Date = new Date()): number {
  return WEEKDAY_TO_JS_DAY[weekdayFormatter.format(date)];
}

/**
 * YYYY-MM-DD `offsetDays` away from `date` (default: now), both resolved in
 * BRT terms. Used e.g. to walk backward day-by-day for streak counting.
 * Anchors to the BRT calendar date first (so callers never drift a day near
 * midnight), then steps by whole days using UTC-based `Date` arithmetic —
 * safe because BRT has no DST to cross.
 */
export function dateStrOffsetBR(offsetDays: number, date: Date = new Date()): string {
  const [y, m, d] = dateStrBR(date).split("-").map(Number);
  const anchor = new Date(Date.UTC(y, m - 1, d));
  anchor.setUTCDate(anchor.getUTCDate() + offsetDays);
  return anchor.toISOString().slice(0, 10);
}

/**
 * Monday-Sunday range (as YYYY-MM-DD strings) for the BRT week containing
 * `date` (default: now).
 */
export function weekRangeBR(date: Date = new Date()): { weekStart: string; weekEnd: string } {
  const jsDay = weekdayIndexBR(date); // 0 = domingo ... 6 = sábado
  const diffToMonday = (jsDay + 6) % 7; // segunda -> 0, domingo -> 6
  const [y, m, d] = dateStrBR(date).split("-").map(Number);
  const todayAnchor = new Date(Date.UTC(y, m - 1, d));
  const monday = new Date(todayAnchor);
  monday.setUTCDate(todayAnchor.getUTCDate() - diffToMonday);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return {
    weekStart: monday.toISOString().slice(0, 10),
    weekEnd: sunday.toISOString().slice(0, 10),
  };
}
