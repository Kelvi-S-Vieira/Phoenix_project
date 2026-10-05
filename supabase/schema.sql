-- =============================================================================
-- Projeto Fênix — full database schema
-- =============================================================================
-- Run this once, in full, in your Supabase project's SQL editor
-- (Dashboard -> SQL Editor -> New query -> paste this whole file -> Run).
-- It is idempotent-ish (uses IF NOT EXISTS / OR REPLACE where practical) but
-- is meant to be run once against a fresh project.
--
-- This schema covers the WHOLE product, including features not yet built in
-- the Phase 2 vertical slice (see /MIGRATION_PLAN.md at the project root).
-- Building it complete now means future sprints add UI, not migrations.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
do $$ begin
  create type profile_role as enum ('aluno', 'personal');
exception when duplicate_object then null; end $$;

do $$ begin
  create type goal_type as enum ('perder', 'ganhar', 'manter', 'recomp');
exception when duplicate_object then null; end $$;

do $$ begin
  create type activity_level as enum ('sedentario', 'leve', 'moderado', 'intenso', 'atleta');
exception when duplicate_object then null; end $$;

do $$ begin
  create type training_tier as enum ('treino-basico', 'treino-intermediario', 'treino-avancado', 'treino-terceira-idade');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sex_type as enum ('M', 'F');
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- profiles
-- 1:1 with auth.users. Holds both the account-level fields (role, name,
-- trainer link, invite code) and the aluno-only profile/onboarding fields
-- (goal, weight targets, calorie/protein targets, current tier/split).
-- Kept as one table (rather than a separate aluno_profile_data) since every
-- column but the aluno-specific ones is nullable and a JOIN-free read of
-- "who is this and what's their plan" is the single most common query.
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role profile_role,
  name text,

  -- Set on an aluno's profile once they enter a personal's invite code.
  linked_personal_id uuid references public.profiles(id) on delete set null,

  -- Set (unique) on a personal's profile so alunos can enter it at signup.
  code text unique,

  -- Aluno onboarding wizard fields (see /onboarding, ported from the
  -- prototype's 5-step "Perfil" wizard).
  goal goal_type,
  sex sex_type,
  current_weight numeric(6,2),
  target_weight numeric(6,2),
  height numeric(6,2), -- cm
  age integer,
  activity_level activity_level,
  calorie_target integer,
  protein_target integer, -- grams
  -- Diário targets (see /diario, supabase/migration_diary.sql). Computed by
  -- the same onboarding wizard call as calorie_target/protein_target
  -- (lib/fenix-domain.ts computeTargets()), previously discarded.
  carb_target numeric, -- grams
  fat_target numeric, -- grams
  timeframe_weeks integer, -- weeks entered in onboarding step 4, used only to shape the deficit %

  -- Current training assignment (tier + one of that tier's SPLIT_OPTIONS
  -- keys — see lib/fenix-domain.ts). Set by the aluno or applied by their
  -- personal.
  current_tier training_tier,
  current_split text,
  -- Weekly session-frequency goal (2/3/4/5x) for the Terceira Idade tier —
  -- see senior_session_checklist/senior_session_completions below and
  -- supabase/migration_terceira_idade.sql.
  senior_freq_goal integer not null default 3,

  -- Avançado tier's training-level filter ("iniciante"/"intermediario"/
  -- "avancado"/"idoso", see TRAINING_LEVELS in lib/treino-avancado-
  -- builder.ts), decided once at cadastro (TierPicker.tsx) instead of a
  -- live filter box inside AvancadoBuilder — see
  -- supabase/migration_avancado_level.sql.
  avancado_level text,

  -- Avançado tier's equipment filter, persisted as a profile-level
  -- preference so it survives a plan reset instead of starting over —
  -- see supabase/migration_avancado_equipment_pref.sql. Null means "no
  -- saved preference yet" (falls back to defaultEquipmentFilter(), all
  -- true). Shape mirrors Record<string, boolean> keyed by EQUIPMENT_TYPES.
  avancado_equipment_filter jsonb,

  -- Vegetarian/vegan flag, used to swap in a plant-based protein pick in
  -- supplement recommendations instead of whey — see
  -- supabase/migration_dietary_preference.sql.
  dietary_preference text check (dietary_preference in ('onivoro', 'vegetariano', 'vegano')),

  -- Diet type (macro split) + fasting window — see
  -- supabase/migration_diet_type.sql.
  diet_type text check (diet_type in ('equilibrada','mediterranea','lowcarb','cetogenica','altaproteina','jejum')),
  fasting_window text,

  -- Anchors Calendário's rolling 84-day/12-week window when the profile has
  -- no active custom_plans row (set once, on first open — see
  -- app/calendario/page.tsx). Ignored once a Montar Plano exists; that
  -- plan's own start_date/weeks take over instead.
  calendar_start_date date,

  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.profiles is
  'One row per auth.users row. role=aluno rows also carry onboarding/plan data; role=personal rows carry a unique invite `code`.';
comment on column public.profiles.linked_personal_id is
  'For an aluno: the personal they are linked to, resolved from the invite code at signup.';
comment on column public.profiles.code is
  'For a personal: their unique invite code, generated at signup and given to alunos.';

create index if not exists profiles_linked_personal_id_idx on public.profiles(linked_personal_id);
create index if not exists profiles_code_idx on public.profiles(code);

