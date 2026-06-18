# MVP Manual Test Plan

This checklist covers the remaining manual verification for issue #15.

Use two separate real test accounts and, when possible, two separate organizations:

- Account A: organization owner/admin
- Account B: separate organization owner/admin
- Optional Account C: staff member in Account A's organization

Do not use production customer data for these tests.

## 1. Cross-Organization Data Isolation

Goal: confirm that organization-scoped data cannot leak between businesses.

For a disposable local or staging database, `supabase/tests/rls_isolation_smoke.sql` can be run as an additional rollback-based SQL smoke test after migrations are applied.

Steps:

1. Sign in as Account A and create organization A.
2. Create at least one control type, object, run, deviation, attachment and share link.
3. Sign out.
4. Sign in as Account B and create organization B.
5. Open Today, History, Add, Sharing and Menu/Admin views.
6. Confirm no organization A records are visible to Account B.
7. Try direct URLs or browser back/refresh on previously visited organization A views while signed in as Account B.

Pass criteria:

- Account B sees only organization B data.
- Organization A records do not appear in lists, history, reports, sharing, attachments or admin controls.
- Any stale URL state returns empty, blocked or organization B scoped data.

## 2. Admin vs Staff Permissions

Goal: confirm that staff can work with controls but cannot administer structure or sharing.

For a disposable local or staging database, `supabase/tests/admin_staff_permissions_smoke.sql` can be run as an additional rollback-based SQL smoke test for staff/admin permission boundaries.

Steps:

1. Sign in as Account A owner/admin.
2. Add Account C as staff if the UI supports it for the current test environment.
3. Sign in as Account C.
4. Complete a daily control and save it.
5. Try to create, update or delete control types and control objects.
6. Try to create or manage inspector share links.

Pass criteria:

- Staff can complete normal control work for their organization.
- Staff cannot administer control structure unless explicitly promoted.
- Staff cannot create or manage inspector links unless explicitly allowed.

## 3. Inspector Link Read-Only Access

Goal: confirm inspector links work without normal login and cannot mutate data.

For a disposable local or staging database, `supabase/tests/inspector_link_smoke.sql` can be run as an additional rollback-based SQL smoke test for active links, expired links and period filtering.

Steps:

1. Sign in as Account A owner/admin.
2. Create a share link with a short validity period.
3. Open the link in a private/incognito browser with no app session.
4. Filter by period and control type.
5. Export/print/download available report formats.
6. Confirm there are no visible create, update, resolve, delete or admin actions.

Pass criteria:

- The link opens without normal login.
- Only data scoped by the link is visible.
- The inspector view is read-only.
- Export actions do not change control data.

## 4. Expired Inspector Links

Goal: confirm expired links stop working.

Steps:

1. Create a share link with the shortest available validity period, or manually adjust `valid_until` in a disposable test database.
2. Open the link before expiry and confirm it works.
3. Open the same link after expiry.

Pass criteria:

- The link works before `valid_until`.
- The link is rejected or shows no shared data after `valid_until`.

## 5. Attachments

Goal: confirm photo uploads and attachment metadata stay organization-scoped.

Steps:

1. Sign in as Account A.
2. Run a control with a photo field or attachment-supported field.
3. Upload an image from mobile camera or file picker.
4. Save the control.
5. Open History and the inspector link/report view.
6. Sign in as Account B and confirm Account A attachments are not visible.

Pass criteria:

- Upload succeeds.
- Attachment metadata is visible in history/reporting where expected.
- Other organizations cannot see or access Account A attachment metadata.

## 6. Deviation Lifecycle

Goal: confirm deviations can be created, followed up and resolved without disappearing from history.

Steps:

1. Sign in as Account A.
2. Run a control that triggers a deviation, for example a temperature over the max value.
3. Add required action text.
4. Save the control.
5. Confirm the deviation appears as open on Today and in History.
6. Resolve the deviation with a follow-up comment.
7. Open History and inspector/report views.

Pass criteria:

- Deviation starts as open.
- Required action text is saved.
- Resolution stores `resolved_at`, `resolved_by` and follow-up comment.
- Resolved deviation remains visible in history/reporting as resolved.

## 7. Supabase Advisors

Goal: confirm no critical unresolved Supabase security/performance issues remain before production.

Steps:

1. Run Supabase Security Advisor after the latest migrations are applied.
2. Run Supabase Performance Advisor after representative test data exists.
3. Document warnings in `docs/mvp-security-check.md`.

Pass criteria:

- No critical security warnings are left unexplained.
- Intentional warnings, such as public read-only inspector RPC access, are documented with rationale.
- Performance warnings are either fixed or explicitly deferred with a reason.
