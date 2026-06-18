# MVP security check

Date: 2026-06-17

Latest advisor run: 2026-06-18

## Verified

- All `public` tables currently have RLS enabled.
- A live read-only check on 2026-06-18 confirmed RLS is enabled for all 14 `public` tables in the Supabase project.
- A live policy overview on 2026-06-18 showed one policy per table/action except the expected two `organization_memberships` `INSERT` policies for first-owner onboarding and admin-created memberships.
- Authenticated users access organization-scoped data through RLS policies using organization membership/admin checks.
- A rollback-based non-member check returned zero visible rows for organizations, control types, share links, deviations and attachments.
- Organization membership/admin RLS helper functions now live in the private schema and are no longer directly executable as public RPCs.
- The first organization onboarding path was smoke-tested with a rollback transaction: a signed-in creator can create an organization and their first owner membership.
- Storage policies for `control-attachments` are scoped to authenticated organization members using the organization id in the storage path.
- A live read-only check on 2026-06-18 confirmed the `control-attachments` bucket exists, is private, has a 10 MB file size limit and allows JPEG, PNG, WebP and PDF files.
- A live read-only check on 2026-06-18 confirmed storage `SELECT` and `INSERT` policies for `control-attachments` are limited to `authenticated` users where the first storage path segment matches an organization membership.
- Inspector documentation access is read-only through `public.get_shared_control_runs(raw_token text, p_period_start date, p_period_end date, p_control_type_ids uuid[])`.
- Inspector control-type filters are read-only through `public.get_shared_control_type_options(raw_token text)`.
- Inspector export logging uses `public.log_shared_export(raw_token text, p_export_type text, p_filters jsonb)` and only creates audit rows for valid active share tokens.
- Inspector access is restricted by hashed token, active share status, validity period and included control type scope.
- The inspector RPC returns run details, organization name, items, deviations and limited attachment metadata, but exposes no write path.
- Inspector attachment metadata intentionally omits internal storage bucket/path values. Full file delivery should use a separate scoped signing flow.
- `npm run lint`, `npm run typecheck`, `node --check api/send-inspector-report.js` and `npm run build` pass after the latest inspector/reporting and lint cleanup changes.

## Supabase advisor findings

Security advisor warnings from the latest run:

- `public.get_shared_control_runs(raw_token text, p_period_start date, p_period_end date, p_control_type_ids uuid[])` is an intentional public `SECURITY DEFINER` RPC for temporary inspector links. It remains executable by `anon` and `authenticated` because inspector links must work without app login. The function is constrained by token hash, active status, validity window, requested period and share scope.
- `public.get_shared_control_type_options(raw_token text)` is an intentional public `SECURITY DEFINER` RPC for temporary inspector links. It returns only the control type options available to a valid active share token.
- `public.log_shared_export(raw_token text, p_export_type text, p_filters jsonb)` is an intentional public `SECURITY DEFINER` RPC for export auditing. It accepts only valid active share tokens, only allows known export types and only inserts audit rows.
- `public.is_org_member`, `public.is_org_admin` and `public.organization_has_members` are no longer executable by `anon`, `authenticated` or `public`. RLS policies now call private schema helpers instead.
- Leaked password protection is disabled in Supabase Auth. Enable it before production.

Performance advisor warnings from the latest run:

- Several indexes are reported as unused. This is expected in the current low-traffic test database and should not be removed until realistic usage exists.
- Most overlapping permissive policy warnings were consolidated by splitting broad admin `ALL` policies into action-specific policies. One expected overlap remains on `organization_memberships` inserts because first-owner onboarding and existing-admin invitations are intentionally separate paths.

## Remaining manual checks

- Test two separate real user accounts in the UI and confirm cross-organization reads return no rows.
- Test staff vs admin controls for creating/editing control types and share links.
- Test expired inspector links after `valid_until`.
- Test attachment upload and attachment metadata in history/inspector views.
