import { LinkButton } from '@min-egenkontroll/design-system';
import { publicResourceGroups } from '../config/publicResources';
import { PublicSiteShell } from './PublicSiteShell';
import './KnowledgeBasePage.css';

export function KnowledgeBasePage() {
  return <PublicSiteShell>
    <main className="knowledge-base__shell ds-page-shell ds-content" id="main-content">
      <nav className="knowledge-base__breadcrumb" aria-label="Brödsmulor"><a href="/">Startsida</a><span aria-hidden="true">/</span><span aria-current="page">Kunskapsbank</span></nav>

      <header className="knowledge-base__intro ds-content-intro">
        <p className="knowledge-base__eyebrow">Kunskapsbank</p>
        <h1 className="ds-content-heading">Egenkontroll och livsmedelssäkerhet – enkelt förklarat</h1>
        <p className="knowledge-base__lead ds-content-prose">Praktiska guider för mindre livsmedelsföretag. Fakta bygger på myndigheters vägledning, länkar till underlaget och visar när innehållet faktakontrollerades.</p>
        <div className="knowledge-base__actions">
          <LinkButton href="/digital-egenkontroll-livsmedel" variant="primary">Börja med digital egenkontroll</LinkButton>
          <LinkButton href="/seo/kallor-och-faktagranskning.html" variant="secondary">Så granskar vi innehållet</LinkButton>
        </div>
      </header>

      {publicResourceGroups.map((group) => <section className="knowledge-base__group" key={group.title}>
        <div className="knowledge-base__group-heading">
          <p className="knowledge-base__eyebrow">{group.eyebrow}</p>
          <h2>{group.title}</h2>
          <p>{group.intro}</p>
        </div>
        <div className="knowledge-base__resources">{group.resources.map((resource) => <a href={resource.href} key={resource.href}>
          <small>{resource.resourceType}</small>
          <h3>{resource.title}</h3>
          <p>{resource.copy}</p>
        </a>)}</div>
      </section>)}

      <section className="knowledge-base__app">
        <p className="knowledge-base__eyebrow">Från kunskap till vardag</p>
        <h2>Samla kontroller, avvikelser och historik på ett ställe.</h2>
        <LinkButton href="/signup" variant="ghost">Gå med i förhandslanseringen</LinkButton>
      </section>
    </main>
  </PublicSiteShell>;
}
