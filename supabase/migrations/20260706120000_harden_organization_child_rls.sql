do $$
begin
  if exists (
    select 1
    from public.control_runs runs
    left join public.control_types types on types.id = runs.control_type_id
    where types.id is null
      or types.organization_id <> runs.organization_id
  ) then
    raise exception 'RLS preflight failed: control_runs contains cross-organization control_type references';
  end if;

  if exists (
    select 1
    from public.control_run_items items
    left join public.control_runs runs on runs.id = items.control_run_id
    where runs.id is null
      or runs.organization_id <> items.organization_id
  ) then
    raise exception 'RLS preflight failed: control_run_items contains cross-organization control_run references';
  end if;

  if exists (
    select 1
    from public.control_run_items items
    left join public.control_objects objects on objects.id = items.control_object_id
    where items.control_object_id is not null
      and (
        objects.id is null
        or objects.organization_id <> items.organization_id
      )
  ) then
    raise exception 'RLS preflight failed: control_run_items contains cross-organization control_object references';
  end if;

  if exists (
    select 1
    from public.control_run_items items
    left join public.control_field_definitions fields on fields.id = items.field_definition_id
    where items.field_definition_id is not null
      and (
        fields.id is null
        or fields.organization_id <> items.organization_id
      )
  ) then
    raise exception 'RLS preflight failed: control_run_items contains cross-organization field_definition references';
  end if;

  if exists (
    select 1
    from public.control_run_items items
    join public.control_runs runs on runs.id = items.control_run_id
    join public.control_objects objects on objects.id = items.control_object_id
    where items.control_object_id is not null
      and objects.control_type_id <> runs.control_type_id
  ) then
    raise exception 'RLS preflight failed: control_run_items contains control_object references from a different control type than the parent run';
  end if;

  if exists (
    select 1
    from public.control_run_items items
    join public.control_runs runs on runs.id = items.control_run_id
    join public.control_field_definitions fields on fields.id = items.field_definition_id
    where items.field_definition_id is not null
      and fields.control_type_id <> runs.control_type_id
  ) then
    raise exception 'RLS preflight failed: control_run_items contains field_definition references from a different control type than the parent run';
  end if;

  if exists (
    select 1
    from public.deviations deviations
    left join public.control_runs runs on runs.id = deviations.control_run_id
    where runs.id is null
      or runs.organization_id <> deviations.organization_id
  ) then
    raise exception 'RLS preflight failed: deviations contains cross-organization control_run references';
  end if;

  if exists (
    select 1
    from public.deviations deviations
    left join public.control_run_items items on items.id = deviations.control_run_item_id
    where deviations.control_run_item_id is not null
      and (
        items.id is null
        or items.organization_id <> deviations.organization_id
      )
  ) then
    raise exception 'RLS preflight failed: deviations contains cross-organization control_run_item references';
  end if;

  if exists (
    select 1
    from public.deviations deviations
    left join public.control_types types on types.id = deviations.control_type_id
    where deviations.control_type_id is not null
      and (
        types.id is null
        or types.organization_id <> deviations.organization_id
      )
  ) then
    raise exception 'RLS preflight failed: deviations contains cross-organization control_type references';
  end if;

  if exists (
    select 1
    from public.deviations deviations
    left join public.control_objects objects on objects.id = deviations.control_object_id
    where deviations.control_object_id is not null
      and (
        objects.id is null
        or objects.organization_id <> deviations.organization_id
      )
  ) then
    raise exception 'RLS preflight failed: deviations contains cross-organization control_object references';
  end if;

  if exists (
    select 1
    from public.deviations deviations
    join public.control_run_items items on items.id = deviations.control_run_item_id
    where deviations.control_run_item_id is not null
      and items.control_run_id <> deviations.control_run_id
  ) then
    raise exception 'RLS preflight failed: deviations contains control_run_item references from a different parent run';
  end if;

  if exists (
    select 1
    from public.deviations deviations
    join public.control_runs runs on runs.id = deviations.control_run_id
    where deviations.control_type_id is not null
      and deviations.control_type_id <> runs.control_type_id
  ) then
    raise exception 'RLS preflight failed: deviations contains control_type references that do not match the parent run';
  end if;

  if exists (
    select 1
    from public.deviations deviations
    join public.control_runs runs on runs.id = deviations.control_run_id
    join public.control_objects objects on objects.id = deviations.control_object_id
    where deviations.control_object_id is not null
      and objects.control_type_id <> runs.control_type_id
  ) then
    raise exception 'RLS preflight failed: deviations contains control_object references from a different control type than the parent run';
  end if;

  if exists (
    select 1
    from public.attachments attachments
    left join public.control_runs runs on runs.id = attachments.control_run_id
    where attachments.control_run_id is not null
      and (
        runs.id is null
        or runs.organization_id <> attachments.organization_id
      )
  ) then
    raise exception 'RLS preflight failed: attachments contains cross-organization control_run references';
  end if;

  if exists (
    select 1
    from public.attachments attachments
    left join public.control_run_items items on items.id = attachments.control_run_item_id
    where attachments.control_run_item_id is not null
      and (
        items.id is null
        or items.organization_id <> attachments.organization_id
      )
  ) then
    raise exception 'RLS preflight failed: attachments contains cross-organization control_run_item references';
  end if;

  if exists (
    select 1
    from public.attachments attachments
    left join public.deviations deviations on deviations.id = attachments.deviation_id
    where attachments.deviation_id is not null
      and (
        deviations.id is null
        or deviations.organization_id <> attachments.organization_id
      )
  ) then
    raise exception 'RLS preflight failed: attachments contains cross-organization deviation references';
  end if;

  if exists (
    select 1
    from public.attachments attachments
    join public.control_run_items items on items.id = attachments.control_run_item_id
    where attachments.control_run_id is not null
      and attachments.control_run_item_id is not null
      and items.control_run_id <> attachments.control_run_id
  ) then
    raise exception 'RLS preflight failed: attachments contains control_run_item references from a different parent run';
  end if;

  if exists (
    select 1
    from public.attachments attachments
    join public.deviations deviations on deviations.id = attachments.deviation_id
    where attachments.control_run_id is not null
      and attachments.deviation_id is not null
      and deviations.control_run_id <> attachments.control_run_id
  ) then
    raise exception 'RLS preflight failed: attachments contains deviation references from a different parent run';
  end if;

  if exists (
    select 1
    from public.attachments attachments
    join public.deviations deviations on deviations.id = attachments.deviation_id
    where attachments.control_run_item_id is not null
      and attachments.deviation_id is not null
      and deviations.control_run_item_id is not null
      and deviations.control_run_item_id <> attachments.control_run_item_id
  ) then
    raise exception 'RLS preflight failed: attachments contains deviation references from a different parent run item';
  end if;

  if exists (
    select 1
    from public.attachments attachments
    where attachments.storage_bucket <> 'control-attachments'
      or split_part(attachments.storage_path, '/', 1) <> attachments.organization_id::text
  ) then
    raise exception 'RLS preflight failed: attachments contains unexpected storage bucket or organization path prefix';
  end if;
