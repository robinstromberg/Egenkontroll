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
  { name: 'Kyltemperaturer', fallback: '\u00b0C' },
  { name: 'St\u00e4dning', fallback: 'OK' },
  { name: 'Datumm\u00e4rkning', fallback: 'DM' },
  { name: 'Varumottagning', fallback: 'IN' },
];

const problemItems = [
  'Kontroller gl\u00f6ms bort n\u00e4r lunchrusningen b\u00f6rjar.',
  'Dokumentationen ligger i p\u00e4rmar, bilder, lappar och olika mappar.',
  'Ny personal vet inte alltid vad som ska g\u00f6ras.',
  '\u00c4garen m\u00e5ste fr\u00e5ga vem som gjorde vad i st\u00e4llet f\u00f6r att bara se status.',
  'N\u00e4r kontrollanten kommer blir det letande efter r\u00e4tt historik.',
  'Man uppt\u00e4cker f\u00f6rst i efterhand att n\u00e5got viktigt saknas.',
];

const solutionItems = [
  {
    problem: 'Egenkontroll tar on\u00f6digt mycket tid',
    solution: 'Personalen ser dagens kontroller direkt och dokumenterar p\u00e5 plats i mobilen.',
    result: 'Mindre tid p\u00e5 dokumentation, mer tid p\u00e5 verksamheten.',
  },
  {
    problem: 'Det blir kr\u00e5ngligt n\u00e4r kontrollanten vill se dokumentationen',
    solution: 'Dela dokumentationen med ett knapptryck n\u00e4r kontrollanten kommer.',
    result: 'Vem som helst i personalen kan visa r\u00e4tt underlag.',
  },
  {
    problem: 'Det \u00e4r sv\u00e5rt att veta vem som gjort vad',
    solution: 'Tidpunkt och anv\u00e4ndare loggas automatiskt med egen inloggning.',
    result: 'Du f\u00e5r \u00f6verblick \u00e4ven n\u00e4r du inte \u00e4r p\u00e5 plats.',
  },
];

const howSteps = [
  ['Skapa verksamheten', 'V\u00e4lj typ av verksamhet och starta med f\u00e4rdiga kontroller.'],
  ['Personalen ser vad som ska g\u00f6ras', 'Dagens kontroller visas direkt i mobilen.'],
  ['Dokumentera p\u00e5 plats', 'Temperaturer, checklistor, foto och kommentarer sparas direkt.'],
  ['Visa historik vid kontroll', 'Dela eller exportera dokumentationen n\u00e4r den beh\u00f6vs.'],
];

