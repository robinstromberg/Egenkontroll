import { useEffect } from 'react';
import { LinkButton, Button } from './ui/Button';
import { TextField } from './ui/TextField';
import './Homepage.css';

const resources = [
  { href: '/haccp-sma-livsmedelsforetag', type: 'Ämnesnav', title: 'HACCP och riskstyrning', copy: 'Hitta rätt startpunkt för risker, kontrollplan och uppföljning.' },
  { href: '/faroanalys-livsmedel', type: 'Guide', title: 'Faroanalys för livsmedel', copy: 'Förstå hur du kan bedöma faror i din verksamhet.' },
  { href: '/seo/kontrollplan.html', type: 'Resurskandidat', title: 'Kontrollplan', copy: 'Läs om vad en kontrollplan behöver omfatta.' },
  { href: '/seo/varumottagning-livsmedel.html', type: 'Guide', title: 'Varumottagning', copy: 'Stöd för mottagning, kontroll och dokumentation.' },
];

function setSearchMeta() {
  document.title = 'Sök i Min Egenkontroll';
  const description = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (description) description.content = 'Sök bland vägledning och resurser från Min Egenkontroll.';
  const robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (robots) robots.content = 'noindex, follow';
  const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) canonical.href = 'https://minegenkontroll.se/sok';
}

export function SearchResultsPage() {
  const query = new URLSearchParams(window.location.search).get('q')?.trim() ?? '';
  const term = query.toLocaleLowerCase('sv-SE');
  const matches = term ? resources.filter((resource) => `${resource.title} ${resource.copy}`.toLocaleLowerCase('sv-SE').includes(term)) : resources;

  useEffect(() => { setSearchMeta(); }, []);

  return <main className="home-page" id="main-content">
    <div className="home-shell home-search-results">
      <LinkButton href="/" variant="ghost">← Till startsidan</LinkButton>
      <p className="home-kicker">Sök</p>
      <h1>Sök i vägledning, mallar och checklistor</h1>
      <form className="home-search-form" action="/sok" method="get" role="search">
        <label htmlFor="site-search">Sök i Min Egenkontroll</label>
        <div><TextField id="site-search" name="q" type="search" defaultValue={query} /><Button type="submit">Sök</Button></div>
      </form>
      <p className="home-search-summary">{query ? `Resultat för “${query}”` : 'Välj en resurs eller skriv en sökfras.'}</p>
      <div className="home-resource-list">
        {matches.map((resource) => <a href={resource.href} key={resource.href}><span>{resource.type}</span><strong>{resource.title}</strong><p>{resource.copy}</p></a>)}
      </div>
      {query && !matches.length ? <section className="home-empty"><h2>Vi hittade ingen direkt träff.</h2><p>Prova en annan formulering eller börja i kunskapsbanken.</p><LinkButton href="/kunskapsbank" variant="secondary">Öppna kunskapsbanken</LinkButton></section> : null}
    </div>
  </main>;
}
