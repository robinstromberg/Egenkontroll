import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { cloneInactiveDefaultTemplatesToOrganization, cloneTemplatesToOrganization } from './templateService';
import type { OrganizationMembership, Organization, OrganizationRole } from '../types/database';

export type BusinessType = NonNullable<Organization['business_type']>;

export type OrganizationContext = {
  membership: OrganizationMembership;
  organization: Organization;
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

type MembershipWithOrganization = OrganizationMembership & {
  organizations: Organization | null;
};

export function canManageOrganization(role: OrganizationRole): boolean {
  return role === 'owner' || role === 'admin';
}

export async function ensureProfile(user: User): Promise<void> {
  const fullName =
    typeof user.user_metadata.full_name === 'string' ? user.user_metadata.full_name : '';

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    email: user.email ?? null,
    full_name: fullName,
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

  return ((data ?? []) as MembershipWithOrganization[])
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
}

export async function createFirstOrganization(
  user: User,
  organizationName: string,
  templateIds: string[] = [],
  businessProfile: { industry: Organization['industry']; businessType: BusinessType },
): Promise<void> {
  await ensureProfile(user);

  const { data: organization, error: organizationError } = await supabase
    .from('organizations')
    .insert({
      name: organizationName,
      industry: businessProfile.industry,
      business_type: businessProfile.businessType,
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