-- Column-limited view for invite-code lookup (signup / "link later" flows).
-- security_invoker = false (the default) is intentional: owned by a
-- privileged role, this view is evaluated with that role's privileges
-- against `profiles` — bypassing `profiles`' own RLS — while only ever
-- exposing the three columns below to whoever it's granted to. This is what
-- makes it safe to grant select to `authenticated` even though `profiles`
-- itself must stay locked down to self/linked rows.
create or replace view public.personal_lookup
  with (security_invoker = false)
as
  select id, name, code
  from public.profiles
  where role = 'personal' and code is not null;

comment on view public.personal_lookup is
  'Column-limited, publicly-queryable-by-authenticated-users view for resolving a personal trainer''s invite code at signup / linking time. Never expose public.profiles directly for this.';

grant select on public.personal_lookup to authenticated;

-- -----------------------------------------------------------------------------
-- weight_logs
-- -----------------------------------------------------------------------------
create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  weight numeric(6,2) not null,
  logged_at date not null default current_date,
  created_at timestamptz not null default now(),
  unique (profile_id, logged_at)
);

create index if not exists weight_logs_profile_id_logged_at_idx
  on public.weight_logs(profile_id, logged_at);

-- -----------------------------------------------------------------------------
-- measurements
-- One row per day per aluno; `values` holds whichever of the prototype's
-- circumference fields (cintura, quadril, peito, braco, coxa, panturrilha,
-- abdomen, pescoco — see lib/fenix-domain.ts MEASUREMENT_FIELDS) were filled
-- in, e.g. {"cintura": 82.5, "braco": 34.0}.
-- -----------------------------------------------------------------------------
create table if not exists public.measurements (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  values jsonb not null default '{}'::jsonb,
  logged_at date not null default current_date,
  created_at timestamptz not null default now(),
  unique (profile_id, logged_at)
);

create index if not exists measurements_profile_id_logged_at_idx
  on public.measurements(profile_id, logged_at);

-- -----------------------------------------------------------------------------
-- progress_photos
-- Image bytes live in Supabase Storage (bucket "progress-photos", see the
-- bottom of this file); this table only indexes them.
-- -----------------------------------------------------------------------------
create table if not exists public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null, -- e.g. "{profile_id}/2026-09-30-front.jpg"
  taken_at date not null default current_date,
  pose text check (pose in ('frente', 'lado', 'costas')),
  weight_at_photo numeric(6,2),
  created_at timestamptz not null default now()
);

-- NOTE: `create table if not exists` above won't alter an already-created
-- table, so an existing deployment also needs the standalone
-- migration_progress_photos_columns.sql run once in the SQL editor.

create index if not exists progress_photos_profile_id_taken_at_idx
  on public.progress_photos(profile_id, taken_at);

