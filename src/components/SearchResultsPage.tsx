import { useEffect } from 'react';
import { Button, LinkButton, TextField } from '@min-egenkontroll/design-system';
import { searchPublicResources, type PublicResource } from '../config/publicResources';
import './Homepage.css';

function setSearchMeta() {
  document.title = 'Sök i Min Egenkontroll';
  const description = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (description) description.content = 'Sök bland vägledning och resurser från Min Egenkontroll.';
  const robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (robots) robots.content = 'noindex, follow';
  const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) canonical.href = 'https://minegenkontroll.se/sok';
}

function SearchSummary({ query, results }: { query: string; results: readonly PublicResource[] }) {
  if (!query) return <p className="home-search-summary" aria-live="polite" aria-atomic="true">Skriv en sökfras för att hitta en guide, mall eller checklista.</p>;
  if (!results.length) return <p className="home-search-summary" aria-live="polite" aria-atomic="true">0 träffar för “{query}”.</p>;
  return <p className="home-search-summary" aria-live="polite" aria-atomic="true">{results.length} {results.length === 1 ? 'träff' : 'träffar'} för “{query}”.</p>;
}

export function SearchResultsPage() {
  const query = new URLSearchParams(window.location.search).get('q')?.trim() ?? '';
  const matches = searchPublicResources(query);

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
      <SearchSummary query={query} results={matches} />
      {matches.length ? <div className="home-resource-list">{matches.map((resource) => <a href={resource.href} key={resource.href}><span>{resource.resourceType} · {resource.group}</span><strong>{resource.title}</strong><p>{resource.copy}</p></a>)}</div> : null}
      {!query ? <section className="home-empty"><h2>Börja med en sökning</h2><p>Du kan också bläddra bland alla befintliga resurser i kunskapsbanken.</p><LinkButton href="/kunskapsbank" variant="secondary">Öppna kunskapsbanken</LinkButton></section> : null}
      {query && !matches.length ? <section className="home-empty"><h2>Vi hittade ingen direkt träff.</h2><p>Prova en annan formulering eller börja i kunskapsbanken.</p><LinkButton href="/kunskapsbank" variant="secondary">Öppna kunskapsbanken</LinkButton></section> : null}
    </div>
  </main>;
}
