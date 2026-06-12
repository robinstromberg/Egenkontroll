-- Initial schema for Egenkontroll.
-- Focus: multi-tenant SaaS foundation, configurable controls, history, deviations,
-- attachments and read-only sharing.

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

create table public.control_types (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  template_id uuid references public.control_templates(id) on delete set null,
  name text not null,
  description text,
  category text not null default 'custom' check (category in ('temperature', 'checklist', 'receiving', 'traceability', 'round', 'custom')),
  frequency text not null default 'daily' check (frequency in ('daily', 'weekly', 'per_delivery', 'custom')),
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

create table public.control_field_definitions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  control_type_id uuid not null references public.control_types(id) on delete cascade,
  key text not null,
  label text not null,
  field_type text not null check (field_type in ('text', 'textarea', 'number', 'temperature', 'boolean', 'ok_not_ok', 'date', 'datetime', 'photo', 'select')),
  required boolean not null default false,
  deviation_rule jsonb not null default '{}'::jsonb,
  options jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (control_type_id, key)
);

create table public.control_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  control_type_id uuid not null references public.control_types(id) on delete restrict,
  status text not null default 'completed' check (status in ('draft', 'completed', 'completed_with_deviation')),
  performed_by uuid references auth.users(id) on delete set null,
  performed_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
  status text not null default 'ok' check (status in ('ok', 'deviation', 'not_applicable')),
  deviation_detected boolean not null default false,
  deviation_reason text,
  action_text text,
  created_at timestamptz not null default now()
);

