# Konto, workspace och medlemskap

Det här dokumentet är målbilden för konto-, workspace- och medlemskapsarkitekturen. Det implementerar ingen ny funktionalitet nu.

## Grundprincip

Ett konto representerar en person. Ett workspace representerar platsen där arbete och data finns.

En person kan vara medlem i flera workspaces. Rollen hör till medlemskapet, inte till kontot.

## Målmodell

```text
account/profile
  -> workspace
  -> membership
  -> role
  -> subscription
  -> add-ons
```

I nuvarande MVP motsvarar `organizations` ett företagsworkspace.

## Konto

Kontot ska bära:

- inloggning
- e-post
- profiluppgifter
- personliga inställningar

Kontot ska inte vara hårt bundet till ett enda företag.

## Workspace

Ett workspace ska bära:

- namn och identitet
- bransch/workspace-typ
- kontrolltyper
- kontrollhistorik
- medlemmar
- prenumeration
- delning/export

Första aktiva workspace-typen är företag/verksamhet. Framtida workspace-typer kan exempelvis vara privatläge eller andra kontrollmiljöer.

## Medlemskap och roller

Medlemskapet kopplar person till workspace.

Samma person ska kunna vara:

- owner i ett workspace
- admin i ett annat
- staff i ett tredje

Roller ska därför aldrig modelleras som en global egenskap på profilen.

## Prenumeration

Prenumerationen ska tillhöra workspacet, inte användarkontot.

Det gör att en person kan:

- betala för ett eget företag
- vara personal i någon annans företag
- senare äga flera separata workspaces

Betalningsleverantör ska inte hårdkodas i konto- eller medlemskapsmodellen.

## Inbjudningar

Ett inbjudningsflöde bör stödja:

- befintlig användare accepterar inbjudan
- ny användare skapar konto och kopplas till rätt workspace
- samma e-post skapar inte dubbla konton
- roll och status lagras på medlemskapet

## Byte av workspace

Efter inloggning bör användaren ha ett aktivt workspace. Ett framtida workspace-byte ska endast byta kontext, inte konto.

## Nuvarande datamodell

Nuvarande modell ligger nära målbilden:

- `profiles` fungerar som person/profil.
- `organizations` fungerar som första workspace-typ.
- `organization_memberships` kopplar person till workspace och bär roll/status.
- `control_types`, `control_runs`, `deviations`, `attachments` och `share_links` är kopplade till organization/workspace.

## Framtida försiktiga steg

1. Fortsätt behandla `organizations` som workspace i kod och dokumentation.
2. Undvik antaganden om att en användare bara har en organisation.
3. Lägg till workspace-väljare först när flera medlemskap ska stödjas i UI.
4. Lägg till prenumerationsmodell på workspace när betalning byggs.
5. Lägg privatläge ovanpå samma workspace- och kontrollmotor, inte som separat kontoapp.

## Utanför scope nu

- Ingen workspace-väljare.
- Ingen betalningsintegration.
- Ingen privatläge-implementation.
- Ingen databasändring enbart för målbilden.
