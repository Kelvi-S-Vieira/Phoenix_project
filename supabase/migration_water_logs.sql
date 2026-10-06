-- =============================================================================
-- water_logs — consumo de água por dia (Diário → WaterTracker). Antes ficava só
-- no localStorage do aparelho. Uma linha por (profile_id, logged_at); o app faz
-- upsert por essa chave. Run once in the Supabase SQL Editor. Idempotent.
-- Também dobrado em schema.sql.
-- =============================================================================

create table if not exists public.water_logs (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  logged_at date not null,
  ml integer not null default 0 check (ml >= 0),
  updated_at timestamptz not null default now(),
  primary key (profile_id, logged_at)
);

alter table public.water_logs enable row level security;

do $$ begin
  create policy "water_logs_select_own"
    on public.water_logs for select
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "water_logs_select_by_personal"
    on public.water_logs for select
    using (
      exists (
        select 1 from public.profiles p
        where p.id = water_logs.profile_id and p.linked_personal_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "water_logs_insert_own"
    on public.water_logs for insert
    with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "water_logs_update_own"
    on public.water_logs for update
    using (profile_id = auth.uid())
    with check (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "water_logs_delete_own"
    on public.water_logs for delete
    using (profile_id = auth.uid());
exception when duplicate_object then null; end $$;

-- =============================================================================
-- End of migration.
-- =============================================================================
