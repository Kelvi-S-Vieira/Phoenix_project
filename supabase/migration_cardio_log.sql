-- =============================================================================
-- cardio_log_entries — simple cardio log (corrida/bike/elíptico/natação,
-- duração + intensidade) backing the "🏃 Cardio" tab now shared by Básico
-- and Intermediário (app/treino/TreinoBoard.tsx). Run once in the Supabase
-- SQL Editor. Idempotent (IF NOT EXISTS / DO blocks throughout). Also
-- folded into schema.sql in place so a fresh install gets this table
-- directly.
--
-- Ported from the prototype's shared treino-basico/treino-intermediario
-- module's localStorage `state.cardio[dayKey]` (an array of
-- {id, activity, duration, intensity} per day, see
-- projeto_fenix_app_final.html lines 7733-7833) into a real per-user table.
-- Deliberately NOT Avançado's `avancado_plans.week` jsonb (this tier has no
-- such per-profile plan document) and NOT `workout_log_entries` (that table
-- is keyed by a fixed per-exercise `exercise_id`, not a free-form log of
-- however many cardio entries a day may have). Tier-agnostic by design — no
-- tier column, since a profile is only ever on one tier at a time and old
-- rows left behind after a tier switch are harmless, same spirit as the
-- rest of this app's tables.
-- =============================================================================

create table if not exists public.cardio_log_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  day_key text not null check (day_key in ('seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom')),
  activity_key text not null,
  duration integer,
  intensity text not null check (intensity in ('leve', 'moderado', 'intenso')),
  created_at timestamptz not null default now()
);

create index if not exists cardio_log_entries_profile_id_day_key_idx
  on public.cardio_log_entries(profile_id, day_key);

alter table public.cardio_log_entries enable row level security;

do $$ begin
  create policy "cardio_log_entries_select_own"
    on public.cardio_log_entries for select
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "cardio_log_entries_select_by_personal"
    on public.cardio_log_entries for select
    using (
      exists (
        select 1 from public.profiles p
        where p.id = cardio_log_entries.profile_id and p.linked_personal_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "cardio_log_entries_insert_own"
    on public.cardio_log_entries for insert
    with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "cardio_log_entries_update_own"
    on public.cardio_log_entries for update
    using (profile_id = auth.uid())
    with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "cardio_log_entries_delete_own"
    on public.cardio_log_entries for delete
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

-- =============================================================================
-- End of migration.
-- =============================================================================
