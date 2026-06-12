create policy "authenticated users can create organizations" on public.organizations for insert to authenticated with check (created_by = auth.uid());
create policy "organization members can read organizations" on public.organizations for select to authenticated using (public.is_org_member(id));
create policy "organization admins can update organizations" on public.organizations for update to authenticated using (public.is_org_admin(id)) with check (public.is_org_admin(id));

create policy "users can read own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "users can create own profile" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "users can update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "members can read organization memberships" on public.organization_memberships for select to authenticated using (public.is_org_member(organization_id));
create policy "users can create first owner membership" on public.organization_memberships for insert to authenticated with check (user_id = auth.uid() and role = 'owner' and status = 'active' and not exists (select 1 from public.organization_memberships existing_membership where existing_membership.organization_id = organization_id));
create policy "admins can manage organization memberships" on public.organization_memberships for all to authenticated using (public.is_org_admin(organization_id)) with check (public.is_org_admin(organization_id));

create policy "authenticated users can read active templates" on public.control_templates for select to authenticated using (active = true);
