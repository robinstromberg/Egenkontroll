const publicSupabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const publicSupabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';
const productionAppUrl = 'https://egenkontroll-robinstrombergs-projects.vercel.app';
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
