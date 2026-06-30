# GDPR-ansvar för Min Egenkontroll

Senast uppdaterad: 2026-06-29

Den här dokumentationen beskriver hur Min Egenkontroll ska hantera GDPR-ansvar, personuppgifter, datalagring, export/radering och supportkontakt. Dokumentet är en intern drift- och ansvarsrutin och kompletterar den publika integritetspolicyn.

## 1. Ansvarsfördelning

### Min Egenkontroll som personuppgiftsansvarig

Min Egenkontroll är personuppgiftsansvarig för personuppgifter som behandlas för att driva tjänsten, till exempel:

- användarkonton
- inloggning och autentisering
- supportärenden
- säkerhetsloggar och felsökning
- kommunikation med användare
- betalning och fakturering när betalning införs
- drift, säkerhet och administration av tjänsten

Tills en juridisk person är bildad anges Robin Strömberg / Min Egenkontroll som ansvarig kontakt. När bolag eller annan juridisk form finns ska detta uppdateras i integritetspolicy, användarvillkor och detta dokument.

### Kund/verksamhet som personuppgiftsansvarig

Den verksamhet som använder Min Egenkontroll ansvarar normalt själv för innehållet den registrerar i sin egenkontroll, till exempel:

- namn på personal eller ansvarig person
- signeringar
- kontrollhistorik
- avvikelser och åtgärder
- kommentarer
- uppladdade bilder eller filer
- information om leverantörer, varor eller interna rutiner

Verksamheten ansvarar för att informationen är korrekt, relevant och inte innehåller fler personuppgifter än nödvändigt.

### Min Egenkontroll som personuppgiftsbiträde

När Min Egenkontroll lagrar och behandlar en kunds egenkontrolldata åt kunden agerar tjänsten i många fall som personuppgiftsbiträde. Före bredare publik beta eller skarp B2B-drift bör ett enkelt personuppgiftsbiträdesavtal finnas tillgängligt för kunder.

## 2. Personuppgifter som kan behandlas

| Kategori | Exempel | Syfte |
| --- | --- | --- |
| Kontouppgifter | namn, e-postadress, användar-ID | konto, inloggning och behörighet |
| Verksamhetsuppgifter | organisationsnamn, verksamhetsnamn, medlemskap | koppla användare till rätt verksamhet |
| Behörigheter | roll, ägare/admin/medarbetare | styra åtkomst till data |
| Egenkontrolldata | kontroller, värden, signeringar, kommentarer, avvikelser | dokumentation och uppföljning |
| Bilagor | bilder, filer, foton på varor eller dokumentation | styrka eller komplettera kontrollhistorik |
| Delningsdata | tidsbegränsade delningslänkar och exportloggar | visa dokumentation för kontrollant eller intern uppföljning |
| Teknisk data | IP-adress, webbläsare, enhet, felmeddelanden, loggar | säkerhet, felsökning och drift |
| Supportdata | e-post, ärendebeskrivning, kontaktuppgifter | hjälpa användare och lösa problem |
| Betalningsdata | fakturauppgifter, abonnemangsstatus, kvittoinformation | betalning och bokföring när betalning införs |

## 3. Dataminimering

Min Egenkontroll ska bara samla in och lagra uppgifter som behövs för tjänstens funktion, säkerhet, support eller lagkrav.

Praktisk regel:

- samla inte in personnummer
- samla inte in privata adresser om det inte behövs
- samla inte in känsliga personuppgifter
- använd e-post som primär identifierare
- låt verksamheten själv avgöra vad som behöver dokumenteras i egenkontrollen
- undvik fritextfält där användare uppmuntras att skriva in onödiga personuppgifter

## 4. Datalagring och lagringstid

### Kontouppgifter

Kontouppgifter sparas så länge kontot är aktivt eller så länge uppgifterna behövs för drift, support, säkerhet eller rättsliga krav.

När ett konto avslutas ska kontouppgifter raderas eller anonymiseras när de inte längre behövs.

### Egenkontrolldata

Egenkontrolldata sparas så länge verksamheten behöver dokumentationen för historik, uppföljning, livsmedelskontroll eller egen intern dokumentation.

Radering av egenkontrolldata bör normalt hanteras av verksamhetens administratör eller efter bekräftad begäran från behörig företrädare för verksamheten.

### Supportärenden

Supportärenden sparas så länge de behövs för att hantera ärendet och följa upp återkommande problem. Rekommenderad standard: radera eller anonymisera avslutade supportärenden efter 24 månader, om de inte behöver sparas längre på grund av tvist, säkerhetsärende eller lagkrav.

### Tekniska loggar

Tekniska loggar ska sparas så kort tid som är rimligt för felsökning, drift och säkerhet. Rekommenderad standard: 30-90 dagar om inte längre lagring behövs för säkerhetsutredning.

### Betalnings- och bokföringsuppgifter

När betalning införs ska betalnings- och bokföringsuppgifter sparas enligt gällande bokföringskrav. Den rutinen ska dokumenteras separat när betalflödet är valt.

### Backups

