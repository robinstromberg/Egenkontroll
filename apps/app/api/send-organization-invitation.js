/* global console */
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const ROUTE = '/api/send-organization-invitation';
const APP_ORIGIN = 'https://app.minegenkontroll.se';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class InvitationHttpError extends Error {
  constructor(statusCode, publicMessage, internalMessage = publicMessage, code = undefined) {
    super(internalMessage);
    this.name = 'InvitationHttpError';
    this.statusCode = statusCode;
    this.publicMessage = publicMessage;
    this.code = code;
  }
}

function jsonResponse(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
}

function readHeader(request, name) {
  const value = request.headers?.[name];
  if (Array.isArray(value)) return value[0];
  return typeof value === 'string' ? value : '';
}

function createRequestId(request) {
  return readHeader(request, 'x-vercel-id') || readHeader(request, 'x-request-id') || randomUUID();
}

function sanitizeLogMessage(value) {
  return String(value || '')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
    .replace(/(authorization|bearer|raw[_-]?token|token|key|secret)[=: ]+([^&\s]+)/gi, '$1=[redacted]')
    .slice(0, 500);
}

function logApiEvent(level, event) {
  const writer = level === 'error' ? console.error : console.log;
  writer(JSON.stringify({ level, timestamp: new Date().toISOString(), ...event }));
}

function attachRequestLogging(request, response, requestId, startedAt, logEvent) {
  response.setHeader('x-request-id', requestId);
  logEvent('info', { msg: 'start', route: ROUTE, requestId, method: request.method });
  response.once('finish', () => {
    logEvent('info', {
      msg: 'done',
      route: ROUTE,
      requestId,
      method: request.method,
      statusCode: response.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });
}

function readBearerToken(request) {
  const match = readHeader(request, 'authorization').match(/^Bearer\s+(\S+)$/i);
  return match?.[1] || '';
}

function readEnv(name, fallbackName) {
  return process.env[name] || (fallbackName ? process.env[fallbackName] : '');
}

function createSupabaseCallerClient(accessToken) {
  const supabaseUrl = readEnv('SUPABASE_URL', 'VITE_SUPABASE_URL');
  const publishableKey = readEnv('SUPABASE_ANON_KEY', 'VITE_SUPABASE_PUBLISHABLE_KEY');
  if (!supabaseUrl || !publishableKey) {
    throw new InvitationHttpError(503, 'Inbjudningstjänsten är inte konfigurerad. Försök igen senare.');
  }

  return createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { authorization: `Bearer ${accessToken}` } },
  });
}

export function escapeInvitationHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatExpiry(expiresAt) {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Stockholm',
  }).format(new Date(expiresAt));
}

