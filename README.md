# Projeto Fênix — Web (Phase 2)

This is the real web app version of **Projeto Fênix**, migrated from a
single static HTML prototype (`projeto_fenix_app_final.html` — the original
file lives outside this project and is kept only as design/content
reference) into a proper **Next.js + Supabase** application with real
accounts, a real database, and Row Level Security instead of
`localStorage`.

This sprint (Phase 2, first vertical slice) proves the whole architecture
end-to-end — real auth, a real database with security rules, and a working
aluno + personal flow — for a deliberately smaller set of screens than the
full prototype. Everything not yet ported is listed with priorities in
[`MIGRATION_PLAN.md`](./MIGRATION_PLAN.md).

## What's here vs. the original prototype

| Prototype (HTML/localStorage) | This app |
| --- | --- |
| Fake accounts stored in the browser | Real Supabase Auth (email/password + Google) |
| "Simulated Google signup" | Real Google OAuth |
| No password reset | Real "esqueci minha senha" email flow |
| All data in `localStorage`, per-browser | Real Postgres database, synced across devices |
| No real access control | Row Level Security — an aluno only ever sees their own data; a personal only sees their own linked alunos |

## Prerequisites

- **Node.js 20 or newer** (`node -v` to check).
- A free **Supabase** account and project — [supabase.com](https://supabase.com).
- A **Vercel** account for deployment — [vercel.com](https://vercel.com) (free tier is fine).
- (Optional, for Google login) A **Google Cloud** account to create an OAuth client.

You do not need to know SQL or backend development to follow these steps —
just copy/paste.

## 1. Create your Supabase project

1. Go to [supabase.com](https://supabase.com), sign in, and click **New project**.
2. Pick any name (e.g. "fenix"), set a database password (save it somewhere
   safe — you probably won't need it again, but keep it), pick a region
   close to your users, and create the project. Wait ~2 minutes for it to
   provision.

## 2. Run the database schema

1. In your new project's dashboard, open **SQL Editor** (left sidebar) →
   **New query**.
2. Open `supabase/schema.sql` from this project, copy the **entire file**,
   paste it into the SQL editor, and click **Run**.
3. You should see "Success. No rows returned". This created every table,
   security rule, and the trigger that auto-creates a profile for each new
   user.
4. Create the Storage bucket for progress photos (not pure SQL — buckets are
   created from the dashboard): go to **Storage** (left sidebar) → **New
   bucket** → name it exactly `progress-photos` → toggle it **Private** →
   **Create bucket**. (The schema you just ran already added the bucket's
   access policies; a future sprint will build the upload UI — see
   `MIGRATION_PLAN.md`.)

## 3. Get your API keys

1. In the dashboard, go to **Project Settings** (gear icon) → **API**.
2. You'll need two values from this page: **Project URL** and the **anon
   public** key under "Project API keys".

## 4. Configure this project locally

1. In this folder, copy the example env file:
   ```
   cp .env.local.example .env.local
   ```
2. Open `.env.local` and paste in the two values from step 3:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
   Leave `SUPABASE_SERVICE_ROLE_KEY` alone for now — nothing in this sprint
   needs it.
3. Install dependencies:
   ```
   npm install
   ```
4. Run the dev server:
   ```
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000). You should land on
   the login page. Click **Criar conta** to sign up as either an *aluno* or
   a *personal* and try the app.

## 5. (Optional but recommended) Enable Google login

Real Google OAuth needs a Google Cloud OAuth client — this is a one-time
manual setup that can't be done from code:

1. Go to [Google Cloud Console](https://console.cloud.google.com/) →
   create a project (or use an existing one) → **APIs & Services** →
   **Credentials** → **Create credentials** → **OAuth client ID**.
2. Application type: **Web application**.
3. Under **Authorized redirect URIs**, add the callback URL Supabase gives
   you — you'll find the exact URL in the next step, on the Supabase
   Google provider page (it looks like
   `https://<your-project-ref>.supabase.co/auth/v1/callback`).
4. Create the client, then copy the **Client ID** and **Client secret** it
   gives you.
5. Back in your Supabase dashboard: **Authentication** → **Providers** →
   find **Google** → toggle it on → paste in the Client ID and Client
   secret → **Save**.
6. That's it — the "Continuar com Google" buttons on `/login` and `/signup`
   will now work, both locally and once deployed.

Until you do this, the Google buttons will show an error when clicked —
email/password signup and login work regardless.

## 6. Deploy to Vercel

1. Push this project to a GitHub repository (create one on GitHub, then
   from this folder: `git init` if not already, `git add .`,
   `git commit -m "Initial commit"`, `git remote add origin <your-repo-url>`,
   `git push -u origin main`).
2. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** →
   import your GitHub repo.
3. Before deploying, expand **Environment Variables** and add the same two
   (or three) variables from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (only if/when a future sprint needs it)
4. Click **Deploy**. Vercel builds and gives you a live URL
   (`your-project.vercel.app`).
5. If you enabled Google login, go back to your Google Cloud OAuth client
   and add your live Vercel URL's callback as an additional authorized
   redirect URI if Google is strict about it (Supabase's own callback URL
   from step 5 above is normally all that's needed, since Supabase — not
   Vercel — handles the OAuth redirect).

Every time you push to your GitHub repo's main branch, Vercel automatically
redeploys.

## Project structure

```
app/
  login/, signup/, forgot-password/, complete-profile/   — auth screens
  auth/callback/          — OAuth + email-link redirect handler
  auth/reset-password/    — "set new password" screen
  onboarding/             — aluno 5-step profile wizard
  dashboard/              — aluno home (weight, streak, chart, chat preview)
  personal/               — personal's aluno roster
  personal/[alunoId]/     — one aluno's evolution report + chat
components/               — shared client components (TopBar, WeightChart, ChatThread)
lib/
  supabase/               — browser/server/middleware Supabase clients
  fenix-domain.ts         — ported constants (tiers, splits, goals, calorie formula)
  database.types.ts       — hand-written types matching supabase/schema.sql
  streak.ts               — streak calculation
supabase/schema.sql        — full database schema, RLS policies, triggers
middleware.ts              — protects routes, refreshes the auth session
MIGRATION_PLAN.md          — what's not built yet, and suggested sprint order
```

## Important: this hasn't been tested against a live Supabase project yet

This sprint was built without Supabase credentials available in the build
environment, so **nothing here has been run end-to-end against a real
database**. The code is written to be correct by inspection — every query
matches `supabase/schema.sql`'s table/column names, and `npm run build` /
`tsc --noEmit` both pass — but the very first real test is you, following
the setup steps above with your own Supabase project. If something doesn't
work, the most likely causes are: the schema wasn't fully run, the bucket
wasn't created, or an env var was mistyped.
