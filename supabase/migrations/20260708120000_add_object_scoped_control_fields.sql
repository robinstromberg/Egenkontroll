alter table public.control_field_definitions
  add column if not exists control_object_id uuid references public.control_objects(id) on delete set null;

create index if not exists control_fields_object_idx
  on public.control_field_definitions(control_object_id);

do $$
begin
  if exists (
    select 1
    from public.control_field_definitions field_definition
    join public.control_objects control_object
      on control_object.id = field_definition.control_object_id
    where field_definition.control_object_id is not null
      and (
        control_object.organization_id <> field_definition.organization_id
        or control_object.control_type_id <> field_definition.control_type_id
      )
  ) then
    raise exception 'control_field_definitions.control_object_id has cross-organization or cross-control-type data';
  end if;
end;
$$;

create or replace function public.save_control_run_transactional(
  p_organization_id uuid,
  p_control_type_id uuid,
  p_control_run_id uuid,
  p_responses jsonb,
  p_attachments jsonb default '[]'::jsonb
)
returns public.control_runs
language plpgsql
set search_path = public
as $$
declare
  current_user_id uuid := (select auth.uid());
  normalized_responses jsonb := coalesce(p_responses, '[]'::jsonb);
  normalized_attachments jsonb := coalesce(p_attachments, '[]'::jsonb);
  response_record jsonb;
  attachment_record jsonb;
  saved_run public.control_runs;
  field_record public.control_field_definitions%rowtype;
  object_record public.control_objects%rowtype;
  response_item_id uuid;
  response_object_id uuid;
  response_field_id uuid;
  response_value text;
  response_has_deviation boolean;
  object_snapshot jsonb;
  value_number numeric;
  value_boolean boolean;
  value_date date;
  value_text text;
  attachment_item_id uuid;
  attachment_bucket text;
  attachment_path text;
  has_deviation boolean;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if p_control_run_id is null then
    raise exception 'control_run_id is required' using errcode = '22023';
  end if;

  if jsonb_typeof(normalized_responses) <> 'array' then
    raise exception 'responses must be an array' using errcode = '22023';
  end if;

  if jsonb_array_length(normalized_responses) = 0 then
    raise exception 'at least one response is required' using errcode = '22023';
  end if;

  if jsonb_typeof(normalized_attachments) <> 'array' then
    raise exception 'attachments must be an array' using errcode = '22023';
  end if;

  if not private.is_org_member(p_organization_id) then
    raise exception 'Organization access denied' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.control_types control_type
    where control_type.id = p_control_type_id
      and control_type.organization_id = p_organization_id
      and control_type.active = true
  ) then
    raise exception 'Control type not found' using errcode = '42501';
  end if;

  select exists (
    select 1
    from jsonb_array_elements(normalized_responses) as response(value)
    where coalesce((response.value ->> 'deviationDetected')::boolean, false)
  ) into has_deviation;

  insert into public.control_runs (
    id,
    organization_id,
    control_type_id,
    performed_by,
    status
  )
  values (
    p_control_run_id,
    p_organization_id,
    p_control_type_id,
    current_user_id,
    case when has_deviation then 'completed_with_deviation' else 'completed' end
  )
  returning * into saved_run;

  for response_record in
    select value
    from jsonb_array_elements(normalized_responses)
  loop
    response_item_id := nullif(response_record ->> 'controlRunItemId', '')::uuid;
    response_object_id := nullif(response_record ->> 'controlObjectId', '')::uuid;
    response_field_id := nullif(response_record ->> 'fieldDefinitionId', '')::uuid;
    response_value := coalesce(response_record ->> 'value', '');
    response_has_deviation := coalesce((response_record ->> 'deviationDetected')::boolean, false);

    if response_item_id is null then
      raise exception 'controlRunItemId is required' using errcode = '22023';
    end if;

    if response_field_id is null then
      raise exception 'fieldDefinitionId is required' using errcode = '22023';
    end if;

    select *
    into field_record
    from public.control_field_definitions field_definition
    where field_definition.id = response_field_id
      and field_definition.organization_id = p_organization_id
      and field_definition.control_type_id = p_control_type_id
      and field_definition.active = true;

    if not found then
      raise exception 'Field definition not found' using errcode = '42501';
    end if;

    object_record := null;

    if response_object_id is not null then
      select *
      into object_record
      from public.control_objects control_object
      where control_object.id = response_object_id
        and control_object.organization_id = p_organization_id
        and control_object.control_type_id = p_control_type_id
        and control_object.active = true;

      if not found then
        raise exception 'Control object not found' using errcode = '42501';
      end if;

      object_snapshot := to_jsonb(object_record);
    else
      object_snapshot := '{}'::jsonb;
    end if;

    if field_record.control_object_id is not null
      and (response_object_id is null or response_object_id <> field_record.control_object_id)
    then
      raise exception 'Field definition does not belong to control object' using errcode = '42501';
    end if;

    value_number := null;
    value_boolean := null;
    value_date := null;
    value_text := null;

    if field_record.field_type in ('temperature', 'number') and response_value <> '' then
      value_number := response_value::numeric;
    end if;

    if field_record.field_type = 'boolean' then
      if response_value = 'true' then
        value_boolean := true;
      elsif response_value = 'false' then
        value_boolean := false;
      elsif response_value <> '' then
        raise exception 'Invalid boolean response' using errcode = '22023';
      end if;
    end if;

    if field_record.field_type = 'date' and response_value <> '' then
      value_date := response_value::date;
    end if;

    if field_record.field_type in ('text', 'textarea', 'ok_not_ok', 'select', 'photo', 'datetime') then
      value_text := response_value;
    end if;

    insert into public.control_run_items (
      id,
      organization_id,
      control_run_id,
      control_object_id,
      field_definition_id,
      object_snapshot,
      field_snapshot,
      value_text,
      value_number,
      value_boolean,
      value_date,
      value_json,
      status,
      deviation_detected,
      deviation_reason,
      action_text
    )
    values (
      response_item_id,
      p_organization_id,
      saved_run.id,
      response_object_id,
      response_field_id,
      object_snapshot,
      to_jsonb(field_record),
      value_text,
      value_number,
      value_boolean,
      value_date,
      '{}'::jsonb,
      case when response_has_deviation then 'deviation' else 'ok' end,
      response_has_deviation,
      nullif(response_record ->> 'deviationReason', ''),
      nullif(response_record ->> 'actionText', '')
    );

    if response_has_deviation then
      insert into public.deviations (
        organization_id,
        control_run_id,
        control_run_item_id,
        control_type_id,
        control_object_id,
        status,
        severity,
        description,
        action_text,
        opened_by
      )
      values (
        p_organization_id,
        saved_run.id,
        response_item_id,
        p_control_type_id,
        response_object_id,
        'open',
        'medium',
        coalesce(nullif(response_record ->> 'deviationReason', ''), 'Avvikelse i kontroll.'),
        coalesce(nullif(response_record ->> 'actionText', ''), 'Atgard saknas.'),
        current_user_id
      );
    end if;
  end loop;

  for attachment_record in
    select value
    from jsonb_array_elements(normalized_attachments)
  loop
    attachment_item_id := nullif(attachment_record ->> 'controlRunItemId', '')::uuid;
    attachment_bucket := coalesce(nullif(attachment_record ->> 'storageBucket', ''), 'control-attachments');
    attachment_path := nullif(attachment_record ->> 'storagePath', '');

    if attachment_item_id is null then
      raise exception 'attachment controlRunItemId is required' using errcode = '22023';
    end if;

    if attachment_path is null then
      raise exception 'attachment storagePath is required' using errcode = '22023';
    end if;

    if not exists (
      select 1
      from public.control_run_items item
      where item.id = attachment_item_id
        and item.organization_id = p_organization_id
        and item.control_run_id = saved_run.id
    ) then
      raise exception 'Attachment parent item not found' using errcode = '42501';
    end if;

    if attachment_bucket <> 'control-attachments'
      or split_part(attachment_path, '/', 1) <> p_organization_id::text
      or split_part(attachment_path, '/', 2) <> saved_run.id::text
      or split_part(attachment_path, '/', 3) <> attachment_item_id::text
    then
      raise exception 'Attachment storage path does not match its parent run item' using errcode = '42501';
    end if;

    insert into public.attachments (
      organization_id,
      control_run_id,
      control_run_item_id,
      storage_bucket,
      storage_path,
      file_name,
      content_type,
      size_bytes,
      uploaded_by
    )
    values (
      p_organization_id,
      saved_run.id,
      attachment_item_id,
      attachment_bucket,
      attachment_path,
      nullif(attachment_record ->> 'fileName', ''),
      nullif(attachment_record ->> 'contentType', ''),
      nullif(attachment_record ->> 'sizeBytes', '')::integer,
      current_user_id
    );
  end loop;

  return saved_run;
end;
$$;

revoke execute on function public.save_control_run_transactional(uuid, uuid, uuid, jsonb, jsonb) from public;
revoke execute on function public.save_control_run_transactional(uuid, uuid, uuid, jsonb, jsonb) from anon;
grant execute on function public.save_control_run_transactional(uuid, uuid, uuid, jsonb, jsonb) to authenticated;

comment on function public.save_control_run_transactional(uuid, uuid, uuid, jsonb, jsonb) is
  'Saves a control run, run items, deviations and attachment metadata in one caller-RLS transaction. Object-scoped fields must be saved with their matching control object. Storage objects must be uploaded separately before calling this function.';
