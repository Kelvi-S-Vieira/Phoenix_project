-- =============================================================================
-- exercise_set_logs — training-log history backing the Avançado tier's
-- Musculação 1RM/PR/progression-suggestion/deload/swap feature
-- (app/treino/avancado/AvancadoBuilder.tsx, lib/treino-progression.ts).
-- Run once in the Supabase SQL Editor. Idempotent (IF NOT EXISTS / DO
-- blocks throughout). Also folded into schema.sql in place so a fresh
-- install gets this table directly.
--
-- Ported from the prototype's localStorage `state.log[exerciseId]` (an
-- array of {date, weight, reps, rpe, pain} per exercise, see
-- projeto_fenix_app_final.html lines 8977-9009) into a real per-user table —
-- one row per logged set, many dated rows per `exercise_key`. Deliberately
-- NOT `workout_log_entries` (profile_id, logged_at, exercise_id) unique per
-- day — that table backs the daily "feito hoje" checklist and is keyed by
-- the day-PREFIXED `exerciseId()` (see its header comment and the one on
-- `exerciseKey()` in lib/treino-shared-types.ts), so it can never
-- accumulate a time series for "this exercise, any weekday". `exercise_key`
-- here is the day-INDEPENDENT `exerciseKey()` instead, so a set logged on
-- any day it's trained lands in the same history.
-- =============================================================================

create table if not exists public.exercise_set_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  exercise_key text not null,
  logged_at date not null default current_date,
  weight numeric not null,
  reps integer not null,
  rpe numeric,
  pain boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists exercise_set_logs_profile_id_exercise_key_idx
  on public.exercise_set_logs(profile_id, exercise_key);

alter table public.exercise_set_logs enable row level security;

do $$ begin
  create policy "exercise_set_logs_select_own"
    on public.exercise_set_logs for select
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "exercise_set_logs_select_by_personal"
    on public.exercise_set_logs for select
    using (
      exists (
        select 1 from public.profiles p
        where p.id = exercise_set_logs.profile_id and p.linked_personal_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "exercise_set_logs_insert_own"
    on public.exercise_set_logs for insert
    with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "exercise_set_logs_update_own"
    on public.exercise_set_logs for update
    using (profile_id = auth.uid())
    with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "exercise_set_logs_delete_own"
    on public.exercise_set_logs for delete
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

-- =============================================================================
-- End of migration.
-- =============================================================================
