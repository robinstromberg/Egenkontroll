import { useRef, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import { collectReportRows, createPrintReportWindow, downloadCsvReport, openPrintReport } from '../services/reportService';

export type ReportsPanelProps = {
  organizationId: string;
};

export function ReportsPanel({ organizationId }: ReportsPanelProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const reportRequestActive = useRef(false);

  async function runCsv() {
    if (reportRequestActive.current) return;
    reportRequestActive.current = true;

    try {
      setLoading(true);
      setMessage('');
      const rows = await collectReportRows(organizationId, {});
      downloadCsvReport(rows);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte skapa CSV.');
    } finally {
      reportRequestActive.current = false;
      setLoading(false);
    }
  }

  async function runPrint() {
    if (reportRequestActive.current) return;

    const printWindow = createPrintReportWindow();
    if (!printWindow) {
      setMessage('Kunde inte öppna utskriftsvyn. Tillåt popup-fönster och försök igen.');
      return;
    }

    reportRequestActive.current = true;
    try {
      setLoading(true);
      setMessage('');
      const rows = await collectReportRows(organizationId, {});
      openPrintReport(rows, printWindow);
    } catch (error) {
      printWindow.close();
      setMessage(error instanceof Error ? error.message : 'Kunde inte skapa underlag.');
    } finally {
      reportRequestActive.current = false;
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
      {message ? <p className="form-message error-message" role="alert">{message}</p> : null}
      {loading ? <p className="muted-copy" role="status">Hämtar hela rapportunderlaget...</p> : null}
      <div className="report-actions">
        <ActionButton type="button" variant="secondary" onClick={runCsv} disabled={loading}>CSV</ActionButton>
        <ActionButton type="button" variant="secondary" onClick={runPrint} disabled={loading}>Utskriftsvy</ActionButton>
      </div>
    </section>
  );
}
