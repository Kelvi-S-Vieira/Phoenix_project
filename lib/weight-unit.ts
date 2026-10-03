/**
 * kg/lb display-preference utilities, ported from the prototype's
 * `fxWeightUnitLabel` / `fxToDisplayWeight` / `fxFromDisplayWeight` /
 * `fxFormatWeight` IIFE (projeto_fenix_app_final.html, ~line 5460).
 *
 * The STORED weight is always kg, everywhere (Supabase columns, the forms
 * that write to them) — this module only converts what's shown to, or typed
 * by, the user. Never import this to change what gets persisted.
 *
 * The preference itself is kept in two places on purpose:
 *  - localStorage, under the SAME key the prototype used (`fenix_unit_pref`),
 *    so a client-side read/write matches the original app's behavior.
 *  - a cookie of the same name, so Server Components (Dashboard, the
 *    personal's aluno-detail page, etc.) can read the preference during SSR
 *    via `getServerWeightUnit()` (lib/weight-unit-server.ts) instead of
 *    rendering kg and flashing to lb after hydration. `setWeightUnit` keeps
 *    both in sync; call `router.refresh()` after it so Server Components
 *    re-render with the new cookie value immediately.
 *
 * This file has no `next/headers` import so it's safe to use from both
 * Client and Server Components.
 */

export type WeightUnit = "kg" | "lb";

export const WEIGHT_UNIT_STORAGE_KEY = "fenix_unit_pref";
export const WEIGHT_UNIT_COOKIE = WEIGHT_UNIT_STORAGE_KEY;

const KG_TO_LB = 2.20462;

export function isWeightUnit(value: unknown): value is WeightUnit {
  return value === "kg" || value === "lb";
}

/** Client-side read of the saved preference (defaults to "kg"; safe to call on the server too — always returns "kg" there). */
export function getWeightUnit(): WeightUnit {
  if (typeof window === "undefined") return "kg";
  try {
    const v = window.localStorage.getItem(WEIGHT_UNIT_STORAGE_KEY);
    return isWeightUnit(v) ? v : "kg";
  } catch {
    return "kg";
  }
}

/** Persists the preference to both localStorage and a cookie (1 year). Client-side only. */
export function setWeightUnit(unit: WeightUnit): void {
  try {
    window.localStorage.setItem(WEIGHT_UNIT_STORAGE_KEY, unit);
  } catch {
    // best-effort only
  }
  try {
    document.cookie = `${WEIGHT_UNIT_COOKIE}=${unit}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    // best-effort only
  }
}

/** kg -> the given/current display unit, rounded to 1 decimal. */
export function toDisplayWeight(
  kg: number | null | undefined,
  unit: WeightUnit = getWeightUnit()
): number | null {
  if (kg == null || Number.isNaN(kg)) return null;
  const v = unit === "lb" ? kg * KG_TO_LB : kg;
  return Math.round(v * 10) / 10;
}

/** A value typed by the user in the given/current display unit -> kg, for saving. */
export function fromDisplayWeight(
  displayValue: number | string,
  unit: WeightUnit = getWeightUnit()
): number {
  const v = typeof displayValue === "string" ? parseFloat(displayValue.replace(",", ".")) : displayValue;
  if (Number.isNaN(v)) return v;
  return unit === "lb" ? v / KG_TO_LB : v;
}

/**
 * Formats a kg value as display text with the unit suffix, matching the
 * prototype's `fxFormatWeight`: comma decimal for kg (pt-BR), dot for lb.
 */
export function formatWeight(
  kg: number | null | undefined,
  unit: WeightUnit = getWeightUnit()
): string {
  const v = toDisplayWeight(kg, unit);
  if (v == null) return "—";
  if (unit === "lb") return `${v.toFixed(1)} lb`;
  return `${v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg`;
}

/** Bare display number (no unit suffix), 1 decimal — for inline "82 kg" style compositions. */
export function toDisplayWeightNumber(
  kg: number | null | undefined,
  unit: WeightUnit = getWeightUnit()
): number | null {
  return toDisplayWeight(kg, unit);
}
