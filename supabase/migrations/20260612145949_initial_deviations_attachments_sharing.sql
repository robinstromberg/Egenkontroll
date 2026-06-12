create table public.deviations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  control_run_id uuid not null references public.control_runs(id) on delete cascade,
  control_run_item_id uuid references public.control_run_items(id) on delete cascade,
  control_type_id uuid references public.control_types(id) on delete set null,
  control_object_id uuid references public.control_objects(id) on delete set null,
  status text not null default 'open',
  severity text not null default 'medium',
  description text not null,
  action_text text not null,
  follow_up_comment text,
  opened_by uuid references auth.users(id) on delete set null,
  resolved_by uuid references auth.users(id) on delete set null,
  opened_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint deviations_status_check check (status in ('open', 'resolved')),
  constraint deviations_severity_check check (severity in ('low', 'medium', 'high'))
);

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  control_run_id uuid references public.control_runs(id) on delete cascade,
  control_run_item_id uuid references public.control_run_items(id) on delete cascade,
  deviation_id uuid references public.deviations(id) on delete set null,
  storage_bucket text not null default 'control-attachments',
  storage_path text not null,
  file_name text,
  content_type text,
  size_bytes integer check (size_bytes is null or size_bytes >= 0),
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.share_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  token_hash text not null unique,
  created_by uuid references auth.users(id) on delete set null,
  valid_from timestamptz not null default now(),
  valid_until timestamptz not null,
  period_start date not null,
  period_end date not null,
  included_control_type_ids uuid[] not null default '{}',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.export_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  share_link_id uuid references public.share_links(id) on delete set null,
  export_type text not null,
  requested_by uuid references auth.users(id) on delete set null,
  filters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint export_logs_type_check check (export_type in ('pdf', 'csv'))
);
