import type {
  ControlFieldDefinition,
  ControlObject,
  ControlRunItemStatus,
  ControlType,
  DeviationStatus,
} from '../types/database';
import { parseTemperatureInput } from './controlFieldRules';

export const COLD_STORAGE_CONTROL_KEY = 'cold_storage_temperature';
export const COLD_STORAGE_VALUE_SCHEMA = 'cold_storage_v1';
export const COLD_STORAGE_DEVIATION_REASON = 'Värdet ligger utanför företagets åtgärdsgräns.';

export type ColdStorageNotApplicableReason =
  | 'empty_powered_off'
  | 'temporarily_out_of_service'
  | 'other';

export type ColdStorageGoodsAction = 'unaffected' | 'moved' | 'discarded' | 'other';
export type ColdStorageEquipmentAction = 'adjusted' | 'shut_down' | 'service_contacted' | 'no_action_needed' | 'other';
export type ColdStorageResolution = 'resolved' | 'follow_up';

export type ColdStorageUnitState = {
  notApplicable: boolean;
  notApplicableReason: ColdStorageNotApplicableReason | '';
  notApplicableNote: string;
  goodsAction: ColdStorageGoodsAction | '';
  equipmentAction: ColdStorageEquipmentAction | '';
  recheckTemperature: string;
  resolution: ColdStorageResolution | '';
  note: string;
};

export type ColdStorageUnitStateMap = Record<string, ColdStorageUnitState>;

export type ColdStorageResponseData = {
  value: string;
  status: ControlRunItemStatus;
  valueJson: Record<string, unknown>;
  deviationDetected: boolean;
  deviationReason: string | null;
  actionText: string | null;
  deviationStatus: DeviationStatus | null;
};

export type ColdStorageOutcome = Pick<
  ColdStorageResponseData,
  'status' | 'deviationDetected' | 'deviationStatus'
>;

export type ColdStorageDraft = {
  version: 1;
  definitionFingerprint: string;
  responses: Record<string, string>;
  actions: Record<string, string>;
  units: ColdStorageUnitStateMap;
  updatedAt: string;
};

export type ColdStorageDraftInput = Omit<ColdStorageDraft, 'version' | 'updatedAt'>;

const notApplicableLabels: Record<ColdStorageNotApplicableReason, string> = {
  empty_powered_off: 'Tom och avstängd',
  temporarily_out_of_service: 'Tillfälligt ur bruk',
  other: 'Annan orsak',
};

const goodsActionLabels: Record<ColdStorageGoodsAction, string> = {
  unaffected: 'Inga varor påverkades',
  moved: 'Varorna flyttades',
  discarded: 'Varorna kasserades',
  other: 'Annan åtgärd för varorna',
};

const equipmentActionLabels: Record<ColdStorageEquipmentAction, string> = {
  adjusted: 'Enheten justerades',
  shut_down: 'Enheten stängdes av',
  service_contacted: 'Service kontaktades',
  no_action_needed: 'Ingen åtgärd behövdes',
  other: 'Annan åtgärd för enheten',
};

export function createEmptyColdStorageUnitState(): ColdStorageUnitState {
  return {
    notApplicable: false,
    notApplicableReason: '',
    notApplicableNote: '',
    goodsAction: '',
    equipmentAction: '',
    recheckTemperature: '',
    resolution: '',
    note: '',
  };
}

export function isColdStorageControlType(controlType: ControlType): boolean {
  return controlType.control_key === COLD_STORAGE_CONTROL_KEY;
}

export function getColdStorageTemperatureField(
  fields: ControlFieldDefinition[],
  object: ControlObject,
): ControlFieldDefinition | null {
  return fields.find((field) => field.active && field.field_type === 'temperature' && field.control_object_id === object.id)
    ?? fields.find((field) => field.active && field.field_type === 'temperature' && !field.control_object_id)
    ?? null;
}

