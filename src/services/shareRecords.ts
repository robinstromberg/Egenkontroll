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
  control_type_id: string;
  control_type_name: string;
  control_type_category: string;
  performed_at: string;
  status: string;
  notes: string | null;
  items: SharedRunItem[];
  deviations: SharedDeviation[];
  attachments: SharedAttachment[];
};

export type SharedControlTypeOption = {
  control_type_id: string;
  control_type_name: string;
  control_type_category: string;
};

export type SharedRunItem = {
  id: string;
  object_snapshot: Record<string, unknown>;
  field_snapshot: Record<string, unknown>;
  value_text: string | null;
  value_number: number | null;
  value_boolean: boolean | null;
  value_date: string | null;
  value_json: Record<string, unknown> | null;
  status: string;
  deviation_detected: boolean;
  deviation_reason: string | null;
  action_text: string | null;
  created_at: string;
};

export type SharedDeviation = {
  id: string;
  control_run_item_id: string | null;
  status: string;
  severity: string;
  description: string;
  action_text: string;
  follow_up_comment: string | null;
  opened_at: string;
  resolved_at: string | null;
};

export type SharedAttachment = {
  id: string;
  control_run_item_id: string | null;
  deviation_id: string | null;
  file_name: string | null;
  storage_bucket: string;
  storage_path: string;
  created_at: string;
};

export type SharedExportType = 'pdf' | 'csv';

export async function createAccessLink(input: {
  organizationId: string;
  createdBy: string;
  validUntil: string;
}): Promise<string> {
  const secret = createShareToken();
  const secretHash = await hashShareToken(secret);

  const { error } = await supabase.from('share_links').insert({
    organization_id: input.organizationId,
    token_hash: secretHash,
    created_by: input.createdBy,
    valid_until: new Date(`${input.validUntil}T23:59:59`).toISOString(),
    period_start: '1900-01-01',
    period_end: '9999-12-31',
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

export async function readSharedControlTypeOptions(secret: string): Promise<SharedControlTypeOption[]> {
  const { data, error } = await supabase.rpc('get_shared_control_type_options', { raw_token: secret });

  if (error) throw error;

  return (data ?? []) as SharedControlTypeOption[];
}

export async function readSharedRuns(
  secret: string,
  filters: {
    periodStart?: string;
    periodEnd?: string;
    controlTypeIds?: string[];
  } = {},
): Promise<SharedRun[]> {
  const { data, error } = await supabase.rpc('get_shared_control_runs', {
    raw_token: secret,
    p_period_start: filters.periodStart || null,
    p_period_end: filters.periodEnd || null,
    p_control_type_ids: filters.controlTypeIds ?? [],
  });

  if (error) throw error;

  return (data ?? []) as SharedRun[];
}

export async function logSharedExport(
  secret: string,
  exportType: SharedExportType,
  filters: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase.rpc('log_shared_export', {
    raw_token: secret,
    p_export_type: exportType,
    p_filters: filters,
  });

  if (error) throw error;
}
