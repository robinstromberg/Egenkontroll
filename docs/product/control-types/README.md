# Kontrolltypskatalog för livsmedel

Detta dokument är produktens samlade översikt för de 16 beslutade kontrolltyperna. Det håller ihop gemensamma regler, primärt arbetssätt, produktstatus och länkar till respektive detaljdefinition.

Dokumentet beskriver **målbilden**. Befintliga startmallar och dagens implementation kan vara enklare eller delvis avvika. En rad i katalogen betyder därför inte att kontrolltypen redan finns färdig i appen.

## Statusbegrepp

| Status | Betydelse |
|---|---|
| Basdefinition klar | Syfte, relevant dokumentation, normal utlösare och avvikelseprincip är beslutade på produktnivå. |
| UX beslutad | Det konkreta mobilflödet är godkänt och sparat i ett detaljdokument. |
| Implementationsklar | En separat GitHub-issue kan skrivas utan öppna produkt- eller UX-frågor. |
| Implementerad | Den godkända målbilden är byggd, verifierad och mergad. |

Status avser alltså den nya målbilden, inte om en äldre eller enklare mall med liknande namn finns i databasen.

## Fyra grundflöden

Kontrolltyperna ska använda en gemensam kontrollmotor och gemensamma regler för spårbarhet, men de ska inte tvingas in i samma formulär.

| Grundflöde | När det passar | Exempel |
|---|---|---|
| Snabb mätning | Flera återkommande värden anges direkt i en sammanhållen lista. | Kyl- och frystemperatur |
| Checklista/rond | Förutbestämda punkter bedöms som godkända, avvikande eller inte aktuella. | Rengöringskontroll |
| Händelsestyrd kontroll | Kontrollen startas när en produktion, leverans eller annan händelse inträffar. | Varumottagning och nedkylning |
| Periodisk verifiering | Verksamheten verifierar med ett bestämt intervall att ett system eller arbetssätt fungerar. | Spårbarhetsprov och termometerkontroll |

Grundflödet i katalogen är den preliminära huvudmodellen. Detaljarbetet för en kontrolltyp får visa att en variant eller kombination behövs, men det ska beslutas uttryckligen och uppdateras här.

## Katalog och status

| Nr | Kontrolltyp | Primärt grundflöde | Produktstatus | Detaljdefinition |
|---:|---|---|---|---|
| 1 | Kyl- och frystemperatur | Snabb mätning | UX beslutad | [Kyl- och frystemperatur](./KYL_OCH_FRYSTEMPERATUR.md) |
| 2 | Varmhållningskontroll | Händelsestyrd kontroll | Basdefinition klar | Återstår |
| 3 | Nedkylningskontroll | Händelsestyrd kontroll | Basdefinition klar | Återstår |
| 4 | Varumottagningskontroll | Händelsestyrd kontroll | Basdefinition klar | Återstår |
| 5 | Rengöringskontroll | Checklista/rond | Basdefinition klar | Återstår |
| 6 | Spårbarhetskontroll | Periodisk verifiering | Basdefinition klar | Återstår |
| 7 | Datummärkningskontroll | Checklista/rond | Basdefinition klar | Återstår |
| 8 | Skadedjurskontroll | Checklista/rond | Basdefinition klar | Återstår |
| 9 | Avfallskontroll | Checklista/rond | Basdefinition klar | Återstår |
| 10 | Personlig hygienkontroll | Checklista/rond | Basdefinition klar | Återstår |
| 11 | Allergeninformationskontroll | Periodisk verifiering | Basdefinition klar | Återstår |
| 12 | Fri från- och specialkostkontroll | Händelsestyrd kontroll | Basdefinition klar | Återstår |
| 13 | Transportkontroll | Händelsestyrd kontroll | Basdefinition klar | Återstår |
| 14 | Vattenförsörjningskontroll | Periodisk verifiering | Basdefinition klar | Återstår |
| 15 | Funktionskontroll av termometrar | Periodisk verifiering | Basdefinition klar | Återstår |
| 16 | Akrylamidkontroll | Periodisk verifiering | Basdefinition klar | Återstår |

## Gemensamma produktregler

### Företaget ska förstå vad som påverkas

Varje inställning ska förklara effekten i den dagliga kontrollen. Företagaren ska inte behöva förstå datamodellen eller gissa vad exempelvis gränsvärde, instruktion eller schema gör.

### Mallarna har tre lager

