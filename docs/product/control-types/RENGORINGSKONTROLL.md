# Rengöringskontroll

Datum: 2026-08-07  
Primärt grundflöde: Checklista/rond  
Produktstatus: Implementationsklar  
Implementationsberoende: den gemensamma Kontrolltyper v2-grunden i GitHub issue #405

## Syfte

Rengöringskontrollen ska samla minsta möjliga mängd information som ändå gör att verksamheten kan visa att den har ändamålsenliga rengöringsrutiner, följer dem, kontrollerar resultatet och hanterar avvikelser.

Kontrolltypen är en **resultatkontroll av förutbestämda rengöringspunkter**, inte en detaljerad arbetslogg. Den dokumenterar att en punkt kontrollerades och om den uppfyllde verksamhetens eget kriterium vid kontrolltillfället.

Metod, ansvar, frekvens och andra rutinuppgifter ska inte behöva matas in på nytt av personalen varje gång kontrollen utförs.

## Innehållsprincip

Min Egenkontroll ska inte ge intryck av att en generell lista med rengöringspunkter är myndighetsgodkänd eller komplett för alla verksamheter.

Därför gäller:

- inga förifyllda startförslag på rengöringspunkter,
- inget förifyllt `Godkänt när …`,
- ingen förifylld `Instruktion`,
- inget påhittat punktvis schema,
- verksamheten skapar och anpassar sina egna punkter.

Neutral hjälptext får förklara vilken sorts information ett fält efterfrågar. Konkreta råd, kriterier, frekvenser, metoder eller andra sakpåståenden som kan påverka egenkontrollen ska följa projektets innehålls- och faktagranskningsregler.

## Två lager

### 1. Rutin och konfiguration

Owner/admin definierar vid behov:

- vad som ska kontrolleras,
- var punkten finns,
- hur ofta den ska kontrolleras,
- vilket kriterium verksamheten använder för att avgöra om punkten är godkänd,
- särskild instruktion när sådan behövs,
- särskilt ansvar när framtida modell kräver det.

### 2. Utförande

Personalens normalflöde ska vara minimalt:

1. öppna Rengöringskontroll från `Idag`,
2. se de punkter som är aktuella för tillfället, grupperade per plats,
3. normala punkter står förvalda som `OK` i ett väntande UI-tillstånd,
4. ändra endast punkter som har avvikelse eller är `Ej aktuell`,
5. bekräfta hela kontrollen en gång,
6. systemet sparar faktisk användare, tid, verksamhet, definition/version, punkter och resultat.

Förvalt `OK` betyder **inte** att kontrollen redan är utförd. Resultaten blir dokumentation först när användaren gör den gemensamma sparbekräftelsen.

## Kontrollpunkten

### Obligatoriska fält

#### Var finns det?

Hjälptext exakt:

> Ange platsen, till exempel Kök eller Diskrum.

#### Vad ska kontrolleras?

Hjälptext exakt:

> Ange ytan, utrustningen eller delen, till exempel Skärmaskin eller Arbetsbänk.

Exemplen i de två hjälptexterna beskriver vilken typ av svar fältet efterfrågar. De är inte en färdig rekommenderad rengöringslista.

#### Godkänt när …

Etikett exakt:

> Godkänt när …

Hjälptext exakt:

> Beskriv vad som ska vara uppfyllt för att punkten ska kunna markeras som godkänd.

Fältet är tomt från början. Min Egenkontroll ska inte föreslå eller förifylla verksamhetens kriterium.

#### Hur ofta?

Standardvärdet är:

> Samma som rengöringskontrollen

Detta ska vara **länkad arvlogik**, inte en engångskopia. Om kontrolltypens grundschema ändras ska en punkt som fortfarande står på `Samma som rengöringskontrollen` följa det nya grundschemat. En uttrycklig punktavvikelse från grundschemat påverkas inte.

V1 ska kunna uttrycka:

- Samma som rengöringskontrollen
- Varje dag
- Vissa veckodagar
- Varje vecka med vald veckodag
- Varje månad med vald dag

Eget godtyckligt intervall behöver inte byggas i v1 om inte ett konkret behov visas.

### Valfritt fält

#### Instruktion

Fält: `Instruktion`  
Status: valfri

Hjälptext exakt:

> Beskriv hur kontrollen ska utföras när en särskild instruktion behövs.

Fältet är tomt från början.

## Aktivering

För en **ny eller framtida v2-definition** får Rengöringskontrollen inte aktiveras utan minst en komplett aktiv kontrollpunkt.

En punkt är komplett när följande finns:

- `Var finns det?`
- `Vad ska kontrolleras?`
- `Godkänt när …`
- giltigt `Hur ofta?` (standardvärdet räcker)

`Instruktion` är valfri.

En ny tom eller ofullständig v2-definition ska inte kunna presenteras för personalen som en utförbar rengöringskontroll.

### Befintlig aktiv legacy-kontroll

Aktiveringskravet ovan får inte användas för att plötsligt stänga av en redan aktiv äldre Rengöringskontroll som saknar nya v2-fält.

- Legacy-kontrollen fortsätter vara utförbar medan owner/admin kompletterar en framtida v2-definition.
- Befintliga punkter får inte automatiskt få påhittade `Godkänt när …`, instruktioner eller scheman.
- Befintliga punkter och historiska kontroller får inte destruktivt raderas eller byta betydelse.
- När en komplett v2-definition aktiveras gäller den för framtida kontroller.
- Historiken före v2-cutover fortsätter visa sin tidigare snapshot/legacy-kontext.

Den gemensamma övergångsmodellen styrs av `CONTROL_TYPES_V2_CONTRACT.md` och #405.

## Redigering

Rengöringskontrollen ska använda den gemensamma Kontrolltyper v2-modellen i `CONTROL_TYPES_V2_CONTRACT.md`.

Målbild:

> Kontrolltyp → lista grupperad per plats → öppna en punkt i ett tydligt redigeringsläge → spara → tillbaka till listan.

Den gamla modellen där ett nytt redigeringskort fälls in inuti samma kontrollpunkt ska inte vara v2-mönstret.

Owner/admin får redigera. Staff får inte administrativa redigeringsåtgärder.

I dagligt utförande får owner/admin senare ha en diskret kontextuell `•••`-åtgärd för snabbredigering av samma underliggande punkt. Det ska återanvända samma redigeringsmodell, inte skapa ett separat system.

Ändringar gäller framtida kontroller. Tidigare dokumentation och snapshots får inte skrivas om.

## Dagligt utförande

Punkterna grupperas per plats. Platsen ska normalt visas som grupprubrik och inte upprepas på varje rad.

Exempel på struktur (illustrativ, inte startinnehåll):

```text
KÖK

Skärmaskin
Godkänt när … [verksamhetens kriterium]
[OK] [Avvikelse] [Ej aktuell]

Arbetsbänk
Godkänt när … [verksamhetens kriterium]
[OK] [Avvikelse] [Ej aktuell]
```

Regler:

- visa endast punkter som är aktuella enligt sitt effektiva schema,
- visa punktens namn och dess eget `Godkänt när …`,
- visa instruktion endast när sådan finns,
- `OK` är förvalt som väntande normalvärde,
- en gemensam knapp avslutar hela kontrollen.

Knapptext:

> Bekräfta och spara

Förklarande text nära sparningen exakt:

> Genom att spara bekräftar du att punkterna har kontrollerats. Punkter som inte markerats på annat sätt registreras som godkända.

## Avvikelse

`Avvikelse` betyder att kontrollen utfördes men att verksamhetens kriterium inte var uppfyllt.

När användaren väljer `Avvikelse` öppnas ett kompakt inlineflöde vid den berörda punkten.

Fråga:

> Vad gjordes?

En åtgärd måste dokumenteras innan kontrollen kan sparas. Användaren ska också ange om avvikelsen:

- `Åtgärdad direkt`, eller
- `Behöver följas upp`.

Foto är valfritt när det tillför dokumentationsvärde.

Den ursprungliga avvikelsen ska alltid finnas kvar i historiken. `Behöver följas upp` ska skapa en synlig öppen uppföljning utan att originalresultatet ändras.

### Snabbval

Snabbval kan användas för att minska skrivande, men de är en UI-optimering och får inte införa ogrundade sakpåståenden. Exakta snabbval ska vara neutrala, faktagranskade när de innebär sakråd och uttryckligen godkända innan de blir styrande standardcopy.

Illustrativa snabbval från produktarbetet ska därför inte behandlas som bindande startinnehåll utan separat copybeslut.

## Ej aktuell

`Ej aktuell` används endast när punkten tillfälligt inte är relevant för kontrolltillfället, exempelvis att den inte är i bruk eller tillfälligt är borttagen/avstängd.

Det får inte användas som ersättning för att något var smutsigt, glömdes, inte hanns med eller inte kunde kontrolleras på grund av ett problem.

Snabbanledningar:

- `Inte i bruk`
- `Tillfälligt borttagen/avstängd`
- `Annan anledning`

`Annan anledning` öppnar fritext. Orsak, användare, faktisk tid och version ska bevaras i dokumentationen.

