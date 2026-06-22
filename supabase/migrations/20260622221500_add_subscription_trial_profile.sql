alter table public.organizations
  add column if not exists billing_plan text,
  add column if not exists trial_started_at timestamptz,
  add column if not exists trial_ends_at timestamptz;

alter table public.organizations
  drop constraint if exists organizations_billing_plan_check,
  add constraint organizations_billing_plan_check
    check (billing_plan is null or billing_plan in ('monthly', 'annual'));

update public.organizations
set
  billing_plan = coalesce(billing_plan, 'monthly'),
  trial_started_at = coalesce(trial_started_at, created_at),
  trial_ends_at = coalesce(trial_ends_at, created_at + interval '30 days')
where subscription_status = 'trial';
