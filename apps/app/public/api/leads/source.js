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

async function readFunctionError(error, fallback) {
  try {
    const response = error?.context;
    if (response && typeof response.clone === 'function') {
      const data = await response.clone().json();
      return new Error(data?.error || fallback);
    }
  } catch {
    // Fall back to the public error message below.
  }
  return new Error(error?.message || fallback);
}

export async function sendLeadEmail(leadId) {
  const result = await db.functions.invoke('send-private-lead-email', {
    body: { leadId },
  });

  if (result.error) {
    throw await readFunctionError(result.error, 'Kunde inte skicka mejlet.');
  }
  if (!result.data?.success) {
    throw new Error(result.data?.error || 'Kunde inte skicka mejlet.');
  }
  return result.data.lead;
}
