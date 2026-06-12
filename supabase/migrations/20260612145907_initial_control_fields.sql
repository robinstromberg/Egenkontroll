create table public.control_field_definitions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  control_type_id uuid not null references public.control_types(id) on delete cascade,
  field_key text not null,
  label text not null,
  field_type text not null,
  required boolean not null default false,
  deviation_rule jsonb not null default '{}'::jsonb,
  options jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (control_type_id, field_key),
  constraint control_field_type_check check (field_type in ('text', 'textarea', 'number', 'temperature', 'boolean', 'ok_not_ok', 'date', 'datetime', 'photo', 'select'))
);
