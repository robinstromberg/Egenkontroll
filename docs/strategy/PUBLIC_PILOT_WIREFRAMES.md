# Wireframes för publik HACCP-pilot

Issue: #251
Datum: 2026-07-10
Bygger på: Epic #243, issue #247, PR #248, PR #250, `AGENTS.md`, `docs/strategy/PIVOT.md`, `docs/strategy/CURRENT_STATE_INVENTORY.md`, `docs/strategy/CONTENT_MIGRATION_MAP.md` och `docs/strategy/PHASE_3_DECISIONS.md`.

## Syfte och avgränsning

Detta dokument beskriver ett gemensamt, implementationsneutralt wireframesystem för den publika HACCP-piloten: **HACCP och riskstyrning för små livsmedelsverksamheter**.

Det ska ge nästa uppgift ett konkret underlag för visuella mockups och därefter teknisk separation och implementation. Det låser inte slutlig marknadsföringscopy, ny information, routes, metadata, teknik, auth-lösning eller arkitektur.

Följande är låst i detta dokument:

- Plattformslöftet är: **Allt du behöver för att förstå, göra och dokumentera egenkontroll.**
- Hjälp och faktisk nytta kommer före appförsäljning.
- Appen är en relevant arbetsyta för löpande dokumentation, men inte ett fullskaligt HACCP-system.
- Befintliga URL:er bevaras. Verktygets eventuella framtida URL beslutas inte här.
- Varje sidtyp har en egen uppgift och egen hierarki. De får inte bli variationer av samma startsida.
- Mobil är utgångspunkt. Desktop ska utöka överblick och arbetsyta utan att ändra läsordningen.

Piloten omfattar:

| Sidtyp | Pilotens yta |
| --- | --- |
| Startsida | `/` |
| Ämnesnav | `/haccp-sma-livsmedelsforetag` |
| Faktasida / artikel | `/faroanalys-livsmedel`, `/avvikelser-korrigerande-atgarder-livsmedel`, `/verifiering-egenkontroll-livsmedel` |
| Mall / checklista / resurs | `/seo/kontrollplan.html` |
| Verktyg / generator | Faroanalysverktyg som koncept; ingen ny URL beslutas |
| Resursbibliotek | `/kunskapsbank` |
| Appingång | `/login`, `/signup` |

## Gemensamma principer

### Sidtypernas olika jobb

| Sidtyp | Huvudfråga från besökaren | Sidans jobb | Dominerande första skärm |
| --- | --- | --- | --- |
| Startsida | Var börjar jag och vad kan Min Egenkontroll hjälpa mig med? | Visa plattformens vägar och leda till rätt hjälp. | Plattformslöfte och behovsval. |
| Ämnesnav | Var hör mitt problem hemma och vad gör jag sedan? | Orientera inom HACCP och visa arbetskedjan. | Ämneskarta och börja-här-val. |
| Faktasida | Vad betyder detta och hur gör jag? | Svara på en avgränsad fråga med praktisk vägledning. | Kort svar och läsordning. |
| Mall / checklista | Hur kan jag använda detta i mitt eget arbete? | Leverera ett arbetsdokument som går att använda direkt. | Arbetsbladet. |
| Verktyg | Hur kan jag göra ett första strukturerat utkast? | Leda genom en bedömning och visa ett granskningsbart resultat. | Stegflödet. |
| Resursbibliotek | Var hittar jag rätt hjälp? | Söka, filtrera och öppna rätt resurs. | Sökning, filter och resultat. |
| Login / signup | Hur kommer jag in i eller börjar använda appen? | Få användaren vidare med minsta möjliga friktion. | Rätt formulär och rätt kontext. |

### Kommersiell återhållsamhet

| Nivå | Var appen får vara | Regel |
| --- | --- | --- |
| Tydlig | Startsida, `/login`, `/signup` och befintliga hög-intent-sidor utanför piloten. | Appen kan vara en tydlig väg, men kunskap och resurser ska fortfarande vara synliga på startsidan. |
| Måttlig | Ämnesnav, mall/checklista, verktyg och resursbibliotek. | Appen visas som naturligt nästa steg efter orientering, resurs eller resultat. |
| Diskret | Faktasidor. | Ett kompakt och situationsrelevant nästa steg efter saksvaret, aldrig i ingressen eller som återkommande banner. |

