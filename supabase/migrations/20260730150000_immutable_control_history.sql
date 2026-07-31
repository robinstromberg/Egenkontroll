-- Saved controls are historical records. Clients may create them through the
-- existing validated flow, but may not rewrite their identity afterwards.

do $$
begin
  if exists (
    select 1
    from public.control_runs run
    left join public.control_types control_type
      on control_type.id = run.control_type_id
    where control_type.id is null
      or control_type.organization_id <> run.organization_id
  ) then
    raise exception 'History integrity preflight failed: control run type/organization mismatch';
  end if;

  if exists (
    select 1
    from public.control_run_items item
    left join public.control_runs run
      on run.id = item.control_run_id
    where run.id is null
      or run.organization_id <> item.organization_id
  ) then
    raise exception 'History integrity preflight failed: control run item parent/organization mismatch';
  end if;

  if exists (
    select 1
    from public.deviations deviation
    left join public.control_runs run
      on run.id = deviation.control_run_id
    where run.id is null
      or run.organization_id <> deviation.organization_id
  ) then
    raise exception 'History integrity preflight failed: deviation parent/organization mismatch';
  end if;

  if exists (
    select 1
    from public.deviations deviation
    join public.control_run_items item
      on item.id = deviation.control_run_item_id
    where deviation.control_run_item_id is not null
      and (
        item.control_run_id <> deviation.control_run_id
        or item.organization_id <> deviation.organization_id
      )
  ) then
    raise exception 'History integrity preflight failed: deviation run item mismatch';
  end if;
end;
$$;

alter table public.control_types
  add constraint control_types_id_organization_unique
  unique (id, organization_id);

alter table public.control_runs
  add constraint control_runs_id_organization_unique
  unique (id, organization_id);

alter table public.control_run_items
  add constraint control_run_items_id_run_organization_unique
  unique (id, control_run_id, organization_id);

create index control_runs_control_type_organization_idx
  on public.control_runs(control_type_id, organization_id);

create index control_run_items_run_organization_idx
  on public.control_run_items(control_run_id, organization_id);

create index deviations_run_organization_idx
  on public.deviations(control_run_id, organization_id);

create index deviations_item_run_organization_idx
  on public.deviations(control_run_item_id, control_run_id, organization_id);

alter table public.control_runs
  add constraint control_runs_control_type_organization_fkey
  foreign key (control_type_id, organization_id)
  references public.control_types(id, organization_id)
  on delete restrict
  not valid;

alter table public.control_run_items
  add constraint control_run_items_run_organization_fkey
  foreign key (control_run_id, organization_id)
  references public.control_runs(id, organization_id)
  on delete cascade
  not valid;

alter table public.deviations
  add constraint deviations_run_organization_fkey
  foreign key (control_run_id, organization_id)
  references public.control_runs(id, organization_id)
  on delete cascade
  not valid;

alter table public.deviations
  add constraint deviations_item_run_organization_fkey
  foreign key (control_run_item_id, control_run_id, organization_id)
  references public.control_run_items(id, control_run_id, organization_id)
  on delete cascade
  not valid;

alter table public.control_runs
  validate constraint control_runs_control_type_organization_fkey;

alter table public.control_run_items
  validate constraint control_run_items_run_organization_fkey;

alter table public.deviations
  validate constraint deviations_run_organization_fkey;

alter table public.deviations
  validate constraint deviations_item_run_organization_fkey;

create or replace function private.prevent_control_run_identity_changes()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if new.id is distinct from old.id
    or new.organization_id is distinct from old.organization_id
    or new.control_type_id is distinct from old.control_type_id
    or new.performed_by is distinct from old.performed_by
    or new.performed_at is distinct from old.performed_at
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Saved control run identity is immutable'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create or replace function private.prevent_control_run_item_identity_changes()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if new.id is distinct from old.id
    or new.organization_id is distinct from old.organization_id
    or new.control_run_id is distinct from old.control_run_id
    or new.control_object_id is distinct from old.control_object_id
    or new.field_definition_id is distinct from old.field_definition_id
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Saved control run item identity is immutable'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create or replace function private.prevent_deviation_identity_changes()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if new.id is distinct from old.id
    or new.organization_id is distinct from old.organization_id
    or new.control_run_id is distinct from old.control_run_id
    or new.control_run_item_id is distinct from old.control_run_item_id
    or new.control_type_id is distinct from old.control_type_id
    or new.control_object_id is distinct from old.control_object_id
    or new.opened_by is distinct from old.opened_by
    or new.opened_at is distinct from old.opened_at
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Saved deviation identity is immutable'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke execute on function private.prevent_control_run_identity_changes()
from public, anon, authenticated;
revoke execute on function private.prevent_control_run_item_identity_changes()
from public, anon, authenticated;
revoke execute on function private.prevent_deviation_identity_changes()
from public, anon, authenticated;

create trigger prevent_control_run_identity_changes
before update on public.control_runs
for each row execute function private.prevent_control_run_identity_changes();

create trigger prevent_control_run_item_identity_changes
before update on public.control_run_items
for each row execute function private.prevent_control_run_item_identity_changes();

create trigger prevent_deviation_identity_changes
before update on public.deviations
for each row execute function private.prevent_deviation_identity_changes();

drop policy if exists "members can update control runs"
on public.control_runs;
drop policy if exists "members can update deviations"
on public.deviations;

revoke update
on table public.control_runs, public.control_run_items, public.deviations
from public, anon, authenticated;

create or replace function public.resolve_deviation(
  p_organization_id uuid,
  p_deviation_id uuid,
  p_follow_up_comment text default null
)
returns public.deviations
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current_user_id uuid := (select auth.uid());
  current_deviation public.deviations%rowtype;
  resolved_deviation public.deviations%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = p_organization_id
      and membership.user_id = current_user_id
      and membership.status = 'active'
  ) then
    raise exception 'Organization access denied' using errcode = '42501';
  end if;

  select deviation.*
  into current_deviation
  from public.deviations deviation
  where deviation.id = p_deviation_id
    and deviation.organization_id = p_organization_id
  for update;

  if not found then
    raise exception 'Deviation not found' using errcode = 'P0002';
  end if;

  if current_deviation.status <> 'open' then
    raise exception 'Deviation is not open' using errcode = '22023';
  end if;

  update public.deviations deviation
  set status = 'resolved',
      follow_up_comment = nullif(btrim(p_follow_up_comment), ''),
      resolved_by = current_user_id,
      resolved_at = statement_timestamp()
  where deviation.id = current_deviation.id
  returning deviation.* into resolved_deviation;

  return resolved_deviation;
end;
$$;

revoke execute on function public.resolve_deviation(uuid, uuid, text)
from public, anon;
grant execute on function public.resolve_deviation(uuid, uuid, text)
to authenticated;

comment on function public.resolve_deviation(uuid, uuid, text) is
  'Allows an active organization member to transition one open deviation to resolved. The actor and timestamp are derived by the database; saved history identity fields remain immutable.';
