import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import {
  APP_THEME_STORAGE_KEY,
  applyThemePreference,
  createAppThemeRuntime,
  readThemePreference,
  resolveTheme,
  type ThemePreference,
} from './appTheme';

class FakeRoot {
  readonly attributes = new Map<string, string>();

  removeAttribute(name: string) {
    this.attributes.delete(name);
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
}

class FakeMediaQuery {
  matches: boolean;
  readonly listeners = new Set<() => void>();

  constructor(matches: boolean) {
    this.matches = matches;
  }

  addEventListener(_type: string, listener: () => void) {
    this.listeners.add(listener);
  }

  removeEventListener(_type: string, listener: () => void) {
    this.listeners.delete(listener);
  }

  setMatches(matches: boolean) {
    this.matches = matches;
    this.listeners.forEach((listener) => listener());
  }
}

function createStorage(initial?: string) {
  const values = new Map<string, string>();
  if (initial) values.set(APP_THEME_STORAGE_KEY, initial);

  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    removeItem(key: string) {
      values.delete(key);
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
}

test('theme preference defaults safely to system', () => {
  assert.equal(readThemePreference(createStorage()), 'system');
  assert.equal(readThemePreference(createStorage('unexpected')), 'system');
  assert.equal(readThemePreference({
    getItem() {
      throw new Error('blocked');
    },
    removeItem() {},
    setItem() {},
  }), 'system');
});

test('explicit preferences override the system theme', () => {
  assert.equal(resolveTheme('light', true), 'light');
  assert.equal(resolveTheme('dark', false), 'dark');
  assert.equal(resolveTheme('system', true), 'dark');
  assert.equal(resolveTheme('system', false), 'light');
});

test('system removes data-theme while explicit preferences set it', () => {
  const root = new FakeRoot();

  applyThemePreference('dark', root);
  assert.equal(root.attributes.get('data-theme'), 'dark');
  applyThemePreference('light', root);
  assert.equal(root.attributes.get('data-theme'), 'light');
  applyThemePreference('system', root);
  assert.equal(root.attributes.has('data-theme'), false);
});

test('runtime applies, persists and follows live system changes', () => {
  const root = new FakeRoot();
  const mediaQuery = new FakeMediaQuery(false);
  const storage = createStorage();
  const runtime = createAppThemeRuntime({ mediaQuery, root, storage });
  const states: string[] = [];
  const unsubscribe = runtime.subscribe((state) => states.push(`${state.preference}:${state.resolvedTheme}`));

  assert.deepEqual(runtime.getState(), { preference: 'system', resolvedTheme: 'light' });
  mediaQuery.setMatches(true);
  assert.deepEqual(runtime.getState(), { preference: 'system', resolvedTheme: 'dark' });
  assert.deepEqual(states, ['system:dark']);

  runtime.setPreference('light');
  assert.equal(storage.getItem(APP_THEME_STORAGE_KEY), 'light');
  assert.equal(root.attributes.get('data-theme'), 'light');
  mediaQuery.setMatches(false);
  assert.deepEqual(runtime.getState(), { preference: 'light', resolvedTheme: 'light' });
  assert.deepEqual(states, ['system:dark', 'light:light']);

  runtime.setPreference('system');
  assert.equal(storage.getItem(APP_THEME_STORAGE_KEY), null);
  assert.equal(root.attributes.has('data-theme'), false);

  unsubscribe();
  runtime.destroy();
  assert.equal(mediaQuery.listeners.size, 0);
});

test('storage write failures do not block an immediate theme change', () => {
  const root = new FakeRoot();
  const mediaQuery = new FakeMediaQuery(false);
  const runtime = createAppThemeRuntime({
    mediaQuery,
    root,
    storage: {
      getItem: () => null,
      removeItem() {
        throw new Error('blocked');
      },
      setItem() {
        throw new Error('blocked');
      },
    },
  });

  assert.doesNotThrow(() => runtime.setPreference('dark'));
  assert.equal(root.attributes.get('data-theme'), 'dark');
  runtime.destroy();
});

function runBootstrap(storedPreference: string | null, storageThrows = false) {
  const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  const scriptMatch = html.match(/<script data-app-theme-bootstrap>([\s\S]*?)<\/script>/);
  assert.ok(scriptMatch, 'index.html must contain the app theme bootstrap');
  assert.ok(html.indexOf('data-app-theme-bootstrap') < html.indexOf('<body>'));
  assert.ok(html.indexOf('data-app-theme-bootstrap') < html.indexOf('/src/main.tsx'));

  const root = new FakeRoot();
  const storage = {
    getItem() {
      if (storageThrows) throw new Error('blocked');
      return storedPreference;
    },
  };

  vm.runInNewContext(scriptMatch[1], {
    document: { documentElement: root },
    window: { localStorage: storage },
  });

  return root;
}

test('head bootstrap applies only valid explicit preferences without throwing', () => {
  const preferences: Array<[ThemePreference | 'invalid', string | undefined]> = [
    ['light', 'light'],
    ['dark', 'dark'],
    ['system', undefined],
    ['invalid', undefined],
  ];

  preferences.forEach(([preference, expected]) => {
    assert.equal(runBootstrap(preference).attributes.get('data-theme'), expected);
  });
  assert.equal(runBootstrap(null).attributes.has('data-theme'), false);
  assert.equal(runBootstrap(null, true).attributes.has('data-theme'), false);
});