-- -----------------------------------------------------------------------------
-- workout_templates
-- A personal's saved (tier, split, name, note) combos, reused across alunos.
-- -----------------------------------------------------------------------------
create table if not exists public.workout_templates (
  id uuid primary key default gen_random_uuid(),
  personal_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  tier training_tier not null,
  split text not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists workout_templates_personal_id_idx
  on public.workout_templates(personal_id);

-- -----------------------------------------------------------------------------
-- chat_messages
-- A conversation is implicitly the (aluno_id, personal_id) pair — there is
-- exactly one thread per aluno since an aluno has at most one linked
-- personal. sender_role says who wrote it.
-- -----------------------------------------------------------------------------
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.profiles(id) on delete cascade,
  personal_id uuid not null references public.profiles(id) on delete cascade,
  sender_role profile_role not null,
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_thread_idx
  on public.chat_messages(aluno_id, personal_id, created_at);

-- -----------------------------------------------------------------------------
-- activity_days
-- One row per (profile, date) the aluno was "active" — backs the streak
-- feature (consecutive days present, counting back from today/yesterday).
-- -----------------------------------------------------------------------------
create table if not exists public.activity_days (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  activity_date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (profile_id, activity_date)
);

create index if not exists activity_days_profile_id_date_idx
  on public.activity_days(profile_id, activity_date);

-- -----------------------------------------------------------------------------
-- badges_unlocked
-- -----------------------------------------------------------------------------
create table if not exists public.badges_unlocked (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  badge_key text not null,
  unlocked_at timestamptz not null default now(),
  unique (profile_id, badge_key)
);

create index if not exists badges_unlocked_profile_id_idx on public.badges_unlocked(profile_id);

-- -----------------------------------------------------------------------------
-- custom_plans
-- Backs the prototype's "Montar Plano" feature.
-- -----------------------------------------------------------------------------
create table if not exists public.custom_plans (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  weeks integer not null,
  diet_choice text check (diet_choice in ('cutting', 'manutencao', 'bulking_limpo', 'bulking')),
  tier training_tier,
  split text,
  start_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists custom_plans_profile_id_idx on public.custom_plans(profile_id);

comment on table public.custom_plans is
  'Backs "Montar Plano": weeks/diet/tier/split setup only. The week-by-week schedule (target weights, action tips) is derived on read by lib/plan-generation.ts from this row + profiles.current_weight/target_weight — see supabase/migration_plano.sql. One active plan per profile is enforced at the app level, not a DB constraint.';

-- -----------------------------------------------------------------------------
-- calendar_days
-- One row per (profile, day) the aluno marked something for — backs the
-- Calendário feature's own simple self-report grid (treino/cardio/descanso +
-- note), deliberately separate from workout_log_entries (which backs the
-- detailed Treino logging elsewhere in the app).
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

-- -----------------------------------------------------------------------------
-- workout_log_entries
-- Per-user, per-day log of the "treino-basico" module (see
-- lib/treino-basico-data.ts for the static exercise pool / split templates,
-- which do NOT live in the database). `exercise_id` is a stable key built
-- from day+type+group+exercise name (see `exerciseId()` in that file), e.g.
-- "seg::musculacao::peito::Supino reto na máquina".
-- -----------------------------------------------------------------------------
create table if not exists public.workout_log_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  logged_at date not null default current_date,
  exercise_id text not null,
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

-- -----------------------------------------------------------------------------
-- cardio_log_entries
-- Simple cardio log (corrida/bike/elíptico/natação, duração + intensidade)
-- backing the "🏃 Cardio" tab shared by Básico and Intermediário
-- (app/treino/TreinoBoard.tsx) — NO calorie/MET calculation, unlike
-- Avançado's own cardio system (lib/treino-avancado-builder.ts). Tier-
-- agnostic (no tier column) — see supabase/migration_cardio_log.sql for the
-- full rationale.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- avancado_plans
-- One row per profile for the "treino-avancado" tier's full custom training
-- builder (see lib/treino-avancado-builder.ts). `week` is the ENTIRE
-- editable plan as jsonb (day -> groups/selections/calistenia/warmup/
-- cardio/sports/generic entries, plus the equipment/level filters and last
-- template key) — a single flexible document, not normalized relational
-- data, by design: see supabase/migration_avancado_builder.sql for the full
-- rationale. The daily "feito hoje" checkbox for musculação/calistenia/
-- aquecimento exercises reuses workout_log_entries above (keyed by the
-- day-independent exerciseKey() instead of Básico/Intermediário's
-- day-prefixed exerciseId()) rather than a new table.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- exercise_set_logs
-- Training-log history backing Avançado's Musculação 1RM/PR/progression-
-- suggestion/deload/swap feature (see lib/treino-progression.ts). One row
-- per logged set, many dated rows per `exercise_key` (the day-INDEPENDENT
-- exerciseKey(), not workout_log_entries' day-prefixed exerciseId() — see
-- that table's header comment above and supabase/migration_exercise_set_logs.sql
-- for the full rationale).
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- lifts
-- One row per tracked lift (Dashboard "Cargas" card), ported from the
-- prototype's localStorage `lifts` array. A profile with zero rows is
-- seeded client-side with the 3 prototype defaults (Supino/Hack/Leg Press)
-- the first time the Dashboard loads — see app/dashboard/page.tsx.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- weekly_cardio
-- One row per profile (Dashboard "Cardio" card). Flat boolean-per-weekday
-- model ported verbatim from the prototype's localStorage `cardio` 7-item
-- array — "resets" only when the user manually unchecks a day, there is no
-- automatic weekly reset in the prototype or here.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- diary_entries
-- One row per logged food item (Diário / food diary, see app/diario). Unlike
-- measurements/weekly_cardio, a day can hold many rows per meal, so there's
-- no unique(profile_id, logged_at) constraint here. `food_name`/kcal/macros
-- are copied in at insert time (from lib/food-database.ts or typed in
-- manually) rather than referencing a foods table, since FOOD_DB is static
-- reference data, not a table — matching this project's treino-pool pattern.
-- -----------------------------------------------------------------------------
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
  source text not null check (source in ('db', 'manual', 'ai_photo', 'ai_text')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists diary_entries_profile_id_logged_at_idx
  on public.diary_entries(profile_id, logged_at);

-- NOTE: `create table if not exists` above won't alter an already-created
-- table, so an existing deployment also needs the standalone
-- supabase/migration_diary.sql run once in the SQL editor (it also adds the
-- profiles.carb_target/fat_target/timeframe_weeks columns above).

-- -----------------------------------------------------------------------------
-- user_recipes / meal_prep_plan / shopping_extras
-- Alimentação / Marmitas (see app/alimentacao/marmitas). `ingredients` is a
-- jsonb array of {name, qty, unit} — variable-length and never queried
-- into, so jsonb is appropriate here (unlike diary_entries' flat columns,
-- which the app does aggregate/filter on). SUGGESTED_RECIPES (meal-prep
-- ideas), SUPPLEMENTS and SUPPLEMENT_RECIPES are pure reference content
-- with no per-user state, so they stay static TS data (lib/marmita-
-- suggestions.ts, lib/supplements.ts, lib/supplement-recipes.ts) and need
-- no tables.
-- -----------------------------------------------------------------------------
create table if not exists public.user_recipes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  yield_count integer not null default 1,
  ingredients jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_recipes_profile_id_idx
  on public.user_recipes(profile_id);

-- One row per (user, recipe) with a nonzero desired marmita count for the
-- week; rows are upserted/deleted as counts change rather than keeping
-- zero-count rows around.
create table if not exists public.meal_prep_plan (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  user_recipe_id uuid not null references public.user_recipes(id) on delete cascade,
  desired_count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (profile_id, user_recipe_id)
);

-- Free-form shopping-list items ("Outros itens"), with a per-item checked
-- state.
create table if not exists public.shopping_extras (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  checked boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists shopping_extras_profile_id_idx
  on public.shopping_extras(profile_id);

-- NOTE: `create table if not exists` above won't alter an already-created
-- table, so an existing deployment also needs the standalone
-- supabase/migration_alimentacao.sql run once in the SQL editor.

-- -----------------------------------------------------------------------------
-- senior_session_checklist / senior_session_completions
-- Terceira Idade tier (see lib/terceira-idade-data.ts,
-- app/treino/terceira-idade/TerceiraIdadeBoard.tsx). Ported from the
-- prototype's localStorage `fenix_terceira_idade` state — see
-- supabase/migration_terceira_idade.sql for the full rationale. The weekly
-- frequency goal lives directly on profiles (profiles.senior_freq_goal,
-- above), like current_tier/current_split/calendar_start_date. Deliberately
-- does NOT feed activity_days (the main dashboard streak) — this tier keeps
-- its own weekly completion tracking.
-- -----------------------------------------------------------------------------
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

-- NOTE: `create table if not exists` above won't alter an already-created
-- table/enum, so an existing deployment also needs the standalone
-- supabase/migration_terceira_idade.sql run once in the SQL editor (it also
-- adds 'treino-terceira-idade' to the training_tier enum and
-- profiles.senior_freq_goal above).

-- -----------------------------------------------------------------------------
-- plan_recommendation_picks
-- Records which "plano inicial recomendado" suggestions (Montar Plano's
-- extra step, see supabase/migration_plan_recommendations.sql for the full
-- rationale) the user accepted, for the Suplementação/Receitas Fit pages
-- to badge. Marmita picks go straight into user_recipes/meal_prep_plan
-- above instead.
-- -----------------------------------------------------------------------------
create table if not exists public.plan_recommendation_picks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('supplement', 'receita_fit')),
  ref_name text not null,
  created_at timestamptz not null default now()
);

create index if not exists plan_recommendation_picks_profile_id_idx
  on public.plan_recommendation_picks(profile_id);

-- =============================================================================
-- Auto-create a profiles row whenever a new auth.users row appears
-- (standard Supabase recipe: a trigger function on auth.users insert).
--
-- The email/password signup form (see app/signup) passes role, name and an
-- optional invite_code through supabase.auth.signUp()'s `options.data`,
-- which Postgres sees as new.raw_user_meta_data — this trigger reads it and
-- fills in the profile in the same transaction as account creation:
--   - role/name are copied straight across.
--   - if invite_code matches a personal's `code`, linked_personal_id is set.
--   - if role='personal', a fresh unique invite code is generated for them.
-- Google OAuth signups arrive with no such metadata (role is null); the app
-- sends those users to /complete-profile to pick a role afterwards, which
-- calls the complete_oauth_profile() RPC (defined below) rather than
-- updating this row directly — role/linked_personal_id are no longer
-- settable via a raw client .update() on profiles.
-- =============================================================================
create or replace function public.generate_invite_code()
returns text
language plpgsql
as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no 0/O/1/I
  result text := '';
  i int;
begin
  for i in 1..6 loop
    result := result || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return result;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  meta jsonb := new.raw_user_meta_data;
  v_role text := meta ->> 'role';
  v_name text := meta ->> 'name';
  v_invite_code text := upper(coalesce(meta ->> 'invite_code', ''));
  v_linked_personal uuid;
  v_own_code text;
begin
  if v_invite_code <> '' then
    select id into v_linked_personal from public.profiles where code = v_invite_code;
  end if;

  if v_role = 'personal' then
    loop
      v_own_code := public.generate_invite_code();
      exit when not exists (select 1 from public.profiles where code = v_own_code);
    end loop;
  end if;

  insert into public.profiles (id, role, name, linked_personal_id, code)
  values (
    new.id,
    nullif(v_role, '')::profile_role,
    v_name,
    v_linked_personal,
    v_own_code
  )
  on conflict (id) do update set
    role = coalesce(excluded.role, public.profiles.role),
    name = coalesce(excluded.name, public.profiles.name),
    linked_personal_id = coalesce(excluded.linked_personal_id, public.profiles.linked_personal_id),
    code = coalesce(public.profiles.code, excluded.code);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================================================
-- Column-level protection on profiles
-- Postgres RLS policies control row visibility/writability, not individual
-- columns, so the few columns that need per-column rules (role,
-- linked_personal_id; and the "a personal may only touch current_tier/
-- current_split on a linked aluno" rule) are enforced by this BEFORE UPDATE
-- trigger instead, diffing OLD vs NEW.
--
-- role / linked_personal_id can never be set by a raw client .update() on
-- profiles — the only two ways to set them are the SECURITY DEFINER RPCs
-- below (redeem_invite_code, complete_oauth_profile), which briefly flip the
-- `fenix.trusted_profile_update` session setting so this trigger lets their
-- own UPDATE through.
-- =============================================================================
create or replace function public.profiles_protect_restricted_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  acting_uid uuid := auth.uid();
  is_trusted boolean := coalesce(current_setting('fenix.trusted_profile_update', true), '') = 'true';
begin
  if is_trusted then
    return new;
  end if;

  if acting_uid is null then
    -- No auth context (service role, trigger-driven writes, etc.).
    return new;
  end if;

  if acting_uid = new.id then
    -- Self-update: role and linked_personal_id are immutable from the
    -- client. Use redeem_invite_code() / complete_oauth_profile() instead.
    if new.role is distinct from old.role then
      new.role := old.role;
    end if;
    if new.linked_personal_id is distinct from old.linked_personal_id then
      new.linked_personal_id := old.linked_personal_id;
    end if;
  elsif old.linked_personal_id = acting_uid then
    -- A personal updating a linked aluno's row: only current_tier/
    -- current_split may actually change; revert everything else.
    if new.role is distinct from old.role then new.role := old.role; end if;
    if new.name is distinct from old.name then new.name := old.name; end if;
    if new.linked_personal_id is distinct from old.linked_personal_id then
      new.linked_personal_id := old.linked_personal_id;
    end if;
    if new.code is distinct from old.code then new.code := old.code; end if;
    if new.goal is distinct from old.goal then new.goal := old.goal; end if;
    if new.sex is distinct from old.sex then new.sex := old.sex; end if;
    if new.current_weight is distinct from old.current_weight then
      new.current_weight := old.current_weight;
    end if;
    if new.target_weight is distinct from old.target_weight then
      new.target_weight := old.target_weight;
    end if;
    if new.height is distinct from old.height then new.height := old.height; end if;
    if new.age is distinct from old.age then new.age := old.age; end if;
    if new.activity_level is distinct from old.activity_level then
      new.activity_level := old.activity_level;
    end if;
    if new.calorie_target is distinct from old.calorie_target then
      new.calorie_target := old.calorie_target;
    end if;
    if new.protein_target is distinct from old.protein_target then
      new.protein_target := old.protein_target;
    end if;
    if new.onboarding_completed is distinct from old.onboarding_completed then
      new.onboarding_completed := old.onboarding_completed;
    end if;
    -- current_tier / current_split: left untouched, i.e. allowed.
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_restricted_columns_trg on public.profiles;
create trigger profiles_protect_restricted_columns_trg
  before update on public.profiles
  for each row execute procedure public.profiles_protect_restricted_columns();

-- Redeem an invite code for the CURRENT user (an aluno already signed up,
-- with or without a personal, using the new /perfil/vincular-personal
-- screen). SECURITY DEFINER so it can resolve `code` across all of
-- `profiles` despite RLS, without exposing that lookup directly to clients.
create or replace function public.redeem_invite_code(p_code text)
returns table (personal_id uuid, personal_name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(trim(coalesce(p_code, '')));
  v_personal_id uuid;
  v_personal_name text;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;
  if v_code = '' then
    raise exception 'code_not_found';
  end if;

  select id, name into v_personal_id, v_personal_name
  from public.profiles
  where role = 'personal' and code = v_code;

  if v_personal_id is null then
    raise exception 'code_not_found';
  end if;

  perform set_config('fenix.trusted_profile_update', 'true', true);
  update public.profiles set linked_personal_id = v_personal_id where id = auth.uid();
  perform set_config('fenix.trusted_profile_update', 'false', true);

  return query select v_personal_id, v_personal_name;
end;
$$;

grant execute on function public.redeem_invite_code(text) to authenticated;

-- Used by /complete-profile (the post-Google-OAuth "pick a role" screen).
-- Only works once per account (role must currently be null) — this is the
-- OAuth completion path, never a general way to change role later.
create or replace function public.complete_oauth_profile(
  p_role public.profile_role,
  p_name text,
  p_invite_code text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_code text := upper(trim(coalesce(p_invite_code, '')));
  v_linked_personal uuid;
  v_own_code text;
  v_current_role public.profile_role;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select role into v_current_role from public.profiles where id = v_uid;
  if v_current_role is not null then
    raise exception 'profile_already_set';
  end if;

  if p_role = 'aluno' and v_code <> '' then
    select id into v_linked_personal
    from public.profiles
    where role = 'personal' and code = v_code;

    if v_linked_personal is null then
      raise exception 'code_not_found';
    end if;
  end if;

  if p_role = 'personal' then
    loop
      v_own_code := public.generate_invite_code();
      exit when not exists (select 1 from public.profiles where code = v_own_code);
    end loop;
  end if;

  perform set_config('fenix.trusted_profile_update', 'true', true);
  update public.profiles
  set role = p_role,
      name = coalesce(nullif(p_name, ''), name),
      linked_personal_id = v_linked_personal,
      code = v_own_code
  where id = v_uid;
  perform set_config('fenix.trusted_profile_update', 'false', true);
end;
$$;

grant execute on function public.complete_oauth_profile(public.profile_role, text, text) to authenticated;

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.profiles enable row level security;
alter table public.weight_logs enable row level security;
alter table public.measurements enable row level security;
alter table public.progress_photos enable row level security;
alter table public.workout_templates enable row level security;
alter table public.chat_messages enable row level security;
alter table public.activity_days enable row level security;
alter table public.badges_unlocked enable row level security;
alter table public.custom_plans enable row level security;
alter table public.calendar_days enable row level security;
alter table public.workout_log_entries enable row level security;
alter table public.cardio_log_entries enable row level security;
alter table public.avancado_plans enable row level security;
alter table public.exercise_set_logs enable row level security;
alter table public.lifts enable row level security;
alter table public.weekly_cardio enable row level security;
alter table public.diary_entries enable row level security;
alter table public.user_recipes enable row level security;
alter table public.meal_prep_plan enable row level security;
alter table public.shopping_extras enable row level security;
alter table public.senior_session_checklist enable row level security;
alter table public.senior_session_completions enable row level security;
alter table public.plan_recommendation_picks enable row level security;

-- --- profiles -----------------------------------------------------------
-- Everyone can read their own profile; a personal can also read the
-- profiles of alunos linked to them (roster + evolution report). Invite-code
-- lookup at signup/linking time goes through the public.personal_lookup
-- view below (id/name/code of personals only), NOT a profiles policy — a
-- "code is not null" SELECT policy here would expose a personal's entire
-- row (email-linked info and all) to any authenticated user.
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_select_linked_alunos_by_personal"
  on public.profiles for select
  using (linked_personal_id = auth.uid());

-- Row-level only: can update any column on their own row. The
-- profiles_protect_restricted_columns_trg trigger (above) additionally
-- blocks role/linked_personal_id from actually changing via this path.
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- --- weight_logs ----------------------------------------------------------
create policy "weight_logs_select_own"
  on public.weight_logs for select
  using (profile_id = auth.uid());

create policy "weight_logs_select_by_personal"
  on public.weight_logs for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = weight_logs.profile_id and p.linked_personal_id = auth.uid()
    )
  );

create policy "weight_logs_insert_own"
  on public.weight_logs for insert
  with check (profile_id = auth.uid());

create policy "weight_logs_update_own"
  on public.weight_logs for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "weight_logs_delete_own"
  on public.weight_logs for delete
  using (profile_id = auth.uid());

-- --- measurements -----------------------------------------------------------
create policy "measurements_select_own"
  on public.measurements for select
  using (profile_id = auth.uid());

create policy "measurements_select_by_personal"
  on public.measurements for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = measurements.profile_id and p.linked_personal_id = auth.uid()
    )
  );

