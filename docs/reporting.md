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
- includes report title, optional company name, selected period, generated timestamp, summary metrics, control rows, deviations, attachment names and page numbers
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

## Scope

This is still a pragmatic first version. Logo rendering and embedding attachment files in the PDF can be improved later.
