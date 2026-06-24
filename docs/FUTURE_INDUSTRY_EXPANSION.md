# Framtida branschutökning – arkitekturchecklista

Det här dokumentet ska användas när Egenkontroll i framtiden ska expandera från livsmedel till andra branscher.

Syftet är att Codex/AI inte ska utgå från att en ny bransch bara kräver nya mallnamn. Varje bransch kan kräva egna kontrollparametrar, kontrollpunkter, kontrolltyper, KPI:er och sätt att visa dokumentation.

Detta dokument är vägledande och ska läsas tillsammans med `AGENTS.md` och relevanta GitHub-issues.

## Grundprincip

Egenkontroll ska byggas som en generell kontrollmotor med branschspecifika mallpaket ovanpå.

Kärnflödet ska vara:

```text
rutin / instruktion
  → planerad eller behovsstyrd kontroll
  → kontrollpunkt / objekt
  → registrerat svar eller mätvärde
  → eventuell avvikelse
  → åtgärd och uppföljning
  → historik
  → KPI / överblick
  → delning / export / rapport
```

Nya branscher ska inte byggas som separata system om det går att undvika. De ska i första hand implementeras som nya mallpaket, fälttyper, kontrollobjekt och rapportvyer ovanpå samma motor.

## Viktig regel vid ny bransch

När en ny bransch ska läggas till ska Codex först göra en branschanalys innan kod skrivs.

Analysen ska minst svara på:

1. Vilka kontrolltyper är vanliga i branschen?
2. Vilka kontrollpunkter/objekt behöver kontrolleras?
3. Vilka parametrar/mätvärden behöver kunna registreras?
4. Vilka avvikelser är relevanta?
5. Vilka åtgärder och uppföljningar behöver dokumenteras?
6. Vilka KPI:er är meningsfulla för företagaren?
7. Vilken dokumentation vill en kontrollant, kund, revisor, intern ansvarig eller annan mottagare se?
8. Kräver branschen särskild export, rapportlayout eller filtrering?
9. Kan befintlig kontrollmotor bära detta, eller krävs ny generisk byggsten?
10. Går det att implementera som mallpaket utan att bryta livsmedels-MVP:n?

## Kontrollparametrar att utvärdera

Vid varje ny bransch ska Codex kontrollera om följande parametrar behövs.

### Grundfält som redan bör stödjas

- Text
- Lång text / kommentar
- Nummer
- Datum
- Datum och tid
- OK / Ej OK
- Ja / nej
- Val från lista
- Foto / bild
- Leverantör eller extern part
- Gränsvärde min/max
- Avvikelse
- Åtgärdstext
- Utförd av / signering

### Parametrar som kan behövas för andra branscher

Följande ska inte implementeras automatiskt, men alltid övervägas vid branschutökning:

- Generellt mätvärde med enhet, t.ex. `%`, `bar`, `Pa`, `dB`, `lux`, `ppm`, `kg`, `mm`, `kWh`.
- Tidslängd / duration, t.ex. driftstid eller kontrolltid.
- Flervalsstatus, t.ex. OK, Brist, Kritisk brist, Ej kontrollerad, Ej tillämplig.
- Risknivå / allvarlighetsgrad, t.ex. låg, medium, hög, kritisk.
- Prioritet, t.ex. låg, normal, hög, akut.
- Deadline / åtgärdas senast.
- Ansvarig person eller roll för åtgärd.
- Sekundär signering eller godkännande.
- Platsstruktur, t.ex. byggnad, våning, rum, zon, område.
- Utrustning / asset, t.ex. serienummer, inventarie-ID, modell, placering, serviceintervall.
- Filbilagor utöver foto, t.ex. PDF, certifikat, serviceprotokoll, ritning, intyg.
- Repetition baserad på intervall, t.ex. månadsvis, kvartalsvis, årligen, efter användning, efter driftstimmar eller efter incident.
- Koppling till extern aktör, t.ex. leverantör, entreprenör, kund, myndighet, kontrollorgan.
- Spårbarhetskedja, där relevant.

## Kontrollpunkter och objekt

Vid ny bransch ska Codex inte bara skapa kontrolltyper. Codex ska även bedöma vilken typ av kontrollpunkter/objekt som behövs.

Exempel på objektmodeller:

### Livsmedel

- Kyl
- Frys
- Varmhållning
- Leverans
- Produkt
- Batch
- Städzon

### Brandskydd

- Brandsläckare
- Utrymningsväg
- Branddörr
- Nödljus
- Brandlarmspunkt
- Samlingsplats

### Fastighet

- Byggnad
- Våning
- Rum
- Ventilationsenhet
- Belysningspunkt
- Dörr / lås
- Tekniskt system

### Fordon / maskiner

