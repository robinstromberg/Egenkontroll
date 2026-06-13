# RLS test fixes

During browser testing, two Supabase RLS blockers were found in the first organization setup flow.

## Helper function execute access

Authenticated users need execute access to the RLS helper functions used by table policies.

Affected helper functions:

- `is_org_member(uuid)`
- `is_org_admin(uuid)`
- `organization_has_members(uuid)`

Without this, Supabase can reject normal app requests with errors like permission denied for function `is_org_member`.

## First organization setup

The first organization flow has a bootstrapping problem: a user cannot already be a member of an organization that has not yet been created.

The intended flow is:

1. authenticated user creates an organization where `created_by` is the current user
2. the same user creates the first active owner membership for that organization
3. later access checks use the normal organization membership policies

The production Supabase database was updated during testing to allow this bootstrapping path.

## Follow-up

If a fresh Supabase project is created later, these RLS fixes must be included before testing onboarding.
