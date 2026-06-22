create temporary table extended_control_templates (
  name text not null,
  description text not null,
  category text not null,
  default_frequency text not null,
  template_schema jsonb not null
) on commit drop;

insert into extended_control_templates (name, description, category, default_frequency, template_schema)
values
  ('Varmhållning', 'Kontroll av varmhållna rätter och temperatur över tid.', 'temperature', 'daily', jsonb_build_object('default_active', false, 'fields', jsonb_build_array(jsonb_build_object('field_key', 'dish', 'label', 'Objekt / maträtt', 'field_type', 'text', 'required', true), jsonb_build_object('field_key', 'temperature', 'label', 'Temperatur', 'field_type', 'temperature', 'required', true), jsonb_build_object('field_key', 'time', 'label', 'Tidpunkt', 'field_type', 'text', 'required', false), jsonb_build_object('field_key', 'comment', 'label', 'Kommentar / åtgärd', 'field_type', 'textarea', 'required', false)))),
  ('Nedkylning', 'Kontroll av nedkylning med starttid, sluttid och temperatur.', 'temperature', 'custom', jsonb_build_object('default_active', false, 'fields', jsonb_build_array(jsonb_build_object('field_key', 'product', 'label', 'Produkt / maträtt', 'field_type', 'text', 'required', true), jsonb_build_object('field_key', 'start_time', 'label', 'Starttid', 'field_type', 'text', 'required', false), jsonb_build_object('field_key', 'end_time', 'label', 'Sluttid', 'field_type', 'text', 'required', false), jsonb_build_object('field_key', 'temperature', 'label', 'Temperatur', 'field_type', 'temperature', 'required', true), jsonb_build_object('field_key', 'comment', 'label', 'Kommentar / åtgärd', 'field_type', 'textarea', 'required', false)))),
  ('Allergenkontroll', 'Kontroll av allergener, märkning och hantering.', 'checklist', 'daily', jsonb_build_object('default_active', false, 'fields', jsonb_build_array(jsonb_build_object('field_key', 'product', 'label', 'Produkt / rätt', 'field_type', 'text', 'required', true), jsonb_build_object('field_key', 'allergens_checked', 'label', 'Allergener kontrollerade', 'field_type', 'textarea', 'required', false), jsonb_build_object('field_key', 'status', 'label', 'Status', 'field_type', 'ok_not_ok', 'required', true), jsonb_build_object('field_key', 'comment', 'label', 'Kommentar / åtgärd', 'field_type', 'textarea', 'required', false)))),
  ('Personlig hygien', 'Kontroll av rutiner för handhygien, klädsel och personlig hygien.', 'checklist', 'weekly', jsonb_build_object('default_active', false, 'objects', jsonb_build_array(jsonb_build_object('name', 'Handtvätt', 'object_type', 'hygiene_point'), jsonb_build_object('name', 'Arbetskläder', 'object_type', 'hygiene_point'), jsonb_build_object('name', 'Smycken och sår', 'object_type', 'hygiene_point')), 'fields', jsonb_build_array(jsonb_build_object('field_key', 'status', 'label', 'Status', 'field_type', 'ok_not_ok', 'required', true), jsonb_build_object('field_key', 'comment', 'label', 'Kommentar / åtgärd', 'field_type', 'textarea', 'required', false)))),
  ('Skadedjurskontroll', 'Kontroll av tecken på skadedjur i lokaler och lager.', 'checklist', 'weekly', jsonb_build_object('default_active', false, 'objects', jsonb_build_array(jsonb_build_object('name', 'Kök', 'object_type', 'pest_area'), jsonb_build_object('name', 'Lager', 'object_type', 'pest_area'), jsonb_build_object('name', 'Servering', 'object_type', 'pest_area')), 'fields', jsonb_build_array(jsonb_build_object('field_key', 'status', 'label', 'Inga tecken på skadedjur', 'field_type', 'ok_not_ok', 'required', true), jsonb_build_object('field_key', 'photo', 'label', 'Foto', 'field_type', 'photo', 'required', false), jsonb_build_object('field_key', 'comment', 'label', 'Kommentar / åtgärd', 'field_type', 'textarea', 'required', false)))),
  ('Vattenkontroll', 'Kontroll av vattenrelaterade rutiner och tappställen.', 'checklist', 'weekly', jsonb_build_object('default_active', false, 'objects', jsonb_build_array(jsonb_build_object('name', 'Kran kök', 'object_type', 'water_point'), jsonb_build_object('name', 'Disk / rengöring', 'object_type', 'water_point')), 'fields', jsonb_build_array(jsonb_build_object('field_key', 'status', 'label', 'Status', 'field_type', 'ok_not_ok', 'required', true), jsonb_build_object('field_key', 'comment', 'label', 'Kommentar / åtgärd', 'field_type', 'textarea', 'required', false)))),
  ('Utbildning/kompetens', 'Dokumentation av utbildning, kompetens och genomgångna rutiner.', 'custom', 'custom', jsonb_build_object('default_active', false, 'fields', jsonb_build_array(jsonb_build_object('field_key', 'person', 'label', 'Person', 'field_type', 'text', 'required', true), jsonb_build_object('field_key', 'training_subject', 'label', 'Utbildning / ämne', 'field_type', 'text', 'required', true), jsonb_build_object('field_key', 'date', 'label', 'Datum', 'field_type', 'date', 'required', false), jsonb_build_object('field_key', 'comment', 'label', 'Kommentar', 'field_type', 'textarea', 'required', false)))),
  ('Underhåll & kalibrering', 'Dokumentation av underhåll, kalibrering och funktionskontroller.', 'custom', 'custom', jsonb_build_object('default_active', false, 'fields', jsonb_build_array(jsonb_build_object('field_key', 'equipment', 'label', 'Utrustning', 'field_type', 'text', 'required', true), jsonb_build_object('field_key', 'maintenance_type', 'label', 'Åtgärd / underhållstyp', 'field_type', 'text', 'required', true), jsonb_build_object('field_key', 'date', 'label', 'Datum', 'field_type', 'date', 'required', false), jsonb_build_object('field_key', 'status', 'label', 'Status', 'field_type', 'ok_not_ok', 'required', true), jsonb_build_object('field_key', 'comment', 'label', 'Kommentar', 'field_type', 'textarea', 'required', false)))),
  ('Avfallshantering', 'Kontroll av avfall, återvinning och tömningsrutiner.', 'checklist', 'weekly', jsonb_build_object('default_active', false, 'objects', jsonb_build_array(jsonb_build_object('name', 'Sopkärl', 'object_type', 'waste_point'), jsonb_build_object('name', 'Återvinning', 'object_type', 'waste_point'), jsonb_build_object('name', 'Fett / särskilt avfall', 'object_type', 'waste_point')), 'fields', jsonb_build_array(jsonb_build_object('field_key', 'status', 'label', 'Status', 'field_type', 'ok_not_ok', 'required', true), jsonb_build_object('field_key', 'comment', 'label', 'Kommentar / åtgärd', 'field_type', 'textarea', 'required', false))));

