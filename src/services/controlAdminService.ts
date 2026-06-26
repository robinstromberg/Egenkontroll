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

export type CreateControlFieldInput = {
  organizationId: string;
  controlTypeId: string;
  label: string;
  fieldType: ControlFieldDefinition['field_type'];
  required: boolean;
};

export type UpdateControlFieldInput = {
  fieldDefinitionId: string;
  organizationId: string;
  label: string;
  required: boolean;
  active: boolean;
};

export type UpdateControlObjectInput = {
  controlObjectId: string;
  organizationId: string;
  name: string;
  location?: string | null;
  instructions?: string | null;
  limitMax?: number | null;
  active: boolean;
};

function createFieldKey(label: string, fieldType: ControlFieldDefinition['field_type']): string {
  const normalized = label
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return normalized || fieldType;
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
    .rpc('create_control_type_with_default_fields', {
      p_organization_id: input.organizationId,
      p_name: input.name,
      p_description: input.description ?? null,
      p_category: input.category,
      p_frequency: input.frequency,
      p_instructions: input.instructions ?? null,
      p_created_by: input.createdBy,
    });

  if (error) {
    throw error;
  }

  return data as ControlType;
}

export async function listControlFields(
  organizationId: string,
  controlTypeId: string,
): Promise<ControlFieldDefinition[]> {
  const { data, error } = await supabase
    .from('control_field_definitions')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('control_type_id', controlTypeId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as ControlFieldDefinition[];
}

export async function createControlField(input: CreateControlFieldInput): Promise<ControlFieldDefinition> {
  const label = input.label.trim();
  if (!label) {
    throw new Error('Fältnamn krävs.');
  }

  const existingFields = await listControlFields(input.organizationId, input.controlTypeId);
  const baseKey = createFieldKey(label, input.fieldType);
  const existingKeys = new Set(existingFields.map((field) => field.field_key));
  let fieldKey = baseKey;
  let suffix = 2;

  while (existingKeys.has(fieldKey)) {
    fieldKey = `${baseKey}_${suffix}`;
    suffix += 1;
  }

  const maxSortOrder = existingFields.reduce((max, field) => Math.max(max, field.sort_order), -1);

  const { data, error } = await supabase
    .from('control_field_definitions')
    .insert({
      organization_id: input.organizationId,
      control_type_id: input.controlTypeId,
      field_key: fieldKey,
      label,
      field_type: input.fieldType,
      required: input.required,
      deviation_rule: {},
      options: [],
      sort_order: maxSortOrder + 1,
      active: true,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as ControlFieldDefinition;
}

export async function updateControlField(input: UpdateControlFieldInput): Promise<void> {
  const label = input.label.trim();
  if (!label) {
    throw new Error('Fältnamn krävs.');
  }

  const { error } = await supabase
    .from('control_field_definitions')
    .update({
      label,
      required: input.required,
      active: input.active,
    })
    .eq('id', input.fieldDefinitionId)
    .eq('organization_id', input.organizationId);

  if (error) {
    throw error;
  }
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

export async function updateControlType(
  controlTypeId: string,
  organizationId: string,
  updates: Pick<ControlType, 'name' | 'active'> & { instructions?: string | null },
): Promise<ControlType> {
  const name = updates.name.trim();
  if (!name) {
    throw new Error('Kontrolltypens namn krävs.');
  }

  const updatePayload: { name: string; active: boolean; instructions?: string | null } = {
    name,
    active: updates.active,
  };

  if ('instructions' in updates) {
    updatePayload.instructions = updates.instructions ?? null;
  }

  const { data, error } = await supabase
    .from('control_types')
    .update(updatePayload)
    .eq('id', controlTypeId)
    .eq('organization_id', organizationId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as ControlType;
}

export async function deleteControlType(controlTypeId: string, organizationId: string): Promise<void> {
  const { error } = await supabase
    .from('control_types')
    .delete()
    .eq('id', controlTypeId)
    .eq('organization_id', organizationId);

  if (error) {
    if (error.code === '23503') {
      throw new Error('Kontrolltypen har historik och kan inte raderas. Inaktivera den istället.');
    }

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

export async function updateControlObject(input: UpdateControlObjectInput): Promise<void> {
  const name = input.name.trim();
  if (!name) {
    throw new Error('Kontrollpunktens namn krävs.');
  }

  const { error } = await supabase
    .from('control_objects')
    .update({
      name,
      location: input.location?.trim() || null,
      instructions: input.instructions ?? null,
      limit_max: input.limitMax ?? null,
      active: input.active,
    })
    .eq('id', input.controlObjectId)
    .eq('organization_id', input.organizationId);

  if (error) {
    throw error;
  }
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
