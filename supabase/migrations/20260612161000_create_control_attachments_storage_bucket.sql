insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'control-attachments',
  'control-attachments',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

create policy "members can upload control attachments"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'control-attachments'
  and public.is_org_member((storage.foldername(name))[1]::uuid)
);

create policy "members can read control attachments"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'control-attachments'
  and public.is_org_member((storage.foldername(name))[1]::uuid)
);
