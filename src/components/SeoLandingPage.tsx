import { useEffect } from 'react';
import { brandAssets } from '../config/assets';
import './PublicLandingPage.css';

export type SeoPageSlug =
  | 'digital-egenkontroll-livsmedel'
  | 'egenkontroll-restaurang'
  | 'egenkontroll-cafe';

type SeoPageContent = {
  slug: SeoPageSlug;
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  intro: string;
  benefits: Array<[string, string]>;
  practicalHeading: string;
  practicalText: string;
  examplesHeading: string;
  examples: string[];
  faq: Array<[string, string]>;
};

const siteUrl = 'https://minegenkontroll.se';

const seoPages: Record<SeoPageSlug, SeoPageContent> = {
  'digital-egenkontroll-livsmedel': {
    slug: 'digital-egenkontroll-livsmedel',
    title: 'Digital egenkontroll för livsmedelsverksamheter | Min Egenkontroll',
    description:
      'Samla temperaturkontroller, städning, datummärkning, varumottagning, spårbarhet och avvikelser digitalt i mobilen.',
    eyebrow: 'Digital egenkontroll för livsmedel',
    heading: 'Digital egenkontroll för livsmedelsverksamheter',
    intro:
      'Samla dagens kontroller, avvikelser och historik på ett ställe. Min Egenkontroll är byggd för att personalen snabbt ska se vad som ska göras och för att dokumentationen ska vara enkel att hitta när den behövs.',
    benefits: [
      ['Dagens kontroller på en plats', 'Personalen ser vad som ska göras, vad som är klart och vad som återstår.'],
      ['Avvikelser där de hör hemma', 'Om något inte stämmer dokumenteras åtgärden direkt tillsammans med kontrollen.'],
      ['Historik som går att hitta', 'Slipp leta i pärmar, kalkylblad och chattar när någon vill se vad som gjorts.'],
    ],
    practicalHeading: 'Vad innebär digital egenkontroll i praktiken?',
    practicalText:
      'I stället för att sprida rutiner och dokumentation mellan papper, pärmar och olika filer görs kontrollerna direkt i mobilen. Verksamheten väljer vilka kontroller som behövs och anpassar dem efter sitt eget arbetssätt. Vanliga områden är temperaturer, städning, datummärkning, varumottagning, spårbarhet och kontrollrundor.',
    examplesHeading: 'Passar bland annat för',
    examples: ['Restauranger', 'Caféer och bagerier', 'Mindre livsmedelsproduktion', 'Butiker och kiosker', 'Foodtrucks och andra mobila verksamheter'],
    faq: [
      ['Måste personalen installera en app?', 'Nej. Min Egenkontroll körs i webbläsaren och är byggd för mobil användning.'],
      ['Kan verksamheten anpassa kontrollerna?', 'Ja. Kontrolltyper och kontrollpunkter kan anpassas efter hur verksamheten faktiskt arbetar.'],
      ['Kan dokumentationen visas vid kontroll?', 'Ja. Historik och dokumentation kan samlas och delas via en tidsbegränsad läslänk.'],
    ],
  },
  'egenkontroll-restaurang': {
    slug: 'egenkontroll-restaurang',
    title: 'Egenkontroll för restaurang – digitalt och enkelt | Min Egenkontroll',
    description:
      'Digital egenkontroll för restaurang. Samla temperaturer, städning, varumottagning, avvikelser och historik i mobilen.',
    eyebrow: 'För restauranger',
    heading: 'Egenkontroll för restaurang – digitalt och enkelt',
    intro:
      'I en restaurang måste egenkontrollen fungera mitt i den vanliga arbetsdagen. Min Egenkontroll gör det lättare för personalen att se vad som ska göras, dokumentera direkt och hitta historiken senare.',
    benefits: [
      ['Snabbt för personalen', 'Öppna dagens kontroller och fyll i rätt värde eller status direkt i mobilen.'],
      ['Tydligt vid skiftbyten', 'Det syns vad som redan är gjort och vilka kontroller som fortfarande återstår.'],
      ['Enklare när något avviker', 'Dokumentera åtgärden på samma plats som den kontroll där problemet upptäcktes.'],
    ],
    practicalHeading: 'Egenkontroll som passar restaurangens vardag',
    practicalText:
      'Temperaturkontroller, städning, datummärkning och varumottagning sker ofta samtidigt som köket är i full gång. Därför är systemet byggt för korta arbetsflöden. Personalen ska inte behöva leta efter rätt formulär eller gå igenom flera menyer för att registrera en enkel kontroll.',
    examplesHeading: 'Vanliga delar att samla digitalt',
    examples: ['Kyl- och frystemperaturer', 'Städning och rengöring', 'Datummärkning', 'Varumottagning', 'Spårbarhet', 'Avvikelser och åtgärder'],
    faq: [
      ['Kan flera medarbetare använda systemet?', 'Ja. Tanken är att dagens kontroller ska kunna utföras av personalen i det dagliga arbetet.'],
      ['Syns det vem som har gjort en kontroll?', 'Kontroller sparas tillsammans med uppgifter om vem som utfört dem.'],
      ['Behöver vi byta alla rutiner på en gång?', 'Nej. Verksamheten kan börja med de viktigaste kontrollerna och bygga vidare efter behov.'],
    ],
  },
  'egenkontroll-cafe': {
    slug: 'egenkontroll-cafe',
    title: 'Digital egenkontroll för café och bageri | Min Egenkontroll',
    description:
      'Enkel digital egenkontroll för café och bageri. Samla temperaturer, städning, datummärkning, mottagning och historik i mobilen.',
    eyebrow: 'För café och bageri',
    heading: 'Digital egenkontroll för café och bageri',
    intro:
      'När öppning, produktion, servering och stängning avlöser varandra behöver egenkontrollen vara enkel att få gjord. Min Egenkontroll samlar dagens uppgifter i mobilen så att personalen snabbt ser vad som återstår.',
    benefits: [
      ['Lätt att komma igång med', 'Börja med vanliga kontrolltyper och anpassa dem efter caféets eller bageriets arbetssätt.'],
      ['Kontroller i rätt ögonblick', 'Registrera temperatur, status, foto eller kommentar direkt där arbetet sker.'],
      ['Mindre letande i efterhand', 'Historiken samlas så att tidigare kontroller och åtgärder blir lättare att hitta.'],
    ],
    practicalHeading: 'Byggt för små verksamheter med högt tempo',
    practicalText:
      'Ett café eller bageri behöver ofta hålla ordning på flera återkommande moment utan att administrationen får ta över arbetsdagen. Därför är målet att varje kontroll ska vara så enkel som möjligt att utföra och att samma system ska kunna användas för olika delar av verksamheten.',
    examplesHeading: 'Exempel på kontroller',
    examples: ['Kyl- och frystemperaturer', 'Städning', 'Datummärkning', 'Varumottagning', 'Spårbarhet', 'Öppnings- och stängningsrundor'],
    faq: [
      ['Passar systemet även en liten verksamhet?', 'Ja. Min Egenkontroll är utvecklad med små livsmedelsverksamheter i åtanke.'],
      ['Kan vi anpassa vad som ska kontrolleras?', 'Ja. Kontrollerna kan anpassas efter verksamhetens egna behov och arbetssätt.'],
      ['Kan vi använda mobilen?', 'Ja. Tjänsten är byggd för att användas direkt i mobilens webbläsare.'],
    ],
  },
};

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

