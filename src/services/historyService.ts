import { supabase } from '../lib/supabaseClient';
import type { ControlRun, ControlRunItem, Deviation } from '../types/database';

export type HistoryFilters = {
  fromDate?: string;
  toDate?: string;
  status?: string;
};

export type HistoryAttachment = {
  id: string;
  file_name: string | null;
  content_type: string | null;
  size_bytes: number | null;
  storage_bucket: string | null;
  storage_path: string | null;
  created_at: string;
};

export type ControlRunSummary = ControlRun & {
  control_type_name?: string;
};

export type ControlRunDetail = {
  run: ControlRunSummary;
  items: ControlRunItem[];
  deviations: Deviation[];
  attachments: HistoryAttachment[];
};

export async function listHistoryRuns(
  organizationId: string,
  filters: HistoryFilters,
): Promise<ControlRunSummary[]> {
  let query = supabase
    .from('control_runs')
    .select('*, control_types(name)')
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

  return (data ?? []).map((row) => ({
    ...(row as ControlRun),
    control_type_name: row.control_types?.name,
  }));
}

export async function getControlRunDetail(
  organizationId: string,
  controlRunId: string,
): Promise<ControlRunDetail> {
  const { data: run, error: runError } = await supabase
    .from('control_runs')
    .select('*, control_types(name)')
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

  return {
    run: {
      ...(run as ControlRun),
      control_type_name: run.control_types?.name,
    },
    items: (items ?? []) as ControlRunItem[],
    deviations: (deviations ?? []) as Deviation[],
    attachments: (attachments ?? []) as HistoryAttachment[],
  };
}