export function getColdStorageDefinitionFingerprint(
  controlType: ControlType,
  objects: ControlObject[],
  fields: ControlFieldDefinition[],
): string {
  return JSON.stringify({
    controlType: [controlType.id, controlType.control_key, controlType.updated_at],
    objects: objects.map((object) => [object.id, object.updated_at, object.active]),
    fields: fields.map((field) => [field.id, field.control_object_id, field.updated_at, field.active]),
  });
}

export function validateColdStorageUnit(
  value: string,
  state: ColdStorageUnitState,
  hasDeviation: boolean,
): string | null {
  if (state.notApplicable) {
    if (!state.notApplicableReason) return 'Välj varför enheten inte är i drift.';
    if (state.notApplicableReason === 'other' && !state.notApplicableNote.trim()) {
      return 'Beskriv varför enheten inte är i drift.';
    }
    return null;
  }

  const parsed = parseTemperatureInput(value);
  if (parsed.status === 'empty') return 'Ange temperatur eller markera Ej i drift.';
  if (parsed.status === 'invalid') return 'Ange en giltig temperatur, till exempel 4,2 eller −18.';

  if (!hasDeviation) return null;
  if (!state.goodsAction) return 'Välj hur varorna hanterades.';
  if (!state.equipmentAction) return 'Välj vad som gjordes med enheten.';
  if (!state.resolution) return 'Välj om avvikelsen är löst eller behöver följas upp.';
  if ((state.goodsAction === 'other' || state.equipmentAction === 'other') && !state.note.trim()) {
    return 'Beskriv den andra åtgärden.';
  }

  if (state.recheckTemperature.trim() && parseTemperatureInput(state.recheckTemperature).status !== 'valid') {
    return 'Kontrollmätningen måste vara en giltig temperatur.';
  }

  return null;
}

export function buildColdStorageResponse(
  value: string,
  state: ColdStorageUnitState,
  hasDeviation: boolean,
): ColdStorageResponseData {
  if (state.notApplicable && state.notApplicableReason) {
    return {
      value: '',
      status: 'not_applicable',
      valueJson: {
        schema: COLD_STORAGE_VALUE_SCHEMA,
        notApplicable: {
          reasonCode: state.notApplicableReason,
          reasonLabel: notApplicableLabels[state.notApplicableReason],
          note: state.notApplicableNote.trim() || null,
        },
      },
      deviationDetected: false,
      deviationReason: null,
      actionText: null,
      deviationStatus: null,
    };
  }

  const parsed = parseTemperatureInput(value);
  const normalizedValue = parsed.status === 'valid' ? parsed.normalized : value;
  if (!hasDeviation) {
    return {
      value: normalizedValue,
      status: 'ok',
      valueJson: { schema: COLD_STORAGE_VALUE_SCHEMA },
      deviationDetected: false,
      deviationReason: null,
      actionText: null,
      deviationStatus: null,
    };
  }

  const recheck = parseTemperatureInput(state.recheckTemperature);
  const actionParts = [
    state.goodsAction ? `Varor: ${goodsActionLabels[state.goodsAction]}` : null,
    state.equipmentAction ? `Enhet: ${equipmentActionLabels[state.equipmentAction]}` : null,
    recheck.status === 'valid' ? `Kontrollmätning: ${recheck.normalized} °C` : null,
    state.note.trim() ? `Komplettering: ${state.note.trim()}` : null,
    state.resolution === 'resolved'
      ? 'Status: Löst'
      : state.resolution === 'follow_up'
        ? 'Status: Behöver följas upp'
        : null,
  ].filter((part): part is string => Boolean(part));

  return {
    value: normalizedValue,
    status: 'deviation',
    valueJson: {
      schema: COLD_STORAGE_VALUE_SCHEMA,
      deviation: {
        goodsActionCode: state.goodsAction,
        goodsActionLabel: state.goodsAction ? goodsActionLabels[state.goodsAction] : null,
        equipmentActionCode: state.equipmentAction,
        equipmentActionLabel: state.equipmentAction ? equipmentActionLabels[state.equipmentAction] : null,
        recheckTemperature: recheck.status === 'valid' ? recheck.value : null,
        resolution: state.resolution,
        note: state.note.trim() || null,
      },
    },
    deviationDetected: true,
    deviationReason: COLD_STORAGE_DEVIATION_REASON,
    actionText: actionParts.join(' · '),
    deviationStatus: state.resolution === 'resolved'
      ? 'resolved'
      : state.resolution === 'follow_up'
        ? 'open'
        : null,
  };
}

