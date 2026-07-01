import { supabase } from '../lib/supabaseClient';
import type { ControlType, Deviation } from '../types/database';
import { isControlScheduledForDate } from './scheduleService';

export type TodayControl = {
  controlType: ControlType;
  status: 'not_done' | 'done' | 'done_with_deviation';
  lastRunAt: string | null;
};

export type OpenDeviationSummary = Deviation & {
  control_type_name?: string;
  control_object_name?: string;
};

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 1);

  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

export async function listTodayControls(organizationId: string): Promise<TodayControl[]> {
  const { startIso, endIso } = getTodayRange();
  const today = new Date();

  const { data: controlTypes, error: controlTypesError } = await supabase
    .from('control_types')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (controlTypesError) {
    throw controlTypesError;
  }

  const activeTypes = (controlTypes ?? []) as ControlType[];

  if (activeTypes.length === 0) {
    return [];
  }

  const { data: runs, error: runsError } = await supabase
    .from('control_runs')
    .select('control_type_id, status, performed_at')
    .eq('organization_id', organizationId)
    .gte('performed_at', startIso)
    .lt('performed_at', endIso)
    .order('performed_at', { ascending: false });

  if (runsError) {
    throw runsError;
  }

  return activeTypes.filter((controlType) => isControlScheduledForDate(controlType, today)).map((controlType) => {
    const latestRun = (runs ?? []).find((run) => run.control_type_id === controlType.id);

    return {
      controlType,
      status: latestRun
        ? latestRun.status === 'completed_with_deviation'
          ? 'done_with_deviation'
          : 'done'
        : 'not_done',
      lastRunAt: latestRun?.performed_at ?? null,
    };
  });
}

export async function listOpenDeviations(
  organizationId: string,
): Promise<OpenDeviationSummary[]> {
  const { data, error } = await supabase
    .from('deviations')
    .select('*, control_types(name), control_objects(name)')
    .eq('organization_id', organizationId)
    .eq('status', 'open')
    .order('opened_at', { ascending: false })
    .limit(12);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    ...(row as Deviation),
    control_type_name: row.control_types?.name,
    control_object_name: row.control_objects?.name,
  }));
}
