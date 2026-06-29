const fallbackSupabaseUrl = 'https://eapjywbgxtudqjrlueep.supabase.co';
const fallbackSupabasePublishableKey = ['sb', 'publishable', 'YsqN7EM6XP7U750bZyqVZw', 'Gi4p5SYg'].join('_');

const publicSupabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? fallbackSupabaseUrl;
const publicSupabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? fallbackSupabasePublishableKey;
const productionAppUrl = 'https://minegenkontroll.se';
const configuredAppUrl = import.meta.env.VITE_APP_URL ?? productionAppUrl;
const publicAppUrl = configuredAppUrl.replace(/\/$/, '');

export type AppEnvironment = {
  appName: string;
  appUrl: string;
  supabaseUrl: string;
  supabasePublishableKey: string;
  hasSupabaseConfig: boolean;
};

export const environment: AppEnvironment = {
  appName: import.meta.env.VITE_APP_NAME ?? 'Egenkontroll',
  appUrl: publicAppUrl,
  supabaseUrl: publicSupabaseUrl,
  supabasePublishableKey: publicSupabasePublishableKey,
  hasSupabaseConfig: Boolean(publicSupabaseUrl && publicSupabasePublishableKey),
};