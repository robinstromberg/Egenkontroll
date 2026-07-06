import { SourcedSeoPage, type SourcedSeoPageContent } from './SourcedSeoPage';

const content: SourcedSeoPageContent = {
  slug: 'intern-sparbarhet-livsmedel',
  title: 'Intern spårbarhet för livsmedel | Min Egenkontroll',
  description: 'Läs hur kopplingar mellan råvaror och tillverkningsomgångar kan hjälpa företag att avgränsa berörda produkter.',
  eyebrow: 'Intern spårbarhet',
  heading: 'Intern spårbarhet – när är det användbart?',
  intro: 'Intern spårbarhet kopplar råvaror och ingredienser till det som produceras i den egna verksamheten. Livsmedelsverket beskriver att grundkraven inte kräver detta, men att det kan ge praktiska fördelar.',
  benefits: [
    ['Avgränsa bättre', 'Tydliga kopplingar kan göra det lättare att se vilka produkter som faktiskt berörs om ett problem upptäcks.'],
  ],
  practicalHeading: 'Är intern spårbarhet ett lagkrav?',
  practicalText: 'Nej, inte enligt de grundläggande krav som Livsmedelsverket beskriver. Ett frivilligt system kan däremot göra det lättare att koppla en råvara till en viss sats eller produktionsomgång.',
  examplesHeading: 'Exempel på kopplingar',
  examples: ['Råvara', 'Leverans', 'Batch', 'Produktionsomgång', 'Färdig produkt'],
  faq: [
    ['Vad är den största nyttan?', 'Att lättare kunna avgränsa vilka produkter som faktiskt berörs.'],
  ],
  sourceLabel: 'Livsmedelsverkets Kontrollwiki: Spårbarhet inom företaget',
  sourceUrl: 'https://kontrollwiki.livsmedelsverket.se/artikel/741/sparbarhet',
  related: [
    ['/sparbarhet-livsmedel', 'Spårbarhet för livsmedelsföretag', 'Se grundkraven för leverantörer och mottagare.'],
    ['/spara-sparbarhetsuppgifter-livsmedel', 'Hur länge ska uppgifter sparas?', 'Läs om rekommenderade lagringstider.'],
  ],
};

export function InternSparbarhetPage() {
  return <SourcedSeoPage content={content} />;
}