create policy "measurements_insert_own"
  on public.measurements for insert
  with check (profile_id = auth.uid());

create policy "measurements_update_own"
  on public.measurements for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "measurements_delete_own"
  on public.measurements for delete
  using (profile_id = auth.uid());

-- --- progress_photos --------------------------------------------------------
create policy "progress_photos_select_own"
  on public.progress_photos for select
  using (profile_id = auth.uid());

create policy "progress_photos_select_by_personal"
  on public.progress_photos for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = progress_photos.profile_id and p.linked_personal_id = auth.uid()
    )
  );

create policy "progress_photos_insert_own"
  on public.progress_photos for insert
  with check (profile_id = auth.uid());

create policy "progress_photos_delete_own"
  on public.progress_photos for delete
  using (profile_id = auth.uid());

-- --- workout_templates -------------------------------------------------------
-- Only the personal who created a template can see/manage it.
create policy "workout_templates_select_own"
  on public.workout_templates for select
  using (personal_id = auth.uid());

create policy "workout_templates_insert_own"
  on public.workout_templates for insert
  with check (personal_id = auth.uid());

create policy "workout_templates_update_own"
  on public.workout_templates for update
  using (personal_id = auth.uid())
  with check (personal_id = auth.uid());

create policy "workout_templates_delete_own"
  on public.workout_templates for delete
  using (personal_id = auth.uid());

