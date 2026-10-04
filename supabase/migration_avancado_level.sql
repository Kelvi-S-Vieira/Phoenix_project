-- =============================================================================
-- Adds `profiles.avancado_level` — the user's training-level ("iniciante" /
-- "intermediario" / "avancado" / "idoso", see TRAINING_LEVELS in
-- lib/treino-avancado-builder.ts) decided ONCE at cadastro (TierPicker.tsx,
-- when the "Treino Avançado" card is picked) instead of being a live filter
-- box inside AvancadoBuilder (Fase 4, 2026-10-04 feedback). Distinct from
-- `current_tier` (treino-basico/intermediario/avancado/terceira-idade) —
-- this is the exercise-difficulty filter WITHIN the Avançado tier only.
--
-- Safe to run against an existing project (idempotent `add column if not
-- exists`). Also folded into schema.sql in place so a fresh install gets it
-- directly. No RLS changes needed — it's just a new column on the existing
-- `profiles` table, already covered by that table's own policies.
-- =============================================================================

alter table public.profiles
  add column if not exists avancado_level text;

-- =============================================================================
-- End of migration.
-- =============================================================================
