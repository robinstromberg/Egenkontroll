export type PublicResource = {
  title: string;
  copy: string;
  href: string;
  group: string;
  resourceType: 'Guide' | 'Faktasida' | 'Mall' | 'Verktyg';
};

export type PublicResourceGroup = {
  eyebrow: string;
  title: string;
  intro: string;
  resources: readonly PublicResource[];
};

type ResourceDefinition = Omit<PublicResource, 'group' | 'resourceType'> & Pick<Partial<PublicResource>, 'resourceType'>;

function group(eyebrow: string, title: string, intro: string, resources: readonly ResourceDefinition[]): PublicResourceGroup {
  return {
    eyebrow,
    title,
    intro,
    resources: resources.map((resource) => ({ ...resource, group: eyebrow, resourceType: resource.resourceType ?? 'Guide' })),
  };
}

export const publicResourceGroups: readonly PublicResourceGroup[] = [
  group('Egenkontroll i vardagen', 'Kom igång och få ordning på dokumentationen', 'Guider för mindre livsmedelsverksamheter som vill förstå vad som behöver göras och hålla arbetet enkelt.', [
    { title: 'Digital egenkontroll för livsmedel', copy: 'Samla kontroller, avvikelser och historik digitalt.', href: '/digital-egenkontroll-livsmedel' },
    { title: 'Egenkontroll för restaurang', copy: 'Planera restaurangens temperaturkontroller, rengöring, allergenrutiner, varumottagning och dokumentation.', href: '/egenkontroll-restaurang', resourceType: 'Guide' },
    { title: 'Egenkontroll för café och bageri', copy: 'Planera temperaturkontroller, rengöring, allergenrutiner, råvarumottagning, märkning och dokumentation.', href: '/egenkontroll-cafe', resourceType: 'Guide' },
    { title: 'Egenkontroll för kiosk och foodtruck', copy: 'Planera transport, temperatur, vatten, rengöring, allergenrutiner och dokumentation för verksamhet på begränsad yta.', href: '/egenkontroll-kiosk-foodtruck', resourceType: 'Guide' },
    { title: 'Egenkontroll för catering', copy: 'Planera varumottagning, förberedelse, förvaring, transport, servering, allergenrutiner och dokumentation.', href: '/egenkontroll-catering', resourceType: 'Guide' },
    { title: 'Dokumentation och journalföring', copy: 'Vad som kan behöva dokumenteras och hur omfattningen kan anpassas.', href: '/dokumentation-egenkontroll-livsmedel', resourceType: 'Faktasida' },
    { title: 'Källor och faktagranskning', copy: 'Så skiljer vi på regler, myndighetsvägledning och våra praktiska förklaringar.', href: '/seo/kallor-och-faktagranskning.html' },
  ]),
  group('Hygien och daglig drift', 'Rutiner som behöver fungera varje dag', 'Personal, rengöring, skadedjur och allergeninformation.', [
    { title: 'Hygien och daglig drift', copy: 'Samlingssida för de dagliga hygienrutinerna.', href: '/seo/hygien-och-daglig-drift.html' },
    { title: 'Personlig hygien', copy: 'Handtvätt, arbetskläder, handskar och smitta.', href: '/seo/personlig-hygien-livsmedel.html' },
    { title: 'Rengöring', copy: 'Vad som ska rengöras, hur ofta och hur resultatet följs upp.', href: '/seo/rengoring-livsmedelsverksamhet.html' },
    { title: 'Skadedjur', copy: 'Förebygg problem, upptäck spår och agera vid fynd.', href: '/seo/skadedjur-livsmedelsverksamhet.html' },
    { title: 'Allergeninformation', copy: 'Information om allergener och fungerande rutiner för personalen.', href: '/seo/allergeninformation-restaurang.html' },
  ]),
  group('Hantering och förvaring', 'Skydda livsmedel från mottagning till servering', 'Guider om varumottagning, separering, korskontamination, kemikalier och allergenöverföring.', [
    { title: 'Hantering och förvaring', copy: 'Samlingssida för mottagning, förvaring och separering.', href: '/seo/hantering-och-forvaring-livsmedel.html' },
    { title: 'Varumottagning', copy: 'Rätt vara, temperatur, emballage, skadedjursspår och ersättningsvaror.', href: '/seo/varumottagning-livsmedel.html' },
    { title: 'Korskontamination', copy: 'Mikroorganismer, allergener, kemikalier och smuts mellan livsmedel.', href: '/seo/korskontamination-livsmedel.html' },
    { title: 'Separera rått och ätfärdigt', copy: 'Praktiska lösningar även i små kylskåp och mindre kök.', href: '/seo/separera-raa-och-atfardiga-livsmedel.html' },
    { title: 'Kemikalier i livsmedelsverksamhet', copy: 'Förvara och hantera rengöringsmedel åtskilt från mat.', href: '/seo/kemikalier-i-livsmedelsverksamhet.html' },
    { title: 'Allergenkontamination', copy: 'Rengöring, separerad förvaring och intern märkning.', href: '/seo/allergenkontamination-livsmedel.html' },
  ]),
  group('Grundförutsättningar', 'Lokaler, avfall, transport, kunskap och vatten', 'Guider för det praktiska grundarbete som behöver fungera runt den dagliga livsmedelshanteringen.', [
    { title: 'Grundförutsättningar', copy: 'Samlingssida för lokaler, avfall, transport, personalens kunskap och vatten.', href: '/seo/grundforutsattningar-livsmedel.html' },
    { title: 'Lokaler och utrustning', copy: 'Hygienisk utformning, material, underhåll, handfat och ventilation.', href: '/seo/lokaler-och-utrustning-livsmedel.html' },
    { title: 'Materialval i livsmedelslokal', copy: 'Rengörbarhet, hållbarhet och anpassning till användningen.', href: '/seo/materialval-livsmedelslokal.html' },
    { title: 'Underhåll av livsmedelslokal', copy: 'Upptäck slitage och hantera det innan det blir en hygienrisk.', href: '/seo/underhall-livsmedelslokal.html' },
    { title: 'Toaletter och handfat', copy: 'Placering, delning och möjlighet till hygienisk handtvätt.', href: '/seo/toalett-och-handfat-livsmedelsverksamhet.html' },
    { title: 'Ventilation', copy: 'Kondens, os, luftflöden, filter och rena respektive orena utrymmen.', href: '/seo/ventilation-livsmedelsverksamhet.html' },
    { title: 'Avfall', copy: 'Sopkärl, avlägsnande, returmaterial och kasserade varor.', href: '/seo/avfall-livsmedelsverksamhet.html' },
    { title: 'Soprum och avfallsutrymme', copy: 'Rengörbarhet, skadedjur och skillnaden mellan torrt och vått avfall.', href: '/seo/soprum-och-avfallsutrymme-livsmedel.html' },
    { title: 'Transport av livsmedel', copy: 'Skydd mot kontaminering och rätt temperatur under transport.', href: '/seo/transport-av-livsmedel.html' },
    { title: 'Utbildning i livsmedelshygien', copy: 'Rätt kunskap för rätt arbetsuppgift utan onödiga formkrav.', href: '/seo/utbildning-livsmedelshygien-personal.html' },
    { title: 'Vatten i livsmedelsverksamhet', copy: 'När dricksvatten krävs och vad användningen betyder för kraven.', href: '/seo/vatten-i-livsmedelsverksamhet.html' },
    { title: 'Is i livsmedelsverksamhet', copy: 'Vattenkvalitet, rengöring av ismaskin och hygienisk hantering.', href: '/seo/is-i-livsmedelsverksamhet.html' },
  ]),
  group('Temperatur', 'Från kylförvaring till återuppvärmning', 'Guider för temperaturmoment som behöver olika kontrollpunkter och åtgärder.', [
    { title: 'Temperaturprocesser', copy: 'Samlingssida för kylförvaring, upptining, varmhållning, nedkylning och återuppvärmning.', href: '/seo/temperaturprocesser-livsmedel.html' },
    { title: 'Temperaturkontroll', copy: 'Översikt över mätning, termometrar och vanliga kontrollområden.', href: '/seo/temperaturkontroll-livsmedel.html' },
    { title: 'Kylförvaring', copy: 'Kylkedja, mottagna kylvaror och avvikelser.', href: '/seo/kylforvaring-livsmedel.html' },
    { title: 'Upptining', copy: 'Metod, tid, temperatur och hantering av smältvatten.', href: '/seo/upptining-livsmedel.html' },
    { title: 'Nedkylning', copy: 'Tid, temperatur, kärntemperatur och riktvärden.', href: '/seo/nedkylning-mat-livsmedel.html' },
    { title: 'Varmhållning', copy: 'Temperatur, mätning och riskbedömning.', href: '/seo/varmhallning-mat-temperatur.html' },
    { title: 'Återuppvärmning', copy: 'Snabb uppvärmning och kopplingen till nedkylning och kylförvaring.', href: '/seo/ateruppvarmning-mat.html' },
  ]),
  group('Datummärkning och hållbarhet', 'Förstå datumen och vad som händer när de passerar', 'Guider om bäst före, sista förbrukningsdag, hållbarhetsbedömning och infrysning nära utgångsdatum.', [
    { title: 'Datummärkning av livsmedel', copy: 'Samlingssida för bäst före, sista förbrukningsdag och hållbarhet.', href: '/seo/datummarkning-livsmedel.html' },
    { title: 'Bäst före eller sista förbrukningsdag?', copy: 'Skillnaden mellan kvalitet, säkerhet och ansvar.', href: '/seo/bast-fore-eller-sista-forbrukningsdag.html' },
    { title: 'Sälja mat efter bäst före', copy: 'När det är möjligt och vilket ansvar företaget har.', href: '/seo/salja-mat-efter-bast-fore.html' },
    { title: 'Efter sista förbrukningsdag', copy: 'Vad som gäller för försäljning, donation och användning som ingrediens.', href: '/seo/mat-efter-sista-forbrukningsdag.html' },
    { title: 'Bestämma hållbarhetsdatum', copy: 'Produkt, förpackning, förvaring och möjliga underlag.', href: '/seo/bestamma-hallbarhetsdatum-livsmedel.html' },
    { title: 'Frysa in kylvaror nära utgångsdatum', copy: 'Märkning, förvaring och spårbarhet när varor fryses in.', href: '/seo/frysa-in-kylvaror-fore-utgangsdatum.html' },
  ]),
  group('Information och märkning', 'Rätt information till kunden – från meny till etikett', 'Guider om ansvar, etiketter, oförpackad mat och vilken information som behöver finnas vid beställning.', [
    { title: 'Information och märkning', copy: 'Samlingssida för etiketter, menyer, oförpackad mat och distansförsäljning.', href: '/seo/information-och-markning-livsmedel.html' },
    { title: 'Ansvar för livsmedelsinformationen', copy: 'Vem ansvarar för att uppgifterna finns, är korrekta och följer med?', href: '/seo/ansvar-livsmedelsinformation.html' },
    { title: 'Informationen får inte vilseleda', copy: 'Namn, bilder, presentation och reklam behöver ge en rättvisande helhetsbild.', href: '/seo/vilseledande-livsmedelsinformation.html' },
    { title: 'Färdigförpackade livsmedel', copy: 'När en vara räknas som färdigförpackad och varför det påverkar märkningen.', href: '/seo/fardigforpackade-livsmedel-markning.html' },
    { title: 'Obligatorisk märkning', copy: 'Översikt över uppgifter som kan behöva finnas på färdigförpackade livsmedel.', href: '/seo/obligatorisk-markning-livsmedel.html' },
    { title: 'Ingrediensförteckning', copy: 'Fallande viktordning, rubrik, beteckningar och särskilda ingredienstyper.', href: '/seo/ingrediensforteckning-livsmedel.html' },
    { title: 'Livsmedlets beteckning', copy: 'Föreskriven, vedertagen eller beskrivande beteckning.', href: '/seo/livsmedlets-beteckning.html' },
    { title: 'Förvaringsanvisning', copy: 'När temperatur, förvaring och hållbarhet efter öppning behöver anges.', href: '/seo/forvaringsanvisning-livsmedel.html' },
    { title: 'Märka om färdigförpackade livsmedel', copy: 'Ansvar, korrekta uppgifter och bibehållen spårbarhet vid ommärkning.', href: '/seo/marka-om-fardigforpackade-livsmedel.html' },
    { title: 'Oförpackade livsmedel', copy: 'Mat över disk, serverad mat och mat som förpackas på kundens begäran.', href: '/seo/oforpackade-livsmedel-information.html' },
    { title: 'Obligatorisk information om oförpackad mat', copy: 'Allergener och övriga uppgifter som kunden ska kunna få.', href: '/seo/obligatorisk-information-oforpackad-mat.html' },
    { title: 'Distansförsäljning och hemleverans', copy: 'Information före köp och vid leverans när mat beställs på distans.', href: '/seo/distansforsaljning-oforpackad-mat.html' },
  ]),
  group('HACCP och riskstyrning', 'Förstå faror, gränser och uppföljning', 'Centrala delar av HACCP för mindre livsmedelsföretag.', [
    { title: 'HACCP för små livsmedelsföretag', copy: 'Flexibilitet, risker och dokumentation.', href: '/haccp-sma-livsmedelsforetag' },
    { title: 'Faroanalys', copy: 'Identifiera relevanta faror i den faktiska verksamheten.', href: '/faroanalys-livsmedel' },
    { title: 'Kritiska gränsvärden', copy: 'Tydliga gränser mellan acceptabelt och oacceptabelt.', href: '/kritiska-gransvarden-livsmedel' },
    { title: 'Avvikelser och korrigerande åtgärder', copy: 'Vad som behöver hända när en kontroll avviker.', href: '/avvikelser-korrigerande-atgarder-livsmedel' },
    { title: 'Verifiering', copy: 'Kontrollera att rutiner och åtgärder faktiskt fungerar.', href: '/verifiering-haccp-livsmedel' },
    { title: 'Kontrollplan', copy: 'Planera kontrollpunkter, ansvar och uppföljning.', href: '/kontrollplan-livsmedel' },
    { title: 'Mall för kontrollplan', copy: 'Fyll i processteg, kontroller, ansvar, uppföljning och avvikelsehantering digitalt eller på papper.', href: '/mall-kontrollplan-livsmedel', resourceType: 'Mall' },
    { title: 'Verktyg för faroanalys', copy: 'Bygg ett eget arbetsutkast med processteg, möjliga faror, kontrollåtgärder och egna bedömningar.', href: '/verktyg-faroanalys-livsmedel', resourceType: 'Verktyg' },
  ]),
  group('Spårbarhet', 'Hitta rätt uppgifter när ett livsmedel måste följas', 'Leverantörer, mottagare, interna flöden, partier, återkallanden och lagringstid.', [
    { title: 'Spårbarhet för livsmedelsföretag', copy: 'Ett steg bakåt, ett steg framåt och användbara underlag.', href: '/sparbarhet-livsmedel' },
    { title: 'Intern spårbarhet', copy: 'Koppla råvaror och tillverkningsomgångar till rätt produkter när det behövs.', href: '/seo/intern-sparbarhet-livsmedel.html' },
    { title: 'Partimärkning', copy: 'Identifiera vilka livsmedel som hör till samma parti.', href: '/seo/partimarkning-livsmedel.html' },
    { title: 'Återkalla livsmedel', copy: 'Använd spårbarheten för att hitta berörda varor, leveranser och mottagare.', href: '/seo/aterkalla-livsmedel-sparbarhet.html' },
    { title: 'Mängdbalans och kvantitativ spårbarhet', copy: 'Jämför inköp, lager, svinn och försäljning för att verifiera varuflöden.', href: '/seo/mangdbalans-sparbarhet-livsmedel.html' },
    { title: 'Hur länge ska spårbarhetsuppgifter sparas?', copy: 'Lagringstid, hållbarhet och produktens verkliga livslängd.', href: '/spara-sparbarhetsuppgifter-livsmedel' },
  ]),
];