-- --- chat_messages -----------------------------------------------------------
-- Readable/writable by either party in that specific aluno-personal pair,
-- and only when they are really linked to each other right now.
create policy "chat_messages_select_participant"
  on public.chat_messages for select
  using (
    (auth.uid() = aluno_id or auth.uid() = personal_id)
  );

create policy "chat_messages_insert_participant"
  on public.chat_messages for insert
  with check (
    (auth.uid() = aluno_id or auth.uid() = personal_id)
    and exists (
      select 1 from public.profiles p
      where p.id = chat_messages.aluno_id
        and p.linked_personal_id = chat_messages.personal_id
    )
    and (
      (sender_role = 'aluno' and auth.uid() = aluno_id)
      or (sender_role = 'personal' and auth.uid() = personal_id)
    )
  );

-- --- activity_days -----------------------------------------------------------
create policy "activity_days_select_own"
  on public.activity_days for select
  using (profile_id = auth.uid());

create policy "activity_days_select_by_personal"
  on public.activity_days for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = activity_days.profile_id and p.linked_personal_id = auth.uid()
    )
  );

create policy "activity_days_insert_own"
  on public.activity_days for insert
  with check (profile_id = auth.uid());

-- --- badges_unlocked -----------------------------------------------------------
create policy "badges_unlocked_select_own"
  on public.badges_unlocked for select
  using (profile_id = auth.uid());

