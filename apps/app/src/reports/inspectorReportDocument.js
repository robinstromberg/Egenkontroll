const MAX_REPORT_VALUE_COLUMNS = 10;
const REPORT_TIME_ZONE = 'Europe/Stockholm';

function array(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueNonEmpty(values) {
  return [...new Set(values.map((value) => String(value ?? '').trim()).filter(Boolean))];
}

export function formatReportDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: REPORT_TIME_ZONE,
  }).format(date);
}

function readSnapshotLabel(snapshot, fallback) {
  return snapshot && typeof snapshot.name === 'string' ? snapshot.name : fallback;
}

function readFieldLabel(snapshot) {
  return snapshot && typeof snapshot.label === 'string' ? snapshot.label : 'Fält';
}

function readItemValue(item) {
  if (item.value_text) return item.value_text;
  if (item.value_number !== null && item.value_number !== undefined) return String(item.value_number);
  if (item.value_boolean !== null && item.value_boolean !== undefined) return item.value_boolean ? 'Ja' : 'Nej';
  if (item.value_date) return item.value_date;
  if (item.value_json && Object.keys(item.value_json).length > 0) return JSON.stringify(item.value_json);
  return 'Ej angivet';
}

function readObjectInstructions(item) {
  return typeof item.object_snapshot?.instructions === 'string' && item.object_snapshot.instructions.trim()
    ? item.object_snapshot.instructions
    : null;
}

function readRunRoutineSummary(run) {
  return uniqueNonEmpty([
    run.control_type_instructions,
    ...array(run.items).map((item) => {
      const instructions = readObjectInstructions(item);
      return instructions ? `${readSnapshotLabel(item.object_snapshot, 'Kontrollpunkt')}: ${instructions}` : '';
    }),
  ]).join('; ');
}

function countOpenDeviations(run) {
  return array(run.deviations).filter((deviation) => deviation.status !== 'resolved').length;
}

function countResolvedDeviations(run) {
  return array(run.deviations).filter((deviation) => deviation.status === 'resolved').length;
}

function readRunStatusLabel(run) {
  const hasItemDeviation = array(run.items).some((item) => item.deviation_detected);
  if (countOpenDeviations(run) > 0 || hasItemDeviation || run.status === 'completed_with_deviation') return 'Avvikelse';
  if (run.status === 'completed') return 'OK';
  return run.status || 'Registrerad';
}

function readRunPerformerName(run) {
  return String(run.performer_name ?? '').trim() || 'Okänd användare';
}

function readReportCellLabel(item) {
  const objectLabel = readSnapshotLabel(item.object_snapshot, 'Kontrollpunkt');
  const fieldLabel = readFieldLabel(item.field_snapshot);
  return fieldLabel === 'Status' ? objectLabel : `${objectLabel} · ${fieldLabel}`;
}

function readReportValueCells(run) {
  const cells = new Map();
  for (const item of array(run.items)) {
    const label = readReportCellLabel(item);
    const current = cells.get(label);
    const value = readItemValue(item);
    if (current) current.value = uniqueNonEmpty([current.value, value]).join('; ');
    else cells.set(label, { key: label, label, value });
  }
  return [...cells.values()];
}

function readRunDeviationSummary(run) {
  return uniqueNonEmpty([
    ...array(run.items).filter((item) => item.deviation_detected).map((item) => item.deviation_reason || 'Avvikelse'),
    ...array(run.deviations).map((deviation) => deviation.description),
  ]).join('; ');
}

function readRunActionSummary(run) {
  return uniqueNonEmpty([
    ...array(run.items).map((item) => item.action_text),
    ...array(run.deviations).map((deviation) => deviation.action_text),
  ]).join('; ');
}

function readDeviationLabel(run) {
  const open = countOpenDeviations(run);
  const resolved = countResolvedDeviations(run);
  if (open > 0) return `${open} öppna`;
  if (resolved > 0) return `${resolved} lösta`;
  return 'Inga';
}

function readTone(run) {
  if (countOpenDeviations(run) > 0) return 'danger';
  if (countResolvedDeviations(run) > 0) return 'success';
  return 'neutral';
}

function readCategory(category) {
  return ['temperature', 'checklist', 'receiving', 'traceability', 'round'].includes(category)
    ? category
    : 'custom';
}

export function isReportImageAttachment(attachment) {
  if (attachment.content_type?.startsWith('image/')) return true;
  return /\.(avif|gif|jpe?g|png|webp)$/i.test(attachment.file_name ?? '');
}

