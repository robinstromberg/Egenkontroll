-- Local/development seed data for MVP testing.
-- This file is intentionally not a production migration.

begin;

insert into public.organizations (
  id,
  name,
  org_number,
  country_code,
  timezone,
  default_locale,
  subscription_status
)
values (
  '11111111-1111-4111-8111-111111111111',
  'Demo Restaurang',
  '559000-0000',
  'SE',
  'Europe/Stockholm',
  'sv-SE',
  'trial'
)
on conflict (id) do update
set
  name = excluded.name,
  org_number = excluded.org_number,
  subscription_status = excluded.subscription_status;

insert into public.control_types (
  id,
  organization_id,
  name,
  description,
  category,
  frequency,
  instructions,
  active,
  sort_order
)
values
  (
    '22222222-2222-4222-8222-222222222201',
    '11111111-1111-4111-8111-111111111111',
    'Kyltemperaturer',
    'Daglig demo-kontroll av kylar och frysar.',
    'temperature',
    'daily',
    'Kontrollera termometern och registrera temperatur.',
    true,
    10
  ),
  (
    '22222222-2222-4222-8222-222222222202',
    '11111111-1111-4111-8111-111111111111',
    'Städning',
    'Daglig demo-checklista för städområden.',
    'checklist',
    'daily',
    'Markera OK eller Ej OK för varje område.',
    true,
    20
  ),
  (
    '22222222-2222-4222-8222-222222222203',
    '11111111-1111-4111-8111-111111111111',
    'Varumottagning',
    'Demo-kontroll vid leverans.',
    'receiving',
    'per_delivery',
    'Kontrollera leverantör, temperatur och märkning.',
    true,
    30
  )
on conflict (id) do update
set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  frequency = excluded.frequency,
  instructions = excluded.instructions,
  active = excluded.active,
  sort_order = excluded.sort_order;

insert into public.control_objects (
  id,
  organization_id,
  control_type_id,
  name,
  location,
  object_type,
  limit_max,
  unit,
  active,
  sort_order
)
values
  (
    '33333333-3333-4333-8333-333333333301',
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222201',
    'Kyl 1 - Kök',
    'Kök',
    'kyl',
    8,
    '°C',
    true,
    10
  ),
  (
    '33333333-3333-4333-8333-333333333302',
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222201',
    'Kyl 2 - Servering',
    'Servering',
    'kyl',
    8,
    '°C',
    true,
    20
  ),
  (
    '33333333-3333-4333-8333-333333333303',
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222202',
    'Kök',
    'Kök',
    'cleaning_area',
    null,
    null,
    true,
    10
  ),
  (
    '33333333-3333-4333-8333-333333333304',
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222202',
    'Servering',
    'Servering',
    'cleaning_area',
    null,
    null,
    true,
    20
  )
on conflict (id) do update
set
  name = excluded.name,
  location = excluded.location,
  object_type = excluded.object_type,
  limit_max = excluded.limit_max,
  unit = excluded.unit,
  active = excluded.active,
  sort_order = excluded.sort_order;

insert into public.control_field_definitions (
  id,
  organization_id,
  control_type_id,
  field_key,
  label,
  field_type,
  required,
  deviation_rule,
  sort_order,
  active
)
values
  (
    '44444444-4444-4444-8444-444444444401',
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222201',
    'temperature',
    'Temperatur',
    'temperature',
    true,
    '{"max":8}'::jsonb,
    10,
    true
  ),
  (
    '44444444-4444-4444-8444-444444444402',
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222202',
    'status',
    'Status',
    'ok_not_ok',
    true,
    '{}'::jsonb,
    10,
    true
  ),
  (
    '44444444-4444-4444-8444-444444444403',
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222202',
    'comment',
    'Kommentar',
    'textarea',
    false,
    '{}'::jsonb,
    20,
    true
  ),
  (
    '44444444-4444-4444-8444-444444444404',
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222203',
    'supplier',
    'Leverantör',
    'text',
    true,
    '{}'::jsonb,
    10,
    true
  ),
  (
    '44444444-4444-4444-8444-444444444405',
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222203',
    'delivery_temperature',
    'Leveranstemperatur',
    'temperature',
    false,
    '{"max":8}'::jsonb,
    20,
    true
  )
