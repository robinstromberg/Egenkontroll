-- Inspector link smoke test for disposable local/staging databases.
--
-- Run this manually with a privileged database connection after migrations are applied.
-- The script switches to the anon role for RPC checks and rolls back all test data.
-- Do not run against production customer data.

begin;

insert into public.organizations (id, name, subscription_status)
values ('cccccccc-cccc-4ccc-8ccc-cccccccccc01', 'Inspector Smoke Org', 'trial');

insert into public.control_types (id, organization_id, name, category, frequency, active)
values (
  'cccccccc-cccc-4ccc-8ccc-cccccccccc11',
  'cccccccc-cccc-4ccc-8ccc-cccccccccc01',
  'Inspector Smoke Type',
  'checklist',
  'daily',
  true
);

insert into public.control_objects (id, organization_id, control_type_id, name, active)
values (
  'cccccccc-cccc-4ccc-8ccc-cccccccccc21',
  'cccccccc-cccc-4ccc-8ccc-cccccccccc01',
  'cccccccc-cccc-4ccc-8ccc-cccccccccc11',
  'Inspector Smoke Object',
  true
);

insert into public.control_field_definitions (
  id,
  organization_id,
  control_type_id,
  field_key,
  label,
  field_type,
  required
)
values (
  'cccccccc-cccc-4ccc-8ccc-cccccccccc41',
  'cccccccc-cccc-4ccc-8ccc-cccccccccc01',
  'cccccccc-cccc-4ccc-8ccc-cccccccccc11',
  'status',
  'Status',
  'ok_not_ok',
  true
);

insert into public.control_runs (
  id,
  organization_id,
  control_type_id,
  status,
  performed_at,
  notes
)
values (
  'cccccccc-cccc-4ccc-8ccc-cccccccccc31',
  'cccccccc-cccc-4ccc-8ccc-cccccccccc01',
  'cccccccc-cccc-4ccc-8ccc-cccccccccc11',
  'completed',
  now(),
  'Inspector smoke run'
);

insert into public.control_run_items (
  id,
  organization_id,
  control_run_id,
  control_object_id,
  field_definition_id,
  object_snapshot,
  field_snapshot,
  value_boolean,
  status
)
values (
  'cccccccc-cccc-4ccc-8ccc-cccccccccc51',
  'cccccccc-cccc-4ccc-8ccc-cccccccccc01',
  'cccccccc-cccc-4ccc-8ccc-cccccccccc31',
  'cccccccc-cccc-4ccc-8ccc-cccccccccc21',
  'cccccccc-cccc-4ccc-8ccc-cccccccccc41',
  '{"name":"Inspector Smoke Object"}',
  '{"label":"Status"}',
  true,
  'ok'
);

insert into public.share_links (
  id,
  organization_id,
  token_hash,
  valid_from,
  valid_until,
  period_start,
  period_end,
  included_control_type_ids,
  status
)
values
  (
    'cccccccc-cccc-4ccc-8ccc-cccccccccc71',
    'cccccccc-cccc-4ccc-8ccc-cccccccccc01',
    encode(extensions.digest('inspector-smoke-active-token', 'sha256'), 'hex'),
    now() - interval '1 minute',
    now() + interval '1 hour',
    current_date - 1,
    current_date + 1,
    array['cccccccc-cccc-4ccc-8ccc-cccccccccc11']::uuid[],
    'active'
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-cccccccccc72',
    'cccccccc-cccc-4ccc-8ccc-cccccccccc01',
    encode(extensions.digest('inspector-smoke-expired-token', 'sha256'), 'hex'),
    now() - interval '2 hours',
    now() - interval '1 hour',
    current_date - 1,
    current_date + 1,
    array['cccccccc-cccc-4ccc-8ccc-cccccccccc11']::uuid[],
    'active'
  );

select set_config('request.jwt.claim.role', 'anon', true);
set local role anon;

do $$
declare
  row_count int;
begin
  select count(*)
  into row_count
  from public.get_shared_control_runs(
    'inspector-smoke-active-token',
    current_date - 1,
    current_date + 1,
    array[]::uuid[]
  );

  if row_count <> 1 then
    raise exception 'Inspector smoke failure: active token returned % rows, expected 1', row_count;
  end if;

  select count(*)
  into row_count
  from public.get_shared_control_type_options('inspector-smoke-active-token');

  if row_count <> 1 then
    raise exception 'Inspector smoke failure: active token returned % control type options, expected 1', row_count;
  end if;

  select count(*)
  into row_count
  from public.get_shared_control_runs(
    'inspector-smoke-expired-token',
    current_date - 1,
    current_date + 1,
    array[]::uuid[]
  );

  if row_count <> 0 then
    raise exception 'Inspector smoke failure: expired token returned % rows, expected 0', row_count;
  end if;

  select count(*)
  into row_count
  from public.get_shared_control_runs(
    'inspector-smoke-active-token',
    current_date - 30,
    current_date - 20,
    array[]::uuid[]
  );

  if row_count <> 0 then
    raise exception 'Inspector smoke failure: out-of-period filter returned % rows, expected 0', row_count;
  end if;

  raise notice 'Inspector link smoke test passed. Rolling back test data.';
end $$;

rollback;