create policy "badges_unlocked_select_by_personal"
  on public.badges_unlocked for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = badges_unlocked.profile_id and p.linked_personal_id = auth.uid()
    )
  );

create policy "badges_unlocked_insert_own"
  on public.badges_unlocked for insert
  with check (profile_id = auth.uid());

-- --- custom_plans -----------------------------------------------------------
create policy "custom_plans_select_own"
  on public.custom_plans for select
  using (profile_id = auth.uid());

create policy "custom_plans_select_by_personal"
  on public.custom_plans for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = custom_plans.profile_id and p.linked_personal_id = auth.uid()
    )
  );

create policy "custom_plans_insert_own"
  on public.custom_plans for insert
  with check (profile_id = auth.uid());

create policy "custom_plans_update_own"
  on public.custom_plans for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "custom_plans_delete_own"
  on public.custom_plans for delete
  using (profile_id = auth.uid());

-- --- calendar_days -----------------------------------------------------------
create policy "calendar_days_select_own"
  on public.calendar_days for select
  using (profile_id = auth.uid());

create policy "calendar_days_select_by_personal"
  on public.calendar_days for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = calendar_days.profile_id and p.linked_personal_id = auth.uid()
    )
  );

create policy "calendar_days_insert_own"
  on public.calendar_days for insert
  with check (profile_id = auth.uid());

