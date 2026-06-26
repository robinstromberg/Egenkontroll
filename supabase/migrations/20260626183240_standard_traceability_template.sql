with traceability_template as (
  select jsonb_build_object(
    'fields', jsonb_build_array(
      jsonb_build_object('field_key', 'product', 'label', 'Produkt', 'field_type', 'text', 'required', true),
      jsonb_build_object('field_key', 'supplier', 'label', 'Leverantör', 'field_type', 'select', 'required', false),
      jsonb_build_object('field_key', 'delivery_date', 'label', 'Leveransdatum', 'field_type', 'date', 'required', false),
      jsonb_build_object('field_key', 'document_reference', 'label', 'Dokumentnummer / följesedel', 'field_type', 'text', 'required', false),
      jsonb_build_object('field_key', 'batch_number', 'label', 'Batch / lot', 'field_type', 'text', 'required', true),
      jsonb_build_object('field_key', 'best_before', 'label', 'Bäst före / sista förbrukningsdag', 'field_type', 'date', 'required', false),
      jsonb_build_object('field_key', 'used_in_product', 'label', 'Använt i / vidare till', 'field_type', 'text', 'required', false),
      jsonb_build_object('field_key', 'delivered_to', 'label', 'Kund / mottagare', 'field_type', 'text', 'required', false),
      jsonb_build_object('field_key', 'label_photo', 'label', 'Foto / etikett', 'field_type', 'photo', 'required', false)
    )
  ) as template_schema
)
update public.control_templates template
set
  description = 'Dokumentera ett steg bakåt och framåt: produkt, leverantör, batch, datum, dokument och etikettbild.',
  template_schema = traceability_template.template_schema,
  active = true
from traceability_template
where template.locale = 'sv-SE'
  and template.category = 'traceability'
  and lower(template.name) = lower('Spårbarhet');

with traceability_template as (
  select jsonb_build_object(
    'fields', jsonb_build_array(
      jsonb_build_object('field_key', 'product', 'label', 'Produkt', 'field_type', 'text', 'required', true),
      jsonb_build_object('field_key', 'supplier', 'label', 'Leverantör', 'field_type', 'select', 'required', false),
      jsonb_build_object('field_key', 'delivery_date', 'label', 'Leveransdatum', 'field_type', 'date', 'required', false),
      jsonb_build_object('field_key', 'document_reference', 'label', 'Dokumentnummer / följesedel', 'field_type', 'text', 'required', false),
      jsonb_build_object('field_key', 'batch_number', 'label', 'Batch / lot', 'field_type', 'text', 'required', true),
      jsonb_build_object('field_key', 'best_before', 'label', 'Bäst före / sista förbrukningsdag', 'field_type', 'date', 'required', false),
      jsonb_build_object('field_key', 'used_in_product', 'label', 'Använt i / vidare till', 'field_type', 'text', 'required', false),
      jsonb_build_object('field_key', 'delivered_to', 'label', 'Kund / mottagare', 'field_type', 'text', 'required', false),
      jsonb_build_object('field_key', 'label_photo', 'label', 'Foto / etikett', 'field_type', 'photo', 'required', false)
    )
  ) as template_schema
)
insert into public.control_templates (name, description, category, default_frequency, template_schema, locale, active)
select
  'Spårbarhet',
  'Dokumentera ett steg bakåt och framåt: produkt, leverantör, batch, datum, dokument och etikettbild.',
  'traceability',
  'daily',
  traceability_template.template_schema,
  'sv-SE',
  true
