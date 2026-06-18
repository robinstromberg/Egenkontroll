-- RLS isolation smoke test for disposable local/staging databases.
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
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-user-a@example.test',
    extensions.crypt('test-password-a', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rls-user-b@example.test',
    extensions.crypt('test-password-b', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

insert into public.organizations (id, name, subscription_status, created_by)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01', 'RLS Smoke Org A', 'trial', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02', 'RLS Smoke Org B', 'trial', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2');

insert into public.organization_memberships (organization_id, user_id, role, status)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'owner', 'active'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'owner', 'active');

insert into public.control_types (id, organization_id, name, category, frequency, active)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01', 'RLS Smoke Type A', 'checklist', 'daily', true),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb12', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02', 'RLS Smoke Type B', 'checklist', 'daily', true);

insert into public.control_objects (id, organization_id, control_type_id, name, active)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11', 'RLS Smoke Object A', true),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb22', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb12', 'RLS Smoke Object B', true);

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
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa41', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11', 'status', 'Status', 'ok_not_ok', true),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb42', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb12', 'status', 'Status', 'ok_not_ok', true);

insert into public.control_runs (id, organization_id, control_type_id, performed_by, status)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa31', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'completed'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb32', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb12', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'completed');

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
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa51',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa31',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa41',
    '{"name":"RLS Smoke Object A"}',
    '{"label":"Status"}',
    true,
    'ok'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb52',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb32',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb22',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb42',
    '{"name":"RLS Smoke Object B"}',
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
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa61',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa31',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa51',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa21',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    'open',
    'RLS Smoke Deviation A',
    'RLS smoke action A'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb62',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb32',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb52',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb12',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb22',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
    'open',
    'RLS Smoke Deviation B',
    'RLS smoke action B'
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
  size_bytes,
  uploaded_by
)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa81',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa31',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa51',
    'control-attachments',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa31/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa51/rls-smoke-a.jpg',
    'rls-smoke-a.jpg',
    'image/jpeg',
    128,
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb82',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb32',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb52',
    'control-attachments',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb32/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb52/rls-smoke-b.jpg',
    'rls-smoke-b.jpg',
    'image/jpeg',
    128,
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2'
  );

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
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa71',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01',
    encode(extensions.digest('rls-smoke-token-a', 'sha256'), 'hex'),
    now() - interval '1 minute',
    now() + interval '1 hour',
    current_date - 7,
    current_date,
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    'active'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb72',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02',
    encode(extensions.digest('rls-smoke-token-b', 'sha256'), 'hex'),
    now() - interval '1 minute',
    now() + interval '1 hour',
    current_date - 7,
    current_date,
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
    'active'
  );

select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

do $$
declare
  visible_count int;
begin
  select count(*) into visible_count from public.organizations where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02';
  if visible_count <> 0 then
    raise exception 'RLS failure: Account A can read organization B';
  end if;

  select count(*) into visible_count from public.control_types where organization_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02';
  if visible_count <> 0 then
    raise exception 'RLS failure: Account A can read organization B control types';
  end if;

  select count(*) into visible_count from public.control_objects where organization_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02';
  if visible_count <> 0 then
    raise exception 'RLS failure: Account A can read organization B control objects';
  end if;

  select count(*) into visible_count from public.control_runs where organization_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02';
  if visible_count <> 0 then
    raise exception 'RLS failure: Account A can read organization B control runs';
  end if;

  select count(*) into visible_count from public.control_run_items where organization_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02';
  if visible_count <> 0 then
    raise exception 'RLS failure: Account A can read organization B control run items';
  end if;

  select count(*) into visible_count from public.deviations where organization_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02';
  if visible_count <> 0 then
    raise exception 'RLS failure: Account A can read organization B deviations';
  end if;

  select count(*) into visible_count from public.attachments where organization_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02';
  if visible_count <> 0 then
    raise exception 'RLS failure: Account A can read organization B attachments';
  end if;

  select count(*) into visible_count from public.share_links where organization_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02';
  if visible_count <> 0 then
    raise exception 'RLS failure: Account A can read organization B share links';
  end if;
end $$;

select set_config('request.jwt.claim.sub', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', true);

do $$
declare
  visible_count int;
begin
  select count(*) into visible_count from public.organizations where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01';
  if visible_count <> 0 then
    raise exception 'RLS failure: Account B can read organization A';
  end if;

  select count(*) into visible_count from public.control_types where organization_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01';
  if visible_count <> 0 then
    raise exception 'RLS failure: Account B can read organization A control types';
  end if;

  select count(*) into visible_count from public.deviations where organization_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01';
  if visible_count <> 0 then
    raise exception 'RLS failure: Account B can read organization A deviations';
  end if;

  select count(*) into visible_count from public.attachments where organization_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01';
  if visible_count <> 0 then
    raise exception 'RLS failure: Account B can read organization A attachments';
  end if;

  raise notice 'RLS isolation smoke test passed. Rolling back test data.';
end $$;

rollback;
