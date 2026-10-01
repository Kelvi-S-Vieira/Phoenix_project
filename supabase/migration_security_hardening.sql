-- =============================================================================
-- Security hardening migration — run once in the Supabase SQL Editor.
-- Safe to run against an existing project (uses IF EXISTS / OR REPLACE /
-- idempotent DO blocks throughout). Also folded into schema.sql in place so
-- a fresh install gets the fixed version directly.
--
-- Fixes, per security audit:
--   1. profiles_select_personal_by_code exposed a personal's entire profile
--      row to any authenticated user. Replaced with a column-limited view
--      (public.personal_lookup) used for invite-code lookup, and the
--      original over-broad SELECT policy is dropped.
--   2. profiles_update_own had no column restrictions — an aluno could set
--      their own role or linked_personal_id directly. A BEFORE UPDATE
--      trigger now blocks self-updates to those two columns; linking is
--      only possible through the new redeem_invite_code()/
--      complete_oauth_profile() SECURITY DEFINER RPCs.
--   3. profiles_update_linked_aluno_by_personal let a personal change ANY
--      column on a linked aluno's row. The same trigger now reverts every
--      column except current_tier/current_split when a personal is the one
--      updating.
--   4. workout_log_entries had no DELETE policy.
--   5/6. Invite-code validation + a "link later" screen are implemented in
--      the app (app/signup, app/complete-profile,
--      app/perfil/vincular-personal) using personal_lookup / the RPCs below.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Restricted view for invite-code lookup, replacing the open
--    "code is not null" SELECT policy on profiles.
-- -----------------------------------------------------------------------------
drop policy if exists "profiles_select_personal_by_code" on public.profiles;

-- security_invoker = false (the default) is intentional here: this view is
-- owned by a privileged role and so is evaluated with that role's
-- privileges against `profiles` (bypassing `profiles`' own RLS), while only
-- ever exposing the three columns below to whoever it's granted to. This is
-- what makes it safe to grant to `authenticated` even though `profiles`
-- itself must stay locked down.
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
-- 2 & 3. BEFORE UPDATE trigger enforcing column-level restrictions that RLS
--    policies alone can't express (comparing OLD vs NEW across columns).
-- -----------------------------------------------------------------------------
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
  -- Set (and cleared) only by redeem_invite_code() / complete_oauth_profile()
  -- below, for the one UPDATE they each perform. Any other path — including
  -- a raw client .update() — is treated as untrusted.
  if is_trusted then
    return new;
  end if;

  -- No auth context (service role, the handle_new_user trigger's own
  -- insert-time upsert, etc.) — nothing to restrict.
  if acting_uid is null then
    return new;
  end if;

  if acting_uid = new.id then
    -- Self-update: role and linked_personal_id can never be changed
    -- directly by the row owner, full stop. Linking happens only via
    -- redeem_invite_code() (aluno already signed up) or
    -- complete_oauth_profile() (first-time role selection after Google
    -- OAuth signup).
    if new.role is distinct from old.role then
      new.role := old.role;
    end if;
    if new.linked_personal_id is distinct from old.linked_personal_id then
      new.linked_personal_id := old.linked_personal_id;
    end if;
  elsif old.linked_personal_id = acting_uid then
    -- A personal updating a linked aluno's row (profiles_update_linked_
    -- aluno_by_personal policy): only current_tier/current_split may
    -- actually change. Revert everything else back to its old value
    -- rather than rejecting the whole statement, so a well-behaved client
    -- that only ever sends {current_tier, current_split} (as
    -- ApplyTemplate.tsx does) is unaffected.
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

-- -----------------------------------------------------------------------------
-- RPCs: the only two paths allowed to set role / linked_personal_id.
-- Both are SECURITY DEFINER (so they can look up `profiles.code` across
-- rows despite RLS) and both flip the `fenix.trusted_profile_update`
-- session flag around their own UPDATE so the trigger above lets it through.
-- -----------------------------------------------------------------------------

-- Used by the new /perfil/vincular-personal screen for an aluno (already
-- signed up, possibly with no personal yet, or who wants to change it) to
-- redeem an invite code. Also safe to reuse for "link later" at any time.
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
-- Only allowed once per account — the handle_new_user trigger already fills
-- role for the email/password signup form, so this is purely the OAuth
-- (role IS NULL) completion path, never a way to re-pick role later.
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

-- -----------------------------------------------------------------------------
-- 4. Missing DELETE policy on workout_log_entries.
-- -----------------------------------------------------------------------------
do $$ begin
  create policy "workout_log_entries_delete_own"
    on public.workout_log_entries for delete
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

-- =============================================================================
-- End of migration.
-- =============================================================================