En framtida signal om att samma punkt ofta är `Ej aktuell` ska vara owner/admin-styrd och kan föreslå schemaändring eller paus. Exakt tröskel är en generell produktfråga och ingår inte i första implementationen av Rengöringskontroll.

## Påbörjad men inte sparad kontroll

V1 har ingen delvis sparad rengöringskontroll som historisk dokumentation.

- hela aktuella rengöringskontrollen sparas gemensamt,
- väntande `OK` är inte dokumentation före sparning,
- om användaren lämnar vyn ska inget varningsflöde göra ett halvtillstånd till ett eget koncept,
- inmatat arbete ska ändå kunna bevaras under den pågående användarsessionen så att användaren kan återvända,
- tills slutlig sparning lyckats räknas kontrollen inte som utförd,
- efter lyckad sparning rensas det lokala utkastet.

## Missad eller försenad kontroll

Missad kontroll och avvikelse är olika saker:

- `Avvikelse` = kontrollen utfördes men kriteriet uppfylldes inte.
- `Ej utförd` = det planerade kontrolltillfället dokumenterades inte enligt schema.

Ett missat tillfälle får inte automatiskt bli en avvikelse eller kunna bakdateras som om det utförts i tid.

Missade/försenade tillfällen ska lösas genom den gemensamma schematillfällesmodellen i Kontrolltyper v2, inte genom rengöringsspecifik speciallogik.

För återkommande dagliga punkter ska gårdagens missade tillfälle ligga kvar historiskt som `Ej utförd`, medan dagens schema skapar dagens nya tillfälle. För mer sällan förekommande kontroller kan ett försenat tillfälle fortsatt vara utförbart med både planerad och faktisk tid bevarad.

## Sparbekräftelse

Efter bekräftad serverlagring visas ett kvitto. Checkmark betyder att dokumentationen är sparad, inte att en myndighet eller systemet har godkänt verksamheten.

Rubrik:

> Rengöringskontroll sparad

Metadata:

> Utförd av [namn] · [datum] [tid]

Sammanfattningen är dynamisk, exempelvis:

- `Alla 8 punkter godkända`
- `7 godkända · 1 ej aktuell`
- `7 godkända · 1 avvikelse åtgärdad`
- `6 godkända · 1 ej aktuell · 1 behöver följas upp`

Om en öppen uppföljning skapats ska berörd punkt/plats kunna visas med en tydlig väg till uppföljningen.

Tiden ska komma från den sparade servergenererade kontrolltidpunkten enligt #402, inte från klientens klocka.

## Historik

Rengöringskontrollen ska använda gemensam historik och snapshots. Den större generella omdesignen av Historik är separat och ska inte blockera kontrolltypen.

List-/sammanfattningsnivån bör kunna visa:

- kontrolltyp,
- datum/tid,
- utförare,
- sammanfattat resultat,
- eventuell öppen uppföljning.

Detaljen ska kunna svara på vad som gällde och vad som hände, inklusive:

- punkt,
- plats,
- `Godkänt när …` som gällde vid utförandet,
- eventuell instruktion som gällde,
- resultat (`Godkänd`, `Avvikelse`, `Ej aktuell`, och när generella schemamodellen finns `Ej utförd`),
- orsak till `Ej aktuell`,
- avvikelse och dokumenterad åtgärd,
- direkt åtgärdad/uppföljning,
- eventuella bilder,
- användare och faktisk tid,
- relevant versions-/snapshotkontext.

Godkända punkter ska finnas i detaljen men behöver inte dominera historiköversikten.

Rapporter, export och inspektörsvy ska presentera samma historiska sanning. För punktbaserad export är en rad per punkt en lämplig riktning när formatet kräver tabulär data.

## Visuellt kontrakt

Alla nya eller ombyggda rengöringsvyer omfattas av `AGENTS.md`, `docs/strategy/VISUAL_SYSTEM_PLAN.md` och `CONTROL_TYPES_V2_CONTRACT.md`.

Kontrolltypen får inte skapa egna färg-, tema-, brand-, ikon- eller komponentpaletter. Ny UX får vara strukturellt annorlunda än legacy-editorn men ska byggas av den gemensamma visuella grunden.

## Avgränsningar och separata spår

Ingår inte som rengöringsspecifik implementation:

- den stora generella History-UX-omdesignen,
- notifierings-/påminnelsemotorn (#403),
- egen tidskälla eller tidszonshantering (#402 är gemensam),
- en unik modell för missade kontroller,
- en separat rengöringseditor utanför Kontrolltyper v2-mönstret,
- myndighetsliknande generella startförslag på rengöringspunkter.
