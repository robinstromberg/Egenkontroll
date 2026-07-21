import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildUserScopedOrganizationContexts,
  canApplyOrganizationContexts,
  type MembershipWithOrganization,
} from './organizationContext';
import type { Organization, Profile } from '../types/database';

const ownerId = 'owner-user';
const staffId = 'staff-user';
const organization: Organization = {
  id: 'organization-1',
  name: 'Samma verksamhet',
  industry: 'food',
  business_type: 'restaurant',
  logo_url: null,
  brand_color: null,
  logo_storage_bucket: null,
  logo_storage_path: null,
  logo_file_name: null,
  logo_content_type: null,
  logo_size_bytes: null,
  org_number: null,
  country_code: 'SE',
  timezone: 'Europe/Stockholm',
  default_locale: 'sv',
  subscription_status: 'active',
  billing_plan: 'monthly',
  trial_started_at: null,
  trial_ends_at: null,
  created_by: ownerId,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

const memberships: MembershipWithOrganization[] = [
  {
    id: 'membership-owner',
    organization_id: organization.id,
    user_id: ownerId,
    role: 'owner',
    status: 'active',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    organizations: organization,
  },
  {
    id: 'membership-staff',
    organization_id: organization.id,
    user_id: staffId,
    role: 'staff',
    status: 'active',
    created_at: '2026-01-02T00:00:00.000Z',
    updated_at: '2026-01-02T00:00:00.000Z',
    organizations: organization,
  },
];

const ownerProfile: Profile = {
  id: ownerId,
  full_name: 'Robin Owner',
  email: 'owner@example.test',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

const staffProfile: Profile = {
  id: staffId,
  full_name: 'Test Staff',
  email: 'staff@example.test',
  created_at: '2026-01-02T00:00:00.000Z',
  updated_at: '2026-01-02T00:00:00.000Z',
};

test('owner and staff in the same organization receive their own membership and profile', () => {
  const ownerContexts = buildUserScopedOrganizationContexts(memberships, ownerProfile, ownerId);
  const staffContexts = buildUserScopedOrganizationContexts(memberships, staffProfile, staffId);

  assert.deepEqual(ownerContexts.map((context) => context.membership.role), ['owner']);
  assert.equal(ownerContexts[0].profile?.id, ownerId);
  assert.deepEqual(staffContexts.map((context) => context.membership.role), ['staff']);
  assert.equal(staffContexts[0].profile?.id, staffId);
});

test('staff never receives owner or admin context even if same-organization rows are readable', () => {
  const staffContexts = buildUserScopedOrganizationContexts(memberships, staffProfile, staffId);

  assert.equal(staffContexts.length, 1);
  assert.equal(staffContexts[0].membership.user_id, staffId);
  assert.notEqual(staffContexts[0].membership.role, 'owner');
  assert.notEqual(staffContexts[0].membership.role, 'admin');
  assert.equal(staffContexts[0].profile?.full_name, 'Test Staff');
});

test('a profile for another user is never attached to the current user context', () => {
  const staffContexts = buildUserScopedOrganizationContexts(memberships, ownerProfile, staffId);

  assert.equal(staffContexts[0].profile, null);
});

test('a late context response from the previous user is discarded after logout and another login', () => {
  const ownerContexts = buildUserScopedOrganizationContexts(memberships, ownerProfile, ownerId);
  const staffContexts = buildUserScopedOrganizationContexts(memberships, staffProfile, staffId);

  assert.equal(canApplyOrganizationContexts(ownerContexts, ownerId, staffId), false);
  assert.equal(canApplyOrganizationContexts(staffContexts, staffId, staffId), true);
  assert.equal(staffContexts[0].membership.role, 'staff');
  assert.equal(staffContexts[0].profile?.id, staffId);
});
