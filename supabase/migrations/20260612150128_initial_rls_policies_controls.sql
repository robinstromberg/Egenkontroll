create policy "members can read control types" on public.control_types for select to authenticated using (public.is_org_member(organization_id));
create policy "admins can manage control types" on public.control_types for all to authenticated using (public.is_org_admin(organization_id)) with check (public.is_org_admin(organization_id));

create policy "members can read control objects" on public.control_objects for select to authenticated using (public.is_org_member(organization_id));
create policy "admins can manage control objects" on public.control_objects for all to authenticated using (public.is_org_admin(organization_id)) with check (public.is_org_admin(organization_id));

create policy "members can read control fields" on public.control_field_definitions for select to authenticated using (public.is_org_member(organization_id));
create policy "admins can manage control fields" on public.control_field_definitions for all to authenticated using (public.is_org_admin(organization_id)) with check (public.is_org_admin(organization_id));

create policy "members can read control runs" on public.control_runs for select to authenticated using (public.is_org_member(organization_id));
create policy "members can create control runs" on public.control_runs for insert to authenticated with check (public.is_org_member(organization_id) and performed_by = auth.uid());
create policy "members can update control runs" on public.control_runs for update to authenticated using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "members can read control run items" on public.control_run_items for select to authenticated using (public.is_org_member(organization_id));
create policy "members can create control run items" on public.control_run_items for insert to authenticated with check (public.is_org_member(organization_id));
