import { useEffect } from 'react';
import { Button, LinkButton, TextField } from '@min-egenkontroll/design-system';
import { getPublicResource } from '../config/publicResources';
import { appUrls } from '../config/appUrls';
import { PublicSiteShell } from './PublicSiteShell';
import './Homepage.css';

const paths = [
  { label: 'Appen', title: 'Gör dagens kontroller', copy: 'För återkommande arbete, avvikelser och historik.', href: '/digital-egenkontroll-livsmedel' },
  { label: 'Kunskap', title: 'Förstå vad som krävs', copy: 'Guider och tydliga svar för din verksamhet.', href: '/kunskapsbank' },
  { label: 'Mallar och checklistor', title: 'Få ett underlag att använda', copy: 'Börja med kontrollplanen och anpassa den.', href: '/mall-kontrollplan-livsmedel' },
  { label: 'Verktyg', title: 'Börja med en faroanalys', copy: 'Bygg ett eget utkast med verksamhetens processteg och bedömningar.', href: '/verktyg-faroanalys-livsmedel' },
];

const resources = [
  { type: 'Ämnesnav', href: '/haccp-sma-livsmedelsforetag' },
  { type: 'Guide', href: '/faroanalys-livsmedel' },
  { type: 'Mall', href: '/mall-kontrollplan-livsmedel' },
  { type: 'Verktyg', href: '/verktyg-faroanalys-livsmedel' },
].map((card) => ({ ...getPublicResource(card.href)!, type: card.type }));

const businesses = [
  { title: 'Restaurang', copy: 'Kök, service och daglig drift.', href: '/egenkontroll-restaurang' },
  { title: 'Café och bageri', copy: 'Förvaring, hygien och produktion.', href: '/egenkontroll-cafe' },
  { title: 'Foodtruck', copy: 'Enkla rutiner för en rörlig vardag.', href: '/egenkontroll-kiosk-foodtruck' },
  { title: 'Butik', copy: 'Mottagning, märkning och spårbarhet.', href: '/seo/varumottagning-livsmedel.html' },
];

function setHomepageMeta() {
  const title = 'Min Egenkontroll | Praktisk hjälp och digital dokumentation';
  const description = 'Praktisk hjälp med egenkontroll för små livsmedelsverksamheter – kunskap, resurser och en app för att dokumentera vardagens kontroller.';
  document.title = title;
  for (const [selector, content] of [['meta[name="description"]', description], ['meta[name="robots"]', 'index, follow'], ['meta[property="og:title"]', title], ['meta[property="og:description"]', description], ['meta[property="og:url"]', 'https://minegenkontroll.se/']] as const) {
    const element = document.head.querySelector<HTMLMetaElement>(selector);
    if (element) element.content = content;
  }
  const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) canonical.href = 'https://minegenkontroll.se/';
}

function AppProof() {
  return <figure className="home-app-proof">
    <figcaption>Exempelvy · så kan dagens arbete se ut i appen</figcaption>
    <div className="home-app-top"><span>Min Egenkontroll</span><strong>Dagens arbete</strong></div>
    <div className="home-app-body">
      <div className="home-app-heading"><div><span>Onsdag</span><h2>Tre kontroller att göra</h2></div><b>1 väntar</b></div>
      <div className="home-app-row"><time>08:00</time><div><strong>Kylförvaring</strong><span>Mät och dokumentera temperatur</span></div><em className="is-clear">Klar</em></div>
      <div className="home-app-row"><time>10:30</time><div><strong>Varumottagning</strong><span>Följ upp registrerad avvikelse</span></div><em className="is-alert">Åtgärd krävs</em></div>
      <div className="home-app-row"><time>Efter lunch</time><div><strong>Rengöring</strong><span>Följ upp dagens rutin</span></div><em>Planerad</em></div>
      <p>Historik och ansvar sparas tillsammans med kontrollen.</p>
    </div>
  </figure>;
}