end $$;

create or replace function private.control_type_belongs_to_org(
  target_control_type_id uuid,
  target_organization_id uuid
)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.control_types control_type
    where control_type.id = target_control_type_id
      and control_type.organization_id = target_organization_id
  );
$$;

create or replace function private.control_run_belongs_to_org(
  target_control_run_id uuid,
  target_organization_id uuid
)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.control_runs control_run
    where control_run.id = target_control_run_id
      and control_run.organization_id = target_organization_id
  );
$$;

create or replace function private.control_type_matches_run(
  target_control_type_id uuid,
  target_control_run_id uuid,
  target_organization_id uuid
)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.control_runs control_run
    where control_run.id = target_control_run_id
      and control_run.organization_id = target_organization_id
      and control_run.control_type_id = target_control_type_id
  );
$$;

create or replace function private.control_run_item_belongs_to_org(
  target_control_run_item_id uuid,
  target_organization_id uuid
)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.control_run_items control_run_item
    where control_run_item.id = target_control_run_item_id
      and control_run_item.organization_id = target_organization_id
  );
$$;

create or replace function private.control_run_item_matches_run(
  target_control_run_item_id uuid,
  target_control_run_id uuid,
  target_organization_id uuid
)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.control_run_items control_run_item
    where control_run_item.id = target_control_run_item_id
      and control_run_item.organization_id = target_organization_id
      and control_run_item.control_run_id = target_control_run_id
  );
