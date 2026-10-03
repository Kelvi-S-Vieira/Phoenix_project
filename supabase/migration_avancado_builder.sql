-- =============================================================================
-- Avançado tier's full custom training builder — adds `avancado_plans`.
-- Safe to run against an existing project (IF NOT EXISTS / idempotent policy
-- creation throughout). Also folded into schema.sql in place so a fresh
-- install gets it directly.
--
-- One row per profile, holding:
--   - body_weight/body_age/body_height/body_sex: section "0. Seus dados",
--     used for the MET-based calorie estimates.
--   - week (jsonb): the ENTIRE editable plan (see lib/treino-avancado-
--     builder.ts's `AvancadoPlan` type) — day -> {groups, selections,
--     strengthDurationMin, calistenia, warmupExercises/Minutes/Intensity,
--     cardio, sports, generic HIIT/Tabata/HYROX/CrossFit entries}, plus the
--     equipment/training-level filters and the last-used split template
--     key. This is inherently a flexible, user-customized structure (a day
--     can carry any mix of muscle groups/modalities, entry lists grow and
--     shrink freely) — a normalized relational schema would need half a
--     dozen tables for what's really one coherent "my plan" document, so a
--     single jsonb blob (kept under the existing column name `week` per the
--     original spec) is the right fit here, same reasoning as
--     custom_plans/workout_templates elsewhere in this schema.
--
-- Deliberately NOT a new table: the daily "feito hoje" checkbox for
-- musculação/calistenia/aquecimento exercises reuses the EXISTING
-- `workout_log_entries` table, keyed by the day-independent
-- `exerciseKey()` (see treino-shared-types.ts) instead of Básico/
-- Intermediário's day-prefixed `exerciseId()` — no schema change needed,
-- `workout_log_entries` already keys on free-form `exercise_id` text. This
-- keeps PLAN (`avancado_plans.week`) and LOG (`workout_log_entries`,
-- "was this exercise actually done on this date") separate, unlike the
-- prototype's own conflated single-state model — see the header comment in
-- lib/treino-avancado-data.ts for why that separation matters for any
-- future 1RM/progression-history feature.
-- =============================================================================

create table if not exists public.avancado_plans (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  body_weight numeric(5,1),
  body_age int,
  body_height numeric(5,1),
  body_sex text check (body_sex in ('masculino', 'feminino')),
  week jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.avancado_plans enable row level security;

-- Same shape as workout_log_entries' own policies: own row full access,
-- plus read-only access for a linked personal trainer.
do $$ begin
  create policy "avancado_plans_select_own"
    on public.avancado_plans for select
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "avancado_plans_insert_own"
    on public.avancado_plans for insert
    with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "avancado_plans_update_own"
    on public.avancado_plans for update
    using (profile_id = auth.uid())
    with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "avancado_plans_delete_own"
    on public.avancado_plans for delete
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "avancado_plans_select_by_personal"
    on public.avancado_plans for select
    using (
      exists (
        select 1 from public.profiles p
        where p.id = avancado_plans.profile_id and p.linked_personal_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

-- =============================================================================
-- End of migration.
-- =============================================================================
