# Organisationsstruktur, behörigheter och dataägarskap

Det här dokumentet beskriver målbilden för workspace/organisation, framtida anläggningar, behörigheter, dataägarskap och successionshantering. Det implementerar ingen ny funktionalitet.

## Grundprincip

Verksamhetsdata tillhör workspacet/verksamheten, inte en enskild person.

En användare kan lämna ett workspace utan att historik, dokumentation eller kontrollmiljö försvinner.

## Workspace som central enhet

Nuvarande `organizations` fungerar som MVP:ns workspace.

All verksamhetsdata ska förstås som workspace-data, exempelvis:

- kontrolltyper
- kontrollpunkter
- utförda kontroller
- avvikelser
- åtgärder
- bilagor
- historik
- rapporter
- export
- delningslänkar

## Konto, medlemskap och roll

Ett konto representerar en person. Medlemskapet kopplar personen till ett workspace.

Rollen hör till medlemskapet, inte till personens globala profil.

Det gör att samma person på sikt kan vara:

- owner i ett workspace
- admin i ett annat
- personal i ett tredje

## Roller och framtida behörigheter

UI:t kan fortsätta visa enkla roller:

- Owner
- Admin
- Personal

Men arkitekturen bör inte hindra att roller senare blir paket av behörigheter.

Exempel på framtida behörigheter:

- hantera användare
- hantera kontrolltyper
- utföra kontroller
- se historik
- exportera dokumentation
- skapa delningslänkar
- hantera abonnemang
- hantera ägarskap

Behörigheter ska införas stegvis och inte göra UI:t mer komplext för enkla workspaces.

## Framtida anläggningar

Systemet ska inte låsas till att ett workspace alltid är en fysisk plats.

Framtida modell kan behöva stödja:

- flera caféer
- flera kök
- flera produktionsplatser
- lager och butik
- säsongsytor
- användare med åtkomst till viss anläggning
- rapporter filtrerade på anläggning

Anläggningar ska inte införas i dagligt flöde förrän behovet finns.

## Successionshantering

Det ska finnas en framtida väg för:

- ägarbyte
- ny betalningsansvarig
- verksamhet som säljs
- ägare som slutar
- ägare som blir sjuk eller avlider

Detta ska ske säkert, spårbart och utan att verksamhetens data försvinner.

## Relation till andra dokument

Detta dokument kompletterar:

- `docs/WORKSPACE_MEMBERSHIP_ARCHITECTURE.md` för konto, workspace och medlemskap
- `docs/WORKSPACE_LIFECYCLE.md` för workspacets resa över tid
- `docs/AUDIT_TRAIL_AND_VERSIONING.md` för spårbarhet vid ägarbyte och rolländringar
- `docs/PRODUCT_PRINCIPLES.md` för enkelhet i kärnflödet

## Guardrails

När organisationsstruktur eller behörigheter bryts ut i implementation ska Codex:

- inte ändra RLS utan separat säkerhetsissue
- inte ändra datamodell utan separat migration och tydlig testväg
- inte göra UI:t mer komplext för användare med ett workspace och en plats
- inte införa anläggningar i dagligt flöde förrän det behövs
- inte koppla verksamhetsdata till en enskild person
- inte bryta befintlig historik eller export
- inte implementera ägarbyte utan spärrar, bekräftelser och audit trail
- verifiera att dagens kontroller och inspektörsvy fortfarande fungerar

## Framtida child issues

Följande ska hanteras separat:

- utred organisationsstruktur: workspace, organisation och anläggning
- planera behörigheter som grund under roller
- definiera dataägarskap för verksamhetsdata
- planera åtkomst per anläggning
- planera säker successionshantering och ägarbyte
- säkerställ att export och rapporter kan filtreras per anläggning i framtiden
