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

The endpoint also needs the same Supabase public environment that the app uses:

- `VITE_SUPABASE_URL` or `SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` or `SUPABASE_ANON_KEY`

Optional Vercel environment variable:

- `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY`

When this server-only key is present, `POST /api/send-inspector-report` looks up attachment storage paths only for run IDs already returned by the token-scoped read-only RPC. It then creates signed Supabase Storage links that are valid for seven days and writes those links into the generated PDF. The public inspector RPC still returns only attachment metadata and does not expose `storage_bucket` or `storage_path`.

## Scope

Admins can edit organization report branding in the app menu under Verksamheten. The current profile supports:

- organization name
- organization number
- private uploaded JPEG logo
- optional HTTPS logo URL for browser print fallback
- report/profile color

Uploaded logos are stored in the private Supabase Storage bucket `organization-branding`, scoped by organization id. Admins can upload, read, update and delete files for their own organization. The public inspector RPC does not expose logo storage bucket/path values.

Browser print reports can show the optional external logo URL as an image. The server-generated email PDF uses the private uploaded JPEG logo when available and the Vercel server has `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY`; otherwise it falls back to organization name, profile color and generated initials.