Följande ska inte användas som standard på någon av pilotens publika ytor:

- stora appbanners före den utlovade nyttan,
- flera likadana signup-handlingar på samma sida,
- popup-försäljning,
- registreringsvägg för fakta, mall, verktygsresultat eller resursbibliotek,
- prisblock på faktasidor, nav eller resursytor,
- påståenden om komplett HACCP-stöd.

### Mobil, tillgänglighet och visuell riktning

Alla wireframes utgår från följande:

- tydlig läsordning med en huvudkolumn på mobil,
- stora tryckytor, minst 44 × 44 px för meny- och ikonhandlingar,
- permanenta fältetiketter och textbaserade statusar; färg får aldrig bära ensam betydelse,
- hög kontrast i både light och dark mode,
- lugn och lättskannad typografi för användare som är stressade eller ovana vid digitala verktyg,
- varm vit, svart och grafit som bas; grönt, gult/orange och rött används funktionellt,
- inga horisontellt scrollande innehållslistor, täckande sticky-CTA:er eller dold huvudinformation i accordions,
- semantisk rubrikhierarki, synligt fokus, tangentbordsnavigering och logisk fokusordning.

Desktop får använda bredare ytor för orientering, filter, sammanfattningar och exempel. Den mobila blockordningen ska dock alltid vara den semantiska läsordningen.

## Gemensam webbstruktur

### Global header och navigation

Den publika headern ska vara gemensam utan att göra alla sidor lika. Den ska alltid visa varumärket, innehållsvägarna och appingångarna.

Desktopordning:

```text
Logotyp
Kunskap | Mallar och checklistor | Verktyg | Utbildning | Referenser och källor | Appen
Logga in | Kom igång
```

`Kunskap`, `Mallar och checklistor`, `Verktyg`, `Utbildning`, `Referenser och källor` och `Appen` är innehålls- eller destinationsingångar. I denna fas definieras deras plats i navigationen, inte deras slutliga URL:er. `Logga in` och `Kom igång` är handlingar och ska visuellt skiljas från innehållsnavet.

- Aktuell position markeras både visuellt och semantiskt.
- Startsidan har ingen breadcrumb.
- Ämnesnav, faktasidor, resurser och verktyg har breadcrumb när den hjälper orienteringen.
- Headern får förenklas vid smal desktopbredd, men innehållsdelarna får inte döljas bakom otydliga samlingsnamn.

### Mobil navigation

```text
[Logotyp]                              [Logga in] [Meny]

Meny, när den är öppen:
Kunskap
Mallar och checklistor
Verktyg
Utbildning
Referenser och källor
----------------------
Appen
Logga in
Kom igång
```

- Menyn är en fokuserad panel med synlig stängknapp, aktuell position och tydliga länkar i en plan lista.
- Fokus flyttas in i panelen när den öppnas, hålls där och återgår till menyknappen när den stängs.
- Escape, tangentbord, zoom, skärmläsare samt light och dark mode ska fungera utan alternativ navigationsväg.

### Footer

Footern är en orienterings- och förtroendeyta, inte en andra kampanjsektion.

| Grupp | Innehåll |
| --- | --- |
| Förstå | Kunskap, HACCP-nav, resursbibliotek |
| Göra | Mallar och checklistor, Verktyg, Utbildning |
| Dokumentera | Appen, Kom igång, Logga in |
| Förtroende | Referenser och källor, faktagranskning, integritet, villkor |
| Varumärke | Kort neutral beskrivning och framtida kontakt/support när destinationen är beslutad |

### Breadcrumb, relaterat och ämneshierarki

Ämneshierarkin för piloten ska vara synlig och konsekvent:

```text
Kunskap / HACCP och riskstyrning / Faktasida eller resurs
```

- `/kunskapsbank` länkar till HACCP-navet som klustrets ingång.
- HACCP-navet länkar till faktasidorna, `/seo/kritiska-gransvarden.html`, `/seo/kontrollplan.html` och verktygskandidaten, med tydlig resurstyp.
- Varje faktasida länkar tillbaka till navet, visar ett sekventiellt nästa steg och därefter ett begränsat urval närliggande stöd.
- Mall och verktyg länkar direkt till varandra samt till relevanta faktasidor.
- Relaterade länkar ska förklara varför de är relevanta. En odifferentierad vägg av likvärdiga kort ersätter inte ämneshierarki.

