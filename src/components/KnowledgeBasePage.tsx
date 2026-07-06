import { useEffect } from 'react';
import { brandAssets } from '../config/assets';
import './PublicLandingPage.css';

type Guide = {
  title: string;
  copy: string;
  href: string;
};

type GuideGroup = {
  eyebrow: string;
  title: string;
  intro: string;
  guides: Guide[];
};

const siteUrl = 'https://minegenkontroll.se';

const guideGroups: GuideGroup[] = [
  {
    eyebrow: 'Egenkontroll i vardagen',
    title: 'Kom igång och få ordning på dokumentationen',
    intro: 'Guider för restauranger, caféer och andra mindre livsmedelsverksamheter som vill förstå vad som behöver göras och hur arbetet kan hållas enkelt.',
    guides: [
      {
        title: 'Digital egenkontroll för livsmedel',
        copy: 'Hur återkommande kontroller, avvikelser och historik kan samlas digitalt.',
        href: '/digital-egenkontroll-livsmedel',
      },
      {
        title: 'Egenkontroll för restaurang',
        copy: 'Ett enkelt upplägg för temperaturer, städning, varumottagning och andra dagliga kontroller.',
        href: '/egenkontroll-restaurang',
      },
      {
        title: 'Egenkontroll för café och bageri',
        copy: 'Så kan återkommande kontroller göras utan att administrationen tar över arbetsdagen.',
        href: '/egenkontroll-cafe',
      },
      {
        title: 'Dokumentation och journalföring',
        copy: 'Vad kan behöva dokumenteras och hur kan omfattningen anpassas efter verksamheten?',
        href: '/dokumentation-egenkontroll-livsmedel',
      },
    ],
  },
  {
    eyebrow: 'HACCP och riskstyrning',
    title: 'Förstå faror, gränser, avvikelser och uppföljning',
    intro: 'Sakliga guider som bryter ner centrala delar av HACCP till praktiska frågor för mindre livsmedelsföretag.',
    guides: [
      {
        title: 'HACCP för små livsmedelsföretag',
        copy: 'Hur flexibilitet, risker och dokumentation kan anpassas till verksamhetens storlek och art.',
        href: '/haccp-sma-livsmedelsforetag',
      },
      {
        title: 'Faroanalys för livsmedelsföretag',
        copy: 'Hur relevanta faror identifieras och varför detaljnivån ska spegla den faktiska verksamheten.',
        href: '/faroanalys-livsmedel',
      },
      {
        title: 'Kritiska gränsvärden',
        copy: 'Vad ett kritiskt gränsvärde är och varför en tydlig gräns behöver skilja acceptabelt från oacceptabelt.',
        href: '/seo/kritiska-gransvarden.html',
      },
      {
        title: 'Avvikelser och korrigerande åtgärder',
        copy: 'Vad som behöver hända när en kontroll avviker och varför orsaken också behöver följas upp.',
        href: '/avvikelser-korrigerande-atgarder-livsmedel',
      },
      {
        title: 'Verifiering av egenkontrollen',
        copy: 'Hur verksamheten kan kontrollera att rutiner, övervakning och åtgärder faktiskt fungerar.',
        href: '/verifiering-egenkontroll-livsmedel',
      },
      {
        title: 'Kontrollplan',
        copy: 'Hur kontroller kan planeras med tydliga punkter, ansvar och uppföljning.',
        href: '/seo/kontrollplan.html',
      },
    ],
  },
  {
    eyebrow: 'Spårbarhet',
    title: 'Hitta rätt uppgifter när ett livsmedel måste följas',
    intro: 'Guider om leverantörer, mottagare, leveranser och hur länge spårbarhetsuppgifter kan behöva finnas kvar.',
    guides: [
      {
        title: 'Spårbarhet för livsmedelsföretag',
        copy: 'Vad ett steg bakåt och ett steg framåt innebär och vilka typer av underlag som kan användas.',
        href: '/sparbarhet-livsmedel',
      },
      {
        title: 'Hur länge ska spårbarhetsuppgifter sparas?',
        copy: 'Vad vägledningen säger om lagringstid, hållbarhet och produktens verkliga livslängd.',
        href: '/spara-sparbarhetsuppgifter-livsmedel',
      },
    ],
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

export function KnowledgeBasePage() {
  useEffect(() => {
    const title = 'Kunskapsbank om egenkontroll och livsmedelssäkerhet | Min Egenkontroll';
    const description = 'Guider om digital egenkontroll, HACCP, faroanalys, dokumentation, avvikelser, verifiering och spårbarhet för livsmedelsföretag.';
    const canonicalUrl = `${siteUrl}/kunskapsbank`;

    document.title = title;
    setMeta('description', description);
    setMeta('robots', 'index, follow');
    setCanonical(canonicalUrl);
    setOpenGraphMeta('og:title', title);
    setOpenGraphMeta('og:description', description);
    setOpenGraphMeta('og:url', canonicalUrl);
  }, []);

  return (
    <main className="public-site">
      <nav className="public-nav" aria-label="Publik navigation">
        <a className="public-brand" href="/">
          <img src={brandAssets.logo} alt="Min Egenkontroll" />
        </a>
        <div className="public-nav-actions">
          <a href="/">Startsida</a>
          <a href="/signup">Gå med</a>
        </div>
      </nav>

      <section className="public-hero">
        <div className="public-hero-copy">
          <p className="public-eyebrow">Kunskapsbank</p>
          <h1>Egenkontroll och livsmedelssäkerhet – enkelt förklarat</h1>
          <p className="public-copy">
            Här samlar vi praktiska guider för mindre livsmedelsföretag. Fakta bygger på myndigheters vägledning och förklaras med fokus på vad frågorna betyder i vardagen.
          </p>
          <div className="public-hero-actions">
            <a className="public-primary" href="/digital-egenkontroll-livsmedel">Börja med digital egenkontroll</a>
            <a className="public-secondary" href="/">Se Min Egenkontroll</a>
          </div>
        </div>
      </section>

      {guideGroups.map((group, index) => (
        <section className={index % 2 === 0 ? 'public-band' : 'public-grid-section'} key={group.title}>
          <div className="public-section-heading">
            <p className="public-eyebrow">{group.eyebrow}</p>
            <h2>{group.title}</h2>
            <p className="public-copy">{group.intro}</p>
          </div>
          <div className="faq-list">
            {group.guides.map((guide) => (
              <a className="public-card" href={guide.href} key={guide.href}>
                <h3>{guide.title}</h3>
                <p>{guide.copy}</p>
              </a>
            ))}
          </div>
        </section>
      ))}

      <section className="public-cta">
        <p className="public-eyebrow">Från kunskap till vardag</p>
        <h2>Samla kontroller, avvikelser och historik på ett ställe.</h2>
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
