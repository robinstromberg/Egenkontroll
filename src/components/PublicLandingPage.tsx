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
    answer: 'Nej. Appen körs i webbläsaren och är byggd för mobil användning i det dagliga arbetet.',
  },
  {
    question: 'Kan jag dela dokumentation med kontrollant?',
    answer: 'Ja. Du kan skapa en tidsbegränsad läslänk och dela historik, avvikelser och bilagor.',
  },
  {
    question: 'Ingår mallar från start?',
    answer: 'Ja. Vanliga kontrolltyper för livsmedelsverksamhet finns färdiga och kan anpassas.',
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
          <h1>Dokumentera kontrollerna innan dagen springer iväg.</h1>
          <p>
            Min Egenkontroll samlar temperaturer, städning, spårbarhet, avvikelser och delning
            i ett mobilvänligt arbetsflöde som personalen faktiskt kan använda.
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
          <h2>Samma enkla flöde för varje kontroll.</h2>
        </div>
        <div className="public-steps">
          {[
            ['Öppna dagens kontroller', 'Personalen ser vad som ska göras och vad som redan är klart.'],
            ['Fyll i värden eller status', 'Temperatur, OK/Ej OK, foto och kommentar samlas på rätt kontroll.'],
            ['Hantera avvikelse direkt', 'Åtgärd och uppföljning sparas tillsammans med kontrollen.'],
            ['Dela vid kontroll', 'Skapa en tidsbegränsad läslänk när dokumentation behöver visas.'],
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
          <h2>Byggd för vardagen i kök, café, butik och produktion.</h2>
          <p className="public-copy">
            Startmallar finns för de vanligaste delarna i egenkontrollen och kan justeras när verksamheten behöver mer precision.
          </p>
        </div>
        <div className="control-chip-grid">
          {controlTypes.map((name) => <span key={name}>{name}</span>)}
        </div>
      </section>

      <section className="public-band insights-band" id="insights">
        <div className="public-section-heading">
          <p className="public-eyebrow">Statistik och insikter</p>
          <h2>Se mönster innan de blir problem.</h2>
        </div>
        <div className="insight-grid">
          {[
            ['96 %', 'kontrollföljsamhet senaste 30 dagarna'],
            ['4', 'avvikelser senaste 30 dagarna, ned 33 %'],
            ['2 områden', 'står för flest åtgärder just nu'],
            ['90 dagar', 'dokumentation redo för tillsyn'],
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
          <h2>En produkt, två sätt att betala.</h2>
          <p className="public-copy">Starta med {trialDays} dagar testperiod. Avsluta innan första debitering om det inte passar.</p>
        </div>
        <div className="price-cards">
          <article className="price-card">
            <p>{billingPlans.monthly.label}</p>
            <strong>{billingPlans.monthly.priceLabel}</strong>
            <span>Flexibelt för att komma igång.</span>
          </article>
          <article className="price-card highlighted">
            <p>{billingPlans.annual.label}</p>
            <strong>{billingPlans.annual.priceLabel}</strong>
            <span>Debiteras årsvis.</span>
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
        <h2>Starta testperioden och skapa din första verksamhet.</h2>
        <button className="public-primary" type="button" onClick={onStartTrial}>Starta 30 dagars testperiod</button>
      </section>
    </main>
  );
}