### Samma system, olika wireframes

Alla ytor använder samma varumärkesgrund, typografi, semantiska färger, formulärspråk, korta faktastatus och förtroendeprinciper. De skiljs åt genom sin dominerande funktion:

- startsida: vägval,
- nav: arbetskarta,
- artikel: läsning och förståelse,
- resurs: arbetsblad,
- verktyg: genomförande och resultat,
- bibliotek: sökning och urval,
- appingång: fokuserat formulär.

## Startsida `/`

### Uppgift

| Dimension | Wireframebeslut |
| --- | --- |
| Besökarens huvudsakliga avsikt | Förstå erbjudandet och hitta rätt väg till kunskap, praktisk resurs eller app. |
| Sidans uppgift | Vara plattformens vägvisare, inte en lång faktasida, ett bibliotek eller en traditionell SaaS-landningssida. |
| Vad besökaren får före appen | Plattformslöftet, tydliga behovsvägar och ett konkret inträde till HACCP-pilotens hjälp. |
| Appens synlighet | Tydlig, men jämställd med kunskap och resurser. |
| Primär handling | Hitta rätt hjälp. |
| Naturligt nästa steg | HACCP-nav, resursbibliotek, kontrollplansresurs, framtida faroanalysverktyg eller hög-intent-sidan `/digital-egenkontroll-livsmedel`. |

### Mobil wireframe

```text
1. Skip-link + global header
2. Plattformslöfte
   - kort målgruppsavgränsning
   - en primär väg till hjälp och en sekundär väg till appen
3. Behovsväljare: Förstå | Göra | Dokumentera
4. HACCP-pilotens startpunkt
   - länk till /haccp-sma-livsmedelsforetag
5. Plattformens hjälpresurser
   - Kunskap | Mallar och checklistor | Verktyg | Utbildning
6. Begränsat urval av konkreta pilotresurser
7. Appen som arbetsyta för kontroller, avvikelser och historik
8. Förtroendeblock: källprincip och faktagranskning
9. Samlad nästa-steg-yta
10. Footer
```

Behovsväljaren ska alltid leda till en faktisk plattformsdel. Den får inte vara dekorativa segment utan fungerande orientering.

### Desktopanpassning

Behåll blockordningen. Hero får ha två kolumner där den andra visar ett konkret, avgränsat appflöde, men plattformslöftet och behovsvalet ska dominera. Behovsväljaren och resursvägarna kan visas i tre eller fyra kolumner. Upprepa inte samma CTA i varje kolumn.

### SEO, AI och förtroende

- Reservera plats för en kort, synlig definition av Min Egenkontroll och de behov plattformen täcker.
- Använd beskrivande internlänkar och en logisk rubrikhierarki.
- Ett begränsat frågeblock får svara på verkliga orienteringsfrågor, men startsidan ska inte försöka besvara detaljerade HACCP-frågor.
- Visa plattformens källmetod: primärkällor, direktlänkar, faktakontrolldatum och skillnaden mellan bindande regler, myndighetsvägledning och praktiska förklaringar.
- Metadata och strukturerad data är en senare teknisk fråga; wireframen reserverar bara synliga innehållsytor.

### Ska uttryckligen inte finnas

- Hero som enbart säljer digital dokumentation.
- Prisblock före att hjälpen och plattformens bredd har förklarats.
- Hela resursbiblioteket på startsidan.
- Kunskap som ett sent bihang efter en funktionslista.
- Påstående om att appen ersätter ett fullskaligt HACCP-system.

## Ämnesnav `/haccp-sma-livsmedelsforetag`

### Uppgift

| Dimension | Wireframebeslut |
| --- | --- |
| Besökarens huvudsakliga avsikt | Förstå HACCP-landskapet för en liten verksamhet, veta var man börjar och hitta rätt nästa steg. |
| Sidans uppgift | Vara karta och startpunkt för klustret, inte en lång artikel eller katalog med likvärdiga kort. |
| Vad besökaren får före appen | En begriplig arbetskedja, ämnesöverblick och tydliga vägar till fakta, resurs och verktyg. |
| Appens synlighet | Måttlig och sekundär, efter navets hjälp. |
| Primär handling | Välja rätt steg eller resurs. |
| Naturligt nästa steg | Faroanalys, avvikelsehantering, verifiering, kritiska gränsvärden, kontrollplan eller verktygskandidaten. |

