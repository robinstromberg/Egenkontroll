# @min-egenkontroll/design-system

Paketet innehåller endast verifierat generella och redan använda delar av designsystemet. Det har inga imports från routing, auth, Supabase, appservices eller appens domäntyper.

## Exporter

- paketroten: `Alert`, `Badge`, `Button`, `LinkButton`, `Card`, `Field`, `SearchField`, `TextField` och deras publika typer,
- `@min-egenkontroll/design-system/tokens.css`: semantiska tokens för ljust, mörkt och systemstyrt tema,
- `@min-egenkontroll/design-system/base.css`: grundstilar för de exporterade primitiverna.

React och React DOM är peer dependencies. Appspecifika kompositioner och ikoner ligger kvar i respektive app.
