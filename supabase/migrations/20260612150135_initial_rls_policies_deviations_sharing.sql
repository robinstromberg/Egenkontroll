create policy "members can read deviations" on public.deviations for select to authenticated using (public.is_org_member(organization_id));
create policy "members can create deviations" on public.deviations for insert to authenticated with check (public.is_org_member(organization_id) and opened_by = auth.uid());
create policy "members can update deviations" on public.deviations for update to authenticated using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "members can read attachments" on public.attachments for select to authenticated using (public.is_org_member(organization_id));
create policy "members can create attachments" on public.attachments for insert to authenticated with check (public.is_org_member(organization_id) and uploaded_by = auth.uid());

create policy "admins can read share links" on public.share_links for select to authenticated using (public.is_org_admin(organization_id));
create policy "admins can manage share links" on public.share_links for all to authenticated using (public.is_org_admin(organization_id)) with check (public.is_org_admin(organization_id));

create policy "members can read export logs" on public.export_logs for select to authenticated using (public.is_org_member(organization_id));
create policy "members can create export logs" on public.export_logs for insert to authenticated with check (public.is_org_member(organization_id));
