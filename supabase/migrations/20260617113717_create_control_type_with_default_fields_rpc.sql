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
        ('status', 'Status', 'ok_not_ok', true, 0),
        ('temperature', 'Temperatur', 'temperature', false, 1),
        ('comment', 'Kommentar', 'textarea', false, 2)
    ) as fields(field_key, label, field_type, required, sort_order)
    where p_category = 'receiving'

    union all

    select *
    from (
      values
        ('batch_label', 'Batch / märkning', 'text', false, 0),
        ('best_before_date', 'Bäst före / datum', 'date', false, 1),
        ('photo', 'Foto', 'photo', false, 2),
        ('comment', 'Kommentar', 'textarea', false, 3)
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