### Mobil wireframe

```text
1. Global header
2. Breadcrumb: Kunskap / HACCP och riskstyrning
3. Ämnesrubrik, omfattning och målgrupp
4. Börja här-val efter behov
5. HACCP-arbetskedjan
   Förstå förutsättningar
   -> Identifiera faror
   -> Sätt gränser och planera kontroll
   -> Hantera avvikelser
   -> Verifiera
   -> Dokumentera
6. Grupperade faktasidor med förklarad roll i arbetskedjan
7. Praktiska resurser
   - kontrollplan
   - framtida faroanalysverktyg
8. Småföretagsperspektiv och flexibilitet
9. Vanliga frågor om ämnet
10. Källprincip, övergripande granskning och aktualitet
11. Appen som relevant arbetsyta efter att kunskap och resurser levererats
12. Relaterade ämnen och footer
```

### Desktopanpassning

Arbetskedjan blir en bred, horisontell orientering med textetiketter och tydliga länkar. Faktasidor och resurser kan grupperas i två till tre kolumner. Ett kompakt börja-här-område får ligga bredvid den korta introduktionen. Navet ska kännas bredare och mer skanningsbart än en artikel.

### Internlänkning, SEO och AI

- Navet länkar till alla sex befintliga HACCP-resurser: faroanalys, kritiska gränsvärden, avvikelser, verifiering, kontrollplan och relevant dokumentationsstöd.
- Varje länk beskriver resurstyp och varför den följer efter det aktuella steget.
- Synlig struktur ska kunna stödja breadcrumb och en framtida ämneslista, men inga metadataändringar görs här.
- Navet ger en kort ämnesdefinition, tydlig avgränsning för små livsmedelsverksamheter, centrala begrepp och källbaserade vanliga frågor.
- Detaljerade faktapåståenden hör främst hemma på faktasidorna; navet redovisar källprincip och senaste övergripande granskning.

### Ska uttryckligen inte finnas

- En lång HACCP-uppsats som konkurrerar med faktasidorna.
- Sex likvärdiga relaterade kort utan arbetsordning.
- Generatorliknande gränssnitt på navet innan verktygsbeslutet är fattat.
- Signup eller pris före ämneskartan.
- Samma hero, kortgrid och slut-CTA som på en artikel eller startsida.

## Faktasidor

Faktasidemallen används för `/faroanalys-livsmedel`, `/avvikelser-korrigerande-atgarder-livsmedel` och `/verifiering-egenkontroll-livsmedel`. Samma mall ger en konsekvent läsupplevelse, men varje sida behöver sin egen praktiska arbetsgång och sina egna exempel.

### Uppgift

| Dimension | Wireframebeslut |
| --- | --- |
| Besökarens huvudsakliga avsikt | Få ett snabbt, tillförlitligt svar på vad begreppet betyder, vad verksamheten behöver göra och hur det kan se ut i praktiken. |
| Sidans uppgift | Besvara en avgränsad fråga utan att täcka hela HACCP-området. |
| Vad besökaren får före appen | Kort svar, definition, arbetsgång, småföretagsexempel, gränsdragningar, frågor och svar samt källor. |
| Appens synlighet | Diskret. Ett enda kompakt och relevant nästa steg efter saksvaret. |
| Primär handling | Fortsätta till nästa kunskaps- eller arbetssteg, inte signup. |
| Naturligt nästa steg | Beror på sidan och visas som ett tydligt sekventiellt steg. |

### Gemensam mobil wireframe

```text
1. Global header
2. Breadcrumb till HACCP-navet
3. H1 och självständigt kort svar
4. Innehållsöversikt med ankarlänkar
5. Definition och avgränsning
6. Praktisk arbetsgång
7. Märkt exempel för liten verksamhet
8. Vanliga fel, undantag eller gränsdragningar
9. Frågor och svar
10. Källor, faktakontrolldatum och begränsning
11. Nästa relevanta kunskaps- eller arbetssteg
12. Diskret appbrygga
13. Footer
```

Appbryggan ska koppla till ett konkret behov, exempelvis att dokumentera en kontroll, följa en åtgärd eller hitta historik. Den får inte påstå att appen ensam löser HACCP-arbetet.

