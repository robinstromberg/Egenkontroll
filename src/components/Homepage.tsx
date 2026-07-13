import { useEffect, useRef, useState } from 'react';
import { Button, LinkButton } from './ui/Button';
import { TextField } from './ui/TextField';
import { brandAssets } from '../config/assets';
import { getPublicResource } from '../config/publicResources';
import './Homepage.css';

type HomepageProps = { onStartTrial: () => void; onLogin: () => void };
type Theme = 'light' | 'dark';
const homepageThemeKey = 'egenkontroll:homepage-theme';

function readHomepageTheme(): Theme {
  const saved = window.localStorage.getItem(homepageThemeKey);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const paths = [
  { label: 'Appen', title: 'Gör dagens kontroller', copy: 'För återkommande arbete, avvikelser och historik.', href: '/digital-egenkontroll-livsmedel' },
  { label: 'Kunskap', title: 'Förstå vad som krävs', copy: 'Guider och tydliga svar för din verksamhet.', href: '/kunskapsbank' },
  { label: 'Mallar och checklistor', title: 'Få ett underlag att använda', copy: 'Börja med kontrollplanen och anpassa den.', href: '/seo/kontrollplan.html' },
  { label: 'Verktyg', title: 'Börja med en faroanalys', copy: 'Läs guiden medan verktygskandidaten utvecklas.', href: '/faroanalys-livsmedel' },
];

const resources = [
  { type: 'Ämnesnav', href: '/haccp-sma-livsmedelsforetag' },
  { type: 'Guide', href: '/faroanalys-livsmedel' },
  { type: 'Resurskandidat', href: '/seo/kontrollplan.html' },
].map((card) => ({ ...getPublicResource(card.href)!, type: card.type }));

const upcomingResource = { type: 'På väg', title: 'Faroanalysverktyg', copy: 'Ett framtida verktyg med synliga antaganden och metod.', href: '/faroanalys-livsmedel' };

const businesses = [
  { title: 'Restaurang', copy: 'Kök, service och daglig drift.', href: '/egenkontroll-restaurang' },
  { title: 'Café och bageri', copy: 'Förvaring, hygien och produktion.', href: '/egenkontroll-cafe' },
  { title: 'Foodtruck', copy: 'Enkla rutiner för en rörlig vardag.', href: '/seo/varumottagning-livsmedel.html' },
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

export function Homepage({ onStartTrial, onLogin }: HomepageProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(readHomepageTheme);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuPanel = useRef<HTMLDivElement>(null);
  useEffect(() => { setHomepageMeta(); }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const panel = menuPanel.current; const first = panel?.querySelector<HTMLElement>('a, button');
    first?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); return; }
      if (event.key !== 'Tab' || !panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
      const firstFocusable = focusable[0]; const lastFocusable = focusable[focusable.length - 1];
      if (!firstFocusable || !lastFocusable) return;
      if (event.shiftKey && document.activeElement === firstFocusable) { event.preventDefault(); lastFocusable.focus(); }
      if (!event.shiftKey && document.activeElement === lastFocusable) { event.preventDefault(); firstFocusable.focus(); }
    }
    window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);
  const closeMenu = () => { setMenuOpen(false); menuButton.current?.focus(); };
  const toggleTheme = () => setTheme((current) => {
    const next = current === 'light' ? 'dark' : 'light';
    window.localStorage.setItem(homepageThemeKey, next);
    return next;
  });
  const themeLabel = theme === 'light' ? 'Aktivera mörkt läge' : 'Aktivera ljust läge';
  return <div className="home-page" data-theme={theme}>
    <a className="home-skip" href="#main-content">Hoppa till innehållet</a>
    <header className="home-header"><div className="home-shell home-header__inner">
      <a className="home-brand" href="/"><img src={brandAssets.icon} alt="" /><span>Min Egenkontroll</span></a>
      <nav className="home-nav" aria-label="Huvudnavigation"><a href="/kunskapsbank">Kunskap</a><a href="/seo/kontrollplan.html">Mallar och checklistor</a><a href="/faroanalys-livsmedel">Verktyg</a><a href="/seo/utbildning-livsmedelshygien-personal.html">Utbildning</a><a href="/seo/kallor-och-faktagranskning.html">Referenser och källor</a><a href="/digital-egenkontroll-livsmedel">Appen</a></nav>
      <div className="home-header__actions"><button className="home-theme-toggle" type="button" onClick={toggleTheme} aria-label={themeLabel} title={themeLabel}><span aria-hidden="true">{theme === 'light' ? '◐' : '◑'}</span><span className="home-theme-toggle__text">{theme === 'light' ? 'Mörkt' : 'Ljust'}</span></button><button className="home-login" type="button" onClick={onLogin}>Logga in</button><button className="ds-button ds-button--primary" type="button" onClick={onStartTrial}>Kom igång</button><button ref={menuButton} className="home-menu-button" type="button" aria-controls="home-menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>Meny</button></div>
    </div></header>
    {menuOpen ? <div className="home-menu-backdrop"><div className="home-menu" id="home-menu" ref={menuPanel} role="dialog" aria-modal="true" aria-label="Huvudmeny"><div><strong>Min Egenkontroll</strong><button type="button" onClick={closeMenu}>Stäng</button></div><nav><a onClick={closeMenu} href="/kunskapsbank">Kunskap</a><a onClick={closeMenu} href="/seo/kontrollplan.html">Mallar och checklistor</a><a onClick={closeMenu} href="/faroanalys-livsmedel">Verktyg</a><a onClick={closeMenu} href="/seo/utbildning-livsmedelshygien-personal.html">Utbildning</a><a onClick={closeMenu} href="/seo/kallor-och-faktagranskning.html">Referenser och källor</a><a onClick={closeMenu} href="/digital-egenkontroll-livsmedel">Appen</a><button className="home-theme-toggle" type="button" onClick={toggleTheme} aria-label={themeLabel}><span aria-hidden="true">{theme === 'light' ? '◐' : '◑'}</span> {themeLabel}</button><button type="button" onClick={onLogin}>Logga in</button><button className="ds-button ds-button--primary" type="button" onClick={onStartTrial}>Kom igång</button></nav></div></div> : null}
    <main id="main-content">
      <section className="home-hero"><div className="home-shell home-hero__grid"><div><p className="home-kicker">Egenkontroll för små livsmedelsverksamheter</p><h1>Få koll på det som ska göras. Varje dag.</h1><p className="home-lead">Min Egenkontroll hjälper restauranger, caféer, bagerier, butiker och foodtrucks att förstå, dokumentera och följa upp egenkontrollen.</p><div className="home-actions"><a className="ds-button ds-button--primary" href="#hjalp">Hitta rätt hjälp</a><button className="ds-button ds-button--secondary" type="button" onClick={onStartTrial}>Kom igång med appen</button></div><p className="home-note">Kunskap när du behöver förstå. Appen när arbetet återkommer.</p></div><AppProof /></div></section>
      <section className="home-search" id="hjalp"><div className="home-shell"><div><p className="home-kicker">Hitta rätt utan omvägar</p><h2>Vad vill du ha hjälp med idag?</h2><p>Sök i vägledning, mallar och checklistor.</p></div><form className="home-search-form" action="/sok" method="get" role="search"><label htmlFor="homepage-search">Sök i Min Egenkontroll</label><div><TextField id="homepage-search" name="q" type="search" placeholder="Till exempel: kontrollplan för café" required /><Button type="submit">Sök</Button></div></form></div></section>
      <section className="home-paths" aria-labelledby="paths-title"><div className="home-shell"><p className="home-kicker">Vart vill du härnäst?</p><h2 id="paths-title">Välj den hjälp som passar ditt nästa steg.</h2><div>{paths.map((path) => <a href={path.href} key={path.title}><span>{path.label}</span><strong>{path.title}</strong><p>{path.copy}</p><b>Öppna →</b></a>)}</div></div></section>
      <section className="home-questions"><div className="home-shell"><p className="home-kicker">Frågor att börja med</p><div>{['Hur kommer jag igång med en kontrollplan?', 'Vilket underlag behöver jag för en faroanalys?', 'Hur följer jag upp en avvikelse?'].map((question, index) => <a href={index === 0 ? '/seo/kontrollplan.html' : index === 1 ? '/faroanalys-livsmedel' : '/avvikelser-korrigerande-atgarder-livsmedel'} key={question}><small>Plats för verifierad sökfråga</small><strong>{question}</strong></a>)}</div></div></section>
      <section className="home-resources"><div className="home-shell"><div className="home-section-head"><div><p className="home-kicker">Utvalt för HACCP-piloten</p><h2>Rätt sorts hjälp, utan en hel katalog.</h2></div><LinkButton href="/kunskapsbank" variant="ghost">Till kunskapsbanken →</LinkButton></div><div className="home-resource-list">{[...resources, upcomingResource].map((resource) => <a href={resource.href} key={`${resource.type}-${resource.title}`}><span>{resource.type}</span><strong>{resource.title}</strong><p>{resource.copy}</p></a>)}</div></div></section>
      <section className="home-business"><div className="home-shell"><div><p className="home-kicker">För din vardag</p><h2>Börja med verksamheten du faktiskt driver.</h2><p>Välj en ingång som leder till rätt rutin, resurs eller arbetsflöde.</p></div><nav aria-label="Verksamhetsvägar">{businesses.map((business) => <a href={business.href} key={business.title}><strong>{business.title}</strong><span>{business.copy}</span></a>)}</nav></div></section>
      <section className="home-how"><div className="home-shell"><div className="home-section-head"><div><p className="home-kicker">När arbetet återkommer</p><h2>Så stöttar appen vardagen.</h2></div><LinkButton href="/digital-egenkontroll-livsmedel" variant="secondary">Se hur appen fungerar</LinkButton></div><ol><li><b>01</b><h3>Planera</h3><p>Se vad som ska göras och när.</p></li><li><b>02</b><h3>Dokumentera</h3><p>Gör kontrollen där arbetet sker.</p></li><li><b>03</b><h3>Följ upp</h3><p>Hitta avvikelse, åtgärd och historik.</p></li></ol></div></section>
      <section className="home-trust"><div className="home-shell"><div><p className="home-kicker">Förtroende i praktiken</p><h2>Praktisk hjälp, tydliga källor och dokumentation som går att följa upp.</h2></div><p>Vi skiljer på regel, myndighetsvägledning och praktiskt exempel, så att det blir lättare att veta vad som gäller och vad du kan göra härnäst.</p><LinkButton href="/seo/kallor-och-faktagranskning.html" variant="ghost">Så arbetar vi med källor →</LinkButton></div></section>
      <section className="home-ending"><div className="home-shell"><div><p className="home-kicker">Nästa steg</p><h2>Börja där du behöver det mest.</h2></div><div className="home-actions"><button className="ds-button ds-button--primary" type="button" onClick={onStartTrial}>Kom igång med appen</button><LinkButton href="/kunskapsbank" variant="secondary">Hitta rätt hjälp</LinkButton></div></div></section>
    </main>
    <footer className="home-footer"><div className="home-shell"><span>© 2026 Min Egenkontroll</span><nav><a href="/kunskapsbank">Kunskap</a><a href="/seo/kontrollplan.html">Mallar</a><a href="/faroanalys-livsmedel">Verktyg</a><a href="/digital-egenkontroll-livsmedel">Appen</a><a href="/integritetspolicy">Integritet</a><a href="/anvandarvillkor">Villkor</a></nav></div></footer>
  </div>;
}
