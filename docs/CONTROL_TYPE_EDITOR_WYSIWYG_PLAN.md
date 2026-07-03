# Kontrolltypseditor: WYSIWYG-plan

> Historisk analys: detta dokument beskriver den tidigare WYSIWYG-riktningen.
> For implementation galler `docs/CONTROL_TYPE_EDITOR_IMPLEMENTATION_BRIEF.md`.

## Syfte

Nuvarande kontrolltypseditor fungerar tekniskt, men den visar inte tydligt hur kontrollen kommer kannas for personalen. Nasta steg bor vara en WYSIWYG-editor dar admin bygger i samma visuella struktur som personalen senare anvander.

Detta ar en analys- och designplan. Den innehaller ingen kodimplementation.

## Nuvarande arkitektur

Administrationen finns framst i:

- `src/components/AdminControls.tsx`
- `src/components/ControlTypesView.tsx`
- `src/components/ControlTypeDetailView.tsx`
- `src/services/controlAdminService.ts`

Dokumentationsflodet finns framst i:

- `src/components/ControlRunFormWithPhotos.tsx`
- `src/components/ControlRunForm.tsx`
- `src/services/controlRunWithAttachmentsService.ts`
- `src/services/controlRunService.ts`

Historik, export och delning laser sparade runs via:

- `src/services/historyService.ts`
- `src/services/shareRecords.ts`
- `src/components/HistoryView.tsx`
- `src/components/SharedRunList.tsx`
- `api/send-inspector-report.js`

Viktig observation: `ControlRunFormWithPhotos.tsx` har redan battre domanrendering for checklistor, temperatur, foto, leverantor och datum. Editorn i `ControlTypeDetailView.tsx` ar mer som en separat administrationsformularbyggare. Det ar roten till att vyerna kanns som olika appar.

## Datamodell

Karnmodellen:

- `control_types`: kontrollens namn, kategori, frekvens, instruktioner, status och `frequency_config`
- `control_objects`: kontrollpunkter/objekt, t.ex. kylar, omraden, produkter eller sparbarhetspunkter
- `control_field_definitions`: falt som personalen fyller i, t.ex. OK/Ej OK, temperatur, datum, foto, text
- `control_runs`: en sparad kontrollomgang
- `control_run_items`: sparade svar per kontrollpunkt/falt
- `deviations`: avvikelser skapade fran sparade svar
- `attachments`: bilder/filer kopplade till run item eller avvikelse
- `share_links` och RPC:er: tidsbegransad lasvy for inspektor/export

Det viktigaste skyddet for historik finns redan: `control_run_items` sparar `object_snapshot` och `field_snapshot`. Det betyder att historik kan visas korrekt aven om aktiv kontrollstruktur andras senare.

## Foreslagen komponentstruktur

Skapa en gemensam renderingskarnan for kontrollinnehall:

- `ControlDefinitionCanvas`
  - tar `controlType`, `objects`, `fields`, `mode`
  - mode: `use`, `edit`, senare eventuellt `preview`
  - renderar kontrollpunkter och falt i samma visuella struktur

- `ControlPointBlock`
  - visar en kontrollpunkt/objekt
  - i use mode: visar falten att fylla i
  - i edit mode: visar samma block med redigera, duplicera, flytta, arkivera

- `ControlFieldRenderer`
  - en gemensam komponent for faltvisning
  - kan rendera OK/Ej OK, Ja/Nej, temperatur, datum, text, foto, select
  - i edit mode oppnas inline-panel for faltets installningar

- `ControlDeviationRulePreview`
  - visar enkelt vad som skapar avvikelse
  - bor forst stodja befintliga regler: OK/Ej OK, boolean false, temperatur utanfor gransvarde

- `ControlEditorSheet`
  - bottom sheet eller inline-panel for redigering nara valt objekt
  - ersatter dagens langa formular langre ned pa sidan

Forsta implementationen bor inte flytta all logik pa en gang. Borja med att extrahera rendering fran `ControlRunFormWithPhotos.tsx`, eftersom den redan ar narmast malbilden.

## UX-flode

### Lagg till kontrollpunkt

Admin trycker `Lagg till kontrollpunkt` i canvasen. En ny block-rad skapas eller en bottom sheet oppnas med:

- namn
- plats, frivilligt
- instruktion, frivilligt
- gransvarde om kategorin ar temperatur

Efter sparning syns kontrollpunkten direkt som den kommer se ut i dokumentationslaget.

