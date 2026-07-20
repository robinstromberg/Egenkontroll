import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import PDFDocument from 'pdfkit';

const COLORS = {
  text: '#172033',
  muted: '#5f6b85',
  brand: '#5b46e1',
  brandPale: '#f0edff',
  border: '#d9deea',
  danger: '#fff5f6',
  success: '#f1fbf5',
  paper: '#ffffff',
  temperature: '#059669',
  checklist: '#2563eb',
  receiving: '#d97706',
  traceability: '#5b46e1',
  round: '#0891b2',
  custom: '#6b7280',
};

const PAGE = { size: 'A4', layout: 'landscape', margin: 34 };
const BODY_FONT = 'Helvetica';
const BOLD_FONT = 'Helvetica-Bold';

function safeText(value) {
  if (value === null || value === undefined || value === '') return '';
  return String(value);
}

function pageBottom(doc) {
  return doc.page.height - doc.page.margins.bottom - 18;
}

function addReportPage(doc, options = PAGE) {
  doc.addPage(options);
  doc.fillColor(COLORS.text).font(BODY_FONT).fontSize(8);
}

function ensureSpace(doc, height) {
  if (doc.y + height <= pageBottom(doc)) return;
  addReportPage(doc);
}

function drawSectionHeading(doc, title, minimumFollowingHeight = 0) {
  ensureSpace(doc, 28 + minimumFollowingHeight);
  const x = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  doc.x = x;
  doc.moveDown(0.6).fillColor(COLORS.text).font(BOLD_FONT).fontSize(14).text(title, x, doc.y, { width });
  doc.moveDown(0.35);
}

function drawReportHeader(doc, report, brandIcon) {
  const x = doc.page.margins.left;
  const y = doc.page.margins.top;
  if (brandIcon) doc.image(brandIcon, x, y, { fit: [42, 42] });
  doc.fillColor(COLORS.text).font(BOLD_FONT).fontSize(20).text(report.title, x + 54, y + 2);
  doc.fillColor(COLORS.muted).font(BODY_FONT).fontSize(10).text(report.summary.companyName, x + 54, y + 27);
  doc.fontSize(8).text(`Skapad: ${report.summary.generatedAt}`, x + 54, y + 42);
  doc.y = y + 64;
}

function drawSelection(doc, summary) {
  const x = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const lines = [
    ['Period', `${summary.periodStart} – ${summary.periodEnd}`],
    ['Kontrolltyper', summary.controlTypes],
    ['Avvikelsefilter', summary.deviationFilter],
    ['Sökning', summary.search],
    ['Sortering', summary.sort],
  ];
  const labelWidth = 86;
  const contentWidth = width - labelWidth - 24;
  const lineHeights = lines.map(([, value]) => Math.max(12, doc.font(BODY_FONT).fontSize(8).heightOfString(safeText(value), { width: contentWidth })));
  const height = lineHeights.reduce((sum, value) => sum + value, 0) + 31;
  ensureSpace(doc, height);
  const y = doc.y;
  doc.roundedRect(x, y, width, height, 10).fillAndStroke('#fbfbfe', COLORS.border);
  doc.fillColor(COLORS.text).font(BOLD_FONT).fontSize(11).text('Urval', x + 12, y + 10);
  let rowY = y + 29;
  lines.forEach(([label, value], index) => {
    doc.fillColor(COLORS.text).font(BOLD_FONT).fontSize(8).text(`${label}:`, x + 12, rowY, { width: labelWidth });
    doc.font(BODY_FONT).text(safeText(value), x + 12 + labelWidth, rowY, { width: contentWidth });
    rowY += lineHeights[index];
  });
  doc.y = y + height + 12;
}

function drawMetrics(doc, metrics) {
  const x = doc.page.margins.left;
  const available = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const gap = 8;
  const width = (available - gap * (metrics.length - 1)) / metrics.length;
  const height = 48;
  ensureSpace(doc, height + 8);
  const y = doc.y;
  metrics.forEach((metric, index) => {
    const cardX = x + index * (width + gap);
    doc.roundedRect(cardX, y, width, height, 9).fillAndStroke('#f7f5ff', '#ddd8ff');
    doc.fillColor(COLORS.text).font(BOLD_FONT).fontSize(17).text(safeText(metric.value), cardX + 10, y + 8, { width: width - 20 });
    doc.fillColor(COLORS.muted).font(BODY_FONT).fontSize(7.5).text(metric.label, cardX + 10, y + 29, { width: width - 20 });
  });
  doc.x = x;
  doc.y = y + height + 8;
}

