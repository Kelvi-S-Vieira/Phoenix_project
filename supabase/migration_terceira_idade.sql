-- =============================================================================
-- Terceira Idade tier (treino-terceira-idade) — weekly session-frequency
-- goal, per-exercise checklist state, and weekly completion log.
-- Run once in the Supabase SQL Editor. Idempotent (IF NOT EXISTS / DO blocks
-- throughout). Also folded into schema.sql in place so a fresh install gets
-- this directly.
--
-- Ported from the prototype's localStorage `fenix_terceira_idade` state
-- (projeto_fenix_app_final.html, the "TERCEIRA IDADE MODULE" IIFE, lines
-- ~11636-12143) into real per-user tables/columns. The prototype has no
-- table to copy 1:1 — this shape was designed for this port:
--   - profiles.senior_freq_goal: the weekly frequency goal (2/3/4/5x),
--     kept directly on profiles like other per-user prefs (current_tier,
--     current_split, calendar_start_date, ...) rather than a one-row table.
--   - senior_session_checklist: current checked/unchecked state per
--     (profile, session_type, exercise_idx) — so progress within the
--     current completion cycle survives a reload. Mirrors the prototype's
--     `state.completions[sessionId][exerciseIndex]`.
--   - senior_session_completions: one row logged each time a session is
--     fully completed — mirrors the prototype's `weeklyLog` push
--     (`markWeeklyCompletionIfNeeded`: one log entry per week per
--     "completion cycle", i.e. it only logs again after the user has
--     unchecked and then fully re-completed the session). This is what
--     "sessões concluídas esta semana" counts against senior_freq_goal
--     (count rows with completed_at in the current Monday-Sunday week, via
--     lib/date-br.ts's weekRangeBR() — the same week boundary used
--     everywhere else in this app).
--
-- Deliberately NOT writing to activity_days here: per MIGRATION_PLAN.md,
-- this tier keeps its own weekly completion tracking and does not feed the
-- main dashboard streak (see app/treino/TreinoBoard.tsx for the pattern
-- this intentionally does NOT copy).
--
-- training_tier is a Postgres enum (see schema.sql) — "treino-terceira-idade"
-- is added to it here with IF NOT EXISTS so this is safe to re-run.
-- =============================================================================

alter type public.training_tier add value if not exists 'treino-terceira-idade';

alter table public.profiles
  add column if not exists senior_freq_goal integer not null default 3;

create table if not exists public.senior_session_checklist (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  session_type text not null check (session_type in ('mobilidade', 'equilibrio', 'fortalecimento')),
  exercise_idx integer not null,
  checked boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (profile_id, session_type, exercise_idx)
);

create table if not exists public.senior_session_completions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  session_type text not null check (session_type in ('mobilidade', 'equilibrio', 'fortalecimento')),
  completed_at date not null default current_date,
  feeling text check (feeling in ('otima', 'ok', 'dificil')),
  created_at timestamptz not null default now()
);

create index if not exists senior_session_completions_profile_id_completed_at_idx
  on public.senior_session_completions(profile_id, completed_at);

alter table public.senior_session_checklist enable row level security;
alter table public.senior_session_completions enable row level security;

-- --- senior_session_checklist -------------------------------------------
do $$ begin
  create policy "senior_session_checklist_select_own"
    on public.senior_session_checklist for select
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "senior_session_checklist_select_by_personal"
    on public.senior_session_checklist for select
    using (
      exists (
        select 1 from public.profiles p
        where p.id = senior_session_checklist.profile_id and p.linked_personal_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "senior_session_checklist_insert_own"
    on public.senior_session_checklist for insert
    with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "senior_session_checklist_update_own"
    on public.senior_session_checklist for update
    using (profile_id = auth.uid())
    with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "senior_session_checklist_delete_own"
    on public.senior_session_checklist for delete
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

-- --- senior_session_completions -------------------------------------------
do $$ begin
  create policy "senior_session_completions_select_own"
    on public.senior_session_completions for select
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "senior_session_completions_select_by_personal"
    on public.senior_session_completions for select
    using (
      exists (
        select 1 from public.profiles p
        where p.id = senior_session_completions.profile_id and p.linked_personal_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "senior_session_completions_insert_own"
    on public.senior_session_completions for insert
    with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "senior_session_completions_delete_own"
    on public.senior_session_completions for delete
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

-- =============================================================================
-- End of migration.
-- =============================================================================
