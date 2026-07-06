import { db } from './config.js';

export async function loadRows() {
  const result = await db.functions.invoke('private-lead-list');
  if (result.error) throw new Error(result.error.message);
  return result.data?.rows ?? [];
}
