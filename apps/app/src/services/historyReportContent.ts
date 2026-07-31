import { reportPalette } from '../reports/reportPalette.js';

export type ReportAttachment = {
  id: string;
  reference: string;
  performedAt: string;
  controlType: string;
  fileName: string;
  createdAt: string;
  signedUrl: string | null;
};

export type ReportRow = {
  id: string;
  performedAt: string;
  performedBy: string;
  controlType: string;
  routine: string;
  status: string;
  values: string;
  deviation: string;
  action: string;
  attachments: ReportAttachment[];
};

function escapeCsv(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function escapeHtml(value: string | number): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildCsvReportContent(rows: ReportRow[]): string {
  const headers = ['Tidpunkt', 'Utförd av', 'Kontrolltyp', 'Rutin/instruktion', 'Status', 'Värden', 'Avvikelse', 'Åtgärd'];
  const lines = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) =>
      [
        row.performedAt,
        row.performedBy,
        row.controlType,
        row.routine,
        row.status,
        row.values,
        row.deviation,
        row.action,
      ].map(escapeCsv).join(','),
    ),
  ];

  return lines.join('\n');
}

export function buildPrintReportHtml(rows: ReportRow[], brandMarkUrl: string): string {
  const htmlRows = rows
    .map((row) => `
      <tr>
        <td>${escapeHtml(row.performedAt)}</td>
        <td>${escapeHtml(row.performedBy)}</td>
        <td>${escapeHtml(row.controlType)}</td>
        <td>${escapeHtml(row.routine)}</td>
        <td>${escapeHtml(row.status)}</td>
        <td>${escapeHtml(row.values)}</td>
        <td>${escapeHtml(row.deviation)}</td>
        <td>${escapeHtml(row.action)}</td>
      </tr>
    `)
    .join('');
  const attachments = rows.flatMap((row) => row.attachments);
  const attachmentRows = attachments.map((attachment) => `
    <tr>
      <td>${escapeHtml(attachment.reference)}</td>
      <td>${escapeHtml(attachment.controlType)}</td>
      <td>${escapeHtml(attachment.fileName)}</td>
      <td>${escapeHtml(attachment.createdAt)}</td>
    </tr>
  `).join('');
  const attachmentImageSections = attachments
    .filter((attachment) => attachment.signedUrl)
    .map((attachment) => `
      <article class="attachment-card">
        <h3>${escapeHtml(attachment.reference)}</h3>
        <p>${escapeHtml(attachment.controlType)} - ${escapeHtml(attachment.performedAt)}</p>
        <p>${escapeHtml(attachment.fileName)}</p>
        <img src="${escapeHtml(attachment.signedUrl ?? '')}" alt="${escapeHtml(attachment.fileName)}" />
      </article>
    `)
    .join('');

  return `
    <!doctype html>
    <html lang="sv">
      <head>
        <title>Egenkontroll - rapport</title>
        <style>
          body { color: ${reportPalette.text}; font-family: Arial, sans-serif; padding: 24px; background: ${reportPalette.paper}; }
          h1, h2, h3, p { margin-top: 0; }
          .brand { display: flex; gap: 12px; align-items: center; margin-bottom: 18px; }
          .brand img { width: 42px; height: 42px; border-radius: 12px; object-fit: cover; }
          .brand h1 { margin: 0; }
          .muted { color: ${reportPalette.muted}; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 26px; }
          th, td { border: 1px solid ${reportPalette.border}; padding: 8px; text-align: left; vertical-align: top; }
          th { background: ${reportPalette.brandPale}; }
          .attachment-appendix { break-before: page; page-break-before: always; }
          .attachment-card { break-inside: avoid; page-break-inside: avoid; margin: 0 0 24px; border: 1px solid ${reportPalette.border}; border-radius: 14px; padding: 14px; }
          .attachment-card h3 { margin-bottom: 8px; color: ${reportPalette.brand}; }
          .attachment-card p { margin-bottom: 6px; color: ${reportPalette.muted}; }
          .attachment-card img { display: block; width: 100%; max-height: 620px; margin-top: 12px; border-radius: 10px; object-fit: contain; background: ${reportPalette.surfaceSubtle}; }
          @media print { body { padding: 0; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="brand">
          <img src="${escapeHtml(brandMarkUrl)}" alt="" />
          <div>
            <h1>Egenkontroll - rapport</h1>
            <p class="muted">Min Egenkontroll</p>
          </div>
        </div>
        <p class="no-print muted">Skapa PDF genom att välja "Spara som PDF" i utskriftsdialogen.</p>
        <table>
          <thead>
            <tr>
              <th>Tidpunkt</th>
              <th>Utförd av</th>
              <th>Kontrolltyp</th>
              <th>Rutin/instruktion</th>
              <th>Status</th>
              <th>Värden</th>
              <th>Avvikelse</th>
              <th>Åtgärd</th>
            </tr>
          </thead>
          <tbody>${htmlRows || '<tr><td colspan="8">Inga kontroller i urvalet.</td></tr>'}</tbody>
        </table>
        <h2>Bilagor</h2>
        <table>
          <thead>
            <tr>
              <th>Referens</th>
              <th>Kontroll</th>
              <th>Filnamn</th>
              <th>Registrerad</th>
            </tr>
          </thead>
          <tbody>${attachmentRows || '<tr><td colspan="4">Inga bilagor i urvalet.</td></tr>'}</tbody>
        </table>
        ${attachmentImageSections ? `
          <section class="attachment-appendix">
            <h2>Bildbilagor</h2>
            ${attachmentImageSections}
          </section>
        ` : ''}
        <script>
          Promise.all(Array.from(document.images).map((image) => {
            if (image.complete) return Promise.resolve();
            return new Promise((resolve) => {
              image.addEventListener('load', resolve, { once: true });
              image.addEventListener('error', resolve, { once: true });
            });
          })).finally(() => {
            window.focus();
            window.print();
          });
        </script>
      </body>
    </html>
  `;
}
