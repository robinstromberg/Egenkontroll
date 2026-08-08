alter table public.control_templates
  add column if not exists control_key text;

alter table public.control_types
  add column if not exists control_key text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'control_templates_control_key_format_check'
      and conrelid = 'public.control_templates'::regclass
  ) then
    alter table public.control_templates
      add constraint control_templates_control_key_format_check
      check (control_key is null or control_key ~ '^[a-z][a-z0-9_]*$');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'control_types_control_key_format_check'
      and conrelid = 'public.control_types'::regclass
  ) then
    alter table public.control_types
      add constraint control_types_control_key_format_check
      check (control_key is null or control_key ~ '^[a-z][a-z0-9_]*$');
  end if;
end $$;

create unique index if not exists control_templates_locale_control_key_idx
  on public.control_templates(locale, control_key)
  where control_key is not null;

do $$
declare
  cold_template_count integer;
  conflicting_template_count integer;
  conflicting_type_count integer;
begin
  select count(*)
  into cold_template_count
  from public.control_templates template
  where template.locale = 'sv-SE'
    and lower(template.name) = lower('Kyltemperaturer')
    and template.category = 'temperature';

  if cold_template_count <> 1 then
    raise exception 'Expected exactly one Swedish Kyltemperaturer template, found %', cold_template_count;
  end if;

  select count(*)
  into conflicting_template_count
  from public.control_templates template
  where template.locale = 'sv-SE'
    and lower(template.name) = lower('Kyltemperaturer')
    and template.category = 'temperature'
    and template.control_key is not null
    and template.control_key <> 'cold_storage_temperature';

  select count(*)
  into conflicting_type_count
  from public.control_types control_type
  join public.control_templates template on template.id = control_type.template_id
  where template.locale = 'sv-SE'
    and lower(template.name) = lower('Kyltemperaturer')
    and template.category = 'temperature'
    and control_type.control_key is not null
    and control_type.control_key <> 'cold_storage_temperature';

  if conflicting_template_count > 0 or conflicting_type_count > 0 then
    raise exception 'Existing semantic control keys conflict with cold_storage_temperature';
  end if;
end $$;

update public.control_templates template
set control_key = 'cold_storage_temperature'
where template.locale = 'sv-SE'
  and lower(template.name) = lower('Kyltemperaturer')
  and template.category = 'temperature'
  and template.control_key is null;

update public.control_types control_type
set control_key = template.control_key
from public.control_templates template
where control_type.template_id = template.id
  and template.control_key = 'cold_storage_temperature'
  and control_type.control_key is null;