$$;

create or replace function private.control_object_belongs_to_org(
  target_control_object_id uuid,
  target_organization_id uuid
)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.control_objects control_object
    where control_object.id = target_control_object_id
      and control_object.organization_id = target_organization_id
  );
$$;

create or replace function private.control_object_matches_run(
  target_control_object_id uuid,
  target_control_run_id uuid,
  target_organization_id uuid
)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.control_objects control_object
    join public.control_runs control_run
      on control_run.id = target_control_run_id
      and control_run.organization_id = target_organization_id
    where control_object.id = target_control_object_id
      and control_object.organization_id = target_organization_id
      and control_object.control_type_id = control_run.control_type_id
  );
$$;

create or replace function private.control_field_belongs_to_org(
  target_field_definition_id uuid,
  target_organization_id uuid
)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.control_field_definitions field_definition
    where field_definition.id = target_field_definition_id
      and field_definition.organization_id = target_organization_id
  );
$$;

create or replace function private.control_field_matches_run(
  target_field_definition_id uuid,
  target_control_run_id uuid,
  target_organization_id uuid
)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.control_field_definitions field_definition
    join public.control_runs control_run
      on control_run.id = target_control_run_id
      and control_run.organization_id = target_organization_id
    where field_definition.id = target_field_definition_id
      and field_definition.organization_id = target_organization_id
      and field_definition.control_type_id = control_run.control_type_id
  );
$$;

create or replace function private.deviation_belongs_to_org(
  target_deviation_id uuid,
  target_organization_id uuid
)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.deviations deviation
    where deviation.id = target_deviation_id
      and deviation.organization_id = target_organization_id
  );
$$;

create or replace function private.deviation_parent_matches_org(
  target_deviation_id uuid,
  target_control_run_id uuid,
  target_control_run_item_id uuid,
  target_organization_id uuid
)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.deviations deviation
    where deviation.id = target_deviation_id
      and deviation.organization_id = target_organization_id
      and (
        target_control_run_id is null
        or deviation.control_run_id = target_control_run_id
      )
      and (
        target_control_run_item_id is null
        or deviation.control_run_item_id is null
        or deviation.control_run_item_id = target_control_run_item_id
      )
  );
$$;

create or replace function private.storage_path_belongs_to_org(
  target_storage_path text,
  target_organization_id uuid
)
returns boolean
language sql
security definer
set search_path = public
as $$
  select split_part(coalesce(target_storage_path, ''), '/', 1) = target_organization_id::text;
$$;

revoke execute on function private.control_type_belongs_to_org(uuid, uuid) from public;
revoke execute on function private.control_run_belongs_to_org(uuid, uuid) from public;
revoke execute on function private.control_type_matches_run(uuid, uuid, uuid) from public;
revoke execute on function private.control_run_item_belongs_to_org(uuid, uuid) from public;
revoke execute on function private.control_run_item_matches_run(uuid, uuid, uuid) from public;
revoke execute on function private.control_object_belongs_to_org(uuid, uuid) from public;
revoke execute on function private.control_object_matches_run(uuid, uuid, uuid) from public;
revoke execute on function private.control_field_belongs_to_org(uuid, uuid) from public;
revoke execute on function private.control_field_matches_run(uuid, uuid, uuid) from public;
revoke execute on function private.deviation_belongs_to_org(uuid, uuid) from public;
revoke execute on function private.deviation_parent_matches_org(uuid, uuid, uuid, uuid) from public;
revoke execute on function private.storage_path_belongs_to_org(text, uuid) from public;

