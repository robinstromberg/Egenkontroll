# Kontoadministration

Det här dokumentet beskriver målbilden för e-post, lösenord och framtida 2FA-förberedelse. Det implementerar ingen ny autentiseringslogik.

## Grundprincip

Kontot representerar personen. Workspacet representerar verksamheten.

Kontoåtgärder ska inte blandas ihop med workspace- eller medlemskapsåtgärder.

Exempel:

- Byta lösenord gäller användarkontot.
- Byta e-post gäller användarkontot.
- Byta roll gäller medlemskapet i ett workspace.
- Byta plan gäller workspacet.

## Nuläge

Appen har e-postbaserad inloggning med konto/lösenord och magic link som reserv.

Framtida kontoadministration ska bygga vidare på Supabase Auth utan att låsa ute befintliga användare eller ändra den dagliga appupplevelsen.

## Framtida kontoinställningar

En framtida kontovy bör kunna visa:

- inloggad e-post
- profilnamn
- möjlighet att byta lösenord
- möjlighet att initiera e-postbyte
- återställning av lösenord via befintligt authflöde
- tydlig information om vilka inställningar som hör till konto respektive workspace

## 2FA-förberedelse

2FA ska bara förberedas arkitektoniskt tills separat issue finns.

Det innebär:

- ingen 2FA-UI nu
- ingen 2FA-inloggningslogik nu
- inga krav på 2FA för befintliga användare
- inga backup-koder, SMS-koder eller authenticator-flöden nu
- ingen ny auth-provider utan separat beslut

Målet är att framtida 2FA inte ska kräva att konto, medlemskap och workspace blandas ihop.

## Separation mellan nivåer

Kontoadministration:

- e-post
- lösenord
- profil
- framtida 2FA

Medlemskap:

- roll
- status
- åtkomst till workspace

Workspace:

- verksamhetsnamn
- kontrolltyper
- historik
- prenumeration
- delning och export

## Guardrails

När kontoadministration implementeras ska Codex:

- skilja på konto, medlemskap och workspace
- inte implementera 2FA utan separat issue
- inte ändra inloggning så användare kan låsas ute
- inte ändra RLS eller säkerhetsmodell utan separat säkerhetsissue
- inte kräva ny e-postadress för befintlig användare
- inte koppla kontoåtgärder till ett specifikt workspace
- testa befintlig login, logout och workspaceåtkomst

## Klart när

Området är produktmässigt uppfyllt när:

- kontoinställningar är tydligt avgränsade från workspaceinställningar
- framtida 2FA är dokumenterad som förberedelse, inte implementation
- befintligt inloggningsflöde påverkas minimalt
- daglig kontrollanvändning inte störs
