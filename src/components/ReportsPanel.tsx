import { useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import { collectReportRows, downloadCsvReport, openPrintReport } from '../services/reportService';

export type ReportsPanelProps = {
  organizationId: string;
};

export function ReportsPanel({ organizationId }: ReportsPanelProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function runCsv() {
    try {
      setLoading(true);
      setMessage('');
      const rows = await collectReportRows(organizationId, {});
      downloadCsvReport(rows);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte skapa CSV.');
    } finally {
      setLoading(false);
    }
  }

  async function runPrint() {
    try {
      setLoading(true);
      setMessage('');
      const rows = await collectReportRows(organizationId, {});
      openPrintReport(rows);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte skapa underlag.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="report-tools" aria-labelledby="reports-title">
      <div>
        <p className="eyebrow">Rapport</p>
        <h3 id="reports-title">Underlag</h3>
        <p className="muted-copy">Hämta CSV eller öppna utskriftsvänligt underlag.</p>
      </div>
      {message ? <p className="form-message error-message">{message}</p> : null}
      <div className="report-actions">
        <ActionButton type="button" variant="secondary" onClick={runCsv} disabled={loading}>CSV</ActionButton>
        <ActionButton type="button" variant="secondary" onClick={runPrint} disabled={loading}>Utskriftsvy</ActionButton>
      </div>
    </section>
  );
}
