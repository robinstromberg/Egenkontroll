import { supabase } from '../lib/supabaseClient';
import { uploadControlAttachment, type UploadedControlAttachment } from './attachmentService';
import { COLD_STORAGE_CONTROL_KEY } from './coldStorageControl';
import type {
  ControlFieldDefinition,
  ControlObject,
  ControlRun,
  ControlRunItemStatus,
  ControlType,
  DeviationStatus,
} from '../types/database';

export type ControlRunDefinition = {
  controlType: ControlType;
  objects: ControlObject[];
  fields: ControlFieldDefinition[];
};

export type ControlResponse = {
  controlObjectId: string | null;
  fieldDefinitionId: string;
  value: string;
  file?: File | null;
  deviationDetected: boolean;
  deviationReason: string | null;
  actionText: string | null;
  status?: ControlRunItemStatus;
  valueJson?: Record<string, unknown>;
  deviationStatus?: DeviationStatus | null;
};

export type SavedResponseOutcome = {
  controlObjectId: string | null;
  fieldDefinitionId: string;
  status: ControlRunItemStatus;
  deviationDetected: boolean;
  deviationStatus: DeviationStatus | null;
};

export type SavedControlRun = ControlRun & {
  responseOutcomes: SavedResponseOutcome[] | null;
};

type TransactionalControlResponse = {
  controlRunItemId: string;
  controlObjectId: string | null;
  fieldDefinitionId: string;
  value: string;
  deviationDetected: boolean;
  deviationReason: string | null;
  actionText: string | null;
  status?: ControlRunItemStatus;
  valueJson?: Record<string, unknown>;
  deviationStatus?: DeviationStatus | null;
};

function createUuid(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  throw new Error('Kunde inte skapa id for kontrollen.');
}

export async function getControlRunDefinition(
  organizationId: string,
  controlTypeId: string,
): Promise<ControlRunDefinition> {
  const { data: controlType, error: controlTypeError } = await supabase
    .from('control_types')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('id', controlTypeId)
    .single();

  if (controlTypeError) throw controlTypeError;

  const [{ data: objects, error: objectsError }, { data: fields, error: fieldsError }] = await Promise.all([
    supabase
      .from('control_objects')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('control_type_id', controlTypeId)
      .eq('active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('control_field_definitions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('control_type_id', controlTypeId)
      .eq('active', true)
      .order('sort_order', { ascending: true }),
  ]);

  if (objectsError) throw objectsError;
  if (fieldsError) throw fieldsError;

  return {
    controlType: controlType as ControlType,
    objects: (objects ?? []) as ControlObject[],
    fields: (fields ?? []) as ControlFieldDefinition[],
  };
}

export async function saveControlRun(
  organizationId: string,
  controlTypeId: string,
  performedBy: string,
  definition: ControlRunDefinition,
  responses: ControlResponse[],
): Promise<SavedControlRun> {
  void performedBy;

  const controlRunId = createUuid();
  const transactionalResponses: TransactionalControlResponse[] = [];
  const uploadedAttachments: UploadedControlAttachment[] = [];

  for (const response of responses) {
    const field = definition.fields.find((item) => item.id === response.fieldDefinitionId);

    if (!field) continue;

    const controlRunItemId = createUuid();

    transactionalResponses.push({
      controlRunItemId,
      controlObjectId: response.controlObjectId,
      fieldDefinitionId: field.id,
      value: response.value,
      deviationDetected: response.deviationDetected,
      deviationReason: response.deviationReason,
      actionText: response.actionText,
      status: response.status,
      valueJson: response.valueJson,
      deviationStatus: response.deviationStatus,
    });

    if (response.file) {
      const uploadedAttachment = await uploadControlAttachment({
        organizationId,
        controlRunId,
        controlRunItemId,
        file: response.file,
      });

      uploadedAttachments.push(uploadedAttachment);
    }
  }

  const { data, error } = await supabase.rpc('save_control_run_transactional', {
    p_organization_id: organizationId,
    p_control_type_id: controlTypeId,
    p_control_run_id: controlRunId,
    p_responses: transactionalResponses,
    p_attachments: uploadedAttachments,
  });

  if (error) throw error;

  const savedRun = Array.isArray(data) ? data[0] : data;

  if (!savedRun) {
    throw new Error('Kunde inte spara kontrollen.');
  }

  if (definition.controlType.control_key !== COLD_STORAGE_CONTROL_KEY) {
    return { ...(savedRun as ControlRun), responseOutcomes: null };
  }

  try {
    const [{ data: savedItems, error: savedItemsError }, { data: savedDeviations, error: savedDeviationsError }] = await Promise.all([
      supabase
        .from('control_run_items')
        .select('id, control_object_id, field_definition_id, status, deviation_detected')
        .eq('organization_id', organizationId)
        .eq('control_run_id', controlRunId),
      supabase
        .from('deviations')
        .select('control_run_item_id, status')
        .eq('organization_id', organizationId)
        .eq('control_run_id', controlRunId),
    ]);

    if (savedItemsError || savedDeviationsError) {
      return { ...(savedRun as ControlRun), responseOutcomes: null };
    }

    const deviationStatusByItemId = new Map(
      (savedDeviations ?? []).map((deviation) => [deviation.control_run_item_id, deviation.status as DeviationStatus]),
    );
    const responseOutcomes = (savedItems ?? []).flatMap((item) => (
      item.field_definition_id
        ? [{
          controlObjectId: item.control_object_id,
          fieldDefinitionId: item.field_definition_id,
          status: item.status as ControlRunItemStatus,
          deviationDetected: item.deviation_detected,
          deviationStatus: deviationStatusByItemId.get(item.id) ?? null,
        }]
        : []
    ));

    return { ...(savedRun as ControlRun), responseOutcomes };
  } catch {
    // A confirmed write remains successful even if the optional confirmation read fails.
    return { ...(savedRun as ControlRun), responseOutcomes: null };
  }
}
