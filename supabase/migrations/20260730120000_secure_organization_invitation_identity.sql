-- Match organization invitations against the verified Supabase Auth identity.
-- The client-editable profiles.email column must not participate in authorization.

drop policy if exists "invitees can read their pending invitations"
on public.organization_invitations;

create or replace function private.current_profile_email()
returns text
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select lower(trim(auth_user.email))
  from auth.users auth_user
  where auth_user.id = (select auth.uid())
    and auth_user.email_confirmed_at is not null
$$;

revoke execute on function private.current_profile_email() from public;
grant execute on function private.current_profile_email() to authenticated;

create policy "invitees can read their pending invitations"
on public.organization_invitations
for select
to authenticated
using (
  status = 'pending'
  and expires_at > now()
  and email = private.current_profile_email()
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
    raise exception 'Verified Auth email is required to accept an invitation';
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
revoke execute on function public.accept_organization_invitation(uuid) from anon;
grant execute on function public.accept_organization_invitation(uuid) to authenticated;

-- Keep the profile display field available for reads, but make its e-mail
-- identity immutable from the Data API roles. New profiles omit this nullable
-- column and existing e-mail values are not used for invitation authorization.
revoke insert (email), update (email)
on table public.profiles
from public, anon, authenticated;

grant insert (id, full_name)
on table public.profiles
to authenticated;

grant update (full_name)
on table public.profiles
to authenticated;
