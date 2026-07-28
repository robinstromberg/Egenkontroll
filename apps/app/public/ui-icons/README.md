# UI icons

Lägg bildfiler som används som UI-ikoner här och registrera varje produktionsikon i `apps/app/src/config/assets.ts`. Komponenter och CSS får inte använda en rå `/ui-icons/...`-path.

Exempel:

- ikoner för kontrolltyper
- ikoner för knappar
- små illustrationsikoner som används i appens gränssnitt

Rekommenderad namngivning:

- använd små bokstäver
- använd bindestreck
- undvik å, ä och ö i filnamn

Exempel:

- `kyltemperatur.png`
- `stadning.png`
- `sparbarhet.png`
- `varumottagning.png`
- `allergener.png`

Placera inte brand/logotyp-filer här. Deras masterfiler hör hemma i `packages/brand/assets/`.

Registryregler:

- använd exakt filnamn och skiftläge; produktionsnamn ska vara gemener med bindestreck,
- välj en begriplig standardfallback i registryn; `AssetIcon` får bara få en kontextuell fallback när befintligt uttryck behöver bevaras,
- kör `npm run menu-admin:test --workspace @min-egenkontroll/app` så att filens existens, skiftläge, registry och råpathförbud verifieras,
- lägg brandmasterfiler i `packages/brand/assets/`; `apps/*/public/brand/` är genererade och får inte redigeras manuellt.
