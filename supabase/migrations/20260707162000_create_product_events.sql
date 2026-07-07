create table if not exists public.product_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_name text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid null references public.organizations(id) on delete cascade,
  route text null,
  session_id text null,
  metadata jsonb not null default '{}'::jsonb,
  constraint product_events_event_name_format check (event_name ~ '^[a-z][a-z0-9_]{0,79}$'),
  constraint product_events_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index if not exists product_events_created_at_idx
on public.product_events (created_at desc);

create index if not exists product_events_event_name_created_at_idx
on public.product_events (event_name, created_at desc);

create index if not exists product_events_organization_created_at_idx
on public.product_events (organization_id, created_at desc);

alter table public.product_events enable row level security;

revoke all on public.product_events from anon;
revoke all on public.product_events from authenticated;
grant insert on public.product_events to authenticated;

drop policy if exists "authenticated users can create own product events" on public.product_events;
create policy "authenticated users can create own product events"
on public.product_events
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (
    organization_id is null
    or private.is_org_member(organization_id)
  )
  and jsonb_typeof(metadata) = 'object'
);

comment on table public.product_events is
  'Privacy-friendly beta product events. App users may insert their own events but cannot read them through RLS.';

comment on column public.product_events.metadata is
  'Allowlisted, non-sensitive metadata only. Never store form answers, emails, tokens, links, file names, or storage paths.';