const featureItems = [
  ['N\u00e4r kontroller gl\u00f6ms bort', 'Dagens kontroller visar vad som \u00e5terst\u00e5r och vad som redan \u00e4r klart.'],
  ['N\u00e4r dokumentation ligger utspridd', 'Historiken samlas digitalt per kontroll med datum, utf\u00f6rare och status.'],
  ['N\u00e4r kontrollanten fr\u00e5gar', 'Delningsvy och export g\u00f6r det l\u00e4tt att visa r\u00e4tt underlag.'],
  ['N\u00e4r ny personal b\u00f6rjar', 'Appen visar vad som ska g\u00f6ras utan att allt beh\u00f6ver f\u00f6rklaras muntligt.'],
  ['N\u00e4r n\u00e5got inte \u00e4r OK', 'Avvikelse och \u00e5tg\u00e4rd skrivs direkt d\u00e4r kontrollen utf\u00f6rs.'],
  ['N\u00e4r tiden \u00e4r knapp', 'Mobilfl\u00f6det \u00e4r gjort f\u00f6r att anv\u00e4ndas d\u00e4r arbetet sker.'],
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
    <div className="landing-phone" aria-label={'F\u00f6rhandsvisning av appens dagens kontroller'}>
      <div className="phone-status"><span>9:41</span><span>...</span></div>
      <div className="phone-title"><p>God morgon, Emma</p><strong>Idag</strong></div>
      <div className="phone-progress"><span>3 av 5 kontroller klara</span><strong>{'0 \u00f6ppna avvikelser'}</strong></div>
      <div className="phone-list">
        {phoneControlRows.map((control, index) => (
          <div className="phone-row" key={control.name}>
            <span className={`phone-row-mark mark-${index + 1}`}>
              <AssetIcon src={readControlTypeIcon({ name: control.name })} fallback={control.fallback} />
            </span>
            <span>{control.name}</span>
            <strong>{index < 2 ? 'Klar' : 'Ej utf\u00f6rd'}</strong>
          </div>
        ))}
      </div>
      <button className="phone-action" type="button">{'Utf\u00f6r kontroll'}</button>
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
          <a href="#problems">Problem</a>
          <a href="#how">S\u00e5 fungerar det</a>
          <a href="#faq">Fr\u00e5gor</a>
          <button className="public-nav-primary" type="button" onClick={onStartTrial}>Kom ig\u00e5ng</button>
          <button type="button" onClick={onLogin}>Logga in</button>
        </div>
      </nav>

      <section className="public-hero">
        <div className="public-hero-copy">
          <p className="public-eyebrow">{'F\u00f6rhandslansering \u00b7 kostnadsfritt just nu'}</p>
          <h1>{'Egenkontroll direkt i mobilen, utan p\u00e4rmar och papperslistor.'}</h1>
          <p>{'Min Egenkontroll visar vad som ska g\u00f6ras, l\u00e5ter personalen dokumentera p\u00e5 plats och samlar historiken s\u00e5 den \u00e4r redo n\u00e4r kontrollanten kommer.'}</p>
          <div className="public-hero-actions">
            <button className="public-primary" type="button" onClick={onStartTrial}>Kom ig\u00e5ng</button>
            <a className="public-secondary" href="#how">{'Se hur det fungerar'}</a>
          </div>
        </div>
        <MiniAppScreen />
      </section>

      <section className="public-band problem-band" id="problems">
        <div className="public-section-heading">
          <p className="public-eyebrow">{'Vardagen f\u00f6rst'}</p>
          <h2>{'K\u00e4nns egenkontrollen som n\u00e5got som alltid hamnar mellan allt annat?'}</h2>
          <p className="public-copy">{'Det \u00e4r h\u00e4r m\u00e5nga mindre livsmedelsverksamheter fastnar: inte i viljan att g\u00f6ra r\u00e4tt, utan i att f\u00e5 rutinen att fungera varje dag.'}</p>
        </div>
        <div className="problem-list">
          {problemItems.map((item) => (
            <article className="problem-item" key={item}>
              <span aria-hidden="true">!</span>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-grid-section solution-section" id="solution">
        <div>
          <p className="public-eyebrow">{'S\u00e5 hj\u00e4lper Min Egenkontroll'}</p>
          <h2>{'Bygg rutinen runt arbetet som redan sker.'}</h2>
          <p className="public-copy">{'Appen \u00e4r inte t\u00e4nkt att g\u00f6ra egenkontroll st\u00f6rre. Den ska g\u00f6ra det l\u00e4ttare att f\u00e5 r\u00e4tt saker gjorda, sparade och hittade igen.'}</p>
        </div>
        <div className="solution-stack">
          {solutionItems.map((item, index) => (
            <article className="public-card solution-card" key={item.problem}>
              <span className="step-number">{index + 1}</span>
              <div>
                <small>Problem</small>
                <h3>{item.problem}</h3>
                <small>{'L\u00f6sning'}</small>
                <p>{item.solution}</p>
                <strong>{item.result}</strong>
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

      <section className="public-band" id="features">
        <div className="public-section-heading">
          <p className="public-eyebrow">{'Funktioner som svarar p\u00e5 problem'}</p>
          <h2>{'Inte fler listor att h\u00e5lla i huvudet. Bara tydligare fl\u00f6de.'}</h2>
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

      <section className="public-cta">
        <p className="public-eyebrow">{'F\u00f6rhandslansering'}</p>
        <h2>{'G\u00f6r egenkontrollen enklare att f\u00e5 gjord varje dag.'}</h2>
        <p className="public-copy">{'Samla rutiner, dokumentation och historik p\u00e5 ett st\u00e4lle, direkt i mobilen.'}</p>
        <button className="public-primary" type="button" onClick={onStartTrial}>Kom ig\u00e5ng</button>
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
