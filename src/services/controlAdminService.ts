import { supabase } from '../lib/supabaseClient';
import type {
  ControlCategory,
  ControlFieldDefinition,
  ControlFrequency,
  ControlObject,
  ControlType,
} from '../types/database';

export type CreateControlTypeInput = {
  organizationId: string;
  name: string;
  description?: string;
  category: ControlCategory;
  frequency: ControlFrequency;
  instructions?: string;
  createdBy: string;
};

export type CreateControlObjectInput = {
  organizationId: string;
  controlTypeId: string;
  name: string;
  location?: string;
  objectType?: string;
  instructions?: string;
  limitMin?: number | null;
  limitMax?: number | null;
  unit?: string;
};

type DefaultControlField = {
  field_key: string;
  label: string;
  field_type: ControlFieldDefinition['field_type'];
  required: boolean;
  sort_order: number;
};

const defaultFieldsByCategory: Record<ControlCategory, DefaultControlField[]> = {
  temperature: [
    { field_key: 'temperature', label: 'Temperatur', field_type: 'temperature', required: true, sort_order: 0 },
  ],
  checklist: [
    { field_key: 'status', label: 'Status', field_type: 'ok_not_ok', required: true, sort_order: 0 },
    { field_key: 'comment', label: 'Kommentar', field_type: 'textarea', required: false, sort_order: 1 },
  ],
  custom: [
    { field_key: 'status', label: 'Status', field_type: 'ok_not_ok', required: true, sort_order: 0 },
    { field_key: 'comment', label: 'Kommentar', field_type: 'textarea', required: false, sort_order: 1 },
  ],
  receiving: [
    { field_key: 'status', label: 'Status', field_type: 'ok_not_ok', required: true, sort_order: 0 },
    { field_key: 'temperature', label: 'Temperatur', field_type: 'temperature', required: false, sort_order: 1 },
    { field_key: 'comment', label: 'Kommentar', field_type: 'textarea', required: false, sort_order: 2 },
  ],
  traceability: [
    { field_key: 'batch_label', label: 'Batch / märkning', field_type: 'text', required: false, sort_order: 0 },
    { field_key: 'best_before_date', label: 'Bäst före / datum', field_type: 'date', required: false, sort_order: 1 },
    { field_key: 'photo', label: 'Foto', field_type: 'photo', required: false, sort_order: 2 },
    { field_key: 'comment', label: 'Kommentar', field_type: 'textarea', required: false, sort_order: 3 },
  ],
  round: [
    { field_key: 'status', label: 'Status', field_type: 'ok_not_ok', required: true, sort_order: 0 },
    { field_key: 'comment', label: 'Kommentar', field_type: 'textarea', required: false, sort_order: 1 },
  ],
};

async function ensureDefaultFieldsForControlType(controlType: ControlType): Promise<void> {
  const { data: existingFields, error: existingFieldsError } = await supabase
    .from('control_field_definitions')
    .select('id')
    .eq('organization_id', controlType.organization_id)
    .eq('control_type_id', controlType.id)
    .limit(1);

  if (existingFieldsError) {
    throw existingFieldsError;
  }

  if ((existingFields ?? []).length > 0) {
    return;
  }

  const defaultFields = defaultFieldsByCategory[controlType.category];
  if (!defaultFields.length) {
    return;
  }

  const { error } = await supabase
    .from('control_field_definitions')
    .upsert(
      defaultFields.map((field) => ({
        organization_id: controlType.organization_id,
        control_type_id: controlType.id,
        field_key: field.field_key,
        label: field.label,
        field_type: field.field_type,
        required: field.required,
        deviation_rule: {},
        options: [],
        sort_order: field.sort_order,
        active: true,
      })),
      { ignoreDuplicates: true, onConflict: 'control_type_id,field_key' },
    );

  if (error) {
    throw error;
  }
}

export async function listControlTypes(organizationId: string): Promise<ControlType[]> {
  const { data, error } = await supabase
    .from('control_types')
    .select('*')
    .eq('organization_id', organizationId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as ControlType[];
}

export async function createControlType(input: CreateControlTypeInput): Promise<ControlType> {
  const { data, error } = await supabase
    .from('control_types')
    .insert({
      organization_id: input.organizationId,
      name: input.name,
      description: input.description ?? null,
      category: input.category,
      frequency: input.frequency,
      instructions: input.instructions ?? null,
      created_by: input.createdBy,
      active: true,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  const controlType = data as ControlType;
  await ensureDefaultFieldsForControlType(controlType);

  return controlType;
}

export async function setControlTypeActive(
  controlTypeId: string,
  organizationId: string,
  active: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('control_types')
    .update({ active })
    .eq('id', controlTypeId)
    .eq('organization_id', organizationId);

  if (error) {
    throw error;
  }
}

export async function listControlObjects(
  organizationId: string,
  controlTypeId: string,
): Promise<ControlObject[]> {
  const { data, error } = await supabase
    .from('control_objects')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('control_type_id', controlTypeId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as ControlObject[];
}

export async function createControlObject(input: CreateControlObjectInput): Promise<ControlObject> {
  const { data, error } = await supabase
    .from('control_objects')
    .insert({
      organization_id: input.organizationId,
      control_type_id: input.controlTypeId,
      name: input.name,
      location: input.location ?? null,
      object_type: input.objectType ?? null,
      instructions: input.instructions ?? null,
      limit_min: input.limitMin ?? null,
      limit_max: input.limitMax ?? null,
      unit: input.unit ?? null,
      active: true,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as ControlObject;
}

export async function setControlObjectActive(
  controlObjectId: string,
  organizationId: string,
  active: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('control_objects')
    .update({ active })
    .eq('id', controlObjectId)
    .eq('organization_id', organizationId);

  if (error) {
    throw error;
  }
}
