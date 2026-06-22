with core_templates(name, description, category, default_frequency, template_schema) as (
  values
    (
      'Kyltemperaturer',
      'Daglig kontroll av kylar och frysar med gränsvärden.',
      'temperature',
      'daily',
      jsonb_build_object(
        'objects', jsonb_build_array(
          jsonb_build_object('name', 'Kyl 1 - Kök', 'object_type', 'kyl', 'limit_max', 8, 'unit', '°C'),
          jsonb_build_object('name', 'Kyl 2 - Servering', 'object_type', 'kyl', 'limit_max', 8, 'unit', '°C'),
          jsonb_build_object('name', 'Frys 1 - Lager', 'object_type', 'frys', 'limit_max', -18, 'unit', '°C')
        ),
        'fields', jsonb_build_array(
          jsonb_build_object('field_key', 'temperature', 'label', 'Temperatur', 'field_type', 'temperature', 'required', true)
        )
      )
    ),
    (
      'Städning',
      'Daglig checklista för städning och rengöring.',
      'checklist',
      'daily',
      jsonb_build_object(
        'objects', jsonb_build_array(
          jsonb_build_object('name', 'Kök', 'object_type', 'cleaning_area'),
          jsonb_build_object('name', 'Servering', 'object_type', 'cleaning_area'),
          jsonb_build_object('name', 'Toaletter', 'object_type', 'cleaning_area'),
          jsonb_build_object('name', 'Förråd', 'object_type', 'cleaning_area')
        ),
        'fields', jsonb_build_array(
          jsonb_build_object('field_key', 'status', 'label', 'Status', 'field_type', 'ok_not_ok', 'required', true),
          jsonb_build_object('field_key', 'comment', 'label', 'Kommentar / åtgärd', 'field_type', 'textarea', 'required', false)
        )
      )
    ),
    (
      'Datummärkning',
      'Daglig kontroll av märkning, datum och produktgrupper.',
      'checklist',
      'daily',
      jsonb_build_object(
        'objects', jsonb_build_array(
          jsonb_build_object('name', 'Mjölk', 'object_type', 'date_label_group'),
          jsonb_build_object('name', 'Grädde', 'object_type', 'date_label_group'),
          jsonb_build_object('name', 'Yoghurt', 'object_type', 'date_label_group'),
          jsonb_build_object('name', 'Färdigmat', 'object_type', 'date_label_group')
        ),
        'fields', jsonb_build_array(
          jsonb_build_object('field_key', 'status', 'label', 'Status', 'field_type', 'ok_not_ok', 'required', true),
          jsonb_build_object('field_key', 'best_before_date', 'label', 'Bäst före', 'field_type', 'date', 'required', false),
          jsonb_build_object('field_key', 'photo', 'label', 'Foto', 'field_type', 'photo', 'required', false),
          jsonb_build_object('field_key', 'comment', 'label', 'Kommentar / åtgärd', 'field_type', 'textarea', 'required', false)
        )
      )
    ),
    (
      'Varumottagning',
      'Kontroll vid leverans av varor.',
      'receiving',
      'per_delivery',
      jsonb_build_object(
        'fields', jsonb_build_array(
          jsonb_build_object('field_key', 'supplier', 'label', 'Leverantör', 'field_type', 'select', 'required', true),
          jsonb_build_object('field_key', 'product', 'label', 'Produkt / varugrupp', 'field_type', 'text', 'required', true),
          jsonb_build_object('field_key', 'delivery_temperature', 'label', 'Leveranstemperatur', 'field_type', 'temperature', 'required', false),
          jsonb_build_object('field_key', 'status', 'label', 'Status', 'field_type', 'ok_not_ok', 'required', true),
          jsonb_build_object('field_key', 'delivery_note_photo', 'label', 'Foto / följesedel', 'field_type', 'photo', 'required', false),
          jsonb_build_object('field_key', 'comment', 'label', 'Kommentar / åtgärd', 'field_type', 'textarea', 'required', false)
        )
      )
    ),
    (
      'Spårbarhet',
      'Dokumentera produkt, batch, bäst före, leverantör och etikettbilder.',
      'traceability',
      'daily',
      jsonb_build_object(
        'fields', jsonb_build_array(
          jsonb_build_object('field_key', 'product', 'label', 'Produkt', 'field_type', 'text', 'required', true),
          jsonb_build_object('field_key', 'batch_number', 'label', 'Batchnummer', 'field_type', 'text', 'required', true),
          jsonb_build_object('field_key', 'best_before', 'label', 'Bäst före', 'field_type', 'date', 'required', false),
          jsonb_build_object('field_key', 'supplier', 'label', 'Leverantör', 'field_type', 'select', 'required', false),
          jsonb_build_object('field_key', 'label_photo', 'label', 'Foto / etikett', 'field_type', 'photo', 'required', false)
        )
      )
    ),
    (
      'Egenkontrollrunda',
      'Veckovis översyn av hygien, skadedjur, kemikalier och ordning.',
      'round',
      'weekly',
      jsonb_build_object(
        'objects', jsonb_build_array(
          jsonb_build_object('name', 'Hygien & rengöring', 'object_type', 'round_area'),
          jsonb_build_object('name', 'Skadedjur', 'object_type', 'round_area'),
          jsonb_build_object('name', 'Kemikalier & förvaring', 'object_type', 'round_area'),
          jsonb_build_object('name', 'Allmän ordning', 'object_type', 'round_area')
        ),
        'fields', jsonb_build_array(
          jsonb_build_object('field_key', 'status', 'label', 'Status', 'field_type', 'ok_not_ok', 'required', true),
          jsonb_build_object('field_key', 'photo', 'label', 'Foto', 'field_type', 'photo', 'required', false),
          jsonb_build_object('field_key', 'comment', 'label', 'Kommentar / åtgärd', 'field_type', 'textarea', 'required', false)
        )
      )
    )
)
update public.control_templates template
set
  description = core_templates.description,
  category = core_templates.category,
  default_frequency = core_templates.default_frequency,
  template_schema = core_templates.template_schema,
  active = true
