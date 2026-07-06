import { supabase } from '../lib/supabaseClient';

export type LeadStatus = 'baseline' | 'new' | 'contacted' | 'customer' | 'ignored';
export type LeadPriority = 'high' | 'medium';
export type LeadFilter = 'new' | 'recent' | 'uncontacted' | 'contacted' | 'all';

export type Lead = {
  id: number;
  name: string;
  business_type: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  priority: LeadPriority;
  lead_status: LeadStatus;
  first_seen_at: string;
  last_seen_at: string;
};

export type LeadPage = {
  leads: Lead[];
  total: number;
};

export type LeadSyncSummary = {
  finished_at: string | null;
  total_source_rows: number | null;
  inserted_rows: number | null;
  success: boolean | null;
};

export const LEAD_PAGE_SIZE = 50;

function sanitizeSearch(value: string): string {
  return value.replace(/[,%()_*]/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function listLeads(input: {
  filter: LeadFilter;
  search: string;
  page: number;
}): Promise<LeadPage> {
  const offset = Math.max(0, input.page) * LEAD_PAGE_SIZE;
  const recentDate = new Date();
  recentDate.setDate(recentDate.getDate() - 7);

  let query = supabase
    .from('leadgen_businesses')
    .select(
      'id, name, business_type, address, postal_code, city, priority, lead_status, first_seen_at, last_seen_at',
      { count: 'exact' },
    )
    .eq('active', true)
    .in('priority', ['high', 'medium']);

  if (input.filter === 'new') {
    query = query.eq('lead_status', 'new');
  } else if (input.filter === 'recent') {
    query = query.eq('lead_status', 'new').gte('first_seen_at', recentDate.toISOString());
  } else if (input.filter === 'uncontacted') {
    query = query.in('lead_status', ['new', 'baseline']);
  } else if (input.filter === 'contacted') {
    query = query.eq('lead_status', 'contacted');
  }

  const safeSearch = sanitizeSearch(input.search);
  if (safeSearch) {
    const pattern = `%${safeSearch}%`;
    query = query.or(
      `name.ilike.${pattern},business_type.ilike.${pattern},address.ilike.${pattern},city.ilike.${pattern}`,
    );
  }

  const { data, count, error } = await query
    .order('first_seen_at', { ascending: false })
    .order('name', { ascending: true })
    .range(offset, offset + LEAD_PAGE_SIZE - 1);

  if (error) throw new Error(`Kunde inte läsa leads: ${error.message}`);

  return {
    leads: (data ?? []) as Lead[],
    total: count ?? 0,
  };
}

export async function getLatestLeadSync(): Promise<LeadSyncSummary | null> {
  const { data, error } = await supabase
    .from('leadgen_sync_runs')
    .select('finished_at, total_source_rows, inserted_rows, success')
    .eq('source', 'goteborg_foodbusinesses')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Kunde inte läsa senaste synk: ${error.message}`);
  return data as LeadSyncSummary | null;
}

export async function updateLeadStatus(leadId: number, status: LeadStatus): Promise<void> {
  const { error } = await supabase
    .from('leadgen_businesses')
    .update({ lead_status: status, updated_at: new Date().toISOString() })
    .eq('id', leadId);

  if (error) throw new Error(`Kunde inte uppdatera lead: ${error.message}`);
}
