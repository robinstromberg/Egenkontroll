import assert from 'node:assert/strict';
import test from 'node:test';
import {
  InvitationHttpError,
  buildInvitationEmail,
  buildInvitationIdempotencyKey,
  createOrganizationInvitationHandler,
  sendInvitationWithResend,
} from '../../api/send-organization-invitation.js';

const invitationId = '11111111-1111-4111-8111-111111111111';
const organizationId = '22222222-2222-4222-8222-222222222222';
const futureExpiry = '2099-07-28T12:00:00.000Z';

function createFakeResponse() {
  const finishListeners = [];
  return {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader(name, value) {
      this.headers[name] = value;
    },
    once(event, listener) {
      if (event === 'finish') finishListeners.push(listener);
    },
    end(body) {
      this.body = body;
      for (const listener of finishListeners) listener();
    },
  };
}

function createFakeClient(options = {}) {
  const invitation = options.invitation === null ? null : {
    id: invitationId,
    organization_id: organizationId,
    email: 'person@example.com',
    role: 'staff',
    status: options.invitationStatus || 'pending',
    expires_at: options.expiresAt || futureExpiry,
  };
  const rows = {
    organization_invitations: invitation,
    organization_memberships: options.membership === null ? null : {
      role: options.membershipRole || 'owner',
      status: 'active',
    },
    organizations: { name: 'Testköket' },
  };

  return {
    auth: {
      getUser: async () => options.authenticated === false
        ? { data: { user: null }, error: new Error('invalid') }
        : { data: { user: { id: '33333333-3333-4333-8333-333333333333' } }, error: null },
    },
    from(table) {
      const query = {
        select() { return query; },
        eq() { return query; },
        maybeSingle: async () => ({ data: rows[table], error: null }),
      };
      return query;
    },
  };
}

async function callHandler({ client = createFakeClient(), sendEmail }) {
  const request = {
    method: 'POST',
    headers: { authorization: 'Bearer test-access-token', 'x-request-id': 'request-1' },
    body: { invitationId },
  };
  const response = createFakeResponse();
  const handler = createOrganizationInvitationHandler({
    createCallerClient: () => client,
    sendEmail,
    logEvent: () => undefined,
  });
  await handler(request, response);
  return { response, payload: JSON.parse(response.body) };
}

test('invitation email contains exact app link and escapes dynamic HTML', () => {
  const invitation = {
    id: invitationId,
    email: 'person@example.com',
    role: 'admin',
    expiresAt: futureExpiry,
    organizationName: '<Test & kök>',
  };
  const email = buildInvitationEmail(invitation);

  assert.equal(email.invitationUrl, `https://app.minegenkontroll.se/login?invitation=${invitationId}`);
  assert.match(email.text, /administratör/);
  assert.match(email.text, /Logga in eller skapa ett konto/);
  assert.match(email.html, /&lt;Test &amp; kök&gt;/);
  assert.doesNotMatch(email.html, /<Test & kök>/);

  const firstKey = buildInvitationIdempotencyKey(invitation);
  assert.equal(firstKey, buildInvitationIdempotencyKey(invitation));
  assert.notEqual(firstKey, buildInvitationIdempotencyKey({ ...invitation, expiresAt: '2099-07-29T12:00:00.000Z' }));
});

test('Resend request uses an idempotency key and the API key never enters the body', async () => {
  let captured;
  const result = await sendInvitationWithResend({
    to: 'person@example.com',
    subject: 'Inbjudan',
    text: 'Text',
    html: '<p>Text</p>',
    idempotencyKey: 'organization-invitation/fingerprint',
  }, {
    apiKey: 'server-secret-test-key',
    from: 'Min Egenkontroll <support@minegenkontroll.se>',
    fetchImplementation: async (url, options) => {
      captured = { url, options };
      return { ok: true, status: 200, json: async () => ({ id: 'provider-id' }) };
    },
  });

  assert.equal(result.id, 'provider-id');
  assert.equal(captured.url, 'https://api.resend.com/emails');
  assert.equal(captured.options.headers['idempotency-key'], 'organization-invitation/fingerprint');
  assert.equal(JSON.parse(captured.options.body).to[0], 'person@example.com');
  assert.doesNotMatch(captured.options.body, /server-secret-test-key/);
});

test('only an active owner or admin can send an invitation', async () => {
  let providerCalls = 0;
  const { response, payload } = await callHandler({
    client: createFakeClient({ membershipRole: 'staff' }),
    sendEmail: async () => { providerCalls += 1; },
  });

  assert.equal(response.statusCode, 403);
  assert.match(payload.error, /saknar behörighet/);
  assert.equal(providerCalls, 0);
});

test('provider failure is not reported as success and remains retryable', async () => {
  let attempts = 0;
  const idempotencyKeys = [];
  const failure = await callHandler({
    sendEmail: async (input) => {
      attempts += 1;
      idempotencyKeys.push(input.idempotencyKey);
      throw new InvitationHttpError(502, 'Mejlet kunde inte skickas. Inbjudan ligger kvar och kan skickas igen.');
    },
  });
  assert.equal(failure.response.statusCode, 502);
  assert.equal(failure.payload.sent, undefined);
  assert.match(failure.payload.error, /kan skickas igen/);

  const retry = await callHandler({
    sendEmail: async (input) => {
      attempts += 1;
      idempotencyKeys.push(input.idempotencyKey);
      return { id: 'provider-id' };
    },
  });
  assert.equal(retry.response.statusCode, 200);
  assert.equal(retry.payload.sent, true);
  assert.equal(attempts, 2);
  assert.equal(idempotencyKeys[0], idempotencyKeys[1]);
});

test('an expired pending invitation cannot be emailed', async () => {
  let providerCalls = 0;
  const { response, payload } = await callHandler({
    client: createFakeClient({ expiresAt: '2020-01-01T00:00:00.000Z' }),
    sendEmail: async () => { providerCalls += 1; },
  });

  assert.equal(response.statusCode, 409);
  assert.match(payload.error, /gått ut/);
  assert.equal(providerCalls, 0);
});
