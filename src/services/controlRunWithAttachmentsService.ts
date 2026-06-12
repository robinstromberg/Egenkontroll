import { supabase } from '../lib/supabaseClient';
import { uploadControlAttachment } from './attachmentService';
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

function toNumber(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toBoolean(value: string): boolean | null {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
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
  const hasDeviation = responses.some((response) => response.deviationDetected);

  const { data: run, error: runError } = await supabase
    .from('control_runs')
    .insert({
      organization_id: organizationId,
      control_type_id: controlTypeId,
      performed_by: performedBy,
      status: hasDeviation ? 'completed_with_deviation' : 'completed',
    })
    .select('*')
    .single();

  if (runError) throw runError;

  const savedRun = run as ControlRun;

  for (const response of responses) {
    const field = definition.fields.find((item) => item.id === response.fieldDefinitionId);
    const object = definition.objects.find((item) => item.id === response.controlObjectId) ?? null;

    if (!field) continue;

    const valueNumber = field.field_type === 'temperature' || field.field_type === 'number'
      ? toNumber(response.value)
      : null;
    const valueBoolean = field.field_type === 'boolean' ? toBoolean(response.value) : null;
    const valueDate = field.field_type === 'date' ? response.value || null : null;
    const valueText = ['text', 'textarea', 'ok_not_ok', 'select', 'photo'].includes(field.field_type)
      ? response.value
      : null;

    const { data: item, error: itemError } = await supabase
      .from('control_run_items')
      .insert({
        organization_id: organizationId,
        control_run_id: savedRun.id,
        control_object_id: object?.id ?? null,
        field_definition_id: field.id,
        object_snapshot: object ?? {},
        field_snapshot: field,
        value_text: valueText,
        value_number: valueNumber,
        value_boolean: valueBoolean,
        value_date: valueDate,
        value_json: {},
        status: response.deviationDetected ? 'deviation' : 'ok',
        deviation_detected: response.deviationDetected,
        deviation_reason: response.deviationReason,
        action_text: response.actionText,
      })
      .select('id')
      .single();

    if (itemError) throw itemError;

    if (response.file) {
      await uploadControlAttachment({
        organizationId,
        controlRunId: savedRun.id,
        controlRunItemId: item.id,
        uploadedBy: performedBy,
        file: response.file,
      });
    }

    if (response.deviationDetected) {
      const { error: deviationError } = await supabase.from('deviations').insert({
        organization_id: organizationId,
        control_run_id: savedRun.id,
        control_run_item_id: item.id,
        control_type_id: controlTypeId,
        control_object_id: object?.id ?? null,
        status: 'open',
        severity: 'medium',
        description: response.deviationReason ?? 'Avvikelse i kontroll.',
        action_text: response.actionText ?? 'Åtgärd saknas.',
        opened_by: performedBy,
      });

      if (deviationError) throw deviationError;
    }
  }

  return savedRun;
}
