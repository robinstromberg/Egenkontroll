import { SourcedSeoPage, type SourcedSeoPageContent } from './SourcedSeoPage';

const content: SourcedSeoPageContent = {
  slug: 'kontrollplan-vem-nar-hur',
  title: 'Kontrollplan – vem, när och hur? | Min Egenkontroll',
  description: 'En enkel guide till vem som gör kontrollen, när den sker och hur arbetssättet beskrivs.',
  eyebrow: 'Kontrollplan',
  heading: 'Kontrollplan – vem, när och hur?',
  intro: 'En tydlig kontrollplan hjälper verksamheten att upptäcka när ett viktigt arbetsmoment inte längre fungerar som planerat.',
  benefits: [
    ['Vem', 'Ansvaret för kontrollen behöver vara tydligt.'],
    ['När', 'Bestäm när och hur ofta kontrollen ska ske.'],
    ['Hur', 'Beskriv metoden så att kontrollen utförs likvärdigt.'],
  ],
  practicalHeading: 'Måste instruktionerna vara skriftliga?',
  practicalText: 'Inte alltid. Livsmedelsverkets vägledning beskriver att muntliga instruktioner kan räcka i små verksamheter där få personer sköter arbetet och kan beskriva och utföra det likvärdigt.',
  examplesHeading: 'Planen behöver svara på',
  examples: ['Vad?', 'Vem?', 'När?', 'Hur ofta?', 'Hur?', 'Vad gör vi vid avvikelse?'],
  faq: [
    ['Måste kontrollen ske hela tiden?', 'Nej. Den kan ske löpande eller med intervall beroende på verksamheten.'],
  ],
  sourceLabel: 'Livsmedelsverkets Kontrollwiki: HACCP, princip 4',
  sourceUrl: 'https://kontrollwiki.livsmedelsverket.se/artikel/476/haccp',
  related: [
    ['/kritiska-gransvarden-livsmedel', 'Kritiska gränsvärden', 'Se hur en tydlig gräns kan beskrivas.'],
    ['/avvikelser-korrigerande-atgarder-livsmedel', 'Avvikelser och åtgärder', 'Se vad som bör hända när något inte blir som planerat.'],
  ],
};

export function KontrollplanPage() {
  return <SourcedSeoPage content={content} />;
}
