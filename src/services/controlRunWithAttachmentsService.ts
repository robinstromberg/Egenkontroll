import { supabase } from '../lib/supabaseClient';
import { uploadControlAttachment, type UploadedControlAttachment } from './attachmentService';
import type { ControlFieldDefinition, ControlObject, ControlRun, ControlType } from '../types/database';

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
};

type TransactionalControlResponse = {
  controlRunItemId: string;
  controlObjectId: string | null;
  fieldDefinitionId: string;
  value: string;
  deviationDetected: boolean;
  deviationReason: string | null;
  actionText: string | null;
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
): Promise<ControlRun> {
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

  return savedRun;
}
