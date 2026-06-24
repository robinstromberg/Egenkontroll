# Framtida privatläge – personlig egenkontroll och självinspektion

Det här dokumentet ska användas som underlag när Egenkontroll i framtiden ska utökas med ett privatläge för personliga rutiner, hushållsrutiner och självuppföljning.

Syftet är att Codex/AI ska förstå att privatläget inte ska byggas som en separat app eller en vanlig habit tracker, utan som en frivillig personlig tillämpning av samma grundmotor: rutin → utförande → avvikelse/hinder → åtgärd/justering → historik → KPI → rapport/självinspektion.

Dokumentet ska läsas tillsammans med `AGENTS.md` och relevanta GitHub-issues innan privatläge planeras eller byggs.

## Grundidé

Egenkontroll för företag handlar om att skapa ordning, dokumentera kontroller och kunna visa efterlevnad.

Privatläge handlar om att hjälpa människor att få svart på vitt om de faktiskt följer sina egna rutiner, beslut och prioriteringar.

Exempel på positionering:

> Ett personligt egenkontrollsystem för människor som vill se om de faktiskt lever efter sina egna rutiner, beslut och prioriteringar.

Privatläget ska ge användaren samma typ av tydlighet som ett egenkontrollsystem ger ett företag, men utan myndighets- eller tvångskänsla.

## Viktig produktprincip

Bygg inte separat privatlogin om det kan undvikas.

Rekommenderad modell är:

```text
user account
  → workspace memberships
  → workspace
```

En användare ska på sikt kunna ha flera arbetsytor, till exempel:

- Privat yta
- Hushåll / familj
- Företag A
- Företag B
- Förening eller team

Privatläge ska därför helst bygga på en generell workspace-modell snarare än separata loginflöden för privat och företag.

## Workspace-typer

Backend bör på sikt kunna skilja mellan olika typer av arbetsytor.

Exempel:

```text
workspace.type = business | personal | household | team | association
```

Livsmedelsappen motsvarar exempelvis:

```text
workspace.type = business
workspace.industry = food
```

Privatläge motsvarar exempelvis:

```text
workspace.type = personal
workspace.domain = personal_routines
```

Hushållsläge kan motsvara:

```text
workspace.type = household
workspace.domain = household_routines
```

Befintlig `organizations`-modell kan behållas i MVP, men framtida arkitektur ska inte anta att alla arbetsytor är företag.

## Samma motor, annat språk

Privatläget ska i första hand återanvända kontrollmotorn, men med annan terminologi.

| Företagsläge | Privatläge |
|---|---|
| Kontrolltyp | Rutinområde |
| Kontrollpunkt / objekt | Rutin / vana / sak |
| Utförd kontroll | Check-in / utförd rutin |
| Avvikelse | Hinder / missad rutin / bruten rutin |
| Åtgärd | Justering / reflektion / nästa steg |
| Historik | Mönster över tid |
| KPI | Självinsikt / följsamhet |
| Inspektörsvy | Självinspektion / analysläge / rapport |
| Export | Export för egen analys |

Samma datamodell kan bära mycket av detta, men UI-copy, rubriker och standardflöden ska anpassas så att privatläget inte känns som myndighetskontroll.

## Självinspektion, rapport och export

Privatläget ska inte ärva myndighets- eller inspektörslogik som standard, men ska återanvända rapport-, historik-, export- och läslänksfunktioner som frivillig självinspektion och egen analys.

I privatläge är syftet inte att någon annan påtvingar kontroll. Syftet är att användaren själv vill kunna analysera sina rutiner och mönster.

Möjliga namn i privatläge:

- Självinspektion
- Analysläge
- Rapport
- Veckorapport
- Månadsrapport
- Exportera min data
- Dela med vald person
- Skapa läslänk

Rapporter och export kan användas för:

- egen veckoreflektion
- månadsanalys
- personlig utveckling
- coach/PT
- terapeut eller vårdkontakt, om användaren själv vill
- partner/familj vid hushållsrutiner
- vidare analys i kalkylark

