create index attachments_org_idx on public.attachments(organization_id);
create index attachments_item_idx on public.attachments(control_run_item_id);
create index attachments_deviation_idx on public.attachments(deviation_id);
create index attachments_uploaded_by_idx on public.attachments(uploaded_by);

create index control_fields_org_idx on public.control_field_definitions(organization_id);
create index control_objects_org_idx on public.control_objects(organization_id);
create index control_run_items_org_idx on public.control_run_items(organization_id);
create index control_run_items_object_idx on public.control_run_items(control_object_id);
create index control_run_items_field_idx on public.control_run_items(field_definition_id);
create index control_runs_performed_by_idx on public.control_runs(performed_by);
create index control_types_template_idx on public.control_types(template_id);
create index control_types_created_by_idx on public.control_types(created_by);

create index deviations_item_idx on public.deviations(control_run_item_id);
create index deviations_type_idx on public.deviations(control_type_id);
create index deviations_object_idx on public.deviations(control_object_id);
create index deviations_opened_by_idx on public.deviations(opened_by);
create index deviations_resolved_by_idx on public.deviations(resolved_by);

create index export_logs_share_link_idx on public.export_logs(share_link_id);
create index export_logs_requested_by_idx on public.export_logs(requested_by);
create index share_links_created_by_idx on public.share_links(created_by);
