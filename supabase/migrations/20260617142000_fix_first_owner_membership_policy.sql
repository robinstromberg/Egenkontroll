drop policy if exists "users can create first owner membership" on public.organization_memberships;

create policy "users can create first owner membership"
on public.organization_memberships
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and role = 'owner'
  and status = 'active'
  and exists (
    select 1
    from public.organizations organization_record
    where organization_record.id = organization_memberships.organization_id
      and organization_record.created_by = (select auth.uid())
  )
  and not exists (
    select 1
    from public.organization_memberships existing_membership
    where existing_membership.organization_id = organization_memberships.organization_id
      and existing_membership.user_id <> (select auth.uid())
  )
);
