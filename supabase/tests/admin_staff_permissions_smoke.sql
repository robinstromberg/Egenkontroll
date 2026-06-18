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
values (
  'dddddddd-dddd-4ddd-8ddd-dddddddddd11',
  'Admin Staff Smoke Org',
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

    raise exception 'Permission failure: staff created a share link';
  exception
    when insufficient_privilege or with_check_option_violation then
      null;
  end;

  raise notice 'Admin/staff permission smoke test passed. Rolling back test data.';
end $$;

rollback;
