import { getTemperatureLimits } from './controlFieldRules';
import type { ControlFieldDefinition, ControlObject, ControlRunItem, ControlType } from '../types/database';

export const COLD_STORAGE_CONTROL_KEY = 'cold_storage_temperature';
export const COLD_STORAGE_RESPONSE_SCHEMA = 'cold_storage_v1';

export type ColdStorageNotApplicableReason = 'empty_and_off' | 'temporarily_out_of_service' | 'other';
export type ColdStorageFoodAction = 'none_affected' | 'moved' | 'discarded' | 'other';
export type ColdStorageUnitAction = 'adjusted' | 'switched_off' | 'service_contacted' | 'none_needed' | 'other';
export type ColdStorageFollowUpStatus = 'resolved' | 'open';

export type ColdStorageEntry = {
  temperature: string;
  notApplicable: boolean;
  notApplicableReason: ColdStorageNotApplicableReason | '';
  notApplicableNote: string;
  foodAction: ColdStorageFoodAction | '';
  unitAction: ColdStorageUnitAction | '';
  checkMeasurement: string;
  followUpStatus: ColdStorageFollowUpStatus | '';
  actionNote: string;
};

export type ColdStorageBinding = {
  key: string;
  object: ControlObject;
  field: ControlFieldDefinition;
};

export type ColdStorageResponse = {
  controlObjectId: string;
  fieldDefinitionId: string;
  value: string;
  deviationDetected: boolean;
  deviationReason: string | null;
  actionText: string | null;
  responseSchema: typeof COLD_STORAGE_RESPONSE_SCHEMA;
  status: 'ok' | 'deviation' | 'not_applicable';
  valueJson: Record<string, unknown>;
};

export type ColdStorageDraft = {
  schema: typeof COLD_STORAGE_RESPONSE_SCHEMA;
  definitionFingerprint: string;
  entries: Record<string, ColdStorageEntry>;
  updatedAt: string;
};

export type ColdStorageHistoryPresentation = {
  value: string;
  details: string[];
};

const notApplicableReasonLabels: Record<ColdStorageNotApplicableReason, string> = {
  empty_and_off: 'Tom och avstängd',
  temporarily_out_of_service: 'Tillfälligt ur bruk',
  other: 'Annan orsak',
};

const foodActionLabels: Record<ColdStorageFoodAction, string> = {
  none_affected: 'Inga varor påverkades',
  moved: 'Varorna flyttades',
  discarded: 'Varorna kasserades',
  other: 'Annan åtgärd',
};

const unitActionLabels: Record<ColdStorageUnitAction, string> = {
  adjusted: 'Enheten justerades',
  switched_off: 'Enheten stängdes av',
  service_contacted: 'Service kontaktades',
  none_needed: 'Ingen åtgärd behövdes',
  other: 'Annan åtgärd',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function createEmptyColdStorageEntry(): ColdStorageEntry {
  return {
    temperature: '',
    notApplicable: false,
    notApplicableReason: '',
    notApplicableNote: '',
    foodAction: '',
    unitAction: '',
    checkMeasurement: '',
    followUpStatus: '',
    actionNote: '',
  };
}

export function parseTemperatureInput(value: string): { normalized: string; value: number } | null {
  const normalizedInput = value.trim().replace(',', '.');
  if (!normalizedInput || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalizedInput)) return null;

  const parsed = Number(normalizedInput);
  if (!Number.isFinite(parsed)) return null;

  return {
    normalized: Object.is(parsed, -0) ? '0' : String(parsed),
    value: parsed,
  };
}

function selectTemperatureFieldForObject(
  object: ControlObject,
  fields: ControlFieldDefinition[],
): ControlFieldDefinition | null {
  const applicableFields = fields.filter((field) => (
    field.field_type === 'temperature'
    && (!field.control_object_id || field.control_object_id === object.id)
  ));
  return applicableFields.length === 1 ? applicableFields[0] : null;
}

