-- =============================================================================
-- Diário (food diary) feature: diary_entries table + profiles target columns.
-- Run once in the Supabase SQL Editor. Safe to run against an existing
-- project (uses IF NOT EXISTS / idempotent DO blocks throughout). Also
-- folded into schema.sql in place so a fresh install gets these directly.
--
-- Ported from the prototype's localStorage-backed Diário module
-- (projeto_fenix_app_final.html, #page-diario markup + the FOOD_DB/
-- addEntry/renderSummary logic, ~lines 3812-3909 and 17299-17808) into a
-- real per-user table. FOOD_DB itself stays static TS data (lib/food-
-- database.ts), not a table, matching this project's treino-pool pattern.
--
-- Also adds profiles.carb_target/fat_target/timeframe_weeks, which an
-- earlier audit flagged as missing: the onboarding wizard's computeTargets()
-- (lib/fenix-domain.ts) already derives carbG/fatG with the prototype's
-- exact formula (fatG = round(calorieTarget*0.28/9), carbG = max(0,
-- round((calorieTarget - proteinG*4 - fatG*9)/4))) but previously discarded
-- them instead of saving — see app/onboarding/OnboardingWizard.tsx.
-- =============================================================================

alter table public.profiles
  add column if not exists carb_target numeric,
  add column if not exists fat_target numeric,
  add column if not exists timeframe_weeks integer;

create table if not exists public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  logged_at date not null default current_date,
  meal text not null check (meal in ('cafe', 'almoco', 'lanche', 'jantar', 'extra')),
  food_name text not null,
  quantity numeric,
  unit text,
  kcal numeric not null,
  protein numeric not null default 0,
  carb numeric not null default 0,
  fat numeric not null default 0,
  source text not null check (source in ('db', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists diary_entries_profile_id_logged_at_idx
  on public.diary_entries(profile_id, logged_at);

alter table public.diary_entries enable row level security;

do $$ begin
  create policy "diary_entries_select_own"
    on public.diary_entries for select
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "diary_entries_select_by_personal"
    on public.diary_entries for select
    using (
      exists (
        select 1 from public.profiles p
        where p.id = diary_entries.profile_id and p.linked_personal_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "diary_entries_insert_own"
    on public.diary_entries for insert
    with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "diary_entries_update_own"
    on public.diary_entries for update
    using (profile_id = auth.uid())
    with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "diary_entries_delete_own"
    on public.diary_entries for delete
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

-- =============================================================================
-- End of migration.
-- =============================================================================
