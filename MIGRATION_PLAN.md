# Migration plan — current state & remaining work

Superseded the original Sprint 3–5 plan below (kept at the bottom for
history) after a full module-by-module audit comparing the prototype
(`projeto_fenix_app_final.html`) against this port found the original plan
was wrong or incomplete on several points: it undercounted how much of
Treino/Medidas/Fotos had already shipped, didn't mention Guia, Ficha
manual, Intermediário's cardio tab, the Dashboard's Cargas/Cardio cards, or
the full Avançado custom builder+log, wrongly described Calendário as
read-only, wrongly implied Montar Plano already had week-generation logic
(it doesn't, in either app), and wrongly suggested a `foods` DB table (the
food list is static reference data, not user data, so it belongs in a TS
module like the exercise pools, not a table).

## Product decisions (made 2026-10-01)

- **Modo Jovem: out of scope, will not be built.** The prototype's youth
  mode addresses minors directly ("conte pra um responsável"), which raised
  an LGPD concern for a real multi-user product. Dropped entirely — no
  `age_mode` flag, no youth content, no onboarding branch for it.
- **Guia: build a generic version only.** The prototype's 9-section
  reference guide hardcodes the owner's personal lab values, medication,
  and calorie numbers. The ported version must contain none of that —
  general fitness/nutrition reference content only, safe to show any user.
- **Plano 17 semanas: keep visible, but generalize it.** The prototype
  gates this to accounts whose name matches the owner (`/kelvin/i`) and
  hardcodes a fixed start date (2026-08-30) and fixed per-week targets
  tied to the owner's own numbers. The port must NOT gate by name and must
  NOT hardcode dates/targets: each week's row is computed from the user's
  own plan (start date = when they set the plan up, duration = the number
  of weeks they chose, targets = derived from their own goal/weight the
  same way the rest of the app derives calorie/pace targets). In effect
  this becomes the week-by-week schedule view *for* whatever a user builds
  in Montar Plano, rather than a separate owner-only feature — one engine,
  not two parallel plan systems.

## Status after the 2026-09-30 audit + 2026-10-01 bug/security fixes

Already fixed (see git log): Treino's week-wide log loading (was
today-only), measurements no longer counts toward streak, all "today"/
weekday calculations now use America/Sao_Paulo instead of server UTC,
Avançado calisthenics reorganized by movement pattern (empurrar/puxar/
pernas/core) instead of muscle group, RLS hardening (personal_lookup view,
self-update column locking via trigger, `redeem_invite_code`/
`complete_oauth_profile` RPCs, workout_log_entries DELETE policy), and a
post-signup "enter invite code" screen.

Still open, in the audit's suggested order:

### 1. Navigation shell, profile editing, kg/lb toggle, color picker
Shared layout/sidebar instead of per-page hand-copied TopBar nav; a way to
re-open and edit the profile/onboarding answers after they're set; the
kg/lb display-preference toggle; the accent color picker UI (CSS variables
already exist in `globals.css`, just needs a settings control that writes
`localStorage.fenix_login_accent` — note the prototype's real key name,
not `fenix_accent`).

### 2. Diário (food diary)
Day nav, 4 macro summary cards vs. targets, 5 meal slots, food search
against a static 204-item TS data module (not a DB table) + manual entry.
Needs `profiles.timeframe_weeks`/`carb_target`/`fat_target` columns (the
app already calculates these during onboarding but currently discards
them) and a new `diary_entries` table.

### 3. Dashboard + Treino gaps
Missing Dashboard cards: Cargas (lift tracking), Cardio (weekly toggle
grid), Composição corporal, Metas da fase, Conta & dados. Treino gaps: rest
timer (already built, never wired up), Intermediário's 3rd "Cardio" tab per
day, manual Ficha manual sheet (free-form per-weekday rows, not in the old
plan at all). New tables: `lifts`, a weekly cardio table, `cardio_entries`,
`manual_workout_days`.

### 4. Alimentação: Marmitas, Suplementação, Receitas Fit
Mostly static content (77 supplements, 53 recipes, 145 meal-prep
suggestions) plus user-owned recipes/shopping list. New tables:
`user_recipes`, `shopping_extras`, `shopping_checked`.

### 5. Montar Plano + Calendário (now one system, see decision above)
Montar Plano setup (weeks/diet/level/split) generates the week-by-week
schedule that both the Montar Plano progress view and the generalized
Plano 17 view read from — build the generation logic once. Calendário is
its own per-day log (status + note) over a 12-week grid with milestone
markers — not read-only, and must not hardcode any user's own data. New
tables: `calendar_days`; enforce one active plan per user.

### 6. Avançado custom builder (largest single item)
Full free-form day/exercise builder, training-log history with 1RM (Epley)
/PR tracking/auto progression/deload warnings, equipment/level filters,
exercise swap, warmup/HIIT/Tabata/HYROX/CrossFit tabs, global rest timer.
Needs its own `exercise_set_logs` table keyed without the day (the existing
`workout_log_entries` unique constraint can't hold multiple dated entries
per exercise — already flagged in code comments in
`lib/treino-shared-types.ts`).

### 7. Terceira Idade, PDF export, backup
Terceira Idade (3 session types, own weekly completion tracking, doesn't
feed the main streak) — new `senior_sessions` table. PDF export via
`window.print()` + a hidden summary block, no library needed. Backup:
server-side "baixar meus dados" JSON export; skip import.

---

## Original Sprint 3–5 plan (superseded, kept for history)

This sprint (Phase 2) proved the architecture end-to-end with a deliberately
small vertical slice: auth (email/password + Google), the aluno onboarding
wizard, the aluno dashboard (weight + streak + chat preview), and the
personal's roster + per-aluno evolution report + chat.

### Sprint 3 — Training & body tracking (done)
3 training tiers with full exercise database, Medidas, Fotos de evolução,
workout templates UI, streak UI + badges UI. All shipped, though the audit
found additional gaps within each (see sections above) beyond this
original description.

### Sprint 4 — Daily logging & flexibility (not started, see section 2 above)
Diário, Marmitas/Suplementação/Receitas, Montar Plano, kg/lb toggle, accent
color picker.

### Sprint 5 — Reporting, backup, and the specialized modes
Calendário, PDF export, backup/restore — still open, see sections 5 and 7
above. "Terceira Idade / Jovem modes" from the original plan is now just
Terceira Idade — Jovem was dropped per the 2026-10-01 product decision
above.
