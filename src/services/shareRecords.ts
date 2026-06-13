import { supabase } from '../lib/supabaseClient';
import { createShareToken, hashShareToken } from './shareToken';

export type AccessRecord = {
  id: string;
  valid_until: string;
  period_start: string;
  period_end: string;
  status: string;
  created_at: string;
};

export type SharedRun = {
  run_id: string;
  control_type_name: string;
  performed_at: string;
  status: string;
};

export async function createAccessLink(input: {
  organizationId: string;
  createdBy: string;
  periodStart: string;
  periodEnd: string;
  validUntil: string;
}): Promise<string> {
  const secret = createShareToken();
  const secretHash = await hashShareToken(secret);

  const { error } = await supabase.from('share_links').insert({
    organization_id: input.organizationId,
    token_hash: secretHash,
    created_by: input.createdBy,
    valid_until: new Date(`${input.validUntil}T23:59:59`).toISOString(),
    period_start: input.periodStart,
    period_end: input.periodEnd,
    included_control_type_ids: [],
    status: 'active',
  });

  if (error) throw error;

  const marker = String.fromCharCode(35) + 'inspector=';
  return `${window.location.origin}/${marker}${secret}`;
}

export async function listAccessLinks(organizationId: string): Promise<AccessRecord[]> {
  const { data, error } = await supabase
    .from('share_links')
    .select('id, valid_until, period_start, period_end, status, created_at')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;

  return (data ?? []) as AccessRecord[];
}

export async function readSharedRuns(secret: string): Promise<SharedRun[]> {
  const { data, error } = await supabase.rpc('get_shared_control_runs', { raw_token: secret });

  if (error) throw error;

  return (data ?? []) as SharedRun[];
}
