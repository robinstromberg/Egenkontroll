import { supabase } from '../lib/supabaseClient';
import type { ControlFrequency, ControlRunStatus, DeviationStatus } from '../types/database';

const defaultPeriodDays = 30;
const streakLookbackDays = 120;

type KpiControlType = {
  id: string;
  name: string;
  frequency: ControlFrequency;
  active: boolean;
};

type KpiRunRow = {
  id: string;
  control_type_id: string;
  status: ControlRunStatus;
  performed_at: string;
  control_types?: { name?: string | null } | null;
};

type KpiDeviationRow = {
  id: string;
  status: DeviationStatus;
  control_type_id: string | null;
  opened_at: string;
  resolved_at: string | null;
  control_types?: { name?: string | null } | null;
};

export type KpiRiskArea = {
  name: string;
  deviationCount: number;
};

export type KpiSummary = {
  periodDays: number;
  documentationDays: number;
  currentDocumentationStreak: number;
  longestDocumentationStreak: number;
  compliancePercent: number | null;
  completedControls: number;
  plannedControls: number;
  openDeviations: number;
  resolvedDeviations: number;
  totalDeviations: number;
  riskAreas: KpiRiskArea[];
};

function startOfLocalDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateKey(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function getDateKeys(start: Date, end: Date): string[] {
  const keys: string[] = [];
  for (let day = startOfLocalDay(start); day < end; day = addDays(day, 1)) {
    keys.push(toDateKey(day));
  }
  return keys;
}

function isPlannedFrequency(frequency: ControlFrequency): boolean {
  return frequency === 'daily' || frequency === 'weekly' || frequency === 'custom';
}

function countPlannedControls(controlTypes: KpiControlType[], periodDays: number): number {
  return controlTypes.reduce((sum, controlType) => {
    if (controlType.frequency === 'daily') return sum + periodDays;
    if (controlType.frequency === 'weekly') return sum + Math.ceil(periodDays / 7);
    if (controlType.frequency === 'custom') return sum + periodDays;
    return sum;
  }, 0);
}

function readDocumentationCoverage(
  runs: KpiRunRow[],
  controlTypes: KpiControlType[],
  periodStart: Date,
  periodEnd: Date,
) {
  const requiredDailyControlIds = controlTypes
    .filter((controlType) => controlType.frequency === 'daily')
    .map((controlType) => controlType.id);
  const periodKeys = getDateKeys(periodStart, periodEnd);
  const runControlIdsByDate = new Map<string, Set<string>>();

  for (const run of runs) {
    const dateKey = toDateKey(run.performed_at);
    const controlIds = runControlIdsByDate.get(dateKey) ?? new Set<string>();
    controlIds.add(run.control_type_id);
    runControlIdsByDate.set(dateKey, controlIds);
  }

  if (requiredDailyControlIds.length === 0) {
    return periodKeys.filter((dateKey) => (runControlIdsByDate.get(dateKey)?.size ?? 0) > 0).length;
  }

  return periodKeys.filter((dateKey) => {
    const controlIds = runControlIdsByDate.get(dateKey);
    return Boolean(controlIds && requiredDailyControlIds.every((controlTypeId) => controlIds.has(controlTypeId)));
  }).length;
}

function readDocumentationStreaks(runs: KpiRunRow[], controlTypes: KpiControlType[], lookbackStart: Date, today: Date) {
  const requiredDailyControlIds = controlTypes
    .filter((controlType) => controlType.frequency === 'daily')
    .map((controlType) => controlType.id);
  const lookbackKeys = getDateKeys(lookbackStart, addDays(today, 1));
  const runControlIdsByDate = new Map<string, Set<string>>();

  for (const run of runs) {
    const dateKey = toDateKey(run.performed_at);
    const controlIds = runControlIdsByDate.get(dateKey) ?? new Set<string>();
    controlIds.add(run.control_type_id);
    runControlIdsByDate.set(dateKey, controlIds);
  }

  const documentedKeys = new Set(lookbackKeys.filter((dateKey) => {
    const controlIds = runControlIdsByDate.get(dateKey);
    if (requiredDailyControlIds.length === 0) return (controlIds?.size ?? 0) > 0;
    return Boolean(controlIds && requiredDailyControlIds.every((controlTypeId) => controlIds.has(controlTypeId)));
  }));

  let currentDocumentationStreak = 0;
  for (let day = startOfLocalDay(today); day >= lookbackStart; day = addDays(day, -1)) {
    if (!documentedKeys.has(toDateKey(day))) break;
    currentDocumentationStreak += 1;
  }

  let longestDocumentationStreak = 0;
  let runningStreak = 0;
  for (const dateKey of lookbackKeys) {
    if (documentedKeys.has(dateKey)) {
      runningStreak += 1;
      longestDocumentationStreak = Math.max(longestDocumentationStreak, runningStreak);
    } else {
      runningStreak = 0;
    }
  }

  return { currentDocumentationStreak, longestDocumentationStreak };
}

function readRiskAreas(deviations: KpiDeviationRow[]): KpiRiskArea[] {
  const counts = new Map<string, number>();

  for (const deviation of deviations) {
    const name = deviation.control_types?.name ?? 'Okänd kontrolltyp';
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, deviationCount]) => ({ name, deviationCount }))
    .sort((a, b) => b.deviationCount - a.deviationCount || a.name.localeCompare(b.name, 'sv-SE'))
    .slice(0, 3);
}

