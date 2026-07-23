const PRODUCTION_APP_ORIGIN = 'https://app.minegenkontroll.se';
const url = 'https://eapjywbgxtudqjrlueep.supabase.co';
const key = 'sb_publishable_YsqN7EM6XP7U750bZyqVZw_Gi4p5SYg';

export function isLeadsEnabledForOrigin(origin) {
  return origin === PRODUCTION_APP_ORIGIN;
}

export const isLeadsEnabled = isLeadsEnabledForOrigin(globalThis.location?.origin);

export let db = null;
if (isLeadsEnabled) {
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/+esm');
  db = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
}

export const PAGE_SIZE = 50;
export const ADMIN_EMAIL = 'robinpstromberg@pm.me';
