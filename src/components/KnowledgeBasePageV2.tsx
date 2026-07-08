import { useEffect } from 'react';
import { brandAssets } from '../config/assets';
import './PublicLandingPage.css';

type Guide = { title: string; copy: string; href: string };
type Group = { eyebrow: string; title: string; intro: string; guides: Guide[] };

const groups: Group[] = [
  { eyebrow: 'Egenkontroll i vardagen', title: 'Kom igång och få ordning på dokumentationen', intro: 'Guider för mindre livsmedelsverksamheter som vill förstå vad som behöver göras och hålla arbetet enkelt.', guides: [
    { title: 'Digital egenkontroll för livsmedel', copy: 'Samla kontroller, avvikelser och historik digitalt.', href: '/digital-egenkontroll-livsmedel' },
    { title: 'Egenkontroll för restaurang', copy: 'Temperaturer, städning, varumottagning och dagliga kontroller.', href: '/egenkontroll-restaurang' },
    { title: 'Egenkontroll för café och bageri', copy: 'Återkommande kontroller utan onödig administration.', href: '/egenkontroll-cafe' },
    { title: 'Dokumentation och journalföring', copy: 'Vad som kan behöva dokumenteras och hur omfattningen kan anpassas.', href: '/dokumentation-egenkontroll-livsmedel' },
  ] },
  { eyebrow: 'Hygien och daglig drift', title: 'Rutiner som behöver fungera varje dag', intro: 'Personal, rengöring, skadedjur och allergeninformation.', guides: [
    { title: 'Hygien och daglig drift', copy: 'Samlingssida för de dagliga hygienrutinerna.', href: '/seo/hygien-och-daglig-drift.html' },
    { title: 'Personlig hygien', copy: 'Handtvätt, arbetskläder, handskar och smitta.', href: '/seo/personlig-hygien-livsmedel.html' },
    { title: 'Rengöring', copy: 'Vad som ska rengöras, hur ofta och hur resultatet följs upp.', href: '/seo/rengoring-livsmedelsverksamhet.html' },
    { title: 'Skadedjur', copy: 'Förebygg problem, upptäck spår och agera vid fynd.', href: '/seo/skadedjur-livsmedelsverksamhet.html' },
    { title: 'Allergeninformation', copy: 'Information om allergener och fungerande rutiner för personalen.', href: '/seo/allergeninformation-restaurang.html' },
  ] },
  { eyebrow: 'Temperatur', title: 'Från kylförvaring till återuppvärmning', intro: 'Guider för temperaturmoment som behöver olika kontrollpunkter och åtgärder.', guides: [
    { title: 'Temperaturprocesser', copy: 'Samlingssida för kylförvaring, upptining, varmhållning, nedkylning och återuppvärmning.', href: '/seo/temperaturprocesser-livsmedel.html' },
    { title: 'Temperaturkontroll', copy: 'Översikt över mätning, termometrar och vanliga kontrollområden.', href: '/seo/temperaturkontroll-livsmedel.html' },
    { title: 'Kylförvaring', copy: 'Kylkedja, mottagna kylvaror och avvikelser.', href: '/seo/kylforvaring-livsmedel.html' },
    { title: 'Upptining', copy: 'Metod, tid, temperatur och hantering av smältvatten.', href: '/seo/upptining-livsmedel.html' },
    { title: 'Nedkylning', copy: 'Tid, temperatur, kärntemperatur och riktvärden.', href: '/seo/nedkylning-mat-livsmedel.html' },
    { title: 'Varmhållning', copy: 'Temperatur, mätning och riskbedömning.', href: '/seo/varmhallning-mat-temperatur.html' },
    { title: 'Återuppvärmning', copy: 'Snabb uppvärmning och kopplingen till nedkylning och kylförvaring.', href: '/seo/ateruppvarmning-mat.html' },
  ] },
  { eyebrow: 'Datummärkning och hållbarhet', title: 'Förstå datumen och vad som händer när de passerar', intro: 'Guider om bäst före, sista förbrukningsdag, hållbarhetsbedömning och infrysning nära utgångsdatum.', guides: [
    { title: 'Datummärkning av livsmedel', copy: 'Samlingssida för bäst före, sista förbrukningsdag och hållbarhet.', href: '/seo/datummarkning-livsmedel.html' },
    { title: 'Bäst före eller sista förbrukningsdag?', copy: 'Skillnaden mellan kvalitet, säkerhet och ansvar.', href: '/seo/bast-fore-eller-sista-forbrukningsdag.html' },
    { title: 'Sälja mat efter bäst före', copy: 'När det är möjligt och vilket ansvar företaget har.', href: '/seo/salja-mat-efter-bast-fore.html' },
    { title: 'Efter sista förbrukningsdag', copy: 'Vad som gäller för försäljning, donation och användning som ingrediens.', href: '/seo/mat-efter-sista-forbrukningsdag.html' },
    { title: 'Bestämma hållbarhetsdatum', copy: 'Produkt, förpackning, förvaring och möjliga underlag.', href: '/seo/bestamma-hallbarhetsdatum-livsmedel.html' },
    { title: 'Frysa in kylvaror nära utgångsdatum', copy: 'Märkning, förvaring och spårbarhet när varor fryses in.', href: '/seo/frysa-in-kylvaror-fore-utgangsdatum.html' },
  ] },
  { eyebrow: 'HACCP och riskstyrning', title: 'Förstå faror, gränser och uppföljning', intro: 'Centrala delar av HACCP för mindre livsmedelsföretag.', guides: [
    { title: 'HACCP för små livsmedelsföretag', copy: 'Flexibilitet, risker och dokumentation.', href: '/haccp-sma-livsmedelsforetag' },
    { title: 'Faroanalys', copy: 'Identifiera relevanta faror i den faktiska verksamheten.', href: '/faroanalys-livsmedel' },
    { title: 'Kritiska gränsvärden', copy: 'Tydliga gränser mellan acceptabelt och oacceptabelt.', href: '/seo/kritiska-gransvarden.html' },
    { title: 'Avvikelser och korrigerande åtgärder', copy: 'Vad som behöver hända när en kontroll avviker.', href: '/avvikelser-korrigerande-atgarder-livsmedel' },
    { title: 'Verifiering', copy: 'Kontrollera att rutiner och åtgärder faktiskt fungerar.', href: '/verifiering-egenkontroll-livsmedel' },
    { title: 'Kontrollplan', copy: 'Planera kontrollpunkter, ansvar och uppföljning.', href: '/seo/kontrollplan.html' },
  ] },
  { eyebrow: 'Spårbarhet', title: 'Hitta rätt uppgifter när ett livsmedel måste följas', intro: 'Leverantörer, mottagare och hur länge uppgifter kan behöva sparas.', guides: [
    { title: 'Spårbarhet för livsmedelsföretag', copy: 'Ett steg bakåt, ett steg framåt och användbara underlag.', href: '/sparbarhet-livsmedel' },
    { title: 'Hur länge ska spårbarhetsuppgifter sparas?', copy: 'Lagringstid, hållbarhet och produktens verkliga livslängd.', href: '/spara-sparbarhetsuppgifter-livsmedel' },
  ] },
];

