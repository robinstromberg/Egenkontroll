/* global console */
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { resolveServerSupabaseConfig } from '../config/supabaseEnvironment.js';
import {
  buildInspectorReportDocument,
  isReportImageAttachment,
  selectInspectorReportRuns,
} from '../src/reports/inspectorReportDocument.js';
import { buildInspectorReportPdf } from '../src/reports/inspectorReportPdf.js';

const ATTACHMENT_LINK_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7;

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
    .replace(/(raw[_-]?token|token|key|secret)=([^&\s]+)/gi, '$1=[redacted]')
    .slice(0, 500);
}

function logApiEvent(level, event) {
  const writer = level === 'error' ? console.error : console.log;
  writer(JSON.stringify({
    level,
    timestamp: new Date().toISOString(),
    ...event,
  }));
}

function attachRequestLogging(request, response, route, requestId, startedAt) {
  response.setHeader('x-request-id', requestId);
  logApiEvent('info', {
    msg: 'start',
    route,
    requestId,
    method: request.method,
  });
  response.once('finish', () => {
    logApiEvent('info', {
      msg: 'done',
      route,
      requestId,
      method: request.method,
      statusCode: response.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });
}

function logApiError(route, request, requestId, startedAt, error) {
  logApiEvent('error', {
    msg: 'failed',
    route,
    requestId,
    method: request.method,
    durationMs: Date.now() - startedAt,
    errorName: error instanceof Error ? error.name : 'UnknownError',
    errorMessage: sanitizeLogMessage(error instanceof Error ? error.message : error),
  });
}

function createServiceClient() {
  const { supabaseUrl, secretKey } = resolveServerSupabaseConfig(process.env);

  if (!secretKey) {
    return null;
  }

  return createClient(supabaseUrl, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function addSignedAttachmentLinks(runs) {
  const serviceClient = createServiceClient();
  if (!serviceClient || runs.length === 0) {
    return runs;
  }

  const runIds = runs.map((run) => run.run_id).filter(Boolean);
  if (runIds.length === 0) {
    return runs;
  }

  const { data, error } = await serviceClient
    .from('attachments')
    .select('id, control_run_id, storage_bucket, storage_path, file_name')
    .in('control_run_id', runIds);

  if (error || !data?.length) {
    return runs;
  }

  const signedUrlByAttachmentId = new Map();

  for (const attachment of data) {
    if (!attachment.id || !attachment.storage_bucket || !attachment.storage_path) {
      continue;
    }

    const { data: signedData, error: signedError } = await serviceClient.storage
      .from(attachment.storage_bucket)
      .createSignedUrl(attachment.storage_path, ATTACHMENT_LINK_EXPIRES_IN_SECONDS);

    if (!signedError && signedData?.signedUrl) {
      signedUrlByAttachmentId.set(attachment.id, signedData.signedUrl);
    }
  }

  if (signedUrlByAttachmentId.size === 0) {
    return runs;
  }

  return runs.map((run) => ({
    ...run,
    attachments: (run.attachments || []).map((attachment) => ({
      ...attachment,
      signed_url: signedUrlByAttachmentId.get(attachment.id) || null,
      signed_url_expires_in_seconds: signedUrlByAttachmentId.has(attachment.id)
        ? ATTACHMENT_LINK_EXPIRES_IN_SECONDS
        : null,
    })),
  }));
}

function isSupportedPdfImage(buffer) {
  return buffer.length >= 4 && (
    (buffer[0] === 0xff && buffer[1] === 0xd8)
    || (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47)
  );
}

export async function resolveEmailAttachmentStates(runs, fetchImplementation = fetch) {
  const pairs = runs.flatMap((run) => (run.attachments || [])
    .filter(isReportImageAttachment)
    .map((attachment) => ({ run, attachment })));

  return Promise.all(pairs.map(async ({ attachment }) => {
    if (!attachment.signed_url) {
      return { attachmentId: attachment.id, status: 'omitted', reason: 'Bilden kunde inte hämtas.' };
    }

    try {
      const result = await fetchImplementation(attachment.signed_url);
      if (!result.ok) {
        return { attachmentId: attachment.id, status: 'omitted', reason: 'Bilden kunde inte hämtas.' };
      }
      const source = Buffer.from(await result.arrayBuffer());
      if (!isSupportedPdfImage(source)) {
        return { attachmentId: attachment.id, status: 'omitted', reason: 'Bildformatet stöds inte i PDF-filen.' };
      }
      return { attachmentId: attachment.id, status: 'included', source };
    } catch {
      return { attachmentId: attachment.id, status: 'omitted', reason: 'Bilden kunde inte hämtas.' };
    }
  }));
}

async function callSupabaseRpc(name, body) {
  const { supabaseUrl, anonKey } = resolveServerSupabaseConfig(process.env);

  const result = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      authorization: `Bearer ${anonKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!result.ok) {
    const text = await result.text();
    throw new Error(text || `Supabase RPC ${name} failed.`);
  }

  return result.json();
}

async function sendWithResend(input) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || 'Egenkontroll <onboarding@resend.dev>';

  if (!apiKey) {
    const error = new Error('RESEND_API_KEY saknas i Vercel.');
    error.statusCode = 501;
    throw error;
  }

  const result = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      attachments: [
        {
          filename: input.filename,
          content: input.pdf.toString('base64'),
        },
      ],
    }),
  });

  const payload = await result.json().catch(() => ({}));
  if (!result.ok) {
    throw new Error(payload.message || payload.error || 'Resend kunde inte skicka rapporten.');
  }

  return payload;
}

export default async function handler(request, response) {
  const route = '/api/send-inspector-report';
  const startedAt = Date.now();
  const requestId = createRequestId(request);
  attachRequestLogging(request, response, route, requestId, startedAt);

  if (request.method !== 'POST') {
    response.setHeader('allow', 'POST');
    return jsonResponse(response, 405, { error: 'Method not allowed.' });
  }

  try {
    const input = request.body || {};
    if (!input.rawToken || !input.email || !input.periodStart || !input.periodEnd) {
      return jsonResponse(response, 400, { error: 'Token, e-post och period krävs.' });
    }

    const email = String(input.email).trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse(response, 400, { error: 'Ange en giltig e-postadress.' });
    }

    const runs = await callSupabaseRpc('get_shared_control_runs', {
      raw_token: input.rawToken,
      p_period_start: input.periodStart,
      p_period_end: input.periodEnd,
      p_control_type_ids: Array.isArray(input.controlTypeIds) ? input.controlTypeIds : [],
    });
    const deviationFilter = typeof input.deviationFilter === 'string' ? input.deviationFilter : 'all';
    const sort = typeof input.sort === 'string' ? input.sort : 'performed-desc';
    const selection = selectInspectorReportRuns(runs, {
      visibleRunIds: input.visibleRunIds,
      deviationFilter,
      searchQuery: input.searchQuery,
      sort,
    });
    const visibleRuns = selection.runs;

    if (selection.missingRunIds.length > 0) {
      return jsonResponse(response, 409, { error: 'Urvalet har ändrats. Ladda om rapporten och försök igen.' });
    }

    if (visibleRuns.length === 0) {
      return jsonResponse(response, 404, { error: 'Inga kontroller matchar urvalet.' });
    }

    const runsWithAttachmentLinks = await addSignedAttachmentLinks(visibleRuns);
    const companyName = input.companyName || input.organizationName || runsWithAttachmentLinks[0]?.organization_name || 'Verksamhet';
    const attachmentStates = await resolveEmailAttachmentStates(runsWithAttachmentLinks);
    const report = buildInspectorReportDocument(runsWithAttachmentLinks, {
      ...input,
      companyName,
      deviationFilter,
      sort,
    }, attachmentStates);
    const pdf = await buildInspectorReportPdf(report);
    const subject = `Egenkontroll ${input.periodStart} - ${input.periodEnd}`;
    const text = [
      'Hej,',
      '',
      'Här kommer rapporten för egenkontroll som PDF.',
      '',
      `Period: ${input.periodStart} - ${input.periodEnd}`,
      `Kontroller: ${visibleRuns.length}`,
      report.omittedAttachments.length
        ? `${report.omittedAttachments.length} ${report.omittedAttachments.length === 1 ? 'bildbilaga kunde' : 'bildbilagor kunde'} inte tas med i PDF-filen och är markerad i rapporten.`
        : '',
      input.summaryUrl ? `Länk: ${input.summaryUrl}` : '',
    ].filter(Boolean).join('\n');

    const sendResult = await sendWithResend({
      to: email,
      subject,
      text,
      filename: `egenkontroll-${input.periodStart}-${input.periodEnd}.pdf`,
      pdf,
    });

    await callSupabaseRpc('log_shared_export', {
      raw_token: input.rawToken,
      p_export_type: 'pdf',
      p_filters: {
        period_start: input.periodStart,
        period_end: input.periodEnd,
        control_type_ids: Array.isArray(input.controlTypeIds) ? input.controlTypeIds : [],
        control_type_names: Array.isArray(input.controlTypeNames) ? input.controlTypeNames : [],
        deviation_filter: deviationFilter,
        search_query: typeof input.searchQuery === 'string' ? input.searchQuery : '',
        sort,
        delivery: 'email',
        recipient: email,
        run_count: visibleRuns.length,
        item_count: report.summary.metrics[2].value,
        open_deviations: report.summary.metrics[3].value,
        resolved_deviations: report.summary.metrics[4].value,
        omitted_attachment_count: report.omittedAttachments.length,
      },
    }).catch(() => null);

    return jsonResponse(response, 200, { id: sendResult.id || sendResult.data?.id || null });
  } catch (error) {
    const statusCode = error instanceof Error && 'statusCode' in error
      ? error.statusCode
      : 500;
    logApiError(route, request, requestId, startedAt, error);
    return jsonResponse(response, statusCode, {
      error: error instanceof Error ? error.message : 'Kunde inte skicka rapporten.',
      requestId,
    });
  }
}