create or replace function public.save_control_run_transactional(
  p_organization_id uuid,
  p_control_type_id uuid,
  p_control_run_id uuid,
  p_responses jsonb,
  p_attachments jsonb default '[]'::jsonb
)
returns public.control_runs
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_user_id uuid := (select auth.uid());
  normalized_responses jsonb := coalesce(p_responses, '[]'::jsonb);
  normalized_attachments jsonb := coalesce(p_attachments, '[]'::jsonb);
  response_record jsonb;
  attachment_record jsonb;
  saved_run public.control_runs;
  control_type_record public.control_types%rowtype;
  field_record public.control_field_definitions%rowtype;
  object_record public.control_objects%rowtype;
  response_item_id uuid;
  response_object_id uuid;
  response_field_id uuid;
  response_value text;
  normalized_numeric_value text;
  response_has_deviation boolean;
  response_schema text;
  response_status text;
  response_value_json jsonb;
  response_action_text text;
  object_snapshot jsonb;
  value_number numeric;
  value_boolean boolean;
  value_date date;
  value_text text;
  field_limit_min numeric;
  field_limit_max numeric;
  computed_temperature_deviation boolean;
  not_applicable_reason text;
  food_action text;
  unit_action text;
  follow_up_status text;
  action_note text;
  check_measurement text;
  attachment_item_id uuid;
  attachment_bucket text;
  attachment_path text;
  has_deviation boolean;
  active_cold_object_count integer;
  submitted_cold_response_count integer;
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

  select control_type.*
  into control_type_record
  from public.control_types control_type
  where control_type.id = p_control_type_id
    and control_type.organization_id = p_organization_id
    and control_type.active = true;

  if not found then
    raise exception 'Control type not found' using errcode = '42501';
  end if;

  if control_type_record.control_key = 'cold_storage_temperature' then
    select count(*)
    into active_cold_object_count
    from public.control_objects control_object
    where control_object.organization_id = p_organization_id
      and control_object.control_type_id = p_control_type_id
      and control_object.active = true;

    select count(*)
    into submitted_cold_response_count
    from jsonb_array_elements(normalized_responses) response(value)
    join public.control_objects control_object
      on control_object.id = nullif(response.value ->> 'controlObjectId', '')::uuid
      and control_object.organization_id = p_organization_id
      and control_object.control_type_id = p_control_type_id
      and control_object.active = true
    join public.control_field_definitions field_definition
      on field_definition.id = nullif(response.value ->> 'fieldDefinitionId', '')::uuid
      and field_definition.organization_id = p_organization_id
      and field_definition.control_type_id = p_control_type_id
      and field_definition.active = true
      and field_definition.field_type = 'temperature'
      and (field_definition.control_object_id is null or field_definition.control_object_id = control_object.id);

    if active_cold_object_count = 0 or submitted_cold_response_count <> active_cold_object_count then
      raise exception 'Every active cold-storage unit requires exactly one temperature response' using errcode = '22023';
    end if;

    if exists (
      select 1
      from public.control_objects control_object
      where control_object.organization_id = p_organization_id
        and control_object.control_type_id = p_control_type_id
        and control_object.active = true
        and not exists (
          select 1
          from jsonb_array_elements(normalized_responses) response(value)
          join public.control_field_definitions field_definition
            on field_definition.id = nullif(response.value ->> 'fieldDefinitionId', '')::uuid
            and field_definition.organization_id = p_organization_id
            and field_definition.control_type_id = p_control_type_id
            and field_definition.active = true
            and field_definition.field_type = 'temperature'
            and (field_definition.control_object_id is null or field_definition.control_object_id = control_object.id)
          where nullif(response.value ->> 'controlObjectId', '')::uuid = control_object.id
        )
    ) then
      raise exception 'Every active cold-storage unit requires a temperature response' using errcode = '22023';
    end if;
  end if;

  select exists (
    select 1
    from jsonb_array_elements(normalized_responses) response(value)
    where coalesce((response.value ->> 'deviationDetected')::boolean, false)
  )
  into has_deviation;

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
    response_schema := nullif(response_record ->> 'responseSchema', '');
    response_status := case when response_has_deviation then 'deviation' else 'ok' end;
    response_value_json := coalesce(response_record -> 'valueJson', '{}'::jsonb);
    response_action_text := nullif(response_record ->> 'actionText', '');

    if response_item_id is null then
      raise exception 'controlRunItemId is required' using errcode = '22023';
    end if;

    if response_field_id is null then
      raise exception 'fieldDefinitionId is required' using errcode = '22023';
    end if;

    if jsonb_typeof(response_value_json) is distinct from 'object' then
      raise exception 'valueJson must be an object' using errcode = '22023';
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

    if response_schema is not null and response_schema <> 'cold_storage_v1' then
      raise exception 'Unsupported response schema' using errcode = '22023';
    end if;

    if response_schema = 'cold_storage_v1'
      and (
        control_type_record.control_key is distinct from 'cold_storage_temperature'
        or field_record.field_type <> 'temperature'
        or response_object_id is null
      )
    then
      raise exception 'Cold-storage response schema is not allowed for this field' using errcode = '22023';
    end if;

    value_number := null;
    value_boolean := null;
    value_date := null;
    value_text := null;

    if control_type_record.control_key = 'cold_storage_temperature'
      and field_record.field_type = 'temperature'
      and response_object_id is not null
    then
      field_limit_min := coalesce(
        nullif(field_record.deviation_rule #>> '{temperature,min}', '')::numeric,
        nullif(field_record.deviation_rule #>> '{temperature,limit_min}', '')::numeric,
        nullif(field_record.deviation_rule ->> 'min', '')::numeric,
        nullif(field_record.deviation_rule ->> 'limit_min', '')::numeric,
        object_record.limit_min
      );
      field_limit_max := coalesce(
        nullif(field_record.deviation_rule #>> '{temperature,max}', '')::numeric,
        nullif(field_record.deviation_rule #>> '{temperature,limit_max}', '')::numeric,
        nullif(field_record.deviation_rule ->> 'max', '')::numeric,
        nullif(field_record.deviation_rule ->> 'limit_max', '')::numeric,
        object_record.limit_max
      );

      if response_schema = 'cold_storage_v1' then
        response_status := nullif(response_record ->> 'status', '');

        if response_value_json ->> 'schema' is distinct from 'cold_storage_v1' then
          raise exception 'Cold-storage valueJson schema is required' using errcode = '22023';
        end if;

        if response_status = 'not_applicable' then
          not_applicable_reason := nullif(response_value_json ->> 'reason', '');
          if response_value <> '' or response_has_deviation then
            raise exception 'Not-applicable responses cannot contain a temperature or deviation' using errcode = '22023';
          end if;
          if response_value_json ->> 'kind' is distinct from 'not_applicable'
            or not_applicable_reason is null
            or not_applicable_reason not in ('empty_and_off', 'temporarily_out_of_service', 'other')
          then
            raise exception 'A valid not-applicable reason is required' using errcode = '22023';
          end if;
          if not_applicable_reason = 'other'
            and nullif(btrim(response_value_json ->> 'note'), '') is null
          then
            raise exception 'Other not-applicable reason requires a note' using errcode = '22023';
          end if;
          response_action_text := null;
        else
          normalized_numeric_value := replace(btrim(response_value), ',', '.');
          if normalized_numeric_value = '' then
            raise exception 'Temperature is required' using errcode = '22023';
          end if;
          if normalized_numeric_value !~ '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$' then
            raise exception 'Invalid temperature response' using errcode = '22023';
          end if;

          begin
            value_number := normalized_numeric_value::numeric;
          exception
            when invalid_text_representation then
              raise exception 'Invalid temperature response' using errcode = '22023';
          end;

          computed_temperature_deviation := (
            (field_limit_min is not null and value_number < field_limit_min)
            or (field_limit_max is not null and value_number > field_limit_max)
          );

          if computed_temperature_deviation then
            if response_status is distinct from 'deviation'
              or not response_has_deviation
              or response_value_json ->> 'kind' is distinct from 'temperature_deviation'
            then
              raise exception 'Temperature outside the action limit requires structured deviation documentation' using errcode = '22023';
            end if;

            food_action := nullif(response_value_json ->> 'foodAction', '');
            unit_action := nullif(response_value_json ->> 'unitAction', '');
            follow_up_status := nullif(response_value_json ->> 'followUpStatus', '');
            action_note := nullif(btrim(response_value_json ->> 'actionNote'), '');

            if food_action is null or food_action not in ('none_affected', 'moved', 'discarded', 'other') then
              raise exception 'A valid food action is required' using errcode = '22023';
            end if;
            if unit_action is null or unit_action not in ('adjusted', 'switched_off', 'service_contacted', 'none_needed', 'other') then
              raise exception 'A valid unit action is required' using errcode = '22023';
            end if;
            if follow_up_status is null or follow_up_status not in ('resolved', 'open') then
              raise exception 'A valid follow-up status is required' using errcode = '22023';
            end if;
            if (food_action = 'other' or unit_action = 'other') and action_note is null then
              raise exception 'Other action requires a note' using errcode = '22023';
            end if;
            if response_value_json ? 'checkMeasurement'
              and response_value_json -> 'checkMeasurement' <> 'null'::jsonb
              and jsonb_typeof(response_value_json -> 'checkMeasurement') <> 'number'
            then
              raise exception 'Check measurement must be numeric or null' using errcode = '22023';
            end if;

            check_measurement := case
              when jsonb_typeof(response_value_json -> 'checkMeasurement') = 'number'
                then response_value_json ->> 'checkMeasurement'
              else null
            end;
            response_has_deviation := true;
            response_action_text := concat(
              'Varor: ', case food_action
                when 'none_affected' then 'Inga varor påverkades'
                when 'moved' then 'Varorna flyttades'
                when 'discarded' then 'Varorna kasserades'
                else 'Annan åtgärd'
              end, '. Enhet: ', case unit_action
                when 'adjusted' then 'Enheten justerades'
                when 'switched_off' then 'Enheten stängdes av'
                when 'service_contacted' then 'Service kontaktades'
                when 'none_needed' then 'Ingen åtgärd behövdes'
                else 'Annan åtgärd'
              end, '.',
              case when check_measurement is not null then concat(' Kontrollmätning: ', check_measurement, ' °C.') else '' end,
              ' Uppföljning: ', case follow_up_status when 'resolved' then 'Löst' else 'Behöver följas upp' end, '.',
              case when action_note is not null then concat(' Komplettering: ', action_note) else '' end
            );
          else
            if response_status is distinct from 'ok'
              or response_has_deviation
              or response_value_json ->> 'kind' is distinct from 'temperature'
            then
              raise exception 'Temperature within the action limit must use ok status' using errcode = '22023';
            end if;
            response_has_deviation := false;
            response_action_text := null;
          end if;
        end if;
      else
        normalized_numeric_value := replace(btrim(response_value), ',', '.');
        if normalized_numeric_value = '' then
          raise exception 'Temperature is required' using errcode = '22023';
        end if;
        if normalized_numeric_value !~ '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$' then
          raise exception 'Invalid temperature response' using errcode = '22023';
        end if;
        begin
          value_number := normalized_numeric_value::numeric;
        exception
          when invalid_text_representation then
            raise exception 'Invalid temperature response' using errcode = '22023';
        end;
        computed_temperature_deviation := (
          (field_limit_min is not null and value_number < field_limit_min)
          or (field_limit_max is not null and value_number > field_limit_max)
        );
        if computed_temperature_deviation or response_has_deviation then
          raise exception 'Cold-storage deviations require the cold_storage_v1 response schema' using errcode = '22023';
        end if;
        response_status := 'ok';
        response_value_json := '{}'::jsonb;
        response_action_text := null;
      end if;
    elsif field_record.field_type in ('temperature', 'number') and response_value <> '' then
      value_number := replace(btrim(response_value), ',', '.')::numeric;
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

    if response_schema is null
      and (
        control_type_record.control_key is distinct from 'cold_storage_temperature'
        or field_record.field_type <> 'temperature'
        or response_object_id is null
      )
    then
      response_status := case when response_has_deviation then 'deviation' else 'ok' end;
      response_value_json := '{}'::jsonb;
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
      response_value_json,
      response_status,
      response_has_deviation,
      case
        when response_schema = 'cold_storage_v1' and response_has_deviation
          then 'Värdet ligger utanför företagets åtgärdsgräns.'
        else nullif(response_record ->> 'deviationReason', '')
      end,
      response_action_text
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
        opened_by,
        resolved_by,
        resolved_at
      )
      values (
        p_organization_id,
        saved_run.id,
        response_item_id,
        p_control_type_id,
        response_object_id,
        case when response_schema = 'cold_storage_v1' then follow_up_status else 'open' end,
        'medium',
        case
          when response_schema = 'cold_storage_v1' then 'Värdet ligger utanför företagets åtgärdsgräns.'
          else coalesce(nullif(response_record ->> 'deviationReason', ''), 'Avvikelse i kontroll.')
        end,
        coalesce(response_action_text, 'Åtgärd saknas.'),
        current_user_id,
        case when response_schema = 'cold_storage_v1' and follow_up_status = 'resolved' then current_user_id else null end,
        case when response_schema = 'cold_storage_v1' and follow_up_status = 'resolved' then statement_timestamp() else null end
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
  'Saves control runs through caller RLS. cold_storage_temperature validates complete unit coverage, structured not-applicable reasons and structured open/resolved deviation actions while legacy payloads for other control types remain compatible.';
