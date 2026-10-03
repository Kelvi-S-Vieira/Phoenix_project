import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Backs the Dashboard "Conta & dados" card's "Exportar tudo (backup .json)"
// button. The prototype's version (fxExportBackup, Task 4) dumped every
// `fenix_*` localStorage key; since this port's data lives in Supabase, this
// instead gathers the signed-in user's own rows server-side and returns them
// as a downloadable JSON file. Import is intentionally NOT ported — this is
// a real database now, not localStorage, so round-tripping a backup back in
// doesn't map cleanly (see the audit notes this sprint was scoped from).
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const [
    { data: profile },
    { data: weightLogs },
    { data: measurements },
    { data: activityDays },
    { data: badgesUnlocked },
    { data: lifts },
    { data: weeklyCardio },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("weight_logs")
      .select("logged_at, weight")
      .eq("profile_id", user.id)
      .order("logged_at", { ascending: true }),
    supabase
      .from("measurements")
      .select("logged_at, values")
      .eq("profile_id", user.id)
      .order("logged_at", { ascending: true }),
    supabase.from("activity_days").select("activity_date").eq("profile_id", user.id),
    supabase.from("badges_unlocked").select("badge_key, unlocked_at").eq("profile_id", user.id),
    supabase
      .from("lifts")
      .select("name, unit, start_value, current_value, goal_value")
      .eq("profile_id", user.id),
    supabase.from("weekly_cardio").select("*").eq("profile_id", user.id).maybeSingle(),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    profile,
    weight_logs: weightLogs ?? [],
    measurements: measurements ?? [],
    activity_days: activityDays ?? [],
    badges_unlocked: badgesUnlocked ?? [],
    lifts: lifts ?? [],
    weekly_cardio: weeklyCardio ?? null,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="projeto-fenix-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json"`,
    },
  });
}
