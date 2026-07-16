import { supabase } from '../lib/supabaseClient';
import type { ControlCategory, ControlFrequency, ControlTemplate } from '../types/database';

type TemplateObject = {
  name: string;
  location?: string;
  object_type?: string;
  instructions?: string;
  limit_min?: number;
  limit_max?: number;
  unit?: string;
};

type TemplateField = {
  field_key: string;
  label: string;
  field_type: 'text' | 'textarea' | 'number' | 'temperature' | 'boolean' | 'ok_not_ok' | 'date' | 'datetime' | 'photo' | 'select';
  required?: boolean;
  deviation_rule?: Record<string, unknown>;
  options?: unknown[];
};

type StarterTemplateSchema = {
  default_active?: boolean;
  objects?: TemplateObject[];
  fields?: TemplateField[];
};

function readTemplateSchema(template: ControlTemplate): StarterTemplateSchema {
  return template.template_schema as StarterTemplateSchema;
}

function isDefaultActiveTemplate(template: ControlTemplate): boolean {
  return readTemplateSchema(template).default_active !== false;
}

export async function listActiveControlTemplates(): Promise<ControlTemplate[]> {
  const { data, error } = await supabase
    .from('control_templates')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as ControlTemplate[]).filter(isDefaultActiveTemplate);
}

async function cloneTemplateRowsToOrganization(
  organizationId: string,
  createdBy: string,
  templates: ControlTemplate[],
  active: boolean,
): Promise<void> {
  if (templates.length === 0) {
    return;
  }

  for (const template of templates) {
    const schema = readTemplateSchema(template);

    const { data: controlType, error: controlTypeError } = await supabase
      .from('control_types')
      .insert({
        organization_id: organizationId,
        template_id: template.id,
        name: template.name,
        description: template.description,
        category: template.category as ControlCategory,
        frequency: template.default_frequency as ControlFrequency,
        created_by: createdBy,
        active,
      })
      .select('id')
      .single();

    if (controlTypeError) {
      throw controlTypeError;
    }

    const controlTypeId = controlType.id as string;

    if (schema.objects?.length) {
      const objects = schema.objects.map((item, index) => ({
        organization_id: organizationId,
        control_type_id: controlTypeId,
        name: item.name,
        location: item.location ?? null,
        object_type: item.object_type ?? null,
        instructions: item.instructions ?? null,
        limit_min: item.limit_min ?? null,
        limit_max: item.limit_max ?? null,
        unit: item.unit ?? null,
        sort_order: index,
        active: true,
      }));

      const { error: objectsError } = await supabase.from('control_objects').insert(objects);

      if (objectsError) {
        throw objectsError;
      }
    }

    if (schema.fields?.length) {
      const fields = schema.fields.map((field, index) => ({
        organization_id: organizationId,
        control_type_id: controlTypeId,
        field_key: field.field_key,
        label: field.label,
        field_type: field.field_type,
        required: field.required ?? false,
        deviation_rule: field.deviation_rule ?? {},
        options: field.options ?? [],
        sort_order: index,
        active: true,
      }));

      const { error: fieldsError } = await supabase.from('control_field_definitions').insert(fields);

      if (fieldsError) {
        throw fieldsError;
      }
    }
  }
}

export async function cloneTemplatesToOrganization(
  organizationId: string,
  templateIds: string[],
  createdBy: string,
): Promise<void> {
  if (templateIds.length === 0) {
    return;
  }

  const { data: templates, error } = await supabase
    .from('control_templates')
    .select('*')
    .in('id', templateIds)
    .eq('active', true);

  if (error) {
    throw error;
  }

  await cloneTemplateRowsToOrganization(organizationId, createdBy, (templates ?? []) as ControlTemplate[], true);
}

export async function cloneInactiveDefaultTemplatesToOrganization(
  organizationId: string,
  createdBy: string,
): Promise<void> {
  const { data: templates, error } = await supabase
    .from('control_templates')
    .select('*')
    .eq('active', true);

  if (error) {
    throw error;
  }

  const inactiveDefaultTemplates = ((templates ?? []) as ControlTemplate[])
    .filter((template) => readTemplateSchema(template).default_active === false);

  await cloneTemplateRowsToOrganization(organizationId, createdBy, inactiveDefaultTemplates, false);
}