| Lager | Företagets handlingsutrymme |
|---|---|
| Mallens syfte och grundläggande kontrollogik | Ska inte kunna ändras fritt så att kontrolltypen förlorar sin betydelse. |
| Verksamhetens enheter, produkter, kontrollpunkter, frekvens, instruktioner och gränser | Ska kunna anpassas inom kontrolltypens beslutade ramar. |
| En utförd kontroll | Får inte skrivas över. Rättelse görs spårbart med orsak, användare och tid. |

När en aktiv definition ändras ska en ny version gälla för framtida kontroller. Tidigare dokumentation ska fortsätta visa de regler, instruktioner och gränser som gällde när kontrollen utfördes.

### Normalfallet ska vara snabbt

- Nästa handling ska vara självklar på mobil.
- Relevant instruktion ska finnas där kontrollpunkten utförs.
- Systemdata som användare, datum, tid, verksamhet och mallversion registreras automatiskt.
- Extra val ska visas först när de behövs, till exempel vid avvikelse eller `Ej i drift`.
- En kontroll ska inte kunna slutföras om en obligatorisk kontrollpunkt har missats omedvetet.

### Avvikelser ska dokumenteras där de uppstår

- Avvikelsen öppnas vid berörd kontrollpunkt.
- Språket ska vara neutralt och beskriva att resultatet ligger utanför verksamhetens regel, inte automatiskt påstå att maten är osäker.
- Snabbval ska täcka vanliga åtgärder och fritext ska bara krävas när snabbvalen inte räcker.
- Användaren ska ange om avvikelsen löstes direkt eller behöver följas upp.
- En olöst avvikelse ska bli en synlig öppen uppföljning utan att det ursprungliga resultatet ändras.

### Sparbekräftelsen är ett kvitto

Den befintliga lilla sparanimationen ska behållas. Efter bekräftad lagring ska användaren se:

- kontrolltyp,
- utförare,
- verklig tidpunkt,
- sammanfattat resultat,
- eventuell öppen avvikelse.

Animationens checkmark betyder att dokumentationen har sparats, inte att alla kontrollpunkter var godkända.

### Offline ska minska arbete, inte skapa osäkerhet

En kontroll som utförs offline ska sparas lokalt med den verkliga utförandetiden och synkroniseras automatiskt när anslutningen återkommer. Användaren ska bara behöva agera om synkroniseringen misslyckas. Lokal lagring och lyckad serversynk får inte beskrivas som samma sak.

### Historiken ska besvara två frågor

| Vad skulle göras? | Vad hände? |
|---|---|
| Aktiva kontrollpunkter, instruktioner, gränser, metod, schema och version | Resultat, utförare, tidpunkt, avvikelse, åtgärd och uppföljning |

Sena och missade kontroller får inte döljas eller efterregistreras som om de utförts i tid. Pausade och arkiverade kontrollpunkter ska finnas kvar i historiken.

## Avgränsning: kontrolltypseditorn

Denna katalog bestämmer **vad** respektive kontrolltyp behöver kunna ställa in och hur inställningarna påverkar utförande och historik. Den bestämmer inte nu **hur hela redigeringsvyn ska byggas om**.

I det fortsatta kontrolltypsarbetet ska editorn därför lämnas i stort sett orörd. En samlad omarbetning av redigeringsvyn är ett separat UX- och implementationsspår.

## Arbetsordning för varje kontrolltyp

1. Arbeta med en kontrolltyp i en egen fokuserad chatt.
2. Utgå från basdefinitionen och granska den faktiska lösningen på `main`.
3. Besluta vad som ska behållas, ändras och kompletteras.
4. Fastställ det konkreta mobilflödet för normalfall, avvikelse, sparbekräftelse och historik.
5. Dokumentera endast de inställningsbehov som kontrolltypen kräver; öppna inte den generella editorfrågan.
6. Efter produktägarens godkännande: skapa detaljdokumentet och uppdatera status i denna katalog.
7. Skapa först därefter en avgränsad GitHub-issue för implementation.

Kyl- och frystemperatur är referens för detaljnivå, dokumentation, avvikelsehantering och historisk tillförlitlighet. Den är **inte** en frontendmall som övriga kontrolltyper ska kopiera.

## Rekommenderad nästa kontrolltyp

Nästa produkt- och UX-arbete bör vara **Rengöringskontroll**. Den ger en första fullständig referens för grundflödet checklista/rond. Därefter bör Varumottagningskontroll och Funktionskontroll av termometrar definieras för att täcka de två återstående grundflödena innan närliggande mallar tas i turordning.
