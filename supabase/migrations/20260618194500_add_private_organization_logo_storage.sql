insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'organization-branding',
  'organization-branding',
  false,
  2097152,
  array['image/jpeg']
)
on conflict (id) do nothing;

alter table public.organizations
  add column if not exists logo_storage_bucket text,
  add column if not exists logo_storage_path text,
  add column if not exists logo_file_name text,
  add column if not exists logo_content_type text,
  add column if not exists logo_size_bytes integer check (logo_size_bytes is null or logo_size_bytes >= 0);

alter table public.organizations
  drop constraint if exists organizations_logo_storage_bucket_check,
  add constraint organizations_logo_storage_bucket_check
    check (logo_storage_bucket is null or logo_storage_bucket = 'organization-branding');

alter table public.organizations
  drop constraint if exists organizations_logo_content_type_check,
  add constraint organizations_logo_content_type_check
    check (logo_content_type is null or logo_content_type = 'image/jpeg');

drop policy if exists "admins can upload organization branding" on storage.objects;
create policy "admins can upload organization branding"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'organization-branding'
  and private.is_org_admin((storage.foldername(name))[1]::uuid)
);

drop policy if exists "admins can read organization branding" on storage.objects;
create policy "admins can read organization branding"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'organization-branding'
  and private.is_org_admin((storage.foldername(name))[1]::uuid)
);

drop policy if exists "admins can update organization branding" on storage.objects;
create policy "admins can update organization branding"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'organization-branding'
  and private.is_org_admin((storage.foldername(name))[1]::uuid)
)
with check (
  bucket_id = 'organization-branding'
  and private.is_org_admin((storage.foldername(name))[1]::uuid)
);

drop policy if exists "admins can delete organization branding" on storage.objects;
create policy "admins can delete organization branding"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'organization-branding'
  and private.is_org_admin((storage.foldername(name))[1]::uuid)
);
