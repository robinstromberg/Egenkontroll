import './PublicLandingPage.css';
import { AssetIcon } from './ui/AssetIcon';
import { brandAssets, readControlTypeIcon } from '../config/assets';
import { billingPlans, trialDays } from '../config/subscription';

type PublicLandingPageProps = {
  onStartTrial: () => void;
  onLogin: () => void;
};

const controlTypes = [
  'Kyltemperaturer',
  'Städning',
  'Datummärkning',
  'Varumottagning',
  'Spårbarhet',
  'Egenkontrollrunda',
];

const phoneControlRows = [
  { name: 'Kyltemperaturer', fallback: '°C' },
  { name: 'Städning', fallback: 'OK' },
  { name: 'Datummärkning', fallback: 'DM' },
  { name: 'Varumottagning', fallback: 'IN' },
];

const faqItems = [
  {
    question: 'Behöver personalen installera något?',
    answer: 'Nej. Min Egenkontroll körs i webbläsaren och är byggd för snabb användning direkt i mobilen.',
  },
  {
    question: 'Kan jag dela dokumentation med kontrollant?',
    answer: 'Ja. Skapa en tidsbegränsad läslänk och visa historik, avvikelser och bilagor utan att leta i pärmar eller mappar.',
  },
  {
    question: 'Ingår mallar från start?',
    answer: 'Ja. Vanliga kontrolltyper finns färdiga från start och kan anpassas efter hur din verksamhet faktiskt fungerar.',
  },
];

function MiniAppScreen() {
  return (
    <div className="landing-phone" aria-label="Förhandsvisning av appens dagens kontroller">
      <div className="phone-status">
        <span>9:41</span>
        <span>●●●</span>
      </div>
      <div className="phone-title">
        <p>God morgon, Emma</p>
        <strong>Idag</strong>
      </div>
      <div className="phone-progress">
        <span>3 av 5 kontroller klara</span>
        <strong>0 öppna avvikelser</strong>
      </div>
      <div className="phone-list">
        {phoneControlRows.map((control, index) => (
          <div className="phone-row" key={control.name}>
            <span className={`phone-row-mark mark-${index + 1}`}>
              <AssetIcon src={readControlTypeIcon({ name: control.name })} fallback={control.fallback} />
            </span>
            <span>{control.name}</span>
            <strong>{index < 2 ? 'Klar' : 'Ej utförd'}</strong>
          </div>
        ))}
      </div>
      <button className="phone-action" type="button">Utför kontroll</button>
    </div>
  );
}

export function PublicLandingPage({ onStartTrial, onLogin }: PublicLandingPageProps) {
  return (
    <main className="public-site">
      <nav className="public-nav" aria-label="Publik navigation">
        <a className="public-brand" href="/">
          <img src={brandAssets.logo} alt="Min Egenkontroll" />
        </a>
        <div className="public-nav-actions">
          <a href="#pricing">Pris</a>
          <button type="button" onClick={onLogin}>Logga in</button>
        </div>
      </nav>

      <section className="public-hero">
        <div className="public-hero-copy">
          <p className="public-eyebrow">Digital egenkontroll för livsmedelsverksamheter</p>
          <h1>Det nya, enkla sättet att sköta egenkontrollen.</h1>
          <p>
            Inget mer letande! Visa precis den dokumentation kontrollanten vill se – med ett knapptryck.
          </p>
          <div className="public-hero-actions">
            <button className="public-primary" type="button" onClick={onStartTrial}>Starta 30 dagars testperiod</button>
            <a className="public-secondary" href="#how">Se hur det fungerar</a>
          </div>
        </div>
        <MiniAppScreen />
      </section>

      <section className="public-band" id="how">
        <div className="public-section-heading">
          <p className="public-eyebrow">Så fungerar det</p>
          <h2>Gör kontrollen direkt när den ska göras.</h2>
        </div>
        <div className="public-steps">
          {[
            ['Öppna dagens kontroller', 'Personalen ser direkt vad som ska göras, vad som är klart och vad som återstår.'],
            ['Fyll i värden eller status', 'Temperatur, OK/Ej OK, foto och kommentar sparas på rätt kontroll utan krångel.'],
            ['Hantera avvikelse direkt', 'Om något avviker dokumenteras åtgärden direkt tillsammans med kontrollen.'],
            ['Dela vid kontroll', 'När kontrollanten kommer skapar du en tidsbegränsad läslänk med rätt dokumentation.'],
          ].map(([title, copy], index) => (
            <article className="public-card" key={title}>
              <span className="step-number">{index + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-grid-section">
        <div>
          <p className="public-eyebrow">Kontrolltyper</p>
          <h2>Allt samlat för vardagen i kök, café, butik och produktion.</h2>
          <p className="public-copy">
            Börja med färdiga mallar för de vanligaste delarna av egenkontrollen och anpassa dem efter din verksamhet.
          </p>
        </div>
        <div className="control-chip-grid">
          {controlTypes.map((name) => <span key={name}>{name}</span>)}
        </div>
      </section>

      <section className="public-band insights-band" id="insights">
        <div className="public-section-heading">
          <p className="public-eyebrow">Statistik och insikter</p>
          <h2>Se vad som fungerar – och vad som behöver följas upp.</h2>
        </div>
        <div className="insight-grid">
          {[
            ['96 %', 'kontroller utförda senaste 30 dagarna'],
            ['4', 'avvikelser dokumenterade och redo att följas upp'],
            ['2 områden', 'behöver mest uppmärksamhet just nu'],
            ['90 dagar', 'dokumentation samlad och redo att visas'],
          ].map(([value, label]) => (
            <article className="insight-card" key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="public-grid-section" id="pricing">
        <div>
          <p className="public-eyebrow">Pris</p>
          <h2>Kom igång utan bindningstid.</h2>
          <p className="public-copy">Testa Min Egenkontroll gratis i {trialDays} dagar. Avsluta innan första debitering om det inte passar.</p>
        </div>
        <div className="price-cards">
          <article className="price-card">
            <p>{billingPlans.monthly.label}</p>
            <strong>{billingPlans.monthly.priceLabel}</strong>
            <span>Flexibelt när du vill komma igång snabbt.</span>
          </article>
          <article className="price-card highlighted">
            <p>{billingPlans.annual.label}</p>
            <strong>{billingPlans.annual.priceLabel}</strong>
            <span>Lägre månadskostnad när du betalar årsvis.</span>
          </article>
        </div>
      </section>

      <section className="public-band">
        <div className="public-section-heading">
          <p className="public-eyebrow">Frågor</p>
          <h2>Vanliga frågor</h2>
        </div>
        <div className="faq-list">
          {faqItems.map((item) => (
            <article className="public-card" key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-cta">
        <p className="public-eyebrow">Redo för kontroll</p>
        <h2>Starta testperioden och gör egenkontrollen enklare redan idag.</h2>
        <button className="public-primary" type="button" onClick={onStartTrial}>Starta 30 dagars testperiod</button>
      </section>
    </main>
  );
}
