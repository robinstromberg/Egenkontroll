create policy "members can read profiles of organization members"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or exists (
    select 1
    from public.organization_memberships viewer_membership
    join public.organization_memberships performer_membership
      on performer_membership.organization_id = viewer_membership.organization_id
    where viewer_membership.user_id = (select auth.uid())
      and viewer_membership.status = 'active'
      and performer_membership.user_id = profiles.id
      and performer_membership.status = 'active'
  )
);

drop function if exists public.get_shared_control_runs(text, date, date, uuid[]);

create or replace function public.get_shared_control_runs(
  raw_token text,
  p_period_start date default null,
  p_period_end date default null,
  p_control_type_ids uuid[] default '{}'
)
returns table (
  run_id uuid,
  organization_name text,
  organization_logo_url text,
  organization_brand_color text,
  control_type_id uuid,
  control_type_name text,
  control_type_category text,
  control_type_instructions text,
  performed_by uuid,
  performer_name text,
  performed_at timestamptz,
  status text,
  notes text,
  items jsonb,
  deviations jsonb,
  attachments jsonb
)
language sql
security definer
set search_path to 'public', 'extensions'
as $function$
  select
    runs.id as run_id,
    organizations.name as organization_name,
    organizations.logo_url as organization_logo_url,
    organizations.brand_color as organization_brand_color,
    control_types.id as control_type_id,
    control_types.name as control_type_name,
    control_types.category as control_type_category,
    control_types.instructions as control_type_instructions,
    runs.performed_by,
    coalesce(nullif(trim(performer_profiles.full_name), ''), 'Okänd användare') as performer_name,
    runs.performed_at,
    runs.status,
    runs.notes,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', run_items.id,
          'object_snapshot', run_items.object_snapshot,
          'field_snapshot', run_items.field_snapshot,
          'value_text', run_items.value_text,
          'value_number', run_items.value_number,
          'value_boolean', run_items.value_boolean,
          'value_date', run_items.value_date,
          'value_json', run_items.value_json,
          'status', run_items.status,
          'deviation_detected', run_items.deviation_detected,
          'deviation_reason', run_items.deviation_reason,
          'action_text', run_items.action_text,
          'created_at', run_items.created_at
        )
        order by run_items.created_at
      )
      from public.control_run_items run_items
      where run_items.organization_id = runs.organization_id
        and run_items.control_run_id = runs.id
    ), '[]'::jsonb) as items,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', deviations.id,
          'control_run_item_id', deviations.control_run_item_id,
          'status', deviations.status,
          'severity', deviations.severity,
          'description', deviations.description,
          'action_text', deviations.action_text,
          'follow_up_comment', deviations.follow_up_comment,
          'opened_at', deviations.opened_at,
          'resolved_at', deviations.resolved_at
        )
        order by deviations.opened_at
      )
      from public.deviations deviations
      where deviations.organization_id = runs.organization_id
        and deviations.control_run_id = runs.id
    ), '[]'::jsonb) as deviations,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', attachments.id,
          'control_run_item_id', attachments.control_run_item_id,
          'deviation_id', attachments.deviation_id,
          'file_name', attachments.file_name,
          'content_type', attachments.content_type,
          'size_bytes', attachments.size_bytes,
          'created_at', attachments.created_at
        )
        order by attachments.created_at
      )
      from public.attachments attachments
      where attachments.organization_id = runs.organization_id
        and attachments.control_run_id = runs.id
    ), '[]'::jsonb) as attachments
  from public.share_links links
  join public.organizations organizations on organizations.id = links.organization_id
  join public.control_runs runs on runs.organization_id = links.organization_id
  join public.control_types control_types on control_types.id = runs.control_type_id
  left join public.profiles performer_profiles on performer_profiles.id = runs.performed_by
  where links.token_hash = encode(extensions.digest(raw_token, 'sha256'), 'hex')
    and links.status = 'active'
    and now() between links.valid_from and links.valid_until
    and runs.performed_at::date between links.period_start and links.period_end
    and (p_period_start is null or runs.performed_at::date >= p_period_start)
    and (p_period_end is null or runs.performed_at::date <= p_period_end)
    and (
      cardinality(links.included_control_type_ids) = 0
      or runs.control_type_id = any(links.included_control_type_ids)
    )
    and (
      p_control_type_ids is null
      or cardinality(p_control_type_ids) = 0
      or runs.control_type_id = any(p_control_type_ids)
    )
  order by runs.performed_at desc;
$function$;

revoke execute on function public.get_shared_control_runs(text, date, date, uuid[]) from public;
grant execute on function public.get_shared_control_runs(text, date, date, uuid[]) to anon;
grant execute on function public.get_shared_control_runs(text, date, date, uuid[]) to authenticated;

comment on function public.get_shared_control_runs(text, date, date, uuid[]) is
  'Intentional read-only inspector access RPC. Public execution is required for temporary share links, but access is restricted by hashed token, active status, validity period, share scope and optional inspector filters. Returns organization report branding, performer display name, current control type instructions and attachment metadata without exposing internal storage paths or email addresses.';
