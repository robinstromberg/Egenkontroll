import { useEffect } from 'react';
import { brandAssets } from '@min-egenkontroll/brand';
import { publicResourceGroups } from '../config/publicResources';
import './PublicLandingPage.css';

export function KnowledgeBasePage() {
  useEffect(() => {
    document.title = 'Kunskapsbank om egenkontroll och livsmedelssäkerhet | Min Egenkontroll';
    const description = 'Guider om egenkontroll, hygien, lokaler, märkning, livsmedelsinformation, temperatur, datummärkning, HACCP och spårbarhet för livsmedelsföretag.';
    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = description;
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = 'https://minegenkontroll.se/kunskapsbank';
  }, []);

  return <main className="public-site">
    <nav className="public-nav" aria-label="Publik navigation"><a className="public-brand" href="/"><img src={brandAssets.logo} alt="Min Egenkontroll" /></a><div className="public-nav-actions"><a href="/">Startsida</a><a href="/signup">Gå med</a></div></nav>
    <section className="public-hero"><div className="public-hero-copy"><p className="public-eyebrow">Kunskapsbank</p><h1>Egenkontroll och livsmedelssäkerhet – enkelt förklarat</h1><p className="public-copy">Praktiska guider för mindre livsmedelsföretag. Fakta bygger på myndigheters vägledning, länkar till underlaget och visar när innehållet faktakontrollerades.</p><div className="public-hero-actions"><a className="public-primary" href="/digital-egenkontroll-livsmedel">Börja med digital egenkontroll</a><a className="public-secondary" href="/seo/kallor-och-faktagranskning.html">Så granskar vi innehållet</a></div></div></section>
    {publicResourceGroups.map((group, index) => <section className={index % 2 === 0 ? 'public-band' : 'public-grid-section'} key={group.title}><div className="public-section-heading"><p className="public-eyebrow">{group.eyebrow}</p><h2>{group.title}</h2><p className="public-copy">{group.intro}</p></div><div className="faq-list">{group.resources.map((resource) => <a className="public-card" href={resource.href} key={resource.href}><span className="public-eyebrow">{resource.resourceType}</span><h3>{resource.title}</h3><p>{resource.copy}</p></a>)}</div></section>)}
    <section className="public-cta"><p className="public-eyebrow">Från kunskap till vardag</p><h2>Samla kontroller, avvikelser och historik på ett ställe.</h2><a className="public-primary" href="/signup">Gå med i förhandslanseringen</a></section>
    <footer className="public-footer"><span>© 2026 Min Egenkontroll</span><div className="public-footer-links"><a href="/seo/kallor-och-faktagranskning.html">Källor och faktagranskning</a><a href="/integritetspolicy">Integritetspolicy</a><a href="/anvandarvillkor">Användarvillkor</a></div></footer>
  </main>;
}
