/* global URL */
const PRODUCTION_SUPABASE_PROJECT_REF = 'eapjywbgxtudqjrlueep';
const PRODUCTION_SUPABASE_HOST = `${PRODUCTION_SUPABASE_PROJECT_REF}.supabase.co`;
const SUPABASE_HOST_PATTERN = /^[a-z0-9]{20}\.supabase\.co$/;

export class SupabaseConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SupabaseConfigurationError';
    this.code = 'SUPABASE_CONFIGURATION_ERROR';
    this.statusCode = 503;
  }
}

export function resolveDeploymentEnvironment(environment = {}) {
  if (environment.VERCEL_ENV === 'production') return 'production';
  if (environment.VERCEL_ENV === 'preview') return 'preview';
  return 'development';
}

function requireValue(environment, name) {
  const value = String(environment[name] || '').trim();
  if (!value) {
    throw new SupabaseConfigurationError(`Obligatorisk miljövariabel saknas: ${name}.`);
  }
  return value;
}

function isLocalSupabaseUrl(url) {
  return (
    (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
    && (url.protocol === 'http:' || url.protocol === 'https:')
  );
}

export function validateSupabaseUrl(value, deploymentEnvironment, variableName) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new SupabaseConfigurationError(`${variableName} måste vara en giltig URL.`);
  }

  const isLocalDevelopment = deploymentEnvironment === 'development' && isLocalSupabaseUrl(url);
  if (!isLocalDevelopment && (url.protocol !== 'https:' || !SUPABASE_HOST_PATTERN.test(url.hostname))) {
    throw new SupabaseConfigurationError(
      `${variableName} måste vara en HTTPS-URL för ett Supabase-projekt.`,
    );
  }

  const targetsProduction = url.hostname === PRODUCTION_SUPABASE_HOST;
  if (deploymentEnvironment === 'production' && !targetsProduction) {
    throw new SupabaseConfigurationError(
      `${variableName} måste peka på produktionsprojektet i Production.`,
    );
  }
  if (deploymentEnvironment !== 'production' && targetsProduction) {
    throw new SupabaseConfigurationError(
      `${variableName} får inte peka på produktionsprojektet utanför Production.`,
    );
  }

  return url.toString().replace(/\/$/, '');
}

export function resolveClientSupabaseConfig(environment = {}, options = {}) {
  const deploymentEnvironment = resolveDeploymentEnvironment(environment);
  const hasUrl = Boolean(String(environment.VITE_SUPABASE_URL || '').trim());
  const hasKey = Boolean(String(environment.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim());

  if (
    deploymentEnvironment === 'development'
    && options.allowMissingDevelopment
    && !hasUrl
    && !hasKey
  ) {
    return {
      deploymentEnvironment,
      supabaseUrl: '',
      publishableKey: '',
    };
  }

  const supabaseUrl = validateSupabaseUrl(
    requireValue(environment, 'VITE_SUPABASE_URL'),
    deploymentEnvironment,
    'VITE_SUPABASE_URL',
  );
  const publishableKey = requireValue(environment, 'VITE_SUPABASE_PUBLISHABLE_KEY');

  return { deploymentEnvironment, supabaseUrl, publishableKey };
}

export function resolveServerSupabaseConfig(environment = {}, options = {}) {
  const deploymentEnvironment = resolveDeploymentEnvironment(environment);
  const supabaseUrl = validateSupabaseUrl(
    requireValue(environment, 'SUPABASE_URL'),
    deploymentEnvironment,
    'SUPABASE_URL',
  );
  const anonKey = requireValue(environment, 'SUPABASE_ANON_KEY');
  const secretKey = options.requireSecret
    ? requireValue(environment, 'SUPABASE_SECRET_KEY')
    : String(environment.SUPABASE_SECRET_KEY || '').trim();

  return {
    deploymentEnvironment,
    supabaseUrl,
    anonKey,
    secretKey,
  };
}

export function resolveAppUrl(environment = {}) {
  const deploymentEnvironment = resolveDeploymentEnvironment(environment);
  let value;

  if (deploymentEnvironment === 'preview') {
    value = `https://${requireValue(environment, 'VERCEL_URL')}`;
  } else if (deploymentEnvironment === 'production') {
    value = requireValue(environment, 'VITE_APP_URL');
  } else {
    value = String(environment.VITE_APP_URL || '').trim() || 'http://localhost:5173';
  }

  try {
    return new URL(value).toString().replace(/\/$/, '');
  } catch {
    throw new SupabaseConfigurationError('Appens publika URL är inte giltig.');
  }
}