Delning ska vara frivillig, tydlig och kontrollerad av användaren.

## Integritet och dataskydd

Privata rutiner kan vara känsliga.

Privatläget kan innehålla data om:

- hälsa
- sömn
- medicin
- ekonomi
- relationer
- barn
- mental hälsa
- beroenden
- träning
- arbete
- personlig utveckling

Därför ska privatläge planeras med stark integritet från början.

Viktiga principer:

- Privat workspace ska vara privat som standard.
- Privatdata ska inte blandas med företagsdata.
- Privatdata ska inte visas i företagsrapporter.
- Delning ska vara opt-in.
- Läslänkar ska vara tidsbegränsade och tydligt markerade.
- Användaren ska kunna exportera sin egen data.
- Användaren bör på sikt kunna radera privatdata.
- Eventuella hushållsytor ska ha tydliga medlemskap och behörigheter.
- Extra känsliga rutiner kan behöva särskilda synlighetsinställningar senare.

Codex ska inte anta att funktioner som är rimliga i företagsläge automatiskt är rimliga i privatläge.

## Privatlägets kärnflöde

Föreslaget grundflöde:

```text
1. Användaren skapar eller väljer ett rutinområde.
2. Användaren lägger till rutiner/checkpunkter.
3. Användaren sätter frekvens eller trigger.
4. Appen visar dagens/veckans rutiner.
5. Användaren checkar av.
6. Om något missas eller bryts kan användaren ange hinder/orsak.
7. Användaren kan lägga till justering eller nästa steg.
8. Historiken sparas.
9. KPI:er visar mönster och följsamhet.
10. Användaren kan göra självinspektion/export/rapport.
```

## Exempel på privata rutinområden

### Personlig grundstruktur

- Morgonrutin
- Kvällsrutin
- Veckoplanering
- Reflektion
- Träning
- Sömn
- Mat
- Ekonomi
- Hem
- Fokusarbete

### Hushåll

- Städning
- Tvätt
- Inköp
- Räkningar
- Underhåll
- Barnens saker
- Återkommande familjeansvar
- Fordon
- Hemförsäkring / viktiga dokument

### Prestationsläge

- Träningspass
- Återhämtning
- Sömn
- Fokuspass
- Kost
- Planering
- Veckoutvärdering
- Mental förberedelse

### Hälsa och välmående

- Medicin
- Vatten
- Rörelse
- Sömn
- Symptomlogg
- Återhämtning
- Stressnivå
- Kontakt med vård eller terapeut

OBS: Om hälsa/medicin/mental hälsa byggs in ska integritet, språk och ansvar hanteras extra försiktigt.

## Privatläge ska inte bli en vanlig to-do-lista

Privatläget ska inte primärt konkurrera med enkla att-göra-listor.

Skillnaden ska vara:

- återkommande rutiner snarare än engångsuppgifter
- svart på vitt över tid
- mönster och följsamhet
- hinder och justeringar
- självinspektion och rapport
- personlig kontrolljournal

Om en funktion bara är en vanlig todo-funktion ska Codex först motivera varför den hör hemma här.

## KPI:er för privatläge

Företags-KPI:er ska inte återanvändas okritiskt.

Privata KPI:er bör vara stödjande, inte dömande. De ska hjälpa användaren att förstå mönster, inte skapa skam.

Exempel på privat-KPI:er:

- Andel rutiner utförda denna vecka
- Dagar med morgonrutin
- Dagar med kvällsrutin
- Mest stabila rutin
- Rutin som oftast missas
- Vanligaste hinder
- Följsamhet per område
- Trend senaste 4 veckorna
- Antal justeringar gjorda
- Rutiner utan missar
- Rutiner med återkommande hinder
- Genomsnittlig återhämtning/sömn om användaren registrerar detta

KPI:er bör kunna grupperas i:

- Dag
- Vecka
- Månad
- Rutinområde
- Hushåll/person

