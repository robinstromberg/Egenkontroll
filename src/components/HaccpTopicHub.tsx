import { useEffect } from 'react';
import { LinkButton } from './ui/Button';
import { brandAssets } from '../config/assets';
import { getPublicResource } from '../config/publicResources';
import { getSeoPageContent } from './SeoLandingPage';
import './HaccpTopicHub.css';

const content = getSeoPageContent('haccp-sma-livsmedelsforetag');
const resources = [
  ['/faroanalys-livsmedel', 'Identifiera faror', 'Faktasida'],
  ['/seo/kritiska-gransvarden.html', 'Sätt gränser', 'Guide'],
  ['/seo/kontrollplan.html', 'Planera kontroller', 'Praktisk resurs'],
  ['/avvikelser-korrigerande-atgarder-livsmedel', 'Hantera avvikelser', 'Faktasida'],
  ['/verifiering-egenkontroll-livsmedel', 'Verifiera arbetet', 'Faktasida'],
  ['/dokumentation-egenkontroll-livsmedel', 'Dokumentera', 'Faktasida'],
] as const;
const steps = ['Förstå förutsättningar', 'Identifiera faror', 'Sätt gränser och planera kontroll', 'Hantera avvikelser', 'Verifiera', 'Dokumentera'];

function setMeta() {
  document.title = content.title;
  for (const [selector, value] of [['meta[name="description"]', content.description], ['meta[name="robots"]', 'index, follow'], ['meta[property="og:title"]', content.title], ['meta[property="og:description"]', content.description], ['meta[property="og:url"]', 'https://minegenkontroll.se/haccp-sma-livsmedelsforetag']] as const) {
    const element = document.head.querySelector<HTMLMetaElement>(selector); if (element) element.content = value;
  }
  const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]'); if (canonical) canonical.href = 'https://minegenkontroll.se/haccp-sma-livsmedelsforetag';
}

export function HaccpTopicHub({ onLogin, onStartTrial }: { onLogin: () => void; onStartTrial: () => void }) {
  useEffect(() => { setMeta(); }, []);
  return <div className="haccp-page">
    <header className="haccp-header"><div className="haccp-shell"><a className="haccp-brand" href="/"><img src={brandAssets.icon} alt="" />Min Egenkontroll</a><nav aria-label="Huvudnavigation"><a href="/kunskapsbank">Kunskap</a><a href="/seo/kontrollplan.html">Mallar och checklistor</a><a href="/faroanalys-livsmedel">Verktyg</a></nav><div><button type="button" onClick={onLogin}>Logga in</button><button className="ds-button ds-button--primary" type="button" onClick={onStartTrial}>Kom igång</button></div></div></header>
    <main className="haccp-shell" id="main-content"><nav className="haccp-breadcrumb" aria-label="Brödsmulor"><a href="/kunskapsbank">Kunskap</a><span aria-hidden="true">/</span><span>HACCP och riskstyrning</span></nav>
      <section className="haccp-intro"><p className="haccp-kicker">HACCP och riskstyrning</p><h1>{content.heading}</h1><p>{content.intro}</p><p>För små livsmedelsverksamheter handlar arbetet om att förstå de egna förutsättningarna och välja kontroller som faktiskt behövs.</p></section>
      <section className="haccp-start"><h2>Börja här utifrån det du behöver</h2><div><a href="#arbetskedja"><strong>Förstå grunderna</strong><span>Se hur delarna hänger ihop.</span></a><a href="/faroanalys-livsmedel"><strong>Förbättra en faroanalys</strong><span>Identifiera relevanta faror.</span></a><a href="/seo/kontrollplan.html"><strong>Planera kontroller</strong><span>Samla kontrollpunkter och ansvar.</span></a><a href="/avvikelser-korrigerande-atgarder-livsmedel"><strong>Följ upp avvikelser</strong><span>Återställ och förebygg.</span></a></div></section>
      <section className="haccp-chain" id="arbetskedja"><p className="haccp-kicker">HACCP-arbetskedjan</p><h2>Arbeta i en begriplig ordning</h2><ol>{steps.map((step, index) => <li key={step}><b>{index + 1}</b><span>{step}</span></li>)}</ol></section>
      <section className="haccp-knowledge"><p className="haccp-kicker">Kunskap och resurser</p><h2>Välj nästa relevanta steg</h2><div>{resources.map(([href, role, type]) => { const resource = getPublicResource(href)!; return <a href={href} key={href}><small>{type} · {role}</small><strong>{resource.title}</strong><p>{resource.copy}</p></a>; })}</div></section>
      <section className="haccp-practical"><div><p className="haccp-kicker">Praktiskt stöd</p><h2>Planera först. Anpassa sedan.</h2><p>Kontrollplanen är en befintlig resurs att läsa och anpassa. Ett faroanalysverktyg är på väg och ersätter inte den egna bedömningen.</p><LinkButton href="/seo/kontrollplan.html" variant="secondary">Läs om kontrollplanen</LinkButton></div><aside><strong>Faroanalysverktyg · På väg</strong><p>Utvecklas som ett framtida stöd med synliga antaganden och metod.</p></aside></section>
      <section className="haccp-flex"><h2>Flexibilitet för små verksamheter</h2><p>{content.practicalText}</p></section>
      <section className="haccp-faq"><h2>Frågor och svar</h2>{content.faq.map(([question, answer]) => <article key={question}><h3>{question}</h3><p>{answer}</p></article>)}</section>
      <section className="haccp-source"><h2>Källa och begränsning</h2><p><strong>Källtyp:</strong> myndighetsvägledning.</p><p><a href={content.sourceUrl}>{content.sourceLabel}</a></p><p>{content.sourceNote}</p><p>Granskningsdatum visas inte eftersom något verifierat datum inte finns i repot.</p></section>
      <section className="haccp-app"><p className="haccp-kicker">När arbetet återkommer</p><h2>Dokumentera löpande arbete i appen.</h2><p>Min Egenkontroll kan stötta återkommande kontroller, avvikelser och historik när rutinerna ska följas upp.</p><LinkButton href="/digital-egenkontroll-livsmedel" variant="primary">Se hur appen fungerar</LinkButton></section>
      <section className="haccp-related"><h2>Relaterade ämnen</h2><a href="/kunskapsbank">Utforska kunskapsbanken</a><a href="/sparbarhet-livsmedel">Spårbarhet</a></section>
    </main><footer className="haccp-footer"><div className="haccp-shell"><span>© 2026 Min Egenkontroll</span><a href="/integritetspolicy">Integritet</a><a href="/anvandarvillkor">Villkor</a></div></footer>
  </div>;
}
