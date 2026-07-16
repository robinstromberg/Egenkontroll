export type BusinessPageContent = {
  title: string;
  description: string;
  canonicalPath: string;
  breadcrumb: readonly { label: string; href?: string }[];
  eyebrow: string;
  heading: string;
  shortAnswer: string;
  controlAreas: {
    eyebrow: string;
    title: string;
    introduction: string;
    items: readonly { title: string; copy: string; href: string; linkLabel: string }[];
  };
  workflow: {
    eyebrow: string;
    title: string;
    introduction: string;
    steps: readonly { title: string; copy: string; href?: string; linkLabel?: string }[];
  };
  practicalResources: { eyebrow: string; title: string; introduction: string; hrefs: readonly string[] };
  mistakes: { eyebrow: string; title: string; items: readonly { title: string; copy: string }[] };
  faq: { title: string; items: readonly { question: string; answer: string }[] };
  sources: {
    title: string;
    type: string;
    factCheckedAt: string;
    links: readonly { label: string; url: string }[];
    limitation: string;
  };
  appBridge: { eyebrow: string; title: string; copy: string; href: string; linkLabel: string };
};

export const restaurantBusinessPage: BusinessPageContent = {
  title: 'Egenkontroll för restaurang – planera rätt kontroller | Min Egenkontroll',
  description: 'Få överblick över restaurangens egenkontroll: temperatur, rengöring, allergener, varumottagning, spårbarhet, avvikelser, dokumentation och HACCP.',
  canonicalPath: '/egenkontroll-restaurang',
  breadcrumb: [
    { label: 'Kunskap', href: '/kunskapsbank' },
    { label: 'Egenkontroll för restaurang' },
  ],
  eyebrow: 'För restauranger',
  heading: 'Egenkontroll för restaurang – börja med det som händer i er vardag',
  shortAnswer: 'Restaurangens egenkontroll ska hjälpa er att planera, genomföra, dokumentera och följa upp de kontroller som är relevanta för den egna hanteringen. Utgå från råvarorna, processerna, lokalerna och gästerna i just er verksamhet – inte från en generell lista som används utan anpassning.',
  controlAreas: {
    eyebrow: 'Vanliga kontrollområden',
    title: 'Skapa överblick över hela restaurangens flöde',
    introduction: 'Områdena nedan är vanliga utgångspunkter. Vilka kontroller som behövs, hur de utförs och hur ofta de följs upp beror på verksamhetens faktiska risker och arbetssätt.',
    items: [
      { title: 'Temperatur och tidsstyrda processer', copy: 'Kartlägg kylförvaring, upptining, tillagning, varmhållning, nedkylning och återuppvärmning som faktiskt förekommer i köket.', href: '/seo/temperaturkontroll-livsmedel.html', linkLabel: 'Läs om temperaturkontroll' },
      { title: 'Rengöring och personlig hygien', copy: 'Gör det tydligt vad som ska rengöras, hur resultatet följs upp och vilka hygienrutiner personalen behöver kunna i sitt arbete.', href: '/seo/rengoring-livsmedelsverksamhet.html', linkLabel: 'Läs om rengöring' },
      { title: 'Allergener och information till gästen', copy: 'Säkerställ att personalen hittar rätt information och att rutinerna minskar risken för oavsiktlig allergenkontamination.', href: '/seo/allergeninformation-restaurang.html', linkLabel: 'Läs om allergeninformation' },
      { title: 'Varumottagning och förvaring', copy: 'Kontrollera relevanta leveranser och se till att emballage, separering, spårbarhet och förvaring fungerar från mottagning till användning.', href: '/seo/varumottagning-livsmedel.html', linkLabel: 'Läs om varumottagning' },
      { title: 'Spårbarhet', copy: 'Ordna leverantörs- och leveransunderlag så att berörda livsmedel går att identifiera när något behöver utredas.', href: '/sparbarhet-livsmedel', linkLabel: 'Läs om spårbarhet' },
      { title: 'Avvikelser och dokumentation', copy: 'Bestäm hur avvikelser tas om hand, vem som ansvarar och vilket underlag som behövs för att kunna följa upp arbetet.', href: '/dokumentation-egenkontroll-livsmedel', linkLabel: 'Läs om dokumentation' },
    ],
  },
  workflow: {
    eyebrow: 'Rekommenderad arbetsordning',
    title: 'Gå från verksamhetens flöde till ett arbetssätt som går att följa',
    introduction: 'Arbetsordningen hjälper er att hålla ihop analys, planering och uppföljning utan att verktyg eller mallar fattar beslut åt verksamheten.',
    steps: [
      { title: 'Beskriv vad restaurangen faktiskt gör', copy: 'Gå igenom råvaror, mottagning, förvaring, beredning, tillagning, servering och andra moment som förekommer.' },
      { title: 'Identifiera faror och kontrollåtgärder', copy: 'Bedöm vilka faror som är relevanta i de egna processerna och hur de kan förebyggas, elimineras eller reduceras.', href: '/haccp-sma-livsmedelsforetag', linkLabel: 'Förstå HACCP-arbetet' },
      { title: 'Planera ansvar och kontroller', copy: 'Beskriv vad som ska göras, av vem, hur resultatet följs upp och vad som händer när något avviker.', href: '/kontrollplan-livsmedel', linkLabel: 'Läs om kontrollplanen' },
      { title: 'Genomför och dokumentera', copy: 'Gör kontrollerna användbara i vardagen och spara det underlag som behövs för uppföljning.', href: '/dokumentation-egenkontroll-livsmedel', linkLabel: 'Förstå dokumentationen' },
      { title: 'Följ upp och förbättra', copy: 'Använd avvikelser, observationer och dokumentation för att bedöma om rutinerna fungerar och behöver ändras.', href: '/avvikelser-korrigerande-atgarder-livsmedel', linkLabel: 'Läs om avvikelser' },
    ],
  },
  practicalResources: {
    eyebrow: 'Praktiska resurser',
    title: 'Arbeta vidare med ett eget underlag',
    introduction: 'Läs först vägledningen och använd sedan mallen eller verktyget för att strukturera verksamhetens egna uppgifter och bedömningar.',
    hrefs: ['/haccp-sma-livsmedelsforetag', '/verktyg-faroanalys-livsmedel', '/mall-kontrollplan-livsmedel', '/dokumentation-egenkontroll-livsmedel'],
  },
  mistakes: {
    eyebrow: 'Vanliga misstag',
    title: 'Undvik underlag som ser färdiga ut men inte styr vardagen',
    items: [
      { title: 'En generell lista kopieras utan anpassning', copy: 'Egenkontrollen behöver spegla restaurangens egna råvaror, processer, lokaler, utrustning och arbetssätt.' },
      { title: 'Kontroller dokumenteras men följs inte upp', copy: 'Bestäm i förväg vem som reagerar på ett avvikande resultat och hur både produkt och process tas om hand.' },
      { title: 'Ansvar och instruktioner är otydliga', copy: 'Personalen behöver kunna förstå vad som ska göras i stunden och vem som tar nästa steg när något inte fungerar.' },
    ],
  },
  faq: {
    title: 'Frågor om restaurangens egenkontroll',
    items: [
      { question: 'Behöver alla restauranger ha samma kontroller?', answer: 'Nej. Upplägget behöver anpassas efter verksamhetens storlek, art, processer och risker. Vanliga kontrollområden är en startpunkt, inte en universell checklista.' },
      { question: 'Finns det ett temperaturvärde som gäller för allt?', answer: 'Nej. Vilka gränser och arbetssätt som är relevanta beror bland annat på livsmedlet, processen och vilken fara som ska styras. Den här sidan fastställer därför inga generella temperaturgränser.' },
      { question: 'Hur mycket behöver dokumenteras?', answer: 'Dokumentationen ska vara tillräcklig för verksamhetens arbetssätt och risker och göra det möjligt att följa upp rutiner, kontroller, avvikelser och verifiering. Omfattningen behöver bedömas i den egna verksamheten.' },
      { question: 'Kan en mall eller ett verktyg avgöra vad restaurangen måste göra?', answer: 'Nej. Mallar och verktyg kan strukturera arbetet, men verksamheten ansvarar för sina bedömningar och för att underlaget stämmer med den faktiska hanteringen.' },
    ],
  },
  sources: {
    title: 'Källor och faktakontroll',
    type: 'Myndighetsvägledning',
    factCheckedAt: '2026-07-15',
    links: [
      { label: 'Livsmedelsverkets Kontrollwiki: HACCP', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/476/haccp' },
      { label: 'Livsmedelsverkets Kontrollwiki: HACCP-baserade förfaranden', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/247/k-haccp-baserade-forfaranden' },
      { label: 'Livsmedelsverkets Kontrollwiki: Grundförutsättningar – allmänna hygienkrav', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/340/allmanna-hygienkrav' },
      { label: 'Livsmedelsverkets Kontrollwiki: Spårbarhet', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/741/sparbarhet' },
    ],
    limitation: 'Myndighetsvägledningen beskriver principer för hygien, HACCP-baserade förfaranden, anpassning och spårbarhet. Sidans urval och arbetsordning är Min Egenkontrolls praktiska förklaring och ersätter inte verksamhetens egen bedömning eller kontrollmyndighetens bedömning i det enskilda fallet.',
  },
  appBridge: {
    eyebrow: 'När arbetet återkommer varje dag',
    title: 'Gör de planerade kontrollerna enklare att genomföra',
    copy: 'När restaurangen har bestämt vad som ska kontrolleras kan Min Egenkontroll hjälpa personalen att dokumentera kontroller, avvikelser och historik i det löpande arbetet.',
    href: '/digital-egenkontroll-livsmedel',
    linkLabel: 'Se hur appen fungerar',
  },
};

export const cafeBusinessPage: BusinessPageContent = {
  title: 'Egenkontroll för café och bageri – planera rätt kontroller | Min Egenkontroll',
  description: 'Få överblick över egenkontroll för café och bageri: temperatur, förvaring, rengöring, allergener, råvarumottagning, märkning, spårbarhet, avvikelser, dokumentation och HACCP.',
  canonicalPath: '/egenkontroll-cafe',
  breadcrumb: [
    { label: 'Kunskap', href: '/kunskapsbank' },
    { label: 'Egenkontroll för café och bageri' },
  ],
  eyebrow: 'För caféer och bagerier',
  heading: 'Egenkontroll för café och bageri – utgå från sortimentet och arbetssättet',
  shortAnswer: 'Egenkontrollen ska hjälpa caféet eller bageriet att planera, genomföra, dokumentera och följa upp relevanta kontroller. Utgå från det faktiska sortimentet, råvarorna och processerna – exempelvis bakning, beredning, nedkylning, exponering, servering och förpackning – i stället för att använda en generell checklista utan anpassning.',
  controlAreas: {
    eyebrow: 'Vanliga kontrollområden',
    title: 'Skapa överblick från råvara till försäljning',
    introduction: 'Områdena är vanliga utgångspunkter. Vilka kontroller som behövs, hur de utförs och hur ofta de följs upp beror på verksamhetens faktiska sortiment, processer och risker.',
    items: [
      { title: 'Temperatur, nedkylning och förvaring', copy: 'Kartlägg kyl- och frysförvaring, temperaturkänsliga råvaror och fyllningar samt nedkylning och annan temperaturstyrning som faktiskt förekommer.', href: '/seo/temperaturkontroll-livsmedel.html', linkLabel: 'Läs om temperaturkontroll' },
      { title: 'Rengöring och personlig hygien', copy: 'Planera rengöring av arbetsytor, redskap, maskiner och annan utrustning och gör relevanta hygienrutiner begripliga för personalen.', href: '/seo/rengoring-livsmedelsverksamhet.html', linkLabel: 'Läs om rengöring' },
      { title: 'Allergener och information till kunden', copy: 'Håll information om recept, ingrediensbyten och allergener aktuell och minska risken för oavsiktlig allergenkontamination i hanteringen.', href: '/seo/allergeninformation-restaurang.html', linkLabel: 'Läs om allergeninformation' },
      { title: 'Råvarumottagning och lagring', copy: 'Följ upp relevanta leveranser, emballage och förvaringsförhållanden och ordna råvarorna så att separering och rotation fungerar.', href: '/seo/varumottagning-livsmedel.html', linkLabel: 'Läs om varumottagning' },
      { title: 'Märkning och hållbarhet', copy: 'Säkerställ att den information, datummärkning och förvaring som behövs för de egna produkterna hanteras utifrån hur de säljs och förpackas.', href: '/seo/datummarkning-livsmedel.html', linkLabel: 'Läs om datummärkning' },
      { title: 'Spårbarhet, avvikelser och dokumentation', copy: 'Ordna leverantörs- och produktunderlag och bestäm hur avvikelser dokumenteras, åtgärdas och följs upp i det löpande arbetet.', href: '/sparbarhet-livsmedel', linkLabel: 'Läs om spårbarhet' },
    ],
  },
  workflow: {
    eyebrow: 'Rekommenderad arbetsordning',
    title: 'Gå från sortiment och processer till ett arbetssätt som går att följa',
    introduction: 'Arbetsordningen knyter ihop analys, planering, dokumentation och uppföljning utan att mallar eller verktyg fattar beslut åt verksamheten.',
    steps: [
      { title: 'Beskriv vad verksamheten faktiskt gör', copy: 'Gå igenom råvaror, recept, mottagning, förvaring, bakning, beredning, nedkylning, exponering, servering och förpackning som förekommer.' },
      { title: 'Identifiera faror och kontrollåtgärder', copy: 'Bedöm vilka faror som är relevanta i de egna processerna och hur de kan förebyggas, elimineras eller reduceras.', href: '/haccp-sma-livsmedelsforetag', linkLabel: 'Förstå HACCP-arbetet' },
      { title: 'Planera ansvar och kontroller', copy: 'Beskriv vad som ska göras, av vem, hur resultatet följs upp och vad som händer när något avviker.', href: '/kontrollplan-livsmedel', linkLabel: 'Läs om kontrollplanen' },
      { title: 'Genomför och dokumentera', copy: 'Gör kontrollerna användbara i vardagen och spara det underlag som behövs för uppföljning.', href: '/dokumentation-egenkontroll-livsmedel', linkLabel: 'Förstå dokumentationen' },
      { title: 'Följ upp och förbättra', copy: 'Använd avvikelser, observationer och dokumentation för att bedöma om rutinerna fungerar och behöver ändras.', href: '/avvikelser-korrigerande-atgarder-livsmedel', linkLabel: 'Läs om avvikelser' },
    ],
  },
  practicalResources: {
    eyebrow: 'Praktiska resurser',
    title: 'Arbeta vidare med verksamhetens eget underlag',
    introduction: 'Läs vägledningen och använd sedan mallen eller verktyget för att strukturera verksamhetens egna uppgifter och bedömningar.',
    hrefs: ['/haccp-sma-livsmedelsforetag', '/verktyg-faroanalys-livsmedel', '/mall-kontrollplan-livsmedel', '/dokumentation-egenkontroll-livsmedel'],
  },
  mistakes: {
    eyebrow: 'Vanliga misstag',
    title: 'Undvik underlag som inte följer det faktiska arbetet',
    items: [
      { title: 'En generell lista kopieras utan anpassning', copy: 'Egenkontrollen behöver spegla caféets eller bageriets egna råvaror, recept, produkter, processer, lokaler och arbetssätt.' },
      { title: 'Recept och allergeninformation hamnar ur synk', copy: 'Bestäm hur ändrade ingredienser, ersättningsvaror och tillfälligt sortiment förs in i informationen som personal och kunder använder.' },
      { title: 'Resultat sparas men avvikelser följs inte upp', copy: 'Bestäm vem som reagerar på ett avvikande resultat och hur både berörd produkt och bakomliggande arbetssätt tas om hand.' },
    ],
  },
  faq: {
    title: 'Frågor om egenkontroll för café och bageri',
    items: [
      { question: 'Behöver alla caféer och bagerier ha samma kontroller?', answer: 'Nej. Upplägget behöver anpassas efter verksamhetens sortiment, storlek, processer och risker. Kontrollområdena på sidan är en startpunkt, inte en universell checklista.' },
      { question: 'Finns det temperatur- eller nedkylningsgränser som gäller för allt?', answer: 'Nej. Relevanta gränser och arbetssätt beror bland annat på livsmedlet, processen och vilken fara som ska styras. Sidan fastställer därför inga generella värden.' },
      { question: 'Vad behöver ändras när sortimentet ändras?', answer: 'Bedöm om nya råvaror, recept, allergener eller processer medför andra faror eller kontrollbehov och håll berörd information, rutiner och dokumentation aktuell.' },
      { question: 'Kan en mall eller ett verktyg avgöra vad verksamheten måste göra?', answer: 'Nej. Mallar och verktyg kan strukturera arbetet, men verksamheten ansvarar för sina bedömningar och för att underlaget stämmer med den faktiska hanteringen.' },
    ],
  },
  sources: {
    title: 'Källor och faktakontroll',
    type: 'Myndighetsvägledning',
    factCheckedAt: '2026-07-15',
    links: [
      { label: 'Livsmedelsverkets Kontrollwiki: Temperatur', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/349/temperatur' },
      { label: 'Livsmedelsverkets Kontrollwiki: Rengöring', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/346/rengoring' },
      { label: 'Livsmedelsverkets Kontrollwiki: Allergeninformation', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/39/allergeninformation' },
      { label: 'Livsmedelsverkets Kontrollwiki: Hantering och förvaring', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/342/hantering-och-forvaring' },
      { label: 'Livsmedelsverkets Kontrollwiki: Datummärkning', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/41/datummarkning' },
      { label: 'Livsmedelsverkets Kontrollwiki: Spårbarhet', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/741/sparbarhet' },
      { label: 'Livsmedelsverkets Kontrollwiki: HACCP', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/476/haccp' },
    ],
    limitation: 'Myndighetsvägledningen beskriver principer för bland annat hygien, temperatur, information, spårbarhet och HACCP. Sidans urval och arbetsordning är Min Egenkontrolls praktiska förklaring och ersätter inte verksamhetens egen bedömning eller kontrollmyndighetens bedömning i det enskilda fallet.',
  },
  appBridge: {
    eyebrow: 'När arbetet återkommer i vardagen',
    title: 'Gör de planerade kontrollerna enklare att genomföra',
    copy: 'När caféet eller bageriet har bestämt vad som ska kontrolleras kan Min Egenkontroll hjälpa personalen att dokumentera kontroller, avvikelser och historik i det löpande arbetet.',
    href: '/digital-egenkontroll-livsmedel',
    linkLabel: 'Se hur appen fungerar',
  },
};

export const kioskFoodtruckBusinessPage: BusinessPageContent = {
  title: 'Egenkontroll för kiosk och foodtruck – planera rätt kontroller | Min Egenkontroll',
  description: 'Få överblick över egenkontroll för kiosk och foodtruck: transport, temperatur, vatten, rengöring, allergener, varumottagning, spårbarhet, avvikelser, dokumentation och HACCP.',
  canonicalPath: '/egenkontroll-kiosk-foodtruck',
  breadcrumb: [
    { label: 'Kunskap', href: '/kunskapsbank' },
    { label: 'Egenkontroll för kiosk och foodtruck' },
  ],
  eyebrow: 'För kiosker och foodtrucks',
  heading: 'Egenkontroll för kiosk och foodtruck – utgå från flödet på plats',
  shortAnswer: 'Egenkontrollen ska hjälpa kiosken eller foodtrucken att planera, genomföra, dokumentera och följa upp relevanta kontroller. Utgå från det faktiska sortimentet, transporterna, utrustningen, vattenförsörjningen och arbetsmomenten på varje försäljningsplats – inte från en generell checklista utan anpassning.',
  controlAreas: {
    eyebrow: 'Vanliga kontrollområden',
    title: 'Skapa överblick från lastning till servering',
    introduction: 'Områdena är vanliga utgångspunkter. Vilka kontroller som behövs, hur de utförs och hur ofta de följs upp beror på verksamhetens sortiment, hantering, utrustning och risker.',
    items: [
      { title: 'Transport, mottagning och förvaring', copy: 'Kartlägg hur råvaror och färdiga produkter tas emot, lastas, transporteras, separeras och förvaras före och under försäljningen.', href: '/seo/hantering-och-forvaring-livsmedel.html', linkLabel: 'Läs om hantering och förvaring' },
      { title: 'Temperatur och tidsstyrda moment', copy: 'Planera uppföljningen av kylning, frysning, tillagning, varmhållning och andra temperaturstyrda moment som faktiskt förekommer.', href: '/seo/temperaturkontroll-livsmedel.html', linkLabel: 'Läs om temperaturkontroll' },
      { title: 'Vattenförsörjning och handhygien', copy: 'Beskriv var vattnet kommer från, vad det används till och hur handhygien och arbetet hanteras om tillgången eller kvaliteten förändras.', href: '/seo/vatten-i-livsmedelsverksamhet.html', linkLabel: 'Läs om vattenförsörjning' },
      { title: 'Rengöring på begränsad yta', copy: 'Planera rengöring av arbetsytor, redskap, behållare och utrustning så att rena och använda delar kan hanteras tydligt även när utrymmet är litet.', href: '/seo/rengoring-livsmedelsverksamhet.html', linkLabel: 'Läs om rengöring' },
      { title: 'Allergener och information till kunden', copy: 'Håll information om ingredienser, ersättningsvaror och allergener aktuell och gör den tillgänglig för personalen vid varje försäljningsplats.', href: '/seo/allergeninformation-restaurang.html', linkLabel: 'Läs om allergeninformation' },
      { title: 'Spårbarhet, avvikelser och dokumentation', copy: 'Ordna leverantörs- och produktunderlag och bestäm hur avbrott, avvikande resultat och vidtagna åtgärder dokumenteras och följs upp.', href: '/sparbarhet-livsmedel', linkLabel: 'Läs om spårbarhet' },
    ],
  },
  workflow: {
    eyebrow: 'Rekommenderad arbetsordning',
    title: 'Gå från dagens flöde till kontroller som fungerar på plats',
    introduction: 'Arbetsordningen knyter ihop analys, planering, dokumentation och uppföljning utan att mallar eller verktyg fattar beslut åt verksamheten.',
    steps: [
      { title: 'Beskriv verksamhetens faktiska flöde', copy: 'Gå igenom inköp, lastning, transport, uppställning, förvaring, beredning, tillagning, servering, rengöring och stängning som förekommer.' },
      { title: 'Identifiera faror och kontrollåtgärder', copy: 'Bedöm vilka faror som är relevanta i de egna processerna och hur de kan förebyggas, elimineras eller reduceras.', href: '/haccp-sma-livsmedelsforetag', linkLabel: 'Förstå HACCP-arbetet' },
      { title: 'Planera ansvar och kontroller', copy: 'Beskriv vad som ska göras, av vem, hur resultatet följs upp och vad som händer när något avviker.', href: '/kontrollplan-livsmedel', linkLabel: 'Läs om kontrollplanen' },
      { title: 'Genomför och dokumentera', copy: 'Gör kontrollerna användbara under arbetsdagen och spara det underlag som behövs för uppföljning.', href: '/dokumentation-egenkontroll-livsmedel', linkLabel: 'Förstå dokumentationen' },
      { title: 'Följ upp och förbättra', copy: 'Använd avvikelser, observationer och dokumentation för att bedöma om rutinerna fungerar på olika platser och behöver ändras.', href: '/avvikelser-korrigerande-atgarder-livsmedel', linkLabel: 'Läs om avvikelser' },
    ],
  },
  practicalResources: {
    eyebrow: 'Praktiska resurser',
    title: 'Arbeta vidare med verksamhetens eget underlag',
    introduction: 'Läs vägledningen och använd sedan mallen eller verktyget för att strukturera verksamhetens egna uppgifter och bedömningar.',
    hrefs: ['/haccp-sma-livsmedelsforetag', '/verktyg-faroanalys-livsmedel', '/mall-kontrollplan-livsmedel', '/dokumentation-egenkontroll-livsmedel'],
  },
  mistakes: {
    eyebrow: 'Vanliga misstag',
    title: 'Undvik rutiner som inte följer arbetsdagen',
    items: [
      { title: 'En stationär verksamhets lista kopieras rakt av', copy: 'Egenkontrollen behöver spegla kioskens eller foodtruckens egna transporter, försäljningsplatser, resurser, utrustning och arbetssätt.' },
      { title: 'Försörjningsavbrott saknar en plan', copy: 'Bestäm hur personalen ska upptäcka och hantera förändringar i exempelvis el, kyla eller vatten utan att på förhand anta samma åtgärd i alla situationer.' },
      { title: 'Resultat sparas men avvikelser följs inte upp', copy: 'Bestäm vem som reagerar på ett avvikande resultat och hur både berörda livsmedel och bakomliggande arbetssätt tas om hand.' },
    ],
  },
  faq: {
    title: 'Frågor om egenkontroll för kiosk och foodtruck',
    items: [
      { question: 'Behöver alla kiosker och foodtrucks ha samma kontroller?', answer: 'Nej. Upplägget behöver anpassas efter sortiment, processer, utrustning, försäljningsplatser och risker. Kontrollområdena på sidan är en startpunkt, inte en universell checklista.' },
      { question: 'Finns det ett temperaturvärde som gäller för all hantering?', answer: 'Nej. Relevanta gränser och arbetssätt beror bland annat på livsmedlet, processen och vilken fara som ska styras. Sidan fastställer därför inga generella temperaturgränser.' },
      { question: 'Vad behöver ses över när försäljningsplatsen ändras?', answer: 'Bedöm om platsens förutsättningar för transport, uppställning, el, vatten, förvaring, rengöring och avfall påverkar faror, kontrollbehov eller rutiner.' },
      { question: 'Kan en mall eller ett verktyg avgöra vad verksamheten måste göra?', answer: 'Nej. Mallar och verktyg kan strukturera arbetet, men verksamheten ansvarar för sina bedömningar och för att underlaget stämmer med den faktiska hanteringen.' },
    ],
  },
  sources: {
    title: 'Källor och faktakontroll',
    type: 'Myndighetsvägledning',
    factCheckedAt: '2026-07-16',
    links: [
      { label: 'Livsmedelsverkets Kontrollwiki: Hantering och förvaring', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/342/hantering-och-forvaring' },
      { label: 'Livsmedelsverkets Kontrollwiki: Temperatur', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/349/temperatur' },
      { label: 'Livsmedelsverkets Kontrollwiki: Vattenförsörjning', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/352/vattenforsorjning' },
      { label: 'Livsmedelsverkets Kontrollwiki: Rengöring', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/346/rengoring' },
      { label: 'Livsmedelsverkets Kontrollwiki: Allergeninformation', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/39/allergeninformation' },
      { label: 'Livsmedelsverkets Kontrollwiki: Lokaler och utrustning', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/343/lokaler-och-utrustning' },
      { label: 'Livsmedelsverkets Kontrollwiki: Spårbarhet', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/741/sparbarhet' },
      { label: 'Livsmedelsverkets Kontrollwiki: HACCP', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/476/haccp' },
    ],
    limitation: 'Myndighetsvägledningen beskriver principer för bland annat hygien, hantering, temperatur, vatten, lokaler, information, spårbarhet och HACCP. Sidans urval och arbetsordning är Min Egenkontrolls praktiska förklaring och ersätter inte verksamhetens egen bedömning eller kontrollmyndighetens bedömning i det enskilda fallet.',
  },
  appBridge: {
    eyebrow: 'När arbetet följer med mellan platser',
    title: 'Gör de planerade kontrollerna enklare att genomföra',
    copy: 'När kiosken eller foodtrucken har bestämt vad som ska kontrolleras kan Min Egenkontroll hjälpa personalen att dokumentera kontroller, avvikelser och historik i det löpande arbetet.',
    href: '/digital-egenkontroll-livsmedel',
    linkLabel: 'Se hur appen fungerar',
  },
};

export const cateringBusinessPage: BusinessPageContent = {
  title: 'Egenkontroll för catering – planera hela kedjan | Min Egenkontroll',
  description: 'Få överblick över egenkontroll för catering: planering, varumottagning, förberedelse, förvaring, transport, servering, allergener, rengöring, spårbarhet, avvikelser, dokumentation och HACCP.',
  canonicalPath: '/egenkontroll-catering',
  breadcrumb: [
    { label: 'Kunskap', href: '/kunskapsbank' },
    { label: 'Egenkontroll för catering' },
  ],
  eyebrow: 'För cateringverksamheter',
  heading: 'Egenkontroll för catering – håll ihop arbetet från beställning till servering',
  shortAnswer: 'Egenkontrollen ska hjälpa cateringverksamheten att planera, genomföra, dokumentera och följa upp relevanta kontroller genom hela uppdraget. Utgå från den faktiska menyn, förberedelsen, förvaringen, transporten, serveringsplatsen och ansvarsfördelningen – inte från en generell checklista utan anpassning.',
  controlAreas: {
    eyebrow: 'Vanliga kontrollområden',
    title: 'Skapa överblick över hela cateringkedjan',
    introduction: 'Områdena är vanliga utgångspunkter. Vilka kontroller som behövs, hur de utförs och hur ofta de följs upp beror på uppdraget, livsmedlen, processerna och riskerna.',
    items: [
      { title: 'Beställning, meny och allergeninformation', copy: 'Fånga upp menyval, specialkost, ingrediensbyten och allergeninformation tidigt och håll underlaget aktuellt när beställningen ändras.', href: '/seo/allergeninformation-restaurang.html', linkLabel: 'Läs om allergeninformation' },
      { title: 'Varumottagning och förberedelse', copy: 'Planera mottagning och inlagring av råvaror och beskriv de berednings- och tillagningsmoment som faktiskt ingår i uppdraget.', href: '/seo/varumottagning-livsmedel.html', linkLabel: 'Läs om varumottagning' },
      { title: 'Förvaring och temperaturstyrda processer', copy: 'Kartlägg kylning, frysning, tillagning, nedkylning, varmhållning och andra temperaturstyrda moment som förekommer före och under uppdraget.', href: '/seo/temperaturkontroll-livsmedel.html', linkLabel: 'Läs om temperaturkontroll' },
      { title: 'Transport och överlämning', copy: 'Beskriv hur maten skyddas och hålls under kontrollerade förhållanden under lastning, transport, lossning och överlämning på plats.', href: '/seo/transport-av-livsmedel.html', linkLabel: 'Läs om transport av livsmedel' },
      { title: 'Servering på plats', copy: 'Planera uppställning, separering, serveringsutrustning och hantering så att de risker som finns på den aktuella platsen kan följas upp.', href: '/seo/hantering-och-forvaring-livsmedel.html', linkLabel: 'Läs om hantering och förvaring' },
      { title: 'Rengöring och returflöde', copy: 'Gör det tydligt hur rena redskap och behållare hålls åtskilda från använda samt vad som rengörs på plats och efter återkomst.', href: '/seo/rengoring-livsmedelsverksamhet.html', linkLabel: 'Läs om rengöring' },
      { title: 'Spårbarhet, avvikelser och dokumentation', copy: 'Ordna beställnings-, leverantörs- och produktunderlag och bestäm hur avvikande resultat, åtgärder och överlämningar dokumenteras och följs upp.', href: '/sparbarhet-livsmedel', linkLabel: 'Läs om spårbarhet' },
    ],
  },
  workflow: {
    eyebrow: 'Rekommenderad arbetsordning',
    title: 'Gå från uppdragets förutsättningar till ett arbetssätt som håller hela vägen',
    introduction: 'Arbetsordningen knyter ihop analys, planering, överlämningar och uppföljning utan att mallar eller verktyg fattar beslut åt verksamheten.',
    steps: [
      { title: 'Beskriv uppdraget och hela flödet', copy: 'Gå igenom beställning, meny, inköp, mottagning, förberedelse, förvaring, lastning, transport, servering, retur och rengöring som ingår.' },
      { title: 'Identifiera faror och kontrollåtgärder', copy: 'Bedöm vilka faror som är relevanta i varje del av det egna flödet och hur de kan förebyggas, elimineras eller reduceras.', href: '/haccp-sma-livsmedelsforetag', linkLabel: 'Förstå HACCP-arbetet' },
      { title: 'Planera ansvar och kontroller', copy: 'Beskriv vad som ska göras, av vem, var kontrollen sker och vad som händer när något avviker.', href: '/kontrollplan-livsmedel', linkLabel: 'Läs om kontrollplanen' },
      { title: 'Genomför, lämna över och dokumentera', copy: 'Gör kontroller och instruktioner användbara för kök, transport och servering och spara det underlag som behövs för uppföljning.', href: '/dokumentation-egenkontroll-livsmedel', linkLabel: 'Förstå dokumentationen' },
      { title: 'Följ upp efter uppdraget', copy: 'Använd avvikelser, observationer och dokumentation för att bedöma om rutiner och överlämningar fungerade och behöver ändras.', href: '/avvikelser-korrigerande-atgarder-livsmedel', linkLabel: 'Läs om avvikelser' },
    ],
  },
  practicalResources: {
    eyebrow: 'Praktiska resurser',
    title: 'Arbeta vidare med verksamhetens eget underlag',
    introduction: 'Läs vägledningen och använd sedan mallen eller verktyget för att strukturera verksamhetens egna uppgifter och bedömningar.',
    hrefs: ['/haccp-sma-livsmedelsforetag', '/verktyg-faroanalys-livsmedel', '/mall-kontrollplan-livsmedel', '/dokumentation-egenkontroll-livsmedel'],
  },
  mistakes: {
    eyebrow: 'Vanliga misstag',
    title: 'Undvik glapp mellan kök, transport och servering',
    items: [
      { title: 'Planeringen slutar vid köksdörren', copy: 'Egenkontrollen behöver även omfatta lastning, transport, överlämning, uppställning, servering och retur när de ingår i uppdraget.' },
      { title: 'Ändringar når inte allergeninformationen', copy: 'Bestäm hur ändrad meny, ersättningsvaror och sena beställningsändringar förs vidare till dem som förbereder och serverar maten.' },
      { title: 'Resultat sparas men avvikelser följs inte upp', copy: 'Bestäm vem som reagerar på ett avvikande resultat och hur både berörda livsmedel och bakomliggande arbetssätt tas om hand.' },
    ],
  },
  faq: {
    title: 'Frågor om egenkontroll för catering',
    items: [
      { question: 'Behöver alla cateringuppdrag ha samma kontroller?', answer: 'Nej. Upplägget behöver anpassas efter menyn, processerna, transporten, serveringsplatsen och riskerna. Kontrollområdena på sidan är en startpunkt, inte en universell checklista.' },
      { question: 'Finns det ett temperaturvärde som gäller för all transport och servering?', answer: 'Nej. Relevanta gränser och arbetssätt beror bland annat på livsmedlet, processen och vilken fara som ska styras. Sidan fastställer därför inga generella temperaturgränser.' },
      { question: 'Hur undviker man glapp mellan kök, transport och servering?', answer: 'Beskriv vem som utför varje kontroll, vilket underlag som följer med och hur avvikande resultat lämnas över och hanteras. Upplägget behöver anpassas till det faktiska uppdraget.' },
      { question: 'Kan en mall eller ett verktyg avgöra vad verksamheten måste göra?', answer: 'Nej. Mallar och verktyg kan strukturera arbetet, men verksamheten ansvarar för sina bedömningar och för att underlaget stämmer med den faktiska hanteringen.' },
    ],
  },
  sources: {
    title: 'Källor och faktakontroll',
    type: 'Myndighetsvägledning',
    factCheckedAt: '2026-07-16',
    links: [
      { label: 'Livsmedelsverkets Kontrollwiki: Hantering och förvaring', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/342/hantering-och-forvaring' },
      { label: 'Livsmedelsverkets Kontrollwiki: Transport', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/350/transport' },
      { label: 'Livsmedelsverkets Kontrollwiki: Temperatur', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/349/temperatur' },
      { label: 'Livsmedelsverkets Kontrollwiki: Rengöring', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/346/rengoring' },
      { label: 'Livsmedelsverkets Kontrollwiki: Allergeninformation', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/39/allergeninformation' },
      { label: 'Livsmedelsverkets Kontrollwiki: Spårbarhet', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/741/sparbarhet' },
      { label: 'Livsmedelsverkets Kontrollwiki: HACCP', url: 'https://kontrollwiki.livsmedelsverket.se/artikel/476/haccp' },
    ],
    limitation: 'Myndighetsvägledningen beskriver principer för bland annat hygien, hantering, transport, temperatur, information, spårbarhet och HACCP. Sidans urval och arbetsordning är Min Egenkontrolls praktiska förklaring och ersätter inte verksamhetens egen bedömning eller kontrollmyndighetens bedömning i det enskilda fallet.',
  },
  appBridge: {
    eyebrow: 'När flera steg behöver hänga ihop',
    title: 'Gör de planerade kontrollerna enklare att genomföra',
    copy: 'När cateringverksamheten har bestämt vad som ska kontrolleras kan Min Egenkontroll hjälpa personalen att dokumentera kontroller, avvikelser och historik genom det löpande arbetet.',
    href: '/digital-egenkontroll-livsmedel',
    linkLabel: 'Se hur appen fungerar',
  },
};