### Desktopanpassning

Artikeln ligger i en lugn läskolumn. Innehållsöversikt och faktastatus kan ligga i en sekundär sidokolumn, även sticky när det är tillgängligt utan att bryta läsordningen. Exempel kan använda en bredare tabell eller stegvy. Artikeln ska inte bli en tvåspaltig säljsida.

### Sidvariationer

| URL | Särskild praktisk hierarki | Sekventiellt nästa steg |
| --- | --- | --- |
| `/faroanalys-livsmedel` | Farokategorier, bedömningsgång, anpassning till den egna verksamheten och genomarbetat exempel. | Kontrollplanen eller verktygskandidaten. |
| `/avvikelser-korrigerande-atgarder-livsmedel` | Berört livsmedel eller område -> återställ processen -> hitta orsak -> förebygg och följ upp. | Verifiering. |
| `/verifiering-egenkontroll-livsmedel` | Skillnad mellan övervakning, verifiering och validering samt enkla frekvens- och ansvarsexempel. | Dokumentation eller åter till HACCP-navet. |

### Internlänkning, SEO, AI och förtroende

- Breadcrumb och returlänk till navet.
- Två till tre kontextuella länkar i brödtexten, därefter ett sekventiellt nästa steg.
- Närliggande stöd kan inkludera `/seo/kritiska-gransvarden.html`, `/seo/kontrollplan.html` och `/dokumentation-egenkontroll-livsmedel`.
- Lägg ett självständigt svar nära toppen, frågebaserade mellanrubriker, definierade begrepp, numrerad arbetsgång och märkt exempel i synlig text.
- Varje väsentligt påstående ska kunna få närliggande källnot. Den samlade källsektionen ska visa källtyp, direktlänk, faktakontrolldatum och begränsning.
- Skilj bindande regel, myndighetsvägledning och Min Egenkontrolls praktiska förklaring.

### Ska uttryckligen inte finnas

- Signup i ingressen.
- Upprepade app-CTA:er mellan innehållssektioner.
- Dold huvudinformation i accordions.
- Källösa påståenden eller odaterad faktagranskning.
- Sammanblandning av lag, vägledning och exempel.

## Mall / checklista / resurs `/seo/kontrollplan.html`

### Uppgift

| Dimension | Wireframebeslut |
| --- | --- |
| Besökarens huvudsakliga avsikt | Skapa en konkret kontrollplan och förstå vilka delar den behöver omfatta. |
| Sidans uppgift | Leverera ett användbart arbetsblad på befintlig URL. |
| Vad besökaren får före appen | Fullständig mall, kort användningsanvisning, ifyllt exempel samt utskrift eller nedladdning utan konto. |
| Appens synlighet | Måttlig, först efter att resursen går att använda. |
| Primär handling | Använd mallen. |
| Naturligt nästa steg | Faroanalysverktyget eller relevant faktasida; sedan appen för löpande arbete. |

### Mobil wireframe

```text
1. Global header
2. Breadcrumb: Resursbibliotek / HACCP / Kontrollplan
3. Resurstyp, rubrik, kort syfte, format och uppdateringsuppgift
4. Direkt åtkomst till arbetsbladet utan registrering
5. Kort användningsanvisning
6. Arbetsbladets fält i stabil, staplad ordning
   - område eller processteg
   - vad som kontrolleras
   - risk eller syfte
   - acceptabelt kriterium
   - metod
   - frekvens
   - ansvarig
   - åtgärd vid avvikelse
   - uppföljning
7. Ifyllt exempel, tydligt märkt som exempel
8. Sammanfattning eller förhandsvisning av den färdiga planen
9. Utskrift, nedladdning och fortsatt redigering
10. Källor, faktakontrolldatum och begränsning
11. Relaterat: faroanalys, kritiska gränsvärden, avvikelser och verifiering
12. Måttlig appbrygga
13. Footer
```

### Desktopanpassning

Arbetsfälten kan ligga bredvid en löpande dokumentförhandsvisning. Innehållsförteckning och resursåtgärder får vara synliga vid scroll. Utskriftsvyn ska vara begriplig även utan webbens visuella komponenter.

### SEO, AI och förtroende

