create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint suppliers_name_not_blank check (length(trim(name)) > 0),
  constraint suppliers_org_name_unique unique (organization_id, name)
);

create index suppliers_org_active_name_idx on public.suppliers(organization_id, active, name);
create index suppliers_created_by_idx on public.suppliers(created_by);

create trigger set_suppliers_updated_at
before update on public.suppliers
for each row execute function public.set_updated_at();

alter table public.suppliers enable row level security;

create policy "members can read suppliers"
on public.suppliers
for select
to authenticated
using (private.is_org_member(organization_id));

create policy "admins can create suppliers"
on public.suppliers
for insert
to authenticated
with check (
  private.is_org_admin(organization_id)
  and created_by = (select auth.uid())
);

create policy "admins can update suppliers"
on public.suppliers
for update
to authenticated
using (private.is_org_admin(organization_id))
with check (private.is_org_admin(organization_id));

create policy "admins can delete suppliers"
on public.suppliers
for delete
to authenticated
using (private.is_org_admin(organization_id));

drop function if exists public.create_control_type_with_default_fields(uuid, text, text, text, text, text, uuid);

create or replace function public.create_control_type_with_default_fields(
  p_organization_id uuid,
  p_name text,
  p_description text,
  p_category text,
  p_frequency text,
  p_instructions text,
  p_created_by uuid
)
returns public.control_types
language plpgsql
set search_path = public
as $function$
declare
  new_control_type public.control_types;
begin
  if p_created_by is distinct from (select auth.uid()) then
    raise exception 'created_by must match the current user' using errcode = '42501';
  end if;

  insert into public.control_types (
    organization_id,
    name,
    description,
    category,
    frequency,
    instructions,
    created_by,
    active
  )
  values (
    p_organization_id,
    p_name,
    p_description,
    p_category,
    p_frequency,
    p_instructions,
    p_created_by,
    true
  )
  returning * into new_control_type;

  with default_fields(field_key, label, field_type, required, sort_order) as (
    select *
    from (
      values
        ('temperature', 'Temperatur', 'temperature', true, 0)
    ) as fields(field_key, label, field_type, required, sort_order)
    where p_category = 'temperature'

    union all

    select *
    from (
      values
        ('status', 'Status', 'ok_not_ok', true, 0),
        ('comment', 'Kommentar', 'textarea', false, 1)
    ) as fields(field_key, label, field_type, required, sort_order)
    where p_category in ('checklist', 'round', 'custom') or p_category not in ('temperature', 'receiving', 'traceability')

    union all

    select *
    from (
      values
        ('supplier', 'Leverantör', 'select', false, 0),
        ('status', 'Status', 'ok_not_ok', true, 1),
        ('temperature', 'Temperatur', 'temperature', false, 2),
        ('comment', 'Kommentar', 'textarea', false, 3)
    ) as fields(field_key, label, field_type, required, sort_order)
    where p_category = 'receiving'

    union all

    select *
    from (
      values
        ('supplier', 'Leverantör', 'select', false, 0),
        ('batch_label', 'Batch / märkning', 'text', false, 1),
        ('best_before_date', 'Bäst före / datum', 'date', false, 2),
        ('photo', 'Foto', 'photo', false, 3),
        ('comment', 'Kommentar', 'textarea', false, 4)
    ) as fields(field_key, label, field_type, required, sort_order)
    where p_category = 'traceability'
  )
  insert into public.control_field_definitions (
    organization_id,
    control_type_id,
    field_key,
    label,
    field_type,
    required,
    deviation_rule,
    options,
    sort_order,
    active
  )
  select
    new_control_type.organization_id,
    new_control_type.id,
    field_key,
    label,
    field_type,
    required,
    '{}'::jsonb,
    '[]'::jsonb,
    sort_order,
    true
  from default_fields
  on conflict (control_type_id, field_key) do nothing;

  return new_control_type;
end;
$function$;

revoke execute on function public.create_control_type_with_default_fields(uuid, text, text, text, text, text, uuid) from public;
revoke execute on function public.create_control_type_with_default_fields(uuid, text, text, text, text, text, uuid) from anon;
grant execute on function public.create_control_type_with_default_fields(uuid, text, text, text, text, text, uuid) to authenticated;

comment on function public.create_control_type_with_default_fields(uuid, text, text, text, text, text, uuid) is
  'Creates a control type and its MVP default field definitions in one transaction while relying on caller RLS policies.';

with supplier_control_types as (
  select id, organization_id, category
  from public.control_types
  where category in ('receiving', 'traceability')
)
insert into public.control_field_definitions (
  organization_id,
  control_type_id,
  field_key,
  label,
  field_type,
  required,
  deviation_rule,
  options,
  sort_order,
  active
)
select
  control_type.organization_id,
  control_type.id,
  'supplier',
  'Leverantör',
  'select',
  false,
  '{}'::jsonb,
  '[]'::jsonb,
  0,
  true
from supplier_control_types control_type
where not exists (
  select 1
  from public.control_field_definitions field
  where field.control_type_id = control_type.id
    and field.field_key = 'supplier'
);

update public.control_field_definitions field
set sort_order = field.sort_order + 1
where exists (
  select 1
  from public.control_types control_type
  where control_type.id = field.control_type_id
    and control_type.category in ('receiving', 'traceability')
)
and field.field_key <> 'supplier';
