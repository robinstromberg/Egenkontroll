-- Immutable control history smoke test for a disposable database.
-- All fixtures and transitions are rolled back.

begin;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  (
    'f1111111-1111-4111-8111-111111111101',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'history-member@example.test',
    extensions.crypt('history-member-password', extensions.gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now()
  ),
  (
    'f1111111-1111-4111-8111-111111111102',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'history-other@example.test',
    extensions.crypt('history-other-password', extensions.gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    now(), now()
  );

insert into public.organizations (id, name, subscription_status, created_by)
values
  ('f1111111-1111-4111-8111-111111111111', 'History Org A', 'trial', 'f1111111-1111-4111-8111-111111111101'),
  ('f1111111-1111-4111-8111-111111111112', 'History Org B', 'trial', 'f1111111-1111-4111-8111-111111111101');

insert into public.organization_memberships (organization_id, user_id, role, status)
values
  ('f1111111-1111-4111-8111-111111111111', 'f1111111-1111-4111-8111-111111111101', 'owner', 'active'),
  ('f1111111-1111-4111-8111-111111111112', 'f1111111-1111-4111-8111-111111111101', 'owner', 'active'),
  ('f1111111-1111-4111-8111-111111111112', 'f1111111-1111-4111-8111-111111111102', 'staff', 'active');

insert into public.control_types (id, organization_id, name, category, frequency, active)
values
  ('f1111111-1111-4111-8111-111111111121', 'f1111111-1111-4111-8111-111111111111', 'History Type A', 'temperature', 'daily', true),
  ('f1111111-1111-4111-8111-111111111122', 'f1111111-1111-4111-8111-111111111112', 'History Type B', 'temperature', 'daily', true);

insert into public.control_runs (
  id, organization_id, control_type_id, performed_by, performed_at, status
)
values
  (
    'f1111111-1111-4111-8111-111111111131',
    'f1111111-1111-4111-8111-111111111111',
    'f1111111-1111-4111-8111-111111111121',
    'f1111111-1111-4111-8111-111111111101',
    '2026-07-01T08:00:00Z',
    'completed_with_deviation'
  ),
  (
    'f1111111-1111-4111-8111-111111111132',
    'f1111111-1111-4111-8111-111111111112',
    'f1111111-1111-4111-8111-111111111122',
    'f1111111-1111-4111-8111-111111111101',
    '2026-07-01T09:00:00Z',
    'completed'
  );

insert into public.control_run_items (
  id, organization_id, control_run_id, object_snapshot, field_snapshot,
  value_text, status, deviation_detected, deviation_reason, action_text
)
values
  (
    'f1111111-1111-4111-8111-111111111141',
    'f1111111-1111-4111-8111-111111111111',
    'f1111111-1111-4111-8111-111111111131',
    '{}', '{}', '11', 'deviation', true, 'För varmt', 'Justerade termostat'
  ),
  (
    'f1111111-1111-4111-8111-111111111142',
    'f1111111-1111-4111-8111-111111111112',
    'f1111111-1111-4111-8111-111111111132',
    '{}', '{}', '4', 'ok', false, null, null
  );

insert into public.deviations (
  id, organization_id, control_run_id, control_run_item_id, control_type_id,
  status, severity, description, action_text, opened_by, opened_at
)
values (
  'f1111111-1111-4111-8111-111111111151',
  'f1111111-1111-4111-8111-111111111111',
  'f1111111-1111-4111-8111-111111111131',
  'f1111111-1111-4111-8111-111111111141',
  'f1111111-1111-4111-8111-111111111121',
  'open', 'medium', 'För varmt', 'Justerade termostat',
  'f1111111-1111-4111-8111-111111111101',
  '2026-07-01T08:00:00Z'
);

select set_config('request.jwt.claim.sub', 'f1111111-1111-4111-8111-111111111101', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

do $$
begin
  if has_table_privilege('authenticated', 'public.control_runs', 'UPDATE')
    or has_table_privilege('authenticated', 'public.control_run_items', 'UPDATE')
    or has_table_privilege('authenticated', 'public.deviations', 'UPDATE')
  then
    raise exception 'History privilege failure: authenticated retains table-level UPDATE';
  end if;

  if has_any_column_privilege('authenticated', 'public.control_runs', 'UPDATE')
    or has_any_column_privilege('authenticated', 'public.control_run_items', 'UPDATE')
    or has_any_column_privilege('authenticated', 'public.deviations', 'UPDATE')
  then
    raise exception 'History privilege failure: authenticated retains column-level UPDATE';
  end if;

  if has_function_privilege('anon', 'public.resolve_deviation(uuid, uuid, text)', 'EXECUTE') then
    raise exception 'Deviation transition privilege failure: anon can execute resolve_deviation';
  end if;

  if not has_function_privilege('authenticated', 'public.resolve_deviation(uuid, uuid, text)', 'EXECUTE') then
    raise exception 'Deviation transition privilege failure: authenticated cannot execute resolve_deviation';
  end if;
end;
$$;

do $$
begin
  begin
    update public.control_runs
    set organization_id = 'f1111111-1111-4111-8111-111111111112',
        control_type_id = 'f1111111-1111-4111-8111-111111111122'
    where id = 'f1111111-1111-4111-8111-111111111131';
    raise exception 'History security failure: member moved run across organizations';
  exception when insufficient_privilege then null;
  end;

  begin
    update public.control_runs
    set control_type_id = 'f1111111-1111-4111-8111-111111111122'
    where id = 'f1111111-1111-4111-8111-111111111131';
    raise exception 'History security failure: member rewrote control type';
  exception when insufficient_privilege then null;
  end;

  begin
    update public.control_runs
    set performed_by = 'f1111111-1111-4111-8111-111111111102'
    where id = 'f1111111-1111-4111-8111-111111111131';
    raise exception 'History security failure: member rewrote performer';
  exception when insufficient_privilege then null;
  end;

  begin
    update public.control_runs
    set performed_at = '2026-07-02T08:00:00Z'
    where id = 'f1111111-1111-4111-8111-111111111131';
    raise exception 'History security failure: member rewrote performed timestamp';
  exception when insufficient_privilege then null;
  end;

  begin
    update public.control_run_items
    set organization_id = 'f1111111-1111-4111-8111-111111111112',
        control_run_id = 'f1111111-1111-4111-8111-111111111132'
    where id = 'f1111111-1111-4111-8111-111111111141';
    raise exception 'History security failure: member moved run item';
  exception when insufficient_privilege then null;
  end;

  begin
    update public.deviations
    set organization_id = 'f1111111-1111-4111-8111-111111111112',
        control_run_id = 'f1111111-1111-4111-8111-111111111132',
        control_run_item_id = 'f1111111-1111-4111-8111-111111111142',
        control_type_id = 'f1111111-1111-4111-8111-111111111122',
        opened_by = 'f1111111-1111-4111-8111-111111111102',
        opened_at = '2026-07-02T09:00:00Z',
        created_at = '2026-07-02T09:00:00Z'
    where id = 'f1111111-1111-4111-8111-111111111151';
    raise exception 'History security failure: member rewrote deviation identity';
  exception when insufficient_privilege then null;
  end;

  begin
    update public.deviations
    set status = 'resolved',
        resolved_by = 'f1111111-1111-4111-8111-111111111102',
        resolved_at = '2026-07-02T09:00:00Z'
    where id = 'f1111111-1111-4111-8111-111111111151';
    raise exception 'Deviation transition failure: direct client resolution succeeded';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.control_run_items (
      id, organization_id, control_run_id, object_snapshot, field_snapshot,
      value_text, status, deviation_detected
    )
    values (
      'f1111111-1111-4111-8111-111111111143',
      'f1111111-1111-4111-8111-111111111111',
      'f1111111-1111-4111-8111-111111111132',
      '{}', '{}', 'cross-org-client', 'ok', false
    );
    raise exception 'History RLS failure: member inserted cross-org run item';
  exception when insufficient_privilege or with_check_option_violation then null;
  end;
end;
$$;

do $$
declare
  unchanged_count integer;
begin
  select count(*)
  into unchanged_count
  from public.control_runs run
  join public.control_run_items item
    on item.id = 'f1111111-1111-4111-8111-111111111141'
  join public.deviations deviation
    on deviation.id = 'f1111111-1111-4111-8111-111111111151'
  where run.id = 'f1111111-1111-4111-8111-111111111131'
    and run.organization_id = 'f1111111-1111-4111-8111-111111111111'
    and run.control_type_id = 'f1111111-1111-4111-8111-111111111121'
    and run.performed_by = 'f1111111-1111-4111-8111-111111111101'
    and run.performed_at = '2026-07-01T08:00:00Z'::timestamptz
    and item.organization_id = run.organization_id
    and item.control_run_id = run.id
    and deviation.organization_id = run.organization_id
    and deviation.control_run_id = run.id
    and deviation.control_run_item_id = item.id
    and deviation.status = 'open'
    and deviation.resolved_by is null
    and deviation.resolved_at is null;

  if unchanged_count <> 1 then
    raise exception 'History security failure: blocked client writes changed saved history';
  end if;
end;
$$;

do $$
declare
  transition_statement_at timestamptz := statement_timestamp();
  resolved public.deviations;
begin
  select *
  into resolved
  from public.resolve_deviation(
    'f1111111-1111-4111-8111-111111111111',
    'f1111111-1111-4111-8111-111111111151',
    '  Återkontroll godkänd.  '
  );

  if resolved.status <> 'resolved'
    or resolved.resolved_by <> 'f1111111-1111-4111-8111-111111111101'
    or resolved.resolved_at is null
    or resolved.resolved_at < transition_statement_at
    or resolved.resolved_at > clock_timestamp()
    or resolved.follow_up_comment <> 'Återkontroll godkänd.'
  then
    raise exception 'Deviation transition failure: server-controlled resolution was not persisted';
  end if;

  if resolved.organization_id <> 'f1111111-1111-4111-8111-111111111111'
    or resolved.control_run_id <> 'f1111111-1111-4111-8111-111111111131'
    or resolved.control_run_item_id <> 'f1111111-1111-4111-8111-111111111141'
    or resolved.control_type_id <> 'f1111111-1111-4111-8111-111111111121'
    or resolved.opened_by <> 'f1111111-1111-4111-8111-111111111101'
    or resolved.opened_at <> '2026-07-01T08:00:00Z'::timestamptz
  then
    raise exception 'Deviation transition failure: resolution changed immutable identity';
  end if;

  begin
    perform public.resolve_deviation(
      'f1111111-1111-4111-8111-111111111111',
      'f1111111-1111-4111-8111-111111111151',
      'Försök igen'
    );
    raise exception 'Deviation transition failure: resolved deviation was resolved twice';
  exception when invalid_parameter_value then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', 'f1111111-1111-4111-8111-111111111102', true);

do $$
begin
  begin
    perform public.resolve_deviation(
      'f1111111-1111-4111-8111-111111111111',
      'f1111111-1111-4111-8111-111111111151',
      'Obehörig'
    );
    raise exception 'Deviation transition failure: non-member resolved deviation';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;

do $$
begin
  begin
    insert into public.control_run_items (
      id, organization_id, control_run_id, object_snapshot, field_snapshot,
      value_text, status, deviation_detected
    )
    values (
      'f1111111-1111-4111-8111-111111111143',
      'f1111111-1111-4111-8111-111111111111',
      'f1111111-1111-4111-8111-111111111132',
      '{}', '{}', 'cross-org', 'ok', false
    );
    raise exception 'History constraint failure: cross-org run item was inserted';
  exception when foreign_key_violation then null;
  end;

  begin
    insert into public.deviations (
      id, organization_id, control_run_id, control_run_item_id, control_type_id,
      status, severity, description, action_text, opened_by
    )
    values (
      'f1111111-1111-4111-8111-111111111152',
      'f1111111-1111-4111-8111-111111111111',
      'f1111111-1111-4111-8111-111111111131',
      'f1111111-1111-4111-8111-111111111142',
      'f1111111-1111-4111-8111-111111111121',
      'open', 'medium', 'Mismatched item', 'None',
      'f1111111-1111-4111-8111-111111111101'
    );
    raise exception 'History constraint failure: mismatched deviation item was inserted';
  exception when foreign_key_violation then null;
  end;

  begin
    update public.control_runs
    set performed_at = '2026-07-03T08:00:00Z'
    where id = 'f1111111-1111-4111-8111-111111111131';
    raise exception 'History trigger failure: privileged identity rewrite succeeded';
  exception when check_violation then null;
  end;
end;
$$;

do $$
begin
  raise notice 'Immutable control history smoke test passed. Rolling back test data.';
end;
$$;

rollback;

select 'PASS: immutable control history smoke test; all fixtures rolled back' as result;
