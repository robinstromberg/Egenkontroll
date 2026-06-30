# Test Data Reset Runbook

Status: prepared for issue #178 on 2026-06-30.

This runbook describes the safe process for resetting prelaunch test data. It intentionally does not include real user emails, Auth user IDs, organization IDs, or storage paths because this repository can be read outside the operational context. Keep the exact target inventory in a private operator note or the active Codex thread, not in public documentation.

## Safety Rules

- Never delete data based only on an email domain, account age, or assumption.
- List exact target Auth user IDs, organization IDs, and storage object paths before deletion.
- Confirm that every targeted organization contains only expected test users.
- Do not delete an organization if it has unknown or external members.
- Delete storage objects only from an explicit path list.
- Require Robin's explicit approval of the exact target set before destructive action.
- Re-run verification queries after deletion.

## Developer Account

The developer account should remain separate from ordinary test accounts.

Current product roles are organization-scoped:

- `owner`
- `admin`
- `staff`

There is no dedicated developer role or developer flag in the current schema. Do not improvise one with client-editable metadata or a fake organization membership. Before Developer Center or test-reset tools are implemented, create a separate developer-permission design issue that covers:

- where developer authorization lives
- how it is assigned and revoked
- how destructive developer actions are audited
- how reset tools are limited to prelaunch/test data

## Inventory Checklist

Before deletion, collect:

- Auth users proposed for deletion
- Auth users explicitly kept
- Profiles for proposed users
- Organization memberships for proposed users
- Organizations created by or owned by proposed users
- Member list for every targeted organization
- Counts per targeted organization for:
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
  - `organization_memberships`
- Explicit storage object paths from `attachments` and organization branding fields

## Deletion Order

Use explicit ID lists. Do not use broad predicates.

1. Re-run the inventory queries immediately before deletion.
2. Confirm the target organizations still have only expected test members.
3. Delete explicit storage objects from their buckets.
4. In a database transaction, delete organization-scoped child rows:
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
5. Delete `organization_memberships` for targeted organizations.
6. Delete targeted `organizations`.
7. Delete targeted `profiles`.
8. Delete targeted Auth users through Supabase Auth Admin/API or dashboard. If SQL is used, target only explicit user IDs.
9. Verify that no rows remain for targeted organization IDs or user IDs.
10. Verify that the developer account still exists and is not attached to deleted test organizations.

## Approval Gate

Before running deletion, ask Robin to approve a private target list with this shape:

```text
Approve deletion of:
- test Auth users: <exact user IDs>
- test organizations: <exact organization IDs>
- storage objects: <exact bucket/path list>

Keep:
- developer Auth user: <exact user ID>
```

Do not proceed unless the approval matches the exact target set.
