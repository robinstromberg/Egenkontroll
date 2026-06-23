import { useEffect, useState } from 'react';
import { appUiIcons } from '../config/assets';
import { getKpiSummary } from '../services/kpiService';
import type { KpiSummary } from '../services/kpiService';
import { AssetIcon } from './ui/AssetIcon';
import './KpiView.css';

export type KpiViewProps = {
  organizationId: string;
};

function formatPercent(value: number | null): string {
  return value === null ? '-' : `${value} %`;
}

function formatResolved(summary: KpiSummary): string {
  if (summary.totalDeviations === 0) return 'Inga avvikelser';
  return `${summary.resolvedDeviations} av ${summary.totalDeviations}`;
}

export function KpiView({ organizationId }: KpiViewProps) {
  const [summary, setSummary] = useState<KpiSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      try {
        setLoading(true);
        setMessage('');
        const nextSummary = await getKpiSummary(organizationId);
        if (active) setSummary(nextSummary);
      } catch (error) {
        if (active) {
          setMessage(error instanceof Error ? error.message : 'Kunde inte läsa KPI-vyn.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadSummary();

    return () => {
      active = false;
    };
  }, [organizationId]);

  return (
    <section className="kpi-view" aria-labelledby="kpi-title">
      <div className="kpi-hero">
        <span className="kpi-hero-icon" aria-hidden="true">
          <AssetIcon src={appUiIcons.kpi} fallback="KPI" />
        </span>
        <div>
          <p className="eyebrow">KPI</p>
          <h3 id="kpi-title">Överblick senaste 30 dagarna</h3>
          <p className="muted-copy">Nyckeltal för dokumentation, följsamhet och avvikelser.</p>
        </div>
      </div>

      {message ? <p className="form-message error-message">{message}</p> : null}
      {loading ? <p className="muted-copy">Laddar KPI...</p> : null}

      {summary ? (
        <>
          <div className="kpi-grid" aria-label="Nyckeltal">
            <article className="kpi-card highlight">
              <span className="kpi-card-icon" aria-hidden="true">
                <AssetIcon src={appUiIcons.document} fallback="D" />
              </span>
              <strong>{summary.currentDocumentationStreak} dagar</strong>
              <span>obruten dokumentation</span>
              <small>Längsta period: {summary.longestDocumentationStreak} dagar</small>
            </article>

            <article className="kpi-card">
              <span className="kpi-card-icon" aria-hidden="true">
                <AssetIcon src={appUiIcons.kpi} fallback="%" />
              </span>
              <strong>{formatPercent(summary.compliancePercent)}</strong>
              <span>av planerade kontroller utförda</span>
              <small>
                {summary.plannedControls > 0
                  ? `${summary.completedControls} av ${summary.plannedControls} planerade`
                  : 'Ingen planerad frekvens hittad'}
              </small>
            </article>

            <article className="kpi-card">
              <span className="kpi-card-icon" aria-hidden="true">
                <AssetIcon src={appUiIcons.history} fallback="H" />
              </span>
              <strong>{summary.completedControls}</strong>
              <span>kontroller utförda</span>
              <small>senaste {summary.periodDays} dagarna</small>
            </article>

            <article className={summary.openDeviations > 0 ? 'kpi-card warning' : 'kpi-card'}>
              <span className="kpi-card-icon" aria-hidden="true">
                <AssetIcon src={appUiIcons.deviation} fallback="!" />
              </span>
              <strong>{summary.openDeviations}</strong>
              <span>öppna avvikelser</span>
              <small>{summary.openDeviations > 0 ? 'behöver hanteras' : 'inga öppna avvikelser'}</small>
            </article>

            <article className="kpi-card">
              <span className="kpi-card-icon" aria-hidden="true">
                <AssetIcon src={appUiIcons.action} fallback="Å" />
              </span>
              <strong>{formatResolved(summary)}</strong>
              <span>åtgärdade avvikelser</span>
              <small>under vald period</small>
            </article>

            <article className="kpi-card">
              <span className="kpi-card-icon" aria-hidden="true">
                <AssetIcon src={appUiIcons.document} fallback="D" />
              </span>
              <strong>{summary.documentationDays} av {summary.periodDays}</strong>
              <span>dagar med dokumentation</span>
              <small>tillsynsberedskap</small>
            </article>
          </div>

          <section className="kpi-risk-card" aria-labelledby="risk-title">
            <div>
              <p className="eyebrow">Riskområden</p>
              <h4 id="risk-title">Avvikelser per kontrolltyp</h4>
            </div>
            {summary.riskAreas.length ? (
              <div className="kpi-risk-list">
                {summary.riskAreas.map((riskArea) => (
                  <div className="kpi-risk-row" key={riskArea.name}>
                    <span>{riskArea.name}</span>
                    <strong>{riskArea.deviationCount}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted-copy">Inga riskområden syns under perioden.</p>
            )}
          </section>
        </>
      ) : null}
    </section>
  );
}
