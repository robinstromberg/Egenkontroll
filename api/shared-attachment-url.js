import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const SIGNED_URL_MAX_EXPIRES_IN_SECONDS = 60 * 10;
const FALLBACK_SUPABASE_URL = 'https://eapjywbgxtudqjrlueep.supabase.co';

function jsonResponse(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
}

function readEnv(name, fallbackName) {
  return process.env[name] || (fallbackName ? process.env[fallbackName] : '');
}

function readSupabaseUrl() {
  return readEnv('SUPABASE_URL', 'VITE_SUPABASE_URL') || FALLBACK_SUPABASE_URL;
}

function readServiceRoleKey() {
  return readEnv('SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEY');
}

function readServerConfigDiagnostics() {
  return {
    hasSupabaseUrl: Boolean(readSupabaseUrl()),
    hasServiceRoleKey: Boolean(readServiceRoleKey()),
    acceptsServiceRoleKey: 'SUPABASE_SERVICE_ROLE_KEY',
    acceptsLegacySecretKey: 'SUPABASE_SECRET_KEY',
  };
}

function createServiceClient() {
  const supabaseUrl = readSupabaseUrl();
  const serviceRoleKey = readServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function hashShareToken(value) {
  return createHash('sha256').update(value).digest('hex');
}

function isIncludedControlType(shareLink, controlTypeId) {
  const includedControlTypeIds = Array.isArray(shareLink.included_control_type_ids)
    ? shareLink.included_control_type_ids
    : [];

  return includedControlTypeIds.length === 0 || includedControlTypeIds.includes(controlTypeId);
}

function isRunWithinSharedPeriod(shareLink, run) {
  const performedDate = String(run.performed_at || '').slice(0, 10);
  return performedDate >= shareLink.period_start && performedDate <= shareLink.period_end;
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('allow', 'POST');
    return jsonResponse(response, 405, { error: 'Method not allowed.' });
  }

  try {
    const input = request.body || {};
    const rawToken = typeof input.rawToken === 'string' ? input.rawToken.trim() : '';
    const attachmentId = typeof input.attachmentId === 'string' ? input.attachmentId.trim() : '';

    if (!rawToken || !attachmentId) {
      return jsonResponse(response, 400, { error: 'Token och bilaga krävs.' });
    }

    const serviceClient = createServiceClient();
    if (!serviceClient) {
      console.error('shared-attachment-url missing Supabase server configuration', readServerConfigDiagnostics());
      return jsonResponse(response, 503, {
        error: 'Bilden kan inte öppnas just nu.',
        code: 'SERVER_CONFIGURATION_MISSING',
      });
    }

    const now = new Date();
    const { data: shareLink, error: shareLinkError } = await serviceClient
      .from('share_links')
      .select('id, organization_id, valid_until, period_start, period_end, included_control_type_ids, status')
      .eq('token_hash', hashShareToken(rawToken))
      .eq('status', 'active')
      .gt('valid_until', now.toISOString())
      .single();

    if (shareLinkError || !shareLink) {
      return jsonResponse(response, 403, { error: 'Delningslänken är inte giltig.' });
    }

    const { data: attachment, error: attachmentError } = await serviceClient
      .from('attachments')
      .select('id, organization_id, control_run_id, storage_bucket, storage_path')
      .eq('id', attachmentId)
      .single();

    if (attachmentError || !attachment || attachment.organization_id !== shareLink.organization_id) {
      return jsonResponse(response, 404, { error: 'Bilagan hittades inte i delningen.' });
    }

    const { data: run, error: runError } = await serviceClient
      .from('control_runs')
      .select('id, organization_id, control_type_id, performed_at')
      .eq('id', attachment.control_run_id)
      .eq('organization_id', shareLink.organization_id)
      .single();

    if (
      runError
      || !run
      || !isRunWithinSharedPeriod(shareLink, run)
      || !isIncludedControlType(shareLink, run.control_type_id)
    ) {
      return jsonResponse(response, 403, { error: 'Bilagan ingår inte i den här delningen.' });
    }

    const validUntilMs = new Date(shareLink.valid_until).getTime();
    const remainingSeconds = Math.max(1, Math.floor((validUntilMs - Date.now()) / 1000));
    const expiresInSeconds = Math.min(SIGNED_URL_MAX_EXPIRES_IN_SECONDS, remainingSeconds);

    const { data: signedData, error: signedError } = await serviceClient.storage
      .from(attachment.storage_bucket)
      .createSignedUrl(attachment.storage_path, expiresInSeconds);

    if (signedError || !signedData?.signedUrl) {
      return jsonResponse(response, 500, { error: 'Kunde inte skapa bildlänk.' });
    }

    return jsonResponse(response, 200, {
      signedUrl: signedData.signedUrl,
      expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
    });
  } catch (error) {
    return jsonResponse(response, 500, {
      error: error instanceof Error ? error.message : 'Kunde inte skapa bildlänk.',
    });
  }
}
