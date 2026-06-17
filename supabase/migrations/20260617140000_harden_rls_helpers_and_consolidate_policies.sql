create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_org_member(target_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = target_organization_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
  );
$$;

create or replace function private.is_org_admin(target_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = target_organization_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and membership.role in ('owner', 'admin')
  );
$$;

create or replace function private.organization_has_members(target_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = target_organization_id
  );
$$;

revoke execute on function private.is_org_member(uuid) from public;
revoke execute on function private.is_org_admin(uuid) from public;
revoke execute on function private.organization_has_members(uuid) from public;
grant execute on function private.is_org_member(uuid) to authenticated;
grant execute on function private.is_org_admin(uuid) to authenticated;
grant execute on function private.organization_has_members(uuid) to authenticated;

drop policy if exists "organization members can read organizations" on public.organizations;
drop policy if exists "users can read organizations they belong to" on public.organizations;
create policy "users can read organizations they belong to"
on public.organizations
for select
to authenticated
using (
  created_by = (select auth.uid())
  or private.is_org_member(id)
);

drop policy if exists "organization admins can update organizations" on public.organizations;
create policy "organization admins can update organizations"
on public.organizations
for update
to authenticated
using (private.is_org_admin(id))
with check (private.is_org_admin(id));

drop policy if exists "members can read organization memberships" on public.organization_memberships;
create policy "members can read organization memberships"
on public.organization_memberships
for select
to authenticated
using (private.is_org_member(organization_id));

drop policy if exists "admins can manage organization memberships" on public.organization_memberships;
create policy "admins can add organization memberships"
on public.organization_memberships
for insert
to authenticated
with check (private.is_org_admin(organization_id));

create policy "admins can update organization memberships"
on public.organization_memberships
for update
to authenticated
using (private.is_org_admin(organization_id))
with check (private.is_org_admin(organization_id));

create policy "admins can delete organization memberships"
on public.organization_memberships
for delete
to authenticated
using (private.is_org_admin(organization_id));

drop policy if exists "first organization owner can create own membership" on public.organization_memberships;
drop policy if exists "users can create first owner membership" on public.organization_memberships;
create policy "users can create first owner membership"
on public.organization_memberships
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and role = 'owner'
  and status = 'active'
  and not private.organization_has_members(organization_id)
);

drop policy if exists "members can read control types" on public.control_types;
create policy "members can read control types"
on public.control_types
for select
to authenticated
using (private.is_org_member(organization_id));

drop policy if exists "admins can manage control types" on public.control_types;
create policy "admins can create control types"
on public.control_types
for insert
to authenticated
with check (private.is_org_admin(organization_id));

create policy "admins can update control types"
on public.control_types
for update
to authenticated
using (private.is_org_admin(organization_id))
with check (private.is_org_admin(organization_id));

create policy "admins can delete control types"
on public.control_types
for delete
to authenticated
using (private.is_org_admin(organization_id));

drop policy if exists "members can read control objects" on public.control_objects;
create policy "members can read control objects"
on public.control_objects
for select
to authenticated
using (private.is_org_member(organization_id));

drop policy if exists "admins can manage control objects" on public.control_objects;
create policy "admins can create control objects"
on public.control_objects
for insert
to authenticated
with check (private.is_org_admin(organization_id));

create policy "admins can update control objects"
on public.control_objects
for update
to authenticated
using (private.is_org_admin(organization_id))
with check (private.is_org_admin(organization_id));

create policy "admins can delete control objects"
on public.control_objects
for delete
to authenticated
using (private.is_org_admin(organization_id));

drop policy if exists "members can read control fields" on public.control_field_definitions;
create policy "members can read control fields"
on public.control_field_definitions
for select
to authenticated
using (private.is_org_member(organization_id));

drop policy if exists "admins can manage control fields" on public.control_field_definitions;
create policy "admins can create control fields"
on public.control_field_definitions
for insert
to authenticated
with check (private.is_org_admin(organization_id));

create policy "admins can update control fields"
on public.control_field_definitions
for update
to authenticated
using (private.is_org_admin(organization_id))
with check (private.is_org_admin(organization_id));

create policy "admins can delete control fields"
on public.control_field_definitions
for delete
to authenticated
using (private.is_org_admin(organization_id));

