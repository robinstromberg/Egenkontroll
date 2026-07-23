drop policy if exists "members can read export logs" on public.export_logs;
drop policy if exists "admins can read export logs" on public.export_logs;

create policy "admins can read export logs"
on public.export_logs
for select
to authenticated
using (private.is_org_admin(organization_id));

drop policy if exists "members can create export logs" on public.export_logs;
revoke insert on public.export_logs from anon, authenticated;
