import { supabase } from '../lib/supabaseClient';
import type { ControlFrequency, ControlRunStatus, DeviationStatus } from '../types/database';
import { readWeeklyWeekday, toIsoWeekday } from './scheduleService';

const defaultPeriodDays = 30;
const streakLookbackDays = 120;
const analysisPeriodDays = 180;

type KpiControlType = {
  id: string;
  name: string;
  frequency: ControlFrequency;
  frequency_config: Record<string, unknown>;
  active: boolean;
};

type KpiRunRow = {
  id: string;
  control_type_id: string;
  status: ControlRunStatus;
  performed_at: string;
  control_types?: { name?: string | null; category?: string | null } | null;
};

type KpiDeviationRow = {
  id: string;
  status: DeviationStatus;
  control_type_id: string | null;
  opened_at: string;
  resolved_at: string | null;
  control_types?: { name?: string | null } | null;
};

type KpiOrganizationRow = {
  created_at: string;
};

export type KpiRiskArea = {
  name: string;
  deviationCount: number;
};

export type KpiSummary = {
  periodDays: number;
  countedDays: number;
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

type KpiRunItemRow = {
  id: string;
  control_run_id: string;
  object_snapshot: Record<string, unknown>;
  field_snapshot: Record<string, unknown>;
  value_text: string | null;
  value_number: number | null;
  status: string;
  deviation_detected: boolean;
  created_at: string;
};

export type KpiTrendPoint = {
  date: string;
  label: string;
  value: number;
};

export type KpiTemperatureUnitTrend = {
  unitName: string;
  unitType: string | null;
  unit: string;
  limitMin: number | null;
  limitMax: number | null;
  readings: KpiTrendPoint[];
  min: number;
  max: number;
  average: number;
  deviationCount: number;
  stabilityLabel: string;
};

export type KpiDeliverySupplierTrend = {
  supplierName: string;
  deliveries: number;
  temperatureReadings: KpiTrendPoint[];
  min: number | null;
  max: number | null;
  average: number | null;
  temperatureDeviationCount: number;
  trendLabel: string;
};

export type KpiDeviationTrend = {
  periodKey: string;
  label: string;
  opened: number;
  resolved: number;
};

export type KpiDeviationArea = {
  controlTypeName: string;
  opened: number;
  resolved: number;
  trends: KpiDeviationTrend[];
};

export type KpiAnalysis = {
  periodDays: number;
  temperatureUnits: KpiTemperatureUnitTrend[];
  deliverySuppliers: KpiDeliverySupplierTrend[];
  deviationTrends: KpiDeviationTrend[];
  deviationAreas: KpiDeviationArea[];
  resolvedDeviationShare: number | null;
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

function maxDate(a: Date, b: Date): Date {
  return a > b ? a : b;
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

function countWeekdayOccurrences(start: Date, end: Date, weekday: number): number {
  return getDateKeys(start, end).filter((dateKey) => (
    toIsoWeekday(new Date(`${dateKey}T00:00:00`)) === weekday
  )).length;
}

function countPlannedControls(controlTypes: KpiControlType[], periodStart: Date, periodEnd: Date): number {
  const periodDays = getDateKeys(periodStart, periodEnd).length;

  return controlTypes.reduce((sum, controlType) => {
    if (controlType.frequency === 'daily') return sum + periodDays;
    if (controlType.frequency === 'weekly') {
      return sum + countWeekdayOccurrences(periodStart, periodEnd, readWeeklyWeekday(controlType.frequency_config));
    }
    if (controlType.frequency === 'custom') return sum + periodDays;
    return sum;
  }, 0);
}

function isRunScheduledForControlType(run: KpiRunRow, controlTypeById: Map<string, KpiControlType>): boolean {
  const controlType = controlTypeById.get(run.control_type_id);
  if (!controlType) return false;
  if (controlType.frequency === 'weekly') {
    return readWeeklyWeekday(controlType.frequency_config) === toIsoWeekday(new Date(run.performed_at));
  }

  return isPlannedFrequency(controlType.frequency);
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

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readFieldKey(item: KpiRunItemRow): string {
  return readString(item.field_snapshot.field_key)?.toLowerCase() ?? '';
}

function readFieldType(item: KpiRunItemRow): string {
  return readString(item.field_snapshot.field_type)?.toLowerCase() ?? '';
}

function readObjectName(item: KpiRunItemRow): string {
  return readString(item.object_snapshot.name)
    ?? readString(item.field_snapshot.label)
    ?? 'Kontrollpunkt';
}

function readRunLabel(value: string): string {
  const date = new Date(value);
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function roundOne(value: number): number {
  return Math.round(value * 10) / 10;
}

function readStabilityLabel(values: number[]): string {
  if (values.length < 3) return 'Mer data behövs';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min;
  if (spread <= 1.5) return 'Stabil';
  if (spread <= 4) return 'Varierar lite';
  return 'Ojämn trend';
}

function readTrendLabel(points: KpiTrendPoint[]): string {
  if (points.length < 2) return 'Mer data behövs';
  const first = points[0].value;
  const last = points[points.length - 1].value;
  const diff = roundOne(last - first);
  if (Math.abs(diff) < 0.5) return 'Stabil';
  return diff > 0 ? 'Stigande' : 'Sjunkande';
}

function getWeekKey(value: string): string {
  const date = startOfLocalDay(new Date(value));
  const weekStart = addDays(date, -((date.getDay() + 6) % 7));
  return toDateKey(weekStart);
}

function formatWeekLabel(weekKey: string): string {
  const date = new Date(`${weekKey}T00:00:00`);
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export async function getKpiSummary(organizationId: string): Promise<KpiSummary> {
  const today = startOfLocalDay(new Date());
  const periodEnd = addDays(today, 1);
  const periodStart = addDays(periodEnd, -defaultPeriodDays);
  const lookbackStart = addDays(periodEnd, -streakLookbackDays);

  const [
    { data: organization, error: organizationError },
    { data: controlTypes, error: controlTypesError },
    { data: periodRuns, error: periodRunsError },
    { data: lookbackRuns, error: lookbackRunsError },
    { data: periodDeviations, error: periodDeviationsError },
    { data: openDeviations, error: openDeviationsError },
    { data: resolvedDeviations, error: resolvedDeviationsError },
  ] = await Promise.all([
    supabase
      .from('organizations')
      .select('created_at')
      .eq('id', organizationId)
      .single(),
    supabase
      .from('control_types')
      .select('id, name, frequency, frequency_config, active')
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

  if (organizationError) throw organizationError;
  if (controlTypesError) throw controlTypesError;
  if (periodRunsError) throw periodRunsError;
  if (lookbackRunsError) throw lookbackRunsError;
  if (periodDeviationsError) throw periodDeviationsError;
  if (openDeviationsError) throw openDeviationsError;
  if (resolvedDeviationsError) throw resolvedDeviationsError;

  const organizationCreatedAt = startOfLocalDay(new Date(((organization as KpiOrganizationRow).created_at)));
  const countedPeriodStart = maxDate(periodStart, organizationCreatedAt);
  const countedDays = Math.max(1, getDateKeys(countedPeriodStart, periodEnd).length);
  const activeControlTypes = (controlTypes ?? []) as KpiControlType[];
  const plannedControlTypes = activeControlTypes.filter((controlType) => isPlannedFrequency(controlType.frequency));
  const plannedControlTypeById = new Map(plannedControlTypes.map((controlType) => [controlType.id, controlType]));
  const periodRunRows = ((periodRuns ?? []) as KpiRunRow[])
    .filter((run) => new Date(run.performed_at) >= countedPeriodStart);
  const lookbackRunRows = (lookbackRuns ?? []) as KpiRunRow[];
  const periodDeviationRows = ((periodDeviations ?? []) as KpiDeviationRow[])
    .filter((deviation) => new Date(deviation.opened_at) >= countedPeriodStart);
  const openDeviationRows = (openDeviations ?? []) as KpiDeviationRow[];
  const resolvedDeviationRows = (resolvedDeviations ?? []) as KpiDeviationRow[];
  const plannedControls = countPlannedControls(plannedControlTypes, countedPeriodStart, periodEnd);
  const completedPlannedControls = periodRunRows
    .filter((run) => isRunScheduledForControlType(run, plannedControlTypeById)).length;
  const completedControls = periodRunRows.length;
  const compliancePercent = plannedControls > 0
    ? Math.min(100, Math.round((completedPlannedControls / plannedControls) * 100))
    : null;
  const totalDeviations = openDeviationRows.length + resolvedDeviationRows.length;

  return {
    periodDays: defaultPeriodDays,
    countedDays,
    documentationDays: readDocumentationCoverage(periodRunRows, activeControlTypes, countedPeriodStart, periodEnd),
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

export async function getKpiAnalysis(organizationId: string): Promise<KpiAnalysis> {
  const today = startOfLocalDay(new Date());
  const periodEnd = addDays(today, 1);
  const periodStart = addDays(periodEnd, -analysisPeriodDays);

  const [
    { data: runs, error: runsError },
    { data: deviations, error: deviationsError },
  ] = await Promise.all([
    supabase
      .from('control_runs')
      .select('id, control_type_id, status, performed_at, control_types(name, category)')
      .eq('organization_id', organizationId)
      .gte('performed_at', periodStart.toISOString())
      .lt('performed_at', periodEnd.toISOString())
      .order('performed_at', { ascending: true })
      .limit(600),
    supabase
      .from('deviations')
      .select('id, status, control_type_id, opened_at, resolved_at, control_types(name, category)')
      .eq('organization_id', organizationId)
      .gte('opened_at', periodStart.toISOString())
      .lt('opened_at', periodEnd.toISOString())
      .order('opened_at', { ascending: true })
      .limit(600),
  ]);

  if (runsError) throw runsError;
  if (deviationsError) throw deviationsError;

  const runRows = (runs ?? []) as KpiRunRow[];
  const runIds = runRows.map((run) => run.id);
  const runById = new Map(runRows.map((run) => [run.id, run]));
  const itemRows: KpiRunItemRow[] = [];

  if (runIds.length > 0) {
    const { data: items, error: itemsError } = await supabase
      .from('control_run_items')
      .select('id, control_run_id, object_snapshot, field_snapshot, value_text, value_number, status, deviation_detected, created_at')
      .eq('organization_id', organizationId)
      .in('control_run_id', runIds)
      .order('created_at', { ascending: true })
      .limit(1200);

    if (itemsError) throw itemsError;
    itemRows.push(...((items ?? []) as KpiRunItemRow[]));
  }

  const temperatureByUnit = new Map<string, KpiTemperatureUnitTrend>();
  const supplierByRunId = new Map<string, string>();
  const deliveriesBySupplier = new Map<string, KpiDeliverySupplierTrend>();

  for (const item of itemRows) {
    const fieldKey = readFieldKey(item);
    const fieldLabel = readString(item.field_snapshot.label)?.toLowerCase() ?? '';
    if (fieldKey === 'supplier' || fieldLabel === 'leverantör') {
      supplierByRunId.set(item.control_run_id, item.value_text?.trim() || 'Okänd leverantör');
    }
  }

  for (const run of runRows) {
    if (run.control_types?.category === 'receiving') {
      const supplierName = supplierByRunId.get(run.id) ?? 'Okänd leverantör';
      if (!deliveriesBySupplier.has(supplierName)) {
        deliveriesBySupplier.set(supplierName, {
          supplierName,
          deliveries: 0,
          temperatureReadings: [],
          min: null,
          max: null,
          average: null,
          temperatureDeviationCount: 0,
          trendLabel: 'Mer data behövs',
        });
      }
      const supplierTrend = deliveriesBySupplier.get(supplierName);
      if (supplierTrend) supplierTrend.deliveries += 1;
    }
  }

  for (const item of itemRows) {
    if (readFieldType(item) !== 'temperature' || item.value_number === null) continue;

    const run = runById.get(item.control_run_id);
    if (!run) continue;

    const point = {
      date: run.performed_at,
      label: readRunLabel(run.performed_at),
      value: Number(item.value_number),
    };

    if (run.control_types?.category === 'receiving') {
      const supplierName = supplierByRunId.get(run.id) ?? 'Okänd leverantör';
      const supplierTrend = deliveriesBySupplier.get(supplierName);
      if (supplierTrend) {
        supplierTrend.temperatureReadings.push(point);
        if (item.deviation_detected) supplierTrend.temperatureDeviationCount += 1;
      }
      continue;
    }

    const unitName = readObjectName(item);
    const existing = temperatureByUnit.get(unitName) ?? {
      unitName,
      unitType: readString(item.object_snapshot.object_type),
      unit: readString(item.object_snapshot.unit) ?? '°C',
      limitMin: readNumber(item.object_snapshot.limit_min),
      limitMax: readNumber(item.object_snapshot.limit_max),
      readings: [],
      min: Number(item.value_number),
      max: Number(item.value_number),
      average: Number(item.value_number),
      deviationCount: 0,
      stabilityLabel: 'Mer data behövs',
    };

    existing.readings.push(point);
    if (item.deviation_detected) existing.deviationCount += 1;
    temperatureByUnit.set(unitName, existing);
  }

  const temperatureUnits = [...temperatureByUnit.values()].map((unit) => {
    const values = unit.readings.map((point) => point.value);
    return {
      ...unit,
      readings: unit.readings.sort((a, b) => a.date.localeCompare(b.date)).slice(-40),
      min: roundOne(Math.min(...values)),
      max: roundOne(Math.max(...values)),
      average: roundOne(average(values) ?? 0),
      stabilityLabel: readStabilityLabel(values),
    };
  }).sort((a, b) => a.unitName.localeCompare(b.unitName, 'sv-SE'));

  const deliverySuppliers = [...deliveriesBySupplier.values()].map((supplier) => {
    const readings = supplier.temperatureReadings.sort((a, b) => a.date.localeCompare(b.date));
    const values = readings.map((point) => point.value);
    const averageValue = average(values);
    return {
      ...supplier,
      temperatureReadings: readings.slice(-40),
      min: values.length ? roundOne(Math.min(...values)) : null,
      max: values.length ? roundOne(Math.max(...values)) : null,
      average: averageValue === null ? null : roundOne(averageValue),
      trendLabel: readTrendLabel(readings),
    };
  }).sort((a, b) => b.temperatureDeviationCount - a.temperatureDeviationCount || b.deliveries - a.deliveries);

  const deviationRows = (deviations ?? []) as KpiDeviationRow[];
  const weekKeys = getDateKeys(addDays(periodEnd, -84), periodEnd)
    .filter((_, index) => index % 7 === 0)
    .map((dateKey) => getWeekKey(dateKey));
  const uniqueWeekKeys = [...new Set(weekKeys)].slice(-12);
  const trendByWeek = new Map(uniqueWeekKeys.map((weekKey) => [
    weekKey,
    { periodKey: weekKey, label: formatWeekLabel(weekKey), opened: 0, resolved: 0 },
  ]));
  const areaByControlType = new Map<string, KpiDeviationArea>();

  for (const deviation of deviationRows) {
    const openedWeek = trendByWeek.get(getWeekKey(deviation.opened_at));
    if (openedWeek) openedWeek.opened += 1;

    if (deviation.resolved_at) {
      const resolvedWeek = trendByWeek.get(getWeekKey(deviation.resolved_at));
      if (resolvedWeek) resolvedWeek.resolved += 1;
    }

    const controlTypeName = deviation.control_types?.name ?? 'Okänd kontrolltyp';
    const area = areaByControlType.get(controlTypeName) ?? {
      controlTypeName,
      opened: 0,
      resolved: 0,
      trends: uniqueWeekKeys.map((weekKey) => ({
        periodKey: weekKey,
        label: formatWeekLabel(weekKey),
        opened: 0,
        resolved: 0,
      })),
    };
    area.opened += 1;
    const areaOpenedWeek = area.trends.find((trend) => trend.periodKey === getWeekKey(deviation.opened_at));
    if (areaOpenedWeek) areaOpenedWeek.opened += 1;
    if (deviation.status === 'resolved') {
      area.resolved += 1;
      const resolvedAt = deviation.resolved_at;
      if (resolvedAt) {
        const areaResolvedWeek = area.trends.find((trend) => trend.periodKey === getWeekKey(resolvedAt));
        if (areaResolvedWeek) areaResolvedWeek.resolved += 1;
      }
    }
    areaByControlType.set(controlTypeName, area);
  }

  const resolvedDeviationCount = deviationRows.filter((deviation) => deviation.status === 'resolved').length;

  return {
    periodDays: analysisPeriodDays,
    temperatureUnits,
    deliverySuppliers,
    deviationTrends: [...trendByWeek.values()],
    deviationAreas: [...areaByControlType.values()]
      .sort((a, b) => b.opened - a.opened || a.controlTypeName.localeCompare(b.controlTypeName, 'sv-SE'))
      .slice(0, 8),
    resolvedDeviationShare: deviationRows.length
      ? Math.round((resolvedDeviationCount / deviationRows.length) * 100)
      : null,
  };
}
