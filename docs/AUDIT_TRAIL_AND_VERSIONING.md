# Audit trail och versionering

Det här dokumentet beskriver målbilden för operativ signering, administrativ audit trail och versionering. Det implementerar ingen ny funktionalitet.

## Grundprincip

Historik och dokumentation ska gå att lita på även när rutiner, gränsvärden, kontrolltyper, användare eller roller ändras över tid.

Två spår ska hållas isär:

1. Operativ kontrollhistorik
2. Administrativ ändringshistorik

## Operativ signering

Operativ signering svarar på frågan:

> Vem utförde kontrollen?

När en kontroll sparas ska systemet automatiskt koppla den till:

- inloggad användare
- identifierbar profil
- datum
- tid
- aktuellt workspace/verksamhet
- framtida anläggning/plats när sådan modell finns

Det ska inte krävas en extra manuell signeringsknapp.

## Administrativ audit trail

Administrativ audit trail svarar på frågan:

> Vem ändrade systemets inställningar?

Exempel på ändringar som bör kunna loggas senare:

- ändrad kontrolltyp
- ändrad rutin eller instruktion
- ändrat gränsvärde
- ändrad frekvens
- arkivering eller återaktivering av kontrolltyp
- arkivering eller återaktivering av kontrollpunkt
- ändrad användarroll
- ändrad delningslänk
- ägarbyte

Administrativ audit trail ska vara separat från utförda kontroller.

## Historiska kontroller får inte förvanskas

En kontroll ska kunna förstås utifrån det sammanhang som gällde när den utfördes.

Om maxgränsen för en kyl ändras i juni ska en kontroll från januari fortfarande visa det sammanhang som gällde i januari.

## Versionering

Versionering ska skydda historiskt viktiga sammanhang.

Det kan gälla:

- kontrolltypens namn
- instruktion eller rutin
- kontrollpunktens namn
- kontrollpunktens placering
- gränsvärden
- fältdefinitioner
- frekvens

Nuvarande kontrollhistorik använder snapshots i kontrollposter. Framtida versionering ska bygga vidare på den principen i stället för att skriva om gammal historik.

## Relation till rapporter och inspektörsvy

Historik, rapporter och inspektörsvy ska visa utförda kontroller på ett begripligt och trovärdigt sätt.

All intern audit trail behöver inte visas externt. Exakt vad som visas för kontrollant ska beslutas i separata issues.

## Guardrails

När audit trail eller versionering bryts ut i implementation ska Codex:

- inte ändra befintlig historik utan separat beslut
- inte förstöra snapshots eller historiska kontrollposter
- inte ändra RLS eller säkerhet utan separat issue
- inte lägga till manuell signering om automatisk signering räcker
- inte göra kontrollflödet långsammare med extra signeringssteg
- inte visa intern audit trail externt utan produktbeslut
- verifiera att gamla kontroller fortfarande visas korrekt

## Framtida child issues

Följande ska hanteras separat:

- verifiera att utförda kontroller signeras automatiskt med användare, datum och tid
- planera versionering av rutiner, gränsvärden och kontrolltyper
- planera administrativ audit trail för kontrolltyper och roller
- planera vad audit trail ska visa internt respektive externt
- säkerställ att rapporter visar historiskt korrekt information
