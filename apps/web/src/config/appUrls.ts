export const productionAppOrigin = 'https://app.minegenkontroll.se' as const;

export const appPaths = {
  login: '/login',
  signup: '/signup',
} as const;

export type AppPath = typeof appPaths[keyof typeof appPaths];

export type AppRedirect = {
  source: AppPath;
  destination: string;
  statusCode: 308;
};

export function resolveAppOrigin(value: string = productionAppOrigin): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`PUBLIC_APP_ORIGIN är inte en giltig URL: ${value}`);
  }

  const localDevelopment = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if (url.origin !== value || (url.protocol !== 'https:' && !localDevelopment)) {
    throw new Error(`PUBLIC_APP_ORIGIN måste vara en säker origin utan path, query eller fragment: ${value}`);
  }
  return url.origin;
}

export function createAppUrls(configuredOrigin?: string) {
  const origin = resolveAppOrigin(configuredOrigin);
  return {
    login: new URL(appPaths.login, origin).href,
    signup: new URL(appPaths.signup, origin).href,
  } as const;
}

export function createAppRedirects(configuredOrigin?: string): readonly AppRedirect[] {
  const urls = createAppUrls(configuredOrigin);
  return [
    { source: appPaths.login, destination: urls.login, statusCode: 308 },
    { source: appPaths.signup, destination: urls.signup, statusCode: 308 },
  ];
}

const configuredAppOrigin = import.meta.env?.PUBLIC_APP_ORIGIN
  ?? (typeof process === 'object' ? process.env.PUBLIC_APP_ORIGIN : undefined);

export const appOrigin = resolveAppOrigin(configuredAppOrigin);
export const appUrls = createAppUrls(appOrigin);
export const appRedirects = createAppRedirects(appOrigin);
