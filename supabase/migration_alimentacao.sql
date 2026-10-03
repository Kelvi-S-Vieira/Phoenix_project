-- =============================================================================
-- Alimentação feature: Marmitas (meal-prep) user tables. Run once in the
-- Supabase SQL Editor. Safe to run against an existing project (uses
-- IF NOT EXISTS / idempotent DO blocks throughout). Also folded into
-- schema.sql in place so a fresh install gets these directly.
--
-- Ported from the prototype's localStorage-backed Marmitas module
-- (projeto_fenix_app_final.html, #page-marmitas markup ~lines 4419-4466,
-- logic ~lines 12935-15172) into real per-user tables.
--
-- Suplementação (SUPPLEMENTS) and Receitas Fit (SUPPLEMENT_RECIPES), like
-- the Marmitas suggestion catalog (SUGGESTED_RECIPES), are pure reference
-- content with no per-user state, so they stay static TS data
-- (lib/supplements.ts, lib/supplement-recipes.ts, lib/marmita-suggestions.ts)
-- and need no tables here — matching this project's established pattern for
-- exercise pools and the Diário's FOOD_DB.
-- =============================================================================

-- A user's own meal-prep recipes (seeded from the prototype's small
-- `defaultRecipes` list on first visit if the user has zero rows yet — see
-- app/alimentacao/marmitas/page.tsx, same check-then-insert pattern as
-- the Dashboard's default lifts in migration_dashboard_lifts_cardio.sql).
-- `ingredients` is a jsonb array of {name, qty, unit}: variable-length and
-- never queried into, so jsonb is appropriate here (unlike diary_entries'
-- flat columns, which ARE queried/aggregated by the app).
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

alter table public.user_recipes enable row level security;

do $$ begin
  create policy "user_recipes_select_own"
    on public.user_recipes for select
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "user_recipes_select_by_personal"
    on public.user_recipes for select
    using (
      exists (
        select 1 from public.profiles p
        where p.id = user_recipes.profile_id and p.linked_personal_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "user_recipes_insert_own"
    on public.user_recipes for insert
    with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "user_recipes_update_own"
    on public.user_recipes for update
    using (profile_id = auth.uid())
    with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "user_recipes_delete_own"
    on public.user_recipes for delete
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

-- One row per (user, recipe) with a nonzero desired marmita count for the
-- week — the prototype's `plan` object ({recipeId: desiredMarmitas}).
-- Simplest to upsert/delete rows as counts change rather than keep
-- zero-count rows around (see app/alimentacao/marmitas/PlanTab.tsx).
create table if not exists public.meal_prep_plan (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  user_recipe_id uuid not null references public.user_recipes(id) on delete cascade,
  desired_count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (profile_id, user_recipe_id)
);

alter table public.meal_prep_plan enable row level security;

do $$ begin
  create policy "meal_prep_plan_select_own"
    on public.meal_prep_plan for select
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "meal_prep_plan_select_by_personal"
    on public.meal_prep_plan for select
    using (
      exists (
        select 1 from public.profiles p
        where p.id = meal_prep_plan.profile_id and p.linked_personal_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "meal_prep_plan_insert_own"
    on public.meal_prep_plan for insert
    with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "meal_prep_plan_update_own"
    on public.meal_prep_plan for update
    using (profile_id = auth.uid())
    with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "meal_prep_plan_delete_own"
    on public.meal_prep_plan for delete
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

-- Free-form shopping-list items ("Outros itens") — the prototype's `extras`
-- list ([{id, name}]), now with a per-item `checked` state persisted
-- (the prototype kept check state in a separate `fenix_shopping_checked`
-- localStorage map keyed by item; here it's just a column).
create table if not exists public.shopping_extras (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  checked boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists shopping_extras_profile_id_idx
  on public.shopping_extras(profile_id);

alter table public.shopping_extras enable row level security;

do $$ begin
  create policy "shopping_extras_select_own"
    on public.shopping_extras for select
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "shopping_extras_insert_own"
    on public.shopping_extras for insert
    with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "shopping_extras_update_own"
    on public.shopping_extras for update
    using (profile_id = auth.uid())
    with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "shopping_extras_delete_own"
    on public.shopping_extras for delete
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

-- =============================================================================
-- End of migration.
-- =============================================================================