from traceability_template
where not exists (
  select 1
  from public.control_templates template
  where template.locale = 'sv-SE'
    and template.category = 'traceability'
    and lower(template.name) = lower('Spårbarhet')
);

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
  normalized_name text := lower(p_name);
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
        ('best_before_date', 'Bäst före', 'date', false, 1),
        ('photo', 'Foto', 'photo', false, 2),
        ('comment', 'Kommentar / åtgärd', 'textarea', false, 3)
    ) as fields(field_key, label, field_type, required, sort_order)
    where p_category = 'checklist' and normalized_name like '%datummärk%'

    union all

    select *
    from (
      values
        ('status', 'Status', 'ok_not_ok', true, 0),
        ('comment', 'Kommentar / åtgärd', 'textarea', false, 1)
    ) as fields(field_key, label, field_type, required, sort_order)
    where p_category = 'checklist' and normalized_name not like '%datummärk%'

    union all

    select *
    from (
      values
        ('supplier', 'Leverantör', 'select', true, 0),
        ('product', 'Produkt / varugrupp', 'text', true, 1),
        ('delivery_temperature', 'Leveranstemperatur', 'temperature', false, 2),
        ('status', 'Status', 'ok_not_ok', true, 3),
        ('delivery_note_photo', 'Foto / följesedel', 'photo', false, 4),
        ('comment', 'Kommentar / åtgärd', 'textarea', false, 5)
    ) as fields(field_key, label, field_type, required, sort_order)
    where p_category = 'receiving'

    union all

    select *
    from (
      values
        ('product', 'Produkt', 'text', true, 0),
        ('supplier', 'Leverantör', 'select', false, 1),
        ('delivery_date', 'Leveransdatum', 'date', false, 2),
        ('document_reference', 'Dokumentnummer / följesedel', 'text', false, 3),
        ('batch_number', 'Batch / lot', 'text', true, 4),
        ('best_before', 'Bäst före / sista förbrukningsdag', 'date', false, 5),
        ('used_in_product', 'Använt i / vidare till', 'text', false, 6),
        ('delivered_to', 'Kund / mottagare', 'text', false, 7),
        ('label_photo', 'Foto / etikett', 'photo', false, 8)
    ) as fields(field_key, label, field_type, required, sort_order)
    where p_category = 'traceability'

    union all

    select *
    from (
      values
        ('status', 'Status', 'ok_not_ok', true, 0),
        ('photo', 'Foto', 'photo', false, 1),
        ('comment', 'Kommentar / åtgärd', 'textarea', false, 2)
    ) as fields(field_key, label, field_type, required, sort_order)
    where p_category = 'round'

    union all

    select *
    from (
      values
        ('status', 'Status', 'ok_not_ok', true, 0),
        ('comment', 'Kommentar / åtgärd', 'textarea', false, 1)
    ) as fields(field_key, label, field_type, required, sort_order)
    where p_category = 'custom' or p_category not in ('temperature', 'checklist', 'receiving', 'traceability', 'round')
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
  'Creates a control type and its default field definitions in one transaction while relying on caller RLS policies.';

with standard_fields(control_name, category, field_key, label, field_type, required, sort_order) as (
  values
    ('Spårbarhet', 'traceability', 'product', 'Produkt', 'text', true, 0),
    ('Spårbarhet', 'traceability', 'supplier', 'Leverantör', 'select', false, 1),
    ('Spårbarhet', 'traceability', 'delivery_date', 'Leveransdatum', 'date', false, 2),
    ('Spårbarhet', 'traceability', 'document_reference', 'Dokumentnummer / följesedel', 'text', false, 3),
    ('Spårbarhet', 'traceability', 'batch_number', 'Batch / lot', 'text', true, 4),
    ('Spårbarhet', 'traceability', 'best_before', 'Bäst före / sista förbrukningsdag', 'date', false, 5),
    ('Spårbarhet', 'traceability', 'used_in_product', 'Använt i / vidare till', 'text', false, 6),
    ('Spårbarhet', 'traceability', 'delivered_to', 'Kund / mottagare', 'text', false, 7),
    ('Spårbarhet', 'traceability', 'label_photo', 'Foto / etikett', 'photo', false, 8)
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
  standard_fields.field_key,
  standard_fields.label,
  standard_fields.field_type,
  standard_fields.required,
  '{}'::jsonb,
  '[]'::jsonb,
  standard_fields.sort_order,
  true
from public.control_types control_type
join standard_fields
  on lower(control_type.name) = lower(standard_fields.control_name)
  and control_type.category = standard_fields.category
where not exists (
  select 1
  from public.control_field_definitions field
  where field.control_type_id = control_type.id
    and field.field_key = standard_fields.field_key
);

with standard_fields(control_name, category, field_key, label, field_type, required, sort_order) as (
  values
    ('Spårbarhet', 'traceability', 'product', 'Produkt', 'text', true, 0),
    ('Spårbarhet', 'traceability', 'supplier', 'Leverantör', 'select', false, 1),
    ('Spårbarhet', 'traceability', 'delivery_date', 'Leveransdatum', 'date', false, 2),
    ('Spårbarhet', 'traceability', 'document_reference', 'Dokumentnummer / följesedel', 'text', false, 3),
    ('Spårbarhet', 'traceability', 'batch_number', 'Batch / lot', 'text', true, 4),
    ('Spårbarhet', 'traceability', 'best_before', 'Bäst före / sista förbrukningsdag', 'date', false, 5),
    ('Spårbarhet', 'traceability', 'used_in_product', 'Använt i / vidare till', 'text', false, 6),
    ('Spårbarhet', 'traceability', 'delivered_to', 'Kund / mottagare', 'text', false, 7),
    ('Spårbarhet', 'traceability', 'label_photo', 'Foto / etikett', 'photo', false, 8)
)
update public.control_field_definitions field
set
  label = standard_fields.label,
  field_type = standard_fields.field_type,
  required = standard_fields.required,
  sort_order = standard_fields.sort_order,
  active = true
from public.control_types control_type
join standard_fields
  on lower(control_type.name) = lower(standard_fields.control_name)
  and control_type.category = standard_fields.category
where field.control_type_id = control_type.id
  and field.field_key = standard_fields.field_key;
