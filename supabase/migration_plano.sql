-- =============================================================================
-- Montar Plano / Plano 17 semanas / Calendário feature.
-- Run once in the Supabase SQL Editor. Idempotent (IF NOT EXISTS / DO blocks
-- throughout). Also folded into schema.sql in place so a fresh install gets
-- it directly.
--
-- `custom_plans` already existed in schema.sql from an earlier phase of this
-- project (it backed only the Montar Plano setup form, with no week-by-week
-- schedule). This migration extends it with `updated_at` (for the
-- edit-weeks flow) and a `diet_choice` check constraint, and adds the new
-- `calendar_days` table for the Calendário feature. The week-by-week
-- schedule itself (target weights, action tips) is NOT stored — it's
-- derived on read from `custom_plans` + `profiles` by lib/plan-generation.ts,
-- same data both /montar-plano and /plano17 read from.
--
-- One-active-plan-per-user is enforced at the APPLICATION level (the
-- "create plan" flow refuses to insert while the profile already has a row
-- in custom_plans), not via a DB constraint — simpler than a partial unique
-- index, and `custom_plans` has no "status" column to index on anyway.
-- =============================================================================

alter table public.custom_plans
  add column if not exists updated_at timestamptz not null default now();

-- Anchors Calendário's rolling 84-day/12-week window for a profile with no
-- active Montar Plano (set once, the first time they open /calendario with
-- no plan — see app/calendario/page.tsx). When a Montar Plano exists,
-- Calendário uses that plan's own start_date/weeks instead and ignores this.
alter table public.profiles
  add column if not exists calendar_start_date date;

do $$ begin
  alter table public.custom_plans
    add constraint custom_plans_diet_choice_check
    check (diet_choice in ('cutting', 'manutencao', 'bulking_limpo', 'bulking'));
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- calendar_days
-- One row per (profile, day) the aluno marked something for — backs the
-- Calendário feature's own simple self-report grid (treino/cardio/descanso +
-- note), deliberately separate from workout_log_entries (which backs the
-- detailed Treino logging elsewhere in the app) — see
-- app/calendario/page.tsx for why this stays a manual self-report.
-- -----------------------------------------------------------------------------
create table if not exists public.calendar_days (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  day_date date not null,
  status text check (status in ('treino', 'cardio', 'descanso')),
  note text,
  updated_at timestamptz not null default now(),
  primary key (profile_id, day_date)
);

create index if not exists calendar_days_profile_id_idx on public.calendar_days(profile_id);

alter table public.calendar_days enable row level security;

do $$ begin
  create policy "calendar_days_select_own"
    on public.calendar_days for select
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "calendar_days_select_by_personal"
    on public.calendar_days for select
    using (
      exists (
        select 1 from public.profiles p
        where p.id = calendar_days.profile_id and p.linked_personal_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "calendar_days_insert_own"
    on public.calendar_days for insert
    with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "calendar_days_update_own"
    on public.calendar_days for update
    using (profile_id = auth.uid())
    with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "calendar_days_delete_own"
    on public.calendar_days for delete
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

-- =============================================================================
-- End of migration.
-- =============================================================================
