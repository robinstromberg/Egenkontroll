# Testdata reset plan

Status: prepared for issue #178 on 2026-06-30.

This document maps the current prelaunch test data and the proposed deletion order. It is intentionally not an executable migration. Deletion must only happen after Robin explicitly approves the listed user IDs and organization IDs.

## Current Auth Users

| Keep/delete proposal | Email | User ID | App data status |
| --- | --- | --- | --- |
| Keep | `robinpstromberg@pm.me` | `f29fb513-36ee-459b-bae7-a6eef5b7d724` | Developer account already exists in Auth. No profile, no organization membership, no app data. |
| Delete if approved | `robinpstromberg@proton.me` | `04ef3261-3839-4132-89c4-7ce2abd30713` | Owner of `Test Miljo`; has profile and app data. |
| Delete if approved | `stromberg.robin@gmail.com` | `c4b08290-5b9d-4199-9f60-2a0037b76b02` | Owner of `Cafe Solglantan`; has profile and app data. |
| Delete if approved | `robinpatromberg@proton.me` | `d2ed54e4-7175-47a8-97bd-4cb97dfe89f9` | Auth-only account. No profile, no organization membership, no app data. Looks like a typo test account. |

## Organizations Proposed For Deletion

### `Test Miljo`

- Organization ID: `a949c963-0b74-4942-acb5-bbf9e0796f2d`
- Owner: `robinpstromberg@proton.me` (`04ef3261-3839-4132-89c4-7ce2abd30713`)
- Created: `2026-06-13 09:38:24+00`

Data counts:

| Table/data type | Count |
| --- | ---: |
| `organization_memberships` | 1 |
| `control_types` | 15 |
| `control_objects` | 17 |
| `control_field_definitions` | 53 |
| `control_runs` | 15 |
| `control_run_items` | 87 |
| `deviations` | 5 |
| `attachments` | 1 |
| `share_links` | 24 |
| `export_logs` | 15 |
| `suppliers` | 1 |
| `organization_invitations` | 0 |

Storage object known from `attachments`:

- Bucket: `control-attachments`
- Path: `a949c963-0b74-4942-acb5-bbf9e0796f2d/9ff38b0a-aaaa-426d-af8a-c535303160db/57ca99d1-fb3c-4d90-bc47-7681614cb7d6/1781429596225-image.jpg`
- File name: `image.jpg`

### `Cafe Solglantan`

- Organization ID: `867dea40-ff4a-4f3c-b7d5-a76dff1a5675`
- Owner: `stromberg.robin@gmail.com` (`c4b08290-5b9d-4199-9f60-2a0037b76b02`)
- Created: `2026-06-23 13:29:02+00`

Data counts:

| Table/data type | Count |
| --- | ---: |
| `organization_memberships` | 1 |
| `control_types` | 15 |
| `control_objects` | 26 |
| `control_field_definitions` | 52 |
| `control_runs` | 1 |
| `control_run_items` | 3 |
| `deviations` | 0 |
| `attachments` | 0 |
| `share_links` | 1 |
| `export_logs` | 1 |
| `suppliers` | 0 |
| `organization_invitations` | 0 |

## Developer Account

`robinpstromberg@pm.me` already exists as an Auth user:

- User ID: `f29fb513-36ee-459b-bae7-a6eef5b7d724`
- Created: `2026-06-12 16:03:25+00`
- Last sign-in: `2026-06-12 16:35:32+00`
- No `profiles` row
- No organization membership
- No app data

The current schema has no developer role or developer flag. The only role model in the app is organization-scoped `owner`, `admin`, and `staff`. Do not mark this user as developer by adding ad hoc metadata or a fake organization role. Create a separate developer-permission issue before building Developer Center or reset tools.

## Proposed Deletion Scope

Delete only after explicit approval:

- User IDs:
  - `04ef3261-3839-4132-89c4-7ce2abd30713`
  - `c4b08290-5b9d-4199-9f60-2a0037b76b02`
  - `d2ed54e4-7175-47a8-97bd-4cb97dfe89f9`
- Organization IDs:
  - `a949c963-0b74-4942-acb5-bbf9e0796f2d`
  - `867dea40-ff4a-4f3c-b7d5-a76dff1a5675`
- Storage object:
  - `control-attachments/a949c963-0b74-4942-acb5-bbf9e0796f2d/9ff38b0a-aaaa-426d-af8a-c535303160db/57ca99d1-fb3c-4d90-bc47-7681614cb7d6/1781429596225-image.jpg`

Keep:

- `robinpstromberg@pm.me`
- User ID `f29fb513-36ee-459b-bae7-a6eef5b7d724`

## Safe Deletion Order

Run deletion in a transaction for database rows. Delete storage objects before or after the transaction with an explicit object path list, never by broad bucket/domain matching.

1. Re-run the inventory queries and verify the same target IDs before deletion.
2. Confirm every targeted organization has only the expected owner and no unknown/external members.
3. Delete the known storage object from `control-attachments`.
4. Delete organization-scoped child rows:
   - `attachments`
   - `deviations`
   - `control_run_items`
   - `control_runs`
   - `export_logs`
   - `share_links`
   - `suppliers`
   - `organization_invitations`
   - `control_field_definitions`
   - `control_objects`
   - `control_types`
5. Delete `organization_memberships` for the targeted organizations.
6. Delete targeted `organizations`.
7. Delete targeted `profiles`.
8. Delete targeted Auth users, preferably through Supabase Auth Admin/API or dashboard. If SQL is used, it must target the explicit user IDs above.
9. Re-run count queries and confirm:
   - no rows remain for deleted organization IDs
   - no rows remain for deleted user IDs
   - developer account still exists and has no organization membership

## Approval Gate

Before running destructive steps, Robin must explicitly approve this exact target set:

> Approve deletion of test users `04ef3261-3839-4132-89c4-7ce2abd30713`, `c4b08290-5b9d-4199-9f60-2a0037b76b02`, `d2ed54e4-7175-47a8-97bd-4cb97dfe89f9`, organizations `a949c963-0b74-4942-acb5-bbf9e0796f2d`, `867dea40-ff4a-4f3c-b7d5-a76dff1a5675`, and the listed attachment storage object, while keeping developer user `f29fb513-36ee-459b-bae7-a6eef5b7d724`.