export async function getKpiSummary(organizationId: string): Promise<KpiSummary> {
  const today = startOfLocalDay(new Date());
  const periodEnd = addDays(today, 1);
  const periodStart = addDays(periodEnd, -defaultPeriodDays);
  const lookbackStart = addDays(periodEnd, -streakLookbackDays);

  const [
    { data: controlTypes, error: controlTypesError },
    { data: periodRuns, error: periodRunsError },
    { data: lookbackRuns, error: lookbackRunsError },
    { data: periodDeviations, error: periodDeviationsError },
    { data: openDeviations, error: openDeviationsError },
    { data: resolvedDeviations, error: resolvedDeviationsError },
  ] = await Promise.all([
    supabase
      .from('control_types')
      .select('id, name, frequency, active')
      .eq('organization_id', organizationId)
      .eq('active', true),
    supabase
      .from('control_runs')
      .select('id, control_type_id, status, performed_at, control_types(name)')
      .eq('organization_id', organizationId)
      .gte('performed_at', periodStart.toISOString())
      .lt('performed_at', periodEnd.toISOString()),
    supabase
      .from('control_runs')
      .select('id, control_type_id, status, performed_at')
      .eq('organization_id', organizationId)
      .gte('performed_at', lookbackStart.toISOString())
      .lt('performed_at', periodEnd.toISOString()),
    supabase
      .from('deviations')
      .select('id, status, control_type_id, opened_at, resolved_at, control_types(name)')
      .eq('organization_id', organizationId)
      .gte('opened_at', periodStart.toISOString())
      .lt('opened_at', periodEnd.toISOString()),
    supabase
      .from('deviations')
      .select('id, status, control_type_id, opened_at, resolved_at, control_types(name)')
      .eq('organization_id', organizationId)
      .eq('status', 'open'),
    supabase
      .from('deviations')
      .select('id, status, control_type_id, opened_at, resolved_at, control_types(name)')
      .eq('organization_id', organizationId)
      .eq('status', 'resolved')
      .gte('resolved_at', periodStart.toISOString())
      .lt('resolved_at', periodEnd.toISOString()),
  ]);

  if (controlTypesError) throw controlTypesError;
  if (periodRunsError) throw periodRunsError;
  if (lookbackRunsError) throw lookbackRunsError;
  if (periodDeviationsError) throw periodDeviationsError;
  if (openDeviationsError) throw openDeviationsError;
  if (resolvedDeviationsError) throw resolvedDeviationsError;

  const activeControlTypes = (controlTypes ?? []) as KpiControlType[];
  const plannedControlTypes = activeControlTypes.filter((controlType) => isPlannedFrequency(controlType.frequency));
  const periodRunRows = (periodRuns ?? []) as KpiRunRow[];
  const lookbackRunRows = (lookbackRuns ?? []) as KpiRunRow[];
  const periodDeviationRows = (periodDeviations ?? []) as KpiDeviationRow[];
  const openDeviationRows = (openDeviations ?? []) as KpiDeviationRow[];
  const resolvedDeviationRows = (resolvedDeviations ?? []) as KpiDeviationRow[];
  const plannedControls = countPlannedControls(plannedControlTypes, defaultPeriodDays);
  const completedControls = periodRunRows.length;
  const compliancePercent = plannedControls > 0
    ? Math.min(100, Math.round((completedControls / plannedControls) * 100))
    : null;
  const totalDeviations = openDeviationRows.length + resolvedDeviationRows.length;

  return {
    periodDays: defaultPeriodDays,
    documentationDays: readDocumentationCoverage(periodRunRows, activeControlTypes, periodStart, periodEnd),
    ...readDocumentationStreaks(lookbackRunRows, activeControlTypes, lookbackStart, today),
    compliancePercent,
    completedControls,
    plannedControls,
    openDeviations: openDeviationRows.length,
    resolvedDeviations: resolvedDeviationRows.length,
    totalDeviations,
    riskAreas: readRiskAreas(periodDeviationRows),
  };
}
