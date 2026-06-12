create table public.control_types (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  template_id uuid references public.control_templates(id) on delete set null,
  name text not null,
  description text,
  category text not null default 'custom',
  frequency text not null default 'daily',
  frequency_config jsonb not null default '{}'::jsonb,
  instructions text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.control_objects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  control_type_id uuid not null references public.control_types(id) on delete cascade,
  name text not null,
  location text,
  object_type text,
  instructions text,
  limit_min numeric,
  limit_max numeric,
  unit text,
  metadata jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
