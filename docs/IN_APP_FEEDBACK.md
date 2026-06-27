# In-app feedback

Det här dokumentet beskriver målbilden för att rapportera problem och föreslå förbättringar direkt från appen. Det implementerar ingen feedbackfunktion.

## Grundprincip

Feedback ska vara frivillig, diskret och enkel.

Funktionen ska hjälpa produktutvecklingen utan att skapa friktion i den dagliga dokumentationen.

## Framtida feedbacktyper

En framtida feedbackfunktion bör kunna stödja:

- rapportera problem
- föreslå förbättring
- berätta att något är otydligt
- lämna frivillig kontaktuppgift
- ange var i appen feedbacken skickades, om det kan göras säkert

## Integritet

Feedback kan innehålla känslig verksamhetsinformation.

Därför ska framtida implementation:

- inte skicka kunddata automatiskt
- inte skicka bilagor, bilder eller loggar utan uttryckligt godkännande
- inte inkludera personuppgifter i onödan
- tydligt visa vad användaren skickar
- behandla feedback som kunddata

## Kanaler

Möjliga framtida mottagare:

- e-post
- databasrad
- supportsystem
- manuellt granskad GitHub-koppling

Automatisk GitHub-issue-skapning direkt från kundfeedback ska undvikas. Kundfeedback bör gå via granskning eller mellanlager först.

## Placering

Feedback bör vara lätt att hitta i meny eller hjälpvy.

Den ska inte visas som popup i kontrollflödet och inte fråga efter feedback när användaren bara försöker spara en kontroll.

## Guardrails

När feedback implementeras ska Codex:

- inte störa kontrollflödet med popups
- inte samla in känslig data automatiskt
- inte skapa GitHub-issues direkt från kundfeedback utan granskning
- inte införa extern tjänst utan separat beslut
- inte ändra RLS eller datamodell utan separat issue
- alltid följa produktprinciperna om enkelhet först

## Klart när

Området är produktmässigt uppfyllt när:

- det finns en tydlig lågfriktionsväg för feedback
- feedback inte stör dagliga kontroller
- integritet och kunddata är beaktade
- separat implementation är avgränsad
- feedback kan användas för att förbättra produkten utan att skapa risk