### Lagg till falt

Admin trycker `Lagg till falt` i kontrollen eller i en kontrollpunkt. Falttyper visas som tydliga val med ikon och namn:

- OK/Ej OK
- Ja/Nej
- Temperatur
- Datum
- Text
- Kommentar
- Foto
- Val

Undvik kryptiska kortetiketter som `D`, `F` och `OK` utan forklaring.

### Redigera inline

Tryck pa ett falt eller kontrollpunktsblock. Oppna en inline-panel eller bottom sheet med:

- namn/etikett
- falttyp
- obligatoriskt/frivilligt
- instruktion
- regler/gransvarden
- aktiv/arkiverad status

Panelen ska ligga nara det anvandaren redigerar och inte krava scroll till botten.

### Duplicera, flytta, arkivera

Kontrollpunktens actions i edit mode:

- Redigera
- Duplicera
- Flytta upp/ned
- Arkivera
- Ta bort endast om oanvand

Drag and drop kan vanta. Upp/ned-knappar ar sakrare for forsta versionen.

## Visuell riktning

- Anvand samma kort/block i edit mode och use mode.
- Mer kontrast mellan kontrollpunkter och bakgrund.
- Aktivt block ska ha tydlig markerad state.
- Falttyper ska ha riktiga labels och garna befintliga `public/ui-icons`.
- Checklistor bor visas med direkta val/checkboxliknande knappar dar det minskar knapptryck.
- Temperatur ska visa gransvarde och status nara input.
- Datum ska vara centrerat och visuellt konsekvent med andra falt.

## Riskbedomning

### Historik

Lag risk om befintliga snapshots fortsatter anvandas. Hogre risk om falttyper eller objekt raderas hardt. Darfor ska hard delete inte vara standard.

### Dagens kontroller

Medel risk. Om renderingslogik extraheras fel kan dagliga kontrollflodet paverkas. Dela ut komponenter i smala steg och verifiera de vanligaste kontrolltyperna efter varje steg.

### Export, delning och inspektorsvy

Medel risk vid datamodellandringar. Lagg inte om snapshots eller RPC-format i forsta UX-stegen.

### Migration

Ingen migration kravs for forsta visuella stegen. Migration kravs sannolikt for robust sortering, duplicering, arkivering/versionering och eventuell relation mellan falt och specifika kontrollpunkter.

## Rekommenderade implementation issues

1. Extrahera gemensam kontrollcanvas
   - Skapa `ControlDefinitionCanvas`, `ControlPointBlock` och `ControlFieldRenderer`.
   - Anvand forst i dokumentationsvyn utan att andra beteenden andras.

2. Anvand kontrollcanvas i editorn som read-only preview
   - Visa kontrolltypen sa som personalen ser den.
   - Behall befintliga formular for sparning vid sidan av tills previewn ar stabil.

3. Lagg inline-redigering for kontrollpunkt
   - Redigera namn, plats, instruktion, maxgrans och aktiv status nara valt block.

4. Lagg inline-redigering for falt
   - Redigera label, obligatoriskt och aktiv status nara faltet.
   - Byt kryptiska falttypsmarkorer mot tydliga labels/ikoner.

5. Forbattra falttypsvalet
   - Ersatt dagens falttyp-grid med ikon + label + kort forklaring.
   - Garantera att valt faltnamn visas direkt i previewn.

6. Saker flytt och duplicering
   - Borja med flytta upp/ned.
   - Duplicera kontrollpunkt inklusive relevanta standarddata.
   - Kraver kontroll av `sort_order`.

7. Arkivering och radering
   - Infor regel: oanvanda objekt/falt kan tas bort, anvanda ska arkiveras.
   - Kraver kontroll mot `control_run_items`.
   - Separat migration eller RPC kan behovas.

8. Versionering av historiskt betydelsefulla andringar
   - Utred separat innan implementation.
   - Galler falttyp, avvikelseregler och gransvarden.

## Rekommenderad ordning

Sakraste vagen:

1. Dela renderingskomponenter utan datamigration.
2. Visa samma preview i editorn.
3. Lagg inline-redigering ovanpa befintliga uppdateringsfunktioner.
4. Forbattra visuella labels/ikoner.
5. Forst darefter: flytt, duplicering, arkivering, versionering.

Det gor att appen kan narma sig designmalet utan att riskera historik, export eller dagens kontrollflode i ett stort steg.