create policy "calendar_days_update_own"
  on public.calendar_days for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "calendar_days_delete_own"
  on public.calendar_days for delete
  using (profile_id = auth.uid());

-- --- workout_log_entries -----------------------------------------------------
create policy "workout_log_entries_select_own"
  on public.workout_log_entries for select
  using (profile_id = auth.uid());

create policy "workout_log_entries_insert_own"
  on public.workout_log_entries for insert
  with check (profile_id = auth.uid());

create policy "workout_log_entries_update_own"
  on public.workout_log_entries for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "workout_log_entries_select_by_personal"
  on public.workout_log_entries for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = workout_log_entries.profile_id and p.linked_personal_id = auth.uid()
    )
  );

create policy "workout_log_entries_delete_own"
  on public.workout_log_entries for delete
  using (profile_id = auth.uid());

-- --- cardio_log_entries -------------------------------------------------------
create policy "cardio_log_entries_select_own"
  on public.cardio_log_entries for select
  using (profile_id = auth.uid());

create policy "cardio_log_entries_select_by_personal"
  on public.cardio_log_entries for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = cardio_log_entries.profile_id and p.linked_personal_id = auth.uid()
    )
  );

create policy "cardio_log_entries_insert_own"
  on public.cardio_log_entries for insert
  with check (profile_id = auth.uid());

create policy "cardio_log_entries_update_own"
  on public.cardio_log_entries for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "cardio_log_entries_delete_own"
  on public.cardio_log_entries for delete
  using (profile_id = auth.uid());

-- --- avancado_plans -----------------------------------------------------------
create policy "avancado_plans_select_own"
  on public.avancado_plans for select
  using (profile_id = auth.uid());

create policy "avancado_plans_insert_own"
  on public.avancado_plans for insert
  with check (profile_id = auth.uid());

create policy "avancado_plans_update_own"
  on public.avancado_plans for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "avancado_plans_delete_own"
  on public.avancado_plans for delete
  using (profile_id = auth.uid());

create policy "avancado_plans_select_by_personal"
  on public.avancado_plans for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = avancado_plans.profile_id and p.linked_personal_id = auth.uid()
    )
  );

-- --- exercise_set_logs -------------------------------------------------------
create policy "exercise_set_logs_select_own"
  on public.exercise_set_logs for select
  using (profile_id = auth.uid());

create policy "exercise_set_logs_select_by_personal"
  on public.exercise_set_logs for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = exercise_set_logs.profile_id and p.linked_personal_id = auth.uid()
    )
  );

create policy "exercise_set_logs_insert_own"
  on public.exercise_set_logs for insert
  with check (profile_id = auth.uid());

create policy "exercise_set_logs_update_own"
  on public.exercise_set_logs for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "exercise_set_logs_delete_own"
  on public.exercise_set_logs for delete
  using (profile_id = auth.uid());

-- --- lifts -----------------------------------------------------------------
create policy "lifts_select_own"
  on public.lifts for select
  using (profile_id = auth.uid());

create policy "lifts_select_by_personal"
  on public.lifts for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = lifts.profile_id and p.linked_personal_id = auth.uid()
    )
  );

create policy "lifts_insert_own"
  on public.lifts for insert
  with check (profile_id = auth.uid());

create policy "lifts_update_own"
  on public.lifts for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "lifts_delete_own"
  on public.lifts for delete
  using (profile_id = auth.uid());

-- --- weekly_cardio -----------------------------------------------------------
create policy "weekly_cardio_select_own"
  on public.weekly_cardio for select
  using (profile_id = auth.uid());

create policy "weekly_cardio_select_by_personal"
  on public.weekly_cardio for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = weekly_cardio.profile_id and p.linked_personal_id = auth.uid()
    )
  );

create policy "weekly_cardio_insert_own"
  on public.weekly_cardio for insert
  with check (profile_id = auth.uid());

create policy "weekly_cardio_update_own"
  on public.weekly_cardio for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- --- diary_entries -----------------------------------------------------------
create policy "diary_entries_select_own"
  on public.diary_entries for select
  using (profile_id = auth.uid());

create policy "diary_entries_select_by_personal"
  on public.diary_entries for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = diary_entries.profile_id and p.linked_personal_id = auth.uid()
    )
  );

create policy "diary_entries_insert_own"
  on public.diary_entries for insert
  with check (profile_id = auth.uid());

create policy "diary_entries_update_own"
  on public.diary_entries for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "diary_entries_delete_own"
  on public.diary_entries for delete
  using (profile_id = auth.uid());

