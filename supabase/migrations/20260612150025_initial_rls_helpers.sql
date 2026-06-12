create or replace function public.is_org_member(target_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = target_organization_id
      and membership.user_id = auth.uid()
      and membership.status = 'active'
  );
$$;

create or replace function public.is_org_admin(target_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = target_organization_id
      and membership.user_id = auth.uid()
      and membership.status = 'active'
      and membership.role in ('owner', 'admin')
  );
$$;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.control_templates enable row level security;
alter table public.control_types enable row level security;
alter table public.control_objects enable row level security;
alter table public.control_field_definitions enable row level security;
alter table public.control_runs enable row level security;
alter table public.control_run_items enable row level security;
alter table public.deviations enable row level security;
alter table public.attachments enable row level security;
alter table public.share_links enable row level security;
alter table public.export_logs enable row level security;
