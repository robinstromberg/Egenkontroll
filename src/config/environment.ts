const publicSupabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://eapjywbgxtudqjrlueep.supabase.co';
const publicSupabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_YsqN7EM6XP7U750bZyqVZw_Gi4p5SYg';

export type AppEnvironment = {
  appName: string;
  supabaseUrl: string;
  supabasePublishableKey: string;
  hasSupabaseConfig: boolean;
};

export const environment: AppEnvironment = {
  appName: import.meta.env.VITE_APP_NAME ?? 'Egenkontroll',
  supabaseUrl: publicSupabaseUrl,
  supabasePublishableKey: publicSupabasePublishableKey,
  hasSupabaseConfig: Boolean(publicSupabaseUrl && publicSupabasePublishableKey),
};