export function buildInvitationEmail(invitation) {
  const organizationName = String(invitation.organizationName || '').trim() || 'din verksamhet';
  const subjectOrganizationName = organizationName.replace(/[\r\n]+/g, ' ');
  const roleLabel = invitation.role === 'admin' ? 'administratör' : 'personal';
  const expiresLabel = formatExpiry(invitation.expiresAt);
  const invitationUrl = `${APP_ORIGIN}/login?invitation=${invitation.id}`;
  const text = [
    'Hej!',
    '',
    `Du har blivit inbjuden till ${organizationName} i Min Egenkontroll som ${roleLabel}.`,
    'Logga in eller skapa ett konto med samma e-postadress som inbjudan skickades till. Därefter kan du acceptera inbjudan.',
    '',
    invitationUrl,
    '',
    `Inbjudan gäller till ${expiresLabel}.`,
    '',
    'Om du inte väntade dig inbjudan kan du bortse från mejlet.',
  ].join('\n');
  const html = `<!doctype html>
<html lang="sv">
  <body style="margin:0;background:#f4f1ea;color:#21352d;font-family:Arial,sans-serif">
    <div style="max-width:600px;margin:0 auto;padding:32px 20px">
      <div style="background:#fff;border-radius:16px;padding:32px">
        <p style="margin:0 0 20px">Hej!</p>
        <h1 style="font-size:24px;line-height:1.3;margin:0 0 16px">Du är inbjuden till ${escapeInvitationHtml(organizationName)}</h1>
        <p style="line-height:1.6;margin:0 0 16px">Du har blivit inbjuden till Min Egenkontroll som <strong>${escapeInvitationHtml(roleLabel)}</strong>.</p>
        <p style="line-height:1.6;margin:0 0 24px">Logga in eller skapa ett konto med samma e-postadress som inbjudan skickades till. Därefter kan du acceptera inbjudan.</p>
        <p style="margin:0 0 24px"><a href="${escapeInvitationHtml(invitationUrl)}" style="display:inline-block;background:#21634f;color:#fff;text-decoration:none;border-radius:10px;padding:13px 20px;font-weight:700">Öppna inbjudan</a></p>
        <p style="line-height:1.6;margin:0 0 8px">Inbjudan gäller till ${escapeInvitationHtml(expiresLabel)}.</p>
        <p style="font-size:13px;line-height:1.5;color:#66756e;margin:0">Om du inte väntade dig inbjudan kan du bortse från mejlet.</p>
      </div>
    </div>
  </body>
</html>`;
  return { subject: `Inbjudan till ${subjectOrganizationName} i Min Egenkontroll`, text, html, invitationUrl };
}

export function buildInvitationIdempotencyKey(invitationId, attemptId) {
  return `organization-invitation/${invitationId}/${attemptId}`;
}

export async function sendInvitationWithResend(input, options = {}) {
  const fetchImplementation = options.fetchImplementation || fetch;
  const apiKey = options.apiKey ?? process.env.RESEND_API_KEY;
  const from = options.from ?? process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    throw new InvitationHttpError(503, 'E-posttjänsten är inte konfigurerad. Försök igen senare.');
  }

  let result;
  try {
    result = await fetchImplementation('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
        'idempotency-key': input.idempotencyKey,
      },
      body: JSON.stringify({ from, to: [input.to], subject: input.subject, text: input.text, html: input.html }),
    });
  } catch (error) {
    throw new InvitationHttpError(
      502,
      'Mejlet kunde inte skickas. Inbjudan ligger kvar och kan skickas igen.',
      error instanceof Error ? error.message : 'Resend request failed.',
    );
  }

  const payload = await result.json().catch(() => ({}));
  if (!result.ok) {
    const providerErrorCode = typeof payload.name === 'string' ? payload.name : '';
    if (result.status === 409 && providerErrorCode === 'concurrent_idempotent_requests') {
      throw new InvitationHttpError(
        409,
        'Samma utskick behandlas redan. Vänta en stund och försök igen.',
        'Resend is processing a concurrent idempotent request.',
        providerErrorCode,
      );
    }
    if (result.status === 409 && providerErrorCode === 'invalid_idempotent_request') {
      throw new InvitationHttpError(
        409,
        'Utskicket har ändrats sedan försöket startade. Försök igen för att starta ett nytt utskick.',
        'Resend rejected an idempotency key used with a different payload.',
        providerErrorCode,
      );
    }
    throw new InvitationHttpError(
      502,
      'Mejlet kunde inte skickas. Inbjudan ligger kvar och kan skickas igen.',
      `Resend rejected invitation email with status ${result.status}.`,
    );
  }
  return payload;
}

