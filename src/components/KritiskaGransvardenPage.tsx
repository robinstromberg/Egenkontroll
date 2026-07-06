import { SourcedSeoPage, type SourcedSeoPageContent } from './SourcedSeoPage';

const content: SourcedSeoPageContent = {
  slug: 'kritiska-gransvarden-livsmedel',
  title: 'Kritiska gränsvärden i HACCP – vad betyder det? | Min Egenkontroll',
  description: 'Läs vad ett kritiskt gränsvärde betyder i HACCP och hur gränsen kan bygga på exempelvis temperatur, tid eller pH.',
  eyebrow: 'Kritiska gränsvärden',
  heading: 'Kritiska gränsvärden i HACCP – vad betyder det?',
  intro: 'Ett kritiskt gränsvärde skiljer det som är acceptabelt från det som inte är acceptabelt vid en kritisk styrpunkt. Gränsen behöver vara tydlig så att verksamheten kan avgöra om processen är under kontroll.',
  benefits: [
    ['Tydligt beslutsläge', 'Gränsen visar när resultatet är acceptabelt och när verksamheten behöver agera.'],
    ['Mätbart eller observerbart', 'Gränsen kan bygga på exempelvis temperatur, tid, pH eller ett tydligt observerbart resultat.'],
    ['Förklarad grund', 'Företagaren behöver kunna redogöra för var gränsen kommer ifrån och varför den används.'],
  ],
  practicalHeading: 'Varifrån kommer ett kritiskt gränsvärde?',
  practicalText: 'Livsmedelsverkets vägledning beskriver flera möjliga grunder. Gränsen kan vara vedertagen eller fastställd i regler, komma från en branschriktlinje eller generisk plan, eller vara framtagen genom företagets egna undersökningar. Ett kritiskt gränsvärde behöver inte alltid vara numeriskt, men det ska vara tydligt och specifikt.',
  examplesHeading: 'Exempel på kritiska gränser',
  examples: ['Temperatur', 'Tid', 'pH-värde', 'Mängd av tillsats', 'Observerbar kokning'],
  faq: [
    ['Måste gränsvärdet alltid vara en siffra?', 'Nej. Vägledningen beskriver att ett tydligt observerbart värde kan användas i vissa fall.'],
    ['Kan företaget själv bestämma en gräns?', 'Ja, men verksamheten behöver kunna visa varför den valda gränsen är lämplig.'],
    ['Är alla gränsvärden i egenkontrollen kritiska?', 'Nej. Ett kritiskt gränsvärde hör till en kritisk styrpunkt i HACCP.'],
  ],
  sourceLabel: 'Livsmedelsverkets Kontrollwiki: HACCP, princip 3',
  sourceUrl: 'https://kontrollwiki.livsmedelsverket.se/artikel/476/haccp',
  related: [
    ['/overvakning-kritiska-styrpunkter-livsmedel', 'Övervakning av kritiska styrpunkter', 'Se hur ansvar, frekvens och metod behöver vara tydliga.'],
    ['/avvikelser-korrigerande-atgarder-livsmedel', 'Avvikelser och korrigerande åtgärder', 'Se vad som bör hända när en gräns passeras.'],
    ['/haccp-sma-livsmedelsforetag', 'HACCP för små livsmedelsföretag', 'Se hur HACCP kan anpassas till en liten verksamhet.'],
  ],
};

export function KritiskaGransvardenPage() {
  return <SourcedSeoPage content={content} />;
}
