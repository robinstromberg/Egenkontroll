import { useEffect } from 'react';
import './PublicLandingPage.css';
import { AssetIcon } from './ui/AssetIcon';
import { KnowledgeBasePage } from './KnowledgeBasePage';
import { SeoLandingPage, getSeoPageSlugFromPath } from './SeoLandingPage';
import { brandAssets, readControlTypeIcon } from '../config/assets';
import { billingPlans } from '../config/subscription';

type PublicLandingPageProps = {
  onStartTrial: () => void;
  onLogin: () => void;
};

const phoneControlRows = [
  { name: 'Kyltemperaturer', category: 'Temperatur', fallback: '\u00b0C', status: 'Klar' },
  { name: 'St\u00e4dning', category: 'Checklista', fallback: 'OK', status: 'Klar' },
  { name: 'Datumm\u00e4rkning', category: 'Checklista', fallback: 'DM', status: 'Klar' },
  { name: 'Sp\u00e5rbarhet', category: 'Sp\u00e5rbarhet', fallback: 'SP', status: 'Ej utf\u00f6rd' },
];

const reliefItems = [
  ['Det som \u00e5terst\u00e5r syns direkt', 'Dagens kontroller visar vad som \u00e4r kvar, s\u00e5 inget beh\u00f6ver ligga i minnet eller p\u00e5 en lapp.'],
  ['Dokumentationen hamnar p\u00e5 r\u00e4tt plats', 'Temperaturer, checklistor, foton och \u00e5tg\u00e4rder sparas d\u00e4r kontrollen faktiskt g\u00f6rs.'],
  ['Historiken finns n\u00e4r n\u00e5gon fr\u00e5gar', 'N\u00e4r kontrollanten vill se underlag finns perioden samlad och redo att delas.'],
  ['Vem som gjort vad sparas automatiskt', 'Tidpunkt och ansvarig f\u00f6ljer med varje kontroll, utan extra anteckningar vid sidan av.'],
];

const solutionItems = [
  {
    title: 'Mindre tid p\u00e5 administration',
    copy: 'Personalen ser dagens kontroller direkt och dokumenterar p\u00e5 plats i mobilen.',
    result: 'F\u00e4rre rundor till p\u00e4rmen och mer tid till verksamheten.',
  },
  {
    title: 'Enklare att visa dokumentation',
    copy: 'Historik, avvikelser och bilagor samlas digitalt per kontroll.',
    result: 'R\u00e4tt underlag g\u00e5r att visa \u00e4ven n\u00e4r du inte sj\u00e4lv \u00e4r p\u00e5 plats.',
  },
  {
    title: 'B\u00e4ttre koll p\u00e5 ansvar och uppf\u00f6ljning',
    copy: 'Varje kontroll sparas med tidpunkt, status och den som utf\u00f6rde den.',
    result: 'Du ser snabbt vad som \u00e4r klart, vad som saknas och vad som beh\u00f6ver f\u00f6ljas upp.',
  },
];

const howSteps = [
  ['Skapa verksamheten', 'V\u00e4lj typ av verksamhet och starta med f\u00e4rdiga kontroller.'],
  ['Personalen ser vad som ska g\u00f6ras', 'Dagens kontroller visas direkt i mobilen.'],
  ['Dokumentera p\u00e5 plats', 'Temperaturer, checklistor, foto och kommentarer sparas direkt.'],
  ['Visa historik vid kontroll', 'Dela eller exportera dokumentationen n\u00e4r den beh\u00f6vs.'],
];