-- --- user_recipes -------------------------------------------------------------
create policy "user_recipes_select_own"
  on public.user_recipes for select
  using (profile_id = auth.uid());

create policy "user_recipes_select_by_personal"
  on public.user_recipes for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = user_recipes.profile_id and p.linked_personal_id = auth.uid()
    )
  );

create policy "user_recipes_insert_own"
  on public.user_recipes for insert
  with check (profile_id = auth.uid());

create policy "user_recipes_update_own"
  on public.user_recipes for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "user_recipes_delete_own"
  on public.user_recipes for delete
  using (profile_id = auth.uid());

-- --- meal_prep_plan ------------------------------------------------------------
create policy "meal_prep_plan_select_own"
  on public.meal_prep_plan for select
  using (profile_id = auth.uid());

create policy "meal_prep_plan_select_by_personal"
  on public.meal_prep_plan for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = meal_prep_plan.profile_id and p.linked_personal_id = auth.uid()
    )
  );

create policy "meal_prep_plan_insert_own"
  on public.meal_prep_plan for insert
  with check (profile_id = auth.uid());

create policy "meal_prep_plan_update_own"
  on public.meal_prep_plan for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "meal_prep_plan_delete_own"
  on public.meal_prep_plan for delete
  using (profile_id = auth.uid());

-- --- shopping_extras ------------------------------------------------------------
create policy "shopping_extras_select_own"
  on public.shopping_extras for select
  using (profile_id = auth.uid());

create policy "shopping_extras_insert_own"
  on public.shopping_extras for insert
  with check (profile_id = auth.uid());

create policy "shopping_extras_update_own"
  on public.shopping_extras for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "shopping_extras_delete_own"
  on public.shopping_extras for delete
  using (profile_id = auth.uid());

-- --- senior_session_checklist ------------------------------------------------
create policy "senior_session_checklist_select_own"
  on public.senior_session_checklist for select
  using (profile_id = auth.uid());

create policy "senior_session_checklist_select_by_personal"
  on public.senior_session_checklist for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = senior_session_checklist.profile_id and p.linked_personal_id = auth.uid()
    )
  );

create policy "senior_session_checklist_insert_own"
  on public.senior_session_checklist for insert
  with check (profile_id = auth.uid());

create policy "senior_session_checklist_update_own"
  on public.senior_session_checklist for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "senior_session_checklist_delete_own"
  on public.senior_session_checklist for delete
  using (profile_id = auth.uid());

-- --- senior_session_completions ------------------------------------------------
create policy "senior_session_completions_select_own"
  on public.senior_session_completions for select
  using (profile_id = auth.uid());

create policy "senior_session_completions_select_by_personal"
  on public.senior_session_completions for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = senior_session_completions.profile_id and p.linked_personal_id = auth.uid()
    )
  );

create policy "senior_session_completions_insert_own"
  on public.senior_session_completions for insert
  with check (profile_id = auth.uid());

create policy "senior_session_completions_delete_own"
  on public.senior_session_completions for delete
  using (profile_id = auth.uid());

-- --- plan_recommendation_picks ------------------------------------------------
create policy "plan_recommendation_picks_select_own"
  on public.plan_recommendation_picks for select
  using (profile_id = auth.uid());

create policy "plan_recommendation_picks_select_by_personal"
  on public.plan_recommendation_picks for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = plan_recommendation_picks.profile_id and p.linked_personal_id = auth.uid()
    )
  );

create policy "plan_recommendation_picks_insert_own"
  on public.plan_recommendation_picks for insert
  with check (profile_id = auth.uid());

create policy "plan_recommendation_picks_delete_own"
  on public.plan_recommendation_picks for delete
  using (profile_id = auth.uid());

-- --- personal write access for workout application --------------------------
-- A personal applying a saved workout template to one of their alunos needs
-- to update that aluno's `current_tier`/`current_split` on `profiles`.
create policy "profiles_update_linked_aluno_by_personal"
  on public.profiles for update
  using (linked_personal_id = auth.uid())
  with check (linked_personal_id = auth.uid());

-- =============================================================================
-- Supabase Storage: "progress-photos" bucket
-- =============================================================================
-- Bucket creation itself is a one-time manual step (Dashboard -> Storage ->
-- New bucket -> name "progress-photos" -> Private). The bucket ROW and its
-- access policies below ARE pure SQL and safe to run here once the bucket
-- exists (this insert is a no-op if you already created it by hand).
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

-- Users can only read/write objects under a path prefixed with their own
-- user id, e.g. "{user_id}/2026-09-30-front.jpg". storage.foldername splits
-- the object path on "/" and [1] is the first path segment.
create policy "progress_photos_storage_select_own"
  on storage.objects for select
  using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "progress_photos_storage_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "progress_photos_storage_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- A personal can also read a linked aluno's progress photos in Storage
-- (mirrors the progress_photos table policy above).
create policy "progress_photos_storage_select_by_personal"
  on storage.objects for select
  using (
    bucket_id = 'progress-photos'
    and exists (
      select 1 from public.profiles p
      where p.id::text = (storage.foldername(name))[1]
        and p.linked_personal_id = auth.uid()
    )
  );

-- =============================================================================
-- End of schema.
-- =============================================================================
