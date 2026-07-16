import { useEffect, useMemo, useState } from 'react';
import { appUiIcons } from '../config/assets';
import { getKpiAnalysis, getKpiSummary } from '../services/kpiService';
import type {
  KpiAnalysis,
  KpiDeliverySupplierTrend,
  KpiDeviationTrend,
  KpiSummary,
  KpiTemperatureUnitTrend,
  KpiTrendPoint,
} from '../services/kpiService';
import { AssetIcon } from './ui/AssetIcon';
import './KpiView.css';

export type KpiViewProps = {
  organizationId: string;
};

type AnalysisTab = 'temperature' | 'deliveries' | 'deviations';

function formatPercent(value: number | null): string {
  return value === null ? '-' : `${value} %`;
}

function formatResolved(summary: KpiSummary): string {
  if (summary.totalDeviations === 0) return 'Inga avvikelser';
  return `${summary.resolvedDeviations} av ${summary.totalDeviations}`;
}

function formatTemperature(value: number | null, unit = '°C'): string {
  return value === null ? '-' : `${value.toLocaleString('sv-SE')} ${unit}`;
}

function readLinePoints(points: KpiTrendPoint[], width: number, height: number): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `${width / 2},${height / 2}`;

  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);

  return points.map((point, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - ((point.value - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

function TrendChart({
  points,
  limitMax,
  emptyLabel,
}: {
  points: KpiTrendPoint[];
  limitMax?: number | null;
  emptyLabel: string;
}) {
  const width = 300;
  const height = 96;
  const values = points.map((point) => point.value);
  const min = values.length ? Math.min(...values, limitMax ?? values[0]) : 0;
  const max = values.length ? Math.max(...values, limitMax ?? values[0]) : 1;
  const range = Math.max(max - min, 1);
  const limitY = limitMax === null || limitMax === undefined
    ? null
    : height - ((limitMax - min) / range) * height;

  if (points.length < 2) {
    return <div className="kpi-chart-empty">{emptyLabel}</div>;
  }

  return (
    <svg className="kpi-line-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Trendkurva">
      {limitY !== null ? (
        <line className="kpi-limit-line" x1="0" x2={width} y1={limitY} y2={limitY} />
      ) : null}
      <polyline points={readLinePoints(points, width, height)} />
      <circle cx={width} cy={height} r="0" />
    </svg>
  );
}

function EmptyAnalysis({ title, text }: { title: string; text: string }) {
  return (
    <div className="kpi-empty-state">
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

function TemperatureAnalysis({
  analysis,
}: {
  analysis: KpiAnalysis;
}) {
  const [selectedUnitName, setSelectedUnitName] = useState('');
  const selectedUnit = useMemo<KpiTemperatureUnitTrend | null>(() => {
    if (analysis.temperatureUnits.length === 0) return null;
    return analysis.temperatureUnits.find((unit) => unit.unitName === selectedUnitName)
      ?? analysis.temperatureUnits[0];
  }, [analysis.temperatureUnits, selectedUnitName]);

  useEffect(() => {
    if (!selectedUnitName && analysis.temperatureUnits[0]) {
      setSelectedUnitName(analysis.temperatureUnits[0].unitName);
    }
  }, [analysis.temperatureUnits, selectedUnitName]);

  if (!selectedUnit) {
    return (
      <EmptyAnalysis
        title="Ingen temperaturhistorik än"
        text="När kyl, frys eller andra temperaturenheter har sparade kontroller visas trenden här."
      />
    );
  }

  return (
    <div className="kpi-analysis-stack">
      <label className="kpi-filter-label" htmlFor="kpi-temperature-unit">Enhet</label>
      <select
        className="text-input kpi-filter-input"
        id="kpi-temperature-unit"
        value={selectedUnit.unitName}
        onChange={(event) => setSelectedUnitName(event.target.value)}
      >
        {analysis.temperatureUnits.map((unit) => (
          <option value={unit.unitName} key={unit.unitName}>{unit.unitName}</option>
        ))}
      </select>

      <article className="kpi-analysis-card">
        <div className="kpi-analysis-heading">
          <div>
            <p className="eyebrow">Temperaturtrend</p>
            <h4>{selectedUnit.unitName}</h4>
          </div>
          <span className="kpi-status-pill">{selectedUnit.stabilityLabel}</span>
        </div>

        <TrendChart
          points={selectedUnit.readings}
          limitMax={selectedUnit.limitMax}
          emptyLabel="Minst två temperaturer behövs för trend."
        />

        <div className="kpi-metric-row">
          <span>Min <strong>{formatTemperature(selectedUnit.min, selectedUnit.unit)}</strong></span>
          <span>Medel <strong>{formatTemperature(selectedUnit.average, selectedUnit.unit)}</strong></span>
          <span>Max <strong>{formatTemperature(selectedUnit.max, selectedUnit.unit)}</strong></span>
        </div>
        <p className="muted-copy">
          {selectedUnit.deviationCount > 0
            ? `${selectedUnit.deviationCount} avvikelser markerade under perioden.`
            : 'Inga temperaturavvikelser markerade under perioden.'}
        </p>
      </article>
    </div>
  );
}

function DeliveryAnalysis({ analysis }: { analysis: KpiAnalysis }) {
  const [selectedSupplierName, setSelectedSupplierName] = useState('');
  const selectedSupplier = useMemo<KpiDeliverySupplierTrend | null>(() => {
    if (analysis.deliverySuppliers.length === 0) return null;
    return analysis.deliverySuppliers.find((supplier) => supplier.supplierName === selectedSupplierName)
      ?? analysis.deliverySuppliers[0];
  }, [analysis.deliverySuppliers, selectedSupplierName]);

  useEffect(() => {
    if (!selectedSupplierName && analysis.deliverySuppliers[0]) {
      setSelectedSupplierName(analysis.deliverySuppliers[0].supplierName);
    }
  }, [analysis.deliverySuppliers, selectedSupplierName]);

  if (!selectedSupplier) {
    return (
      <EmptyAnalysis
        title="Inga leveranser att analysera"
        text="När varumottagningar sparas med leverantör och temperatur visas leveranstrenden här."
      />
    );
  }

  return (
    <div className="kpi-analysis-stack">
      <label className="kpi-filter-label" htmlFor="kpi-supplier">Leverantör</label>
      <select
        className="text-input kpi-filter-input"
        id="kpi-supplier"
        value={selectedSupplier.supplierName}
        onChange={(event) => setSelectedSupplierName(event.target.value)}
      >
        {analysis.deliverySuppliers.map((supplier) => (
          <option value={supplier.supplierName} key={supplier.supplierName}>
            {supplier.supplierName}
          </option>
        ))}
      </select>

      <article className="kpi-analysis-card">
        <div className="kpi-analysis-heading">
          <div>
            <p className="eyebrow">Leveranstrend</p>
            <h4>{selectedSupplier.supplierName}</h4>
          </div>
          <span className="kpi-status-pill">{selectedSupplier.trendLabel}</span>
        </div>

        <TrendChart
          points={selectedSupplier.temperatureReadings}
          emptyLabel="Minst två leveranstemperaturer behövs för trend."
        />

        <div className="kpi-metric-row">
          <span>Leveranser <strong>{selectedSupplier.deliveries}</strong></span>
          <span>Medel <strong>{formatTemperature(selectedSupplier.average)}</strong></span>
          <span>Avvikelser <strong>{selectedSupplier.temperatureDeviationCount}</strong></span>
        </div>
      </article>
    </div>
  );
}

function DeviationBars({ trends }: { trends: KpiDeviationTrend[] }) {
  const maxValue = Math.max(1, ...trends.map((trend) => Math.max(trend.opened, trend.resolved)));

  return (
    <div className="kpi-bar-chart" aria-label="Avvikelser per vecka">
      {trends.map((trend) => (
        <div className="kpi-bar-group" key={trend.periodKey}>
          <div className="kpi-bars">
            <span style={{ height: `${Math.max(8, (trend.opened / maxValue) * 100)}%` }} />
            <span style={{ height: `${Math.max(8, (trend.resolved / maxValue) * 100)}%` }} />
          </div>
          <small>{trend.label}</small>
        </div>
      ))}
    </div>
  );
}

function DeviationAnalysis({ analysis }: { analysis: KpiAnalysis }) {
  const [selectedAreaName, setSelectedAreaName] = useState('all');
  const selectedArea = selectedAreaName === 'all'
    ? null
    : analysis.deviationAreas.find((area) => area.controlTypeName === selectedAreaName) ?? null;

  if (analysis.deviationTrends.every((trend) => trend.opened === 0 && trend.resolved === 0)) {
    return (
      <EmptyAnalysis
        title="Inga avvikelsetrender än"
        text="När avvikelser öppnas eller åtgärdas visas utvecklingen vecka för vecka här."
      />
    );
  }

  return (
    <div className="kpi-analysis-stack">
      <label className="kpi-filter-label" htmlFor="kpi-deviation-area">Kontrollområde</label>
      <select
        className="text-input kpi-filter-input"
        id="kpi-deviation-area"
        value={selectedAreaName}
        onChange={(event) => setSelectedAreaName(event.target.value)}
      >
        <option value="all">Alla kontrolltyper</option>
        {analysis.deviationAreas.map((area) => (
          <option value={area.controlTypeName} key={area.controlTypeName}>
            {area.controlTypeName}
          </option>
        ))}
      </select>

      <article className="kpi-analysis-card">
        <div className="kpi-analysis-heading">
          <div>
            <p className="eyebrow">Avvikelser över tid</p>
            <h4>{selectedArea?.controlTypeName ?? 'Alla kontrolltyper'}</h4>
          </div>
          <span className="kpi-status-pill">
            {formatPercent(analysis.resolvedDeviationShare)} åtgärdade
          </span>
        </div>

        <DeviationBars trends={selectedArea?.trends ?? analysis.deviationTrends} />

        {selectedArea ? (
          <div className="kpi-metric-row">
            <span>Öppnade <strong>{selectedArea.opened}</strong></span>
            <span>Åtgärdade <strong>{selectedArea.resolved}</strong></span>
          </div>
        ) : (
          <div className="kpi-risk-list">
            {analysis.deviationAreas.map((area) => (
              <div className="kpi-risk-row" key={area.controlTypeName}>
                <span>{area.controlTypeName}</span>
                <strong>{area.opened}</strong>
              </div>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}

export function KpiView({ organizationId }: KpiViewProps) {
  const [summary, setSummary] = useState<KpiSummary | null>(null);
  const [analysis, setAnalysis] = useState<KpiAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<AnalysisTab>('temperature');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadKpi() {
      try {
        setLoading(true);
        setMessage('');
        const [nextSummary, nextAnalysis] = await Promise.all([
          getKpiSummary(organizationId),
          getKpiAnalysis(organizationId),
        ]);
        if (active) {
          setSummary(nextSummary);
          setAnalysis(nextAnalysis);
        }
      } catch (error) {
        if (active) {
          setMessage(error instanceof Error ? error.message : 'Kunde inte läsa KPI-vyn.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadKpi();

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
                  ? `${summary.completedControls} av ${summary.plannedControls} som hittills borde vara gjorda`
                  : 'Uppföljning byggs upp över tid'}
              </small>
            </article>

            <article className="kpi-card">
              <span className="kpi-card-icon" aria-hidden="true">
                <AssetIcon src={appUiIcons.history} fallback="H" />
              </span>
              <strong>{summary.completedControls}</strong>
              <span>kontroller utförda</span>
              <small>
                {summary.countedDays === summary.periodDays
                  ? `senaste ${summary.periodDays} dagarna`
                  : `under de första ${summary.countedDays} dagarna`}
              </small>
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
              <strong>{summary.documentationDays} av {summary.countedDays}</strong>
              <span>dagar med dokumentation</span>
              <small>
                {summary.countedDays === summary.periodDays
                  ? 'tillsynsberedskap'
                  : `${summary.countedDays} dagar räknas hittills`}
              </small>
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

      {analysis ? (
        <section className="kpi-analysis-panel" aria-labelledby="kpi-analysis-title">
          <div className="kpi-analysis-heading">
            <div>
              <p className="eyebrow">Analys</p>
              <h3 id="kpi-analysis-title">Trender senaste {analysis.periodDays} dagarna</h3>
            </div>
          </div>

          <div className="kpi-tab-list" aria-label="Analysområde">
            <button
              className={activeTab === 'temperature' ? 'active' : ''}
              type="button"
              onClick={() => setActiveTab('temperature')}
            >
              Temperaturer
            </button>
            <button
              className={activeTab === 'deliveries' ? 'active' : ''}
              type="button"
              onClick={() => setActiveTab('deliveries')}
            >
              Leveranser
            </button>
            <button
              className={activeTab === 'deviations' ? 'active' : ''}
              type="button"
              onClick={() => setActiveTab('deviations')}
            >
              Avvikelser
            </button>
          </div>

          {activeTab === 'temperature' ? <TemperatureAnalysis analysis={analysis} /> : null}
          {activeTab === 'deliveries' ? <DeliveryAnalysis analysis={analysis} /> : null}
          {activeTab === 'deviations' ? <DeviationAnalysis analysis={analysis} /> : null}
        </section>
      ) : null}
    </section>
  );
}
