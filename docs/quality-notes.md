# Quality notes

The project now has the main MVP modules in place.

Current status:

- Auth foundation exists.
- Organization membership exists.
- Template onboarding exists.
- Admin controls exist.
- Today view exists.
- Control form exists.
- Deviation follow-up exists.
- Photo attachment support exists.
- History view exists.
- Reporting actions exist.
- Language source exists.

Latest technical verification:

- Vercel deployment for the current build passed after replacing `String.replaceAll` in `reportService` with a target-compatible regex replacement.
- The public Vercel app responds with HTTP 200.
- Supabase has 6 active starter templates available for onboarding.
- Supabase currently has no user-created organizations, profiles, memberships, control runs, deviations or share links. Browser testing must therefore start with a fresh login and first organization setup.
- RLS helper functions and direct `auth.uid()` policies were optimized to use `(select auth.uid())` where applicable.
- The public inspector RPC is intentionally executable by anonymous users because temporary inspector links require unauthenticated read-only access. The RPC is constrained by hashed token, active status, validity window, reporting period and included control type scope.
- Direct PUBLIC execute permission was revoked from the inspector RPC; only `anon` and `authenticated` keep execute access for the intended link flow.
- `docs/checklist.md` now separates technically verified items from manual browser tests that still require a logged-in user.

Known manual checks still required:

- Confirm Supabase Auth URL Configuration points to the public Vercel domain.
- Confirm Vercel has `VITE_APP_URL` set for production and preview.
- Request a new magic link and verify that it returns to the Vercel app rather than localhost.
- Complete the browser MVP test flow: login, create organization, choose templates, run controls, create/resolve deviation, upload attachment, view history, export CSV/print report and open inspector link.
- Supabase performance advisor still reports expected early-stage warnings for unused indexes and some multiple permissive policies. These are not blockers for MVP testing but should be revisited after real usage data exists.
