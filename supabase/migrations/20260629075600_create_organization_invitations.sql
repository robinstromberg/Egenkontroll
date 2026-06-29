create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'staff')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  invited_by uuid references auth.users(id) on delete set null,
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (email = lower(trim(email))),
  check (
    (
      status = 'accepted'
      and accepted_by is not null
      and accepted_at is not null
    )
    or (
      status <> 'accepted'
      and accepted_by is null
      and accepted_at is null
    )
  )
);

create index organization_invitations_org_idx
on public.organization_invitations(organization_id);

create index organization_invitations_email_status_idx
on public.organization_invitations(email, status);

create unique index organization_invitations_one_pending_per_email_idx
on public.organization_invitations(organization_id, email)
where status = 'pending';

create trigger set_organization_invitations_updated_at
before update on public.organization_invitations
for each row
execute function public.set_updated_at();

alter table public.organization_invitations enable row level security;

create or replace function private.current_profile_email()
returns text
language sql
security definer
set search_path = public
as $$
  select lower(trim(profile.email))
  from public.profiles profile
  where profile.id = (select auth.uid())
$$;

revoke execute on function private.current_profile_email() from public;
grant execute on function private.current_profile_email() to authenticated;

create policy "admins can read organization invitations"
on public.organization_invitations
for select
to authenticated
using (private.is_org_admin(organization_id));

create policy "invitees can read their pending invitations"
on public.organization_invitations
for select
to authenticated
using (
  status = 'pending'
  and expires_at > now()
  and email = private.current_profile_email()
);

create policy "admins can create organization invitations"
on public.organization_invitations
for insert
to authenticated
with check (
  private.is_org_admin(organization_id)
  and invited_by = (select auth.uid())
  and role in ('admin', 'staff')
  and status = 'pending'
  and accepted_by is null
  and accepted_at is null
  and expires_at > now()
);

create policy "admins can update pending organization invitations"
on public.organization_invitations
for update
to authenticated
using (
  private.is_org_admin(organization_id)
  and status = 'pending'
)
with check (
  private.is_org_admin(organization_id)
  and status in ('pending', 'revoked')
  and accepted_by is null
  and accepted_at is null
);

create or replace function public.accept_organization_invitation(invitation_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := (select auth.uid());
  current_email text;
  invitation_record public.organization_invitations%rowtype;
  existing_membership public.organization_memberships%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select private.current_profile_email() into current_email;

  if current_email is null or current_email = '' then
    raise exception 'Profile email is required to accept an invitation';
  end if;

  select *
  into invitation_record
  from public.organization_invitations
  where id = invitation_id
  for update;

  if not found then
    raise exception 'Invitation not found';
  end if;

  if invitation_record.email <> current_email then
    raise exception 'Invitation does not match current user email';
  end if;

  if invitation_record.status <> 'pending' then
    raise exception 'Invitation is not pending';
  end if;

  if invitation_record.expires_at <= now() then
    update public.organization_invitations
    set status = 'expired'
    where id = invitation_record.id;

    raise exception 'Invitation has expired';
  end if;

  select *
  into existing_membership
  from public.organization_memberships
  where organization_id = invitation_record.organization_id
    and user_id = current_user_id
  for update;

  if found and existing_membership.status = 'active' then
    update public.organization_invitations
    set status = 'accepted',
        accepted_by = current_user_id,
        accepted_at = now()
    where id = invitation_record.id;

    return invitation_record.organization_id;
  end if;

  if found then
    raise exception 'Existing membership is not active';
  end if;

  insert into public.organization_memberships (
    organization_id,
    user_id,
    role,
    status
  )
  values (
    invitation_record.organization_id,
    current_user_id,
    invitation_record.role,
    'active'
  );

  update public.organization_invitations
  set status = 'accepted',
      accepted_by = current_user_id,
      accepted_at = now()
  where id = invitation_record.id;

  return invitation_record.organization_id;
end;
$$;

revoke execute on function public.accept_organization_invitation(uuid) from public;
grant execute on function public.accept_organization_invitation(uuid) to authenticated;
