alter table public.control_templates
  add column if not exists control_key text;

alter table public.control_types
  add column if not exists control_key text;

alter table public.control_templates
  add constraint control_templates_control_key_format_check
  check (control_key is null or control_key ~ '^[a-z][a-z0-9_]*$');

alter table public.control_types
  add constraint control_types_control_key_format_check
  check (control_key is null or control_key ~ '^[a-z][a-z0-9_]*$');

create unique index control_templates_control_key_unique_idx
  on public.control_templates(control_key)
  where control_key is not null;

create unique index control_types_organization_control_key_unique_idx
  on public.control_types(organization_id, control_key)
  where control_key is not null;

update public.control_templates
set control_key = 'cold_storage_temperature'
where category = 'temperature'
  and lower(btrim(name)) = 'kyltemperaturer';

update public.control_types control_type
set control_key = template.control_key
from public.control_templates template
where control_type.template_id = template.id
  and template.control_key is not null
  and control_type.control_key is distinct from template.control_key;

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
  validated_responses jsonb := '[]'::jsonb;
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
  response_status text;
  response_value_json jsonb;
  response_has_deviation boolean;
  response_deviation_reason text;
  response_action_text text;
  response_deviation_status text;
  object_snapshot jsonb;
  value_number numeric;
  value_boolean boolean;
  value_date date;
  value_text text;
  temperature_rule jsonb;
  temperature_min numeric;
  temperature_max numeric;
  not_applicable_reason text;
  not_applicable_note text;
  goods_action text;
  equipment_action text;
  deviation_resolution text;
  deviation_note text;
  recheck_temperature numeric;
  attachment_item_id uuid;
  attachment_bucket text;
  attachment_path text;
  has_deviation boolean := false;
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

  select *
  into control_type_record
  from public.control_types control_type
  where control_type.id = p_control_type_id
    and control_type.organization_id = p_organization_id
    and control_type.active = true;

  if not found then
    raise exception 'Control type not found' using errcode = '42501';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(normalized_responses) response(value)
    group by
      nullif(response.value ->> 'controlObjectId', ''),
      nullif(response.value ->> 'fieldDefinitionId', '')
    having count(*) > 1
  ) then
    raise exception 'Duplicate response for control object and field' using errcode = '22023';
  end if;

  if control_type_record.control_key = 'cold_storage_temperature' then
    if not exists (
      select 1
      from public.control_objects control_object
      where control_object.organization_id = p_organization_id
        and control_object.control_type_id = p_control_type_id
        and control_object.active = true
    ) then
      raise exception 'Cold storage control requires at least one active unit' using errcode = '22023';
    end if;

    if exists (
      select 1
      from public.control_objects control_object
      where control_object.organization_id = p_organization_id
        and control_object.control_type_id = p_control_type_id
        and control_object.active = true
        and (
          select count(*)
          from public.control_field_definitions field_definition
          where field_definition.organization_id = p_organization_id
            and field_definition.control_type_id = p_control_type_id
            and field_definition.active = true
            and field_definition.field_type = 'temperature'
            and (
              field_definition.control_object_id is null
              or field_definition.control_object_id = control_object.id
            )
        ) <> 1
    ) then
      raise exception 'Each cold storage unit must have exactly one active temperature field' using errcode = '22023';
    end if;

    if exists (
      select 1
      from public.control_objects control_object
      join public.control_field_definitions field_definition
        on field_definition.organization_id = control_object.organization_id
        and field_definition.control_type_id = control_object.control_type_id
        and field_definition.active = true
        and field_definition.field_type = 'temperature'
        and (
          field_definition.control_object_id is null
          or field_definition.control_object_id = control_object.id
        )
      where control_object.organization_id = p_organization_id
        and control_object.control_type_id = p_control_type_id
        and control_object.active = true
        and (
          select count(*)
          from jsonb_array_elements(normalized_responses) response(value)
          where nullif(response.value ->> 'controlObjectId', '')::uuid = control_object.id
            and nullif(response.value ->> 'fieldDefinitionId', '')::uuid = field_definition.id
        ) <> 1
    ) then
      raise exception 'Every active cold storage unit requires one outcome' using errcode = '22023';
    end if;
  end if;

  for response_record in
    select value
    from jsonb_array_elements(normalized_responses)
  loop
    response_item_id := nullif(response_record ->> 'controlRunItemId', '')::uuid;
    response_object_id := nullif(response_record ->> 'controlObjectId', '')::uuid;
    response_field_id := nullif(response_record ->> 'fieldDefinitionId', '')::uuid;
    response_value := btrim(coalesce(response_record ->> 'value', ''));
    response_status := nullif(response_record ->> 'status', '');
    response_value_json := coalesce(response_record -> 'valueJson', '{}'::jsonb);
    response_has_deviation := coalesce((response_record ->> 'deviationDetected')::boolean, false);
    response_deviation_reason := nullif(response_record ->> 'deviationReason', '');
    response_action_text := nullif(btrim(response_record ->> 'actionText'), '');
    response_deviation_status := nullif(response_record ->> 'deviationStatus', '');

    if response_item_id is null then
      raise exception 'controlRunItemId is required' using errcode = '22023';
    end if;

    if response_field_id is null then
      raise exception 'fieldDefinitionId is required' using errcode = '22023';
    end if;

    if jsonb_typeof(response_value_json) <> 'object' then
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
    object_snapshot := '{}'::jsonb;

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
    end if;

    if field_record.control_object_id is not null
      and (response_object_id is null or response_object_id <> field_record.control_object_id)
    then
      raise exception 'Field definition does not belong to control object' using errcode = '42501';
    end if;

    if field_record.required
      and response_value = ''
      and not (
        control_type_record.control_key = 'cold_storage_temperature'
        and field_record.field_type = 'temperature'
        and response_status = 'not_applicable'
      )
    then
      raise exception 'Required response is missing' using errcode = '22023';
    end if;

    if control_type_record.control_key = 'cold_storage_temperature'
      and field_record.field_type = 'temperature'
    then
      if response_object_id is null then
        raise exception 'Cold storage temperature requires a control object' using errcode = '22023';
      end if;

      if response_status = 'not_applicable' then
        if response_value <> '' then
          raise exception 'Not applicable temperature must not include a numeric value' using errcode = '22023';
        end if;

        not_applicable_reason := nullif(response_value_json #>> '{notApplicable,reasonCode}', '');
        not_applicable_note := nullif(btrim(response_value_json #>> '{notApplicable,note}'), '');

        if not_applicable_reason is null
          or not_applicable_reason not in ('empty_powered_off', 'temporarily_out_of_service', 'other')
        then
          raise exception 'Invalid not applicable reason' using errcode = '22023';
        end if;

        if not_applicable_reason = 'other' and not_applicable_note is null then
          raise exception 'Other not applicable reason requires a note' using errcode = '22023';
        end if;

        response_status := 'not_applicable';
        response_has_deviation := false;
        response_deviation_reason := null;
        response_action_text := null;
        response_deviation_status := null;
        response_value_json := jsonb_build_object(
          'schema', 'cold_storage_v1',
          'notApplicable', jsonb_build_object(
            'reasonCode', not_applicable_reason,
            'reasonLabel', case not_applicable_reason
              when 'empty_powered_off' then 'Tom och avstängd'
              when 'temporarily_out_of_service' then 'Tillfälligt ur bruk'
              else 'Annan orsak'
            end,
            'note', not_applicable_note
          )
        );
      else
        if response_status is not null and response_status not in ('ok', 'deviation') then
          raise exception 'Invalid cold storage response status' using errcode = '22023';
        end if;

        if response_value = ''
          or replace(response_value, ',', '.') !~ '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$'
        then
          raise exception 'Invalid temperature response' using errcode = '22023';
        end if;

        response_value := replace(response_value, ',', '.');
        value_number := response_value::numeric;
        temperature_rule := coalesce(field_record.deviation_rule -> 'temperature', '{}'::jsonb);
        temperature_min := coalesce(
          nullif(temperature_rule ->> 'min', '')::numeric,
          nullif(temperature_rule ->> 'limit_min', '')::numeric,
          nullif(field_record.deviation_rule ->> 'min', '')::numeric,
          nullif(field_record.deviation_rule ->> 'limit_min', '')::numeric
        );
        temperature_max := coalesce(
          nullif(temperature_rule ->> 'max', '')::numeric,
          nullif(temperature_rule ->> 'limit_max', '')::numeric,
          nullif(field_record.deviation_rule ->> 'max', '')::numeric,
          nullif(field_record.deviation_rule ->> 'limit_max', '')::numeric
        );
        if temperature_min is null and temperature_max is null then
          temperature_min := object_record.limit_min;
          temperature_max := object_record.limit_max;
        end if;
        response_has_deviation := (
          (temperature_min is not null and value_number < temperature_min)
          or (temperature_max is not null and value_number > temperature_max)
        );

        if response_has_deviation then
          response_status := 'deviation';
          response_deviation_reason := 'Värdet ligger utanför företagets åtgärdsgräns.';

          if response_value_json ->> 'schema' = 'cold_storage_v1' then
            goods_action := nullif(response_value_json #>> '{deviation,goodsActionCode}', '');
            equipment_action := nullif(response_value_json #>> '{deviation,equipmentActionCode}', '');
            deviation_resolution := nullif(response_value_json #>> '{deviation,resolution}', '');
            deviation_note := nullif(btrim(response_value_json #>> '{deviation,note}'), '');

            if goods_action is null
              or goods_action not in ('unaffected', 'moved', 'discarded', 'other')
            then
              raise exception 'Invalid goods action' using errcode = '22023';
            end if;

            if equipment_action is null
              or equipment_action not in ('adjusted', 'shut_down', 'service_contacted', 'no_action_needed', 'other')
            then
              raise exception 'Invalid equipment action' using errcode = '22023';
            end if;

            if deviation_resolution is null
              or deviation_resolution not in ('resolved', 'follow_up')
            then
              raise exception 'Invalid deviation resolution' using errcode = '22023';
            end if;

            if (goods_action = 'other' or equipment_action = 'other') and deviation_note is null then
              raise exception 'Other deviation action requires a note' using errcode = '22023';
            end if;

            if response_value_json #>> '{deviation,recheckTemperature}' is not null then
              if (response_value_json #>> '{deviation,recheckTemperature}') !~ '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$' then
                raise exception 'Invalid recheck temperature' using errcode = '22023';
              end if;
              recheck_temperature := (response_value_json #>> '{deviation,recheckTemperature}')::numeric;
            else
              recheck_temperature := null;
            end if;

            response_deviation_status := case deviation_resolution
              when 'resolved' then 'resolved'
              else 'open'
            end;
            response_action_text := concat_ws(
              ' · ',
              'Varor: ' || case goods_action
                when 'unaffected' then 'Inga varor påverkades'
                when 'moved' then 'Varorna flyttades'
                when 'discarded' then 'Varorna kasserades'
                else 'Annan åtgärd för varorna'
              end,
              'Enhet: ' || case equipment_action
                when 'adjusted' then 'Enheten justerades'
                when 'shut_down' then 'Enheten stängdes av'
                when 'service_contacted' then 'Service kontaktades'
                when 'no_action_needed' then 'Ingen åtgärd behövdes'
                else 'Annan åtgärd för enheten'
              end,
              case when recheck_temperature is not null
                then 'Kontrollmätning: ' || recheck_temperature::text || ' °C'
              end,
              case when deviation_note is not null
                then 'Komplettering: ' || deviation_note
              end,
              case deviation_resolution
                when 'resolved' then 'Status: Löst'
                else 'Status: Behöver följas upp'
              end
            );
            response_value_json := jsonb_build_object(
              'schema', 'cold_storage_v1',
              'deviation', jsonb_build_object(
                'goodsActionCode', goods_action,
                'goodsActionLabel', case goods_action
                  when 'unaffected' then 'Inga varor påverkades'
                  when 'moved' then 'Varorna flyttades'
                  when 'discarded' then 'Varorna kasserades'
                  else 'Annan åtgärd för varorna'
                end,
                'equipmentActionCode', equipment_action,
                'equipmentActionLabel', case equipment_action
                  when 'adjusted' then 'Enheten justerades'
                  when 'shut_down' then 'Enheten stängdes av'
                  when 'service_contacted' then 'Service kontaktades'
                  when 'no_action_needed' then 'Ingen åtgärd behövdes'
                  else 'Annan åtgärd för enheten'
                end,
                'recheckTemperature', recheck_temperature,
                'resolution', deviation_resolution,
                'note', deviation_note
              )
            );
          else
            -- Keep the previous client payload working during a rolling deployment.
            -- The server still derives the deviation from the stored limits.
            if response_action_text is null then
              raise exception 'Deviation action is required' using errcode = '22023';
            end if;

            response_deviation_status := 'open';
            response_value_json := jsonb_build_object('schema', 'legacy_action_v1');
          end if;
        else
          response_status := 'ok';
          response_deviation_reason := null;
          response_action_text := null;
          response_deviation_status := null;
          response_value_json := jsonb_build_object('schema', 'cold_storage_v1');
        end if;
      end if;
    else
      response_status := case when response_has_deviation then 'deviation' else 'ok' end;
      response_deviation_status := case when response_has_deviation then 'open' else null end;

      if response_has_deviation and response_action_text is null then
        raise exception 'Deviation action is required' using errcode = '22023';
      end if;
    end if;

    has_deviation := has_deviation or response_has_deviation;
    validated_responses := validated_responses || jsonb_build_array(
      response_record || jsonb_build_object(
        'normalizedValue', response_value,
        'normalizedStatus', response_status,
        'normalizedValueJson', response_value_json,
        'normalizedDeviationDetected', response_has_deviation,
        'normalizedDeviationReason', response_deviation_reason,
        'normalizedActionText', response_action_text,
        'normalizedDeviationStatus', response_deviation_status
      )
    );
  end loop;

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
    from jsonb_array_elements(validated_responses)
  loop
    response_item_id := nullif(response_record ->> 'controlRunItemId', '')::uuid;
    response_object_id := nullif(response_record ->> 'controlObjectId', '')::uuid;
    response_field_id := nullif(response_record ->> 'fieldDefinitionId', '')::uuid;
    response_value := coalesce(response_record ->> 'normalizedValue', '');
    response_status := response_record ->> 'normalizedStatus';
    response_value_json := coalesce(response_record -> 'normalizedValueJson', '{}'::jsonb);
    response_has_deviation := coalesce((response_record ->> 'normalizedDeviationDetected')::boolean, false);
    response_deviation_reason := nullif(response_record ->> 'normalizedDeviationReason', '');
    response_action_text := nullif(response_record ->> 'normalizedActionText', '');
    response_deviation_status := nullif(response_record ->> 'normalizedDeviationStatus', '');

    select *
    into field_record
    from public.control_field_definitions field_definition
    where field_definition.id = response_field_id
      and field_definition.organization_id = p_organization_id
      and field_definition.control_type_id = p_control_type_id
      and field_definition.active = true;

    object_record := null;
    object_snapshot := '{}'::jsonb;
    if response_object_id is not null then
      select *
      into object_record
      from public.control_objects control_object
      where control_object.id = response_object_id
        and control_object.organization_id = p_organization_id
        and control_object.control_type_id = p_control_type_id
        and control_object.active = true;
      object_snapshot := to_jsonb(object_record);
    end if;

    value_number := null;
    value_boolean := null;
    value_date := null;
    value_text := null;

    if response_status <> 'not_applicable'
      and field_record.field_type in ('temperature', 'number')
      and response_value <> ''
    then
      value_number := replace(response_value, ',', '.')::numeric;
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
      response_value_json,
      response_status,
      response_has_deviation,
      response_deviation_reason,
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
        coalesce(response_deviation_status, 'open'),
        'medium',
        coalesce(response_deviation_reason, 'Avvikelse i kontroll.'),
        response_action_text,
        current_user_id,
        case when response_deviation_status = 'resolved' then current_user_id end,
        case when response_deviation_status = 'resolved' then statement_timestamp() end
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

revoke execute on function public.save_control_run_transactional(uuid, uuid, uuid, jsonb, jsonb)
from public, anon;
grant execute on function public.save_control_run_transactional(uuid, uuid, uuid, jsonb, jsonb)
to authenticated;

comment on function public.save_control_run_transactional(uuid, uuid, uuid, jsonb, jsonb) is
  'Saves validated control runs atomically as security invoker. Cold-storage outcomes are complete per active unit, temperature deviations are derived from stored limits, and not-applicable/open/resolved states are preserved structurally.';
