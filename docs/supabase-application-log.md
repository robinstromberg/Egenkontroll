# Supabase application log

This file documents schema work applied directly to the connected Supabase project during issue #2 and later schema/security adjustments.

## Project

- Supabase project: `Egenkontroll`
- Project ref: `eapjywbgxtudqjrlueep`

## Applied migration groups

The large initial schema was applied to Supabase in smaller migration groups because the tool rejected one very large migration payload.

Applied groups:

- `probe_empty_migration` – harmless connectivity probe using `select 1;`.
- `initial_core_tables`
- `initial_control_types_objects`
- `initial_control_fields`
- `initial_run_tables`
- `initial_deviations_attachments_sharing`
- `initial_indexes_triggers`
- `initial_rls_helpers`
- `initial_rls_policies_core`
- `initial_rls_policies_controls`
- `initial_rls_policies_deviations_sharing`
- `initial_control_templates`
- `harden_schema_helper_functions`
- `revoke_public_execute_on_rls_helpers`
- `add_missing_foreign_key_indexes`
- `harden_first_owner_membership_policy`

## Verification

Verified that the expected 13 public tables exist:

- `attachments`
- `control_field_definitions`
- `control_objects`
- `control_run_items`
- `control_runs`
- `control_templates`
- `control_types`
- `deviations`
- `export_logs`
- `organization_memberships`
- `organizations`
- `profiles`
- `share_links`

Verified that 6 Swedish starter templates exist.

Security advisor was run after hardening and returned no security lints.

Performance advisor still reports expected early-stage warnings such as unused indexes and RLS init-plan optimizations. These are not blocking for the schema foundation and should be revisited in the later hardening issue.

## Issue #3 hardening note

During issue #3, the first-owner membership policy was tightened in Supabase with a dedicated helper that checks whether an organization already has any members before allowing a user to create the first owner membership. Security advisor was run again afterwards and returned no security lints.

The exact SQL migration was applied directly in Supabase. The connector blocked committing that specific SQL file into the repository, so this log records the applied schema/security change explicitly.
