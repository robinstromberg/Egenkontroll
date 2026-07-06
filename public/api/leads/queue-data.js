import { db } from './config.js';

export async function fetchQueue() {
  const response = await db
    .from('leadgen_businesses')
    .select('id,name,business_type,address,postal_code,city,priority,lead_status,first_seen_at')
    .eq('active', true)
    .eq('lead_status', 'new')
    .in('priority', ['high', 'medium'])
    .order('first_seen_at', { ascending: false })
    .limit(500);
  if (response.error) throw new Error(response.error.message);
  return response.data ?? [];
}
