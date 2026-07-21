-- Admin/staff permission smoke test for disposable local/staging databases.
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
values
  (
    'dddddddd-dddd-4ddd-8ddd-dddddddddd01',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin-staff-owner@example.test',
    extensions.crypt('test-owner-password', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    'dddddddd-dddd-4ddd-8ddd-dddddddddd02',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin-staff-staff@example.test',
    extensions.crypt('test-staff-password', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

insert into public.organizations (id, name, subscription_status, created_by)
values
  (
    'dddddddd-dddd-4ddd-8ddd-dddddddddd11',
    'Admin Staff Smoke Org',
    'trial',
    'dddddddd-dddd-4ddd-8ddd-dddddddddd01'
  ),
  (
    'dddddddd-dddd-4ddd-8ddd-dddddddddd12',
    'Other Admin Staff Smoke Org',
    'trial',
    'dddddddd-dddd-4ddd-8ddd-dddddddddd01'
  );

insert into public.organization_memberships (organization_id, user_id, role, status)
values
  ('dddddddd-dddd-4ddd-8ddd-dddddddddd11', 'dddddddd-dddd-4ddd-8ddd-dddddddddd01', 'owner', 'active'),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddd11', 'dddddddd-dddd-4ddd-8ddd-dddddddddd02', 'staff', 'active');

insert into public.control_types (id, organization_id, name, category, frequency, active)
values (
  'dddddddd-dddd-4ddd-8ddd-dddddddddd21',
  'dddddddd-dddd-4ddd-8ddd-dddddddddd11',
  'Admin Staff Smoke Type',
  'checklist',
  'daily',
  true
);

insert into public.control_objects (id, organization_id, control_type_id, name, active)
values (
  'dddddddd-dddd-4ddd-8ddd-dddddddddd31',
  'dddddddd-dddd-4ddd-8ddd-dddddddddd11',
  'dddddddd-dddd-4ddd-8ddd-dddddddddd21',
  'Admin Staff Smoke Object',
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
  'dddddddd-dddd-4ddd-8ddd-dddddddddd41',
  'dddddddd-dddd-4ddd-8ddd-dddddddddd11',
  'dddddddd-dddd-4ddd-8ddd-dddddddddd21',
  'status',
  'Status',
  'ok_not_ok',
  true
);

select set_config('request.jwt.claim.sub', 'dddddddd-dddd-4ddd-8ddd-dddddddddd02', true);
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
  'dddddddd-dddd-4ddd-8ddd-dddddddddd51',
  'dddddddd-dddd-4ddd-8ddd-dddddddddd11',
  'dddddddd-dddd-4ddd-8ddd-dddddddddd21',
  'dddddddd-dddd-4ddd-8ddd-dddddddddd02',
  'completed'
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
  'dddddddd-dddd-4ddd-8ddd-dddddddddd52',
  'dddddddd-dddd-4ddd-8ddd-dddddddddd11',
  'dddddddd-dddd-4ddd-8ddd-dddddddddd51',
  'dddddddd-dddd-4ddd-8ddd-dddddddddd31',
  'dddddddd-dddd-4ddd-8ddd-dddddddddd41',
  '{"name":"Admin Staff Smoke Object"}',
  '{"label":"Status"}',
  true,
  'ok'
);

do $$
declare
  first_share record;
  second_share record;
  affected_count int;
  visible_count int;
begin
  begin
    insert into public.control_types (
      id,
      organization_id,
      name,
      category,
      frequency,
      active
    )
    values (
      'dddddddd-dddd-4ddd-8ddd-dddddddddd61',
      'dddddddd-dddd-4ddd-8ddd-dddddddddd11',
      'Staff Should Not Create Type',
      'checklist',
      'daily',
      true
    );

    raise exception 'Permission failure: staff created a control type';
  exception
    when insufficient_privilege or with_check_option_violation then
      null;
  end;

  begin
    insert into public.share_links (
      id,
      organization_id,
      token_hash,
      valid_from,
      valid_until,
      period_start,
      period_end,
      created_by,
      status
    )
    values (
      'dddddddd-dddd-4ddd-8ddd-dddddddddd71',
      'dddddddd-dddd-4ddd-8ddd-dddddddddd11',
      encode(extensions.digest('admin-staff-smoke-token', 'sha256'), 'hex'),
      now() - interval '1 minute',
      now() + interval '1 hour',
      current_date - 7,
      current_date,
      'dddddddd-dddd-4ddd-8ddd-dddddddddd02',
      'active'
    );

    raise exception 'Permission failure: staff bypassed the temporary inspector RPC';
  exception
    when insufficient_privilege or with_check_option_violation then
      null;
  end;

  select *
  into first_share
  from public.create_temporary_inspector_share_link('dddddddd-dddd-4ddd-8ddd-dddddddddd11');

  select *
  into second_share
  from public.create_temporary_inspector_share_link('dddddddd-dddd-4ddd-8ddd-dddddddddd11');

  if first_share.raw_token !~ '^[0-9a-f]{48}$' then
    raise exception 'Permission failure: temporary inspector token has unexpected format';
  end if;

  if first_share.raw_token = second_share.raw_token then
    raise exception 'Permission failure: temporary inspector tokens were reused';
  end if;

  if first_share.valid_until < statement_timestamp() + interval '6 days 23 hours 59 minutes'
    or first_share.valid_until > statement_timestamp() + interval '7 days 1 minute' then
    raise exception 'Permission failure: temporary inspector link does not expire after seven days';
  end if;

  begin
    perform *
    from public.create_temporary_inspector_share_link('dddddddd-dddd-4ddd-8ddd-dddddddddd12');
    raise exception 'Permission failure: staff created a link for another organization';
  exception
    when insufficient_privilege then
      null;
  end;

  select count(*)
  into visible_count
  from public.share_links
  where organization_id = 'dddddddd-dddd-4ddd-8ddd-dddddddddd11';

  if visible_count <> 0 then
    raise exception 'Permission failure: staff can list share links';
  end if;

  update public.share_links
  set status = 'revoked'
  where organization_id = 'dddddddd-dddd-4ddd-8ddd-dddddddddd11';
  get diagnostics affected_count = row_count;
  if affected_count <> 0 then
    raise exception 'Permission failure: staff updated share links';
  end if;

  delete from public.share_links
  where organization_id = 'dddddddd-dddd-4ddd-8ddd-dddddddddd11';
  get diagnostics affected_count = row_count;
  if affected_count <> 0 then
    raise exception 'Permission failure: staff deleted share links';
  end if;

  raise notice 'Active staff temporary inspector sharing checks passed.';
end $$;

reset role;

do $$
declare
  stored_count int;
  invalid_scope_count int;
begin
  select count(*)
  into stored_count
  from public.share_links
  where organization_id = 'dddddddd-dddd-4ddd-8ddd-dddddddddd11'
    and created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddd02';

  if stored_count <> 2 then
    raise exception 'Permission failure: expected 2 staff-created links, found %', stored_count;
  end if;

  select count(*)
  into invalid_scope_count
  from public.share_links
  where organization_id = 'dddddddd-dddd-4ddd-8ddd-dddddddddd11'
    and created_by = 'dddddddd-dddd-4ddd-8ddd-dddddddddd02'
    and (
      token_hash !~ '^[0-9a-f]{64}$'
      or valid_until <> valid_from + interval '7 days'
      or period_start <> date '1900-01-01'
      or period_end <> date '9999-12-31'
      or cardinality(included_control_type_ids) <> 0
      or status <> 'active'
    );

  if invalid_scope_count <> 0 then
    raise exception 'Permission failure: staff-created link escaped the server-defined scope';
  end if;
end $$;

update public.organization_memberships
set status = 'disabled'
where organization_id = 'dddddddd-dddd-4ddd-8ddd-dddddddddd11'
  and user_id = 'dddddddd-dddd-4ddd-8ddd-dddddddddd02';

select set_config('request.jwt.claim.sub', 'dddddddd-dddd-4ddd-8ddd-dddddddddd02', true);
set local role authenticated;

do $$
begin
  begin
    perform *
    from public.create_temporary_inspector_share_link('dddddddd-dddd-4ddd-8ddd-dddddddddd11');
    raise exception 'Permission failure: disabled staff created a temporary inspector link';
  exception
    when insufficient_privilege then
      null;
  end;
end $$;

reset role;

update public.organization_memberships
set status = 'active'
where organization_id = 'dddddddd-dddd-4ddd-8ddd-dddddddddd11'
  and user_id = 'dddddddd-dddd-4ddd-8ddd-dddddddddd02';

select set_config('request.jwt.claim.sub', 'dddddddd-dddd-4ddd-8ddd-dddddddddd01', true);
set local role authenticated;

insert into public.share_links (
  organization_id,
  token_hash,
  valid_until,
  period_start,
  period_end,
  created_by,
  status
)
values (
  'dddddddd-dddd-4ddd-8ddd-dddddddddd11',
  encode(extensions.digest('admin-custom-share-token', 'sha256'), 'hex'),
  now() + interval '30 days',
  current_date - 30,
  current_date,
  'dddddddd-dddd-4ddd-8ddd-dddddddddd01',
  'active'
);

do $$
declare
  visible_count int;
begin
  select count(*)
  into visible_count
  from public.share_links
  where organization_id = 'dddddddd-dddd-4ddd-8ddd-dddddddddd11';

  if visible_count <> 3 then
    raise exception 'Permission failure: owner cannot retain existing link management';
  end if;

  raise notice 'Admin/staff permission smoke test passed. Rolling back test data.';
end $$;

rollback;