- Visa en kort definition av kontrollplan, en explicit lista över vad den innehåller, arbetsgång, konkret exempel och vanliga frågor.
- Resurssidan är den kanoniska förklaringsytan även om separata filformat erbjuds senare.
- Skilj bindande regel, myndighetsvägledning och praktiskt exempel.
- Förifyllda värden får aldrig se ut som generella lagkrav. Mallen ska tydligt kräva anpassning till verksamhetens faktiska risker.

### Ska uttryckligen inte finnas

- Faktaguide utan faktisk mall.
- Låtsasnedladdning som leder till signup.
- Registreringsvägg före arbetsbladet.
- Löfte om att en ifylld mall garanterar regelefterlevnad.
- Appbanner före resursen.

## Verktyg / generator: faroanalysverktyg

Verktyget beskrivs som ett koncept. Wireframen beslutar inte om det ligger på en egen URL, under `/faroanalys-livsmedel` eller i annan framtida struktur.

### Uppgift

| Dimension | Wireframebeslut |
| --- | --- |
| Besökarens huvudsakliga avsikt | Omsätta råvaror och processer till ett strukturerat första utkast. |
| Sidans uppgift | Stödja tänkandet och synliggöra luckor, inte göra automatisk myndighets- eller efterlevnadsbedömning. |
| Vad besökaren får före appen | Hela flödet, komplett resultat, möjlighet att granska och ändra antaganden samt export. |
| Appens synlighet | Måttlig efter resultatet; diskret före start. |
| Primär handling | Skapa ett första utkast. |
| Naturligt nästa steg | Kontrollplansmallen och relevant faroanalysartikel; därefter appen för löpande dokumentation. |

### Mobil wireframe

```text
1. Global header och breadcrumb
2. Märkning: Verktyg
3. Syfte, vilket underlag som behövs och tydlig begränsning
4. Textbaserad stegöversikt
5. Verksamhet och omfattning
6. Råvaror, produkter och processteg
7. Relevanta farokategorier per steg
8. Bedömning med förklarade kriterier
9. Kontrollåtgärder, kriterier, övervakning och avvikelseåtgärder
10. Granskningssteg: visa och ändra alla antaganden
11. Resultat grupperat per processteg
12. Export eller utskrift samt länk till kontrollplansmallen
13. Metod, källor, versions- och granskningsdatum samt begränsningar
14. Appbrygga efter resultatet
15. Footer
```

### Desktopanpassning och tillgänglighet

Ett stegformulär kan ligga till vänster och en levande sammanfattning till höger, med samma semantiska läsordning som mobilen. Ingen funktion får kräva drag-and-drop.

- Fält har permanenta etiketter och tangentbordsstöd.
- Fel visas både nära fältet och i en sammanfattning; fokus flyttas till första felet.
- Resultatförändringar annonseras begripligt.
- Risk eller status uttrycks med text och förklaring, aldrig endast med färg.

### SEO, AI och förtroende

- Verktyget behöver en indexerbar förklaring av syfte, metod, definitioner, exempelresultat och vanliga frågor före eller efter den interaktiva ytan.
- Resultatet skiljer tydligt användarens uppgifter från verktygets förslag och antaganden.
- Varje bedömningskriterium förklaras öppet. Ofullständigt underlag ska ge en tydlig varning.
- Resultatet beskrivs som ett första utkast, inte som en godkänd HACCP-plan.

### Ska uttryckligen inte finnas

- Automatisk juridisk bedömning eller generativ svart låda.
- Dolda standardfaror eller oförklarade poäng.
- Konto före resultat eller förlust av resultat vid signup.
- Obligatorisk AI-chatt som enda gränssnitt.
- Beslut om ny URL.

## Resursbibliotek `/kunskapsbank`

### Uppgift

| Dimension | Wireframebeslut |
| --- | --- |
| Besökarens huvudsakliga avsikt | Hitta rätt guide, mall, checklista eller verktyg för ett konkret problem. |
| Sidans uppgift | Vara en sök- och upptäcktsyta, inte ännu ett ämnesnav eller en säljsida. |
| Vad besökaren får före appen | Alla publika resurser går att söka, filtrera, förstå och öppna utan konto. |
| Appens synlighet | Måttlig men sekundär. |
| Primär handling | Söka eller öppna en resurs. |
| Naturligt nästa steg | Vald resurs, relevant ämnesnav eller app när fortsatt dokumentation är relevant. |