revoke execute on function private.control_type_belongs_to_org(uuid, uuid) from anon;
revoke execute on function private.control_run_belongs_to_org(uuid, uuid) from anon;
revoke execute on function private.control_type_matches_run(uuid, uuid, uuid) from anon;
revoke execute on function private.control_run_item_belongs_to_org(uuid, uuid) from anon;
revoke execute on function private.control_run_item_matches_run(uuid, uuid, uuid) from anon;
revoke execute on function private.control_object_belongs_to_org(uuid, uuid) from anon;
revoke execute on function private.control_object_matches_run(uuid, uuid, uuid) from anon;
revoke execute on function private.control_field_belongs_to_org(uuid, uuid) from anon;
revoke execute on function private.control_field_matches_run(uuid, uuid, uuid) from anon;
revoke execute on function private.deviation_belongs_to_org(uuid, uuid) from anon;
revoke execute on function private.deviation_parent_matches_org(uuid, uuid, uuid, uuid) from anon;
revoke execute on function private.storage_path_belongs_to_org(text, uuid) from anon;

grant execute on function private.control_type_belongs_to_org(uuid, uuid) to authenticated;
grant execute on function private.control_run_belongs_to_org(uuid, uuid) to authenticated;
grant execute on function private.control_type_matches_run(uuid, uuid, uuid) to authenticated;
grant execute on function private.control_run_item_belongs_to_org(uuid, uuid) to authenticated;
grant execute on function private.control_run_item_matches_run(uuid, uuid, uuid) to authenticated;
grant execute on function private.control_object_belongs_to_org(uuid, uuid) to authenticated;
grant execute on function private.control_object_matches_run(uuid, uuid, uuid) to authenticated;
grant execute on function private.control_field_belongs_to_org(uuid, uuid) to authenticated;
grant execute on function private.control_field_matches_run(uuid, uuid, uuid) to authenticated;
grant execute on function private.deviation_belongs_to_org(uuid, uuid) to authenticated;
grant execute on function private.deviation_parent_matches_org(uuid, uuid, uuid, uuid) to authenticated;
grant execute on function private.storage_path_belongs_to_org(text, uuid) to authenticated;

drop policy if exists "users can read organizations they belong to" on public.organizations;
drop policy if exists "organization members can read organizations" on public.organizations;
create policy "users can read organizations they belong to"
on public.organizations
for select
to authenticated
using (
  private.is_org_member(id)
  or (
    created_by = (select auth.uid())
    and not private.organization_has_members(id)
  )
);

drop policy if exists "members can create control runs" on public.control_runs;
create policy "members can create control runs"
on public.control_runs
for insert
to authenticated
with check (
  private.is_org_member(organization_id)
  and performed_by = (select auth.uid())
  and private.control_type_belongs_to_org(control_type_id, organization_id)
);

drop policy if exists "members can update control runs" on public.control_runs;
create policy "members can update control runs"
on public.control_runs
for update
to authenticated
using (private.is_org_member(organization_id))
with check (
  private.is_org_member(organization_id)
  and private.control_type_belongs_to_org(control_type_id, organization_id)
);

drop policy if exists "members can create control run items" on public.control_run_items;
create policy "members can create control run items"
on public.control_run_items
for insert
to authenticated
with check (
  private.is_org_member(organization_id)
  and private.control_run_belongs_to_org(control_run_id, organization_id)
  and (
    control_object_id is null
    or private.control_object_matches_run(control_object_id, control_run_id, organization_id)
  )
  and (
    field_definition_id is null
    or private.control_field_matches_run(field_definition_id, control_run_id, organization_id)
  )
);

