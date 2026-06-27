# Workspace-livscykel

Det här dokumentet beskriver målbilden för hur ett workspace/verksamhet ska kunna leva över tid. Det implementerar ingen ny funktionalitet.

## Grundprincip

Ett workspace ska kunna startas, växa, förändras, pausas, överlåtas och avslutas utan att historik, kontroller, roller, betalning eller dokumentation blir otydliga.

Livscykelfunktioner ska hållas separerade från den dagliga kontrollen.

## Livscykelsteg

### 1. Starta workspace

Startresan bör kunna omfatta:

- skapa konto
- skapa workspace/verksamhet
- ange grunduppgifter
- välja bransch eller verksamhetstyp
- välja plan eller testperiod
- välja startmallar
- skapa första kontrollmiljön
- börja använda appen

### 2. Växa

Tillväxtresan bör kunna omfatta:

- bjuda in användare
- acceptera inbjudan med befintligt eller nytt konto
- ändra roller
- lägga till admin
- hantera flera workspaces per konto
- aktivera framtida teamfunktioner eller tillägg

### 3. Förändra verksamheten

Förändringar ska kunna ske utan att historik förstörs.

Exempel:

- lägga till ny kyl, frys eller kontrollpunkt
- byta lokal
- lägga till framtida anläggning
- lägga till produktionslinje eller säsongsyta
- arkivera gammal kontrollmiljö
- återaktivera kontrollmiljö vid behov

Arkivering/inaktivering ska föredras framför hårdradering när historik finns.

### 4. Pausa och återaktivera

Ett framtida pausflöde bör tydligt visa:

- vad som händer med data
- vad som händer med historik
- vad som händer med prenumeration
- hur workspacet återaktiveras

Historik ska bevaras även när ett workspace pausas.

### 5. Överlåta ägarskap

Ägarbyte ska vara säkert och spårbart.

Ett framtida flöde bör kräva:

- bekräftelse från nuvarande ägare
- bekräftelse från ny ägare
- tydligt betalningsansvar
- bevarad historik
- audit trail enligt framtida audit-modell

### 6. Avsluta workspace

Avslut ska vara ett separat, tydligt och skyddat flöde.

Det bör kunna omfatta:

- exportera relevant historik
- exportera bilagor om möjligt
- avsluta prenumeration
- arkivera workspace
- radera workspace endast med starka spärrar och bekräftelser

## Betalning

Betalning ska behandlas funktionellt och inte låsas till en viss leverantör i arkitekturen.

Ett workspace kan på sikt ha:

- betalningsstatus
- plan
- testperiod
- betalningsansvarig
- tillägg

Teknisk betalningsleverantör beslutas i separat issue.

## Relation till befintlig arkitektur

`organizations` är nuvarande MVP-begrepp för workspace.

Detta dokument kompletterar `docs/WORKSPACE_MEMBERSHIP_ARCHITECTURE.md`:

- medlemskapsdokumentet beskriver vem som kan tillhöra vad
- detta dokument beskriver vad som händer med workspacet över tid

## Guardrails

När livscykelfunktioner bryts ut i implementation ska Codex:

- inte ändra dagligt kontrollflöde utan separat beslut
- inte ändra historik så att gamla kontroller tappar innebörd
- inte radera data utan separat issue och tydliga spärrar
- inte ändra RLS eller säkerhetsmodell utan separat säkerhetsissue
- inte låsa betalningsarkitekturen till en leverantör utan produktbeslut
- testa att dagens kontroller, historik och inspektörsvy fortfarande fungerar

## Framtida child issues

Följande ska byggas separat när behovet finns:

- start och onboarding
- team och användarhantering
- flera verksamheter och workspace-väljare
- förändra verksamhet och kontrollmiljö
- pausa och återaktivera
- överlåta ägarskap
- exportera och avsluta
