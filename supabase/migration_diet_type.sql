-- =============================================================================
-- Adds `profiles.diet_type` (tipo de dieta: equilibrada, mediterranea, lowcarb,
-- cetogenica, altaproteina, jejum) and `profiles.fasting_window` (janela de
-- alimentação do jejum intermitente, ex. "12:00-20:00").
-- The diet type only changes the P/C/G split of the calorie target; the target
-- itself still comes from computeTargets(). Chosen in onboarding and in /dieta.
-- Idempotent; also folded into schema.sql. No RLS changes (existing table).
-- =============================================================================
alter table public.profiles
  add column if not exists diet_type text
  check (diet_type in ('equilibrada','mediterranea','lowcarb','cetogenica','altaproteina','jejum'));

alter table public.profiles
  add column if not exists fasting_window text;
