export type AttachmentState = {
  attachmentId: string;
  status: 'included' | 'omitted';
  source?: string | Uint8Array;
  reason?: string;
};

export type InspectorReportDocument = {
  title: string;
  summary: {
    companyName: string;
    generatedAt: string;
    periodStart: string;
    periodEnd: string;
    controlTypes: string;
    deviationFilter: string;
    search: string;
    sort: string;
    metrics: Array<{ value: number; label: string }>;
  };
  controlGroups: Array<{
    key: string;
    name: string;
    category: string;
    routine: string;
    columns: Array<{ key: string; label: string }>;
    hasOverflow: boolean;
    rows: Array<{
      performedAt: string;
      performer: string;
      values: string[];
      overflow: string;
      status: string;
      deviation: string;
      action: string;
      tone: string;
    }>;
  }>;
  deviations: Array<Record<string, string>>;
  attachments: Array<Record<string, string>>;
  attachmentImages: Array<{
    attachmentId: string;
    reference: string;
    controlType: string;
    performedAt: string;
    fileName: string;
    source: string | Uint8Array;
  }>;
  omittedAttachments: Array<{
    attachmentId: string;
    reference: string;
    fileName: string;
    reason: string;
  }>;
};

export function formatReportDateTime(value: string): string;
export function isReportImageAttachment(attachment: { content_type?: string | null; file_name?: string | null }): boolean;
export function readAttachmentReference(index: number): string;
export function selectInspectorReportRuns<T extends { run_id: string }>(runs: T[], input?: Record<string, unknown>): { runs: T[]; missingRunIds: string[] };
export function buildInspectorReportDocument(runs: unknown[], input?: Record<string, unknown>, attachmentStates?: AttachmentState[]): InspectorReportDocument;
