import { useEffect } from 'react';
import type { BusinessPageContent } from '../config/businessPages';
import { getPublicResource, type PublicResource } from '../config/publicResources';
import { PublicSiteShell } from './PublicSiteShell';
import { LinkButton } from './ui/Button';
import './BusinessPage.css';

const siteUrl = 'https://minegenkontroll.se';

type BusinessPageProps = {
  content: BusinessPageContent;
  onLogin: () => void;
  onStartTrial: () => void;
};

function setMeta(selector: string, value: string) {
  const element = document.head.querySelector<HTMLMetaElement>(selector);
  if (element) element.content = value;
}

function setPageMetadata(content: BusinessPageContent) {
  const canonical = `${siteUrl}${content.canonicalPath}`;
  document.title = content.title;
  setMeta('meta[name="description"]', content.description);
  setMeta('meta[name="robots"]', 'index, follow');
  setMeta('meta[property="og:title"]', content.title);
  setMeta('meta[property="og:description"]', content.description);
  setMeta('meta[property="og:url"]', canonical);
  const link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (link) link.href = canonical;
}

function getRegisteredResources(hrefs: readonly string[]): PublicResource[] {
  return hrefs.map((href) => {
    const resource = getPublicResource(href);
    if (!resource) throw new Error(`Publik resurs saknas i registret: ${href}`);
    return resource;
  });
}

export function BusinessPage({ content, onLogin, onStartTrial }: BusinessPageProps) {
  const practicalResources = getRegisteredResources(content.practicalResources.hrefs);

  useEffect(() => { setPageMetadata(content); }, [content]);

  return <PublicSiteShell className="business-page" onLogin={onLogin} onStartTrial={onStartTrial}>
    <main className="business-page__shell" id="main-content">
      <nav className="business-page__breadcrumb" aria-label="Brödsmulor">{content.breadcrumb.map((item) => item.href ? <a href={item.href} key={item.label}>{item.label}</a> : <span aria-current="page" key={item.label}>{item.label}</span>)}</nav>

      <header className="business-page__intro">
        <p className="business-page__eyebrow">{content.eyebrow}</p>
        <h1>{content.heading}</h1>
        <p className="business-page__answer">{content.shortAnswer}</p>
      </header>

      <section className="business-page__areas">
        <p className="business-page__eyebrow">{content.controlAreas.eyebrow}</p>
        <h2>{content.controlAreas.title}</h2>
        <p className="business-page__section-intro">{content.controlAreas.introduction}</p>
        <div className="business-page__area-grid">{content.controlAreas.items.map((item) => <article key={item.href}><h3>{item.title}</h3><p>{item.copy}</p><a href={item.href}>{item.linkLabel} →</a></article>)}</div>
      </section>

      <section className="business-page__workflow">
        <p className="business-page__eyebrow">{content.workflow.eyebrow}</p>
        <h2>{content.workflow.title}</h2>
        <p className="business-page__section-intro">{content.workflow.introduction}</p>
        <ol>{content.workflow.steps.map((step, index) => <li key={step.title}><span>{index + 1}</span><div><h3>{step.title}</h3><p>{step.copy}</p>{step.href && step.linkLabel ? <a href={step.href}>{step.linkLabel} →</a> : null}</div></li>)}</ol>
      </section>

      <section className="business-page__resources">
        <p className="business-page__eyebrow">{content.practicalResources.eyebrow}</p>
        <h2>{content.practicalResources.title}</h2>
        <p className="business-page__section-intro">{content.practicalResources.introduction}</p>
        <div>{practicalResources.map((resource) => <a href={resource.href} key={resource.href}><small>{resource.resourceType}</small><strong>{resource.title}</strong><p>{resource.copy}</p></a>)}</div>
      </section>

      <section className="business-page__mistakes">
        <p className="business-page__eyebrow">{content.mistakes.eyebrow}</p>
        <h2>{content.mistakes.title}</h2>
        <div>{content.mistakes.items.map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div>
      </section>

      <section className="business-page__faq">
        <h2>{content.faq.title}</h2>
        <div>{content.faq.items.map((item) => <article key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></article>)}</div>
      </section>

      <section className="business-page__sources">
        <h2>{content.sources.title}</h2>
        <dl><div><dt>Källtyp</dt><dd>{content.sources.type}</dd></div><div><dt>Faktagranskad</dt><dd>{content.sources.factCheckedAt}</dd></div></dl>
        {content.sources.links.map((source) => <p key={source.url}><a href={source.url}>{source.label}</a></p>)}
        <p>{content.sources.limitation}</p>
      </section>

      <section className="business-page__app">
        <p className="business-page__eyebrow">{content.appBridge.eyebrow}</p>
        <h2>{content.appBridge.title}</h2>
        <p>{content.appBridge.copy}</p>
        <LinkButton href={content.appBridge.href} variant="ghost">{content.appBridge.linkLabel}</LinkButton>
      </section>
    </main>
  </PublicSiteShell>;
}
