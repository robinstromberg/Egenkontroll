create or replace function public.is_org_member(target_organization_id uuid)
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

create or replace function public.is_org_admin(target_organization_id uuid)
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

drop policy if exists "authenticated users can create organizations" on public.organizations;
create policy "authenticated users can create organizations"
on public.organizations
for insert
to authenticated
with check (created_by = (select auth.uid()));

drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
on public.profiles
for select
to authenticated
using (id = (select auth.uid()));

drop policy if exists "users can create own profile" on public.profiles;
create policy "users can create own profile"
on public.profiles
for insert
to authenticated
with check (id = (select auth.uid()));

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists "members can create control runs" on public.control_runs;
create policy "members can create control runs"
on public.control_runs
for insert
to authenticated
with check (
  public.is_org_member(organization_id)
  and performed_by = (select auth.uid())
);

drop policy if exists "members can create deviations" on public.deviations;
create policy "members can create deviations"
on public.deviations
for insert
to authenticated
with check (
  public.is_org_member(organization_id)
  and opened_by = (select auth.uid())
);

drop policy if exists "members can create attachments" on public.attachments;
create policy "members can create attachments"
on public.attachments
for insert
to authenticated
with check (
  public.is_org_member(organization_id)
  and uploaded_by = (select auth.uid())
);