Uppgifter kan finnas kvar i backup under backupens normala livslängd. Radering ur backup görs normalt inte manuellt per enskild användare, utan uppgifterna försvinner när backupen löper ut enligt backup-rutinen.

## 5. Export av data

### När export ska kunna göras

Export ska kunna göras när:

- en användare begär tillgång till sina personuppgifter
- en verksamhetsadministratör vill exportera verksamhetens egenkontrolldata
- en användare vill flytta relevant data till annan tjänst, där det är tillämpligt
- kontrollant eller myndighet behöver se dokumentation via delningslänk eller export

### Praktisk exportnivå

Miniminivå:

- export av kontrollhistorik i PDF/CSV där appen stödjer det
- export av relevant användar- och kontoinformation vid begäran
- manuell export från databasen vid behov tills appen har full självserviceexport

### Hantering av begäran

Begäran skickas till:

- `integritet@minegenkontroll.se` för GDPR-begäran
- `support@minegenkontroll.se` för vanliga supportärenden

Innan export lämnas ut ska identiteten kontrolleras. Om begäran gäller en verksamhets data ska det också kontrolleras att personen har rätt att företräda verksamheten eller är administratör för rätt organisation i appen.

## 6. Radering av data

### När radering kan bli aktuell

Radering kan bli aktuell när:

- en användare avslutar sitt konto
- en användare begär radering av personuppgifter
- en verksamhet avslutar användningen av tjänsten
- uppgifter inte längre behövs för sitt syfte
- uppgifter har registrerats felaktigt eller i onödan

### Praktisk raderingsrutin

1. Ta emot begäran via `integritet@minegenkontroll.se` eller `support@minegenkontroll.se`.
2. Bekräfta mottagande.
3. Kontrollera identitet och behörighet.
4. Avgör om begäran gäller användarens egna personuppgifter eller en verksamhets data.
5. Exportera data först om användaren eller verksamheten begär det.
6. Radera eller anonymisera relevant data.
7. Dokumentera vad som gjorts, datum och vem som utförde åtgärden.
8. Svara till den som begärt åtgärden.

### Begränsningar

Radering kan behöva begränsas om uppgifter måste sparas på grund av:

- bokföring
- rättsliga krav
- pågående tvist
- säkerhetsutredning
- verksamhetens behov av egenkontrolldokumentation

Om radering inte kan göras fullt ut ska användaren få en tydlig förklaring.

## 7. Tidsfrister för GDPR-begäran

GDPR-begäran ska hanteras utan onödigt dröjsmål. Intern målsättning:

- bekräfta mottagande inom 7 dagar
- svara eller genomföra åtgärd inom 30 dagar
- dokumentera om ärendet kräver längre handläggning

## 8. Support- och kontaktadresser

Rekommenderade adresser:

- `support@minegenkontroll.se` – support, kontoärenden och allmän hjälp
- `integritet@minegenkontroll.se` – GDPR, registerutdrag, radering och dataportabilitet
- `security@minegenkontroll.se` – säkerhetsrapporter och misstänkta sårbarheter
- `no-reply@minegenkontroll.se` – systemmail/auth-mail, inte för inkommande support
- `faktura@minegenkontroll.se` – faktura och betalning när betalning införs

Minimumnivå före skarp drift:

- `support@minegenkontroll.se`
- `integritet@minegenkontroll.se`
- `security@minegenkontroll.se`
- `no-reply@minegenkontroll.se`

## 9. Personuppgiftsincidenter

Vid misstänkt personuppgiftsincident ska följande göras:

1. Stoppa eller begränsa incidenten om möjligt.
2. Dokumentera vad som hänt, tidpunkt, berörda system och berörda uppgifter.
3. Bedöm om personuppgifter berörs.
4. Bedöm risk för de registrerade.
5. Kontakta berörda leverantörer vid behov.
6. Om incidenten ska anmälas till IMY ska detta hanteras skyndsamt.
7. Informera berörda användare om det krävs.
8. Dokumentera åtgärder och lärdomar.

Säkerhetsärenden skickas till `security@minegenkontroll.se`.

## 10. Leverantörer och biträden

Kända leverantörer i nuläget:

- Supabase – databas, autentisering och lagring
- Vercel – hosting och drift
- Proton – e-post när domänmail aktiveras
- Hostinger – domän och DNS
- framtida betalningsleverantör – betalning och abonnemang

Inför skarp drift bör det kontrolleras att relevanta dataskyddsvillkor och personuppgiftsbiträdesavtal finns för de leverantörer som behandlar personuppgifter.

## 11. Saker som återstår före skarp drift

- Bilda eller bestäm juridisk avsändare och uppdatera policy/villkor.
- Skapa rekommenderade e-postadresser.
- Ta fram enkelt personuppgiftsbiträdesavtal för B2B-kunder.
- Bestäm faktisk lagringstid för supportärenden och tekniska loggar.
- Säkerställ export/radering i app eller via dokumenterad manuell rutin.
- Backup-/restore-rutin finns i `docs/SUPABASE_BACKUP_RESTORE_RUNBOOK.md`; första icke-destruktiva restore-testet ska loggas där före bredare publik beta.
- Dokumentera betalningsdata när betalflöde är valt.
