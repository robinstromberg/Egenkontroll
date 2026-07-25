export const APP_THEME_STORAGE_KEY = 'egenkontroll:app-theme';
export const APP_THEME_MEDIA_QUERY = '(prefers-color-scheme: dark)';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = Exclude<ThemePreference, 'system'>;

type ThemeStorage = Pick<Storage, 'getItem' | 'removeItem' | 'setItem'>;
type ThemeRoot = Pick<HTMLElement, 'removeAttribute' | 'setAttribute'>;

type ThemeChangeListener = () => void;

type ThemeMediaQuery = {
  addEventListener?: (type: 'change', listener: ThemeChangeListener) => void;
  addListener?: (listener: ThemeChangeListener) => void;
  matches: boolean;
  removeEventListener?: (type: 'change', listener: ThemeChangeListener) => void;
  removeListener?: (listener: ThemeChangeListener) => void;
};

export type AppThemeState = {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
};

export type AppThemeRuntime = {
  destroy: () => void;
  getState: () => AppThemeState;
  setPreference: (preference: ThemePreference) => AppThemeState;
  subscribe: (listener: (state: AppThemeState) => void) => () => void;
};

type AppThemeRuntimeOptions = {
  mediaQuery: ThemeMediaQuery;
  root: ThemeRoot;
  storage?: ThemeStorage;
};

export function readThemePreference(storage?: ThemeStorage): ThemePreference {
  if (!storage) return 'system';

  try {
    const value = storage.getItem(APP_THEME_STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    return 'system';
  }
}

export function resolveTheme(preference: ThemePreference, systemPrefersDark: boolean): ResolvedTheme {
  if (preference === 'system') return systemPrefersDark ? 'dark' : 'light';
  return preference;
}

export function applyThemePreference(preference: ThemePreference, root: ThemeRoot): void {
  if (preference === 'system') {
    root.removeAttribute('data-theme');
    return;
  }

  root.setAttribute('data-theme', preference);
}

function persistThemePreference(preference: ThemePreference, storage?: ThemeStorage): void {
  if (!storage) return;

  try {
    if (preference === 'system') {
      storage.removeItem(APP_THEME_STORAGE_KEY);
    } else {
      storage.setItem(APP_THEME_STORAGE_KEY, preference);
    }
  } catch {
    // Theme persistence must never prevent the app from starting or changing theme.
  }
}

export function createAppThemeRuntime({ mediaQuery, root, storage }: AppThemeRuntimeOptions): AppThemeRuntime {
  let preference = readThemePreference(storage);
  const subscribers = new Set<(state: AppThemeState) => void>();

  function getState(): AppThemeState {
    return {
      preference,
      resolvedTheme: resolveTheme(preference, mediaQuery.matches),
    };
  }

  function notify() {
    const state = getState();
    subscribers.forEach((subscriber) => subscriber(state));
  }

  function handleSystemThemeChange() {
    if (preference === 'system') notify();
  }

  applyThemePreference(preference, root);

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleSystemThemeChange);
  } else {
    mediaQuery.addListener?.(handleSystemThemeChange);
  }

  return {
    destroy() {
      subscribers.clear();
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else {
        mediaQuery.removeListener?.(handleSystemThemeChange);
      }
    },
    getState,
    setPreference(nextPreference) {
      preference = nextPreference;
      persistThemePreference(preference, storage);
      applyThemePreference(preference, root);
      const state = getState();
      notify();
      return state;
    },
    subscribe(listener) {
      subscribers.add(listener);
      return () => subscribers.delete(listener);
    },
  };
}

let appThemeRuntime: AppThemeRuntime | undefined;

function getBrowserThemeStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function initializeAppThemeRuntime(): AppThemeRuntime {
  if (appThemeRuntime) return appThemeRuntime;

  appThemeRuntime = createAppThemeRuntime({
    mediaQuery: window.matchMedia(APP_THEME_MEDIA_QUERY),
    root: document.documentElement,
    storage: getBrowserThemeStorage(),
  });

  return appThemeRuntime;
}

export function getAppThemeRuntime(): AppThemeRuntime {
  return appThemeRuntime ?? initializeAppThemeRuntime();
}
