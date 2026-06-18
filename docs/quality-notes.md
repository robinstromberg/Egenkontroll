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

- `npm run lint`, `npm run typecheck`, `node --check api/send-inspector-report.js` and `npm run build` pass.
- Vercel production runtime logs showed no `warning`, `error` or `fatal` entries for the last 24 hours when checked on 2026-06-18.
- Vercel deployment for the current build passed after replacing `String.replaceAll` in `reportService` with a target-compatible regex replacement.
- The public Vercel app responds with HTTP 200.
- Supabase has 6 active starter templates available for onboarding.
- RLS helper functions and direct `auth.uid()` policies were optimized to use `(select auth.uid())` where applicable.
- The public inspector RPC is intentionally executable by anonymous users because temporary inspector links require unauthenticated read-only access. The RPC is constrained by hashed token, active status, validity window, reporting period and included control type scope.
- Direct PUBLIC execute permission was revoked from the inspector RPC; only `anon` and `authenticated` keep execute access for the intended link flow.
- During browser testing, Supabase denied organization setup until authenticated users were allowed to execute the RLS helper functions used by policies.
- During browser testing, first organization setup needed a policy path where the creator can create the organization and the first active owner membership before already being an organization member.
- New inspector links are now generated as hash-based app links so Vercel does not return 404 for direct access.
- Vercel project metadata confirms `egenkontroll-indol.vercel.app`, `egenkontroll-robinstrombergs-projects.vercel.app` and the main branch deployment domain are attached to the project.
- `docs/checklist.md` separates technically verified items from manual browser tests that still require a logged-in user.

Known manual checks still required:

- Confirm Supabase Auth URL Configuration points to the public Vercel domain.
- Confirm Vercel has `VITE_APP_URL=https://egenkontroll-indol.vercel.app` set for production if the fallback should not be relied on.
- Test organization setup again after the RLS fixes.
- Complete the browser MVP test flow: login, create organization, choose templates, run controls, create/resolve deviation, upload attachment, view history, export CSV/print report and open inspector link.
- Supabase performance advisor still reports expected early-stage warnings for unused indexes and some multiple permissive policies. These are not blockers for MVP testing but should be revisited after real usage data exists.
