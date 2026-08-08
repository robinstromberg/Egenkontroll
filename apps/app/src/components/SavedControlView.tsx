import { ActionButton } from './ui/ActionButton';
import './SavedControlView.css';

export type SavedControlSummary = {
  controlName: string;
  savedAt: string;
  performedBy: string;
  resultText?: string;
  hasOpenDeviation?: boolean;
};

type SavedControlViewProps = {
  summary: SavedControlSummary;
  onDone: () => void;
  onShowHistory: () => void;
};

function formatSavedAt(value: string): string {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function SavedControlView({ summary, onDone, onShowHistory }: SavedControlViewProps) {
  return (
    <section className="saved-control-view" aria-labelledby="saved-control-title">
      <div className="saved-success-mark" aria-hidden="true">
        <span className="saved-checkmark">✓</span>
      </div>

      <div className="saved-control-copy">
        <h3 id="saved-control-title">{summary.resultText ? `${summary.controlName} sparad` : 'Kontroll sparad'}</h3>
        <p>{summary.resultText ? 'Dokumentationen är sparad.' : 'All information är registrerad.'}</p>
      </div>

      <div className="saved-summary-card">
        <div>
          <span>Kontroll</span>
          <strong>{summary.controlName}</strong>
        </div>
        <div>
          <span>Datum och tid</span>
          <strong>{formatSavedAt(summary.savedAt)}</strong>
        </div>
        <div>
          <span>Utförd av</span>
          <strong>{summary.performedBy}</strong>
        </div>
        {summary.resultText ? (
          <div>
            <span>Resultat</span>
            <strong>{summary.resultText}</strong>
          </div>
        ) : null}
      </div>

      {summary.hasOpenDeviation ? (
        <p className="saved-open-deviation" role="status">En avvikelse är öppen och behöver följas upp.</p>
      ) : null}

      <button className="saved-history-button" type="button" onClick={onShowHistory}>
        <span>Visa i historik</span>
        <span aria-hidden="true">›</span>
      </button>

      <ActionButton type="button" onClick={onDone}>
        Klar
      </ActionButton>
    </section>
  );
}
