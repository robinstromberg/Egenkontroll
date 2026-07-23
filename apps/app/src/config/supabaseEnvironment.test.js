/* global URL, process */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  resolveAppUrl,
  resolveClientSupabaseConfig,
  resolveServerSupabaseConfig,
} from '../../config/supabaseEnvironment.js';
import {
  db as leadsDatabase,
  isLeadsEnabled,
  isLeadsEnabledForOrigin,
} from '../../public/api/leads/config.js';
import sendInspectorReport from '../../api/send-inspector-report.js';
import sharedAttachmentUrl from '../../api/shared-attachment-url.js';

const productionUrl = 'https://eapjywbgxtudqjrlueep.supabase.co';
const stagingUrl = 'https://abcdefghijklmnopqrst.supabase.co';

function clientEnvironment(overrides = {}) {
  return {
    VERCEL_ENV: 'preview',
    VERCEL_URL: 'egenkontroll-preview.example.vercel.app',
    VITE_SUPABASE_URL: stagingUrl,
    VITE_SUPABASE_PUBLISHABLE_KEY: 'preview-publishable-key',
    ...overrides,
  };
}

function serverEnvironment(overrides = {}) {
  return {
    VERCEL_ENV: 'preview',
    SUPABASE_URL: stagingUrl,
    SUPABASE_ANON_KEY: 'preview-anon-key',
    SUPABASE_SECRET_KEY: 'preview-secret-key',
    ...overrides,
  };
}

function createFakeResponse() {
  return {
    statusCode: 200,
    body: '',
    setHeader() {},
    once() {},
    end(body) {
      this.body = body;
    },
  };
}

async function withoutServerSupabaseEnvironment(callback) {
  const names = [
    'VERCEL_ENV',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SECRET_KEY',
  ];
  const original = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  process.env.VERCEL_ENV = 'preview';
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_ANON_KEY;
  delete process.env.SUPABASE_SECRET_KEY;

  try {
    return await callback();
  } finally {
    for (const name of names) {
      if (original[name] === undefined) delete process.env[name];
      else process.env[name] = original[name];
    }
  }
}

test('Preview requires explicit client configuration and rejects production Supabase', () => {
  assert.throws(
    () => resolveClientSupabaseConfig({ VERCEL_ENV: 'preview' }),
    /VITE_SUPABASE_URL/,
  );
  assert.throws(
    () => resolveClientSupabaseConfig(clientEnvironment({ VITE_SUPABASE_URL: productionUrl })),
    /utanför Production/,
  );
  assert.deepEqual(resolveClientSupabaseConfig(clientEnvironment()), {
    deploymentEnvironment: 'preview',
    supabaseUrl: stagingUrl,
    publishableKey: 'preview-publishable-key',
  });
});

test('Production requires explicit production Supabase configuration', () => {
  assert.throws(
    () => resolveClientSupabaseConfig({ VERCEL_ENV: 'production' }),
    /VITE_SUPABASE_URL/,
  );
  assert.throws(
    () => resolveClientSupabaseConfig(clientEnvironment({
      VERCEL_ENV: 'production',
      VITE_SUPABASE_URL: stagingUrl,
    })),
    /produktionsprojektet/,
  );
  assert.deepEqual(resolveClientSupabaseConfig(clientEnvironment({
    VERCEL_ENV: 'production',
    VITE_SUPABASE_URL: productionUrl,
  })), {
    deploymentEnvironment: 'production',
    supabaseUrl: productionUrl,
    publishableKey: 'preview-publishable-key',
  });
});

test('Development never uses production implicitly or explicitly', () => {
  assert.deepEqual(resolveClientSupabaseConfig({}, { allowMissingDevelopment: true }), {
    deploymentEnvironment: 'development',
    supabaseUrl: '',
    publishableKey: '',
  });
  assert.throws(
    () => resolveClientSupabaseConfig({
      VITE_SUPABASE_URL: productionUrl,
      VITE_SUPABASE_PUBLISHABLE_KEY: 'local-key',
    }),
    /utanför Production/,
  );
});

test('server configuration ignores client variables and can require a secret', () => {
  assert.deepEqual(resolveServerSupabaseConfig(serverEnvironment(), { requireSecret: true }), {
    deploymentEnvironment: 'preview',
    supabaseUrl: stagingUrl,
    anonKey: 'preview-anon-key',
    secretKey: 'preview-secret-key',
  });
  assert.throws(
    () => resolveServerSupabaseConfig({
      VERCEL_ENV: 'preview',
      VITE_SUPABASE_URL: stagingUrl,
      VITE_SUPABASE_PUBLISHABLE_KEY: 'client-key',
    }),
    /SUPABASE_URL/,
  );
  assert.throws(
    () => resolveServerSupabaseConfig(serverEnvironment({
      SUPABASE_SECRET_KEY: '',
    }), { requireSecret: true }),
    /SUPABASE_SECRET_KEY/,
  );
});

test('Preview app URL uses the deployment URL while Production is explicit', () => {
  assert.equal(
    resolveAppUrl(clientEnvironment()),
    'https://egenkontroll-preview.example.vercel.app',
  );
  assert.equal(
    resolveAppUrl({
      VERCEL_ENV: 'production',
      VITE_APP_URL: 'https://app.minegenkontroll.se/',
    }),
    'https://app.minegenkontroll.se',
  );
  assert.throws(() => resolveAppUrl({ VERCEL_ENV: 'production' }), /VITE_APP_URL/);
});

test('leads can initialize only on the canonical Production origin', () => {
  assert.equal(isLeadsEnabledForOrigin('https://app.minegenkontroll.se'), true);
  assert.equal(isLeadsEnabledForOrigin('https://preview.example.vercel.app'), false);
  assert.equal(isLeadsEnabled, false);
  assert.equal(leadsDatabase, null);
});

test('all Supabase serverless routes use the shared server resolver without public fallbacks', async () => {
  const routePaths = [
    '../../api/send-inspector-report.js',
    '../../api/send-organization-invitation.js',
    '../../api/shared-attachment-url.js',
  ];

  for (const path of routePaths) {
    const source = await readFile(new URL(path, import.meta.url), 'utf8');
    assert.match(source, /resolveServerSupabaseConfig/);
    assert.doesNotMatch(source, /FALLBACK_SUPABASE/);
    assert.doesNotMatch(source, /VITE_SUPABASE/);
    assert.doesNotMatch(source, /sb_publishable_/);
  }
});

test('inspector serverless routes return bounded 503 errors before outbound access', async () => {
  await withoutServerSupabaseEnvironment(async () => {
    const reportResponse = createFakeResponse();
    await sendInspectorReport({
      method: 'POST',
      headers: { 'x-request-id': 'environment-test-report' },
      body: {
        rawToken: 'invalid-test-token',
        email: 'test@example.com',
        periodStart: '2026-07-01',
        periodEnd: '2026-07-23',
      },
    }, reportResponse);
    assert.equal(reportResponse.statusCode, 503);
    assert.equal(JSON.parse(reportResponse.body).requestId, 'environment-test-report');

    const attachmentResponse = createFakeResponse();
    await sharedAttachmentUrl({
      method: 'POST',
      headers: { 'x-request-id': 'environment-test-attachment' },
      body: {
        rawToken: 'invalid-test-token',
        attachmentId: '00000000-0000-0000-0000-000000000000',
      },
    }, attachmentResponse);
    assert.equal(attachmentResponse.statusCode, 503);
    assert.equal(
      JSON.parse(attachmentResponse.body).code,
      'SUPABASE_CONFIGURATION_ERROR',
    );
  });
});
