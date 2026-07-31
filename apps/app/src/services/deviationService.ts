import { supabase } from '../lib/supabaseClient';
import { buildResolveDeviationRpcArgs } from './deviationTransition';

export async function resolveDeviation(
  organizationId: string,
  deviationId: string,
  followUpComment: string,
): Promise<void> {
  const { error } = await supabase.rpc(
    'resolve_deviation',
    buildResolveDeviationRpcArgs(organizationId, deviationId, followUpComment),
  );

  if (error) {
    throw error;
  }
}