function cellValue(cell) {
  return typeof cell === 'object' && cell !== null ? safeText(cell.text) : safeText(cell);
}

function drawTableHeader(doc, headers, widths) {
  const x = doc.page.margins.left;
  const y = doc.y;
  const height = Math.max(23, ...headers.map((header, index) => doc.font(BOLD_FONT).fontSize(6.4)
    .heightOfString(cellValue(header), { width: widths[index] - 8 }) + 9));
  let cursorX = x;
  headers.forEach((header, index) => {
    doc.rect(cursorX, y, widths[index], height).fillAndStroke(COLORS.brandPale, COLORS.border);
    doc.fillColor(COLORS.text).font(BOLD_FONT).fontSize(6.4).text(cellValue(header), cursorX + 4, y + 5, {
      width: widths[index] - 8,
      height: height - 8,
    });
    cursorX += widths[index];
  });
  doc.y = y + height;
}

function drawTable(doc, headers, rows, widths, emptyMessage, options = {}) {
  const available = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const normalizedWidths = widths.map((width) => width * (available / widths.reduce((sum, value) => sum + value, 0)));
  const repeatHeader = () => drawTableHeader(doc, headers, normalizedWidths);
  ensureSpace(doc, 48);
  repeatHeader();

  const tableRows = rows.length ? rows : [{ cells: [emptyMessage, ...headers.slice(1).map(() => '')] }];
  tableRows.forEach((row) => {
    const cells = row.cells ?? row;
    const fontSize = options.fontSize ?? 6.2;
    const heights = cells.map((cell, index) => doc.font(BODY_FONT).fontSize(fontSize)
      .heightOfString(cellValue(cell), { width: normalizedWidths[index] - 8 }));
    const rowHeight = Math.max(22, ...heights.map((height) => height + 9));
    if (doc.y + rowHeight > pageBottom(doc)) {
      addReportPage(doc);
      repeatHeader();
    }
    const y = doc.y;
    let cursorX = doc.page.margins.left;
    const background = row.tone === 'danger' ? COLORS.danger : row.tone === 'success' ? COLORS.success : COLORS.paper;
    cells.forEach((cell, index) => {
      doc.rect(cursorX, y, normalizedWidths[index], rowHeight).fillAndStroke(background, COLORS.border);
      if (index === 0 && row.category) {
        doc.rect(cursorX, y, 4, rowHeight).fill(COLORS[row.category] ?? COLORS.custom);
      }
      doc.fillColor(COLORS.text).font(BODY_FONT).fontSize(fontSize).text(cellValue(cell), cursorX + 5, y + 5, {
        width: normalizedWidths[index] - 9,
        height: rowHeight - 9,
      });
      cursorX += normalizedWidths[index];
    });
    doc.y = y + rowHeight;
  });
  doc.x = doc.page.margins.left;
  doc.moveDown(0.6);
}

function drawControlGroups(doc, report) {
  drawSectionHeading(doc, 'Utförda kontroller');
  if (!report.controlGroups.length) {
    doc.font(BODY_FONT).fontSize(8).text('Inga kontroller i urvalet.');
    return;
  }
  report.controlGroups.forEach((group) => {
    ensureSpace(doc, 58);
    const x = doc.page.margins.left;
    const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    doc.x = x;
    doc.fillColor(COLORS.text).font(BOLD_FONT).fontSize(11).text(group.name || 'Kontroll', x, doc.y, { width });
    if (group.routine) {
      doc.fillColor(COLORS.muted).font(BODY_FONT).fontSize(7.5).text(`Rutin: ${group.routine}`, x, doc.y, { width });
    }
    doc.moveDown(0.35);
    const headers = ['Datum', 'Utförd av', ...group.columns.map((column) => column.label), ...(group.hasOverflow ? ['Övrigt'] : []), 'Status', 'Avvikelse', 'Åtgärd'];
    const widths = [58, 64, ...group.columns.map(() => 47), ...(group.hasOverflow ? [72] : []), 43, 78, 78];
    const rows = group.rows.map((row) => ({
      category: group.category,
      tone: row.tone,
      cells: [row.performedAt, row.performer, ...row.values, ...(group.hasOverflow ? [row.overflow] : []), row.status, row.deviation, row.action],
    }));
    drawTable(doc, headers, rows, widths, 'Inga kontroller i gruppen.', { fontSize: headers.length > 12 ? 5.5 : 6.2 });
  });
}

