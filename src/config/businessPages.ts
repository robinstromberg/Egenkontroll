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
