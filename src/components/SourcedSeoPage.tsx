import { useEffect } from 'react';
import { brandAssets } from '../config/assets';
import './PublicLandingPage.css';

export type SourcedSeoPageContent = {
  slug: string;
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
  sourceLabel: string;
  sourceUrl: string;
  related: Array<[string, string, string]>;
};

const siteUrl = 'https://minegenkontroll.se';
const sourceNote =
  'Faktaunderlaget bygger på Livsmedelsverkets vägledning. Vägledningen är inte bindande och Min Egenkontroll ersätter inte verksamhetens egen bedömning eller kontrollmyndighetens bedömning i det enskilda fallet.';

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

export function SourcedSeoPage({ content }: { content: SourcedSeoPageContent }) {
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
        <a className="public-brand" href="/"><img src={brandAssets.logo} alt="Min Egenkontroll" /></a>
        <div className="public-nav-actions"><a href="/#how">Så fungerar det</a><a href="/signup">Gå med</a></div>
      </nav>
      <section className="public-hero"><div className="public-hero-copy">
        <p className="public-eyebrow">{content.eyebrow}</p><h1>{content.heading}</h1><p className="public-copy">{content.intro}</p>
        <div className="public-hero-actions"><a className="public-primary" href="/signup">Gå med i förhandslanseringen</a><a className="public-secondary" href="/">Se Min Egenkontroll</a></div>
      </div></section>
      <section className="public-band"><div className="public-section-heading"><p className="public-eyebrow">Det viktigaste</p><h2>Förstå vad som behöver fungera i praktiken.</h2></div>
        <div className="public-steps">{content.benefits.map(([title, copy]) => <article className="public-card" key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>
      <section className="public-grid-section"><div><p className="public-eyebrow">Så fungerar det</p><h2>{content.practicalHeading}</h2><p className="public-copy">{content.practicalText}</p>
        <p className="public-copy">Källa och vidare läsning: <a href={content.sourceUrl}>{content.sourceLabel}</a>.</p><p className="public-copy">{sourceNote}</p></div>
        <div><h2>{content.examplesHeading}</h2><div className="control-chip-grid">{content.examples.map((example) => <span key={example}>{example}</span>)}</div></div>
      </section>
      <section className="public-band"><div className="public-section-heading"><p className="public-eyebrow">Frågor och svar</p><h2>Vanliga frågor</h2></div>
        <div className="faq-list">{content.faq.map(([question, answer]) => <article className="public-card" key={question}><h3>{question}</h3><p>{answer}</p></article>)}</div>
      </section>
      <section className="public-grid-section"><div><p className="public-eyebrow">Läs vidare</p><h2>Fortsätt med nästa del</h2></div>
        <div className="faq-list">{content.related.map(([href, title, copy]) => <a className="public-card" href={href} key={href}><h3>{title}</h3><p>{copy}</p></a>)}</div>
      </section>
      <section className="public-cta"><p className="public-eyebrow">Förhandslansering</p><h2>Prova Min Egenkontroll kostnadsfritt under utvecklingsperioden.</h2><a className="public-primary" href="/signup">Gå med i förhandslanseringen</a></section>
      <footer className="public-footer"><span>© 2026 Min Egenkontroll</span><div className="public-footer-links"><a href="/integritetspolicy">Integritetspolicy</a><a href="/anvandarvillkor">Användarvillkor</a></div></footer>
    </main>
  );
}
