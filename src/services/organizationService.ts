import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { cloneTemplatesToOrganization } from './templateService';
import type { OrganizationMembership, Organization, OrganizationRole } from '../types/database';

export type OrganizationContext = {
  membership: OrganizationMembership;
  organization: Organization;
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
): Promise<void> {
  await ensureProfile(user);

  const { data: organization, error: organizationError } = await supabase
    .from('organizations')
    .insert({
      name: organizationName,
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
}

export async function updateOrganizationBranding(input: {
  organizationId: string;
  name: string;
  orgNumber: string;
  logoUrl: string;
  brandColor: string;
}): Promise<Organization> {
  const logoUrl = input.logoUrl.trim();
  const brandColor = input.brandColor.trim();

  const { data, error } = await supabase
    .from('organizations')
    .update({
      name: input.name.trim(),
      org_number: input.orgNumber.trim() || null,
      logo_url: logoUrl || null,
      brand_color: brandColor || null,
    })
    .eq('id', input.organizationId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as Organization;
}