export function readAttachmentReference(index) {
  let value = index + 1;
  let label = '';
  while (value > 0) {
    value -= 1;
    label = String.fromCharCode(65 + (value % 26)) + label;
    value = Math.floor(value / 26);
  }
  return `Bilaga ${label}`;
}

function matchesDeviationFilter(run, filter) {
  const open = countOpenDeviations(run);
  const resolved = countResolvedDeviations(run);
  if (filter === 'with-open') return open > 0;
  if (filter === 'with-resolved') return resolved > 0 && open === 0;
  if (filter === 'without') return array(run.deviations).length === 0;
  return true;
}

function matchesSearch(run, query) {
  const normalized = String(query ?? '').trim().toLowerCase();
  if (!normalized) return true;
  const text = [
    run.control_type_name,
    run.control_type_category,
    run.control_type_instructions,
    run.status,
    run.notes,
    readRunPerformerName(run),
    readRunRoutineSummary(run),
    ...array(run.items).map((item) => JSON.stringify([
      item.object_snapshot,
      item.field_snapshot,
      readItemValue(item),
      item.deviation_reason,
      item.action_text,
    ])),
    ...array(run.deviations).map((deviation) => JSON.stringify(deviation)),
    ...array(run.attachments).map((attachment) => attachment.file_name ?? ''),
  ].join(' ').toLowerCase();
  return text.includes(normalized);
}

function sortRuns(runs, sortKey) {
  return [...runs].sort((first, second) => {
    if (sortKey === 'performed-asc') return new Date(first.performed_at) - new Date(second.performed_at);
    if (sortKey === 'control-type') return String(first.control_type_name || '').localeCompare(String(second.control_type_name || ''), 'sv-SE');
    if (sortKey === 'deviation-status') {
      return countOpenDeviations(second) - countOpenDeviations(first)
        || countResolvedDeviations(second) - countResolvedDeviations(first)
        || new Date(second.performed_at) - new Date(first.performed_at);
    }
    return new Date(second.performed_at) - new Date(first.performed_at);
  });
}

export function selectInspectorReportRuns(runs, input = {}) {
  const authorizedRuns = array(runs);
  if (Array.isArray(input.visibleRunIds)) {
    const byId = new Map(authorizedRuns.map((run) => [run.run_id, run]));
    const requestedIds = [...new Set(input.visibleRunIds.filter((id) => typeof id === 'string'))];
    const selected = requestedIds.map((id) => byId.get(id)).filter(Boolean);
    const missingRunIds = requestedIds.filter((id) => !byId.has(id));
    return { runs: selected, missingRunIds };
  }

  return {
    runs: sortRuns(
      authorizedRuns.filter((run) => matchesDeviationFilter(run, input.deviationFilter) && matchesSearch(run, input.searchQuery)),
      input.sort,
    ),
    missingRunIds: [],
  };
}

