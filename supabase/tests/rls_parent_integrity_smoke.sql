-- RLS parent integrity smoke test for disposable local/staging databases.
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
    '99999999-9999-4999-8999-999999999991',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-parent-a@example.test',
    extensions.crypt('test-password-a', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '99999999-9999-4999-8999-999999999992',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-parent-b@example.test',
    extensions.crypt('test-password-b', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

insert into public.organizations (id, name, subscription_status, created_by)
values
  ('99999999-9999-4999-8999-999999999901', 'RLS Parent Org A', 'trial', '99999999-9999-4999-8999-999999999991'),
  ('99999999-9999-4999-8999-999999999902', 'RLS Parent Org B', 'trial', '99999999-9999-4999-8999-999999999992');

insert into public.organization_memberships (organization_id, user_id, role, status)
values
  ('99999999-9999-4999-8999-999999999901', '99999999-9999-4999-8999-999999999991', 'owner', 'active'),
  ('99999999-9999-4999-8999-999999999902', '99999999-9999-4999-8999-999999999992', 'owner', 'active');

insert into public.control_types (id, organization_id, name, category, frequency, active)
values
  ('99999999-9999-4999-8999-999999999911', '99999999-9999-4999-8999-999999999901', 'RLS Parent Type A', 'checklist', 'daily', true),
  ('99999999-9999-4999-8999-999999999912', '99999999-9999-4999-8999-999999999902', 'RLS Parent Type B', 'checklist', 'daily', true),
  ('99999999-9999-4999-8999-999999999913', '99999999-9999-4999-8999-999999999901', 'RLS Parent Type A Other', 'checklist', 'daily', true);

insert into public.control_objects (id, organization_id, control_type_id, name, active)
values
  ('99999999-9999-4999-8999-999999999921', '99999999-9999-4999-8999-999999999901', '99999999-9999-4999-8999-999999999911', 'RLS Parent Object A', true),
  ('99999999-9999-4999-8999-999999999922', '99999999-9999-4999-8999-999999999902', '99999999-9999-4999-8999-999999999912', 'RLS Parent Object B', true),
  ('99999999-9999-4999-8999-999999999923', '99999999-9999-4999-8999-999999999901', '99999999-9999-4999-8999-999999999913', 'RLS Parent Object A Other', true);

insert into public.control_field_definitions (
  id,
  organization_id,
  control_type_id,
  field_key,
  label,
  field_type,
  required
)
values
  ('99999999-9999-4999-8999-999999999931', '99999999-9999-4999-8999-999999999901', '99999999-9999-4999-8999-999999999911', 'status', 'Status', 'ok_not_ok', true),
  ('99999999-9999-4999-8999-999999999932', '99999999-9999-4999-8999-999999999902', '99999999-9999-4999-8999-999999999912', 'status', 'Status', 'ok_not_ok', true),
  ('99999999-9999-4999-8999-999999999933', '99999999-9999-4999-8999-999999999901', '99999999-9999-4999-8999-999999999913', 'status', 'Status', 'ok_not_ok', true);

insert into public.control_runs (id, organization_id, control_type_id, performed_by, status)
values (
  '99999999-9999-4999-8999-999999999942',
  '99999999-9999-4999-8999-999999999902',
  '99999999-9999-4999-8999-999999999912',
  '99999999-9999-4999-8999-999999999992',
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
  '99999999-9999-4999-8999-999999999952',
  '99999999-9999-4999-8999-999999999902',
  '99999999-9999-4999-8999-999999999942',
  '99999999-9999-4999-8999-999999999922',
  '99999999-9999-4999-8999-999999999932',
  '{"name":"RLS Parent Object B"}',
  '{"label":"Status"}',
  true,
  'ok'
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
  description,
  action_text
)
values (
  '99999999-9999-4999-8999-999999999962',
  '99999999-9999-4999-8999-999999999902',
  '99999999-9999-4999-8999-999999999942',
  '99999999-9999-4999-8999-999999999952',
  '99999999-9999-4999-8999-999999999912',
  '99999999-9999-4999-8999-999999999922',
  '99999999-9999-4999-8999-999999999992',
  'open',
  'RLS Parent Deviation B',
  'RLS Parent action B'
);

insert into public.control_runs (id, organization_id, control_type_id, performed_by, status)
values (
  '99999999-9999-4999-8999-999999999943',
  '99999999-9999-4999-8999-999999999901',
  '99999999-9999-4999-8999-999999999913',
  '99999999-9999-4999-8999-999999999991',
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
  '99999999-9999-4999-8999-999999999953',
  '99999999-9999-4999-8999-999999999901',
  '99999999-9999-4999-8999-999999999943',
  '99999999-9999-4999-8999-999999999923',
  '99999999-9999-4999-8999-999999999933',
  '{"name":"RLS Parent Object A Other"}',
  '{"label":"Status"}',
  true,
  'ok'
);

select set_config('request.jwt.claim.sub', '99999999-9999-4999-8999-999999999991', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

insert into public.control_runs (id, organization_id, control_type_id, performed_by, status)
values (
  '99999999-9999-4999-8999-999999999941',
  '99999999-9999-4999-8999-999999999901',
  '99999999-9999-4999-8999-999999999911',
  '99999999-9999-4999-8999-999999999991',
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
  value_boolean,
  status,
  deviation_detected,
  deviation_reason,
  action_text
)
values (
  '99999999-9999-4999-8999-999999999951',
  '99999999-9999-4999-8999-999999999901',
  '99999999-9999-4999-8999-999999999941',
  '99999999-9999-4999-8999-999999999921',
  '99999999-9999-4999-8999-999999999931',
  '{"name":"RLS Parent Object A"}',
  '{"label":"Status"}',
  false,
  'deviation',
  true,
  'RLS Parent deviation reason A',
  'RLS Parent action A'
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
  description,
  action_text
)
values (
  '99999999-9999-4999-8999-999999999961',
  '99999999-9999-4999-8999-999999999901',
  '99999999-9999-4999-8999-999999999941',
  '99999999-9999-4999-8999-999999999951',
  '99999999-9999-4999-8999-999999999911',
  '99999999-9999-4999-8999-999999999921',
  '99999999-9999-4999-8999-999999999991',
  'open',
  'RLS Parent Deviation A',
  'RLS Parent action A'
);

insert into public.attachments (
  id,
  organization_id,
  control_run_id,
  control_run_item_id,
  deviation_id,
  storage_bucket,
  storage_path,
  file_name,
  content_type,
  size_bytes,
  uploaded_by
)
values (
  '99999999-9999-4999-8999-999999999971',
  '99999999-9999-4999-8999-999999999901',
  '99999999-9999-4999-8999-999999999941',
  '99999999-9999-4999-8999-999999999951',
  '99999999-9999-4999-8999-999999999961',
  'control-attachments',
  '99999999-9999-4999-8999-999999999901/99999999-9999-4999-8999-999999999941/99999999-9999-4999-8999-999999999951/rls-parent-a.jpg',
  'rls-parent-a.jpg',
  'image/jpeg',
  128,
  '99999999-9999-4999-8999-999999999991'
);

do $$
begin
  begin
    insert into public.control_runs (
      id,
      organization_id,
      control_type_id,
      performed_by,
      status
    )
    values (
      '99999999-9999-4999-8999-999999999981',
      '99999999-9999-4999-8999-999999999901',
      '99999999-9999-4999-8999-999999999912',
      '99999999-9999-4999-8999-999999999991',
      'completed'
    );

    raise exception 'RLS parent failure: cross-org control_run was created';
  exception
    when insufficient_privilege or with_check_option_violation then
      null;
  end;

  begin
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
      '99999999-9999-4999-8999-999999999982',
      '99999999-9999-4999-8999-999999999901',
      '99999999-9999-4999-8999-999999999942',
      '99999999-9999-4999-8999-999999999921',
      '99999999-9999-4999-8999-999999999931',
      '{}',
      '{}',
      true,
      'ok'
    );

    raise exception 'RLS parent failure: cross-org control_run_item run reference was created';
  exception
    when insufficient_privilege or with_check_option_violation then
      null;
  end;

  begin
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
      '99999999-9999-4999-8999-999999999983',
      '99999999-9999-4999-8999-999999999901',
      '99999999-9999-4999-8999-999999999941',
      '99999999-9999-4999-8999-999999999922',
      '99999999-9999-4999-8999-999999999932',
      '{}',
      '{}',
      true,
      'ok'
    );

    raise exception 'RLS parent failure: cross-org control_run_item object or field reference was created';
  exception
    when insufficient_privilege or with_check_option_violation then
      null;
  end;

  begin
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
      '99999999-9999-4999-8999-999999999987',
      '99999999-9999-4999-8999-999999999901',
      '99999999-9999-4999-8999-999999999941',
      '99999999-9999-4999-8999-999999999923',
      '99999999-9999-4999-8999-999999999933',
      '{}',
      '{}',
      true,
      'ok'
    );

    raise exception 'RLS parent failure: same-org wrong-type control_run_item was created';
  exception
    when insufficient_privilege or with_check_option_violation then
      null;
  end;

  begin
    insert into public.deviations (
      id,
      organization_id,
      control_run_id,
      control_run_item_id,
      control_type_id,
      control_object_id,
      opened_by,
      status,
      description,
      action_text
    )
    values (
      '99999999-9999-4999-8999-999999999984',
      '99999999-9999-4999-8999-999999999901',
      '99999999-9999-4999-8999-999999999942',
      '99999999-9999-4999-8999-999999999951',
      '99999999-9999-4999-8999-999999999911',
      '99999999-9999-4999-8999-999999999921',
      '99999999-9999-4999-8999-999999999991',
      'open',
      'Should fail',
      'Should fail'
    );

    raise exception 'RLS parent failure: cross-org deviation was created';
  exception
    when insufficient_privilege or with_check_option_violation then
      null;
  end;

  begin
    insert into public.deviations (
      id,
      organization_id,
      control_run_id,
      control_run_item_id,
      control_type_id,
      control_object_id,
      opened_by,
      status,
      description,
      action_text
    )
    values (
      '99999999-9999-4999-8999-999999999989',
      '99999999-9999-4999-8999-999999999901',
      '99999999-9999-4999-8999-999999999941',
      '99999999-9999-4999-8999-999999999953',
      '99999999-9999-4999-8999-999999999911',
      '99999999-9999-4999-8999-999999999921',
      '99999999-9999-4999-8999-999999999991',
      'open',
      'Should fail',
      'Should fail'
    );

    raise exception 'RLS parent failure: same-org deviation with wrong run item was created';
  exception
    when insufficient_privilege or with_check_option_violation then
      null;
  end;

  begin
    insert into public.attachments (
      id,
      organization_id,
      control_run_id,
      control_run_item_id,
      storage_bucket,
      storage_path,
      file_name,
      content_type,
      size_bytes,
      uploaded_by
    )
    values (
      '99999999-9999-4999-8999-999999999988',
      '99999999-9999-4999-8999-999999999901',
      '99999999-9999-4999-8999-999999999941',
      '99999999-9999-4999-8999-999999999953',
      'control-attachments',
      '99999999-9999-4999-8999-999999999901/99999999-9999-4999-8999-999999999941/99999999-9999-4999-8999-999999999953/should-fail.jpg',
      'should-fail.jpg',
      'image/jpeg',
      128,
      '99999999-9999-4999-8999-999999999991'
    );

    raise exception 'RLS parent failure: same-org attachment with wrong run item was created';
  exception
    when insufficient_privilege or with_check_option_violation then
      null;
  end;

  begin
    insert into public.attachments (
      id,
      organization_id,
      control_run_id,
      control_run_item_id,
      storage_bucket,
      storage_path,
      file_name,
      content_type,
      size_bytes,
      uploaded_by
    )
    values (
      '99999999-9999-4999-8999-999999999985',
      '99999999-9999-4999-8999-999999999901',
      '99999999-9999-4999-8999-999999999942',
      '99999999-9999-4999-8999-999999999951',
      'control-attachments',
      '99999999-9999-4999-8999-999999999901/99999999-9999-4999-8999-999999999941/99999999-9999-4999-8999-999999999951/should-fail.jpg',
      'should-fail.jpg',
      'image/jpeg',
      128,
      '99999999-9999-4999-8999-999999999991'
    );

    raise exception 'RLS parent failure: cross-org attachment run reference was created';
  exception
    when insufficient_privilege or with_check_option_violation then
      null;
  end;

  begin
    insert into public.attachments (
      id,
      organization_id,
      control_run_id,
      control_run_item_id,
      storage_bucket,
      storage_path,
      file_name,
      content_type,
      size_bytes,
      uploaded_by
    )
    values (
      '99999999-9999-4999-8999-999999999986',
      '99999999-9999-4999-8999-999999999901',
      '99999999-9999-4999-8999-999999999941',
      '99999999-9999-4999-8999-999999999951',
      'control-attachments',
      '99999999-9999-4999-8999-999999999902/99999999-9999-4999-8999-999999999941/99999999-9999-4999-8999-999999999951/should-fail.jpg',
      'should-fail.jpg',
      'image/jpeg',
      128,
      '99999999-9999-4999-8999-999999999991'
    );

    raise exception 'RLS parent failure: attachment with cross-org storage path was created';
  exception
    when insufficient_privilege or with_check_option_violation then
      null;
  end;

  raise notice 'RLS parent integrity smoke test passed. Rolling back test data.';
end $$;

rollback;
