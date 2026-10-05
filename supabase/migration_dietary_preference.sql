-- =============================================================================
-- Adds `profiles.dietary_preference` — lets a profile flag a vegetarian/
-- vegan diet, so supplement recommendations can swap in a plant-based
-- protein pick instead of whey (Fase 4, 2026-10-04 feedback: "diversificar
-- suplemento por preferência alimentar (vegano/vegetariano)"). Asked once
-- in onboarding (app/onboarding/OnboardingWizard.tsx), read by
-- lib/supplements.ts's pickRecommendedSupplements().
--
-- Nullable — null/missing means "no preference stated", which keeps
-- today's whey-based picks (same as if the question is skipped).
--
-- Safe to run against an existing project (idempotent `add column if not
-- exists`). Also folded into schema.sql in place so a fresh install gets it
-- directly. No RLS changes needed — it's a new column on the existing
-- `profiles` table, already covered by that table's own policies.
-- =============================================================================

alter table public.profiles
  add column if not exists dietary_preference text
  check (dietary_preference in ('onivoro', 'vegetariano', 'vegano'));

-- =============================================================================
-- End of migration.
-- =============================================================================
