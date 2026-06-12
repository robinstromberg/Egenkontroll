create table public.control_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  control_type_id uuid not null references public.control_types(id) on delete restrict,
  status text not null default 'completed',
  performed_by uuid references auth.users(id) on delete set null,
  performed_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint control_runs_status_check check (status in ('draft', 'completed', 'completed_with_deviation'))
);

create table public.control_run_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  control_run_id uuid not null references public.control_runs(id) on delete cascade,
  control_object_id uuid references public.control_objects(id) on delete set null,
  field_definition_id uuid references public.control_field_definitions(id) on delete set null,
  object_snapshot jsonb not null default '{}'::jsonb,
  field_snapshot jsonb not null default '{}'::jsonb,
  value_text text,
  value_number numeric,
  value_boolean boolean,
  value_date date,
  value_json jsonb not null default '{}'::jsonb,
  status text not null default 'ok',
  deviation_detected boolean not null default false,
  deviation_reason text,
  action_text text,
  created_at timestamptz not null default now(),
  constraint control_run_items_status_check check (status in ('ok', 'deviation', 'not_applicable'))
);