export function getColdStorageBindings(definition: {
  controlType: ControlType;
  objects: ControlObject[];
  fields: ControlFieldDefinition[];
}): ColdStorageBinding[] {
  if (definition.controlType.control_key !== COLD_STORAGE_CONTROL_KEY || definition.objects.length === 0) return [];

  const bindings = definition.objects.map((object) => {
    const field = selectTemperatureFieldForObject(object, definition.fields);
    return field ? { key: `${object.id}:${field.id}`, object, field } : null;
  });

  return bindings.every((binding): binding is ColdStorageBinding => Boolean(binding)) ? bindings : [];
}

export function isColdStorageDefinition(definition: {
  controlType: ControlType;
  objects: ControlObject[];
  fields: ControlFieldDefinition[];
}): boolean {
  return getColdStorageBindings(definition).length === definition.objects.length && definition.objects.length > 0;
}

export function buildColdStorageDefinitionFingerprint(
  controlType: ControlType,
  bindings: ColdStorageBinding[],
): string {
  return JSON.stringify({
    controlKey: controlType.control_key,
    controlTypeId: controlType.id,
    controlTypeUpdatedAt: controlType.updated_at,
    bindings: bindings.map(({ object, field }) => ({
      fieldId: field.id,
      fieldUpdatedAt: field.updated_at,
      objectId: object.id,
      objectUpdatedAt: object.updated_at,
    })),
  });
}

export function buildColdStorageDraftKey(userId: string, organizationId: string, controlTypeId: string): string {
  return `egenkontroll:cold-storage-draft:${userId}:${organizationId}:${controlTypeId}`;
}

export function parseColdStorageDraft(value: string | null, definitionFingerprint: string): ColdStorageDraft | null {
  if (!value) return null;

  try {
    const draft = JSON.parse(value) as unknown;
    if (!isRecord(draft) || draft.schema !== COLD_STORAGE_RESPONSE_SCHEMA) return null;
    if (draft.definitionFingerprint !== definitionFingerprint || !isRecord(draft.entries)) return null;

    const entries: Record<string, ColdStorageEntry> = {};
    for (const [key, entry] of Object.entries(draft.entries)) {
      if (!isRecord(entry)) return null;

      const notApplicableReason = readString(entry.notApplicableReason);
      const foodAction = readString(entry.foodAction);
      const unitAction = readString(entry.unitAction);
      const followUpStatus = readString(entry.followUpStatus);
      if (notApplicableReason && !(notApplicableReason in notApplicableReasonLabels)) return null;
      if (foodAction && !(foodAction in foodActionLabels)) return null;
      if (unitAction && !(unitAction in unitActionLabels)) return null;
      if (followUpStatus && followUpStatus !== 'resolved' && followUpStatus !== 'open') return null;

      entries[key] = {
        temperature: readString(entry.temperature),
        notApplicable: entry.notApplicable === true,
        notApplicableReason: notApplicableReason as ColdStorageNotApplicableReason | '',
        notApplicableNote: readString(entry.notApplicableNote),
        foodAction: foodAction as ColdStorageFoodAction | '',
        unitAction: unitAction as ColdStorageUnitAction | '',
        checkMeasurement: readString(entry.checkMeasurement),
        followUpStatus: followUpStatus as ColdStorageFollowUpStatus | '',
        actionNote: readString(entry.actionNote),
      };
    }

    return {
      schema: COLD_STORAGE_RESPONSE_SCHEMA,
      definitionFingerprint,
      entries,
      updatedAt: readString(draft.updatedAt),
    };
  } catch {
    return null;
  }
}

export function getColdStorageEntryDeviation(
  binding: ColdStorageBinding,
  entry: ColdStorageEntry,
): boolean {
  if (entry.notApplicable) return false;
  const parsed = parseTemperatureInput(entry.temperature);
  if (!parsed) return false;

  const { limitMin, limitMax } = getTemperatureLimits(binding.field, binding.object);
  return (limitMin !== null && parsed.value < limitMin) || (limitMax !== null && parsed.value > limitMax);
}

