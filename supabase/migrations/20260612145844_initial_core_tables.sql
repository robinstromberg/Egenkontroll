create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  org_number text,
  country_code text not null default 'SE',
  timezone text not null default 'Europe/Stockholm',
  default_locale text not null default 'sv-SE',
  subscription_status text not null default 'inactive' check (subscription_status in ('inactive', 'trial', 'active', 'past_due', 'cancelled')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'staff')),
  status text not null default 'active' check (status in ('active', 'invited', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.control_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null check (category in ('temperature', 'checklist', 'receiving', 'traceability', 'round', 'custom')),
  default_frequency text not null check (default_frequency in ('daily', 'weekly', 'per_delivery', 'custom')),
  template_schema jsonb not null default '{}'::jsonb,
  locale text not null default 'sv-SE',
  active boolean not null default true,
  created_at timestamptz not null default now()
);