async function loadAuthorizedInvitation(client, accessToken, invitationId) {
  const { data: authData, error: authError } = await client.auth.getUser(accessToken);
  const user = authData?.user;
  if (authError || !user) throw new InvitationHttpError(401, 'Din session är ogiltig. Logga in igen.');

  const { data: invitation, error: invitationError } = await client
    .from('organization_invitations')
    .select('id, organization_id, email, role, status, expires_at')
    .eq('id', invitationId)
    .maybeSingle();
  if (invitationError) throw new Error('Kunde inte läsa inbjudan.');
  if (!invitation) throw new InvitationHttpError(403, 'Du saknar behörighet att skicka den här inbjudan.');

  const { data: membership, error: membershipError } = await client
    .from('organization_memberships')
    .select('role, status')
    .eq('organization_id', invitation.organization_id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();
  if (membershipError) throw new Error('Kunde inte verifiera behörigheten.');
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    throw new InvitationHttpError(403, 'Du saknar behörighet att skicka den här inbjudan.');
  }
  if (invitation.status !== 'pending') throw new InvitationHttpError(409, 'Inbjudan väntar inte längre på svar.');
  if (new Date(invitation.expires_at).getTime() <= Date.now()) {
    throw new InvitationHttpError(409, 'Inbjudan har gått ut. Förläng den innan du skickar igen.');
  }

  const { data: organization, error: organizationError } = await client
    .from('organizations')
    .select('name')
    .eq('id', invitation.organization_id)
    .maybeSingle();
  if (organizationError || !organization) throw new Error('Kunde inte läsa verksamheten.');

  return {
    id: invitation.id,
    email: invitation.email,
    role: invitation.role,
    expiresAt: invitation.expires_at,
    organizationName: organization.name,
  };
}

export function createOrganizationInvitationHandler(dependencies = {}) {
  const createCallerClient = dependencies.createCallerClient || createSupabaseCallerClient;
  const sendEmail = dependencies.sendEmail || sendInvitationWithResend;
  const logEvent = dependencies.logEvent || logApiEvent;

  return async function handler(request, response) {
    const startedAt = Date.now();
    const requestId = createRequestId(request);
    attachRequestLogging(request, response, requestId, startedAt, logEvent);

    if (request.method !== 'POST') {
      response.setHeader('allow', 'POST');
      return jsonResponse(response, 405, { error: 'Method not allowed.', requestId });
    }

    const invitationId = String(request.body?.invitationId || '').trim();
    const attemptId = String(request.body?.attemptId || '').trim();
    if (!UUID_PATTERN.test(invitationId) || !UUID_PATTERN.test(attemptId)) {
      return jsonResponse(response, 400, { error: 'Giltiga inbjudnings- och attempt-id krävs.', requestId });
    }
    const accessToken = readBearerToken(request);
    if (!accessToken) return jsonResponse(response, 401, { error: 'Logga in för att skicka inbjudan.', requestId });

    try {
      const client = createCallerClient(accessToken);
      const invitation = await loadAuthorizedInvitation(client, accessToken, invitationId);
      const email = buildInvitationEmail(invitation);
      const sendResult = await sendEmail({
        to: invitation.email,
        subject: email.subject,
        text: email.text,
        html: email.html,
        idempotencyKey: buildInvitationIdempotencyKey(invitation.id, attemptId),
      });
      logEvent('info', {
        msg: 'invitation_email_accepted',
        route: ROUTE,
        requestId,
        providerMessageId: typeof sendResult?.id === 'string' ? sendResult.id : undefined,
      });
      return jsonResponse(response, 200, { sent: true, requestId });
    } catch (error) {
      const statusCode = error instanceof InvitationHttpError ? error.statusCode : 500;
      const publicMessage = error instanceof InvitationHttpError
        ? error.publicMessage
        : 'Inbjudan kunde inte skickas. Försök igen senare.';
      logEvent('error', {
        msg: 'failed',
        route: ROUTE,
        requestId,
        method: request.method,
        statusCode,
        durationMs: Date.now() - startedAt,
        errorName: error instanceof Error ? error.name : 'UnknownError',
        errorMessage: sanitizeLogMessage(error instanceof Error ? error.message : error),
      });
      return jsonResponse(response, statusCode, {
        error: publicMessage,
        code: error instanceof InvitationHttpError ? error.code : undefined,
        requestId,
      });
    }
  };
}

export default createOrganizationInvitationHandler();