drop policy if exists "members can read control runs" on public.control_runs;
create policy "members can read control runs"
on public.control_runs
for select
to authenticated
using (private.is_org_member(organization_id));

drop policy if exists "members can create control runs" on public.control_runs;
create policy "members can create control runs"
on public.control_runs
for insert
to authenticated
with check (
  private.is_org_member(organization_id)
  and performed_by = (select auth.uid())
);

drop policy if exists "members can update control runs" on public.control_runs;
create policy "members can update control runs"
on public.control_runs
for update
to authenticated
using (private.is_org_member(organization_id))
with check (private.is_org_member(organization_id));

drop policy if exists "members can read control run items" on public.control_run_items;
create policy "members can read control run items"
on public.control_run_items
for select
to authenticated
using (private.is_org_member(organization_id));

drop policy if exists "members can create control run items" on public.control_run_items;
create policy "members can create control run items"
on public.control_run_items
for insert
to authenticated
with check (private.is_org_member(organization_id));

drop policy if exists "members can read deviations" on public.deviations;
create policy "members can read deviations"
on public.deviations
for select
to authenticated
using (private.is_org_member(organization_id));

drop policy if exists "members can create deviations" on public.deviations;
create policy "members can create deviations"
on public.deviations
for insert
to authenticated
with check (
  private.is_org_member(organization_id)
  and opened_by = (select auth.uid())
);

drop policy if exists "members can update deviations" on public.deviations;
create policy "members can update deviations"
on public.deviations
for update
to authenticated
using (private.is_org_member(organization_id))
with check (private.is_org_member(organization_id));

drop policy if exists "members can read attachments" on public.attachments;
create policy "members can read attachments"
on public.attachments
for select
to authenticated
using (private.is_org_member(organization_id));

drop policy if exists "members can create attachments" on public.attachments;
create policy "members can create attachments"
on public.attachments
for insert
to authenticated
with check (
  private.is_org_member(organization_id)
  and uploaded_by = (select auth.uid())
);

drop policy if exists "admins can read share links" on public.share_links;
create policy "admins can read share links"
on public.share_links
for select
to authenticated
using (private.is_org_admin(organization_id));

drop policy if exists "admins can manage share links" on public.share_links;
create policy "admins can create share links"
on public.share_links
for insert
to authenticated
with check (private.is_org_admin(organization_id));

create policy "admins can update share links"
on public.share_links
for update
to authenticated
using (private.is_org_admin(organization_id))
with check (private.is_org_admin(organization_id));

create policy "admins can delete share links"
on public.share_links
for delete
to authenticated
using (private.is_org_admin(organization_id));

drop policy if exists "members can read export logs" on public.export_logs;
create policy "members can read export logs"
on public.export_logs
for select
to authenticated
using (private.is_org_member(organization_id));

drop policy if exists "members can create export logs" on public.export_logs;
create policy "members can create export logs"
on public.export_logs
for insert
to authenticated
with check (private.is_org_member(organization_id));

drop policy if exists "members can upload control attachments" on storage.objects;
create policy "members can upload control attachments"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'control-attachments'
  and private.is_org_member((storage.foldername(name))[1]::uuid)
);

drop policy if exists "members can read control attachments" on storage.objects;
create policy "members can read control attachments"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'control-attachments'
  and private.is_org_member((storage.foldername(name))[1]::uuid)
);

revoke execute on function public.is_org_member(uuid) from public;
revoke execute on function public.is_org_admin(uuid) from public;
revoke execute on function public.organization_has_members(uuid) from public;
revoke execute on function public.is_org_member(uuid) from anon;
revoke execute on function public.is_org_admin(uuid) from anon;
revoke execute on function public.organization_has_members(uuid) from anon;
revoke execute on function public.is_org_member(uuid) from authenticated;
revoke execute on function public.is_org_admin(uuid) from authenticated;
revoke execute on function public.organization_has_members(uuid) from authenticated;

comment on function private.is_org_member(uuid) is
  'Private RLS helper. Kept outside the exposed public schema so it is not callable as a public RPC.';

comment on function private.is_org_admin(uuid) is
  'Private RLS helper. Kept outside the exposed public schema so it is not callable as a public RPC.';

comment on function private.organization_has_members(uuid) is
  'Private RLS helper used when creating the first owner membership for a new organization.';