const featureItems = [
  ['Dagens kontroller', 'En tydlig mobilvy visar vad som ska g\u00f6ras och vad som redan \u00e4r klart.'],
  ['Avvikelser och \u00e5tg\u00e4rder', 'Om n\u00e5got inte \u00e4r OK skrivs \u00e5tg\u00e4rden direkt p\u00e5 samma plats.'],
  ['Historik per period', 'Kontroller, status och ansvarig sparas s\u00e5 att uppf\u00f6ljning blir enklare.'],
  ['S\u00e4ker delning', 'Skapa en tidsbegr\u00e4nsad l\u00e4sl\u00e4nk n\u00e4r dokumentationen beh\u00f6ver visas.'],
  ['F\u00e4rdiga mallar', 'Kom ig\u00e5ng med vanliga kontroller och anpassa dem efter din verksamhet.'],
  ['Mobil f\u00f6rst', 'Byggt f\u00f6r att anv\u00e4ndas i k\u00f6ket, serveringen, butiken eller bilen.'],
];

const industryItems = [
  ['Restaurang', 'Dagliga kontroller f\u00f6r kyl, st\u00e4dning, varumottagning och avvikelser i ett h\u00f6gt tempo.'],
  ['Caf\u00e9', 'Enkel egenkontroll f\u00f6r servering, kylda varor, datumm\u00e4rkning och personalrutiner.'],
  ['Bageri', 'Rutiner f\u00f6r produktion, reng\u00f6ring, sp\u00e5rbarhet och \u00e5terkommande kontrollpunkter.'],
  ['Livsmedelsbutik', '\u00d6verblick \u00f6ver kylar, frysar, mottagning, m\u00e4rkning och uppf\u00f6ljning.'],
  ['Foodtruck', 'Mobil dokumentation f\u00f6r verksamheter som inte har p\u00e4rmen p\u00e5 samma plats varje dag.'],
];

const knowledgeItems = [
  ['HACCP f\u00f6r sm\u00e5 livsmedelsf\u00f6retag', '/haccp-sma-livsmedelsforetag'],
  ['Dokumentation och journalf\u00f6ring', '/dokumentation-egenkontroll-livsmedel'],
  ['Sp\u00e5rbarhet f\u00f6r livsmedelsf\u00f6retag', '/sparbarhet-livsmedel'],
  ['Avvikelser och korrigerande \u00e5tg\u00e4rder', '/avvikelser-korrigerande-atgarder-livsmedel'],
];

const faqItems = [
  {
    question: 'M\u00e5ste egenkontroll vara digital?',
    answer: 'Nej. Men digital dokumentation g\u00f6r det l\u00e4ttare att se vad som \u00e4r gjort, hitta historik och visa upp r\u00e4tt underlag n\u00e4r n\u00e5gon fr\u00e5gar.',
  },
  {
    question: 'Passar det om vi \u00e4r en liten verksamhet?',
    answer: 'Ja. Tanken \u00e4r att sm\u00e5 restauranger, caf\u00e9er, bagerier, butiker och foodtrucks ska slippa bygga ett eget system fr\u00e5n grunden.',
  },
  {
    question: 'Beh\u00f6ver personalen installera n\u00e5got?',
    answer: 'Nej. Appen k\u00f6rs i webbl\u00e4saren och kan l\u00e4ggas p\u00e5 hemsk\u00e4rmen i mobilen f\u00f6r snabb \u00e5tkomst.',
  },
  {
    question: 'Kan jag visa dokumentationen f\u00f6r kontrollant?',
    answer: 'Ja. Du kan skapa en tidsbegr\u00e4nsad l\u00e4sl\u00e4nk s\u00e5 kontrollanten kan se relevant historik utan att f\u00e5 tillg\u00e5ng till hela appen.',
  },
  {
    question: 'Vad kostar det?',
    answer: 'Under f\u00f6rhandslanseringen \u00e4r tj\u00e4nsten kostnadsfri. Innan betalning b\u00f6rjar g\u00e4lla f\u00e5r anv\u00e4ndare tydlig information i god tid.',
  },
];

function setMeta(name: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
}

function setOpenGraphMeta(property: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }
  element.content = content;
}

function setCanonical(url: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }
  element.href = url;
}