### Mobil wireframe

```text
1. Global header och breadcrumb när den är relevant
2. Rubrik och kort beskrivning av bibliotekets omfattning
3. Fullbreddssökning
4. Filterknapp med antal aktiva filter och separat sortering
5. Resultatantal och tydlig rensa-filter-handling
6. Kuraterad HACCP-pilotsamling
7. Resultatlista
   - resurstyp
   - ämne
   - verksamhetssituation
   - format
   - kort nytta
   - uppdateringsdatum
8. Tomt läge med närliggande ämnen
9. Ämnesingångar, inklusive HACCP och riskstyrning
10. Käll- och faktagranskningsförklaring
11. Avgränsad appbrygga
12. Footer
```

### Desktopanpassning

Sökningen ligger överst. Filter kan ligga i en sidokolumn och resultat i en skanningsbar lista eller tvåkolumnsgrid. Filter ska vara vanliga formulärkontroller med stabil läsordning.

Rekommenderade första filterdimensioner är resurstyp, ämne, verksamhetssituation och format. Fler filter ska vänta tills innehållsmängd och faktiskt sökbeteende motiverar dem.

### SEO, AI och förtroende

- Viktiga resurser får inte bli åtkomliga enbart genom klientfilter.
- Visa indexerbara ämnes- och resurstypintroduktioner, beskrivande resursnamn, tydliga sammanfattningar och permanenta länkar.
- Visa faktagranskning, senast uppdaterad, resursägare och källstatus där det är relevant.
- Länka till befintlig sida om källor och faktagranskning.

### Ska uttryckligen inte finnas

- Säljhero före sökning och resultat.
- Lång odifferentierad kortvägg.
- Otydliga resurstypetiketter.
- Oändlig scroll som enda navigering.
- Filter som döljer centralt innehåll för sökmotorer eller tangentbordsanvändare.

## Login och signup `/login`, `/signup`

### Uppgift

| Dimension | `/login` | `/signup` |
| --- | --- | --- |
| Besökarens huvudsakliga avsikt | Återvända till arbete, följa inbjudan eller återställa åtkomst. | Skapa konto och börja använda appen. |
| Sidans uppgift | Minimera friktion och behålla rätt kontext. | Förklara minsta nödvändiga steg och skapa konto utan distraktion. |
| Vad användaren får före nästa steg | Klarhet om inloggningssätt, fel, återställning och destination. | Klarhet om krav, nästa steg och relevanta villkor. |
| Appens synlighet | Tydlig; sidan är en appingång. | Tydlig; sidan är en appingång. |
| Primär handling | Logga in. | Skapa konto. |
| Naturligt nästa steg | Avsedd appvy, inbjudningsflöde eller återställning. | Bekräftelse, onboarding och därefter app. |

### Mobil wireframe

```text
1. Enkel appheader
   - gemensam logotyp
   - etiketten Appen
   - länk tillbaka till publik webb
2. Kontextmeddelande vid inbjudan, utgången session eller återställning
3. Sidrubrik som matchar login respektive signup
4. Kort förklaring av nästa steg
5. Formulär med permanenta etiketter, tydliga fel och synlig laddningsstatus
6. Alternativa handlingar
   - magic link
   - glömt lösenord
   - byte mellan login och signup
7. Integritet och villkor när de är relevanta
8. Hjälpväg och återgång till publik webb
```

På desktop ligger formuläret i en smal huvudkolumn. En sekundär yta får bara visa kort, verifierbar trygghetsinformation. Ingen funktionskarusell eller bred appförsäljning.

### Sömlös övergång till appdomänen

- Publik navigation ska på sikt kunna länka till `app.minegenkontroll.se/login` och `app.minegenkontroll.se/signup`.
- Befintliga `/login` och `/signup` ska fortsätta fungera medan URL-bevarande gäller.
- Samma brandgrund, typografi, semantiska färger och formulärspråk ska göra domänbytet odramatiskt.
- Inbjudnings-, återställnings- och auth-parametrar måste bevaras.
- Efter lyckad auth fortsätter användaren till avsedd kontext, inte alltid till en generell startsida.
- Exakt alias-, redirect-, sessions- eller proxystrategi beslutas i Fas 5, inte i denna wireframe.

### Ska uttryckligen inte finnas

