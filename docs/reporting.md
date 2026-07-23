# Reporting

Issue #13 adds first reporting support from the history view.

## CSV

The history view can create a CSV file from the current filters.

The file contains time, control type, status, item, value, deviation and action.

## Print view

The app can open a print-friendly report in a new browser window. The user can save it as PDF from the browser print dialog.

## Inspector report email

Inspector links can request a server-side PDF email through `POST /api/send-inspector-report`.

The endpoint:

- validates that token, email and period are present
- reads report rows through the token-scoped Supabase RPC `get_shared_control_runs`
- generates a PDF attachment without extra npm dependencies
- includes report title, shared organization name, report profile color, logo URL metadata, a generated brand mark, selected period, generated timestamp, summary metrics, control rows, deviations, attachment names and page numbers
- can add seven-day signed attachment links to the PDF when a server-only Supabase service role key is configured
- sends the email through Resend when email environment variables are configured
- logs successful email exports through `log_shared_export`

Required Vercel environment variable:

- `RESEND_API_KEY`

Recommended Vercel environment variable:

- `RESEND_FROM_EMAIL`, for example `Egenkontroll <kontroll@example.com>`

If `RESEND_FROM_EMAIL` is not set, the endpoint uses Resend's test sender `Egenkontroll <onboarding@resend.dev>`. For production use, verify a real sending domain in Resend and set `RESEND_FROM_EMAIL`.

The endpoint has explicit server-only Supabase configuration when reading token-scoped inspector data.
Both variables are required:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

The endpoint never reads `VITE_` variables and has no checked-in fallback. A missing or environment-mismatched configuration returns `503` before Supabase is contacted.

Optional Vercel environment variable:

- `SUPABASE_SECRET_KEY`

When this server-only key is present, `POST /api/send-inspector-report` looks up attachment storage paths only for run IDs already returned by the token-scoped read-only RPC. It then creates signed Supabase Storage links that are valid for seven days and writes those links into the generated PDF. The public inspector RPC still returns only attachment metadata and does not expose `storage_bucket` or `storage_path`.

## Vercel environment matrix

Preview uses the existing Supabase branch `staging`. All Preview entries must be generic Preview values without a Git branch restriction. Production values must have Production-only scope.

| Variable | Production | Preview | Notes |
| --- | --- | --- | --- |
| `VITE_APP_URL` | Required: `https://app.minegenkontroll.se` | Do not set; Vite derives the deployment origin from `VERCEL_URL` | Public app URL used when creating links. |
| `VITE_SUPABASE_URL` | Required: production project | Required: `staging` branch | Public browser configuration. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Required: production publishable key | Required: `staging` publishable key | Public browser configuration; never use a secret key. |
| `SUPABASE_URL` | Required: production project | Required: `staging` branch | Server-only configuration for all Supabase API routes. |
| `SUPABASE_ANON_KEY` | Required: production anon key | Required: `staging` anon key | Server-side public API key. API routes never fall back to `VITE_` values. |
| `SUPABASE_SECRET_KEY` | Required for private attachment images | Required: separate `staging` secret | Sensitive and server-only. Required by `/api/shared-attachment-url` and optional signed links in emailed reports. Never share one Vercel entry between Preview and Production. |
| `RESEND_API_KEY` | Required for email PDF | Optional | Needed only when sending reports by email. |
| `RESEND_FROM_EMAIL` | Recommended | Optional | Use a verified Resend sender for production. |

Vercel Preview rejects the production Supabase host, and Production rejects every other Supabase host. Missing configuration stops the Preview build or returns a bounded `503` from a serverless route. Branch-specific Preview overrides must be removed or kept aligned with `staging`, because they override generic Preview values.

If `SUPABASE_SECRET_KEY` is missing, the inspector can still read token-scoped report data and email a report without private images, but `/api/shared-attachment-url` returns a bounded configuration error. No key values are written to logs.

The static `/api/leads` admin page is intentionally disabled outside the canonical Production origin. Preview shows `Leads är avstängt i Preview.` and does not initialize a Supabase client.

## Scope

Admins can edit organization report branding in the app menu under Verksamheten. The current profile supports:

- organization name
- organization number
- private uploaded JPEG logo
- optional HTTPS logo URL for browser print fallback
- report/profile color

Uploaded logos are stored in the private Supabase Storage bucket `organization-branding`, scoped by organization id. Admins can upload, read, update and delete files for their own organization. The public inspector RPC does not expose logo storage bucket/path values.

Browser print reports can show the optional external logo URL as an image. The server-generated email PDF uses the private uploaded JPEG logo when available and the Vercel server has `SUPABASE_SECRET_KEY`; otherwise it falls back to organization name, profile color and generated initials.