export function getSeoPageSlugFromPath(pathname: string): SeoPageSlug | null {
  const normalizedPath = pathname.replace(/^\/+|\/+$/g, '');
  return normalizedPath in seoPages ? (normalizedPath as SeoPageSlug) : null;
}

type SeoLandingPageProps = {
  page: SeoPageSlug;
};

export function SeoLandingPage({ page }: SeoLandingPageProps) {
  const content = seoPages[page];
  const canonicalUrl = `${siteUrl}/${content.slug}`;

  useEffect(() => {
    document.title = content.title;
    setMeta('description', content.description);
    setMeta('robots', 'index, follow');
    setCanonical(canonicalUrl);
    setOpenGraphMeta('og:title', content.title);
    setOpenGraphMeta('og:description', content.description);
    setOpenGraphMeta('og:url', canonicalUrl);
  }, [canonicalUrl, content.description, content.title]);

  return (
    <main className="public-site">
      <nav className="public-nav" aria-label="Publik navigation">
        <a className="public-brand" href="/">
          <img src={brandAssets.logo} alt="Min Egenkontroll" />
        </a>
        <div className="public-nav-actions">
          <a href="/#how">Så fungerar det</a>
          <a href="/signup">Gå med</a>
        </div>
      </nav>

      <section className="public-hero">
        <div className="public-hero-copy">
          <p className="public-eyebrow">{content.eyebrow}</p>
          <h1>{content.heading}</h1>
          <p className="public-copy">{content.intro}</p>
          <div className="public-hero-actions">
            <a className="public-primary" href="/signup">Gå med i förhandslanseringen</a>
            <a className="public-secondary" href="/">Se Min Egenkontroll</a>
          </div>
        </div>
      </section>

      <section className="public-band">
        <div className="public-section-heading">
          <p className="public-eyebrow">Enklare i vardagen</p>
          <h2>Få kontrollerna gjorda utan onödig administration.</h2>
        </div>
        <div className="public-steps">
          {content.benefits.map(([title, copy]) => (
            <article className="public-card" key={title}>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-grid-section">
        <div>
          <p className="public-eyebrow">Så fungerar det</p>
          <h2>{content.practicalHeading}</h2>
          <p className="public-copy">{content.practicalText}</p>
        </div>
        <div>
          <h2>{content.examplesHeading}</h2>
          <div className="control-chip-grid">
            {content.examples.map((example) => <span key={example}>{example}</span>)}
          </div>
        </div>
      </section>

      <section className="public-band">
        <div className="public-section-heading">
          <p className="public-eyebrow">Frågor och svar</p>
          <h2>Vanliga frågor</h2>
        </div>
        <div className="faq-list">
          {content.faq.map(([question, answer]) => (
            <article className="public-card" key={question}>
              <h3>{question}</h3>
              <p>{answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-grid-section">
        <div>
          <p className="public-eyebrow">Läs vidare</p>
          <h2>Mer om digital egenkontroll</h2>
        </div>
        <div className="faq-list">
          {content.slug !== 'digital-egenkontroll-livsmedel' ? (
            <a className="public-card" href="/digital-egenkontroll-livsmedel">
              <h3>Digital egenkontroll för livsmedel</h3>
              <p>Se hur kontroller, avvikelser och historik kan samlas digitalt.</p>
            </a>
          ) : null}
          {content.slug !== 'egenkontroll-restaurang' ? (
            <a className="public-card" href="/egenkontroll-restaurang">
              <h3>Egenkontroll för restaurang</h3>
              <p>Se ett enkelt upplägg för restaurangens dagliga kontroller.</p>
            </a>
          ) : null}
          {content.slug !== 'egenkontroll-cafe' ? (
            <a className="public-card" href="/egenkontroll-cafe">
              <h3>Egenkontroll för café och bageri</h3>
              <p>Se hur återkommande kontroller kan bli enklare i ett högt arbetstempo.</p>
            </a>
          ) : null}
        </div>
      </section>

      <section className="public-cta">
        <p className="public-eyebrow">Förhandslansering</p>
        <h2>Prova Min Egenkontroll kostnadsfritt under utvecklingsperioden.</h2>
        <a className="public-primary" href="/signup">Gå med i förhandslanseringen</a>
      </section>

      <footer className="public-footer">
        <span>© 2026 Min Egenkontroll</span>
        <div className="public-footer-links">
          <a href="/integritetspolicy">Integritetspolicy</a>
          <a href="/anvandarvillkor">Användarvillkor</a>
        </div>
      </footer>
    </main>
  );
}
