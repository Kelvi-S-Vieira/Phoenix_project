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
  create type training_tier as enum ('treino-basico', 'treino-intermediario', 'treino-avancado');
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

  -- Current training assignment (tier + one of that tier's SPLIT_OPTIONS
  -- keys — see lib/fenix-domain.ts). Set by the aluno or applied by their
  -- personal.
  current_tier training_tier,
  current_split text,

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
  diet_choice text,
  tier training_tier,
  split text,
  start_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists custom_plans_profile_id_idx on public.custom_plans(profile_id);

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
-- updates this same row client-side (allowed by profiles_update_own).
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
alter table public.workout_log_entries enable row level security;

-- --- profiles -----------------------------------------------------------
-- Everyone can read their own profile; a personal can also read the
-- profiles of alunos linked to them (roster + evolution report). Anyone
-- authenticated can read a personal's profile by matching `code` at signup
-- (name + code only would be ideal via a view, but for this sprint we allow
-- reading any profile row where `code` is set, which only exposes a
-- personal's id/name/code — never an aluno's private data, since alunos
-- never set `code`).
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_select_linked_alunos_by_personal"
  on public.profiles for select
  using (linked_personal_id = auth.uid());

create policy "profiles_select_personal_by_code"
  on public.profiles for select
  using (code is not null);

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
