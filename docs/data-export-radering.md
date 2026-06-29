# Rutin för export och radering av data

Senast uppdaterad: 2026-06-29

Den här rutinen beskriver hur Min Egenkontroll hanterar begäran om export eller radering av data.

## Kontaktväg

Användare ska begära export eller radering genom att mejla:

`integritet@minegenkontroll.se`

Om adressen ännu inte är aktiv används tillfälligt:

`support@minegenkontroll.se`

## Vad användaren ska ange

Begäran bör innehålla:

- konto-e-postadress
- om begäran gäller export eller radering
- vilken verksamhet/organisation begäran gäller, om relevant
- om begäran gäller användarens egna uppgifter eller en verksamhet användaren administrerar

Användaren ska inte skicka lösenord, hemliga länkar eller annan känslig information via e-post.

## Mottagning

När en begäran kommer in:

1. Bekräfta mottagande.
2. Skapa en intern notering om datum, kontaktadress, begäran och status.
3. Kontrollera om begäran gäller en privat användare, ett användarkonto eller en verksamhets data.

Intern målsättning:

- bekräfta mottagande inom 7 dagar
- hantera begäran inom 30 dagar

## Identitets- och behörighetskontroll

Innan export eller radering genomförs ska identitet och behörighet kontrolleras.

Miniminivå:

- begäran ska komma från samma e-postadress som kontot använder, eller
- användaren ska kunna verifieras på annat rimligt sätt

Om begäran gäller en verksamhets data ska det kontrolleras att personen:

- är ägare/admin i rätt organisation i appen, eller
- har behörighet att företräda verksamheten

Om behörighet inte kan styrkas ska begäran inte genomföras förrän saken är utredd.

## Export av data

Export kan omfatta:

- kontouppgifter
- organisation/verksamhet användaren tillhör
- användarroll och behörighet
- egenkontrolldata som användaren eller verksamheten har rätt att få ut
- kontrollhistorik
- avvikelser och åtgärder
- uppladdade filer/bilder där det är relevant

Exportformat:

- PDF eller CSV där appen redan stödjer det
- manuell export från databas vid behov
- strukturerat textformat om inget annat finns

Innan export skickas:

1. Kontrollera att exporten bara innehåller data personen har rätt att få.
2. Undvik att skicka andra användares personuppgifter i onödan.
3. Använd en säker överföringsmetod om exporten innehåller känsligt eller omfattande material.
4. Dokumentera datum, vad som exporterades och vem som hanterade ärendet.

## Radering av data

Radering kan omfatta:

- användarkonto
- personliga kontouppgifter
- koppling mellan användare och verksamhet
- supportärende
- uppladdade filer/bilder
- egenkontrolldata, om behörig verksamhetsföreträdare begär det

Raderingssteg:

1. Kontrollera identitet och behörighet.
2. Kontrollera om data först ska exporteras.
3. Avgör om uppgifter ska raderas eller anonymiseras.
4. Kontrollera om viss information måste sparas enligt lag, säkerhetsskäl eller tvist.
5. Genomför radering/anonymisering.
6. Dokumentera datum, omfattning, vem som hanterade ärendet och om något inte kunde raderas.
7. Bekräfta till användaren när ärendet är hanterat.

## När data inte ska raderas direkt

Data kan behöva sparas även efter begäran om radering om det krävs för:

- bokföring
- rättsliga krav
- säkerhetsutredning
- pågående tvist
- verksamhetens egenkontrolldokumentation
- backupens normala livslängd

Om full radering inte kan göras ska användaren få en tydlig förklaring.

## Backup

Data kan finnas kvar i backup under backupens normala livslängd. Enskild radering ur backup görs normalt inte separat, utan uppgifter försvinner när backupen löper ut enligt backup-rutinen.

## Standardmall för svar

Hej,

Vi har tagit emot din begäran om [export/radering] av data i Min Egenkontroll.

För att hantera begäran behöver vi bekräfta vilken e-postadress och eventuell verksamhet begäran gäller. Om begäran gäller en verksamhets data behöver vi även kontrollera att du har rätt att företräda verksamheten eller är administratör i tjänsten.

Vi återkommer när kontrollen är gjord och ärendet är behandlat.

Vänliga hälsningar,
Min Egenkontroll

## Status

Rutinen är beslutad och dokumenterad. Praktiskt återstår att skapa `integritet@minegenkontroll.se` när e-postdomänen är färdigverifierad.
