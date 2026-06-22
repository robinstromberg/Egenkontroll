alter table public.organizations
  add column if not exists industry text not null default 'food',
  add column if not exists business_type text;

alter table public.organizations
  drop constraint if exists organizations_industry_check,
  add constraint organizations_industry_check
    check (industry in ('food'));

alter table public.organizations
  drop constraint if exists organizations_business_type_check,
  add constraint organizations_business_type_check
    check (
      business_type is null
      or business_type in (
        'restaurant',
        'cafe',
        'bakery',
        'kiosk',
        'foodtruck',
        'catering',
        'chilled_store'
      )
    );