## Hinder, avvikelser och justeringar

I privatläge bör ordet `avvikelse` normalt inte användas i UI om det känns för hårt.

Alternativa begrepp:

- Hinder
- Missad rutin
- Bruten rutin
- Ej utförd
- Behöver justeras
- Nästa steg
- Reflektion

Exempel:

```text
Rutin: Kvällsplanering
Status: Ej utförd
Hinder: Kom i säng för sent
Justering: Lägg planeringen före tandborstning
```

Tekniskt kan detta fortfarande mappas till avvikelse/åtgärd i kontrollmotorn, men copy och rapport ska vara anpassade.

## Dokumentation och rapport i privatläge

Privat dokumentation ska kunna visas som:

- daglig vy
- veckovy
- månadsvy
- per rutinområde
- per rutin
- per hinder
- per justering

Rapporten bör kunna innehålla:

- period
- antal rutiner
- utförandegrad
- dagar med dokumentation
- mest stabila rutiner
- rutiner som ofta missas
- återkommande hinder
- justeringar
- anteckningar/reflektioner
- exporterbar tabell

CSV bör vara strukturerad för egen analys.

PDF bör vara läsbar som en sammanfattande rapport.

## Mallpaket för privatläge

Privatläge bör använda mallpaket på samma sätt som branscher.

Exempel på mallpaket:

- Personlig grundstruktur
- Hushållsrutiner
- Prestationsrutiner
- Hälsa och välmående
- Student/studierutiner
- Förälder/familjelogistik
- Entreprenör/fokus och planering

Mallar ska vara startpunkter och alltid redigerbara.

## Backend-förberedelser att utvärdera

När privatläge ska planeras ska Codex utvärdera om följande backend-stöd finns eller behövs:

- Workspace-typ: `business`, `personal`, `household`.
- Medlemskap per workspace.
- Rollmodell som fungerar även utan företag.
- Mallpaket för privatläge.
- Separata labels/copy per workspace-typ.
- KPI-konfiguration per workspace-typ.
- Export/rapport som inte antar myndighet/inspektör.
- Delning som är opt-in och personlig.
- Integritetsinställningar per rutin eller rutinområde.
- Möjlighet att exportera/radera privatdata.
- Säker RLS så privatdata inte blandas mellan användare eller workspaces.

## Saker som inte ska byggas för tidigt

Bygg inte följande innan business-MVP:n är stabil eller ett särskilt issue finns:

- Fullt privatläge i UI.
- Separat privatapp.
- Separat loginflöde.
- Social feed.
- Publika profiler.
- AI-coach.
- Medicinska rekommendationer.
- Psykologiska diagnoser.
- Gamification som gör systemet oseriöst eller stressande.

## Viktig språkprincip

Privatläge ska kännas som stöd, inte övervakning.

Undvik default-copy som:

- Kontrollant
- Inspektion från extern part
- Underkänd
- Regelbrott
- Compliance
- Myndighet

Använd hellre:

- Självinspektion
- Överblick
- Mönster
- Hinder
- Justering
- Rutin
- Följsamhet
- Reflektion
- Min rapport

## Rekommenderad arbetsordning när privatläge blir aktuellt

1. Skapa ett GitHub-issue för privatläge.
2. Läs detta dokument och `AGENTS.md`.
3. Analysera nuvarande datamodell för workspace-stöd.
4. Föreslå minsta säkra backend-förberedelse.
5. Säkerställ att företags-/livsmedels-MVP:n inte bryts.
6. Definiera privat terminologi/copy.
7. Definiera privata KPI:er.
8. Definiera rapport/självinspektion.
9. Skapa eventuella mallpaket.
10. Bygg ett minimalt privatflöde först när grunden är stabil.

## Avgränsning

Detta dokument betyder inte att privatläge ska byggas nu.

Det betyder att Codex ska förstå hur privatläge bör tänkas när det blir aktuellt, så att arkitekturen inte låses vid att alla användare är företag och alla rapporter är myndighetsdokumentation.