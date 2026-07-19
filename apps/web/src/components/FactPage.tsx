import type { FactPageContent } from '../config/factPages';
import type { MigratedKnowledgeArticleContent } from '../config/migratedKnowledgeArticles';
import { PublicSiteShell } from './PublicSiteShell';
import { LinkButton } from '@min-egenkontroll/design-system';
import './FactPage.css';

type FactPageProps = { content: FactPageContent | MigratedKnowledgeArticleContent };

function isMigratedArticle(content: FactPageProps['content']): content is MigratedKnowledgeArticleContent {
  return 'blocks' in content;
}

function MigratedArticleBody({ content }: { content: MigratedKnowledgeArticleContent }) {
  return <>
    <nav className="fact-page__toc" aria-label="Innehåll på sidan">
      <h2>{content.tableOfContentsTitle}</h2>
      <ol>
        {content.blocks.map((block) => <li key={block.id}><a href={`#${block.id}`}>{block.title}</a></li>)}
        <li><a href="#kalla">{content.sourceSectionTitle}</a></li>
        <li><a href="#relaterat">{content.relatedLinks.title}</a></li>
      </ol>
    </nav>
    {content.blocks.map((block) => {
      const classification = block.type === 'classified' ? block.classification : undefined;
      return <section
        className={`fact-page__content-block fact-page__content-block--${block.type}${classification ? ` fact-page__content-block--${classification}` : ''}`}
        data-content-classification={classification}
        id={block.id}
        key={block.id}
      >
        {block.type === 'classified' ? <p className="fact-page__classification"><span aria-hidden="true">{block.classification === 'requirement' ? 'K' : block.classification === 'guidance' ? 'V' : 'E'}</span>{block.classificationLabel}</p> : null}
        <h2>{block.title}</h2>
        {block.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {block.type === 'classified' && block.items ? <ul>{block.items.map((item) => <li key={item}>{item}</li>)}</ul> : null}
      </section>;
    })}
    <section className="fact-page__source" id="kalla">
      <h2>{content.sourceSectionTitle}</h2>
      <dl>
        <div><dt>Källtyp</dt><dd>{content.source.type}</dd></div>
        <div><dt>Faktagranskad</dt><dd><time dateTime={content.source.factCheckedAt}>{content.source.factCheckedAt}</time></dd></div>
        <div><dt>Kontrollerade avsnitt</dt><dd>{content.source.relevantSections.join(', ')}</dd></div>
        <div><dt>Rättslig hänvisning</dt><dd>{content.source.legalReference}</dd></div>
      </dl>
      <p><a href={content.source.url}>{content.source.label}</a></p>
      <p>{content.source.limitation}</p>
    </section>
    <section id="relaterat">
      <h2>{content.relatedLinks.title}</h2>
      <div className="fact-page__faq">{content.relatedLinks.links.map((link) => <article key={link.href}><h3><a href={link.href}>{link.title}</a></h3><p>{link.copy}</p></article>)}</div>
    </section>
    <section className="fact-page__app"><p className="fact-page__eyebrow">{content.appBridge.eyebrow}</p><h2>{content.appBridge.title}</h2><p>{content.appBridge.copy}</p><LinkButton href={content.appBridge.href} variant="ghost">{content.appBridge.linkLabel}</LinkButton></section>
  </>;
}

function ExistingFactPageBody({ content }: { content: FactPageContent }) {
  return <>
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
  </>;
}

export function FactPage({ content }: FactPageProps) {
  return <PublicSiteShell><main className="fact-page__shell ds-page-shell ds-page-shell--prose ds-content" id="main-content">
    <nav className="fact-page__breadcrumb" aria-label="Brödsmulor">{content.breadcrumb.map((item) => item.href ? <a href={item.href} key={item.label}>{item.label}</a> : <span key={item.label} aria-current="page">{item.label}</span>)}</nav>
    <article className="fact-page__article"><header className="fact-page__intro ds-content-intro"><p className="fact-page__eyebrow">{content.eyebrow}</p><h1 className="ds-content-heading">{content.heading}</h1><p className="fact-page__answer ds-content-prose">{content.shortAnswer}</p></header>
      {isMigratedArticle(content) ? <MigratedArticleBody content={content} /> : <ExistingFactPageBody content={content} />}
    </article>
  </main></PublicSiteShell>;
}
