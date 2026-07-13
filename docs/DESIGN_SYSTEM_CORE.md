# Designsystemets kärna

Den här kärnan är en liten produktionsgrund för Min Egenkontroll. Den ersätter inte befintliga vyers CSS och innebär ingen generell redesign.

## Tokens

`src/styles/tokens.css` är den gemensamma källan för semantiska värden. Använd betydelser i stället för råa färger:

- ytor och text: `--ds-canvas`, `--ds-surface`, `--ds-text`, `--ds-text-secondary`, `--ds-border`;
- handling och fokus: `--ds-action-*`, `--ds-focus`;
- status: `--ds-status-{success|warning|danger|neutral}-{fg|bg|border}`;
- rytm: `--ds-font-*`, `--ds-space-*`, `--ds-radius-*`, `--ds-shadow-*`.

Light och dark har egna semantiska värden. Låt systempreferensen vara standard och sätt endast `data-theme="light"` eller `data-theme="dark"` när en avsiktlig lokal eller framtida global inställning finns.

## Komponenter

Primitiverna ligger i `src/components/ui/` och använder namespacade `ds-`-klasser för att inte krocka med befintlig vy-CSS.

- `Button` och `LinkButton`: använd native `button` respektive `a`; de har 44 px minsta tryckyta, synligt fokus och separata disabled/loading-tillstånd.
- `Badge`: visa alltid begriplig text tillsammans med statusfärg.
- `TextField` och `SearchField`: placeholder ersätter aldrig label.
- `Field`: kopplar label, hjälptext och feltext till fältet med rätt ARIA-attribut.
- `Alert`: är statisk som standard; använd `live="polite"` för normal status och `live="assertive"` för blockerande fel.
- `Card`: avgränsar verkliga innehållsgrupper, inte varje godtycklig sektion.

## Användningsregler

Migrera en vy eller komponent i taget efter visuell och tillgänglighetsmässig kontroll. Ändra inte auth, kontrollsparning, avvikelser, historik, export eller andra skyddade flöden som del av en generell stylesanering.

Utvecklingsshowcase finns på `/utveckling/designsystem` endast när Vite kör i utvecklingsläge. Den är inte länkad från vanliga flöden och `/utveckling/` är blockerad i `robots.txt`.