export const publicResources = publicResourceGroups.flatMap((resourceGroup) => resourceGroup.resources);

export function getPublicResource(href: string): PublicResource | undefined {
  return publicResources.find((resource) => resource.href === href);
}

const stopWords = new Set(['att', 'av', 'de', 'den', 'det', 'en', 'ett', 'for', 'fran', 'hur', 'i', 'med', 'och', 'om', 'pa', 'som', 'ska', 'till', 'vad']);

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('sv-SE');
}

function getSearchTerms(query: string) {
  return normalize(query).split(/[^\p{L}\p{N}]+/u).filter((term) => term.length > 1 && !stopWords.has(term));
}

function stem(term: string) {
  return term.replace(/(erna|arna|ande|heten|heter|ens|ers|er|en|ar|or|et|s)$/u, '');
}

function matchesTerm(value: string, term: string) {
  const normalized = normalize(value);
  const root = stem(term);
  return normalized.includes(term) || (root.length >= 5 && normalized.includes(root));
}

export function searchPublicResources(query: string) {
  const terms = getSearchTerms(query);
  if (!terms.length) return [];

  return publicResources
    .map((resource, index) => {
      let matchedTerms = 0;
      let score = 0;
      for (const term of terms) {
        const titleMatch = matchesTerm(resource.title, term);
        const descriptionMatch = matchesTerm(resource.copy, term);
        const groupMatch = matchesTerm(resource.group, term);
        const typeMatch = matchesTerm(resource.resourceType, term);
        if (!titleMatch && !descriptionMatch && !groupMatch && !typeMatch) continue;
        matchedTerms += 1;
        if (titleMatch) score += 12;
        if (normalize(resource.title).startsWith(term)) score += 4;
        if (descriptionMatch) score += 4;
        if (groupMatch) score += 2;
        if (typeMatch) score += 2;
      }
      return { resource, index, matchedTerms, score };
    })
    .filter((match) => match.score > 0)
    .sort((first, second) => second.matchedTerms - first.matchedTerms || second.score - first.score || first.index - second.index)
    .map(({ resource }) => resource);
}
