import { createClient } from '@supabase/supabase-js';

const MAX_LINES_PER_PAGE = 38;
const ATTACHMENT_LINK_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7;
const FALLBACK_SUPABASE_URL = 'https://eapjywbgxtudqjrlueep.supabase.co';
const FALLBACK_SUPABASE_PUBLISHABLE_KEY = ['sb', 'publishable', 'YsqN7EM6XP7U750bZyqVZw', 'Gi4p5SYg'].join('_');

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

function readSupabasePublishableKey() {
  return readEnv('SUPABASE_ANON_KEY', 'VITE_SUPABASE_PUBLISHABLE_KEY') || FALLBACK_SUPABASE_PUBLISHABLE_KEY;
}

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/°/g, 'deg')
    .replace(/[·–—]/g, '-')
    .replace(/[^\x20-\x7E]/g, '')
    .trim();
}

function pdfEscape(value) {
  return normalizeText(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function readBrandColor(value) {
  const text = String(value ?? '').trim();
  if (!/^#[0-9A-Fa-f]{6}$/.test(text)) {
    return [0.36, 0.27, 0.88];
  }

  return [
    Number.parseInt(text.slice(1, 3), 16) / 255,
    Number.parseInt(text.slice(3, 5), 16) / 255,
    Number.parseInt(text.slice(5, 7), 16) / 255,
  ];
}

function readItemValue(item) {
  if (item.value_text) return item.value_text;
  if (item.value_number !== null && item.value_number !== undefined) return String(item.value_number);
  if (item.value_boolean !== null && item.value_boolean !== undefined) return item.value_boolean ? 'Ja' : 'Nej';
  if (item.value_date) return item.value_date;
  if (item.value_json && Object.keys(item.value_json).length > 0) return JSON.stringify(item.value_json);
  return 'Ej angivet';
}

function readSnapshotName(snapshot, fallback) {
  return snapshot && typeof snapshot.name === 'string' ? snapshot.name : fallback;
}

function readFieldLabel(snapshot) {
  return snapshot && typeof snapshot.label === 'string' ? snapshot.label : 'Falt';
}

function countOpenDeviations(run) {
  return (run.deviations || []).filter((deviation) => deviation.status !== 'resolved').length;
}

function countResolvedDeviations(run) {
  return (run.deviations || []).filter((deviation) => deviation.status === 'resolved').length;
}

function countAllDeviations(run) {
  return (run.deviations || []).length;
}

function matchesDeviationFilter(run, filter) {
  const openCount = countOpenDeviations(run);
  const resolvedCount = countResolvedDeviations(run);

  if (filter === 'with-open') return openCount > 0;
  if (filter === 'with-resolved') return resolvedCount > 0 && openCount === 0;
  if (filter === 'without') return (run.deviations || []).length === 0;
  return true;
}

function sortRuns(runs, sortKey) {
  return [...runs].sort((first, second) => {
    if (sortKey === 'performed-asc') {
      return new Date(first.performed_at).getTime() - new Date(second.performed_at).getTime();
    }

    if (sortKey === 'control-type') {
      return String(first.control_type_name || '').localeCompare(String(second.control_type_name || ''), 'sv-SE');
    }

    if (sortKey === 'deviation-status') {
      return countOpenDeviations(second) - countOpenDeviations(first)
        || countResolvedDeviations(second) - countResolvedDeviations(first)
        || new Date(second.performed_at).getTime() - new Date(first.performed_at).getTime();
    }

    return new Date(second.performed_at).getTime() - new Date(first.performed_at).getTime();
  });
}

function formatPercent(part, total) {
  if (!total) return '0%';
  return `${Math.round((part / total) * 100)}%`;
}

function wrapLine(line, width = 96) {
  const clean = normalizeText(line);
  if (clean.length <= width) return [clean];

  const words = clean.split(/\s+/);
  const lines = [];
  let current = '';

  for (const word of words) {
    if (word.length > width) {
      if (current) {
        lines.push(current);
        current = '';
      }

      for (let index = 0; index < word.length; index += width) {
        lines.push(word.slice(index, index + width));
      }
      continue;
    }

    const next = current ? `${current} ${word}` : word;
    if (next.length > width && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function readServiceRoleKey() {
  return readEnv('SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEY');
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

function buildReportLines(runs, input) {
  const documentedDays = new Set(runs.map((run) => String(run.performed_at).slice(0, 10))).size;
  const itemCount = runs.reduce((sum, run) => sum + (run.items || []).length, 0);
  const openDeviations = runs.reduce((sum, run) => sum + countOpenDeviations(run), 0);
  const resolvedDeviations = runs.reduce((sum, run) => sum + countResolvedDeviations(run), 0);
  const allDeviations = runs.reduce((sum, run) => sum + countAllDeviations(run), 0);
  const generatedAt = new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm' });
  const lines = [
    'Egenkontroll - inspektorsrapport',
    `Period: ${input.periodStart} - ${input.periodEnd}`,
    `Skapad: ${generatedAt}`,
    `Kontrolltyper: ${(input.controlTypeNames || []).join(', ') || 'Valda kontrolltyper'}`,
    input.deviationFilterLabel ? `Avvikelsefilter: ${input.deviationFilterLabel}` : '',
    input.sortLabel ? `Sortering: ${input.sortLabel}` : '',
    '',
    'Sammanfattning',
    `Kontroller i urval: ${runs.length}`,
    `Dokumenterade dagar: ${documentedDays}`,
    `Kontrollpunkter: ${itemCount}`,
    `Oppna avvikelser: ${openDeviations}`,
    `Atgardade avvikelser: ${resolvedDeviations}`,
    `Atgardsgrad: ${formatPercent(resolvedDeviations, allDeviations)}`,
    '',
    'Kontrollpunkter',
  ];

  for (const run of runs) {
    lines.push('');
    lines.push(`${new Date(run.performed_at).toLocaleString('sv-SE')} - ${run.control_type_name} - ${run.status}`);

    for (const item of run.items || []) {
      const label = `${readSnapshotName(item.object_snapshot, 'Kontrollpunkt')} - ${readFieldLabel(item.field_snapshot)}`;
      const deviation = item.deviation_detected ? ` Avvikelse: ${item.deviation_reason || 'Atgard kravs'}` : '';
      const action = item.action_text ? ` Atgard: ${item.action_text}` : '';
      lines.push(...wrapLine(`- ${label}: ${readItemValue(item)} (${item.status}).${deviation}${action}`));
    }

    for (const deviation of run.deviations || []) {
      const resolved = deviation.resolved_at ? ` Lost: ${new Date(deviation.resolved_at).toLocaleString('sv-SE')}` : '';
      const followUp = deviation.follow_up_comment ? ` Uppfoljning: ${deviation.follow_up_comment}` : '';
      lines.push(...wrapLine(`! ${deviation.status} ${deviation.severity}: ${deviation.description}. Atgard: ${deviation.action_text}.${followUp}${resolved}`));
    }

    if ((run.attachments || []).length > 0) {
      lines.push('Bilagor:');
      for (const attachment of run.attachments || []) {
        lines.push(...wrapLine(`- ${attachment.file_name || 'Bilaga'}`));
        if (attachment.signed_url) {
          lines.push(...wrapLine(`  Saker lank (giltig 7 dagar): ${attachment.signed_url}`));
        }
      }
    }
  }

  return lines;
}

function buildPdf(lines, options = {}) {
  const companyName = options.companyName || 'Verksamhet';
  const brandColor = readBrandColor();
  const initials = 'EK';
  const pages = [];
  for (let index = 0; index < lines.length; index += MAX_LINES_PER_PAGE) {
    pages.push(lines.slice(index, index + MAX_LINES_PER_PAGE));
  }

  const objects = [];
  const addObject = (content) => {
    objects.push(content);
    return objects.length;
  };

  const catalogId = addObject('');
  const pagesId = addObject('');
  const fontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const pageIds = [];

  for (const [pageIndex, pageLines] of pages.entries()) {
    const footer = `Sida ${pageIndex + 1} av ${pages.length}`;
      const stream = [
        'q',
      `${brandColor.map((part) => part.toFixed(3)).join(' ')} rg`,
      '50 782 38 38 re f',
      'Q',
      'BT',
      '/F1 14 Tf',
      '1 1 1 rg',
      `59 796 Td (${pdfEscape(initials)}) Tj`,
      'ET',
      'BT',
      '/F1 14 Tf',
      '0.09 0.13 0.20 rg',
      `100 806 Td (${pdfEscape(companyName)}) Tj`,
      '0 -16 Td (Egenkontroll - inspektorsrapport) Tj',
      'ET',
      'BT',
      '/F1 10 Tf',
      '0.09 0.13 0.20 rg',
      '50 748 Td',
      ...pageLines.map((line, index) => `${index === 0 ? '' : '0 -14 Td ' }(${pdfEscape(line)}) Tj`),
      'ET',
      'BT',
      '/F1 8 Tf',
      `50 34 Td (${pdfEscape(footer)}) Tj`,
      'ET',
    ].join('\n');
    const contentId = addObject(`<< /Length ${Buffer.byteLength(stream, 'ascii')} >>\nstream\n${stream}\nendstream`);
    const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    pageIds.push(pageId);
  }

  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((content, index) => {
    offsets.push(Buffer.byteLength(pdf, 'ascii'));
    pdf += `${index + 1} 0 obj\n${content}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf, 'ascii');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, 'ascii');
}

async function callSupabaseRpc(name, body) {
  const supabaseUrl = readSupabaseUrl();
  const supabaseKey = readSupabasePublishableKey();

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Rapportgeneratorn saknar Supabase-konfiguration.');
  }

  const result = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      authorization: `Bearer ${supabaseKey}`,
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
    const visibleRuns = sortRuns(
      runs.filter((run) => matchesDeviationFilter(run, deviationFilter)),
      sort,
    );

    if (visibleRuns.length === 0) {
      return jsonResponse(response, 404, { error: 'Inga kontroller matchar urvalet.' });
    }

    const runsWithAttachmentLinks = await addSignedAttachmentLinks(visibleRuns);
    const companyName = input.companyName || input.organizationName || runsWithAttachmentLinks[0]?.organization_name || 'Verksamhet';
    const lines = buildReportLines(runsWithAttachmentLinks, input);
    const pdf = buildPdf(lines, { companyName });
    const subject = `Egenkontroll ${input.periodStart} - ${input.periodEnd}`;
    const text = [
      'Hej,',
      '',
      'Här kommer rapporten för egenkontroll som PDF.',
      '',
      `Period: ${input.periodStart} - ${input.periodEnd}`,
      `Kontroller: ${visibleRuns.length}`,
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
        sort,
        delivery: 'email',
        recipient: email,
        run_count: visibleRuns.length,
      },
    }).catch(() => null);

    return jsonResponse(response, 200, { id: sendResult.id || sendResult.data?.id || null });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return jsonResponse(response, statusCode, {
      error: error instanceof Error ? error.message : 'Kunde inte skicka rapporten.',
    });
  }
}