update public.control_templates template
set
  description = source.description,
  category = source.category,
  default_frequency = source.default_frequency,
  template_schema = source.template_schema,
  active = true
from extended_control_templates source
where template.locale = 'sv-SE'
  and lower(template.name) = lower(source.name);

insert into public.control_templates (name, description, category, default_frequency, template_schema, locale, active)
select name, description, category, default_frequency, template_schema, 'sv-SE', true
from extended_control_templates source
where not exists (
  select 1
  from public.control_templates template
  where template.locale = 'sv-SE'
    and lower(template.name) = lower(source.name)
);

with template_rows as (
  select template.*
  from public.control_templates template
  join extended_control_templates source on lower(template.name) = lower(source.name)
  where template.locale = 'sv-SE'
),
inserted_control_types as (
  insert into public.control_types (
    organization_id,
    template_id,
    name,
    description,
    category,
    frequency,
    instructions,
    active,
    sort_order
  )
  select
    organization.id,
    template_rows.id,
    template_rows.name,
    template_rows.description,
    template_rows.category,
    template_rows.default_frequency,
    'Inaktiv standardkontroll. Aktivera och anpassa vid behov.',
    false,
    100 + row_number() over (partition by organization.id order by template_rows.name)
  from public.organizations organization
  cross join template_rows
  where not exists (
    select 1
    from public.control_types existing
    where existing.organization_id = organization.id
      and lower(existing.name) = lower(template_rows.name)
  )
  returning id, organization_id, template_id
),
target_control_types as (
  select control_type.id, control_type.organization_id, template.template_schema
  from public.control_types control_type
  join public.control_templates template on template.id = control_type.template_id
  join extended_control_templates source on lower(source.name) = lower(template.name)
)
insert into public.control_objects (
  organization_id,
  control_type_id,
  name,
  object_type,
  sort_order,
  active
)
select
  target.organization_id,
  target.id,
  object_item.value ->> 'name',
  object_item.value ->> 'object_type',
  object_item.ordinality - 1,
  true
from target_control_types target
cross join lateral jsonb_array_elements(coalesce(target.template_schema -> 'objects', '[]'::jsonb)) with ordinality as object_item(value, ordinality)
where not exists (
  select 1
  from public.control_objects object
  where object.control_type_id = target.id
    and lower(object.name) = lower(object_item.value ->> 'name')
);

with target_control_types as (
  select control_type.id, control_type.organization_id, template.template_schema
  from public.control_types control_type
  join public.control_templates template on template.id = control_type.template_id
  join extended_control_templates source on lower(source.name) = lower(template.name)
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
  target.organization_id,
  target.id,
  field_item.value ->> 'field_key',
  field_item.value ->> 'label',
  field_item.value ->> 'field_type',
  coalesce((field_item.value ->> 'required')::boolean, false),
  '{}'::jsonb,
  '[]'::jsonb,
  field_item.ordinality - 1,
  true
from target_control_types target
cross join lateral jsonb_array_elements(coalesce(target.template_schema -> 'fields', '[]'::jsonb)) with ordinality as field_item(value, ordinality)
where not exists (
  select 1
  from public.control_field_definitions field
  where field.control_type_id = target.id
    and field.field_key = field_item.value ->> 'field_key'
);
