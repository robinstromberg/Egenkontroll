# Produktprinciper: enkelhet först

Det här dokumentet är ett styrdokument för framtida utveckling i Egenkontroll. Det implementerar ingen ny funktionalitet.

## Kärnprincip

Appens viktigaste uppgift är att göra det snabbt att dokumentera kontroller och snabbt kunna visa upp dokumentationen.

Fler funktioner får aldrig göra den dagliga kontrollen långsammare eller svårare för den användare som bara ska utföra dagens arbete.

## Daglig användning före administration

Administrativa flöden ska hållas separerade från kontrollflödet.

Den dagliga användaren ska kunna:

- öppna dagens kontroller
- fylla i en kontroll
- hantera en avvikelse
- spara
- visa historik eller dokumentation

utan att behöva möta workspace-, betalnings-, roll- eller administrationsdetaljer som inte behövs för uppgiften.

## Få knapptryck är ett produktkrav

Nya funktioner ska bedömas mot hur de påverkar antal steg i kärnflödet.

En ändring ska omarbetas om den gör det långsammare att:

- öppna dagens kontroller
- registrera en kontroll
- spara kontrollen
- hantera en avvikelse
- visa historik
- skapa eller öppna dokumentation för kontrollant

utan att detta är ett uttryckligt produktbeslut.

## Komplexitet ska absorberas av systemet

När appen växer ska användaren bara se det som är relevant för användarens roll, workspace och aktuella uppgift.

Exempel:

- En användare med ett workspace ska inte störas av workspace-väljare.
- Personal ska inte se administrativa beslut om de inte behövs.
- Livsmedelsflödet ska inte påverkas av framtida branscher.
- Företagsläge och framtida privatläge ska hållas isär.

## Dokumentation ska vara snabb att visa upp

Historik, inspektörsvy, PDF och CSV ska vara lätta att nå.

När en företagare eller ansvarig behöver visa underlag ska appen hjälpa till snabbt, utan att gömma dokumentationen bakom onödiga steg.

## Automatisk signering

Utförda kontroller ska signeras automatiskt med:

- inloggad användare
- identifierbar profil
- datum och tid
- aktuellt workspace/verksamhet
- framtida anläggning/plats när sådan modell finns

Det ska inte kräva en extra manuell signeringsknapp i kontrollflödet.

## Historik får aldrig förvanskas

Gamla kontroller ska kunna förstås utifrån det sammanhang som gällde när de utfördes.

Ändringar i rutiner, instruktioner, gränsvärden, kontrolltyper, roller eller objekt får inte göra gammal historik missvisande.

## Guardrails för framtida issues och PR:er

Varje större ändring ska kontrollera:

- Påverkar detta dagens kontrollflöde?
- Lägger detta administration i vägen för daglig användning?
- Påverkar detta historik, inspektörsvy, PDF eller CSV?
- Kräver detta RLS-, säkerhets- eller datamodelländring som bör ligga i separat issue?
- Finns ett enklare sätt som skyddar kärnflödet bättre?

## Definition av godkänd produktändring

En ändring är i linje med denna princip när den:

- bevarar eller förbättrar snabbheten i daglig dokumentation
- håller administration utanför kärnflödet
- bevarar historisk korrekthet
- gör komplexitet kontextuell i stället för global
- kan verifieras utan att appens viktigaste flöden försämras