- Generisk rubrik som inte skiljer login från signup.
- Marknadsföringssektion som konkurrerar med formuläret.
- Dolda fel, otydlig laddning eller förlust av inbjudnings- och återställningskontext.

## Helhetsflöden

### 1. Google eller AI-svar -> faktasida -> ämnesnav -> resurs -> app

```text
Sökfråga om en avgränsad HACCP-fråga
-> Faktasida: kort svar och praktisk arbetsgång
-> HACCP-nav: placera frågan i arbetskedjan
-> Kontrollplan eller faroanalysverktyg: gör arbetet
-> Appen: dokumentera återkommande arbete, avvikelser och historik
```

### 2. Startsida -> kunskap -> HACCP-nav -> faktasida

```text
Startsida
-> Behovsväljaren Förstå
-> Kunskap eller resursbibliotek
-> HACCP och riskstyrning
-> Faroanalys, avvikelse eller verifiering
```

### 3. Startsida -> mall eller verktyg -> resultat -> app

```text
Startsida
-> Behovsväljaren Göra
-> Kontrollplan eller faroanalysverktyg
-> Användbar mall eller granskningsbart resultat
-> Appen som väg för att upprepa, dokumentera och följa upp arbetet
```

### 4. Hög köpavsikt -> app eller signup

```text
Hög-intent-sida, exempelvis /digital-egenkontroll-livsmedel
-> Appens konkreta vardagsnytta
-> Signup
-> Onboarding och app
```

Detta flöde finns med i systemet, men hög-intent-sidan byggs inte om i denna pilotwireframe.

### 5. Befintlig användare -> logga in -> appdomän

```text
Publik header eller direktlänk
-> Login på nuvarande eller framtida appdomän
-> Bevara inbjudnings-, återställnings- eller avsedd destinationskontext
-> Relevant vy i appen
```

## Beslut som wireframes kan låsa

- Pilotens sidtyper, befintliga URL:er och deras olika huvuduppgifter.
- Mobil blockordning, desktopprinciper och appens synlighetsnivå per sidtyp.
- HACCP-navet som orienterande startpunkt och de tre övriga pilot-URL:erna som faktasidor.
- Kontrollplanen som praktisk resurs och faroanalysverktyget som separat verktygstyp.
- Resursbiblioteket som sök- och upptäcktsyta.
- Global navigation, footer, ämneshierarki och principen för sömlös appingång.
- Källor, faktagranskning, SEO- och AI-synlighet som inbyggda block i relevanta sidtyper.

## Frågor för visuell prototyp eller produktägarens bedömning

- Om verktyget senare ska ha egen URL, ligga på faroanalyssidan eller båda.
- Verktygets exakta bedömningsmetod, kriterier, exportformat och resultatöverföring.
- Om kontrollplansmallen ska vara ifyllbar på sidan, nedladdningsbar eller båda.
- Slutlig taxonomi, sökteknik och filterbredd i resursbiblioteket.
- Slutliga destinations-URL:er för Mallar och checklistor, Verktyg, Utbildning, Referenser och källor samt Appen.
- Om alla huvuddelar ryms begripligt i desktopheadern.
- Authmetoder, sessionsdelning, redirectstrategi och onboarding efter framtida domänseparation.
- Exakta faktakontrolldatum, granskningsansvar och primärkällor för varje publicerad faktasida.
- Trafik, sökfrågor, inlänkar och konverteringsdata innan några URL:er slås ihop, tas bort eller omdirigeras.

## Rekommenderad nästa ordning

1. Visualisera gemensam mobilheader, mobilmeny, footer och de semantiska tillstånd som delas av alla ytor.
2. Visualisera mobilwireframes i pilotens arbetsordning: faktasida, ämnesnav, mall/checklista, verktyg, resursbibliotek, startsida och login/signup.
3. Visualisera desktopanpassningarna utan att ändra mobilens läsordning.
4. Prova de fem helhetsflödena i en klickbar prototyp, inklusive fel-, tom- och återställningstillstånd för auth.
5. Låt produktägaren ta ställning till de öppna frågorna ovan.
6. Starta därefter Fas 5 som ett separat arbete: teknisk separation och gemensamt brand- och designsystem.
7. Först när grunden är på plats implementeras det kompletta minisystemet utan att ändra eller ta bort befintliga URL:er.
