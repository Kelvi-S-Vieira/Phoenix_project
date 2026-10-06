-- =============================================================================
-- diary_entries.meal: adiciona 'ceia' aos valores permitidos (Diário → Ceia como
-- refeição própria). Run once in the Supabase SQL Editor. Idempotent (drop +
-- recreate da mesma constraint). Também dobrado em schema.sql.
-- Registros antigos ('extra' etc.) continuam válidos.
-- =============================================================================

alter table public.diary_entries drop constraint if exists diary_entries_meal_check;

alter table public.diary_entries
  add constraint diary_entries_meal_check
  check (meal in ('cafe', 'almoco', 'lanche', 'jantar', 'ceia', 'extra'));

-- =============================================================================
-- End of migration.
-- =============================================================================
