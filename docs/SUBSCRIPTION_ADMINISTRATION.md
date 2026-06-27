# Prenumerationsadministration

Det här dokumentet beskriver målbilden för plan, status och återaktivering. Det implementerar ingen betalningsintegration.

## Grundprincip

Prenumerationen tillhör workspacet/verksamheten, inte användarkontot.

En person kan vara medlem i flera workspaces men ska bara betala för de workspaces där personen är betalningsansvarig eller owner.

## Nuläge

Appen har redan grundbegrepp för:

- `subscription_status`
- `billing_plan`
- `trial_started_at`
- `trial_ends_at`

`MenuView` visar också nuvarande abonnemangsstatus och testperiod för verksamheten.

## Leverantörsoberoende

Arkitektur och UI-copy ska använda neutrala begrepp:

- plan
- testperiod
- betalningsstatus
- betalningsansvarig
- förnyelsedatum
- betalningsmetod
- aktivt tillägg

Teknisk leverantör, till exempel Swish, Stripe, Klarna eller annan lösning, ska beslutas i separat issue.

## Framtida vy

En framtida prenumerationsvy bör kunna visa:

- aktuell plan
- aktuell status
- testperiod och återstående tid
- eventuella aktiva tillägg
- kommande förnyelse eller slutdatum
- betalningsansvarig
- länk eller knapp till planändring när betalningsflöde finns
- paus, avslut och återaktivering när livscykelflöden finns

## Statusmodell

Nuvarande statusar kan fortsätta vara:

- `inactive`
- `trial`
- `active`
- `past_due`
- `cancelled`

Nya statusar ska inte läggas till utan separat datamodell- och migrationsissue.

## Team och tillägg

Teamfunktioner eller liknande ska behandlas som workspace-tillägg.

Tillägg ska kunna aktiveras eller avaktiveras utan att:

- medlemskap förstörs
- historik raderas
- kontrollflödet påverkas
- export eller inspektörsvy ändras oväntat

## Guardrails

När prenumerationsadministration implementeras ska Codex:

- inte välja eller hårdkoda betalningsleverantör
- inte ändra prislogik utan produktbeslut
- inte koppla prenumeration till enskild användare
- inte blockera daglig kontroll utan tydligt beslut
- inte ändra RLS eller datamodell utan separat issue
- inte röra befintligt kontrollflöde
- verifiera att `Idag`, historik och inspektörsvy fungerar som tidigare

## Klart när

Området är produktmässigt uppfyllt när:

- företagaren kan förstå aktuell abonnemangsstatus
- prenumerationen tydligt tillhör workspacet
- betalningsleverantör fortfarande är utbytbar
- planändring, paus, avslut och återaktivering har en riktning
- daglig användning inte påverkas negativt
