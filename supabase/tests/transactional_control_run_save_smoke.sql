-- Transactional control run save smoke test for disposable local/staging databases.
--
-- Run this manually with a privileged database connection after migrations are applied.
-- The script switches to the authenticated role for the RPC checks and rolls back all test data.
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
  '88888888-8888-4888-8888-888888888801',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'transactional-save@example.test',
  extensions.crypt('test-password', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
);

insert into public.organizations (id, name, subscription_status, created_by)
values (
  '88888888-8888-4888-8888-888888888811',
  'Transactional Save Smoke Org',
  'trial',
  '88888888-8888-4888-8888-888888888801'
);

insert into public.organization_memberships (organization_id, user_id, role, status)
values (
  '88888888-8888-4888-8888-888888888811',
  '88888888-8888-4888-8888-888888888801',
  'owner',
  'active'
);

insert into public.control_types (id, organization_id, name, category, frequency, active)
values
  (
    '88888888-8888-4888-8888-888888888821',
    '88888888-8888-4888-8888-888888888811',
    'Transactional Temperature Smoke',
    'temperature',
    'daily',
    true
  ),
  (
    '88888888-8888-4888-8888-888888888822',
    '88888888-8888-4888-8888-888888888811',
    'Transactional Other Smoke',
    'checklist',
    'daily',
    true
  );

insert into public.control_objects (
  id,
  organization_id,
  control_type_id,
  name,
  location,
  object_type,
  limit_max,
  unit,
  active
)
values (
  '88888888-8888-4888-8888-888888888831',
  '88888888-8888-4888-8888-888888888811',
  '88888888-8888-4888-8888-888888888821',
  'Transactional Kyl 1',
  'Kok',
  'fridge',
  8,
  'C',
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
  active
)
values
  (
    '88888888-8888-4888-8888-888888888841',
    '88888888-8888-4888-8888-888888888811',
    '88888888-8888-4888-8888-888888888821',
    'temperature',
    'Temperatur',
    'temperature',
    true,
    true
  ),
  (
    '88888888-8888-4888-8888-888888888842',
    '88888888-8888-4888-8888-888888888811',
    '88888888-8888-4888-8888-888888888821',
    'photo',
    'Foto',
    'photo',
    false,
    true
  ),
  (
    '88888888-8888-4888-8888-888888888843',
    '88888888-8888-4888-8888-888888888811',
    '88888888-8888-4888-8888-888888888822',
    'status',
    'Status',
    'ok_not_ok',
    true,
    true
  );

