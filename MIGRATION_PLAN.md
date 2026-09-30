# Migration plan — everything not yet ported

This sprint (Phase 2) proved the architecture end-to-end with a deliberately
small vertical slice: auth (email/password + Google), the aluno onboarding
wizard, the aluno dashboard (weight + streak + chat preview), and the
personal's roster + per-aluno evolution report + chat. Everything below is
still on `localStorage`/static HTML only, in `projeto_fenix_app_final.html`,
and needs to be rebuilt against the Supabase schema already in place
(`supabase/schema.sql` already has tables for most of it).

Grouped into three suggested sprints, in the order a real user would likely
miss these features (weight tracking already works; workout content and
day-to-day logging are probably next, then flexibility/reporting/polish).

## Sprint 3 — Training & body tracking (highest priority)

The current slice lets an aluno see their tier/split if a personal assigned
one, but there's no UI to actually browse a workout or log measurements —
this is the core daily-use loop of the product.

- **3 training tiers with full exercise database + GIF thumbnails**
  (Básico/Intermediário/Avançado, each with its splits from `SPLIT_OPTIONS`).
  Trickiest part: the prototype's exercise data (sets/reps/GIFs per
  exercise, per split, per day) lives in separate files
  (`treino_basico_fenix.html`, `treino_intermediario_fenix.html`,
  `treino_avancado_fenix.html`) that haven't been inventoried yet — this
  needs its own data model (an `exercises`/`workout_days` table isn't in
  `schema.sql` yet) before UI work starts.
- **Medidas (body measurements)** — form + evolution chart, backed by the
  already-existing `measurements` table. Trickiest part: none, really — this
  is the most straightforward port on this whole list, good first task.
- **Fotos de evolução (progress photos)** — the `progress-photos` Storage
  bucket and its RLS policies already exist in `schema.sql`. Trickiest part:
  needs real upload UI (drag/drop or file picker) plus generating signed
  URLs to display private bucket images, replacing the prototype's
  localStorage base64 approach entirely.
- **Workout templates UI** — personals already have a `workout_templates`
  table; needs a "save this tier+split as a template" form and an "apply
  template to aluno" action from the roster page. Trickiest part: the
  "apply" action needs to write to another user's `profiles` row, which the
  `profiles_update_linked_aluno_by_personal` RLS policy in `schema.sql`
  already allows — just needs the UI.
- **Streak UI polish + badges UI** — the streak number already shows on the
  dashboard; the prototype's flame-fill animation and the badges row
  (`badges_unlocked` table already exists) still need building. Trickiest
  part: porting the badge-unlock rule set (first measurement, 30-day streak,
  etc.) as server-side logic rather than trusting the client.

## Sprint 4 — Daily logging & flexibility

- **Diário (food diary)** — kcal/protein/carb/fat tracking against daily
  targets, with a food database search + manual entry. Trickiest part: the
  prototype's food database (name → kcal/macros per 100g) isn't in
  `schema.sql` yet; needs a `foods` reference table plus a `diary_entries`
  table, neither of which exist today, before any UI.
- **Marmitas / Suplementação / Receitas** — meal-prep and recipe reference
  content. Trickiest part: mostly static content + maybe a saved/favorited
  list per user — low schema risk, but needs the content itself inventoried
  from the prototype.
- **Montar Plano (custom plan builder)** — the `custom_plans` table already
  exists in `schema.sql`. Trickiest part: the prototype's week-by-week plan
  generation logic (diet + tier + split combined into a multi-week
  schedule) needs to be re-read from the prototype's `plano17` module and
  ported as either a server action or a Postgres function.
- **kg/lb toggle** — a per-user display preference (store kg internally,
  convert for display, same as the prototype does). Trickiest part: only
  really needs consistent application at every place a weight is rendered
  or entered — mechanical but easy to miss a spot.
- **Accent color picker UI** — `globals.css` already has the three accent
  themes (`ember`/`aco`/`verde`) ready via `html[data-accent]`; needs a
  settings UI to set it and persist the choice (the prototype uses
  localStorage for this, which is fine to keep as-is — it's a pure display
  preference, not shared data).

## Sprint 5 — Reporting, backup, and the specialized modes

- **Calendário** — a calendar view over workout days / diary entries /
  measurements. Trickiest part: mostly a read-only aggregation view once
  Sprints 3–4's tables exist; low risk.
- **Terceira Idade / Jovem modes** — the prototype's age-adapted variants
  (different copy, exercise selections, safety notes). Trickiest part:
  deciding whether these become a `profiles.age_mode` flag that swaps
  content, or fully separate onboarding branches — needs a product decision
  before engineering starts.
- **PDF export** — exporting a progress report as PDF. Trickiest part: needs
  a PDF-generation approach that works well in a serverless environment
  (e.g. a headless-browser-based renderer via an API route, or a
  client-side PDF library) — pick one before committing to an approach.
- **Backup/restore** — the prototype's "export/import all your data as a
  file" feature made sense for localStorage; with a real database this
  mostly becomes unnecessary (data already lives server-side and
  survives across devices), but a "download my data" export could still be
  offered for peace of mind / portability. Trickiest part: deciding scope —
  this is more of a product question than an engineering one now.