on conflict (control_type_id, field_key) do update
set
  label = excluded.label,
  field_type = excluded.field_type,
  required = excluded.required,
  deviation_rule = excluded.deviation_rule,
  sort_order = excluded.sort_order,
  active = excluded.active;

insert into public.control_runs (
  id,
  organization_id,
  control_type_id,
  status,
  performed_at,
  notes
)
values
  (
    '55555555-5555-4555-8555-555555555501',
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222201',
    'completed',
    now() - interval '1 day',
    'Demo: normal temperaturkontroll.'
  ),
  (
    '55555555-5555-4555-8555-555555555502',
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222201',
    'completed_with_deviation',
    now() - interval '2 days',
    'Demo: avvikelse med åtgärd.'
  ),
  (
    '55555555-5555-4555-8555-555555555503',
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222202',
    'completed',
    now() - interval '1 day',
    'Demo: städning godkänd.'
  )
on conflict (id) do update
set
  status = excluded.status,
  performed_at = excluded.performed_at,
  notes = excluded.notes;

insert into public.control_run_items (
  id,
  organization_id,
  control_run_id,
  control_object_id,
  field_definition_id,
  object_snapshot,
  field_snapshot,
  value_number,
  value_boolean,
  status,
  deviation_detected,
  deviation_reason,
  action_text
)
values
  (
    '66666666-6666-4666-8666-666666666601',
    '11111111-1111-4111-8111-111111111111',
    '55555555-5555-4555-8555-555555555501',
    '33333333-3333-4333-8333-333333333301',
    '44444444-4444-4444-8444-444444444401',
    '{"name":"Kyl 1 - Kök","limit_max":8,"unit":"°C"}'::jsonb,
    '{"label":"Temperatur","field_type":"temperature"}'::jsonb,
    4.2,
    null,
    'ok',
    false,
    null,
    null
  ),
  (
    '66666666-6666-4666-8666-666666666602',
    '11111111-1111-4111-8111-111111111111',
    '55555555-5555-4555-8555-555555555502',
    '33333333-3333-4333-8333-333333333302',
    '44444444-4444-4444-8444-444444444401',
    '{"name":"Kyl 2 - Servering","limit_max":8,"unit":"°C"}'::jsonb,
    '{"label":"Temperatur","field_type":"temperature"}'::jsonb,
    11.0,
    null,
    'deviation',
    true,
    'Över gränsvärde max 8°C',
    'Justerat termostat, återkontroll kl. 10:00.'
  ),
  (
    '66666666-6666-4666-8666-666666666603',
    '11111111-1111-4111-8111-111111111111',
    '55555555-5555-4555-8555-555555555503',
    '33333333-3333-4333-8333-333333333303',
    '44444444-4444-4444-8444-444444444402',
    '{"name":"Kök"}'::jsonb,
    '{"label":"Status","field_type":"ok_not_ok"}'::jsonb,
    null,
    true,
    'ok',
    false,
    null,
    null
  )
on conflict (id) do update
set
  value_number = excluded.value_number,
  value_boolean = excluded.value_boolean,
  status = excluded.status,
  deviation_detected = excluded.deviation_detected,
  deviation_reason = excluded.deviation_reason,
  action_text = excluded.action_text;

insert into public.deviations (
  id,
  organization_id,
  control_run_id,
  control_run_item_id,
  control_type_id,
  control_object_id,
  status,
  severity,
  description,
  action_text,
  follow_up_comment,
  opened_at
)
values (
  '77777777-7777-4777-8777-777777777701',
  '11111111-1111-4111-8111-111111111111',
  '55555555-5555-4555-8555-555555555502',
  '66666666-6666-4666-8666-666666666602',
  '22222222-2222-4222-8222-222222222201',
  '33333333-3333-4333-8333-333333333302',
  'open',
  'medium',
  'Kyl 2 - Servering låg över gränsvärdet.',
  'Justerat termostat och planerad återkontroll.',
  'Demoavvikelse för test av uppföljning och inspektörsrapport.',
  now() - interval '2 days'
)
on conflict (id) do update
set
  status = excluded.status,
  severity = excluded.severity,
  description = excluded.description,
  action_text = excluded.action_text,
  follow_up_comment = excluded.follow_up_comment,
  opened_at = excluded.opened_at;

commit;
