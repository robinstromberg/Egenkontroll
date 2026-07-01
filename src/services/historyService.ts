import { supabase } from '../lib/supabaseClient';
import type { ControlRun, ControlRunItem, Deviation, Profile } from '../types/database';
import { createSignedAttachmentUrls, isImageAttachment } from './attachmentService';

export type HistoryFilters = {
  fromDate?: string;
  toDate?: string;
  status?: string;
  query?: string;
};

export type HistoryAttachment = {
  id: string;
  file_name: string | null;
  content_type: string | null;
  size_bytes: number | null;
  storage_bucket: string | null;
  storage_path: string | null;
  signed_url?: string | null;
  signed_url_expires_at?: string | null;
  created_at: string;
};

export type ControlRunSummary = ControlRun & {
  control_type_name?: string;
  control_type_instructions?: string | null;
  performed_by_name: string;
  attachment_count: number;
};

export type ControlRunDetail = {
  run: ControlRunSummary;
  items: ControlRunItem[];
  deviations: Deviation[];
  attachments: HistoryAttachment[];
};

type ProfileSummary = Pick<Profile, 'id' | 'full_name' | 'email'>;

function readPerformerName(performedBy: string | null, profileById: Map<string, ProfileSummary>): string {
  if (!performedBy) return 'Okänd användare';
  const profile = profileById.get(performedBy);
  return profile?.full_name.trim() || profile?.email || 'Okänd användare';
}

async function loadProfilesForRuns(runs: ControlRun[]): Promise<Map<string, ProfileSummary>> {
  const performerIds = [...new Set(runs.map((run) => run.performed_by).filter(Boolean) as string[])];
  if (performerIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', performerIds);

  if (error) throw error;

  return new Map(((data ?? []) as ProfileSummary[]).map((profile) => [profile.id, profile]));
}

export async function listHistoryRuns(
  organizationId: string,
  filters: HistoryFilters,
): Promise<ControlRunSummary[]> {
  let query = supabase
    .from('control_runs')
    .select('*, control_types(name, instructions)')
    .eq('organization_id', organizationId)
    .order('performed_at', { ascending: false })
    .limit(50);

  if (filters.fromDate) {
    query = query.gte('performed_at', new Date(`${filters.fromDate}T00:00:00`).toISOString());
  }

  if (filters.toDate) {
    query = query.lt('performed_at', new Date(`${filters.toDate}T23:59:59`).toISOString());
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const baseRows = (data ?? []).map((row) => ({
    ...(row as ControlRun),
    control_type_name: row.control_types?.name,
    control_type_instructions: row.control_types?.instructions ?? null,
  }));

  if (baseRows.length === 0) {
    return [];
  }

  const profileById = await loadProfilesForRuns(baseRows);
  const rows = baseRows.map((row) => ({
    ...row,
    performed_by_name: readPerformerName(row.performed_by, profileById),
  }));

  const normalizedQuery = filters.query?.trim().toLowerCase() ?? '';
  const runIds = rows.map((row) => row.id);
  const { data: attachments, error: attachmentsError } = await supabase
    .from('attachments')
    .select('control_run_id')
    .eq('organization_id', organizationId)
    .in('control_run_id', runIds);

  if (attachmentsError) {
    throw attachmentsError;
  }

  const attachmentCountByRunId = new Map<string, number>();
  for (const attachment of attachments ?? []) {
    if (!attachment.control_run_id) continue;
    attachmentCountByRunId.set(
      attachment.control_run_id,
      (attachmentCountByRunId.get(attachment.control_run_id) ?? 0) + 1,
    );
  }

  let filteredRows = rows;

  if (normalizedQuery) {
    const { data: items, error: itemsError } = await supabase
      .from('control_run_items')
      .select('control_run_id, object_snapshot, field_snapshot, value_text, value_number, value_boolean, value_date, value_json, deviation_reason, action_text')
      .eq('organization_id', organizationId)
      .in('control_run_id', runIds);

    if (itemsError) {
      throw itemsError;
    }

    const searchableTextByRunId = new Map<string, string[]>();
    for (const item of items ?? []) {
      const parts = searchableTextByRunId.get(item.control_run_id) ?? [];
      parts.push(JSON.stringify([
        item.object_snapshot,
        item.field_snapshot,
        item.value_text,
        item.value_number,
        item.value_boolean,
        item.value_date,
        item.value_json,
        item.deviation_reason,
        item.action_text,
      ]));
      searchableTextByRunId.set(item.control_run_id, parts);
    }

    filteredRows = rows.filter((row) => {
      const text = [
        row.control_type_name,
        row.performed_by_name,
        row.status,
        row.notes,
        ...(searchableTextByRunId.get(row.id) ?? []),
      ].join(' ').toLowerCase();

      return text.includes(normalizedQuery);
    });
  }

  return filteredRows.map((row) => ({
    ...row,
    attachment_count: attachmentCountByRunId.get(row.id) ?? 0,
  }));
}

export async function getControlRunDetail(
  organizationId: string,
  controlRunId: string,
): Promise<ControlRunDetail> {
  const { data: run, error: runError } = await supabase
    .from('control_runs')
    .select('*, control_types(name, instructions)')
    .eq('organization_id', organizationId)
    .eq('id', controlRunId)
    .single();

  if (runError) throw runError;

  const [{ data: items, error: itemsError }, { data: deviations, error: deviationsError }, { data: attachments, error: attachmentsError }] = await Promise.all([
    supabase
      .from('control_run_items')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('control_run_id', controlRunId)
      .order('created_at', { ascending: true }),
    supabase
      .from('deviations')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('control_run_id', controlRunId)
      .order('opened_at', { ascending: true }),
    supabase
      .from('attachments')
      .select('id, file_name, content_type, size_bytes, storage_bucket, storage_path, created_at')
      .eq('organization_id', organizationId)
      .eq('control_run_id', controlRunId)
      .order('created_at', { ascending: true }),
  ]);

  if (itemsError) throw itemsError;
  if (deviationsError) throw deviationsError;
  if (attachmentsError) throw attachmentsError;

  const detailAttachments = (attachments ?? []) as HistoryAttachment[];
  const imageAttachments = detailAttachments.filter(isImageAttachment);
  const [profileById, signedImageUrls] = await Promise.all([
    loadProfilesForRuns([run as ControlRun]),
    createSignedAttachmentUrls(imageAttachments),
  ]);

  return {
    run: {
      ...(run as ControlRun),
      control_type_name: run.control_types?.name,
      control_type_instructions: run.control_types?.instructions ?? null,
      performed_by_name: readPerformerName((run as ControlRun).performed_by, profileById),
      attachment_count: detailAttachments.length,
    },
    items: (items ?? []) as ControlRunItem[],
    deviations: (deviations ?? []) as Deviation[],
    attachments: detailAttachments.map((attachment) => {
      const signedUrl = signedImageUrls.get(attachment.id);

      return {
        ...attachment,
        signed_url: signedUrl?.signed_url ?? null,
        signed_url_expires_at: signedUrl?.signed_url_expires_at ?? null,
      };
    }),
  };
}
