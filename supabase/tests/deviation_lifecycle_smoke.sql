-- Deviation lifecycle smoke test for disposable local/staging databases.
--
-- Run this manually with a privileged database connection after migrations are applied.
-- The script switches to the authenticated role for checks and rolls back all test data.
-- Do not run against production customer data.

begin;

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values (
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'deviation-lifecycle@example.test',
  extensions.crypt('test-deviation-password', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
);

insert into public.organizations (id, name, subscription_status, created_by)
values (
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee11',
  'Deviation Lifecycle Smoke Org',
  'trial',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01'
);

insert into public.organization_memberships (organization_id, user_id, role, status)
values (
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee11',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01',
  'owner',
  'active'
);

insert into public.control_types (id, organization_id, name, category, frequency, active)
values (
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee21',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee11',
  'Deviation Lifecycle Smoke Type',
  'temperature',
  'daily',
  true
);

insert into public.control_objects (
  id,
  organization_id,
  control_type_id,
  name,
  limit_max,
  unit,
  active
)
values (
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee31',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee11',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee21',
  'Deviation Lifecycle Smoke Object',
  8,
  '°C',
  true
);

insert into public.control_field_definitions (
  id,
  organization_id,
  control_type_id,
  field_key,
  label,
  field_type,
  required,
  deviation_rule
)
values (
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee41',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee11',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee21',
  'temperature',
  'Temperatur',
  'temperature',
  true,
  '{"max":8}'::jsonb
);

select set_config('request.jwt.claim.sub', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

insert into public.control_runs (
  id,
  organization_id,
  control_type_id,
  performed_by,
  status
)
values (
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee51',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee11',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee21',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01',
  'completed_with_deviation'
);

insert into public.control_run_items (
  id,
  organization_id,
  control_run_id,
  control_object_id,
  field_definition_id,
  object_snapshot,
  field_snapshot,
  value_number,
  status,
  deviation_detected,
  deviation_reason,
  action_text
)
values (
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee52',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee11',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee51',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee31',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee41',
  '{"name":"Deviation Lifecycle Smoke Object","limit_max":8,"unit":"°C"}',
  '{"label":"Temperatur","field_type":"temperature"}',
  11,
  'deviation',
  true,
  'Över gränsvärde max 8°C',
  'Justerat termostat.'
);

insert into public.deviations (
  id,
  organization_id,
  control_run_id,
  control_run_item_id,
  control_type_id,
  control_object_id,
  opened_by,
  status,
  severity,
  description,
  action_text
)
values (
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee61',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee11',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee51',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee52',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee21',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee31',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01',
  'open',
  'medium',
  'Temperatur över gränsvärde.',
  'Justerat termostat.'
);

update public.deviations
set
  status = 'resolved',
  resolved_by = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01',
  resolved_at = now(),
  follow_up_comment = 'Återkontroll godkänd.'
where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee61';

do $$
declare
  resolved_count int;
begin
  select count(*)
  into resolved_count
  from public.deviations
  where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee61'
    and status = 'resolved'
    and resolved_by = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01'
    and resolved_at is not null
    and follow_up_comment = 'Återkontroll godkänd.';

  if resolved_count <> 1 then
    raise exception 'Deviation lifecycle failure: resolved deviation state was not persisted';
  end if;

  raise notice 'Deviation lifecycle smoke test passed. Rolling back test data.';
end $$;

rollback;
