const plannedModules = [
  {
    title: 'Idag',
    description: 'Dagens kontroller, status och öppna avvikelser samlas på startsidan.',
  },
  {
    title: 'Kontrollmotor',
    description: 'Alla kontrolltyper följer samma flöde: öppna, fyll i, hantera avvikelse och spara.',
  },
  {
    title: 'Historik',
    description: 'Alla registreringar sparas med datum, tid, användare, status och åtgärder.',
  },
  {
    title: 'Delning',
    description: 'Tidsbegränsad läslänk och QR-kod för inspektörsvy och export.',
  },
];

function App() {
  return (
    <main className="app-shell">
      <section className="hero-card" aria-labelledby="page-title">
        <div className="app-icon" aria-hidden="true">
          ✓
        </div>
        <div className="hero-copy">
          <p className="eyebrow">Mobilförst SaaS-webapp</p>
          <h1 id="page-title">Egenkontroll</h1>
          <p className="lead">
            En enkel grund för digital egenkontroll i livsmedelsverksamheter. Appen är
            förberedd för Supabase, Vercel och fortsatt issue-baserad utveckling.
          </p>
        </div>
      </section>

      <section className="status-panel" aria-labelledby="status-title">
        <div>
          <p className="eyebrow">Issue #1</p>
          <h2 id="status-title">Teknisk grund är initierad</h2>
        </div>
        <ul className="check-list">
          <li>React + TypeScript + Vite</li>
          <li>Mobilförst layoutgrund</li>
          <li>Miljövariabler för Supabase</li>
          <li>Redo för nästa issue</li>
        </ul>
      </section>

      <section aria-labelledby="modules-title">
        <h2 id="modules-title">Planerade huvudmoduler</h2>
        <div className="module-grid">
          {plannedModules.map((module) => (
            <article className="module-card" key={module.title}>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