function MiniAppScreen() {
  return (
    <div className="landing-phone-frame" aria-label={'F\u00f6rhandsvisning av appens dagens kontroller'}>
      <div className="landing-phone">
        <div className="phone-status"><span>14:26</span><span>87</span></div>
        <div className="phone-organization">
          <span>Inloggad</span>
          <strong>{'Caf\u00e9 Solgl\u00e4ntan'}</strong>
          <p>{'Robin \u00b7 \u00c4gare'}</p>
        </div>
        <div className="phone-today-card">
          <div>
            <span>Idag</span>
            <strong>Hej, Robin</strong>
            <p>Tisdag 7 Juli</p>
          </div>
          <span className="phone-weather" aria-hidden="true">{'\u2600'}</span>
        </div>
        <div className="phone-stats">
          <div><span>Dagens kontroller</span><strong>3 av 4 klara</strong></div>
          <div><span>{'\u00d6ppna avvikelser'}</span><strong>0</strong></div>
        </div>
        <div className="phone-section-title">
          <span>{'Ska g\u00f6ras idag'}</span>
          <strong>3 av 4 klara</strong>
        </div>
        <div className="phone-list">
          {phoneControlRows.map((control, index) => (
            <div className="phone-row" key={control.name}>
              <span className={`phone-row-mark mark-${index + 1}`}>
                <AssetIcon src={readControlTypeIcon({ name: control.name })} fallback={control.fallback} />
              </span>
              <span><strong>{control.name}</strong><small>{control.category}</small></span>
              <b>{control.status}</b>
            </div>
          ))}
        </div>
        <div className="phone-tabs" aria-hidden="true">
          <span>Idag</span><span>Historik</span><span>KPI</span><span>Delning</span><span>Meny</span>
        </div>
      </div>
    </div>
  );
}