export function Homepage() {
  useEffect(() => { setHomepageMeta(); }, []);
  return <PublicSiteShell>
    <main id="main-content">
      <section className="home-hero"><div className="home-shell home-hero__grid"><div><p className="home-kicker">Egenkontroll för små livsmedelsverksamheter</p><h1>Få koll på det som ska göras. Varje dag.</h1><p className="home-lead">Min Egenkontroll hjälper restauranger, caféer, bagerier, butiker och foodtrucks att förstå, dokumentera och följa upp egenkontrollen.</p><div className="home-actions"><a className="ds-button ds-button--primary" href="#hjalp">Hitta rätt hjälp</a><a className="ds-button ds-button--secondary" href={appUrls.signup}>Kom igång med appen</a></div><p className="home-note">Kunskap när du behöver förstå. Appen när arbetet återkommer.</p></div><AppProof /></div></section>
      <section className="home-search" id="hjalp"><div className="home-shell"><div><p className="home-kicker">Hitta rätt utan omvägar</p><h2>Vad vill du ha hjälp med idag?</h2><p>Sök i vägledning, mallar och checklistor.</p></div><form className="home-search-form" action="/sok" method="get" role="search"><label htmlFor="homepage-search">Sök i Min Egenkontroll</label><div><TextField id="homepage-search" name="q" type="search" placeholder="Till exempel: kontrollplan för café" required /><Button type="submit">Sök</Button></div></form></div></section>
      <section className="home-paths" aria-labelledby="paths-title"><div className="home-shell"><p className="home-kicker">Vart vill du härnäst?</p><h2 id="paths-title">Välj den hjälp som passar ditt nästa steg.</h2><div>{paths.map((path) => <a href={path.href} key={path.title}><span>{path.label}</span><strong>{path.title}</strong><p>{path.copy}</p><b>Öppna →</b></a>)}</div></div></section>
      <section className="home-questions"><div className="home-shell"><p className="home-kicker">Frågor att börja med</p><div>{['Hur kommer jag igång med en kontrollplan?', 'Vilket underlag behöver jag för en faroanalys?', 'Hur följer jag upp en avvikelse?'].map((question, index) => <a href={index === 0 ? '/kontrollplan-livsmedel' : index === 1 ? '/faroanalys-livsmedel' : '/avvikelser-korrigerande-atgarder-livsmedel'} key={question}><small>Plats för verifierad sökfråga</small><strong>{question}</strong></a>)}</div></div></section>
      <section className="home-resources"><div className="home-shell"><div className="home-section-head"><div><p className="home-kicker">Utvalt för HACCP-piloten</p><h2>Rätt sorts hjälp, utan en hel katalog.</h2></div><LinkButton href="/kunskapsbank" variant="ghost">Till kunskapsbanken →</LinkButton></div><div className="home-resource-list">{resources.map((resource) => <a href={resource.href} key={`${resource.type}-${resource.title}`}><span>{resource.type}</span><strong>{resource.title}</strong><p>{resource.copy}</p></a>)}</div></div></section>
      <section className="home-business"><div className="home-shell"><div><p className="home-kicker">För din vardag</p><h2>Börja med verksamheten du faktiskt driver.</h2><p>Välj en ingång som leder till rätt rutin, resurs eller arbetsflöde.</p></div><nav aria-label="Verksamhetsvägar">{businesses.map((business) => <a href={business.href} key={business.title}><strong>{business.title}</strong><span>{business.copy}</span></a>)}</nav></div></section>
      <section className="home-how" id="how"><div className="home-shell"><div className="home-section-head"><div><p className="home-kicker">När arbetet återkommer</p><h2>Så stöttar appen vardagen.</h2></div><LinkButton href="/digital-egenkontroll-livsmedel" variant="secondary">Se hur appen fungerar</LinkButton></div><ol><li><b>01</b><h3>Planera</h3><p>Se vad som ska göras och när.</p></li><li><b>02</b><h3>Dokumentera</h3><p>Gör kontrollen där arbetet sker.</p></li><li><b>03</b><h3>Följ upp</h3><p>Hitta avvikelse, åtgärd och historik.</p></li></ol></div></section>
      <section className="home-trust"><div className="home-shell"><div><p className="home-kicker">Förtroende i praktiken</p><h2>Praktisk hjälp, tydliga källor och dokumentation som går att följa upp.</h2></div><p>Vi skiljer på regel, myndighetsvägledning och praktiskt exempel, så att det blir lättare att veta vad som gäller och vad du kan göra härnäst.</p><LinkButton href="/seo/kallor-och-faktagranskning.html" variant="ghost">Så arbetar vi med källor →</LinkButton></div></section>
      <section className="home-ending"><div className="home-shell"><div><p className="home-kicker">Nästa steg</p><h2>Börja där du behöver det mest.</h2></div><div className="home-actions"><a className="ds-button ds-button--primary" href={appUrls.signup}>Kom igång med appen</a><LinkButton href="/kunskapsbank" variant="secondary">Hitta rätt hjälp</LinkButton></div></div></section>
    </main>
  </PublicSiteShell>;
}
