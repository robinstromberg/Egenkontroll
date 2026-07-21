import type { Organization, OrganizationMembership, Profile } from '../types/database';

export type OrganizationContext = {
  membership: OrganizationMembership;
  organization: Organization;
  profile: Profile | null;
};

export type MembershipWithOrganization = OrganizationMembership & {
  organizations: Organization | null;
};

export function buildUserScopedOrganizationContexts(
  memberships: MembershipWithOrganization[],
  profile: Profile | null,
  currentUserId: string,
): OrganizationContext[] {
  const currentUserProfile = profile?.id === currentUserId ? profile : null;

  return memberships
    .filter((membership) => membership.user_id === currentUserId && membership.organizations)
    .map((membership) => ({
      membership: {
        id: membership.id,
        organization_id: membership.organization_id,
        user_id: membership.user_id,
        role: membership.role,
        status: membership.status,
        created_at: membership.created_at,
        updated_at: membership.updated_at,
      },
      organization: membership.organizations as Organization,
      profile: currentUserProfile,
    }));
}

export function canApplyOrganizationContexts(
  contexts: OrganizationContext[],
  expectedUserId: string,
  currentUserId: string | null,
): boolean {
  return currentUserId === expectedUserId && contexts.every((context) => context.membership.user_id === expectedUserId);
}