export function buildInspectorReportDocument(runs, input = {}, attachmentStates = []) {
  const safeRuns = array(runs);
  const stateByAttachmentId = new Map(array(attachmentStates).map((state) => [state.attachmentId, state]));
  const imagePairs = safeRuns.flatMap((run) => array(run.attachments)
    .filter(isReportImageAttachment)
    .map((attachment) => ({ run, attachment })));
  const referenceByAttachmentId = new Map(imagePairs.map(({ attachment }, index) => [attachment.id, readAttachmentReference(index)]));

  const controlGroupsById = new Map();
  for (const run of safeRuns) {
    const key = run.control_type_id || run.control_type_name;
    const group = controlGroupsById.get(key) ?? { key, name: run.control_type_name, category: readCategory(run.control_type_category), routine: readRunRoutineSummary(run), runs: [] };
    group.runs.push(run);
    controlGroupsById.set(key, group);
  }
  const controlGroups = [...controlGroupsById.values()].map((group) => {
    const columnsByKey = new Map();
    for (const run of group.runs) for (const cell of readReportValueCells(run)) if (!columnsByKey.has(cell.key)) columnsByKey.set(cell.key, { key: cell.key, label: cell.label });
    const allColumns = [...columnsByKey.values()];
    if (allColumns.length === 0) allColumns.push({ key: '__registration', label: 'Registrering' });
    const columns = allColumns.slice(0, MAX_REPORT_VALUE_COLUMNS);
    const overflowColumns = allColumns.slice(MAX_REPORT_VALUE_COLUMNS);
    return {
      key: group.key,
      name: group.name,
      category: group.category,
      routine: group.routine,
      columns,
      hasOverflow: overflowColumns.length > 0,
      rows: group.runs.map((run) => {
        const cells = new Map(readReportValueCells(run).map((cell) => [cell.key, cell.value]));
        return {
          performedAt: formatReportDateTime(run.performed_at),
          performer: readRunPerformerName(run),
          values: columns.map((column) => column.key === '__registration' ? 'Registrerad' : cells.get(column.key) ?? ''),
          overflow: overflowColumns.map((column) => cells.has(column.key) ? `${column.label}: ${cells.get(column.key)}` : '').filter(Boolean).join('; '),
          status: readRunStatusLabel(run),
          deviation: readRunDeviationSummary(run) || readDeviationLabel(run),
          action: readRunActionSummary(run),
          tone: readTone(run),
        };
      }),
    };
  });

  const deviations = safeRuns.flatMap((run) => array(run.deviations).map((deviation) => ({
    performedAt: formatReportDateTime(run.performed_at),
    performer: readRunPerformerName(run),
    controlType: run.control_type_name,
    status: deviation.status,
    severity: deviation.severity,
    description: deviation.description,
    action: deviation.action_text,
    resolvedAt: deviation.resolved_at ? formatReportDateTime(deviation.resolved_at) : '',
  })));
  const attachments = safeRuns.flatMap((run) => array(run.attachments).map((attachment) => ({
    id: attachment.id,
    performedAt: formatReportDateTime(run.performed_at),
    performer: readRunPerformerName(run),
    controlType: run.control_type_name,
    fileName: attachment.file_name || 'Bilaga',
    reference: referenceByAttachmentId.get(attachment.id) ?? '',
    createdAt: attachment.created_at ? formatReportDateTime(attachment.created_at) : '',
  })));
  const attachmentImages = imagePairs.flatMap(({ run, attachment }) => {
    const state = stateByAttachmentId.get(attachment.id);
    return state?.status === 'included' ? [{
      attachmentId: attachment.id,
      reference: referenceByAttachmentId.get(attachment.id),
      controlType: run.control_type_name,
      performedAt: formatReportDateTime(run.performed_at),
      fileName: attachment.file_name || 'Bilaga',
      source: state.source,
    }] : [];
  });
  const omittedAttachments = imagePairs.flatMap(({ attachment }) => {
    const state = stateByAttachmentId.get(attachment.id);
    return state?.status === 'included' ? [] : [{
      attachmentId: attachment.id,
      reference: referenceByAttachmentId.get(attachment.id),
      fileName: attachment.file_name || 'Bilaga',
      reason: state?.reason || 'Bilden kunde inte läsas in.',
    }];
  });

  const generatedAt = input.generatedAt || new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: REPORT_TIME_ZONE,
  }).format(new Date());
  return {
    title: 'Egenkontroll - rapport',
    summary: {
      companyName: input.companyName || safeRuns[0]?.organization_name || 'Verksamhet',
      generatedAt,
      periodStart: input.periodStart || '',
      periodEnd: input.periodEnd || '',
      controlTypes: Array.isArray(input.controlTypeNames) ? input.controlTypeNames.join(', ') || 'Valda kontrolltyper' : input.controlTypes || 'Valda kontrolltyper',
      deviationFilter: input.deviationFilterLabel || input.deviationFilter || 'Alla kontroller',
      search: String(input.searchQuery ?? input.search ?? '').trim() || 'Ingen',
      sort: input.sortLabel || input.sort || 'Senaste först',
      metrics: [
        { value: safeRuns.length, label: 'kontroller' },
        { value: new Set(safeRuns.map((run) => String(run.performed_at).slice(0, 10))).size, label: 'dokumenterade dagar' },
        { value: safeRuns.reduce((sum, run) => sum + array(run.items).length, 0), label: 'kontrollpunkter' },
        { value: safeRuns.reduce((sum, run) => sum + countOpenDeviations(run), 0), label: 'öppna avvikelser' },
        { value: safeRuns.reduce((sum, run) => sum + countResolvedDeviations(run), 0), label: 'åtgärdade avvikelser' },
      ],
    },
    controlGroups,
    deviations,
    attachments,
    attachmentImages,
    omittedAttachments,
  };
}