export function KnowledgeBasePage() {
  useEffect(() => {
    document.title = 'Kunskapsbank om egenkontroll och livsmedelssäkerhet | Min Egenkontroll';
    const description = 'Guider om digital egenkontroll, hygien, temperatur, datummärkning, hållbarhet, HACCP, allergener och spårbarhet för livsmedelsföretag.';
    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = description;
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = 'https://minegenkontroll.se/kunskapsbank';
  }, []);

  return <main className="public-site">
    <nav className="public-nav" aria-label="Publik navigation"><a className="public-brand" href="/"><img src={brandAssets.logo} alt="Min Egenkontroll" /></a><div className="public-nav-actions"><a href="/">Startsida</a><a href="/signup">Gå med</a></div></nav>
    <section className="public-hero"><div className="public-hero-copy"><p className="public-eyebrow">Kunskapsbank</p><h1>Egenkontroll och livsmedelssäkerhet – enkelt förklarat</h1><p className="public-copy">Praktiska guider för mindre livsmedelsföretag. Fakta bygger på myndigheters vägledning och förklaras med fokus på vardagen.</p><div className="public-hero-actions"><a className="public-primary" href="/digital-egenkontroll-livsmedel">Börja med digital egenkontroll</a><a className="public-secondary" href="/">Se Min Egenkontroll</a></div></div></section>
    {groups.map((group, index) => <section className={index % 2 === 0 ? 'public-band' : 'public-grid-section'} key={group.title}><div className="public-section-heading"><p className="public-eyebrow">{group.eyebrow}</p><h2>{group.title}</h2><p className="public-copy">{group.intro}</p></div><div className="faq-list">{group.guides.map(guide => <a className="public-card" href={guide.href} key={guide.href}><h3>{guide.title}</h3><p>{guide.copy}</p></a>)}</div></section>)}
    <section className="public-cta"><p className="public-eyebrow">Från kunskap till vardag</p><h2>Samla kontroller, avvikelser och historik på ett ställe.</h2><a className="public-primary" href="/signup">Gå med i förhandslanseringen</a></section>
    <footer className="public-footer"><span>© 2026 Min Egenkontroll</span><div className="public-footer-links"><a href="/integritetspolicy">Integritetspolicy</a><a href="/anvandarvillkor">Användarvillkor</a></div></footer>
  </main>;
}
