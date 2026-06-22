update public.control_templates
set template_schema = jsonb_set(
  template_schema,
  '{fields}',
  (
    select jsonb_agg(
      case
        when field ->> 'field_key' in ('time', 'start_time', 'end_time')
          then jsonb_set(field, '{field_type}', '"datetime"'::jsonb)
        else field
      end
      order by ordinality
    )
    from jsonb_array_elements(template_schema -> 'fields') with ordinality as fields(field, ordinality)
  )
)
where locale = 'sv-SE'
  and name in ('Varmhållning', 'Nedkylning')
  and template_schema ? 'fields';

update public.control_field_definitions field
set field_type = 'datetime'
from public.control_types control_type
where control_type.id = field.control_type_id
  and control_type.name in ('Varmhållning', 'Nedkylning')
  and field.field_key in ('time', 'start_time', 'end_time');
