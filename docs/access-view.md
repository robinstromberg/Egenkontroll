# Access view

Issue #12 added the first external read-only access flow. Issue #79 expanded it into the current inspector portal and export flow.

An admin can create a temporary access record with an expiry date. The app stores the record and shows a link plus QR code.

The inspector opens a separate read-only UI and chooses the review period and control types in that view.

The backend read functions check the hashed token, active status, expiry date, share scope, selected period and selected control types before returning matching documentation.

The read-only view now includes detailed rows, deviations, attachment metadata, CSV export, print/PDF support and optional emailed PDF reports through the Vercel API route.
