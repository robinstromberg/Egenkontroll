# Access view

Issue #12 adds the first external read-only access flow.

An admin can create a temporary access record with a date period and an expiry date. The app stores the record and shows a link plus QR code.

A separate read-only UI shell exists for external review.

The backend read function was applied directly in Supabase. It checks the active record, expiry date and selected period before returning matching control run summaries.

More detailed rows, attachments and export are handled in later issues.
