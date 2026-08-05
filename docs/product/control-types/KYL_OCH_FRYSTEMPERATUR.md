# Kyl- och frystemperatur

**Produktstatus:** UX beslutad 2026-08-04\
**Grundflöde:** Snabb mätning\
**Implementation:** Första produktionsetappen hanteras i [GitHub-issue #400](https://github.com/robinstromberg/Egenkontroll/issues/400); återstående målbild delas upp i senare etapper

Detta dokument är den beslutade produkt- och UX-målbilden för Kyl- och frystemperatur. Dagens fungerande inline-flöde ska utvecklas vidare, inte ersättas av ett helt nytt arbetssätt.

## Syfte och kontrollpunkter

Varje kyl, frys, kyldisk eller annan relevant temperaturstyrd enhet är en egen kontrollpunkt. Alla aktiva enheter visas samtidigt i en lista och får ett numeriskt temperaturvärde eller en uttrycklig status `Ej i drift`.

Appen jämför värdet med verksamhetens beslutade åtgärdsgräns. Den ska inte presentera en generell temperaturgräns som om samma lagkrav gällde för alla verksamheter, produkter och processer.

## Beslutad avgränsning

I denna produktetapp ingår:

- den dagliga kontrollen,
- avvikelsehantering,
- sparbekräftelse,
- historik och tillsynsunderlag,
- nödvändiga egenskaper för att lägga till, redigera, pausa och arkivera en enhet.

En generell omarbetning av kontrolltypseditorn ingår inte. Kraven nedan beskriver vad som behöver kunna ställas in, inte en ny komplett editorlayout.

## Nödvändiga inställningar

| Inställning | Effekt i vardagen |
|---|---|
| Namn | Identifierar enheten för personal och i historik. |
| Typ | Anger exempelvis kyl, frys, kyldisk eller annan temperaturstyrd enhet. |
| Placering | Hjälper användaren hitta rätt fysisk enhet. |
| Åtgärdsgräns | Avgör när appen markerar värdet som avvikande; kan vara högsta, lägsta eller intervall. |
| Mätmetod | Visar hur temperaturen ska kontrolleras. |
| Kort instruktion | Visas direkt vid kontrollpunkten. |
| Schema | Avgör när hela kontrolltypen visas under Dagens kontroller. |

Schemat gäller den sammanhållna temperaturkontrollen. En ny enhet ärver kontrolltypens schema och får inte ett eget parallellt standardschema.

En liten förhandsvisning kan senare visa hur kontrollpunkten möter personalen, men en sådan generell editorlösning ska inte byggas inom denna kontrolltypsuppgift.

## Dagens kontroller

Nuvarande ingång och visuella grund ska behållas. Kortet för kontrolltypen visar:

- `Kyl- och frystemperatur`,
- när kontrollen ska vara utförd,
- antal aktiva enheter,
- status: inte påbörjad, pågående, klar eller sen.

Hela kortet öppnar kontrollen.

## Utföra kontrollen

Alla aktiva enheter visas i en gemensam lista. Varje rad visar:

- namn,
- placering,
- verksamhetens åtgärdsgräns,
- mätmetod eller kort instruktion,
- temperaturfält med `°C`,
- alternativet `Ej i drift`.

Exempel:

| Enhet | Åtgärdsgräns | Temperatur |
|---|---:|---:|
| Kyl 1 · Köket | Högst +8 °C | `4,2` |
| Kyl 2 · Lagret | Högst +8 °C | `5,1` |
| Frys lager | Högst −18 °C | `−20,3` |

Inmatningen ska:

- börja tom och aldrig tolkas som `0 °C`,
- stödja negativa tal samt både komma och punkt som decimaltecken,
- låta tangentbordets nästa-knapp flytta fokus till nästa temperaturfält,
- visa status med text och symbol, med färg som kompletterande signal,
- bevara påbörjade värden lokalt om användaren tillfälligt lämnar skärmen.

Längst ned visas hur många kontrollpunkter som är klara och en gemensam knapp `Spara kontroll`. Normalfallet ska inte kräva en separat OK-knapp per enhet eller ett allmänt kommentarsfält.

Kontrollen får inte slutföras förrän varje aktiv enhet har ett temperaturvärde eller uttryckligen har markerats `Ej i drift` med orsak.

## Ej i drift

`Ej i drift` används när enheten inte används vid kontrolltillfället och inga relevanta livsmedel förvaras i den.

Användaren väljer:

- Tom och avstängd
- Tillfälligt ur bruk
- Annan orsak

Fritext visas endast för `Annan orsak`.

Appen ska samtidigt förklara att ett temperaturproblem inte ska döljas som `Ej i drift`: då registreras den uppmätta temperaturen och avvikelsen dokumenteras.

## Avvikelse

När ett värde ligger utanför verksamhetens åtgärdsgräns öppnas avvikelsehanteringen direkt under berörd enhet. Övriga kontrollpunkter påverkas inte.

Texten ska vara neutral:

> Värdet ligger utanför företagets åtgärdsgräns.

Användaren dokumenterar följande.

### Hur varorna hanterades

- Inga varor påverkades
- Varorna flyttades
- Varorna kasserades
- Annan åtgärd

### Vad som gjordes med enheten

- Enheten justerades
- Enheten stängdes av
- Service kontaktades
- Ingen åtgärd behövdes
- Annan åtgärd

En kontrollmätning ska kunna anges. Därefter väljer användaren:

- `Löst`
- `Behöver följas upp`

Det senare skapar en öppen avvikelse. Fritext krävs när `Annan åtgärd` väljs eller snabbvalen inte ger tillräcklig förklaring. Det ursprungliga temperaturvärdet ska alltid ligga kvar.

## Sparbekräftelse

Den befintliga lilla animationen, placeringen och känslan ska behållas. Först när kontrollen faktiskt har sparats visas exempelvis:

> **Kyl- och frystemperatur sparad**\
> Robin Strömberg · 4 augusti 2026 kl. 15.42\
> Alla 3 kontrollpunkter godkända

Möjliga resultatrader är bland annat:

- `2 godkända · 1 ej i drift`
- `1 avvikelse dokumenterad och löst`
- `1 avvikelse behöver följas upp`

Checkanimationen bekräftar lagringen, inte att alla temperaturer var godkända. Bekräftelsen ska inte kräva ett extra knapptryck.

Vid misslyckad lagring visas ingen lyckad bekräftelse och användarens uppgifter ligger kvar.

### Offline

Vid säker lokal lagring visas i stället:

> **Sparad på den här enheten**\
> Robin Strömberg · 4 augusti 2026 kl. 15.42\
> Synkroniseras automatiskt när anslutningen är tillbaka

Synkroniseringen ska ske automatiskt. Om appen är helt stängd sker den senast nästa gång appen öppnas. Användaren ska bara behöva agera om synkroniseringen misslyckas. Utförandetid och senare synkroniseringstid ska hållas isär.

## Hantera enheter

### Lägg till

`+ Lägg till kyl/frys` ska ge åtkomst till de nödvändiga inställningarna ovan. Varje fält ska kort förklara hur det påverkar den dagliga kontrollen.

### Redigera

Ändringar gäller framtida kontroller. En ändrad åtgärdsgräns kräver en kort ändringsorsak och skapar en ny version. Äldre kontroller fortsätter visa tidigare namn, instruktioner och gränsvärden.

### Pausa

Paus används när enheten tillfälligt inte ska ingå i kommande kontroller. Orsak och tidpunkt registreras och enheten kan återaktiveras.

### Arkivera

Arkivering används när enheten permanent tas bort från den aktiva verksamheten. Bekräftelsen ska förklara:

> Enheten tas bort från framtida kontroller men finns kvar i historiken.

Historiska kontrollposter får inte raderas.

## Historik och tillsyn

Historikens nuvarande placering och visuella grund behålls. Översikten ska för varje planerad kontroll visa:

- datum och verklig tidpunkt,
- utförare,
- sammanfattad status,
- om kontrollen utfördes i tid, sent eller missades.

Filtrering ska stödja:

- period,
- enhet,
- utförare,
- godkänd eller avvikande,
- öppen avvikelse,
- sen eller missad kontroll.

Detaljvyn ska per enhet visa:

- uppmätt temperatur eller `Ej i drift`,
- åtgärdsgränsen som gällde då,
- dåvarande namn, placering, mätmetod och instruktion,
- utförare och verklig tidpunkt,
- avvikelse, omedelbara åtgärder och uppföljning,
- mallversion,
- eventuell senare rättelse.

En missad kontroll ligger kvar i historiken. En förklaring får läggas till, men kontrollen får inte efterregistreras som om den utförts i tid.

En sparad kontroll får inte skrivas över. En rättelse läggs till med ursprungligt värde, nytt värde, orsak, användare och tidpunkt.

## Nulägesobservationer från `main`

Nuläget granskades på commit `d7ca6c9`.

Det som ska behållas:

- ingången från Idag,
- den gemensamma listan med alla kylar och frysar,
- inline-inmatning och en gemensam sparning,
- avvikelse vid berörd kontrollpunkt,
- automatisk registrering av datum, tid och användare,
- historiska snapshots för kontrollpunkter och fält,
- den befintliga sparanimationen.

Kända gap mot målbilden:

- ett tomt temperaturfält kan tolkas som `0 °C`,
- decimalsteg är inte uttryckligt säkrat för alla webbläsare,
- `Ej i drift` saknas,
- avvikelsehanteringen bygger främst på fri åtgärdstext,
- löst respektive öppen uppföljning framgår inte tillräckligt i sparbekräftelsen,
- historiken visar inte hela den historiska kontexten och alla beslutade filter,
- sen och missad kontroll, spårbar rättelse och tydlig mallversion saknas,
- en kontroll kan inte sparas säkert och synkroniseras automatiskt offline.

## Godkännandekriterier för framtida implementation

Produktmålbilden är uppfylld när:

- en normal kontroll kräver öppning, temperaturinmatning och en gemensam sparning,
- användaren förstår vilken fysisk enhet och mätmetod varje rad avser,
- ingen aktiv kontrollpunkt kan missas omedvetet,
- tomma värden aldrig blir `0 °C`,
- en avvikelse inte kan sparas utan relevant åtgärd,
- sparbekräftelsen visar kontrolltyp, utförare, tidpunkt och resultat,
- offlinearbete synkroniseras utan rutinmässig användaråtgärd,
- tillsynspersonen kan förstå både vad som skulle göras och vad som faktiskt gjordes,
- tidigare inställningar, pausade enheter och arkiverade enheter finns kvar i historiken,
- dagens visuella uttryck och sparanimation känns igen.

Denna lista är underlag för en senare GitHub-issue. Den är inte i sig en implementationsuppgift.
