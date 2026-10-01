-- Run this once in the Supabase SQL Editor to add the `workout_log_entries`
-- table backing the new /treino (Básico tier) page. Safe to run even if you
-- already ran the full schema.sql after this table was added there (uses
-- IF NOT EXISTS throughout).

create table if not exists public.workout_log_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  logged_at date not null default current_date,
  exercise_id text not null, -- e.g. "seg::musculacao::peito::Supino reto na máquina"
  checked boolean not null default false,
  sets numeric(5,1),
  reps numeric(5,1),
  load numeric(6,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, logged_at, exercise_id)
);

create index if not exists workout_log_entries_profile_id_logged_at_idx
  on public.workout_log_entries(profile_id, logged_at);

alter table public.workout_log_entries enable row level security;

do $$ begin
  create policy "workout_log_entries_select_own"
    on public.workout_log_entries for select
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "workout_log_entries_insert_own"
    on public.workout_log_entries for insert
    with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "workout_log_entries_update_own"
    on public.workout_log_entries for update
    using (profile_id = auth.uid())
    with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "workout_log_entries_select_by_personal"
    on public.workout_log_entries for select
    using (
      exists (
        select 1 from public.profiles p
        where p.id = workout_log_entries.profile_id and p.linked_personal_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;
