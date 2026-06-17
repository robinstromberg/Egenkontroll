# Checklist

## Verified technically

- Vercel build passes.
- Public Vercel app responds.
- Supabase starter templates exist.
- RLS auth UID calls have been optimized where applicable.
- Inspector RPC intent and grants are documented.

## Manual browser test still required

Detailed steps are documented in `docs/mvp-manual-test-plan.md`.

- Login works with new magic link.
- Magic link returns to Vercel and not localhost.
- Organization setup works.
- Templates copy correctly.
- Admin can add controls.
- Today view loads.
- Control form saves.
- Deviations can be resolved.
- Photo attachment upload works.
- History loads.
- CSV action works.
- Print action works.
- Inspector link opens without normal user login and only shows scoped read-only data.
