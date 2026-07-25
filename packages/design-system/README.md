# @min-egenkontroll/design-system

Paketet innehåller endast verifierat generella och redan använda delar av designsystemet. Det har inga imports från routing, auth, Supabase, appservices eller appens domäntyper.

## Exporter

- paketroten: `Alert`, `Badge`, `Button`, `LinkButton`, `Card`, `Field`, `SearchField`, `TextField` och deras publika typer,
- `@min-egenkontroll/design-system/tokens.css`: semantiska tokens för ljust, mörkt och systemstyrt tema,
- `@min-egenkontroll/design-system/theme`: typad upplösning av statiska temaytor vid build,
- `@min-egenkontroll/design-system/theme-contract.json`: kanoniskt, maskinläsbart light-/dark-kontrakt,
- `@min-egenkontroll/design-system/base.css`: grundstilar för de exporterade primitiverna.

React och React DOM är peer dependencies. Appspecifika kompositioner och ikoner ligger kvar i respektive app.

## Ändra tema

Ändra endast `theme-contract.json` och kör sedan `npm run visual:sync` från reporoten. Kommandot genererar `styles/tokens.css` och synkar appens statiska metadata- och PWA-värden. `npm run visual:check` och `npm run contracts` stoppar avvikelser mellan kontrakt och konsumentytor.

`appThemeColor`, appens båda PWA-färger och `webThemeColor` pekar på namngivna tema-/tokenpar. De ska inte ersättas med lokala färgliteraler.
