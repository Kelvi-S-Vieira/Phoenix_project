-- Run this once in the Supabase SQL Editor to fix existing duplicate
-- weight_logs rows (one row per day is now enforced) before/after deploying
-- the QuickAddWeight upsert fix.

-- 1. Keep only the most recent row per (profile_id, logged_at), delete the rest.
delete from public.weight_logs a
using public.weight_logs b
where a.profile_id = b.profile_id
  and a.logged_at = b.logged_at
  and a.created_at < b.created_at;

-- 2. Add the uniqueness constraint (safe to re-run; no-op if it already exists).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'weight_logs_profile_id_logged_at_key'
  ) then
    alter table public.weight_logs
      add constraint weight_logs_profile_id_logged_at_key unique (profile_id, logged_at);
  end if;
end $$;
