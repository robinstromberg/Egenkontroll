import { useEffect } from 'react';
import { faroanalysFactPage, type FactPageContent } from '../config/factPages';
import { PublicSiteShell } from './PublicSiteShell';
import { LinkButton } from './ui/Button';
import './FactPage.css';

const siteUrl = 'https://minegenkontroll.se';
function setMeta(selector: string, value: string) { const element = document.head.querySelector<HTMLMetaElement>(selector); if (element) element.content = value; }
function setPageMetadata(content: FactPageContent) { const canonical = `${siteUrl}${content.canonicalPath}`; document.title = content.title; setMeta('meta[name="description"]', content.description); setMeta('meta[name="robots"]', 'index, follow'); setMeta('meta[property="og:title"]', content.title); setMeta('meta[property="og:description"]', content.description); setMeta('meta[property="og:url"]', canonical); const link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]'); if (link) link.href = canonical; }

export function FaroanalysFactPage({ onLogin, onStartTrial }: { onLogin: () => void; onStartTrial: () => void }) {
  const content = faroanalysFactPage;
  useEffect(() => { setPageMetadata(content); }, [content]);
  return <PublicSiteShell className="fact-page" onLogin={onLogin} onStartTrial={onStartTrial}><main className="fact-page__shell" id="main-content">
    <nav className="fact-page__breadcrumb" aria-label="Brödsmulor">{content.breadcrumb.map((item) => item.href ? <a href={item.href} key={item.label}>{item.label}</a> : <span key={item.label} aria-current="page">{item.label}</span>)}</nav>
    <article className="fact-page__article"><header className="fact-page__intro"><p className="fact-page__eyebrow">{content.eyebrow}</p><h1>{content.heading}</h1><p className="fact-page__answer">{content.shortAnswer}</p></header>
      <nav className="fact-page__toc" aria-label="Innehåll på sidan"><h2>På den här sidan</h2><ol><li><a href="#definition">Definition och avgränsning</a></li><li><a href="#arbetsgang">Arbetsgång</a></li><li><a href="#exempel">Exempel för liten verksamhet</a></li><li><a href="#vanliga-fel">Vanliga fel och gränsdragningar</a></li><li><a href="#fragor">Frågor och svar</a></li><li><a href="#kalla">Källa och faktakontroll</a></li></ol></nav>
      <section id="definition"><h2>{content.definition.title}</h2>{content.definition.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>
      <section id="arbetsgang"><p className="fact-page__eyebrow">Praktisk arbetsgång</p><h2>Så kan du gå igenom faroanalysen</h2><ol className="fact-page__steps">{content.workflow.map((step, index) => <li key={step.title}><span>{index + 1}</span><div><h3>{step.title}</h3><p>{step.copy}</p></div></li>)}</ol></section>
      <section className="fact-page__example" id="exempel"><p className="fact-page__eyebrow">Exempel, inte färdigt svar</p><h2>{content.example.title}</h2><p>{content.example.introduction}</p><ol>{content.example.steps.map((step) => <li key={step}>{step}</li>)}</ol><p className="fact-page__note"><strong>Att tänka på:</strong> {content.example.note}</p></section>
      <section id="vanliga-fel"><h2>Vanliga fel och gränsdragningar</h2><div className="fact-page__mistakes">{content.mistakes.map((mistake) => <article key={mistake.title}><h3>{mistake.title}</h3><p>{mistake.copy}</p></article>)}</div></section>
      <section id="fragor"><h2>Frågor och svar</h2><div className="fact-page__faq">{content.faq.map((item) => <article key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></article>)}</div></section>
      <section className="fact-page__source" id="kalla"><h2>Källa och faktakontroll</h2><dl><div><dt>Källtyp</dt><dd>{content.source.type}</dd></div><div><dt>Faktagranskad</dt><dd>{content.source.factCheckedAt}</dd></div></dl><p><a href={content.source.url}>{content.source.label}</a></p><p>{content.source.limitation}</p></section>
      <section className="fact-page__next"><p className="fact-page__eyebrow">Fortsätt i arbetsordning</p><h2>{content.sequentialNextStep.title}</h2><p>{content.sequentialNextStep.copy}</p><LinkButton href={content.sequentialNextStep.href} variant="secondary">Till kontrollplanen</LinkButton></section>
      <section className="fact-page__app"><p className="fact-page__eyebrow">{content.appBridge.title}</p><h2>Dokumentera löpande arbete i appen</h2><p>{content.appBridge.copy}</p><LinkButton href={content.appBridge.href} variant="ghost">{content.appBridge.linkLabel}</LinkButton></section>
    </article>
  </main></PublicSiteShell>;
}
