# Migration checklist — fenix-web vs. projeto_fenix_app_final.html

Checklist derived from a full module-by-module audit comparing the
prototype against this port. Update a box to `[x]` only when it's actually
shipped (code merged, build/lint clean) — not when it's merely planned.

## Product decisions (made 2026-10-01)

- **Modo Jovem**: out of scope, will not be built (LGPD — the prototype's
  youth mode addresses minors directly).
- **Guia**: build a generic version only — none of the owner's personal
  clinical data.
- **Plano 17 semanas**: keep visible to all users, but generalized —
  computed from each user's own plan (start date, duration, targets), not
  hardcoded dates or gated by name. Unified with Montar Plano's engine.

## Done

- [x] Treino: week-wide log loading (was today-only)
- [x] Measurements no longer count toward streak
- [x] All "today"/weekday calculations use America/Sao_Paulo (was server UTC)
- [x] Avançado calisthenics reorganized by movement pattern (empurrar/puxar/pernas/core)
- [x] RLS hardening (personal_lookup view, self-update column locking, invite-code RPCs, workout_log_entries DELETE policy)
- [x] Post-signup "enter invite code" screen
- [x] Avançado builder base: sections 0-4, multi-group days, anatomical portions, equipment/level filters, rest timer
- [x] Avançado tabs — Musculação/Calistenia/Cardio/Aquecimento (full fidelity)
- [x] Avançado tabs — HIIT/Tabata/HYROX/CrossFit/Esportes (generic entry form only — see Item 6)
- [x] Left sidebar nav with icons (replacing per-page TopBar)
- [x] CSS/typography parity pass across every existing page (fonts, cards, auth screens, forms)
- [x] Dashboard: flame gauge, Cargas, Cardio semanal, Composição corporal, Metas da fase, Conta & dados (PDF print + JSON backup export)
- [x] Treino Básico/Intermediário: exact prototype structure/copy (intro cards, section wording)
- [x] Fotos: drag-slider compare + client-side image resize before upload
- [x] Profile editing (reopen onboarding any time, recalculates targets)
- [x] kg/lb toggle (sidebar + every weight display)
- [x] Accent color picker (sidebar + login/signup)
- [x] Onboarding: pace-suggestion cards, end-date hint, risk feedback (step 4); protein/kg, pace card, formula breakdown (step 5)
- [x] Diário (food diary): day nav, 4 macro cards, meal tabs, food search (204 items) + manual entry

## Still open, in build order

### 4. Alimentação — Marmitas, Suplementação, Receitas Fit ✅ done
- [x] Marmitas: 145 suggested recipes (category + fast/vegan filters)
- [x] Marmitas: user's own recipes (create/edit, JSON export; import skipped — doesn't map cleanly onto a real DB, per established project judgment)
- [x] Marmitas: weekly meal-prep planning
- [x] Marmitas: shopping list (extras have a real checked column; aggregated-ingredient checks are session-only)
- [x] Suplementação: 79 supplement cards (prototype actually has 79, not 77 — tag filters, goal-based default, medical disclaimer). Dropped the prototype's fabricated brand/product-photo content.
- [x] Receitas Fit: 53 recipes (goal/macros/supplements/steps)
- [x] New tables: `user_recipes`, `meal_prep_plan`, `shopping_extras`

### 5. Montar Plano + Calendário ✅ done
- [x] Montar Plano setup (weeks/diet/level/split) — `app/montar-plano/PlanSetupForm.tsx`
- [x] Week-by-week generation engine — `lib/plan-generation.ts` (shared by Montar Plano + Plano17)
- [x] Montar Plano progress view (edit/delete, one active plan per user — enforced app-side) — `app/montar-plano/page.tsx` + `PlanActions.tsx`
- [x] Plano 17 semanas generalized, reading from the same engine, gated on "has an active plan" instead of account name — `app/plano17/page.tsx`
- [x] Calendário: own per-day log (status + note), plan-sized (or rolling 84-day) grid, milestone markers — no hardcoded user data — `app/calendario/page.tsx` + `CalendarGrid.tsx`
- [x] New table: `calendar_days`; `custom_plans` extended (`updated_at`, diet check constraint); `profiles.calendar_start_date` added — `supabase/migration_plano.sql`

### 6. Avançado — finish the custom builder
- [ ] Curated HIIT pool (own exercises, not the generic form)
- [ ] Curated Tabata pool
- [ ] Curated HYROX pool
- [ ] Curated CrossFit pool
- [ ] Training-log history keyed by day-independent `exerciseKey()`
- [ ] 1RM calculation (Epley formula)
- [ ] Personal-record (PR) tracking
- [ ] Automatic progression suggestions
- [ ] Deload warnings
- [ ] Exercise swap
- [ ] New table: `exercise_set_logs`

### 7. Terceira Idade, Guia, Backup polish
- [ ] Terceira Idade: 3 session types (mobilidade/equilíbrio/fortalecimento)
- [ ] Terceira Idade: own weekly completion tracking (doesn't feed main streak)
- [ ] New table: `senior_sessions`
- [ ] Guia: generic reference content (per product decision above)
- [ ] Backup/PDF: already has a basic version (Dashboard) — revisit only if more is wanted

---

## Original Sprint 3–5 plan (superseded, kept for history)

This sprint (Phase 2) proved the architecture end-to-end with a deliberately
small vertical slice: auth (email/password + Google), the aluno onboarding
wizard, the aluno dashboard (weight + streak + chat preview), and the
personal's roster + per-aluno evolution report + chat. Sprint 3 (training
tiers, Medidas, Fotos, templates, streak/badges) and Sprint 4's kg/lb +
color picker + Diário are now folded into the checklist above as done.
