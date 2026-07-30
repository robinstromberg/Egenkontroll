-- Organization invitations smoke test for disposable local/staging databases.
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
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'invite-owner@example.test',
    extensions.crypt('test-owner-password', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee02',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'invite-staff@example.test',
    extensions.crypt('test-staff-password', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee03',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'invitee@example.test',
    extensions.crypt('test-invitee-password', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee04',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'stranger@example.test',
    extensions.crypt('test-stranger-password', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee05',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'expired-invitee@example.test',
    extensions.crypt('test-expired-invitee-password', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee06',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'profile-writer@example.test',
    extensions.crypt('test-profile-writer-password', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

insert into public.profiles (id, email, full_name)
values
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01', 'invite-owner@example.test', 'Invite Owner'),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee02', 'invite-staff@example.test', 'Invite Staff'),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee03', 'invitee@example.test', 'Invitee'),
  -- Deliberately forged profile e-mail: the Auth identity remains stranger@example.test.
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee04', 'invitee@example.test', 'Stranger'),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee05', 'expired-invitee@example.test', 'Expired Invitee');

insert into public.organizations (id, name, subscription_status, created_by)
values (
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee11',
  'Organization Invitations Smoke Org',
  'trial',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01'
);

insert into public.organization_memberships (organization_id, user_id, role, status)
values
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee11', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01', 'owner', 'active'),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee11', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee02', 'staff', 'active');

insert into public.organization_invitations (
  id,
  organization_id,
  email,
  role,
  status,
  invited_by,
  expires_at
)
values
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee23',
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee11',
    'invitee@example.test',
    'staff',
    'revoked',
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01',
    now() + interval '7 days'
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee24',
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee11',
    'expired-invitee@example.test',
    'staff',
    'pending',
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01',
    now() - interval '1 minute'
  );

select set_config('request.jwt.claim.sub', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

do $$
begin
  if has_table_privilege('authenticated', 'public.profiles', 'INSERT') then
    raise exception 'Profile privilege failure: authenticated retains table-level INSERT';
  end if;

  if has_table_privilege('authenticated', 'public.profiles', 'UPDATE') then
    raise exception 'Profile privilege failure: authenticated retains table-level UPDATE';
  end if;

  if has_column_privilege('authenticated', 'public.profiles', 'email', 'INSERT') then
    raise exception 'Profile privilege failure: authenticated can INSERT profiles.email';
  end if;

  if has_column_privilege('authenticated', 'public.profiles', 'email', 'UPDATE') then
    raise exception 'Profile privilege failure: authenticated can UPDATE profiles.email';
  end if;

  if not has_column_privilege('authenticated', 'public.profiles', 'id', 'INSERT') then
    raise exception 'Profile privilege failure: authenticated cannot INSERT profiles.id';
  end if;

  if not has_column_privilege('authenticated', 'public.profiles', 'full_name', 'INSERT') then
    raise exception 'Profile privilege failure: authenticated cannot INSERT profiles.full_name';
  end if;

  if not has_column_privilege('authenticated', 'public.profiles', 'full_name', 'UPDATE') then
    raise exception 'Profile privilege failure: authenticated cannot UPDATE profiles.full_name';
  end if;
end $$;

select set_config('request.jwt.claim.sub', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee06', true);

insert into public.profiles (id, full_name)
values ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee06', 'Profile Writer');

update public.profiles
set full_name = 'Profile Writer Updated'
where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee06';

do $$
declare
  profile_count int;
begin
  select count(*)
  into profile_count
  from public.profiles
  where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee06'
    and full_name = 'Profile Writer Updated'
    and email is null;

  if profile_count <> 1 then
    raise exception 'Profile flow failure: authenticated could not write id/full_name without email';
  end if;
end $$;

select set_config('request.jwt.claim.sub', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01', true);

insert into public.organization_invitations (
  id,
  organization_id,
  email,
  role,
  status,
  invited_by,
  expires_at
)
values (
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee21',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee11',
  'invitee@example.test',
  'staff',
  'pending',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01',
  now() + interval '7 days'
);

select set_config('request.jwt.claim.sub', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee02', true);

do $$
begin
  begin
    insert into public.organization_invitations (
      id,
      organization_id,
      email,
      role,
      status,
      invited_by,
      expires_at
    )
    values (
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee22',
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee11',
      'staff-created@example.test',
      'staff',
      'pending',
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee02',
      now() + interval '7 days'
    );

    raise exception 'Permission failure: staff created an invitation';
  exception
    when insufficient_privilege or with_check_option_violation then
      null;
  end;
end $$;

select set_config('request.jwt.claim.sub', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee04', true);

do $$
begin
  begin
    update public.profiles
    set email = 'attacker-controlled@example.test'
    where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee04';

    raise exception 'Profile security failure: authenticated client rewrote profile email';
  exception
    when insufficient_privilege then
      null;
  end;
end $$;

do $$
declare
  visible_count int;
begin
  select count(*)
  into visible_count
  from public.organization_invitations
  where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee21';

  if visible_count <> 0 then
    raise exception 'RLS failure: stranger can read invitee invitation';
  end if;
end $$;

do $$
begin
  begin
    perform public.accept_organization_invitation('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee21');
    raise exception 'Invitation security failure: forged profile email accepted invitation';
  exception
    when others then
      if sqlerrm = 'Invitation security failure: forged profile email accepted invitation' then
        raise;
      end if;
      if sqlerrm <> 'Invitation does not match current user email' then
        raise exception 'Invitation security failure: forged profile email returned unexpected error: %', sqlerrm;
      end if;
  end;
end $$;

select set_config('request.jwt.claim.sub', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee03', true);

do $$
declare
  visible_count int;
  accepted_organization_id uuid;
begin
  select count(*)
  into visible_count
  from public.organization_invitations
  where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee21';

  if visible_count <> 1 then
    raise exception 'RLS failure: invitee cannot read own pending invitation';
  end if;

  begin
    perform public.accept_organization_invitation('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee23');
    raise exception 'Invitation failure: revoked invitation was accepted';
  exception
    when others then
      if sqlerrm = 'Invitation failure: revoked invitation was accepted' then
        raise;
      end if;
      if sqlerrm <> 'Invitation is not pending' then
        raise exception 'Invitation failure: revoked invitation returned unexpected error: %', sqlerrm;
      end if;
  end;

  accepted_organization_id := public.accept_organization_invitation('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee21');

  if accepted_organization_id <> 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee11'::uuid then
    raise exception 'Invitation failure: accepted invitation returned wrong organization';
  end if;

  select count(*)
  into visible_count
  from public.organization_memberships
  where organization_id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee11'
    and user_id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee03'
    and role = 'staff'
    and status = 'active';

  if visible_count <> 1 then
    raise exception 'Invitation failure: invitee did not become active staff member';
  end if;

  raise notice 'Invitee accepted invitation and became active staff member.';
end $$;

select set_config('request.jwt.claim.sub', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01', true);

do $$
declare
  visible_count int;
begin
  select count(*)
  into visible_count
  from public.organization_invitations
  where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee21'
    and status = 'accepted'
    and accepted_by = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee03'
    and accepted_at is not null;

  if visible_count <> 1 then
    raise exception 'Invitation failure: invitation was not marked accepted';
  end if;
end $$;

insert into public.organization_invitations (
  id,
  organization_id,
  email,
  role,
  status,
  invited_by,
  expires_at
)
values (
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee25',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee11',
  'invitee@example.test',
  'staff',
  'pending',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01',
  now() + interval '7 days'
);

update public.organization_invitations
set status = 'revoked'
where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee25';

do $$
declare
  revoked_count int;
begin
  select count(*)
  into revoked_count
  from public.organization_invitations
  where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee25'
    and status = 'revoked';

  if revoked_count <> 1 then
    raise exception 'Invitation failure: admin could not revoke pending invitation';
  end if;
end $$;

select set_config('request.jwt.claim.sub', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee03', true);

do $$
begin
  begin
    perform public.accept_organization_invitation('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee21');
    raise exception 'Invitation failure: already accepted invitation was accepted again';
  exception
    when others then
      if sqlerrm = 'Invitation failure: already accepted invitation was accepted again' then
        raise;
      end if;
      if sqlerrm <> 'Invitation is not pending' then
        raise exception 'Invitation failure: already accepted invitation returned unexpected error: %', sqlerrm;
      end if;
  end;
end $$;

do $$
begin
  begin
    perform public.accept_organization_invitation('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee25');
    raise exception 'Invitation failure: client-revoked invitation was accepted';
  exception
    when others then
      if sqlerrm = 'Invitation failure: client-revoked invitation was accepted' then
        raise;
      end if;
      if sqlerrm <> 'Invitation is not pending' then
        raise exception 'Invitation failure: client-revoked invitation returned unexpected error: %', sqlerrm;
      end if;
  end;
end $$;

select set_config('request.jwt.claim.sub', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee05', true);

do $$
begin
  begin
    perform public.accept_organization_invitation('eeeeeeee-eeee-4eee-8eee-eeeeeeeeee24');
    raise exception 'Invitation failure: expired invitation was accepted';
  exception
    when others then
      if sqlerrm = 'Invitation failure: expired invitation was accepted' then
        raise;
      end if;
      if sqlerrm <> 'Invitation has expired' then
        raise exception 'Invitation failure: expired invitation returned unexpected error: %', sqlerrm;
      end if;
  end;
end $$;

do $$
begin
  raise notice 'Organization invitations smoke test passed. Rolling back test data.';
end $$;

rollback;