- Fordon
- Maskin
- Verktyg
- Serienummer
- Mätarställning
- Serviceintervall

Om kontrollpunkten egentligen är en utrustning eller tillgång ska Codex överväga om den bör hanteras som generiskt `asset/equipment`-metadata i stället för bara fritext.

## Kontrolltyper

När nya branschmallar tas fram ska varje kontrolltyp beskrivas med:

- Namn
- Bransch
- Syfte
- Frekvens
- Kontrollpunkter/objekt
- Fält/parametrar
- Gränsvärden eller godkända kriterier
- Rutin/instruktion
- Avvikelseregel
- Förväntad åtgärd vid avvikelse
- Om foto/bilaga bör vara möjlig eller obligatorisk
- Om kontrollen ska visas i dagens vy, vara behovsstyrd eller ligga som rond
- Hur den ska visas i historik och rapport

Mallar ska inte vara låsta regler. När en mall används av en organisation ska den skapa redigerbara kontrolltyper och kontrollpunkter.

## KPI:er vid ny bransch

Codex ska inte återanvända livsmedels-KPI:er okritiskt. Vid ny bransch ska följande analyseras:

- Vilka KPI:er ger företagaren bättre känsla av kontroll?
- Vilka KPI:er visar faktisk följsamhet?
- Vilka KPI:er kan skapa fel beteende om de används fel?
- Vilka KPI:er är bara interna och ska inte visas för extern mottagare?
- Vilka KPI:er är relevanta i rapport/export?

Generella KPI:er som ofta kan återanvändas:

- Antal utförda kontroller i period
- Andel planerade kontroller utförda
- Dagar med dokumentation
- Öppna avvikelser
- Åtgärdade avvikelser
- Genomsnittlig tid till åtgärd
- Avvikelser per kontrolltyp
- Avvikelser per objekt/plats
- Återkommande avvikelser
- Kontroller som ofta missas

Branschspecifika KPI:er ska definieras i mallpaketet eller rapportkonfigurationen, inte hårdkodas i kontrollmotorn.

## Dokumentation, historik och rapporter

Vid ny bransch ska Codex analysera hur dokumentationen behöver visas.

Minimikrav för de flesta branscher:

- Period
- Kontrolltyp
- Kontrollpunkt/objekt
- Datum och tid
- Utförd av
- Resultat/mätvärde
- Status
- Avvikelse
- Åtgärd
- Uppföljning
- Bilagor
- Rutiner/instruktioner

Frågor att besvara för varje ny bransch:

- Vem ska läsa dokumentationen?
- Behövs sammanfattning, detaljvy eller båda?
- Behöver dokumentationen visas per objekt, plats, person, leverantör, kund eller kontrolltyp?
- Behövs spårbarhet bakåt/framåt?
- Behövs signering/godkännande?
- Behövs PDF, CSV eller båda?
- Behöver rapporten innehålla branschspecifika rubriker?
- Ska KPI:er visas i rapporten eller bara i intern överblick?

## Extern mottagare är inte alltid myndighet

I livsmedel är kontrollant/myndighet en viktig mottagare. I andra branscher kan mottagaren vara någon annan:

- Kund
- Fastighetsägare
- Arbetsledare
- Revisor
- Certifieringsorgan
- Försäkringsbolag
- Intern kvalitetsansvarig
- Skyddsombud
- Entreprenör

Dokumentationsvyn och exporten ska därför inte anta att mottagaren alltid är livsmedelsinspektör.

## Branschutökning ska inte förstöra livsmedel

Vid varje ny bransch ska följande skyddas:

- Befintliga livsmedelsorganisationer
- Befintliga kontrolltyper
- Befintlig historik
- Befintliga avvikelser
- Befintliga inspektörslänkar
- Befintlig PDF/CSV-export
- Befintliga roller och RLS-regler

Om en ändring kräver databasändring ska Codex först beskriva migrationen och varför den behövs.

## Rekommenderad arbetsordning vid framtida expansion

1. Skapa ett GitHub-issue för den specifika branschen.
2. Gör branschanalys enligt detta dokument.
3. Identifiera saknade generiska byggstenar.
4. Implementera eventuella generiska backend-stöd först.
5. Skapa branschens mallpaket.
6. Koppla mallpaketet till organisation/bransch utan att ändra befintliga food-flöden.
7. Anpassa eventuell copy/rapportvy.
8. Testa historik, avvikelser, KPI, delning och export.
9. Dokumentera vilka antaganden som gäller för branschen.

## Viktig avgränsning

Detta dokument betyder inte att alla parametrar ska byggas nu.

Det betyder att Codex ska kontrollera dessa områden innan en ny bransch implementeras, så att appen inte byggs fast i ett för smalt livsmedelsperspektiv.