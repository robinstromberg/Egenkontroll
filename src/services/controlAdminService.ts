import { supabase } from '../lib/supabaseClient';
import type { ControlCategory, ControlFrequency, ControlObject, ControlType } from '../types/database';

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

  return data as ControlType;
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
