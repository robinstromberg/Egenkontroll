# Strategiomläggning – Min Egenkontroll

## Syfte

Detta dokument är den strategiska källan till sanningen för omläggningen av Min Egenkontroll. Det beskriver vad produkten och plattformen ska bli, vilka principer som styr arbetet och i vilken ordning större förändringar ska genomföras.

Det ersätter inte teknisk dokumentation eller enskilda issues. Det ska styra dem.

## Ny positionering

Min Egenkontroll går från att främst presenteras som en app för egenkontroll till att bli Sveriges bästa hjälp med egenkontroll.

Appen är fortfarande kärnprodukten och den viktigaste intäktskällan. Runt appen byggs en publik plattform med kunskap, mallar, checklistor, verktyg, guider och andra resurser som hjälper människor redan innan de blir kunder.

Målet är att Min Egenkontroll ska vara den självklara platsen att börja på när någon behöver förstå, planera, utföra eller dokumentera egenkontroll.

## Övergripande princip

En gemensam visuell identitet, flera sidmallar optimerade för olika intentioner och mål, och en diskret kommersiell väg där nyttan alltid kommer före försäljningen.

Den viktigaste användarresan är:

**Hjälp först → bygg förtroende → låt användaren prova värdet → visa sedan att samma arbete kan göras ännu enklare i appen.**

## Appens roll

Appen ska inte ersättas av innehållet runt omkring. Allt publikt innehåll ska på sikt kunna bidra till appens tillväxt, men appen ska inte pressas fram på varje sida.

Besökaren ska först få det den kom för:

- information,
- svar,
- mallar,
- checklistor,
- verktyg,
- praktisk hjälp.

Appen ska finnas närvarande genom varumärket och naturliga nästa steg. På sidor med hög köpavsikt får den vara tydlig. På faktasidor och resurssidor ska den ofta vara diskret.

Wireframes ska inte automatiskt fyllas med stora appbanners, upprepade CTA-knappar, popup-försäljning eller appbudskap efter varje innehållssektion.

## Plattformens huvuddelar

Den långsiktiga strukturen är:

- `minegenkontroll.se` – publik plattform,
- `app.minegenkontroll.se` – själva arbetsverktyget.

För användaren ska övergången kännas sömlös:

- Logga in → `app.minegenkontroll.se/login`
- Skapa konto / Kom igång → `app.minegenkontroll.se/signup`

Samma varumärke, designsystem, typografi och grundläggande ton ska hålla ihop båda.

## Sidtyper och wireframes

Samma varumärke och designsystem ska användas överallt, men olika sidtyper ska ha olika wireframes beroende på sidans uppgift och besökarens avsikt.

Alla sidor ska inte byggas som variationer av startsidan.

Följande sidtyper behöver egna uppgiftsanpassade wireframes:

### Startsida

Ska förklara hela Min Egenkontroll och leda vidare till kunskap, resurser och appen. Appen får vara tydlig, men ska inte vara den enda vägen vidare.

### Ämnesnav

Ska ge överblick över ett område och leda vidare till guider, artiklar, mallar, checklistor och verktyg.

### Faktasida / artikel

Ska ge ett tydligt svar snabbt, sedan fördjupning, praktiska exempel, källor och relaterade frågor. Appen ska endast synas som ett diskret och relevant nästa steg.

### Sida med hög köpavsikt

Får vara tydligare lösnings- och konverteringsfokuserad eftersom besökaren redan söker efter en lösning.

### Mall / checklista / nedladdningsbar resurs

Ska ge nytta direkt. Användaren ska kunna förstå, använda, skriva ut eller ladda ner resursen. Först därefter kan appen visas som ett enklare sätt att göra samma arbete löpande.

### Verktyg / generator

Ska prioritera själva verktyget först, resultatet därefter och sedan en relevant väg vidare till appen.

### Resursbibliotek

Ska göra det enkelt att filtrera, förstå och hitta rätt mall, guide, checklista eller verktyg.

### Inloggning och signup

Ska vara så friktionsfria som möjligt och kännas som en sömlös fortsättning från hemsidan.

### Appens huvudflöden

Följande flöden ska ha egna uppgiftsanpassade wireframes:

- dagens kontroller,
- utföra kontroll,
- avvikelse,
- historik,
- delning vid tillsyn.

AI-synlighet ska inte få en separat AI-wireframe. Kraven för SEO och AI-citering ska byggas in i relevanta sidmallar, framför allt faktasidor, artiklar och ämnesnav.

## Grafisk riktning och designsystem

Den nya visuella identiteten ska signalera:

- lugn,
- precision,
- tydlighet,
- auktoritet,
- enkelhet.

Grundriktningen är:

- svart, vitt och grafit som bas,
- hög kontrast för snabb avläsning,
- färg används främst som information,
- grönt = klart/godkänt,
- gult eller orange = väntar / kräver uppmärksamhet,
- rött = avvikelse/problem.

Light mode och dark mode ska bygga på samma betydelser, men med anpassade färgvärden – inte enkel invertering.

Designen ska vara roligare och mer tillfredsställande än myndighetstjänster utan att bli lekfull eller oseriös.

## Centralt varumärkessystem

Varumärket ska ha en tydlig källa.

Arbetet ska omfatta inventering och central hantering av:

- logga,
- appikon,
- favicon,
- Apple touch-ikon,
- PWA-ikoner,
- Open Graph-/delningsbilder,
- PDF-loggor,
- eventuella e-post- och övriga brandytor.

