update public.control_field_definitions field
set
  label = 'Leverantör',
  field_type = 'select',
  options = '[]'::jsonb,
  active = true
where field.field_key = 'supplier'
  and exists (
    select 1
    from public.control_types control_type
    where control_type.id = field.control_type_id
      and control_type.category in ('receiving', 'traceability')
  );
