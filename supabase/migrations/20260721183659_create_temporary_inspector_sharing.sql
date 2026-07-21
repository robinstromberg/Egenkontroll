create or replace function public.create_temporary_inspector_share_link(
  p_organization_id uuid
)
returns table (
  raw_token text,
  valid_until timestamptz
)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid := (select auth.uid());
  v_raw_token text;
  v_valid_from timestamptz := statement_timestamp();
  v_valid_until timestamptz;
begin
  if v_user_id is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = p_organization_id
      and membership.user_id = v_user_id
      and membership.status = 'active'
  ) then
    raise exception 'Active organization membership required.' using errcode = '42501';
  end if;

  v_raw_token := encode(extensions.gen_random_bytes(24), 'hex');
  v_valid_until := v_valid_from + interval '7 days';

  insert into public.share_links (
    organization_id,
    token_hash,
    created_by,
    valid_from,
    valid_until,
    period_start,
    period_end,
    included_control_type_ids,
    status
  )
  values (
    p_organization_id,
    encode(extensions.digest(v_raw_token, 'sha256'), 'hex'),
    v_user_id,
    v_valid_from,
    v_valid_until,
    date '1900-01-01',
    date '9999-12-31',
    array[]::uuid[],
    'active'
  );

  return query select v_raw_token, v_valid_until;
end;
$function$;

revoke execute on function public.create_temporary_inspector_share_link(uuid) from public;
revoke execute on function public.create_temporary_inspector_share_link(uuid) from anon;
grant execute on function public.create_temporary_inspector_share_link(uuid) to authenticated;

comment on function public.create_temporary_inspector_share_link(uuid) is
  'Creates a seven-day read-only inspector link for an authenticated user with active membership in the exact organization. The raw token is returned once; only its SHA-256 hash is stored.';

create or replace function public.get_shared_inspector_context(raw_token text)
returns table (
  organization_name text,
  valid_until timestamptz
)
language sql
stable
security definer
set search_path = ''
as $function$
  select
    organizations.name as organization_name,
    links.valid_until
  from public.share_links links
  join public.organizations organizations on organizations.id = links.organization_id
  where links.token_hash = encode(extensions.digest(raw_token, 'sha256'), 'hex')
    and links.status = 'active'
    and statement_timestamp() between links.valid_from and links.valid_until
  limit 1;
$function$;

revoke execute on function public.get_shared_inspector_context(text) from public;
grant execute on function public.get_shared_inspector_context(text) to anon;
grant execute on function public.get_shared_inspector_context(text) to authenticated;

comment on function public.get_shared_inspector_context(text) is
  'Returns organization name and link expiry for a valid temporary inspector token. Exposes no data without a matching active token inside its validity window.';
