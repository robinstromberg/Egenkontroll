import type { User } from '@supabase/supabase-js';
import type { BillingPlan } from '../config/subscription';
import { createTrialWindow } from '../config/subscription';
import { supabase } from '../lib/supabaseClient';
import { getCurrentSession } from './authService';
import { cloneInactiveDefaultTemplatesToOrganization, cloneTemplatesToOrganization } from './templateService';
import type {
  InvitationStatus,
  OrganizationInvitation,
  OrganizationMembership,
  Organization,
  Profile,
  OrganizationRole,
} from '../types/database';

export type BusinessType = NonNullable<Organization['business_type']>;

export type OrganizationContext = {
  membership: OrganizationMembership;
  organization: Organization;
  profile: Profile | null;
};

export type OrganizationMemberSummary = {
  id: string;
  user_id: string;
  role: OrganizationRole;
  status: string;
  email: string | null;
  full_name: string;
  created_at: string;
};

export type OrganizationInvitationSummary = Pick<
  OrganizationInvitation,
  'id' | 'organization_id' | 'email' | 'role' | 'status' | 'invited_by' | 'accepted_by' | 'accepted_at' | 'expires_at' | 'created_at' | 'updated_at'
>;

type MembershipWithOrganization = OrganizationMembership & {
  organizations: Organization | null;
};

const invitationSendAttemptIds = new Map<string, string>();
const sendAttemptUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getInvitationSendAttemptId(invitationId: string): string {
  const storageKey = `organization-invitation-attempt:${invitationId}`;
  const inMemoryAttemptId = invitationSendAttemptIds.get(invitationId);
  if (inMemoryAttemptId) return inMemoryAttemptId;

  let storedAttemptId: string | null = null;
  try {
    storedAttemptId = window.sessionStorage.getItem(storageKey);
  } catch {
    // In-memory state still protects retries when storage is unavailable.
  }

  const attemptId = storedAttemptId && sendAttemptUuidPattern.test(storedAttemptId)
    ? storedAttemptId
    : window.crypto.randomUUID();
  invitationSendAttemptIds.set(invitationId, attemptId);
  try {
    window.sessionStorage.setItem(storageKey, attemptId);
  } catch {
    // The attempt remains available in memory for this page session.
  }
  return attemptId;
}

function clearInvitationSendAttemptId(invitationId: string): void {
  invitationSendAttemptIds.delete(invitationId);
  try {
    window.sessionStorage.removeItem(`organization-invitation-attempt:${invitationId}`);
  } catch {
    // There is no persisted attempt to clear when storage is unavailable.
  }
}

export function canManageOrganization(role: OrganizationRole): boolean {
  return role === 'owner' || role === 'admin';
}

export async function ensureProfile(user: User): Promise<void> {
  const metadataFullName =
    typeof user.user_metadata.full_name === 'string' ? user.user_metadata.full_name.trim() : '';
  const { data: existingProfile, error: profileReadError } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle();

  if (profileReadError) {
    throw profileReadError;
  }

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    email: user.email ?? null,
    full_name: metadataFullName || existingProfile?.full_name || '',
  });

  if (error) {
    throw error;
  }
}

export async function listOrganizationContexts(): Promise<OrganizationContext[]> {
  const { data, error } = await supabase
    .from('organization_memberships')
    .select('*, organizations(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  const memberships = ((data ?? []) as MembershipWithOrganization[])
    .filter((row) => row.organizations)
    .map((row) => ({
      membership: {
        id: row.id,
        organization_id: row.organization_id,
        user_id: row.user_id,
        role: row.role,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
      },
      organization: row.organizations as Organization,
    }));

  if (memberships.length === 0) {
    return [];
  }

  const userId = memberships[0].membership.user_id;
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle();

  return memberships.map((context) => ({
    ...context,
    profile: (profile ?? null) as Profile | null,
  }));
}

export async function createFirstOrganization(
  user: User,
  organizationName: string,
  templateIds: string[] = [],
  businessProfile: { industry: Organization['industry']; businessType: BusinessType },
  subscription: { billingPlan: BillingPlan },
): Promise<string> {
  await ensureProfile(user);
  const trialWindow = createTrialWindow();

  const { data: organization, error: organizationError } = await supabase
    .from('organizations')
    .insert({
      name: organizationName,
      industry: businessProfile.industry,
      business_type: businessProfile.businessType,
      subscription_status: 'trial',
      billing_plan: subscription.billingPlan,
      trial_started_at: trialWindow.trialStartedAt,
      trial_ends_at: trialWindow.trialEndsAt,
      created_by: user.id,
    })
    .select('id')
    .single();

  if (organizationError) {
    throw organizationError;
  }

  const organizationId = organization.id as string;

  const { error: membershipError } = await supabase.from('organization_memberships').insert({
    organization_id: organizationId,
    user_id: user.id,
    role: 'owner',
    status: 'active',
  });

  if (membershipError) {
    throw membershipError;
  }

  await cloneTemplatesToOrganization(organizationId, templateIds, user.id);
  await cloneInactiveDefaultTemplatesToOrganization(organizationId, user.id);

  return organizationId;
}

export async function updateProfile(input: {
  userId: string;
  fullName: string;
  email: string | null;
}): Promise<void> {
  const { error } = await supabase.from('profiles').upsert({
    id: input.userId,
    full_name: input.fullName.trim(),
    email: input.email,
  });

  if (error) {
    throw error;
  }
}

export async function listOrganizationMembers(organizationId: string): Promise<OrganizationMemberSummary[]> {
  const { data: memberships, error: membershipError } = await supabase
    .from('organization_memberships')
    .select('id, user_id, role, status, created_at')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: true });

  if (membershipError) {
    throw membershipError;
  }

  const membershipRows = (memberships ?? []) as Pick<
    OrganizationMembership,
    'id' | 'user_id' | 'role' | 'status' | 'created_at'
  >[];
  const userIds = membershipRows.map((membership) => membership.user_id);

  const { data: profiles, error: profileError } = userIds.length
    ? await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds)
    : { data: [], error: null };

  const profileRows = profileError ? [] : (profiles ?? []) as { id: string; full_name: string; email: string | null }[];
  const profileById = new Map(profileRows.map((profile) => [profile.id, profile]));

  return membershipRows.map((membership) => {
    const profile = profileById.get(membership.user_id);
    return {
      id: membership.id,
      user_id: membership.user_id,
      role: membership.role,
      status: membership.status,
      email: profile?.email ?? null,
      full_name: profile?.full_name ?? '',
      created_at: membership.created_at,
    };
  });
}