function drawDeviations(doc, report) {
  drawSectionHeading(doc, 'Avvikelser', 46);
  const headers = ['Datum', 'Utförd av', 'Kontroll', 'Status', 'Allvar', 'Beskrivning', 'Åtgärd', 'Löst'];
  const rows = report.deviations.map((deviation) => ({
    tone: deviation.status === 'resolved' ? 'success' : 'danger',
    cells: [deviation.performedAt, deviation.performer, deviation.controlType, deviation.status, deviation.severity, deviation.description, deviation.action, deviation.resolvedAt],
  }));
  drawTable(doc, headers, rows, [62, 70, 88, 54, 52, 164, 164, 70], 'Inga avvikelser i urvalet.');
}

function drawAttachments(doc, report) {
  drawSectionHeading(doc, 'Bilagor', 46);
  const headers = ['Datum', 'Utförd av', 'Kontroll', 'Fil', 'Referens', 'Registrerad'];
  const rows = report.attachments.map((attachment) => ({
    cells: [attachment.performedAt, attachment.performer, attachment.controlType, attachment.fileName, attachment.reference, attachment.createdAt],
  }));
  drawTable(doc, headers, rows, [72, 86, 120, 220, 82, 92], 'Inga bilagor i urvalet.');

  if (report.omittedAttachments.length) {
    ensureSpace(doc, 54);
    const text = report.omittedAttachments
      .map((attachment) => `${attachment.reference}: ${attachment.fileName} – ${attachment.reason}`)
      .join('\n');
    const height = Math.max(48, doc.font(BODY_FONT).fontSize(8).heightOfString(text, { width: 690 }) + 32);
    const x = doc.page.margins.left;
    const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    doc.roundedRect(x, doc.y, width, height, 9).fillAndStroke('#fff8e8', '#d97706');
    const y = doc.y;
    doc.fillColor(COLORS.text).font(BOLD_FONT).fontSize(9).text('Några bildbilagor kunde inte tas med', x + 12, y + 10);
    doc.font(BODY_FONT).fontSize(8).text(text, x + 12, y + 26, { width: width - 24 });
    doc.x = x;
    doc.y = y + height + 8;
  }
}

function drawImageAppendix(doc, report) {
  if (!report.attachmentImages.length) return;
  report.attachmentImages.forEach((image) => {
    addReportPage(doc, { size: 'A4', layout: 'portrait', margin: 36 });
    doc.fillColor(COLORS.brand).font(BOLD_FONT).fontSize(15).text(image.reference);
    doc.fillColor(COLORS.text).font(BOLD_FONT).fontSize(11).text(image.controlType);
    doc.fillColor(COLORS.muted).font(BODY_FONT).fontSize(8).text(`${image.performedAt} · ${image.fileName}`);
    doc.moveDown(0.8);
    const imageY = doc.y;
    const maxWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const maxHeight = pageBottom(doc) - imageY;
    try {
      doc.image(image.source, doc.page.margins.left, imageY, { fit: [maxWidth, maxHeight], align: 'center', valign: 'center' });
    } catch {
      doc.roundedRect(doc.page.margins.left, imageY, maxWidth, 72, 9).fillAndStroke('#fff8e8', '#d97706');
      doc.fillColor(COLORS.text).font(BODY_FONT).fontSize(9).text('Bilden kunde inte renderas i PDF-filen. Filreferensen finns kvar i bilagetabellen.', doc.page.margins.left + 12, imageY + 18, { width: maxWidth - 24 });
    }
  });
}

function addPageFooters(doc) {
  const range = doc.bufferedPageRange();
  for (let index = range.start; index < range.start + range.count; index += 1) {
    doc.switchToPage(index);
    const text = `Min Egenkontroll · Sida ${index + 1} av ${range.count}`;
    doc.fillColor(COLORS.muted).font(BODY_FONT).fontSize(7).text(text, doc.page.margins.left, doc.page.height - doc.page.margins.bottom - 9, {
      width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
      align: 'right',
      lineBreak: false,
    });
  }
}

export function buildInspectorReportPdf(report, options = {}) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const doc = new PDFDocument({
      autoFirstPage: false,
      bufferPages: true,
      compress: true,
      info: {
        Title: report.title,
        Author: 'Min Egenkontroll',
        Subject: `Egenkontrollrapport för ${report.summary.companyName}`,
      },
    });
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    try {
      const brandIcon = options.brandIcon ?? readFileSync(new URL('../../public/brand/min-egenkontroll-icon.png', import.meta.url));
      addReportPage(doc);
      drawReportHeader(doc, report, brandIcon);
      drawSelection(doc, report.summary);
      drawMetrics(doc, report.summary.metrics);
      drawControlGroups(doc, report);
      drawDeviations(doc, report);
      drawAttachments(doc, report);
      drawImageAppendix(doc, report);
      addPageFooters(doc);
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
