import './MenuDestinationView.css';

export type HelpViewProps = {
  onBack: () => void;
};

const helpItems = [
  {
    title: 'Dagens kontroller',
    text: 'Starta från Idag, utför kontrollen och spara direkt när alla obligatoriska fält är ifyllda.',
  },
  {
    title: 'Avvikelser',
    text: 'När ett värde är utanför gräns eller ej OK kräver appen en åtgärdstext innan kontrollen sparas.',
  },
  {
    title: 'Historik',
    text: 'Historik visar sparade kontroller, avvikelser och bilagor för uppföljning och dokumentation.',
  },
  {
    title: 'Delning',
    text: 'Admin kan skapa tidsbegränsade läslänkar för kontroll eller myndighetsinspektion.',
  },
];

export function HelpView({ onBack }: HelpViewProps) {
  return (
    <section className="menu-destination-view" aria-labelledby="help-title">
      <div className="view-topbar">
        <button className="nav-back-button" type="button" onClick={onBack}>
          Tillbaka
        </button>
        <div>
          <p className="eyebrow">Hjälp</p>
          <h3 id="help-title">Snabbguide</h3>
        </div>
      </div>

      <div className="menu-record-list">
        {helpItems.map((item, index) => (
          <article className="menu-record-row" key={item.title}>
            <span className="menu-record-mark" aria-hidden="true">
              {index + 1}
            </span>
            <span className="menu-record-copy">
              <strong>{item.title}</strong>
              <span>{item.text}</span>
            </span>
          </article>
        ))}
      </div>

      <div className="menu-destination-panel">
        <h4>Supportunderlag</h4>
        <p className="muted-copy">
          Vid problem: notera kontrolltyp, datum, användare och vad som hände innan felet. Det gör felsökning snabbare.
        </p>
      </div>
    </section>
  );
}
