-- Run this once in the Supabase SQL Editor to add the `pose` and
-- `weight_at_photo` columns to `progress_photos`, backing the new /fotos
-- page. Safe to run even if you already ran the full schema.sql after these
-- columns were added there (uses IF NOT EXISTS throughout).

alter table public.progress_photos
  add column if not exists pose text check (pose in ('frente', 'lado', 'costas')),
  add column if not exists weight_at_photo numeric(6,2);
