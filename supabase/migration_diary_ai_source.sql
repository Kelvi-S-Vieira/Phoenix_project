-- =============================================================================
-- diary_entries.source: add 'ai_photo' and 'ai_text' to the allowed values,
-- for entries created via the new AI-estimated flows (Diário → "Foto (IA)"
-- and "Descrever (IA)", see app/api/diario/estimar/route.ts and
-- app/diario/AddFood.tsx). Run once in the Supabase SQL Editor. Idempotent
-- (drop + recreate the same constraint is safe to re-run). Also folded into
-- schema.sql in place so a fresh install gets this directly.
--
-- Existing values 'db' (picked from FOOD_DB) and 'manual' (typed in by
-- hand) are untouched.
-- =============================================================================

alter table public.diary_entries drop constraint if exists diary_entries_source_check;

alter table public.diary_entries
  add constraint diary_entries_source_check
  check (source in ('db', 'manual', 'ai_photo', 'ai_text'));

-- =============================================================================
-- End of migration.
-- =============================================================================