drop policy if exists "members can create deviations" on public.deviations;
create policy "members can create deviations"
on public.deviations
for insert
to authenticated
with check (
  private.is_org_member(organization_id)
  and opened_by = (select auth.uid())
  and private.control_run_belongs_to_org(control_run_id, organization_id)
  and (
    control_run_item_id is null
    or private.control_run_item_matches_run(control_run_item_id, control_run_id, organization_id)
  )
  and (
    control_type_id is null
    or private.control_type_matches_run(control_type_id, control_run_id, organization_id)
  )
  and (
    control_object_id is null
    or private.control_object_matches_run(control_object_id, control_run_id, organization_id)
  )
);

drop policy if exists "members can update deviations" on public.deviations;
create policy "members can update deviations"
on public.deviations
for update
to authenticated
using (private.is_org_member(organization_id))
with check (
  private.is_org_member(organization_id)
  and private.control_run_belongs_to_org(control_run_id, organization_id)
  and (
    control_run_item_id is null
    or private.control_run_item_matches_run(control_run_item_id, control_run_id, organization_id)
  )
  and (
    control_type_id is null
    or private.control_type_matches_run(control_type_id, control_run_id, organization_id)
  )
  and (
    control_object_id is null
    or private.control_object_matches_run(control_object_id, control_run_id, organization_id)
  )
);

drop policy if exists "members can create attachments" on public.attachments;
create policy "members can create attachments"
on public.attachments
for insert
to authenticated
with check (
  private.is_org_member(organization_id)
  and uploaded_by = (select auth.uid())
  and storage_bucket = 'control-attachments'
  and private.storage_path_belongs_to_org(storage_path, organization_id)
  and (
    control_run_id is null
    or private.control_run_belongs_to_org(control_run_id, organization_id)
  )
  and (
    control_run_item_id is null
    or (
      private.control_run_item_belongs_to_org(control_run_item_id, organization_id)
      and (
        control_run_id is null
        or private.control_run_item_matches_run(control_run_item_id, control_run_id, organization_id)
      )
    )
  )
  and (
    deviation_id is null
    or private.deviation_parent_matches_org(deviation_id, control_run_id, control_run_item_id, organization_id)
  )
);

comment on function private.control_type_belongs_to_org(uuid, uuid) is
  'Private RLS helper for validating child rows against their organization parent.';

comment on function private.control_run_belongs_to_org(uuid, uuid) is
  'Private RLS helper for validating child rows against their organization parent.';

comment on function private.control_type_matches_run(uuid, uuid, uuid) is
  'Private RLS helper for validating that a control type matches the parent control run.';

comment on function private.control_run_item_belongs_to_org(uuid, uuid) is
  'Private RLS helper for validating child rows against their organization parent.';

comment on function private.control_run_item_matches_run(uuid, uuid, uuid) is
  'Private RLS helper for validating that a run item belongs to the parent control run.';

comment on function private.control_object_belongs_to_org(uuid, uuid) is
  'Private RLS helper for validating child rows against their organization parent.';

comment on function private.control_object_matches_run(uuid, uuid, uuid) is
  'Private RLS helper for validating that an object matches the parent control run type.';

comment on function private.control_field_belongs_to_org(uuid, uuid) is
  'Private RLS helper for validating child rows against their organization parent.';

comment on function private.control_field_matches_run(uuid, uuid, uuid) is
  'Private RLS helper for validating that a field matches the parent control run type.';

comment on function private.deviation_belongs_to_org(uuid, uuid) is
  'Private RLS helper for validating child rows against their organization parent.';

comment on function private.deviation_parent_matches_org(uuid, uuid, uuid, uuid) is
  'Private RLS helper for validating that an attachment deviation belongs to the same parent run and organization.';

comment on function private.storage_path_belongs_to_org(text, uuid) is
  'Private RLS helper for validating that attachment storage paths start with the owning organization id.';