export function getColdStorageEntryError(
  binding: ColdStorageBinding,
  entry: ColdStorageEntry,
): string | null {
  if (entry.notApplicable) {
    if (!entry.notApplicableReason) return 'Välj varför enheten inte är i drift.';
    if (entry.notApplicableReason === 'other' && !entry.notApplicableNote.trim()) {
      return 'Beskriv den andra orsaken.';
    }
    return null;
  }

  if (!entry.temperature.trim()) return 'Ange temperatur eller välj Ej i drift.';
  if (!parseTemperatureInput(entry.temperature)) return 'Ange en giltig temperatur.';

  if (!getColdStorageEntryDeviation(binding, entry)) return null;
  if (!entry.foodAction) return 'Välj hur varorna hanterades.';
  if (!entry.unitAction) return 'Välj vad som gjordes med enheten.';
  if (entry.checkMeasurement.trim() && !parseTemperatureInput(entry.checkMeasurement)) {
    return 'Kontrollmätningen måste vara en giltig temperatur.';
  }
  if (!entry.followUpStatus) return 'Välj om avvikelsen är löst eller behöver följas upp.';
  if ((entry.foodAction === 'other' || entry.unitAction === 'other') && !entry.actionNote.trim()) {
    return 'Beskriv den andra åtgärden.';
  }

  return null;
}

export function isColdStorageEntryComplete(binding: ColdStorageBinding, entry: ColdStorageEntry): boolean {
  return getColdStorageEntryError(binding, entry) === null;
}

export function buildColdStorageActionText(entry: ColdStorageEntry): string {
  if (!entry.foodAction || !entry.unitAction || !entry.followUpStatus) return '';

  const parts = [
    `Varor: ${foodActionLabels[entry.foodAction]}.`,
    `Enhet: ${unitActionLabels[entry.unitAction]}.`,
  ];
  const checkMeasurement = parseTemperatureInput(entry.checkMeasurement);
  if (checkMeasurement) parts.push(`Kontrollmätning: ${checkMeasurement.normalized} °C.`);
  parts.push(`Uppföljning: ${entry.followUpStatus === 'resolved' ? 'Löst' : 'Behöver följas upp'}.`);
  if (entry.actionNote.trim()) parts.push(`Komplettering: ${entry.actionNote.trim()}`);
  return parts.join(' ');
}

export function buildColdStorageResponse(
  binding: ColdStorageBinding,
  entry: ColdStorageEntry,
): ColdStorageResponse {
  if (entry.notApplicable) {
    return {
      controlObjectId: binding.object.id,
      fieldDefinitionId: binding.field.id,
      value: '',
      deviationDetected: false,
      deviationReason: null,
      actionText: null,
      responseSchema: COLD_STORAGE_RESPONSE_SCHEMA,
      status: 'not_applicable',
      valueJson: {
        schema: COLD_STORAGE_RESPONSE_SCHEMA,
        kind: 'not_applicable',
        reason: entry.notApplicableReason,
        note: entry.notApplicableNote.trim() || null,
      },
    };
  }

  const parsed = parseTemperatureInput(entry.temperature);
  if (!parsed) throw new Error('Temperaturen är inte giltig.');
  const deviationDetected = getColdStorageEntryDeviation(binding, entry);
  const checkMeasurement = parseTemperatureInput(entry.checkMeasurement);

  return {
    controlObjectId: binding.object.id,
    fieldDefinitionId: binding.field.id,
    value: parsed.normalized,
    deviationDetected,
    deviationReason: deviationDetected ? 'Värdet ligger utanför företagets åtgärdsgräns.' : null,
    actionText: deviationDetected ? buildColdStorageActionText(entry) : null,
    responseSchema: COLD_STORAGE_RESPONSE_SCHEMA,
    status: deviationDetected ? 'deviation' : 'ok',
    valueJson: deviationDetected ? {
      schema: COLD_STORAGE_RESPONSE_SCHEMA,
      kind: 'temperature_deviation',
      foodAction: entry.foodAction,
      unitAction: entry.unitAction,
      checkMeasurement: checkMeasurement?.value ?? null,
      followUpStatus: entry.followUpStatus,
      actionNote: entry.actionNote.trim() || null,
    } : {
      schema: COLD_STORAGE_RESPONSE_SCHEMA,
      kind: 'temperature',
    },
  };
}

