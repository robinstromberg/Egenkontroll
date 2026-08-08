-- Cold-storage transactional save smoke test for disposable local/staging databases.
--
-- Run manually with a privileged connection after all migrations are applied.
-- The script exercises the RPC as an authenticated organization member and rolls
-- back every test row. Never run this test against production customer data.

begin;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values (
  '77777777-7777-4777-8777-777777777701',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'cold-storage-smoke@example.test',
  extensions.crypt('test-password', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
);

insert into public.organizations (id, name, subscription_status, created_by)
values (
  '77777777-7777-4777-8777-777777777711',
  'Cold Storage Smoke Org',
  'trial',
  '77777777-7777-4777-8777-777777777701'
);

insert into public.organization_memberships (organization_id, user_id, role, status)
values (
  '77777777-7777-4777-8777-777777777711',
  '77777777-7777-4777-8777-777777777701',
  'owner',
  'active'
);

insert into public.control_types (
  id, organization_id, name, category, frequency, active, control_key
)
values
  (
    '77777777-7777-4777-8777-777777777721',
    '77777777-7777-4777-8777-777777777711',
    'Cold Storage Smoke',
    'temperature',
    'daily',
    true,
    'cold_storage_temperature'
  ),
  (
    '77777777-7777-4777-8777-777777777722',
    '77777777-7777-4777-8777-777777777711',
    'Kyltemperaturer (generic smoke)',
    'temperature',
    'daily',
    true,
    null
  );

insert into public.control_objects (
  id, organization_id, control_type_id, name, location, object_type,
  limit_max, unit, active
)
values
  ('77777777-7777-4777-8777-777777777731', '77777777-7777-4777-8777-777777777711', '77777777-7777-4777-8777-777777777721', 'Kyl 1', 'Kök', 'fridge', 8, 'C', true),
  ('77777777-7777-4777-8777-777777777732', '77777777-7777-4777-8777-777777777711', '77777777-7777-4777-8777-777777777721', 'Kyl 2', 'Kök', 'fridge', 8, 'C', true),
  ('77777777-7777-4777-8777-777777777733', '77777777-7777-4777-8777-777777777711', '77777777-7777-4777-8777-777777777721', 'Kyl 3', 'Bar', 'fridge', 8, 'C', true),
  ('77777777-7777-4777-8777-777777777734', '77777777-7777-4777-8777-777777777711', '77777777-7777-4777-8777-777777777721', 'Kyl 4', 'Bar', 'fridge', 8, 'C', true),
  ('77777777-7777-4777-8777-777777777735', '77777777-7777-4777-8777-777777777711', '77777777-7777-4777-8777-777777777722', 'Generic kyl', 'Lager', 'fridge', 8, 'C', true);

insert into public.control_field_definitions (
  id, organization_id, control_type_id, field_key, label, field_type,
  required, active
)
values
  (
    '77777777-7777-4777-8777-777777777741',
    '77777777-7777-4777-8777-777777777711',
    '77777777-7777-4777-8777-777777777721',
    'temperature',
    'Temperatur',
    'temperature',
    true,
    true
  ),
  (
    '77777777-7777-4777-8777-777777777742',
    '77777777-7777-4777-8777-777777777711',
    '77777777-7777-4777-8777-777777777722',
    'temperature',
    'Temperatur',
    'temperature',
    true,
    true
  );

select set_config('request.jwt.claim.sub', '77777777-7777-4777-8777-777777777701', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

do $$
declare
  saved_run public.control_runs;
  valid_responses jsonb;
  legacy_responses jsonb;
  item_count integer;
  open_count integer;
  resolved_count integer;
  run_count integer;
begin
  valid_responses := jsonb_build_array(
    jsonb_build_object(
      'controlRunItemId', '77777777-7777-4777-8777-777777777751',
      'controlObjectId', '77777777-7777-4777-8777-777777777731',
      'fieldDefinitionId', '77777777-7777-4777-8777-777777777741',
      'value', '4,2', 'deviationDetected', false, 'responseSchema', 'cold_storage_v1', 'status', 'ok',
      'valueJson', jsonb_build_object('schema', 'cold_storage_v1', 'kind', 'temperature')
    ),
    jsonb_build_object(
      'controlRunItemId', '77777777-7777-4777-8777-777777777752',
      'controlObjectId', '77777777-7777-4777-8777-777777777732',
      'fieldDefinitionId', '77777777-7777-4777-8777-777777777741',
      'value', '', 'deviationDetected', false, 'responseSchema', 'cold_storage_v1', 'status', 'not_applicable',
      'valueJson', jsonb_build_object('schema', 'cold_storage_v1', 'kind', 'not_applicable', 'reason', 'empty_and_off', 'note', null)
    ),
    jsonb_build_object(
      'controlRunItemId', '77777777-7777-4777-8777-777777777753',
      'controlObjectId', '77777777-7777-4777-8777-777777777733',
      'fieldDefinitionId', '77777777-7777-4777-8777-777777777741',
      'value', '12', 'deviationDetected', true, 'responseSchema', 'cold_storage_v1', 'status', 'deviation',
      'valueJson', jsonb_build_object(
        'schema', 'cold_storage_v1', 'kind', 'temperature_deviation',
        'foodAction', 'moved', 'unitAction', 'adjusted', 'checkMeasurement', 6.5,
        'followUpStatus', 'resolved', 'actionNote', null
      )
    ),
    jsonb_build_object(
      'controlRunItemId', '77777777-7777-4777-8777-777777777754',
      'controlObjectId', '77777777-7777-4777-8777-777777777734',
      'fieldDefinitionId', '77777777-7777-4777-8777-777777777741',
      'value', '10', 'deviationDetected', true, 'responseSchema', 'cold_storage_v1', 'status', 'deviation',
      'valueJson', jsonb_build_object(
        'schema', 'cold_storage_v1', 'kind', 'temperature_deviation',
        'foodAction', 'discarded', 'unitAction', 'service_contacted', 'checkMeasurement', null,
        'followUpStatus', 'open', 'actionNote', 'Inväntar service'
      )
    )
  );

  select * into saved_run
  from public.save_control_run_transactional(
    '77777777-7777-4777-8777-777777777711',
    '77777777-7777-4777-8777-777777777721',
    '77777777-7777-4777-8777-777777777761',
    valid_responses,
    '[]'::jsonb
  );

  if saved_run.status <> 'completed_with_deviation' then
    raise exception 'Cold-storage smoke failure: run status did not record deviations';
  end if;

  select count(*) into item_count
  from public.control_run_items
  where control_run_id = saved_run.id;

  select count(*) filter (where status = 'open'), count(*) filter (where status = 'resolved')
  into open_count, resolved_count
  from public.deviations
  where control_run_id = saved_run.id;

  if item_count <> 4 or open_count <> 1 or resolved_count <> 1 then
    raise exception 'Cold-storage smoke failure: expected 4 items, 1 open and 1 resolved deviation';
  end if;

  if not exists (
    select 1 from public.control_run_items
    where id = '77777777-7777-4777-8777-777777777752'
      and status = 'not_applicable'
      and value_number is null
      and value_json #>> '{reason}' = 'empty_and_off'
  ) then
    raise exception 'Cold-storage smoke failure: not-applicable item was not preserved';
  end if;

  if not exists (
    select 1 from public.control_run_items
    where id = '77777777-7777-4777-8777-777777777753'
      and value_number = 12
      and (value_json #>> '{checkMeasurement}')::numeric = 6.5
      and action_text like 'Varor:%Uppföljning: Löst.%'
  ) then
    raise exception 'Cold-storage smoke failure: original/check values or readable action text were lost';
  end if;

  select count(*) into run_count
  from public.control_runs
  where organization_id = '77777777-7777-4777-8777-777777777711';

  begin
    perform public.save_control_run_transactional(
      '77777777-7777-4777-8777-777777777711',
      '77777777-7777-4777-8777-777777777721',
      '77777777-7777-4777-8777-777777777762',
      valid_responses - 3,
      '[]'::jsonb
    );
    raise exception 'Cold-storage smoke failure: missing-unit payload succeeded';
  exception when others then
    if sqlerrm = 'Cold-storage smoke failure: missing-unit payload succeeded' then raise; end if;
  end;

  begin
    perform public.save_control_run_transactional(
      '77777777-7777-4777-8777-777777777711',
      '77777777-7777-4777-8777-777777777721',
      '77777777-7777-4777-8777-777777777763',
      jsonb_set(valid_responses, '{1,valueJson,reason}', '"other"'::jsonb),
      '[]'::jsonb
    );
    raise exception 'Cold-storage smoke failure: other N/A without explanation succeeded';
  exception when others then
    if sqlerrm = 'Cold-storage smoke failure: other N/A without explanation succeeded' then raise; end if;
  end;

  begin
    perform public.save_control_run_transactional(
      '77777777-7777-4777-8777-777777777711',
      '77777777-7777-4777-8777-777777777721',
      '77777777-7777-4777-8777-777777777764',
      jsonb_set(valid_responses, '{3,valueJson,followUpStatus}', 'null'::jsonb),
      '[]'::jsonb
    );
    raise exception 'Cold-storage smoke failure: deviation without follow-up status succeeded';
  exception when others then
    if sqlerrm = 'Cold-storage smoke failure: deviation without follow-up status succeeded' then raise; end if;
  end;

  begin
    perform public.save_control_run_transactional(
      '77777777-7777-4777-8777-777777777711',
      '77777777-7777-4777-8777-777777777721',
      '77777777-7777-4777-8777-777777777768',
      jsonb_set(valid_responses, '{0,value}', '"NaN"'::jsonb),
      '[]'::jsonb
    );
    raise exception 'Cold-storage smoke failure: non-finite temperature succeeded';
  exception when others then
    if sqlerrm = 'Cold-storage smoke failure: non-finite temperature succeeded' then raise; end if;
  end;

  if (select count(*) from public.control_runs where organization_id = '77777777-7777-4777-8777-777777777711') <> run_count then
    raise exception 'Cold-storage smoke failure: rejected payload left a partial run';
  end if;

  legacy_responses := jsonb_build_array(
    jsonb_build_object('controlRunItemId', '77777777-7777-4777-8777-777777777771', 'controlObjectId', '77777777-7777-4777-8777-777777777731', 'fieldDefinitionId', '77777777-7777-4777-8777-777777777741', 'value', '3', 'deviationDetected', false),
    jsonb_build_object('controlRunItemId', '77777777-7777-4777-8777-777777777772', 'controlObjectId', '77777777-7777-4777-8777-777777777732', 'fieldDefinitionId', '77777777-7777-4777-8777-777777777741', 'value', '4', 'deviationDetected', false),
    jsonb_build_object('controlRunItemId', '77777777-7777-4777-8777-777777777773', 'controlObjectId', '77777777-7777-4777-8777-777777777733', 'fieldDefinitionId', '77777777-7777-4777-8777-777777777741', 'value', '5', 'deviationDetected', false),
    jsonb_build_object('controlRunItemId', '77777777-7777-4777-8777-777777777774', 'controlObjectId', '77777777-7777-4777-8777-777777777734', 'fieldDefinitionId', '77777777-7777-4777-8777-777777777741', 'value', '6', 'deviationDetected', false)
  );

  perform public.save_control_run_transactional(
    '77777777-7777-4777-8777-777777777711',
    '77777777-7777-4777-8777-777777777721',
    '77777777-7777-4777-8777-777777777765',
    legacy_responses,
    '[]'::jsonb
  );

  begin
    perform public.save_control_run_transactional(
      '77777777-7777-4777-8777-777777777711',
      '77777777-7777-4777-8777-777777777721',
      '77777777-7777-4777-8777-777777777766',
      jsonb_set(jsonb_set(legacy_responses, '{0,value}', '"20"'::jsonb), '{0,deviationDetected}', 'true'::jsonb),
      '[]'::jsonb
    );
    raise exception 'Cold-storage smoke failure: legacy cold deviation succeeded';
  exception when others then
    if sqlerrm = 'Cold-storage smoke failure: legacy cold deviation succeeded' then raise; end if;
  end;

  begin
    perform public.save_control_run_transactional(
      '77777777-7777-4777-8777-777777777711',
      '77777777-7777-4777-8777-777777777722',
      '77777777-7777-4777-8777-777777777769',
      jsonb_build_array(jsonb_build_object(
        'controlRunItemId', '77777777-7777-4777-8777-777777777776',
        'controlObjectId', '77777777-7777-4777-8777-777777777735',
        'fieldDefinitionId', '77777777-7777-4777-8777-777777777742',
        'value', '4', 'deviationDetected', false,
        'responseSchema', 'cold_storage_v1', 'status', 'ok',
        'valueJson', jsonb_build_object('schema', 'cold_storage_v1', 'kind', 'temperature')
      )),
      '[]'::jsonb
    );
    raise exception 'Cold-storage smoke failure: unkeyed type accepted cold schema';
  exception when others then
    if sqlerrm = 'Cold-storage smoke failure: unkeyed type accepted cold schema' then raise; end if;
  end;

  select * into saved_run
  from public.save_control_run_transactional(
    '77777777-7777-4777-8777-777777777711',
    '77777777-7777-4777-8777-777777777722',
    '77777777-7777-4777-8777-777777777767',
    jsonb_build_array(jsonb_build_object(
      'controlRunItemId', '77777777-7777-4777-8777-777777777775',
      'controlObjectId', '77777777-7777-4777-8777-777777777735',
      'fieldDefinitionId', '77777777-7777-4777-8777-777777777742',
      'value', '12', 'deviationDetected', true,
      'deviationReason', 'Generic over max', 'actionText', 'Generic action remains supported'
    )),
    '[]'::jsonb
  );

  if saved_run.status <> 'completed_with_deviation' then
    raise exception 'Cold-storage smoke failure: unkeyed temperature type did not keep generic behavior';
  end if;
end $$;

reset role;

do $$
begin
  if (select prosecdef from pg_proc where oid = 'public.save_control_run_transactional(uuid,uuid,uuid,jsonb,jsonb)'::regprocedure) then
    raise exception 'Cold-storage smoke failure: RPC must remain security invoker';
  end if;
  if has_function_privilege('anon', 'public.save_control_run_transactional(uuid,uuid,uuid,jsonb,jsonb)', 'execute') then
    raise exception 'Cold-storage smoke failure: anon can execute save RPC';
  end if;
  if not has_function_privilege('authenticated', 'public.save_control_run_transactional(uuid,uuid,uuid,jsonb,jsonb)', 'execute') then
    raise exception 'Cold-storage smoke failure: authenticated cannot execute save RPC';
  end if;
end $$;

rollback;
