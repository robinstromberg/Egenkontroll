import { supabase } from '../lib/supabaseClient';
import type { Supplier } from '../types/database';

export async function listSuppliers(organizationId: string, includeInactive = false): Promise<Supplier[]> {
  let query = supabase
    .from('suppliers')
    .select('*')
    .eq('organization_id', organizationId)
    .order('active', { ascending: false })
    .order('name', { ascending: true });

  if (!includeInactive) {
    query = query.eq('active', true);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as Supplier[];
}

export async function createSupplier(
  organizationId: string,
  name: string,
  createdBy: string,
): Promise<Supplier> {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error('Leverantörsnamn krävs.');
  }

  const { data, error } = await supabase
    .from('suppliers')
    .insert({
      organization_id: organizationId,
      name: trimmedName,
      created_by: createdBy,
      active: true,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as Supplier;
}

export async function updateSupplier(
  supplierId: string,
  organizationId: string,
  updates: Pick<Supplier, 'name' | 'active'>,
): Promise<Supplier> {
  const trimmedName = updates.name.trim();
  if (!trimmedName) {
    throw new Error('Leverantörsnamn krävs.');
  }

  const { data, error } = await supabase
    .from('suppliers')
    .update({
      name: trimmedName,
      active: updates.active,
    })
    .eq('id', supplierId)
    .eq('organization_id', organizationId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as Supplier;
}

export async function deactivateSupplier(supplierId: string, organizationId: string): Promise<void> {
  const { error } = await supabase
    .from('suppliers')
    .update({ active: false })
    .eq('id', supplierId)
    .eq('organization_id', organizationId);

  if (error) {
    throw error;
  }
}
