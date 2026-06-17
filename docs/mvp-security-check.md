# MVP security check

Date: 2026-06-17

## Verified

- All `public` tables currently have RLS enabled.
- Authenticated users access organization-scoped data through RLS policies using organization membership/admin checks.
- A rollback-based non-member check returned zero visible rows for organizations, control types, share links, deviations and attachments.
- Organization membership/admin RLS helper functions now live in the private schema and are no longer directly executable as public RPCs.
- The first organization onboarding path was smoke-tested with a rollback transaction: a signed-in creator can create an organization and their first owner membership.
- Storage policies for `control-attachments` are scoped to authenticated organization members using the organization id in the storage path.
- Inspector access is read-only through `public.get_shared_control_runs(raw_token text)`.
- Inspector access is restricted by hashed token, active share status, validity period and included control type scope.
- The inspector RPC returns run details, items, deviations and attachment metadata, but exposes no write path.
- `npm run build` passes after the latest RLS migration changes.

## Supabase advisor findings

Security advisor warnings:

- `public.get_shared_control_runs(raw_token text)` is an intentional public `SECURITY DEFINER` RPC for temporary inspector links. It remains executable by `anon` and `authenticated` because inspector links must work without app login. The function is constrained by token hash, active status, validity window and share scope.
- `public.is_org_member`, `public.is_org_admin` and `public.organization_has_members` are no longer executable by `anon`, `authenticated` or `public`. RLS policies now call private schema helpers instead.
- Leaked password protection is disabled in Supabase Auth. Enable it before production.

Performance advisor warnings:

- Several indexes are reported as unused. This is expected in the current low-traffic test database and should not be removed until realistic usage exists.
- Most overlapping permissive policy warnings were consolidated by splitting broad admin `ALL` policies into action-specific policies. One expected overlap remains on `organization_memberships` inserts because first-owner onboarding and existing-admin invitations are intentionally separate paths.

## Remaining manual checks

- Test two separate real user accounts in the UI and confirm cross-organization reads return no rows.
- Test staff vs admin controls for creating/editing control types and share links.
- Test expired inspector links after `valid_until`.
- Test attachment upload and attachment metadata in history/inspector views.