export async function listOrganizationInvitations(organizationId: string): Promise<OrganizationInvitationSummary[]> {
  const { data, error } = await supabase
    .from('organization_invitations')
    .select('id, organization_id, email, role, status, invited_by, accepted_by, accepted_at, expires_at, created_at, updated_at')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as OrganizationInvitationSummary[];
}

export async function createOrganizationInvitation(input: {
  organizationId: string;
  email: string;
  role: Exclude<OrganizationRole, 'owner'>;
  invitedBy: string;
}): Promise<OrganizationInvitationSummary> {
  const email = input.email.trim().toLowerCase();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const readPendingInvitation = async () => {
    const { data, error } = await supabase
      .from('organization_invitations')
      .select('id, organization_id, email, role, status, invited_by, accepted_by, accepted_at, expires_at, created_at, updated_at')
      .eq('organization_id', input.organizationId)
      .eq('email', email)
      .eq('status', 'pending')
      .maybeSingle();

    if (error) throw error;
    return data as OrganizationInvitationSummary | null;
  };

  const reusePendingInvitation = (invitation: OrganizationInvitationSummary) => {
    if (invitation.role !== input.role) {
      throw new Error('Det finns redan en väntande inbjudan med en annan roll. Återkalla den först.');
    }
    if (new Date(invitation.expires_at).getTime() <= Date.now()) {
      throw new Error('Den väntande inbjudan har gått ut. Förläng den innan du skickar igen.');
    }
    return invitation;
  };

  const existingInvitation = await readPendingInvitation();
  if (existingInvitation) return reusePendingInvitation(existingInvitation);

  const { data, error } = await supabase
    .from('organization_invitations')
    .insert({
      organization_id: input.organizationId,
      email,
      role: input.role,
      status: 'pending' satisfies InvitationStatus,
      invited_by: input.invitedBy,
      expires_at: expiresAt,
    })
    .select('id, organization_id, email, role, status, invited_by, accepted_by, accepted_at, expires_at, created_at, updated_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      const racedInvitation = await readPendingInvitation();
      if (racedInvitation) return reusePendingInvitation(racedInvitation);
    }
    throw error;
  }

  return data as OrganizationInvitationSummary;
}

export async function sendOrganizationInvitationEmail(invitationId: string): Promise<void> {
  const session = await getCurrentSession();
  if (!session?.access_token) throw new Error('Logga in för att skicka inbjudan.');

  const attemptId = getInvitationSendAttemptId(invitationId);

  const response = await fetch('/api/send-organization-invitation', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${session.access_token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ invitationId, attemptId }),
  });
  const payload = await response.json().catch(() => ({})) as { error?: string; code?: string };
  if (!response.ok) {
    if (payload.code === 'invalid_idempotent_request') {
      clearInvitationSendAttemptId(invitationId);
    }
    throw new Error(payload.error || 'Inbjudan kunde inte skickas. Försök igen senare.');
  }

  clearInvitationSendAttemptId(invitationId);
}

export async function revokeOrganizationInvitation(invitationId: string): Promise<void> {
  const { error } = await supabase
    .from('organization_invitations')
    .update({ status: 'revoked' satisfies InvitationStatus })
    .eq('id', invitationId);

  if (error) {
    throw error;
  }
}

export async function renewOrganizationInvitation(invitationId: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabase
    .from('organization_invitations')
    .update({ expires_at: expiresAt, status: 'pending' satisfies InvitationStatus })
    .eq('id', invitationId);

  if (error) {
    throw error;
  }
}

export async function getOrganizationInvitation(invitationId: string): Promise<OrganizationInvitationSummary | null> {
  const { data, error } = await supabase
    .from('organization_invitations')
    .select('id, organization_id, email, role, status, invited_by, accepted_by, accepted_at, expires_at, created_at, updated_at')
    .eq('id', invitationId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as OrganizationInvitationSummary | null;
}

export async function acceptOrganizationInvitation(invitationId: string): Promise<string> {
  const { data, error } = await supabase.rpc('accept_organization_invitation', {
    invitation_id: invitationId,
  });

  if (error) {
    throw error;
  }

  return data as string;
}

export async function updateOrganizationBranding(input: {
  organizationId: string;
  name: string;
  orgNumber: string;
}): Promise<Organization> {
  const updates: Record<string, string | null> = {
    name: input.name.trim(),
    org_number: input.orgNumber.trim() || null,
    logo_url: null,
    brand_color: null,
    logo_storage_bucket: null,
    logo_storage_path: null,
    logo_file_name: null,
    logo_content_type: null,
    logo_size_bytes: null,
  };

  const { data, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', input.organizationId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as Organization;
}