select set_config('request.jwt.claim.sub', '88888888-8888-4888-8888-888888888801', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

do $$
declare
  saved_run public.control_runs;
  item_count integer;
  deviation_count integer;
  attachment_count integer;
  run_count_before integer;
  run_count_after integer;
begin
  select *
  into saved_run
  from public.save_control_run_transactional(
    '88888888-8888-4888-8888-888888888811',
    '88888888-8888-4888-8888-888888888821',
    '88888888-8888-4888-8888-888888888851',
    jsonb_build_array(
      jsonb_build_object(
        'controlRunItemId', '88888888-8888-4888-8888-888888888861',
        'controlObjectId', '88888888-8888-4888-8888-888888888831',
        'fieldDefinitionId', '88888888-8888-4888-8888-888888888841',
        'value', '11',
        'deviationDetected', true,
        'deviationReason', 'Over max',
        'actionText', 'Adjusted thermostat'
      ),
      jsonb_build_object(
        'controlRunItemId', '88888888-8888-4888-8888-888888888862',
        'controlObjectId', '88888888-8888-4888-8888-888888888831',
        'fieldDefinitionId', '88888888-8888-4888-8888-888888888842',
        'value', 'label.jpg',
        'deviationDetected', false,
        'deviationReason', null,
        'actionText', null
      )
    ),
    jsonb_build_array(
      jsonb_build_object(
        'controlRunItemId', '88888888-8888-4888-8888-888888888862',
        'storageBucket', 'control-attachments',
        'storagePath', '88888888-8888-4888-8888-888888888811/88888888-8888-4888-8888-888888888851/88888888-8888-4888-8888-888888888862/label.jpg',
        'fileName', 'label.jpg',
        'contentType', 'image/jpeg',
        'sizeBytes', 128
      )
    )
  );

  if saved_run.id <> '88888888-8888-4888-8888-888888888851'
    or saved_run.organization_id <> '88888888-8888-4888-8888-888888888811'
    or saved_run.status <> 'completed_with_deviation'
    or saved_run.performed_by <> '88888888-8888-4888-8888-888888888801'
  then
    raise exception 'Transactional smoke failure: saved run did not match expected values';
  end if;

  select count(*) into item_count
  from public.control_run_items
  where control_run_id = '88888888-8888-4888-8888-888888888851';

  select count(*) into deviation_count
  from public.deviations
  where control_run_id = '88888888-8888-4888-8888-888888888851';

  select count(*) into attachment_count
  from public.attachments
  where control_run_id = '88888888-8888-4888-8888-888888888851';

  if item_count <> 2 or deviation_count <> 1 or attachment_count <> 1 then
    raise exception 'Transactional smoke failure: expected 2 items, 1 deviation and 1 attachment metadata row';
  end if;

  select count(*) into run_count_before
  from public.control_runs
  where organization_id = '88888888-8888-4888-8888-888888888811';

  begin
    perform public.save_control_run_transactional(
      '88888888-8888-4888-8888-888888888811',
      '88888888-8888-4888-8888-888888888821',
      '88888888-8888-4888-8888-888888888852',
      jsonb_build_array(
        jsonb_build_object(
          'controlRunItemId', '88888888-8888-4888-8888-888888888863',
          'controlObjectId', '88888888-8888-4888-8888-888888888831',
          'fieldDefinitionId', '88888888-8888-4888-8888-888888888843',
          'value', 'true',
          'deviationDetected', false,
          'deviationReason', null,
          'actionText', null
        )
      ),
      '[]'::jsonb
    );

    raise exception 'Transactional smoke failure: cross-type field save succeeded';
  exception
    when others then
      if sqlerrm = 'Transactional smoke failure: cross-type field save succeeded' then
        raise;
      end if;
  end;

  select count(*) into run_count_after
  from public.control_runs
  where organization_id = '88888888-8888-4888-8888-888888888811';

  if run_count_after <> run_count_before then
    raise exception 'Transactional smoke failure: failed field save left a partial run';
  end if;

  begin
    perform public.save_control_run_transactional(
      '88888888-8888-4888-8888-888888888811',
      '88888888-8888-4888-8888-888888888821',
      '88888888-8888-4888-8888-888888888853',
      jsonb_build_array(
        jsonb_build_object(
          'controlRunItemId', '88888888-8888-4888-8888-888888888864',
          'controlObjectId', '88888888-8888-4888-8888-888888888831',
          'fieldDefinitionId', '88888888-8888-4888-8888-888888888842',
          'value', 'bad-path.jpg',
          'deviationDetected', false,
          'deviationReason', null,
          'actionText', null
        )
      ),
      jsonb_build_array(
        jsonb_build_object(
          'controlRunItemId', '88888888-8888-4888-8888-888888888864',
          'storageBucket', 'control-attachments',
          'storagePath', 'wrong-org/88888888-8888-4888-8888-888888888853/88888888-8888-4888-8888-888888888864/bad-path.jpg',
          'fileName', 'bad-path.jpg',
          'contentType', 'image/jpeg',
          'sizeBytes', 64
        )
      )
    );

    raise exception 'Transactional smoke failure: bad attachment path save succeeded';
  exception
    when others then
      if sqlerrm = 'Transactional smoke failure: bad attachment path save succeeded' then
        raise;
      end if;
  end;

  select count(*) into run_count_after
  from public.control_runs
  where organization_id = '88888888-8888-4888-8888-888888888811';

  if run_count_after <> run_count_before then
    raise exception 'Transactional smoke failure: failed attachment save left a partial run';
  end if;

  raise notice 'Transactional control run save smoke test passed. Rolling back test data.';
end $$;

rollback;