from core_templates
where template.locale = 'sv-SE'
  and lower(template.name) = lower(core_templates.name);

with core_templates(name, description, category, default_frequency, template_schema) as (
  values
    ('Kyltemperaturer', 'Daglig kontroll av kylar och frysar med gränsvärden.', 'temperature', 'daily', jsonb_build_object('objects', jsonb_build_array(jsonb_build_object('name', 'Kyl 1 - Kök', 'object_type', 'kyl', 'limit_max', 8, 'unit', '°C'), jsonb_build_object('name', 'Kyl 2 - Servering', 'object_type', 'kyl', 'limit_max', 8, 'unit', '°C'), jsonb_build_object('name', 'Frys 1 - Lager', 'object_type', 'frys', 'limit_max', -18, 'unit', '°C')), 'fields', jsonb_build_array(jsonb_build_object('field_key', 'temperature', 'label', 'Temperatur', 'field_type', 'temperature', 'required', true)))),
    ('Städning', 'Daglig checklista för städning och rengöring.', 'checklist', 'daily', jsonb_build_object('objects', jsonb_build_array(jsonb_build_object('name', 'Kök', 'object_type', 'cleaning_area'), jsonb_build_object('name', 'Servering', 'object_type', 'cleaning_area'), jsonb_build_object('name', 'Toaletter', 'object_type', 'cleaning_area'), jsonb_build_object('name', 'Förråd', 'object_type', 'cleaning_area')), 'fields', jsonb_build_array(jsonb_build_object('field_key', 'status', 'label', 'Status', 'field_type', 'ok_not_ok', 'required', true), jsonb_build_object('field_key', 'comment', 'label', 'Kommentar / åtgärd', 'field_type', 'textarea', 'required', false)))),
    ('Datummärkning', 'Daglig kontroll av märkning, datum och produktgrupper.', 'checklist', 'daily', jsonb_build_object('objects', jsonb_build_array(jsonb_build_object('name', 'Mjölk', 'object_type', 'date_label_group'), jsonb_build_object('name', 'Grädde', 'object_type', 'date_label_group'), jsonb_build_object('name', 'Yoghurt', 'object_type', 'date_label_group'), jsonb_build_object('name', 'Färdigmat', 'object_type', 'date_label_group')), 'fields', jsonb_build_array(jsonb_build_object('field_key', 'status', 'label', 'Status', 'field_type', 'ok_not_ok', 'required', true), jsonb_build_object('field_key', 'best_before_date', 'label', 'Bäst före', 'field_type', 'date', 'required', false), jsonb_build_object('field_key', 'photo', 'label', 'Foto', 'field_type', 'photo', 'required', false), jsonb_build_object('field_key', 'comment', 'label', 'Kommentar / åtgärd', 'field_type', 'textarea', 'required', false)))),
    ('Varumottagning', 'Kontroll vid leverans av varor.', 'receiving', 'per_delivery', jsonb_build_object('fields', jsonb_build_array(jsonb_build_object('field_key', 'supplier', 'label', 'Leverantör', 'field_type', 'select', 'required', true), jsonb_build_object('field_key', 'product', 'label', 'Produkt / varugrupp', 'field_type', 'text', 'required', true), jsonb_build_object('field_key', 'delivery_temperature', 'label', 'Leveranstemperatur', 'field_type', 'temperature', 'required', false), jsonb_build_object('field_key', 'status', 'label', 'Status', 'field_type', 'ok_not_ok', 'required', true), jsonb_build_object('field_key', 'delivery_note_photo', 'label', 'Foto / följesedel', 'field_type', 'photo', 'required', false), jsonb_build_object('field_key', 'comment', 'label', 'Kommentar / åtgärd', 'field_type', 'textarea', 'required', false)))),
    ('Spårbarhet', 'Dokumentera produkt, batch, bäst före, leverantör och etikettbilder.', 'traceability', 'daily', jsonb_build_object('fields', jsonb_build_array(jsonb_build_object('field_key', 'product', 'label', 'Produkt', 'field_type', 'text', 'required', true), jsonb_build_object('field_key', 'batch_number', 'label', 'Batchnummer', 'field_type', 'text', 'required', true), jsonb_build_object('field_key', 'best_before', 'label', 'Bäst före', 'field_type', 'date', 'required', false), jsonb_build_object('field_key', 'supplier', 'label', 'Leverantör', 'field_type', 'select', 'required', false), jsonb_build_object('field_key', 'label_photo', 'label', 'Foto / etikett', 'field_type', 'photo', 'required', false)))),
    ('Egenkontrollrunda', 'Veckovis översyn av hygien, skadedjur, kemikalier och ordning.', 'round', 'weekly', jsonb_build_object('objects', jsonb_build_array(jsonb_build_object('name', 'Hygien & rengöring', 'object_type', 'round_area'), jsonb_build_object('name', 'Skadedjur', 'object_type', 'round_area'), jsonb_build_object('name', 'Kemikalier & förvaring', 'object_type', 'round_area'), jsonb_build_object('name', 'Allmän ordning', 'object_type', 'round_area')), 'fields', jsonb_build_array(jsonb_build_object('field_key', 'status', 'label', 'Status', 'field_type', 'ok_not_ok', 'required', true), jsonb_build_object('field_key', 'photo', 'label', 'Foto', 'field_type', 'photo', 'required', false), jsonb_build_object('field_key', 'comment', 'label', 'Kommentar / åtgärd', 'field_type', 'textarea', 'required', false))))
)
insert into public.control_templates (name, description, category, default_frequency, template_schema, locale, active)
select name, description, category, default_frequency, template_schema, 'sv-SE', true
from core_templates
where not exists (
  select 1
  from public.control_templates template
  where template.locale = 'sv-SE'
    and lower(template.name) = lower(core_templates.name)
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
        ('batch_number', 'Batchnummer', 'text', true, 1),
        ('best_before', 'Bäst före', 'date', false, 2),
        ('supplier', 'Leverantör', 'select', false, 3),
        ('label_photo', 'Foto / etikett', 'photo', false, 4)
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
  'Creates a control type and issue #99 default field definitions in one transaction while relying on caller RLS policies.';

with standard_fields(control_name, category, field_key, label, field_type, required, sort_order) as (
  values
    ('Kyltemperaturer', 'temperature', 'temperature', 'Temperatur', 'temperature', true, 0),
    ('Städning', 'checklist', 'status', 'Status', 'ok_not_ok', true, 0),
    ('Städning', 'checklist', 'comment', 'Kommentar / åtgärd', 'textarea', false, 1),
    ('Datummärkning', 'checklist', 'status', 'Status', 'ok_not_ok', true, 0),
    ('Datummärkning', 'checklist', 'best_before_date', 'Bäst före', 'date', false, 1),
    ('Datummärkning', 'checklist', 'photo', 'Foto', 'photo', false, 2),
    ('Datummärkning', 'checklist', 'comment', 'Kommentar / åtgärd', 'textarea', false, 3),
    ('Varumottagning', 'receiving', 'supplier', 'Leverantör', 'select', true, 0),
    ('Varumottagning', 'receiving', 'product', 'Produkt / varugrupp', 'text', true, 1),
    ('Varumottagning', 'receiving', 'delivery_temperature', 'Leveranstemperatur', 'temperature', false, 2),
    ('Varumottagning', 'receiving', 'status', 'Status', 'ok_not_ok', true, 3),
    ('Varumottagning', 'receiving', 'delivery_note_photo', 'Foto / följesedel', 'photo', false, 4),
    ('Varumottagning', 'receiving', 'comment', 'Kommentar / åtgärd', 'textarea', false, 5),
    ('Spårbarhet', 'traceability', 'product', 'Produkt', 'text', true, 0),
    ('Spårbarhet', 'traceability', 'batch_number', 'Batchnummer', 'text', true, 1),
    ('Spårbarhet', 'traceability', 'best_before', 'Bäst före', 'date', false, 2),
    ('Spårbarhet', 'traceability', 'supplier', 'Leverantör', 'select', false, 3),
    ('Spårbarhet', 'traceability', 'label_photo', 'Foto / etikett', 'photo', false, 4),
    ('Egenkontrollrunda', 'round', 'status', 'Status', 'ok_not_ok', true, 0),
    ('Egenkontrollrunda', 'round', 'photo', 'Foto', 'photo', false, 1),
    ('Egenkontrollrunda', 'round', 'comment', 'Kommentar / åtgärd', 'textarea', false, 2)
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
