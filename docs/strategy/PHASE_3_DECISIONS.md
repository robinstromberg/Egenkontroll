# Låsta beslut – Fas 3

Datum: 2026-07-10  
Godkänt av produktägaren i samband med Epic #243.

Det här dokumentet kompletterar `docs/strategy/PIVOT.md`, `docs/strategy/CURRENT_STATE_INVENTORY.md` och `docs/strategy/CONTENT_MIGRATION_MAP.md`. Besluten nedan är låsta arbetsbeslut för wireframes och efterföljande implementation. De ska inte omprövas i varje ny issue om inte produktägaren uttryckligen öppnar beslutet igen.

## 1. Positionering och plattformslöfte

Intern strategisk riktning:

> **Sveriges bästa hjälp med egenkontroll.**

Plattformslöfte:

> **Allt du behöver för att förstå, göra och dokumentera egenkontroll.**

Appen förblir kärnprodukten och den viktigaste intäktskällan. Den publika plattformen ska först ge verklig hjälp och därefter visa appen som ett naturligt nästa steg när den är relevant.

## 2. Publik informationsstruktur

Den publika plattformens huvuddelar är:

1. Kunskap
2. Mallar och checklistor
3. Verktyg
4. Utbildning
5. Referenser och källor
6. Appen

`/kunskapsbank` utvecklas till resursbiblioteket som knyter ihop guider, faktasidor, ämnesnav, mallar, checklistor och verktyg.

## 3. Första pilot och minisystem

Första pilotklustret är:

> **HACCP och riskstyrning för små livsmedelsverksamheter.**

Piloten ska testa hela den nya strategin i liten skala och omfatta:

- startsidan `/`,
- ämnesnavet `/haccp-sma-livsmedelsforetag`,
- faktasidorna `/faroanalys-livsmedel`, `/avvikelser-korrigerande-atgarder-livsmedel` och `/verifiering-egenkontroll-livsmedel`,
- mall-/checklistekandidaten `/seo/kontrollplan.html`,
- en verktygs-/generatorkandidat kopplad till faroanalys,
- resursbiblioteket `/kunskapsbank`,
- inloggning och signup.

Piloten får inte framställa appen som ett fullskaligt HACCP-system. Befintliga URL:er ska bevaras och inga sammanslagningar eller omdirigeringar görs utan data.

## 4. Visuell arbetsriktning

Den visuella riktningen är låst som arbetsriktning:

- varm vit, svart och grafit som bas,
- cirka 95 procent neutralt och färg främst där något händer,
- grönt för klart/godkänt,
- gult eller orange för uppmärksamhet eller väntande,
- rött för avvikelse eller problem,
- hög kontrast,
- light mode och dark mode med semantiska färgvärden, inte enkel invertering,
- ny logga och ikon,
- lugnt, skandinaviskt, tydligt och auktoritativt,
- mer tillfredsställande än myndighetstjänster utan att bli lekfullt eller oseriöst.

## 5. Teknisk målbild och genomförandeordning

Teknisk målbild:

```text
apps/web
apps/app
packages/brand
```

Domänmålbild:

- `minegenkontroll.se` för den publika plattformen,
- `app.minegenkontroll.se` för arbetsverktyget.

Genomförandeordningen ligger fast:

1. uppgiftsanpassade wireframes,
2. teknisk separation och gemensamt brand-/designsystem,
3. första kompletta minisystem,
4. successiv migration av befintligt innehåll,
5. skalning.

Buggar och viktig produktutveckling i appen fortsätter parallellt i separata issues, branches och PR:er.

## Konsekvens för nästa fas

Fas 3 är avslutad. Nästa större pivotarbete är Fas 4: uppgiftsanpassade wireframes. Wireframes ska bygga på de låsta besluten ovan och på migrationskartan, inte starta en ny bred strategidiskussion.
