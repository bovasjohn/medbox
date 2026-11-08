# MedMaintain

Planned Preventive Maintenance (PPM) tracker for medical equipment.
Stack: React + Vite, Tailwind CSS v4, Supabase (Google login + Postgres), Recharts, jsPDF, Vite PWA, Cloudflare Pages.

## Build phases

| Phase | Module | Status |
|-------|--------|--------|
| 1 | Setup, theme, Google login, app shell, navigation, database schema | Done |
| 2 | Organizations | Next |
| 3 | Devices and accessories | |
| 4 | PPM inspections and PDF reports | |
| 5 | Dashboard and Statistics | |
| 6 | PWA offline handling and deployment polish | |

## 1. Supabase setup (one time)

Menu names may differ slightly from what is written here.

**Create the project and database**
1. Go to supabase.com, sign in, click **New project**, choose a name, a database password and the nearest region.
2. When it is ready, open **SQL Editor > New query**, paste all of `supabase/schema.sql`, and click **Run**.
3. Open **Project Settings > API**. Copy the **Project URL** and the **anon public** key.

**Enable Google login**
1. Go to console.cloud.google.com, create or choose a project.
2. **APIs & Services > OAuth consent screen**: choose External, enter an app name and your email, save.
3. **APIs & Services > Credentials > Create credentials > OAuth client ID > Web application**.
   Under **Authorized redirect URIs** add `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
   (the exact address is shown on Supabase's Google provider page). Create it and copy the Client ID and Secret.
4. In Supabase: **Authentication > Sign In / Providers > Google**. Enable it, paste the Client ID and Secret, save.
5. **Authentication > URL Configuration**: set **Site URL** to `http://localhost:5173` for now and add
   `http://localhost:5173/**` under **Redirect URLs**.

By default any Google user who signs in can read and write data. To limit it to specific people,
use the email allowlist shown inside `supabase/schema.sql` (edit the `is_allowed` function and run it again).

## 2. Run locally

Requires Node 20 or newer.

```bash
npm install
cp .env.example .env.local      # then fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

Open http://localhost:5173 and sign in with Google.

## 3. Deploy to Cloudflare Pages

**Direct upload (no GitHub)**
1. Make sure `.env.local` is filled in, then run `npm run build`. This creates a `dist` folder.
2. Cloudflare dashboard > **Workers & Pages > Create > Pages > Upload assets**. Upload the contents of `dist`
   (not the project folder). Repeat the build and upload after every code change.

**Or connect a GitHub repo**: build command `npm run build`, output directory `dist`, and add
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and `NODE_VERSION=22` as variables.

**After the first deploy** (required, or Google login will fail on the live site):
1. Supabase > **Authentication > URL Configuration**: set **Site URL** to your `https://yourproject.pages.dev`
   address and add `https://yourproject.pages.dev/**` under **Redirect URLs**. Keep the localhost entry.

Cloudflare Pages serves `index.html` for unknown paths automatically, so refreshing `/devices` works.

## PWA icons

`public/icon.svg` is the source icon. The PNG icons used by the manifest live in `public/`.

## Project structure

```
src/
  App.jsx               routes
  nav.js                navigation items (sidebar, mobile bar)
  lib/supabase.js       Supabase client
  context/              AuthContext, ThemeContext
  components/layout/    AppShell, Sidebar, Topbar, MobileNav, Logo
  components/ui/        PageHeader, Spinner, PlaceholderPage
  pages/                one file per screen
supabase/schema.sql     tables, indexes and security policies
```
