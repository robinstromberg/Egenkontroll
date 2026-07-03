# Kontrolltypseditor: visuell verifiering

Detta ar den manuella verifieringssparren for varje implementation-slice i kontrolltypseditorn.

Anvand den innan en slice anses klar. Syftet ar att hindra att editorn blir rorig, teknisk eller glider bort fran Figma-besluten.

Styrande underlag:

- `docs/CONTROL_TYPE_EDITOR_IMPLEMENTATION_BRIEF.md`
- Figma: https://www.figma.com/design/Nm5u7gV9zqSMTiscgiCSiM/Untitled?t=MbifXjG7VCH0spxY-0
- Figma-ytor:
  - `Temperaturflode - tydligare modell utan redundanta falt`
  - `Fler kontrollfloden - stadning sparbarhet varumottagning`
  - `Redigeringsflode - kontrolltyper / huvudforslag`

## Obligatoriskt per slice

1. Las implementation-briefen och kontrollera att slicen foljer ratt bygglage:
   - punktbaserad: temperatur, stadning, datummarkning, egenkontrollrunda
   - faltbaserad: sparbarhet
   - blandad: varumottagning
2. Ta eller granska en visuell jamforelse mot Figma/brief for desktop.
3. Ta eller granska en visuell jamforelse mot Figma/brief for mobilbredd.
4. Kontrollera previewn i editorn.
5. Oppna samma kontroll via Idag-flodet och kontrollera att dokumentationen fortfarande fungerar.
6. Kor relevanta kommandon:
   - `npm run typecheck`
   - `npm run lint`
   - `npm run build`

## Desktop-check

Kontrollera minst:

- Editorn visar ratt huvudmodell for kontrolltypen.
- Begreppen ar begripliga for en icke-teknisk admin.
- Previewn ligger nara personalens dokumentationsvy.
- Sekundara installningar kanns sekundara.
- Inga kort eller formulardelar ar onodigt trangt packade.
- Inga texter bryts mitt i ord eller hamnar utanfor sin behallare.

## Mobil-check

Kontrollera minst:

- Ingen horisontell overflow.
- Bottom navigation tackar inte over ett kritiskt formularkommando.
- Kort, knappar och inline-formular far plats utan brutna ord.
- Det gar att forsta var man ar i flodet utan att scrolla igenom en teknisk adminvy.
- Previewn gar att lasa utan att relationen mellan byggvy och dokumentationsvy forsvinner.

## Preview-check

Kontrollera minst:

- Previewn anvander samma kontrollrendering som dokumentationsflodet dar det ar mojligt.
- Temperatur visar ratt kontrollpunkter och gransvarden.
- Checklistor visar punkter/omraden med `OK / Ej OK`.
- Sparbarhet visar informationsfalt, inte objekt som huvudmodell.
- Varumottagning visar mottagningsdelar som leverantor, temperatur, markning och foljesedel/foto.
- Datum, tid och anvandare behandlas som systemdata, inte manuella standardfalt.
- Kommentar/atgard visas vid avvikelse eller `Ej OK`, inte som standardfalt i byggvyn.

## Idag-flode

Kontrollera minst:

- Kontrolltypen gar att oppna fran Idag.
- Personalen kan fylla i kontrollen.
- Avvikelseflodet fungerar nar gransvarde bryts eller `Ej OK` anges.
- Kontroll kan sparas utan nya fel.
- Flodet kanns inte lang-sammare eller mer tekniskt efter editorandringen.

## Guardrails som alltid ska namnas i issue/PR

Bekrafta uttryckligen:

- Ingen datamigration.
- Ingen RLS-andring.
- Ingen andring av historik/export/delning.
- Ingen drag and drop i forsta versionen.
- Ingen hard radering.
- Ingen ombyggnad av sparade run-/snapshot-format.

## Rekommenderad issue-kommentar nar en slice stangs

Anvand denna mall:

```md
Verifierat:
- [ ] Desktop jamford mot Figma/brief
- [ ] Mobilbredd jamford mot Figma/brief
- [ ] Preview i editorn kontrollerad
- [ ] Idag-flodet oppnat och kontrollen sparad
- [ ] npm run typecheck
- [ ] npm run lint
- [ ] npm run build

Inte andrat:
- Ingen datamigration
- Ingen RLS-andring
- Ingen historik/export/delning
- Ingen drag and drop
- Ingen hard radering
```

