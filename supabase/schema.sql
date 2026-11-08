-- MedMaintain database schema for Supabase.
-- Run this once: Supabase dashboard > SQL Editor > New query > paste > Run.

-- ---------------------------------------------------------------
-- Access control
-- ---------------------------------------------------------------
-- By default any signed-in Google user can use the app.
-- To limit access to specific people, replace the function body with the
-- allowlist line below (and delete the default line).
create or replace function public.is_allowed()
returns boolean
language sql
stable
as $$
  select auth.uid() is not null
  -- select (auth.jwt() ->> 'email') in ('you@company.com', 'colleague@company.com')
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

create policy "team access" on public.organizations
  for all to authenticated using (public.is_allowed()) with check (public.is_allowed());

create policy "team access" on public.devices
  for all to authenticated using (public.is_allowed()) with check (public.is_allowed());

create policy "team access" on public.accessories
  for all to authenticated using (public.is_allowed()) with check (public.is_allowed());

-- Inspection reports are a permanent history: they can be read and created,
-- but there is deliberately no update or delete policy, so they can never be
-- changed or removed from the app.
create policy "read reports" on public.ppm_reports
  for select to authenticated using (public.is_allowed());

create policy "create reports" on public.ppm_reports
  for insert to authenticated with check (public.is_allowed());
