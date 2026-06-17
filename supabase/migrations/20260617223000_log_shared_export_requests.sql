create or replace function public.log_shared_export(
  raw_token text,
  p_export_type text,
  p_filters jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $function$
declare
  matched_link public.share_links;
  export_log_id uuid;
begin
  if p_export_type not in ('pdf', 'csv') then
    raise exception 'Invalid export type' using errcode = '22023';
  end if;

  select *
  into matched_link
  from public.share_links links
  where links.token_hash = encode(extensions.digest(raw_token, 'sha256'), 'hex')
    and links.status = 'active'
    and now() between links.valid_from and links.valid_until
  limit 1;

  if not found then
    raise exception 'Invalid or expired share link' using errcode = '28000';
  end if;

  insert into public.export_logs (
    organization_id,
    share_link_id,
    export_type,
    requested_by,
    filters
  )
  values (
    matched_link.organization_id,
    matched_link.id,
    p_export_type,
    auth.uid(),
    coalesce(p_filters, '{}'::jsonb)
  )
  returning id into export_log_id;

  return export_log_id;
end;
$function$;

revoke execute on function public.log_shared_export(text, text, jsonb) from public;
grant execute on function public.log_shared_export(text, text, jsonb) to anon;
grant execute on function public.log_shared_export(text, text, jsonb) to authenticated;

comment on function public.log_shared_export(text, text, jsonb) is
  'Intentional write-only inspector audit RPC. Public execution is required for temporary share links, but inserts are restricted to valid active share tokens and only create export log rows.';
