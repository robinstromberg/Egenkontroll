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

The endpoint uses the same Supabase public configuration as the app when reading token-scoped inspector data.
Configure these in Vercel when possible:

- `VITE_SUPABASE_URL` or `SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` or `SUPABASE_ANON_KEY`

If those variables are not present, the endpoint falls back to the checked-in public project URL and publishable key used by the frontend. It does not fall back to any private server key.

Optional Vercel environment variable:

- `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY`

When this server-only key is present, `POST /api/send-inspector-report` looks up attachment storage paths only for run IDs already returned by the token-scoped read-only RPC. It then creates signed Supabase Storage links that are valid for seven days and writes those links into the generated PDF. The public inspector RPC still returns only attachment metadata and does not expose `storage_bucket` or `storage_path`.

## Vercel environment matrix

Set these in both `production` and `preview` when the matching feature should work there:

| Variable | Production | Preview | Notes |
| --- | --- | --- | --- |
| `VITE_APP_URL` | Required | Required | Public app URL used when creating links. |
| `VITE_SUPABASE_URL` or `SUPABASE_URL` | Recommended | Recommended | API routes fall back to the checked-in project URL when absent. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` or `SUPABASE_ANON_KEY` | Recommended | Recommended | API routes fall back to the checked-in publishable key when absent. |
| `SUPABASE_SERVICE_ROLE_KEY` | Required for private attachment images | Required for private attachment images in preview | Server-only. Do not use a `VITE_` prefix. Required by `/api/shared-attachment-url` and optional signed links in emailed reports. |
| `RESEND_API_KEY` | Required for email PDF | Optional | Needed only when sending reports by email. |
| `RESEND_FROM_EMAIL` | Recommended | Optional | Use a verified Resend sender for production. |

If `SUPABASE_SERVICE_ROLE_KEY` is missing, the inspector can still read the token-scoped report data, but private image attachments cannot be opened because the public share RPC intentionally does not expose Storage paths. The API route logs `shared-attachment-url missing Supabase server configuration` with safe diagnostics, while the public inspector UI shows a non-technical image-unavailable message.

## Scope

Admins can edit organization report branding in the app menu under Verksamheten. The current profile supports:

- organization name
- organization number
- private uploaded JPEG logo
- optional HTTPS logo URL for browser print fallback
- report/profile color

Uploaded logos are stored in the private Supabase Storage bucket `organization-branding`, scoped by organization id. Admins can upload, read, update and delete files for their own organization. The public inspector RPC does not expose logo storage bucket/path values.

Browser print reports can show the optional external logo URL as an image. The server-generated email PDF uses the private uploaded JPEG logo when available and the Vercel server has `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY`; otherwise it falls back to organization name, profile color and generated initials.
