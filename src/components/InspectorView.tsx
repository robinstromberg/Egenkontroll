import { AccessRunList } from './AccessRunList';
import './InspectorView.css';

export type InspectorViewProps = {
  shareKey: string;
};

export function InspectorView({ shareKey }: InspectorViewProps) {
  return (
    <main className="inspector-view">
      <section className="inspector-card" aria-labelledby="inspector-title">
        <div>
          <p className="eyebrow">Read-only</p>
          <h1 id="inspector-title">Inspektörsvy</h1>
          <p className="muted-copy">
            Delad egenkontrollhistorik visas här. Vyn är endast läsbar.
          </p>
        </div>
        <AccessRunList shareKey={shareKey} />
      </section>
    </main>
  );
}