function HomeLandingPage({ onStartTrial, onLogin }: PublicLandingPageProps) {
  useEffect(() => {
    const title = 'Min Egenkontroll - digital egenkontroll utan p\u00e4rmkaos';
    const description = 'Digital egenkontroll f\u00f6r restaurang, caf\u00e9, bageri, butik och foodtruck. Se vad som ska g\u00f6ras, spara dokumentation och dela historik vid kontroll.';
    const canonicalUrl = 'https://minegenkontroll.se/';
    document.title = title;
    setMeta('description', description);
    setMeta('robots', 'index, follow');
    setCanonical(canonicalUrl);
    setOpenGraphMeta('og:title', 'Min Egenkontroll - digital egenkontroll f\u00f6r livsmedelsverksamheter');
    setOpenGraphMeta('og:description', description);
    setOpenGraphMeta('og:url', canonicalUrl);
  }, []);

  return (
    <main className="public-site">
      <nav className="public-nav" aria-label="Publik navigation">
        <a className="public-brand" href="/"><img src={brandAssets.logo} alt="Min Egenkontroll" /></a>
        <div className="public-nav-actions">
          <a href="#how">{'S\u00e5 fungerar det'}</a>
          <a href="#pricing">Pris</a>
          <a href="#faq">{'Fr\u00e5gor'}</a>
          <button className="public-nav-primary" type="button" onClick={onStartTrial}>{'Kom ig\u00e5ng'}</button>
          <button type="button" onClick={onLogin}>Logga in</button>
        </div>
      </nav>

      <section className="public-hero">
        <div className="public-hero-copy">
          <p className="public-eyebrow">{'F\u00f6rhandslansering \u00b7 kostnadsfritt just nu'}</p>
          <h1>{'Spara tid. F\u00e5 full kontroll.'}</h1>
          <p>{'Egenkontroll - enklare f\u00f6r dig och din personal. Se dagens kontroller, dokumentera p\u00e5 plats och ha historiken redo n\u00e4r kontrollanten kommer.'}</p>
          <div className="public-hero-actions">
            <button className="public-primary" type="button" onClick={onStartTrial}>{'Kom ig\u00e5ng'}</button>
            <a className="public-secondary" href="#how">{'Se hur det fungerar'}</a>
          </div>
        </div>
        <MiniAppScreen />
      </section>

      <section className="public-band problem-band" id="problems">
        <div className="public-section-heading">
          <p className="public-eyebrow">{'S\u00e5 blir vardagen enklare'}</p>
          <h2>{'Mindre att h\u00e5lla i huvudet. Mer som bara blir gjort.'}</h2>
          <p className="public-copy">{'Min Egenkontroll hj\u00e4lper personalen fram\u00e5t i stunden och sparar underlaget automatiskt, s\u00e5 rutinen inte beh\u00f6ver b\u00e4ras av en person.'}</p>
        </div>
        <div className="problem-list">
          {reliefItems.map(([title, copy]) => (
            <article className="problem-item" key={title}>
              <span aria-hidden="true">✓</span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="public-band" id="how">
        <div className="public-section-heading">
          <p className="public-eyebrow">{'S\u00e5 fungerar det'}</p>
          <h2>{'Fr\u00e5n f\u00e4rdiga kontroller till historik som g\u00e5r att visa.'}</h2>
        </div>
        <div className="how-grid">
          {howSteps.map(([title, copy], index) => (
            <article className="public-card" key={title}>
              <span className="step-number">{index + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-grid-section inspector-section">
        <div>
          <p className="public-eyebrow">{'Kontrollant / inspekt\u00f6r'}</p>
          <h2>{'N\u00e4r kontrollanten kommer \u00e4r dokumentationen redan samlad.'}</h2>
          <p className="public-copy">{'Du beh\u00f6ver inte leta efter p\u00e4rmen eller v\u00e4nta p\u00e5 r\u00e4tt person. Dela dokumentationen direkt fr\u00e5n appen och visa historik f\u00f6r den period som beh\u00f6vs.'}</p>
        </div>
        <article className="public-card inspector-card">
          <p className="public-eyebrow">{'Exempel vid kontroll'}</p>
          <h3>{'Historik f\u00f6r vald period'}</h3>
          <ul>
            <li>{'Utf\u00f6rda kontroller med datum och ansvarig'}</li>
            <li>{'Avvikelser och korrigerande \u00e5tg\u00e4rder'}</li>
            <li>{'Foton, bilagor och export n\u00e4r det beh\u00f6vs'}</li>
          </ul>
        </article>
      </section>

      <section className="public-grid-section solution-section" id="solution">
        <div>
          <p className="public-eyebrow">{'Tre huvudvinster'}</p>
          <h2>{'Samma egenkontroll, men med mer flyt.'}</h2>
          <p className="public-copy">{'Po\u00e4ngen \u00e4r inte att l\u00e4gga till mer administration. Po\u00e4ngen \u00e4r att samla det som redan beh\u00f6ver g\u00f6ras p\u00e5 ett st\u00e4lle.'}</p>
        </div>
        <div className="solution-stack">
          {solutionItems.map((item, index) => (
            <article className="public-card solution-card" key={item.title}>
              <span className="step-number">{index + 1}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
                <strong>{item.result}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="public-band" id="features">
        <div className="public-section-heading">
          <p className="public-eyebrow">{'Funktioner som st\u00f6djer vardagen'}</p>
          <h2>{'Allt som beh\u00f6vs f\u00f6r att f\u00e5 kontrollen gjord och sparad.'}</h2>
        </div>
        <div className="feature-grid">
          {featureItems.map(([title, copy]) => (
            <article className="public-card" key={title}>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-grid-section industries-section">
        <div>
          <p className="public-eyebrow">{'F\u00f6r vilka verksamheter?'}</p>
          <h2>{'F\u00f6r sm\u00e5 livsmedelsf\u00f6retag d\u00e4r tiden \u00e4r knapp och ansvaret \u00e4r tydligt.'}</h2>
          <p className="public-copy">{'Starta med f\u00e4rdiga kontrolltyper och anpassa dem efter hur just din verksamhet arbetar.'}</p>
        </div>
        <div className="industry-list">
          {industryItems.map(([title, copy]) => (
            <article className="industry-item" key={title}>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-grid-section" id="pricing">
        <div>
          <p className="public-eyebrow">Pris</p>
          <h2>{'Kostnadsfritt under f\u00f6rhandslanseringen.'}</h2>
          <p className="public-copy">{'Du kan anv\u00e4nda Min Egenkontroll gratis medan tj\u00e4nsten utvecklas. Innan betalda abonnemang b\u00f6rjar g\u00e4lla f\u00e5r du tydlig information i god tid.'}</p>
        </div>
        <div className="price-cards">
          <article className="price-card highlighted"><p>{'F\u00f6rhandslansering'}</p><strong>0 kr</strong><span>{'Kostnadsfri tillg\u00e5ng under utvecklingsperioden.'}</span></article>
          <article className="price-card"><p>Efter lansering</p><strong>{billingPlans.monthly.priceLabel}</strong><span>{'Planerat abonnemang n\u00e4r tj\u00e4nsten lanseras skarpt.'}</span></article>
          <article className="price-card"><p>{billingPlans.annual.label}</p><strong>{billingPlans.annual.priceLabel}</strong><span>{'L\u00e4gre m\u00e5nadskostnad n\u00e4r du betalar \u00e5rsvis efter lansering.'}</span></article>
        </div>
      </section>

      <section className="public-band" id="faq">
        <div className="public-section-heading">
          <p className="public-eyebrow">{'Vanliga fr\u00e5gor'}</p>
          <h2>{'Fr\u00e5gor som ofta dyker upp n\u00e4r p\u00e4rmen ska bli digital.'}</h2>
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

      <section className="public-grid-section knowledge-section">
        <div>
          <p className="public-eyebrow">Kunskapsbank</p>
          <h2>{'F\u00f6rdjupa dig n\u00e4r du beh\u00f6ver, inte i f\u00f6rsta vyn.'}</h2>
          <p className="public-copy">{'Guiderna hj\u00e4lper dig f\u00f6rst\u00e5 egenkontroll, HACCP, sp\u00e5rbarhet och dokumentation med sakligt spr\u00e5k och tydliga k\u00e4llor.'}</p>
          <div className="public-hero-actions"><a className="public-primary" href="/kunskapsbank">Se alla guider</a></div>
        </div>
        <div className="knowledge-link-list">
          {knowledgeItems.map(([title, href]) => (
            <a className="public-card knowledge-link" href={href} key={href}>
              <h3>{title}</h3>
              <p>{'L\u00e4s en praktisk guide f\u00f6r mindre livsmedelsverksamheter.'}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="public-cta">
        <p className="public-eyebrow">{'F\u00f6rhandslansering'}</p>
        <h2>{'G\u00f6r egenkontrollen enklare att f\u00e5 gjord varje dag.'}</h2>
        <p className="public-copy">{'Samla rutiner, dokumentation och historik p\u00e5 ett st\u00e4lle, direkt i mobilen.'}</p>
        <button className="public-primary" type="button" onClick={onStartTrial}>{'Kom ig\u00e5ng'}</button>
      </section>

      <footer className="public-footer">
        <span>{'\u00a9 2026 Min Egenkontroll'}</span>
        <div className="public-footer-links">
          <a href="/integritetspolicy">Integritetspolicy</a>
          <a href="/anvandarvillkor">{'Anv\u00e4ndarvillkor'}</a>
        </div>
      </footer>
    </main>
  );
}

export function PublicLandingPage(props: PublicLandingPageProps) {
  const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
  if (normalizedPath === '/kunskapsbank') return <KnowledgeBasePage />;
  const seoPage = getSeoPageSlugFromPath(window.location.pathname);
  if (seoPage) return <SeoLandingPage page={seoPage} />;
  return <HomeLandingPage {...props} />;
}
