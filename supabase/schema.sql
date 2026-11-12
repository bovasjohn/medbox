-- MedMaintain database schema for Supabase.
-- Run this once: Supabase dashboard > SQL Editor > New query > paste > Run.

-- ---------------------------------------------------------------
-- Access control
-- ---------------------------------------------------------------
-- Only the emails listed below can read or write MedMaintain data.
-- This matters if the Supabase project is shared with another site (such as a shop
-- where customers sign in with Google): other signed-in users are blocked.
-- To add a colleague, add their Google email to the list and run this file again.
create or replace function public.is_allowed()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in (
    'bovasjt@gmail.com'
  )
$$;

-- ---------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------
create table if not exists public.organizations (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  contact_person text,
  phone          text,
  email          text,
  address        text,
  notes          text,
  created_at     timestamptz not null default now()
);

create table if not exists public.devices (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references public.organizations (id) on delete restrict,
  brand             text,
  device            text not null,
  model             text,
  installation_date date,
  installed_by      text,
  last_ppm_date     date,
  next_ppm_date     date,
  comments          text,
  created_at        timestamptz not null default now()
);

-- "category" holds Pads, Battery, Other, or any custom type the user adds.
create table if not exists public.accessories (
  id          uuid primary key default gen_random_uuid(),
  device_id   uuid not null references public.devices (id) on delete cascade,
  category    text not null default 'Other',
  name        text not null,
  model       text,
  expiry_date date,
  quantity    integer check (quantity is null or quantity >= 0),
  comments    text,
  created_at  timestamptz not null default now()
);

create table if not exists public.ppm_reports (
  id              uuid primary key default gen_random_uuid(),
  device_id       uuid not null references public.devices (id) on delete restrict,
  inspection_date date not null,
  technician      text not null,
  result          text not null check (result in ('Pass', 'Fail')),
  work_performed  text,
  findings        text,
  recommendations text,
  next_ppm_date   date,
  comments        text,
  created_at      timestamptz not null default now()
);

-- Added in v1.1: battery level, device configuration and alarm check recorded with each PPM.
-- "add column if not exists" makes this safe to run on a database that already has the table.
alter table public.ppm_reports add column if not exists battery_percent integer
  check (battery_percent is null or (battery_percent between 0 and 100));
alter table public.ppm_reports add column if not exists configuration text;
alter table public.ppm_reports add column if not exists alarm_status text
  check (alarm_status is null or alarm_status in ('Working', 'Not working', 'Not tested'));
alter table public.ppm_reports add column if not exists alarm_notes text;

-- Added in v1.2: serial number and warranty on devices; checklist rows and sign-off details on each report.
alter table public.devices add column if not exists serial_number text;
alter table public.devices add column if not exists warranty text;
alter table public.ppm_reports add column if not exists inspection_items jsonb;
alter table public.ppm_reports add column if not exists signoff jsonb;

-- Added in v1.3: short equipment name and manufacturer on devices; the standard checklist ticks on each report.
alter table public.devices add column if not exists short_name text;
alter table public.devices add column if not exists manufacturer text;
alter table public.ppm_reports add column if not exists checklist jsonb;
alter table public.ppm_reports add column if not exists report_title text;

create index if not exists devices_organization_idx on public.devices (organization_id);
create index if not exists devices_next_ppm_idx     on public.devices (next_ppm_date);
create index if not exists accessories_device_idx   on public.accessories (device_id);
create index if not exists accessories_expiry_idx   on public.accessories (expiry_date);
create index if not exists ppm_reports_device_idx   on public.ppm_reports (device_id, inspection_date desc);

-- ---------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------
alter table public.organizations enable row level security;
alter table public.devices       enable row level security;
alter table public.accessories   enable row level security;
alter table public.ppm_reports   enable row level security;

drop policy if exists "team access" on public.organizations;
create policy "team access" on public.organizations
  for all to authenticated using (public.is_allowed()) with check (public.is_allowed());

drop policy if exists "team access" on public.devices;
create policy "team access" on public.devices
  for all to authenticated using (public.is_allowed()) with check (public.is_allowed());

drop policy if exists "team access" on public.accessories;
create policy "team access" on public.accessories
  for all to authenticated using (public.is_allowed()) with check (public.is_allowed());

-- Inspection reports are a permanent history: they can be read and created,
-- but there is deliberately no update or delete policy, so they can never be
-- changed or removed from the app.
drop policy if exists "read reports" on public.ppm_reports;
create policy "read reports" on public.ppm_reports
  for select to authenticated using (public.is_allowed());

drop policy if exists "create reports" on public.ppm_reports;
create policy "create reports" on public.ppm_reports
  for insert to authenticated with check (public.is_allowed());

-- Make the API pick up the new tables straight away.
notify pgrst, 'reload schema';
