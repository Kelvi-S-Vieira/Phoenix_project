-- =============================================================================
-- Adds `profiles.avancado_equipment_filter` — persists the Treino Avançado
-- equipment filter (today only stored inside the `avancado_plans.week` jsonb
-- blob, per-plan) as a profile-level preference too, so it survives a plan
-- reset/recreation instead of starting over from "tudo liberado" every time
-- (Fase 4, 2026-10-04 feedback: "persistir o filtro de equipamento como
-- preferência do perfil, em vez de reiniciar a cada sessão"). Same pattern
-- as `avancado_level` (migration_avancado_level.sql) — a profile-level
-- default that seeds a brand-new plan, while the plan's own
-- `equipmentFilter` stays the live, editable value during normal use.
--
-- Nullable jsonb mirroring the shape of `defaultEquipmentFilter()`'s return
-- (lib/treino-avancado-builder.ts) — `Record<string, boolean>` keyed by
-- EQUIPMENT_TYPES keys. Null means "no saved preference yet", in which case
-- the app falls back to today's behavior (`defaultEquipmentFilter()`, all
-- true).
--
-- Safe to run against an existing project (idempotent `add column if not
-- exists`). Also folded into schema.sql in place so a fresh install gets it
-- directly. No RLS changes needed — it's a new column on the existing
-- `profiles` table, already covered by that table's own policies.
-- =============================================================================

alter table public.profiles
  add column if not exists avancado_equipment_filter jsonb;

-- =============================================================================
-- End of migration.
-- =============================================================================
