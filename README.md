# MedMaintain

Planned Preventive Maintenance (PPM) tracker for medical equipment.
Stack: React + Vite, Tailwind CSS v4, Supabase (Google login + Postgres), Recharts, jsPDF, Vite PWA, Cloudflare Pages.

## Build phases

| Phase | Module | Status |
|-------|--------|--------|
| 1 | Setup, theme, Google login, app shell, navigation, database schema | Done |
| 2 | Organizations | Done |
| 3 | Devices and accessories | Done |
| 4 | PPM inspections (reports viewed on screen) | Done |
| 5 | Dashboard and Statistics | Done |
| 6 | PWA offline handling | Done (read-only offline) |
| 7 | PPM checks (battery %, configuration, alarm) and HTML report with logo and signature | Done (v1.1) |
| 8 | Report in the company format (items table, bullet comments, sign-off blocks) and suggestions while typing | Done (v1.2) |
| 9 | Page 2 (standard tests and calibration), two signature uploads, short name and manufacturer, no browser header/footer when printing | Done (v1.3) |
| - | PDF file generation | Not built; use Print / Save as PDF from the HTML report |

## Upgrading to v1.3 (do this once)

1. Supabase > **SQL Editor**: paste the whole `supabase/schema.sql` and **Run** (safe to repeat; it adds `short_name`, `manufacturer` and `checklist`).
2. Push the code to GitHub so Cloudflare rebuilds.
3. Edit each device: fill **Short name** (e.g. `AED`, used for rows like "AED Battery") and **Manufacturer** (e.g. `ZOLL, USA`).
4. **Settings > Company and report**: upload both signatures (PPM done by / Reviewed & approved by). They are saved per device.

**Two formats: choose Full report or Report only in Perform PPM ("Report format" in Perform PPM; it remembers the device's last choice). It is the checklist: equipment details, the 12 standard tests, and the output-energy calibration
table, followed by the two signature boxes. All tests start as Pass; untick a failed one under **Standard tests** in
Perform PPM. Checked date is the inspection date; due date is the next PPM date.

**Printing without the browser's footer line** (file path, page number): the report sets a zero page margin, so it no longer
appears. If your browser still shows it, untick **Headers and footers** in the print dialog's More settings.

## Upgrading to v1.2 (earlier)

v1.2 adds columns for serial number and warranty (devices) and for the report items and sign-off details (reports).
1. Supabase > **SQL Editor**: paste the whole `supabase/schema.sql` and **Run**. It is safe to run again and keeps your data.
2. Push the new code to GitHub so Cloudflare rebuilds.
3. Open each device, choose **Edit**, and fill in **Serial number** and **Warranty** (the report prints them).

## HTML report (company format)

Every saved PPM report is shown as the company's "INSPECTION REPORT - PPM" page: logo and title, a boxed header
(customer, date, contact, brand, model, serial), installation date and warranty, the items table
(Description, Part No., Status/Expiry, Comments, Replacement), "Comments from service engineer" as bullets, and the
"Inspection/PPM done by" and "Reviewed & approved by" blocks.

- **Perform PPM** fills the items table from the device's accessories (with expiry and a "By Oct 2028" replacement),
  then Configuration, Machine and alarm rows. Edit, add or remove rows. The **Battery level (%)** box fills the battery
  row as "56% remaining". Typing exactly `Pass` in an item's Comments prints it in green.
- **Comments from service engineer**: one point per line; each line becomes a bullet. Optional notes
  (work performed, findings, recommendations) are added as extra lines.
- **Sign-off blocks** are typed per report (the technician changes). Names, titles, mobiles, emails and companies used
  before are offered as suggestions, and picking a known technician fills their details in.
- **Customer / contact** come from the organization (its contact person). **Serial number / warranty** come from the
  device.
- **Open & print** opens the report in a new tab with a Print / Save as PDF button; **Download HTML** saves one file.
- **Logo and signature image** are set under **Settings > Company and report** and saved on the device you use.
  The signature image prints under "Inspection/PPM done by".
- Reports saved in v1.1 still open; their battery, configuration and alarm are shown as table rows.

## Suggestions while typing

Brand, device, model (narrowed to the chosen brand), installed by, warranty, accessory name and model, report item
fields, technician and sign-off details offer the values already used. Pick one or type something new.

## Version and build code

The five-digit **version code** (`"versionCode"` in `package.json`, shown as `00001`) goes up by one with every new
release. It is bumped each time a new zip is delivered; to change it yourself, edit that number.

The version number comes from `"version"` in `package.json` (currently 1.3.0). Change it by hand for a new
release. The build code (`YYYYMMDD.HHMM`, UTC) is stamped automatically every time the app is built, so each
Cloudflare deploy gets its own code, e.g. a build made on 10 Nov 2026 shows `v1.0.0 (build 20261110.0715)`.
It is shown on the login page and under Settings > About.

## Offline behaviour

- The last loaded data is saved on the device, so the app opens and shows it without a connection.
  A banner says you are offline and when the data was last updated.
- Changes cannot be saved offline. Save buttons are disabled and a message says so; whatever you typed stays
  in the form until you reconnect. Nothing is queued silently, so there are no hidden unsaved changes.
- Data refreshes automatically when the connection returns. Signing out clears the saved copy.

## Rules the app follows

- A device is "due soon" or an accessory "expiring soon" within 30 days.
- "PPM up to date" on Statistics is the share of devices that are not overdue and have a next PPM date.
- Saving a PPM report never changes older reports. It sets the device's last and next PPM dates only when the
  inspection is the device's most recent one.

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
  lib/                  supabase client, dates, status rules, stats, small helpers
  context/              AuthContext, ThemeContext, DataContext (loading, saving, offline copy)
  components/layout/    AppShell, Sidebar, Topbar, MobileNav, OfflineBanner, Logo
  components/ui/        Modal, Field, StatCard, badges, ChartCard and other shared pieces
  features/             organizations, devices (+accessories), ppm, charts
  pages/                one file per screen
supabase/schema.sql     tables, indexes and security policies
```
