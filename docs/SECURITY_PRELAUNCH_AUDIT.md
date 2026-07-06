# Pre-launch security audit

Date: 2026-06-26

Scope: local code, committed Supabase migrations, API routes and existing security notes. No live Supabase project changes were made in this audit.

## Summary

The app is ready for a controlled public pilot after the pending migrations are applied and the production environment variables are verified. I did not find a local code or schema issue that should block a limited launch with test/pilot users.

Before opening the product for paying customers, run the live smoke tests against the deployed Supabase project and confirm the Vercel server-only keys are present.

## Checked

- Public frontend configuration uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. These are publishable values, not private secrets.
- Server-only Supabase service role access is limited to Vercel API routes:
  - `api/shared-attachment-url.js`
  - `api/send-inspector-report.js`
- `SUPABASE_SERVICE_ROLE_KEY` is read only from server runtime environment variables. It is not exposed with a `VITE_` prefix.
- Public inspector RPCs are intentional read-only `SECURITY DEFINER` functions for temporary inspector links.
- Current inspector report data does not expose internal attachment `storage_bucket` or `storage_path` values.
- Private attachment images are opened through short-lived signed URLs created by `api/shared-attachment-url.js`.
- The signed attachment URL endpoint validates share token hash, active status, validity window, organization, reporting period and included control type scope before creating a signed URL.
- RLS helper execution has been hardened in earlier migrations, and policy helpers are routed through the private schema.
- Child-row RLS has a dedicated hardening migration for organization and parent integrity on control runs, control run items, deviations and attachment metadata.
- User-generated values included in browser print/export HTML are passed through escaping helpers in the checked report rendering paths.
- No `dangerouslySetInnerHTML` usage was found in the frontend.

## Verification

Run on 2026-06-26:

- `npm run typecheck`
- `npm run lint`
- `npm run build`

The Supabase CLI is not installed in this workspace, so migrations and SQL smoke tests were not executed locally during this audit.

## Manual production configuration

Verify these in Vercel before a public pilot:

- `VITE_APP_URL=https://egenkontroll-indol.vercel.app`
- `VITE_SUPABASE_URL` or `SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` or `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` as a server-only variable, without a `VITE_` prefix
- `RESEND_API_KEY` and `RESEND_FROM_EMAIL` if emailed inspector reports should work

Verify these in Supabase before a public pilot:

- All pending migrations have been applied.
- All public tables have RLS enabled.
- Leaked password protection is enabled in Supabase Auth before broader production use.
- Storage buckets used for attachments and organization branding remain private.

## Must fix before public pilot

No blocker was found in the local audit.

## Should fix before paying customers

- Run the rollback SQL smoke tests in `supabase/tests/` against a controlled deployed test dataset.
- Include `supabase/tests/rls_parent_integrity_smoke.sql` when validating RLS before broader public use.
- Manually test two real accounts in different organizations and confirm cross-organization data remains invisible.
- Manually test staff versus admin permissions for control type editing, share links and organization settings.
- Confirm expired inspector links cannot read data or open attachment images.
- Confirm Vercel has `SUPABASE_SERVICE_ROLE_KEY` configured so inspector attachment images work without exposing storage paths.
- Add or publish the operational privacy, data deletion and support process documents.

## Can wait

- Add automated security regression tests to CI once a stable staging database exists.
- Add deeper export/audit analytics for inspector report downloads and emailed reports.
- Revisit Supabase performance advisor warnings after realistic usage creates meaningful index statistics.
