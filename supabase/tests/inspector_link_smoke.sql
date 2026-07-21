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
values
  (
    'cccccccc-cccc-4ccc-8ccc-cccccccccc31',
    'cccccccc-cccc-4ccc-8ccc-cccccccccc01',
    'cccccccc-cccc-4ccc-8ccc-cccccccccc11',
    'completed',
    now(),
    'Inspector smoke run'
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-cccccccccc32',
    'cccccccc-cccc-4ccc-8ccc-cccccccccc01',
    'cccccccc-cccc-4ccc-8ccc-cccccccccc11',
    'completed',
    now() - interval '1 year',
    'Older inspector smoke run'
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

insert into public.attachments (
  id,
  organization_id,
  control_run_id,
  control_run_item_id,
  storage_bucket,
  storage_path,
  file_name,
  content_type,
  size_bytes
)
values (
  'cccccccc-cccc-4ccc-8ccc-cccccccccc61',
  'cccccccc-cccc-4ccc-8ccc-cccccccccc01',
  'cccccccc-cccc-4ccc-8ccc-cccccccccc31',
  'cccccccc-cccc-4ccc-8ccc-cccccccccc51',
  'control-attachments',
  'cccccccc-cccc-4ccc-8ccc-cccccccccc01/cccccccc-cccc-4ccc-8ccc-cccccccccc31/cccccccc-cccc-4ccc-8ccc-cccccccccc51/inspector-smoke.jpg',
  'inspector-smoke.jpg',
  'image/jpeg',
  128
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
    date '1900-01-01',
    date '9999-12-31',
    array['cccccccc-cccc-4ccc-8ccc-cccccccccc11']::uuid[],
    'active'
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-cccccccccc72',
    'cccccccc-cccc-4ccc-8ccc-cccccccccc01',
    encode(extensions.digest('inspector-smoke-expired-token', 'sha256'), 'hex'),
    now() - interval '2 hours',
    now() - interval '1 hour',
    date '1900-01-01',
    date '9999-12-31',
    array['cccccccc-cccc-4ccc-8ccc-cccccccccc11']::uuid[],
    'active'
  );

select set_config('request.jwt.claim.role', 'anon', true);
set local role anon;

do $$
declare
  row_count int;
  shared_row record;
  context_row record;
begin
  begin
    perform *
    from public.create_temporary_inspector_share_link('cccccccc-cccc-4ccc-8ccc-cccccccccc01');
    raise exception 'Inspector smoke failure: anonymous inspector created a share link';
  exception
    when insufficient_privilege then
      null;
  end;

  select *
  into context_row
  from public.get_shared_inspector_context('inspector-smoke-active-token');

  if context_row.organization_name <> 'Inspector Smoke Org' then
    raise exception 'Inspector smoke failure: context organization_name was %, expected Inspector Smoke Org', context_row.organization_name;
  end if;

  if context_row.valid_until is null then
    raise exception 'Inspector smoke failure: context did not expose link validity';
  end if;

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
  from public.get_shared_control_runs(
    'inspector-smoke-active-token',
    current_date - 400,
    current_date + 1,
    array[]::uuid[]
  );

  if row_count <> 2 then
    raise exception 'Inspector smoke failure: short-lived link returned % rows across older selected documentation, expected 2', row_count;
  end if;

  select *
  into shared_row
  from public.get_shared_control_runs(
    'inspector-smoke-active-token',
    current_date - 1,
    current_date + 1,
    array[]::uuid[]
  )
  limit 1;

  if shared_row.organization_name <> 'Inspector Smoke Org' then
    raise exception 'Inspector smoke failure: organization_name was %, expected Inspector Smoke Org', shared_row.organization_name;
  end if;

  if jsonb_array_length(shared_row.attachments) <> 1 then
    raise exception 'Inspector smoke failure: attachment metadata count was %, expected 1', jsonb_array_length(shared_row.attachments);
  end if;

  if shared_row.attachments #>> '{0,file_name}' <> 'inspector-smoke.jpg' then
    raise exception 'Inspector smoke failure: attachment file_name was %, expected inspector-smoke.jpg', shared_row.attachments #>> '{0,file_name}';
  end if;

  if (shared_row.attachments -> 0) ? 'storage_path' or (shared_row.attachments -> 0) ? 'storage_bucket' then
    raise exception 'Inspector smoke failure: shared attachment metadata exposes internal storage fields';
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
  from public.get_shared_inspector_context('inspector-smoke-expired-token');

  if row_count <> 0 then
    raise exception 'Inspector smoke failure: expired token returned inspector context';
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

  perform public.log_shared_export(
    'inspector-smoke-active-token',
    'pdf',
    '{"delivery":"smoke","recipient":"anonymous-inspector@example.test"}'::jsonb
  );

  raise notice 'Anonymous inspector token checks passed.';
end $$;

reset role;

do $$
declare
  export_log_count int;
begin
  select count(*)
  into export_log_count
  from public.export_logs logs
  join public.share_links links on links.id = logs.share_link_id
  where links.token_hash = encode(extensions.digest('inspector-smoke-active-token', 'sha256'), 'hex')
    and logs.requested_by is null
    and logs.filters ->> 'recipient' = 'anonymous-inspector@example.test';

  if export_log_count <> 1 then
    raise exception 'Inspector smoke failure: anonymous token logging created % rows, expected 1', export_log_count;
  end if;

  raise notice 'Inspector link smoke test passed. Rolling back test data.';
end $$;

rollback;
