export type AppEnvironment = {
  appName: string;
  supabaseUrl?: string;
  supabasePublishableKey?: string;
  hasSupabaseConfig: boolean;
};

export const environment: AppEnvironment = {
  appName: import.meta.env.VITE_APP_NAME ?? 'Egenkontroll',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabasePublishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  hasSupabaseConfig: Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  ),
};
