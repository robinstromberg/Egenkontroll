import { useEffect } from 'react';
import type { FactPageContent } from '../config/factPages';
import { PublicSiteShell } from './PublicSiteShell';
import { LinkButton } from '@min-egenkontroll/design-system';
import './FactPage.css';

const siteUrl = 'https://minegenkontroll.se';
function setMeta(selector: string, value: string) { const element = document.head.querySelector<HTMLMetaElement>(selector); if (element) element.content = value; }
function setPageMetadata(content: FactPageContent) { const canonical = `${siteUrl}${content.canonicalPath}`; document.title = content.title; setMeta('meta[name="description"]', content.description); setMeta('meta[name="robots"]', 'index, follow'); setMeta('meta[property="og:title"]', content.title); setMeta('meta[property="og:description"]', content.description); setMeta('meta[property="og:url"]', canonical); const link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]'); if (link) link.href = canonical; }

type FactPageProps = { content: FactPageContent };

export function FactPage({ content }: FactPageProps) {
  useEffect(() => { setPageMetadata(content); }, [content]);
  return <PublicSiteShell><main className="fact-page__shell" id="main-content">
    <nav className="fact-page__breadcrumb" aria-label="Brödsmulor">{content.breadcrumb.map((item) => item.href ? <a href={item.href} key={item.label}>{item.label}</a> : <span key={item.label} aria-current="page">{item.label}</span>)}</nav>
    <article className="fact-page__article"><header className="fact-page__intro"><p className="fact-page__eyebrow">{content.eyebrow}</p><h1>{content.heading}</h1><p className="fact-page__answer">{content.shortAnswer}</p></header>
      <nav className="fact-page__toc" aria-label="Innehåll på sidan"><h2>{content.tableOfContentsTitle}</h2><ol><li><a href="#definition">{content.definition.title}</a></li><li><a href="#arbetsgang">{content.workflow.title}</a></li><li><a href="#exempel">{content.example.title}</a></li><li><a href="#vanliga-fel">{content.mistakes.title}</a></li><li><a href="#fragor">{content.faq.title}</a></li><li><a href="#kalla">{content.sourceSectionTitle}</a></li></ol></nav>
      <section id="definition"><h2>{content.definition.title}</h2>{content.definition.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>
      <section id="arbetsgang"><p className="fact-page__eyebrow">{content.workflow.eyebrow}</p><h2>{content.workflow.title}</h2><ol className="fact-page__steps">{content.workflow.steps.map((step, index) => <li key={step.title}><span>{index + 1}</span><div><h3>{step.title}</h3><p>{step.copy}</p></div></li>)}</ol></section>
      <section className="fact-page__example" id="exempel"><p className="fact-page__eyebrow">{content.example.eyebrow}</p><h2>{content.example.title}</h2><p>{content.example.introduction}</p><dl className="fact-page__example-fields">{content.example.fields.map((field) => <div key={field.label}><dt>{field.label}</dt><dd>{field.value}</dd></div>)}</dl><p className="fact-page__note"><strong>{content.example.noteLabel}</strong> {content.example.note}</p></section>
      <section id="vanliga-fel"><h2>{content.mistakes.title}</h2><div className="fact-page__mistakes">{content.mistakes.items.map((mistake) => <article key={mistake.title}><h3>{mistake.title}</h3><p>{mistake.copy}</p></article>)}</div></section>
      <section id="fragor"><h2>{content.faq.title}</h2><div className="fact-page__faq">{content.faq.items.map((item) => <article key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></article>)}</div></section>
      <section className="fact-page__source" id="kalla"><h2>{content.sourceSectionTitle}</h2><dl><div><dt>Källtyp</dt><dd>{content.source.type}</dd></div><div><dt>Faktagranskad</dt><dd>{content.source.factCheckedAt}</dd></div></dl><p><a href={content.source.url}>{content.source.label}</a></p>{content.additionalSources?.map((source) => <p key={source.url}><a href={source.url}>{source.label}</a></p>)}<p>{content.source.limitation}</p></section>
      {content.relatedLinks && <section><h2>{content.relatedLinks.title}</h2><div className="fact-page__faq">{content.relatedLinks.links.map((link) => <article key={link.href}><h3><a href={link.href}>{link.title}</a></h3><p>{link.copy}</p></article>)}</div></section>}
      <section className="fact-page__next"><p className="fact-page__eyebrow">{content.sequentialNextStep.eyebrow}</p><h2>{content.sequentialNextStep.title}</h2><p>{content.sequentialNextStep.copy}</p><LinkButton href={content.sequentialNextStep.href} variant="secondary">{content.sequentialNextStep.linkLabel}</LinkButton></section>
      <section className="fact-page__app"><p className="fact-page__eyebrow">{content.appBridge.eyebrow}</p><h2>{content.appBridge.title}</h2><p>{content.appBridge.copy}</p><LinkButton href={content.appBridge.href} variant="ghost">{content.appBridge.linkLabel}</LinkButton></section>
    </article>
  </main></PublicSiteShell>;
}
