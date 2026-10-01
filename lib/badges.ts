/**
 * Server-side badge unlock logic, ported from `window.fxCheckBadges()` in the
 * prototype (projeto_fenix_app_final.html, ~line 5151-5279). The prototype
 * evaluated these conditions against localStorage; here they're evaluated
 * against real Supabase data and persisted in `badges_unlocked`, so a client
 * can never fake an unlock.
 *
 * Idempotent: a badge already present in `badges_unlocked` for this profile
 * is never re-inserted or re-evaluated as "newly unlocked".
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { computeStreak } from "@/lib/streak";
import { BADGES } from "@/lib/fenix-domain";

/**
 * Checks all badge conditions for `profileId` against current data and
 * inserts any newly-earned ones into `badges_unlocked`.
 *
 * Returns the badge keys unlocked *by this call* (empty array if none).
 */
export async function checkAndUnlockBadges(
  supabase: SupabaseClient<Database>,
  profileId: string
): Promise<string[]> {
  const [
    { data: alreadyUnlocked },
    { data: activityDays },
    { data: photos },
    { data: measurements },
    { data: profile },
    { data: weightLogs },
  ] = await Promise.all([
    supabase.from("badges_unlocked").select("badge_key").eq("profile_id", profileId),
    supabase.from("activity_days").select("activity_date").eq("profile_id", profileId),
    supabase.from("progress_photos").select("id").eq("profile_id", profileId).limit(1),
    supabase.from("measurements").select("id").eq("profile_id", profileId).limit(1),
    supabase.from("profiles").select("target_weight, current_weight").eq("id", profileId).single(),
    supabase
      .from("weight_logs")
      .select("weight, logged_at")
      .eq("profile_id", profileId)
      .order("logged_at", { ascending: true }),
  ]);

  const unlockedKeys = new Set((alreadyUnlocked ?? []).map((b) => b.badge_key));
  const has = (key: string) => unlockedKeys.has(key);

  const toUnlock: string[] = [];
  function maybeUnlock(key: string, condition: boolean) {
    if (!has(key) && condition && BADGES[key]) {
      toUnlock.push(key);
    }
  }

  const dates = (activityDays ?? []).map((d) => d.activity_date);
  const totalDays = dates.length;
  const streak = computeStreak(dates);

  maybeUnlock("primeiro_treino", totalDays >= 1);
  maybeUnlock("primeira_semana", totalDays >= 7 || streak >= 7);
  maybeUnlock("streak_30", streak >= 30);
  maybeUnlock("primeira_foto", (photos ?? []).length >= 1);
  maybeUnlock("primeira_medida", (measurements ?? []).length >= 1);

  const target = profile?.target_weight ?? null;
  const logs = weightLogs ?? [];
  if (target != null && logs.length > 0) {
    const start = logs[0].weight;
    const current = logs[logs.length - 1].weight ?? profile?.current_weight ?? start;
    const reached =
      start > target ? current <= target : start < target ? current >= target : false;
    maybeUnlock("meta_batida", reached);
  }

  if (toUnlock.length === 0) return [];

  const { error } = await supabase.from("badges_unlocked").insert(
    toUnlock.map((badge_key) => ({ profile_id: profileId, badge_key }))
  );
  // If the insert failed (e.g. a race with another concurrent check already
  // having inserted one of these keys, tripping the unique constraint),
  // don't report badges that may not actually be persisted.
  if (error) return [];

  return toUnlock;
}
