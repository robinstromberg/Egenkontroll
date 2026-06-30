# MVP security check

Date: 2026-06-19

Latest advisor run: 2026-06-30

## Verified

- All `public` tables currently have RLS enabled.
- A live read-only check on 2026-06-19 confirmed RLS is enabled for all 14 `public` tables in the Supabase project.
- A live policy overview on 2026-06-19 confirmed the expected organization-scoped authenticated policies, with the known two `organization_memberships` `INSERT` policies for first-owner onboarding and admin-created memberships.
- A live read-only check on 2026-06-18 confirmed RLS is enabled for all 14 `public` tables in the Supabase project.
- A live policy overview on 2026-06-18 showed one policy per table/action except the expected two `organization_memberships` `INSERT` policies for first-owner onboarding and admin-created memberships.
- Authenticated users access organization-scoped data through RLS policies using organization membership/admin checks.
- A rollback-based non-member check returned zero visible rows for organizations, control types, share links, deviations and attachments.
- Organization membership/admin RLS helper functions now live in the private schema and are no longer directly executable as public RPCs.
- The first organization onboarding path was smoke-tested with a rollback transaction: a signed-in creator can create an organization and their first owner membership.
- Storage policies for `control-attachments` are scoped to authenticated organization members using the organization id in the storage path.
- Storage policies for `organization-branding` are scoped to authenticated organization admins using the organization id in the storage path.
- A live read-only check on 2026-06-18 confirmed the `control-attachments` bucket exists, is private, has a 10 MB file size limit and allows JPEG, PNG, WebP and PDF files.
- A live read-only check on 2026-06-18 confirmed storage `SELECT` and `INSERT` policies for `control-attachments` are limited to `authenticated` users where the first storage path segment matches an organization membership.
- A live advisor/log check on 2026-06-18 confirmed Vercel production has no warning/error/fatal runtime logs for the last 24 hours.
- Inspector documentation access is read-only through `public.get_shared_control_runs(raw_token text, p_period_start date, p_period_end date, p_control_type_ids uuid[])`.
- Inspector control-type filters are read-only through `public.get_shared_control_type_options(raw_token text)`.
- Inspector export logging uses `public.log_shared_export(raw_token text, p_export_type text, p_filters jsonb)` and only creates audit rows for valid active share tokens.
- Inspector access is restricted by hashed token, active share status, validity period and included control type scope.
- The inspector RPC returns run details, organization name, items, deviations and limited attachment metadata, but exposes no write path.
- Inspector attachment metadata intentionally omits internal storage bucket/path values. The server-side email PDF can add seven-day signed attachment links when a server-only Supabase service role key is configured; link creation is scoped to run IDs already returned by the valid share token RPC.
- `npm run lint`, `npm run typecheck`, `node --check api/send-inspector-report.js` and `npm run build` pass after the latest inspector/reporting and lint cleanup changes.
- `npm run lint`, `npm run typecheck` and `npm run build` passed on 2026-06-18 after the latest UI/inspector work.

## Supabase advisor findings

Security advisor warnings from the latest run:

- Advisor was re-run on 2026-06-30 after the project was upgraded to Supabase Pro.
- Advisor was re-run again on 2026-06-30 after custom SMTP was enabled. The remaining security findings were intentional `SECURITY DEFINER` RPC warnings plus leaked password protection disabled.
- Advisor was re-run after leaked password protection was enabled on 2026-06-30. The leaked password warning is gone; the only remaining security findings are intentional `SECURITY DEFINER` RPC warnings for inspector links and invitation acceptance.
- `public.get_shared_control_runs(raw_token text, p_period_start date, p_period_end date, p_control_type_ids uuid[])` is an intentional public `SECURITY DEFINER` RPC for temporary inspector links. It remains executable by `anon` and `authenticated` because inspector links must work without app login. The function is constrained by token hash, active status, validity window, requested period and share scope.
- `public.get_shared_control_type_options(raw_token text)` is an intentional public `SECURITY DEFINER` RPC for temporary inspector links. It returns only the control type options available to a valid active share token.
- `public.log_shared_export(raw_token text, p_export_type text, p_filters jsonb)` is an intentional public `SECURITY DEFINER` RPC for export auditing. It accepts only valid active share tokens, only allows known export types and only inserts audit rows.
- `public.accept_organization_invitation(invitation_id uuid)` is a privileged invitation accept RPC. It is executable by `authenticated` users only and validates invitation status, expiry, email ownership and organization membership before writing.
- `public.is_org_member`, `public.is_org_admin` and `public.organization_has_members` are no longer executable by `anon`, `authenticated` or `public`. RLS policies now call private schema helpers instead.
- Leaked password protection is enabled in Supabase Auth.
- Custom SMTP for Auth mail was enabled and verified on 2026-06-30 with sender `Min Egenkontroll <no-reply@minegenkontroll.se>`.

Performance advisor warnings from the latest run:

- Missing foreign-key indexes for `organization_invitations.invited_by` and `organization_invitations.accepted_by` were fixed by migration `20260630152000_add_invitation_user_indexes.sql`.
- Several indexes are reported as unused. This is expected in the current low-traffic test database and should not be removed until realistic usage exists.
- Most overlapping permissive policy warnings were consolidated by splitting broad admin `ALL` policies into action-specific policies. One expected overlap remains on `organization_memberships` inserts because first-owner onboarding and existing-admin invitations are intentionally separate paths.

Operational Supabase setup notes for SMTP, domain mail DNS, Security Advisor follow-up and backup/restore testing are tracked in `docs/SUPABASE_OPERATIONS_RUNBOOK.md`.

## Automated smoke checks

- Rollback-based SQL smoke tests exist in `supabase/tests/` for RLS isolation, admin/staff permission boundaries, inspector links and deviation lifecycle.
- Because the app is still pre-customer and only contains owner-created test data, the rollback smoke checks were also run against the live Supabase project on 2026-06-19.
- Passed on 2026-06-19: RLS isolation smoke, admin/staff permission smoke, inspector link smoke and deviation lifecycle smoke.
- A post-run cleanup check on the fixed smoke UUIDs and test email addresses returned zero leftover rows in `auth.users`, `organizations`, `control_types`, `control_runs`, `control_run_items`, `deviations` and `share_links`.
- Supabase Branching was attempted first, but branch creation is unavailable on the current plan because it requires Supabase Pro or above.

## Remaining manual checks

- Test two separate real user accounts in the UI and confirm cross-organization reads return no rows.
- Test staff vs admin controls for creating/editing control types and share links.
- Test expired inspector links after `valid_until`.
- Test attachment upload, attachment metadata in history/inspector views and signed attachment links in emailed inspector reports when `SUPABASE_SERVICE_ROLE_KEY` is configured in Vercel.
- Test organization logo upload from Meny > Verksamheten and confirm server-generated inspector PDF falls back cleanly when no private JPEG logo exists.
