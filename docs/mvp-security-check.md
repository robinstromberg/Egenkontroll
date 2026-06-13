# MVP security check

Date: 2026-06-13

## Verified

- All `public` tables currently have RLS enabled.
- Authenticated users access organization-scoped data through RLS policies using organization membership/admin checks.
- Inspector access is read-only through `public.get_shared_control_runs(raw_token text)`.
- Inspector access is restricted by hashed token, active share status, validity period and included control type scope.
- The inspector RPC returns run details, items, deviations and attachment metadata, but exposes no write path.
- `npm run build` passes after the latest UI and inspector changes.

## Supabase advisor findings

Security advisor warnings:

- `public.get_shared_control_runs(raw_token text)` is an intentional public `SECURITY DEFINER` RPC for temporary inspector links. It remains executable by `anon` and `authenticated` because inspector links must work without app login. The function is constrained by token hash, active status, validity window and share scope.
- `public.is_org_member`, `public.is_org_admin` and `public.organization_has_members` are `SECURITY DEFINER` helper functions used by RLS policies. Advisor flags them because they are executable by authenticated users. They should be revisited before production hardening, preferably by moving helper functions to a private schema or tightening function grants after confirming RLS policy behavior.
- Leaked password protection is disabled in Supabase Auth. Enable it before production.

Performance advisor warnings:

- Several indexes are reported as unused. This is expected in the current low-traffic test database and should not be removed until realistic usage exists.
- Some tables have overlapping permissive policies for the same role/action. This is acceptable for MVP testing but can be consolidated later for query planning/performance.

## Remaining manual checks

- Test two separate organizations with two separate users and confirm cross-organization reads return no rows.
- Test staff vs admin controls for creating/editing control types and share links.
- Test expired inspector links after `valid_until`.
- Test attachment upload and attachment metadata in history/inspector views.
