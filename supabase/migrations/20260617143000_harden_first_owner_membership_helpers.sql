create or replace function private.organization_was_created_by_current_user(target_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organizations organization_record
    where organization_record.id = target_organization_id
      and organization_record.created_by = (select auth.uid())
  );
$$;

create or replace function private.organization_has_other_members(
  target_organization_id uuid,
  target_user_id uuid
)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = target_organization_id
      and membership.user_id <> target_user_id
  );
$$;

revoke execute on function private.organization_was_created_by_current_user(uuid) from public;
revoke execute on function private.organization_has_other_members(uuid, uuid) from public;
grant execute on function private.organization_was_created_by_current_user(uuid) to authenticated;
grant execute on function private.organization_has_other_members(uuid, uuid) to authenticated;

drop policy if exists "users can create first owner membership" on public.organization_memberships;

create policy "users can create first owner membership"
on public.organization_memberships
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and role = 'owner'
  and status = 'active'
  and private.organization_was_created_by_current_user(organization_id)
  and not private.organization_has_other_members(organization_id, (select auth.uid()))
);
