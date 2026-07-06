import { db } from './config.js';

export async function loadRows() {
  const result = await db.functions.invoke('private-lead-list', {
    body: { action: 'list' },
  });
  if (result.error) throw new Error(result.error.message);
  return result.data?.rows ?? [];
}

export async function setLeadStatus(leadId, status) {
  const result = await db.functions.invoke('private-lead-list', {
    body: { action: 'set_status', leadId, status },
  });
  if (result.error) throw new Error(result.error.message);
  if (!result.data?.success) throw new Error(result.data?.error || 'Kunde inte spara status.');
  return result.data.lead;
}