create table public.deviations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  control_run_id uuid not null references public.control_runs(id) on delete cascade,
  control_run_item_id uuid references public.control_run_items(id) on delete cascade,
  control_type_id uuid references public.control_types(id) on delete set null,
  control_object_id uuid references public.control_objects(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high')),
  description text not null,
  action_text text not null,
  follow_up_comment text,
  opened_by uuid references auth.users(id) on delete set null,
  resolved_by uuid references auth.users(id) on delete set null,
  opened_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'open' and resolved_at is null) or (status = 'resolved'))
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
  status text not null default 'active' check (status in ('active', 'revoked', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (valid_until > valid_from),
  check (period_end >= period_start)
);

create table public.export_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  share_link_id uuid references public.share_links(id) on delete set null,
  export_type text not null check (export_type in ('pdf', 'csv')),
  requested_by uuid references auth.users(id) on delete set null,
  filters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index organizations_created_by_idx on public.organizations(created_by);
create index organization_memberships_user_idx on public.organization_memberships(user_id);
create index organization_memberships_org_idx on public.organization_memberships(organization_id);
create index control_types_org_idx on public.control_types(organization_id);
create index control_objects_type_idx on public.control_objects(control_type_id);
create index control_fields_type_idx on public.control_field_definitions(control_type_id);
create index control_runs_org_performed_at_idx on public.control_runs(organization_id, performed_at desc);
create index control_runs_type_idx on public.control_runs(control_type_id);
create index control_run_items_run_idx on public.control_run_items(control_run_id);
create index deviations_org_status_idx on public.deviations(organization_id, status);
create index deviations_run_idx on public.deviations(control_run_id);
create index attachments_run_idx on public.attachments(control_run_id);
create index share_links_org_idx on public.share_links(organization_id);
create index export_logs_org_idx on public.export_logs(organization_id);

create trigger set_organizations_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_organization_memberships_updated_at
before update on public.organization_memberships
for each row execute function public.set_updated_at();

create trigger set_control_types_updated_at
before update on public.control_types
for each row execute function public.set_updated_at();

create trigger set_control_objects_updated_at
before update on public.control_objects
for each row execute function public.set_updated_at();

create trigger set_control_field_definitions_updated_at
before update on public.control_field_definitions
for each row execute function public.set_updated_at();

create trigger set_control_runs_updated_at
before update on public.control_runs
for each row execute function public.set_updated_at();

create trigger set_deviations_updated_at
before update on public.deviations
for each row execute function public.set_updated_at();

create trigger set_share_links_updated_at
before update on public.share_links
for each row execute function public.set_updated_at();

create or replace function public.is_org_member(target_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = target_organization_id
      and membership.user_id = auth.uid()
      and membership.status = 'active'
  );
$$;

create or replace function public.is_org_admin(target_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = target_organization_id
      and membership.user_id = auth.uid()
      and membership.status = 'active'
      and membership.role in ('owner', 'admin')
  );
$$;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.control_templates enable row level security;
alter table public.control_types enable row level security;
alter table public.control_objects enable row level security;
alter table public.control_field_definitions enable row level security;
alter table public.control_runs enable row level security;
alter table public.control_run_items enable row level security;
alter table public.deviations enable row level security;
alter table public.attachments enable row level security;
alter table public.share_links enable row level security;
alter table public.export_logs enable row level security;

create policy "Authenticated users can create organizations"
on public.organizations
for insert
to authenticated
with check (created_by = auth.uid());

create policy "Organization members can read organizations"
on public.organizations
for select
to authenticated
using (public.is_org_member(id));

create policy "Organization admins can update organizations"
on public.organizations
for update
to authenticated
using (public.is_org_admin(id))
with check (public.is_org_admin(id));

create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Members can read memberships in their organization"
on public.organization_memberships
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Users can create the first owner membership"
on public.organization_memberships
for insert
to authenticated
with check (
  user_id = auth.uid()
  and role = 'owner'
  and status = 'active'
  and not exists (
    select 1
    from public.organization_memberships existing_membership
    where existing_membership.organization_id = organization_id
  )
);

create policy "Organization admins can manage memberships"
on public.organization_memberships
for all
to authenticated
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

create policy "Authenticated users can read active templates"
on public.control_templates
for select
to authenticated
using (active = true);

create policy "Members can read control types"
on public.control_types
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Admins can manage control types"
on public.control_types
for all
to authenticated
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

create policy "Members can read control objects"
on public.control_objects
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Admins can manage control objects"
on public.control_objects
for all
to authenticated
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

create policy "Members can read control fields"
on public.control_field_definitions
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Admins can manage control fields"
on public.control_field_definitions
for all
to authenticated
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

create policy "Members can read control runs"
on public.control_runs
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Members can create control runs"
on public.control_runs
for insert
to authenticated
with check (public.is_org_member(organization_id) and performed_by = auth.uid());

create policy "Members can update their draft control runs"
on public.control_runs
for update
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "Members can read control run items"
on public.control_run_items
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Members can create control run items"
on public.control_run_items
for insert
to authenticated
with check (public.is_org_member(organization_id));

create policy "Members can read deviations"
on public.deviations
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Members can create deviations"
on public.deviations
for insert
to authenticated
with check (public.is_org_member(organization_id) and opened_by = auth.uid());

create policy "Members can update deviations"
on public.deviations
for update
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "Members can read attachments"
on public.attachments
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Members can create attachments"
on public.attachments
for insert
to authenticated
with check (public.is_org_member(organization_id) and uploaded_by = auth.uid());

create policy "Admins can read share links"
on public.share_links
for select
to authenticated
using (public.is_org_admin(organization_id));

create policy "Admins can manage share links"
on public.share_links
for all
to authenticated
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

create policy "Members can read export logs"
on public.export_logs
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "Members can create export logs"
on public.export_logs
for insert
to authenticated
with check (public.is_org_member(organization_id));

insert into public.control_templates (name, description, category, default_frequency, template_schema, locale)
values
  (
    'Kyltemperaturer',
    'Daglig kontroll av kylar och frysar med gränsvärden.',
    'temperature',
    'daily',
    '{"objects":[{"name":"Kyl 1 – Kök","object_type":"kyl","limit_max":8,"unit":"°C"},{"name":"Kyl 2 – Servering","object_type":"kyl","limit_max":8,"unit":"°C"},{"name":"Frys 1 – Lager","object_type":"frys","limit_max":-18,"unit":"°C"}],"fields":[{"key":"temperature","label":"Temperatur","field_type":"temperature","required":true}]}'::jsonb,
    'sv-SE'
  ),
  (
    'Städning',
    'Daglig checklista för städområden.',
    'checklist',
    'daily',
    '{"objects":[{"name":"Kök"},{"name":"Servering"},{"name":"Toaletter"},{"name":"Förråd"}],"fields":[{"key":"status","label":"Status","field_type":"ok_not_ok","required":true},{"key":"comment","label":"Kommentar","field_type":"textarea","required":false}]}'::jsonb,
    'sv-SE'
  ),
  (
    'Datummärkning',
    'Daglig kontroll av märkning och datum på produkter.',
    'checklist',
    'daily',
    '{"objects":[{"name":"Mjölk"},{"name":"Grädde"},{"name":"Yoghurt"},{"name":"Färdigmat"}],"fields":[{"key":"status","label":"Status","field_type":"ok_not_ok","required":true},{"key":"comment","label":"Kommentar","field_type":"textarea","required":false}]}'::jsonb,
    'sv-SE'
  ),
  (
    'Varumottagning',
    'Kontroll vid leverans av varor.',
    'receiving',
    'per_delivery',
    '{"fields":[{"key":"supplier","label":"Leverantör","field_type":"text","required":true},{"key":"delivery_temperature","label":"Leveranstemperatur","field_type":"temperature","required":false},{"key":"labeling_ok","label":"Korrekt märkning","field_type":"boolean","required":true},{"key":"delivery_note_photo","label":"Följesedel","field_type":"photo","required":false}]}'::jsonb,
    'sv-SE'
  ),
  (
    'Spårbarhet',
    'Dokumentera produkt, batch, bäst före, leverantör och etikettbilder.',
    'traceability',
    'daily',
    '{"fields":[{"key":"product","label":"Produkt","field_type":"text","required":true},{"key":"batch_number","label":"Batchnummer","field_type":"text","required":true},{"key":"best_before","label":"Bäst före","field_type":"date","required":false},{"key":"supplier","label":"Leverantör","field_type":"text","required":false},{"key":"label_photo","label":"Etikett","field_type":"photo","required":false}]}'::jsonb,
    'sv-SE'
  ),
  (
    'Egenkontrollrunda',
    'Veckovis översyn av hygien, skadedjur, kemikalier och ordning.',
    'round',
    'weekly',
    '{"objects":[{"name":"Hygien & rengöring"},{"name":"Skadedjur"},{"name":"Kemikalier & förvaring"},{"name":"Allmän ordning"}],"fields":[{"key":"status","label":"Status","field_type":"ok_not_ok","required":true},{"key":"comment","label":"Kommentar","field_type":"textarea","required":false}]}'::jsonb,
    'sv-SE'
  );
