function requireClientEnvironmentValue(name: string, value: string | undefined): string {
  const normalized = value?.trim();
  if (!normalized) {
    throw new Error(`Appens konfiguration saknas: ${name}.`);
  }
  return normalized;
}

const publicSupabaseUrl = requireClientEnvironmentValue(
  'VITE_SUPABASE_URL',
  import.meta.env.VITE_SUPABASE_URL,
);
const publicSupabasePublishableKey = requireClientEnvironmentValue(
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);
const publicAppUrl = requireClientEnvironmentValue(
  'VITE_APP_URL',
  __APP_URL__,
).replace(/\/$/, '');

export type AppEnvironment = {
  appName: string;
  appUrl: string;
  supabaseUrl: string;
  supabasePublishableKey: string;
};

export const environment: AppEnvironment = {
  appName: import.meta.env.VITE_APP_NAME ?? 'Egenkontroll',
  appUrl: publicAppUrl,
  supabaseUrl: publicSupabaseUrl,
  supabasePublishableKey: publicSupabasePublishableKey,
};
