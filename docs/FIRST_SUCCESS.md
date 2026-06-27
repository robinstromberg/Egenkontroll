# First success: från registrering till första kontroll

Det här dokumentet beskriver första lyckade upplevelsen i Egenkontroll. Det implementerar ingen ny funktionalitet.

## Mål

En ny företagare ska snabbt känna att appen fungerar:

> Jag har skapat min verksamhet, sett vad som ska göras och sparat min första kontroll.

Första lyckade upplevelsen är inte färdig när kontot är skapat. Den är färdig när minst en kontroll är sparad och användaren förstår var dokumentationen hamnar.

## Önskad resa

Den kortaste trygga vägen bör vara:

1. Skapa konto eller logga in.
2. Skapa verksamhet.
3. Välj enkel startmall.
4. Se dagens första kontroll.
5. Utför kontrollen.
6. Få tydlig bekräftelse att dokumentationen sparats.
7. Hitta tillbaka till historiken.

## Nuläge

Nuvarande app har redan flera byggstenar:

- `AuthPanel` hanterar login, kontoskapande och magic link.
- `OrganizationSetup` skapar verksamhet, förhandslanseringsstatus och startmallar.
- `TodayDashboard` visar dagens kontroller.
- Kontrollflödet sparar utförda kontroller.
- `SavedControlView` ger väg till historik efter sparad kontroll.
- `HistoryView` visar sparade kontroller.

## Produktprincip

Onboarding ska hjälpa användaren framåt utan att störa återkommande användare.

En eventuell startchecklista ska:

- vara kort
- vara frivillig eller kontextuell
- försvinna eller tonas ned när första kontrollen är sparad
- aldrig lägga extra steg i daglig kontroll

## Minsta framtida förbättringar

Om första upplevelsen behöver stärkas bör förändringen göras i små steg:

1. Förtydliga efter verksamhetsskapande vilken kontroll användaren ska börja med.
2. Prioritera en tydlig primär väg från onboarding till `Idag`.
3. Behåll dagens kontrollflöde oförändrat.
4. Efter första sparade kontrollen, visa tydligt att kontrollen finns i historik.
5. Mät eller manuellt testa att nya användare inte fastnar före första kontrollen.

## Guardrails

När detta bryts ut i implementation ska Codex:

- kartlägga befintlig onboarding först
- välja minsta möjliga ändring
- inte ändra betalning eller abonnemang
- inte ändra RLS eller datamodell
- inte lägga in störande modaler eller obligatoriska guider
- inte göra daglig kontroll långsammare
- verifiera registrering, verksamhetsskapande, första kontroll och historik

## Klart när

Det här området är produktmässigt uppfyllt när:

- första lyckade upplevelsen är definierad
- appens startresa pekar mot första sparade kontroll
- användaren hittar historiken efter första kontrollen
- befintliga användare inte störs av onboardinghjälp
- kärnflödet är minst lika snabbt som före ändringen
