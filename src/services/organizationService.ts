import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { cloneTemplatesToOrganization } from './templateService';
import type { OrganizationMembership, Organization, OrganizationRole } from '../types/database';

const brandingBucketName = 'organization-branding';
const maxLogoWidth = 640;
const logoJpegQuality = 0.9;

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

async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Kunde inte lÃ¤sa logotypen.'));
    };

    image.src = url;
  });
}

async function convertLogoToJpeg(file: File): Promise<File> {
  const image = await loadImage(file);
  const scale = image.width > maxLogoWidth ? maxLogoWidth / image.width : 1;
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Kunde inte bearbeta logotypen.');
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Kunde inte skapa JPEG-logotyp.'));
          return;
        }

        const baseName = file.name.replace(/\.[^.]+$/, '') || 'logotyp';
        resolve(new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      logoJpegQuality,
    );
  });
}

export async function uploadOrganizationLogo(
  organizationId: string,
  file: File,
): Promise<{
  bucket: string;
  path: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
}> {
  const uploadFile = await convertLogoToJpeg(file);
  const storagePath = `${organizationId}/logo.jpg`;

  const { error } = await supabase.storage
    .from(brandingBucketName)
    .upload(storagePath, uploadFile, {
      upsert: true,
      contentType: uploadFile.type,
    });

  if (error) {
    throw error;
  }

  return {
    bucket: brandingBucketName,
    path: storagePath,
    fileName: uploadFile.name,
    contentType: uploadFile.type,
    sizeBytes: uploadFile.size,
  };
}

export async function updateOrganizationBranding(input: {
  organizationId: string;
  name: string;
  orgNumber: string;
  logoUrl: string;
  brandColor: string;
  logo?: {
    bucket: string;
    path: string;
    fileName: string;
    contentType: string;
    sizeBytes: number;
  };
}): Promise<Organization> {
  const logoUrl = input.logoUrl.trim();
  const brandColor = input.brandColor.trim();
  const updates: Record<string, string | number | null> = {
    name: input.name.trim(),
    org_number: input.orgNumber.trim() || null,
    logo_url: logoUrl || null,
    brand_color: brandColor || null,
  };

  if (input.logo) {
    updates.logo_storage_bucket = input.logo.bucket;
    updates.logo_storage_path = input.logo.path;
    updates.logo_file_name = input.logo.fileName;
    updates.logo_content_type = input.logo.contentType;
    updates.logo_size_bytes = input.logo.sizeBytes;
  }

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
