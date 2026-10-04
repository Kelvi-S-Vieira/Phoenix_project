-- =============================================================================
-- plan_recommendation_picks — records which of the "plano inicial
-- recomendado" suggestions (shown as an extra step inside Montar Plano,
-- when a profile has no linked personal) the user accepted, so the
-- Suplementação and Receitas Fit pages can show a "⭐ Recomendado no seu
-- plano" badge on the matching items. Run once in the Supabase SQL Editor.
-- Idempotent (IF NOT EXISTS / DO blocks throughout). Also folded into
-- schema.sql in place so a fresh install gets this table directly.
--
-- Marmita picks are NOT recorded here — those go straight into the
-- existing user_recipes + meal_prep_plan tables (same mechanism as
-- manually adding a marmita suggestion from app/alimentacao/marmitas),
-- since that already gives them real functional weight (shopping list,
-- weekly plan). This table exists only for the two catalogs that have no
-- per-user table of their own (Supplements, Receitas Fit are pure static
-- reference content — see lib/supplements.ts, lib/supplement-recipes.ts).
--
-- `kind` + `ref_name` identify the picked item by its catalog name (both
-- catalogs have unique `name` fields) rather than a foreign key, since
-- neither catalog is a database table.
-- =============================================================================

create table if not exists public.plan_recommendation_picks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('supplement', 'receita_fit')),
  ref_name text not null,
  created_at timestamptz not null default now()
);

create index if not exists plan_recommendation_picks_profile_id_idx
  on public.plan_recommendation_picks(profile_id);

alter table public.plan_recommendation_picks enable row level security;

do $$ begin
  create policy "plan_recommendation_picks_select_own"
    on public.plan_recommendation_picks for select
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "plan_recommendation_picks_select_by_personal"
    on public.plan_recommendation_picks for select
    using (
      exists (
        select 1 from public.profiles p
        where p.id = plan_recommendation_picks.profile_id and p.linked_personal_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "plan_recommendation_picks_insert_own"
    on public.plan_recommendation_picks for insert
    with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "plan_recommendation_picks_delete_own"
    on public.plan_recommendation_picks for delete
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

-- =============================================================================
-- End of migration.
-- =============================================================================
