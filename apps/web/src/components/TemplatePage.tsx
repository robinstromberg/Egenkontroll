import { useEffect, useRef, useState } from 'react';
import type { TemplateFieldDefinition, TemplatePageContent } from '../config/templatePages';
import { PublicSiteShell } from './PublicSiteShell';
import { Button, LinkButton } from '@min-egenkontroll/design-system';
import './TemplatePage.css';

const siteUrl = 'https://minegenkontroll.se';

type TemplatePageProps = {
  content: TemplatePageContent;
};

type Entry = { id: number; values: Record<string, string> };

function emptyValues(fields: readonly TemplateFieldDefinition[]) {
  return Object.fromEntries(fields.map((field) => [field.id, '']));
}

function setMeta(selector: string, value: string) {
  const element = document.head.querySelector<HTMLMetaElement>(selector);
  if (element) element.content = value;
}

function setPageMetadata(content: TemplatePageContent) {
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

function EditableField({ field, idPrefix, value, onChange }: { field: TemplateFieldDefinition; idPrefix: string; value: string; onChange: (value: string) => void }) {
  const id = `${idPrefix}-${field.id}`;
  const className = `template-page__field ${field.fullWidth ? 'template-page__field--wide' : ''}`.trim();
  return <div className={className}>
    <label htmlFor={id}>{field.label}</label>
    {field.hint && <span className="template-page__hint" id={`${id}-hint`}>{field.hint}</span>}
    {field.multiline
      ? <textarea aria-describedby={field.hint ? `${id}-hint` : undefined} id={id} onChange={(event) => onChange(event.target.value)} placeholder={field.placeholder} rows={3} value={value} />
      : <input aria-describedby={field.hint ? `${id}-hint` : undefined} id={id} onChange={(event) => onChange(event.target.value)} placeholder={field.placeholder} type="text" value={value} />}
    <div aria-hidden="true" className="template-page__print-value">{value || '\u00a0'}</div>
  </div>;
}

export function TemplatePage({ content }: TemplatePageProps) {
  const [documentValues, setDocumentValues] = useState(() => emptyValues(content.documentFields));
  const [entries, setEntries] = useState<Entry[]>(() => [{ id: 1, values: emptyValues(content.entryFields) }]);
  const nextEntryId = useRef(2);

  useEffect(() => { setPageMetadata(content); }, [content]);

  function addEntry() {
    const id = nextEntryId.current;
    nextEntryId.current += 1;
    setEntries((current) => [...current, { id, values: emptyValues(content.entryFields) }]);
  }

  function updateEntry(entryId: number, fieldId: string, value: string) {
    setEntries((current) => current.map((entry) => entry.id === entryId ? { ...entry, values: { ...entry.values, [fieldId]: value } } : entry));
  }

  function removeEntry(entryId: number) {
    setEntries((current) => current.filter((entry) => entry.id !== entryId));
  }

  return <PublicSiteShell>
    <main className="template-page__shell ds-page-shell ds-content" id="main-content">
      <nav className="template-page__breadcrumb" aria-label="Brödsmulor">{content.breadcrumb.map((item) => item.href ? <a href={item.href} key={item.label}>{item.label}</a> : <span aria-current="page" key={item.label}>{item.label}</span>)}</nav>
      <header className="template-page__intro ds-content-intro">
        <p className="template-page__eyebrow">{content.eyebrow}</p>
        <h1 className="ds-content-heading">{content.heading}</h1>
        <p className="template-page__lead ds-content-prose">{content.introduction}</p>
        <p className="template-page__adaptation"><strong>Anpassa innan användning:</strong> {content.adaptationNote}</p>
        <div className="template-page__intro-actions">
          <Button onClick={() => window.print()}>Skriv ut eller spara PDF</Button>
          <LinkButton href={content.factLink.href} variant="secondary">{content.factLink.label}</LinkButton>
        </div>
      </header>

      <section className="template-page__instructions">
        <h2>{content.instructionsTitle}</h2>
        <ol>{content.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}</ol>
      </section>

      <form className="template-page__document" onSubmit={(event) => event.preventDefault()}>
        <header className="template-page__document-header">
          <p className="template-page__print-brand">Min Egenkontroll</p>
          <h2>{content.documentTitle}</h2>
          <p>{content.documentDescription}</p>
        </header>
        <div className="template-page__document-fields ds-form-stack">
          {content.documentFields.map((field) => <EditableField field={field} idPrefix="document" key={field.id} onChange={(value) => setDocumentValues((current) => ({ ...current, [field.id]: value }))} value={documentValues[field.id]} />)}
        </div>

        <div className="template-page__entries">
          {entries.map((entry, index) => <fieldset className="template-page__entry" key={entry.id}>
            <legend>{content.entryTitle} {index + 1}</legend>
            <div className="template-page__entry-fields ds-form-stack">
              {content.entryFields.map((field) => <EditableField field={field} idPrefix={`entry-${entry.id}`} key={field.id} onChange={(value) => updateEntry(entry.id, field.id, value)} value={entry.values[field.id]} />)}
            </div>
            {entries.length > 1 && <Button aria-label={`Ta bort kontrollpunkt ${index + 1}`} className="template-page__remove" onClick={() => removeEntry(entry.id)} variant="ghost">Ta bort kontrollpunkt</Button>}
          </fieldset>)}
        </div>
        <div className="template-page__document-actions">
          <Button onClick={addEntry} variant="secondary">{content.addEntryLabel}</Button>
          <Button onClick={() => window.print()}>Skriv ut eller spara PDF</Button>
        </div>
      </form>

      <section className="template-page__example" data-purpose="illustrative-example">
        <p className="template-page__eyebrow">{content.example.eyebrow}</p>
        <h2>{content.example.title}</h2>
        <p>{content.example.introduction}</p>
        <dl>{content.entryFields.map((field) => <div key={field.id}><dt>{field.label}</dt><dd>{content.example.values[field.id]}</dd></div>)}</dl>
        <p className="template-page__example-note"><strong>Observera:</strong> {content.example.note}</p>
      </section>

      <section className="template-page__sources">
        <h2>{content.sources.title}</h2>
        <dl><div><dt>Källtyp</dt><dd>{content.sources.type}</dd></div><div><dt>Faktagranskad</dt><dd>{content.sources.factCheckedAt}</dd></div></dl>
        {content.sources.links.map((source) => <p key={source.url}><a href={source.url}>{source.label}</a></p>)}
        <p>{content.sources.limitation}</p>
      </section>

      <section className="template-page__app">
        <p className="template-page__eyebrow">{content.appBridge.eyebrow}</p>
        <h2>{content.appBridge.title}</h2>
        <p>{content.appBridge.copy}</p>
        <LinkButton href={content.appBridge.href} variant="ghost">{content.appBridge.linkLabel}</LinkButton>
      </section>
    </main>
  </PublicSiteShell>;
}