Målet är en masterlogga och en masterikon som ligger till grund för nödvändiga varianter, med tydlig dokumentation av vad som används var.

Framtida byte av logga eller ikon ska inte kräva manuell jakt genom hela repon.

## Kunskapsplattform och gratis resurser

Plattformen ska kunna växa till en bred och trovärdig resurs inom egenkontroll.

Planerade delar:

- ämneskluster,
- cirka 200–500 relevanta artiklar över tid,
- mallbibliotek,
- checklistor,
- guider,
- FAQ,
- praktiska verktyg och generatorer,
- nedladdningsbara resurser.

Innehållet ska ha verkligt värde även för den som inte registrerar sig.

## SEO och AI-synlighet

SEO-strategin ska prioritera:

1. sökningar med hög köpavsikt,
2. därefter bredare informationssökningar.

Plattformen ska byggas för:

- tydlig informationsarkitektur,
- internlänkning,
- metadata,
- sitemap och indexering,
- mätning av vilka sidor och sökord som faktiskt driver appbesök, registreringar och betalande kunder.

AI-synlighet ska byggas in i relevanta sidmallar genom:

- tydliga svar,
- tydliga definitioner,
- citerbara fakta,
- källor,
- praktiska exempel,
- välstrukturerade ämnessidor.

Målet är att Min Egenkontroll ska kunna bli en naturlig källa när människor frågar AI-tjänster om egenkontroll.

## AI-integration

På sikt ska möjligheten undersökas att koppla användarens dokumentation till externa AI-tjänster, exempelvis via MCP, OpenAI Apps eller liknande integrationsmodeller.

Målet är inte i första hand att bygga en egen AI-assistent inne i appen, utan att användaren ska kunna ställa frågor om sin egen dokumentation via de AI-tjänster den redan använder.

Detta ligger efter den grundläggande strategiomläggningen och ska inte blockera tidigare faser.

## Teknisk målbild

Den planerade målbilden är ett gemensamt repo med tydligt separerade delar:

```text
apps/web
apps/app
packages/brand
```

Detta är en målbild, inte en beskrivning av nuvarande arkitektur.

Teknisk separation ska göras som ett avgränsat projekt efter att plattformens struktur och sidtyper är tillräckligt tydliga. Ingen permanent pivot-branch ska användas.

## Befintliga publika sidor

Befintliga SEO- och kunskapssidor ska inte tas bort eller byggas om från grunden utan inventering.

Varje sida ska bedömas som:

- behåll,
- förbättra,
- flytta till ny sidtyp,
- slå ihop med annan sida,
- ta bort och omdirigera.

Befintliga värdefulla URL:er och innehåll ska bevaras när det är möjligt. Borttagning ska ske med rätt omdirigering när en motsvarande sida finns.

## Genomförandeordning

Arbetet ska genomföras i följande ordning:

### Fas 1 – Styrning

- detta strategidokument,
- minimala uppdateringar av styrande AI-/repodokument,
- övergripande Pivot-Epic.

### Fas 2 – Inventering

- befintliga publika sidor och URL:er,
- innehåll och framtida sidtyp,
- routing, internlänkning och metadata,
- brandfiler och användningsställen,
- teknisk gräns mellan webb och app.

### Fas 3 – Beslut

- slutlig positionering och varumärkeslöfte,
- plattformens informationsstruktur,
- sidtyper,
- visuell identitet,
- teknisk målstruktur.

### Fas 4 – Wireframes

I första hand:

1. faktasida,
2. ämnesnav,
3. mall/checklista,
4. verktyg,
5. resursbibliotek,
6. startsida,
7. login/signup,
8. appens huvudflöden.

### Fas 5 – Teknisk grund

- separera webb och app,
- skapa gemensamt brand- och designsystem,
- koppla domäner och sömlöst auth-flöde.

### Fas 6 – Första kompletta minisystemet

Bygg först en liten men komplett version:

- en startsida,
- ett ämnesnav,
- två till tre faktasidor,
- en mall/checklista,
- ett verktyg,
- ett resursbibliotek,
- login/signup.

Testa helheten innan den skalas.

### Fas 7 – Migrera befintligt innehåll

Flytta successivt befintliga publika sidor till rätt nya sidmallar och struktur.

### Fas 8 – Skala

Först därefter:

- fler ämneskluster,
- fler artiklar,
- fler mallar,
- fler verktyg,
- systematisk SEO och AI-synlighet,
- utökad mätning,
- AI-integration.

## Parallellt appspår

Appen får inte frysas under strategiomläggningen.

Buggar och viktig produktutveckling fortsätter separat:

- kritiska buggar och data-/auth-risker prioriteras direkt,
- tydliga användbarhetsproblem fixas löpande,
- kosmetisk finputsning i den gamla visuella identiteten kan vänta om den snart ska ersättas.

Normalt ska det finnas högst:

- en aktiv större pivotuppgift,
- ett separat appspår för buggar eller viktig produktutveckling.

Varje större arbete ska ha tydlig issue, egen branch och PR.

## Beslutsregel

När en ny idé eller uppgift uppstår ska den bedömas mot tre frågor:

1. Hjälper detta användaren med ett verkligt problem inom egenkontroll?
2. Stärker detta plattformen eller appen enligt denna strategi?
3. Är detta rätt sak att göra i den nuvarande fasen?

Om svaret på fråga 3 är nej ska uppgiften dokumenteras för senare i stället för att störa ordningen.
