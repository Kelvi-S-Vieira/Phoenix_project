-- =============================================================================
-- Dashboard "Cargas" (lift tracking) + "Cardio" (weekly toggle grid) tables.
-- Run once in the Supabase SQL Editor. Safe to run against an existing
-- project (uses IF NOT EXISTS / idempotent DO blocks throughout). Also
-- folded into schema.sql in place so a fresh install gets these directly.
--
-- Ported from the prototype's localStorage-backed `lifts`/`cardio` state
-- (projeto_fenix_app_final.html, loadLifts/saveLifts/loadCardio/saveCardio,
-- ~lines 5625-5657) into real per-user tables:
--   - lifts: one row per tracked lift (Supino/Hack/Leg Press by default,
--     seeded client-side the first time a profile with zero rows loads the
--     Dashboard — see app/dashboard/page.tsx — rather than via a DB trigger,
--     since onboarding doesn't otherwise touch this feature).
--   - weekly_cardio: a single row per profile with one boolean column per
--     weekday, matching the prototype's own flat 7-boolean-array model
--     exactly (it "resets" only when the user manually unchecks a day —
--     there is no automatic weekly reset in the prototype, so none is added
--     here either).
-- =============================================================================

create table if not exists public.lifts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  unit text not null default 'kg',
  start_value numeric(7,2) not null,
  current_value numeric(7,2) not null,
  goal_value numeric(7,2),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lifts_profile_id_sort_order_idx
  on public.lifts(profile_id, sort_order);

create table if not exists public.weekly_cardio (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  mon boolean not null default false,
  tue boolean not null default false,
  wed boolean not null default false,
  thu boolean not null default false,
  fri boolean not null default false,
  sat boolean not null default false,
  sun boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.lifts enable row level security;
alter table public.weekly_cardio enable row level security;

-- --- lifts -------------------------------------------------------------
do $$ begin
  create policy "lifts_select_own"
    on public.lifts for select
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "lifts_select_by_personal"
    on public.lifts for select
    using (
      exists (
        select 1 from public.profiles p
        where p.id = lifts.profile_id and p.linked_personal_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "lifts_insert_own"
    on public.lifts for insert
    with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "lifts_update_own"
    on public.lifts for update
    using (profile_id = auth.uid())
    with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "lifts_delete_own"
    on public.lifts for delete
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

-- --- weekly_cardio -------------------------------------------------------
do $$ begin
  create policy "weekly_cardio_select_own"
    on public.weekly_cardio for select
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "weekly_cardio_select_by_personal"
    on public.weekly_cardio for select
    using (
      exists (
        select 1 from public.profiles p
        where p.id = weekly_cardio.profile_id and p.linked_personal_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "weekly_cardio_insert_own"
    on public.weekly_cardio for insert
    with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "weekly_cardio_update_own"
    on public.weekly_cardio for update
    using (profile_id = auth.uid())
    with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

-- =============================================================================
-- End of migration.
-- =============================================================================