export function buildColdStorageResultSummary(
  bindings: ColdStorageBinding[],
  entries: Record<string, ColdStorageEntry>,
): { hasOpenDeviation: boolean; text: string } {
  let approved = 0;
  let notApplicable = 0;
  let resolved = 0;
  let open = 0;

  for (const binding of bindings) {
    const entry = entries[binding.key] ?? createEmptyColdStorageEntry();
    if (entry.notApplicable) {
      notApplicable += 1;
    } else if (getColdStorageEntryDeviation(binding, entry)) {
      if (entry.followUpStatus === 'open') open += 1;
      if (entry.followUpStatus === 'resolved') resolved += 1;
    } else {
      approved += 1;
    }
  }

  const parts: string[] = [];
  if (approved === bindings.length) return { hasOpenDeviation: false, text: `Alla ${approved} kontrollpunkter godkända` };
  if (approved > 0) parts.push(`${approved} godkänd${approved === 1 ? '' : 'a'}`);
  if (notApplicable > 0) parts.push(`${notApplicable} ej i drift`);
  if (resolved > 0) {
    parts.push(resolved === 1 ? '1 avvikelse dokumenterad och löst' : `${resolved} avvikelser dokumenterade och lösta`);
  }
  if (open > 0) parts.push(open === 1 ? '1 avvikelse behöver följas upp' : `${open} avvikelser behöver följas upp`);

  return { hasOpenDeviation: open > 0, text: parts.join(' · ') };
}

function readKnownLabel<T extends string>(
  value: unknown,
  labels: Record<T, string>,
): string | null {
  const key = readString(value) as T;
  return key && key in labels ? labels[key] : null;
}

export function readColdStorageHistoryPresentation(item: Pick<ControlRunItem, 'status' | 'value_json'>): ColdStorageHistoryPresentation | null {
  const valueJson = item.value_json;
  if (!isRecord(valueJson) || valueJson.schema !== COLD_STORAGE_RESPONSE_SCHEMA) return null;

  if (item.status === 'not_applicable' && valueJson.kind === 'not_applicable') {
    const reason = readKnownLabel(valueJson.reason, notApplicableReasonLabels);
    const note = readString(valueJson.note);
    return {
      value: reason ? `Ej i drift · ${reason}` : 'Ej i drift',
      details: note ? [`Orsak: ${note}`] : [],
    };
  }

  if (valueJson.kind !== 'temperature_deviation') return null;
  const foodAction = readKnownLabel(valueJson.foodAction, foodActionLabels);
  const unitAction = readKnownLabel(valueJson.unitAction, unitActionLabels);
  const followUpStatus = valueJson.followUpStatus === 'resolved'
    ? 'Löst'
    : valueJson.followUpStatus === 'open'
      ? 'Behöver följas upp'
      : null;
  const checkMeasurement = typeof valueJson.checkMeasurement === 'number' && Number.isFinite(valueJson.checkMeasurement)
    ? String(valueJson.checkMeasurement).replace('.', ',')
    : null;
  const actionNote = readString(valueJson.actionNote);

  return {
    value: 'Temperaturavvikelse',
    details: [
      foodAction ? `Varor: ${foodAction}` : '',
      unitAction ? `Enhet: ${unitAction}` : '',
      checkMeasurement ? `Kontrollmätning: ${checkMeasurement} °C` : '',
      followUpStatus ? `Uppföljning: ${followUpStatus}` : '',
      actionNote ? `Komplettering: ${actionNote}` : '',
    ].filter(Boolean),
  };
}
