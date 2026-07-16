import { supabase } from '../lib/supabaseClient';

export async function resolveDeviation(
  organizationId: string,
  deviationId: string,
  resolvedBy: string,
  followUpComment: string,
): Promise<void> {
  const { error } = await supabase
    .from('deviations')
    .update({
      status: 'resolved',
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString(),
      follow_up_comment: followUpComment.trim() || null,
    })
    .eq('id', deviationId)
    .eq('organization_id', organizationId);

  if (error) {
    throw error;
  }
}