export function summarizeColdStorageOutcomes(outcomes: ColdStorageOutcome[]): string {
  const approved = outcomes.filter((outcome) => outcome.status === 'ok').length;
  const notApplicable = outcomes.filter((outcome) => outcome.status === 'not_applicable').length;
  const resolved = outcomes.filter((outcome) => outcome.deviationDetected && outcome.deviationStatus === 'resolved').length;
  const open = outcomes.filter((outcome) => outcome.deviationDetected && outcome.deviationStatus === 'open').length;

  if (approved === outcomes.length && outcomes.length > 0) {
    return `Alla ${approved} kontrollpunkter godkända`;
  }

  const parts = [
    approved ? `${approved} ${approved === 1 ? 'godkänd' : 'godkända'}` : null,
    notApplicable ? `${notApplicable} ej i drift` : null,
    resolved ? `${resolved} ${resolved === 1 ? 'avvikelse dokumenterad och löst' : 'avvikelser dokumenterade och lösta'}` : null,
    open ? `${open} ${open === 1 ? 'avvikelse behöver' : 'avvikelser behöver'} följas upp` : null,
  ].filter((part): part is string => Boolean(part));

  return parts.join(' · ');
}

export function getColdStorageDraftKey(organizationId: string, controlTypeId: string, userId: string): string {
  return `egenkontroll:cold-storage-draft:${organizationId}:${controlTypeId}:${userId}`;
}

export function hasColdStorageDraftData(input: Pick<ColdStorageDraftInput, 'responses' | 'actions' | 'units'>): boolean {
  if (Object.values(input.responses).some((value) => value.trim())) return true;
  if (Object.values(input.actions).some((value) => value.trim())) return true;

  return Object.values(input.units).some((unit) => (
    unit.notApplicable
    || Boolean(unit.notApplicableReason)
    || Boolean(unit.notApplicableNote.trim())
    || Boolean(unit.goodsAction)
    || Boolean(unit.equipmentAction)
    || Boolean(unit.recheckTemperature.trim())
    || Boolean(unit.resolution)
    || Boolean(unit.note.trim())
  ));
}

export function filterColdStorageDraftResponses(
  responses: Record<string, string>,
  fields: ControlFieldDefinition[],
): Record<string, string> {
  const fileFieldIds = new Set(
    fields.filter((field) => field.field_type === 'photo').map((field) => field.id),
  );

  return Object.fromEntries(Object.entries(responses).filter(([key]) => {
    const fieldId = key.slice(key.lastIndexOf(':') + 1);
    return !fileFieldIds.has(fieldId);
  }));
}

export function writeColdStorageDraft(storage: Storage, key: string, input: ColdStorageDraftInput): boolean {
  try {
    if (!hasColdStorageDraftData(input)) {
      storage.removeItem(key);
      return true;
    }

    const draft: ColdStorageDraft = {
      ...input,
      version: 1,
      updatedAt: new Date().toISOString(),
    };
    storage.setItem(key, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function readColdStorageDraft(
  storage: Storage,
  key: string,
  definitionFingerprint: string,
): ColdStorageDraft | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ColdStorageDraft>;
    if (
      parsed.version !== 1
      || parsed.definitionFingerprint !== definitionFingerprint
      || !parsed.responses
      || !parsed.actions
      || !parsed.units
    ) {
      return null;
    }
    return parsed as ColdStorageDraft;
  } catch {
    return null;
  }
}

export function clearColdStorageDraft(storage: Storage, key: string): void {
  try {
    storage.removeItem(key);
  } catch {
    // A failed local cleanup must not turn a confirmed server save into an error.
  }
}
