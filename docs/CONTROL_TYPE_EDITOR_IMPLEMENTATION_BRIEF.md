# Kontrolltypseditor: implementation-brief

Detta dokument ar det styrande kontraktet for forsta implementationen av den nya kontrolltypseditorn.

Figma-filen som ligger till grund for besluten:

- https://www.figma.com/design/Nm5u7gV9zqSMTiscgiCSiM/Untitled?t=MbifXjG7VCH0spxY-0

Styrande Figma-ytor:

- `Temperaturflode - tydligare modell utan redundanta falt`
- `Fler kontrollfloden - stadning sparbarhet varumottagning`
- `Redigeringsflode - kontrolltyper / huvudforslag`

Den aldre `docs/CONTROL_TYPE_EDITOR_WYSIWYG_PLAN.md` ar historisk analys. Vid konflikt galler denna brief.

## Begrepp

- **Kontrolltyp**: rutinen som ska utforas, till exempel `Kyltemperaturer`, `Stadning` eller `Sparbarhet`.
- **Matning**: vad personalen registrerar inom kontrolltypen, till exempel temperatur.
- **Kontrollpunkt/objekt**: platsen eller saken som kontrolleras, till exempel `Kyl 1 - Kok`, `Servering` eller `Forrad`.
- **Falt**: ett informationsfalt som personalen fyller i, till exempel `Produkt`, `Batchnummer` eller `Bast fore`.
- **Systemdata**: datum, tid och anvandare. Detta sparas automatiskt nar en kontroll utforas.
- **Avvikelse**: skapas nar ett gransvarde bryts eller nar `Ej OK`/motsvarande anges. Atgard eller kommentar visas da, inte som standardfalt i byggvyn.

## Bygglagen

Editorn ska anvanda samma visuella sprak for alla kontrolltyper, men den ska inte tvinga in alla kontrolltyper i samma modell.

### Punktbaserad

Anvands for temperatur, stadning, datummarkning och egenkontrollrunda.

Admin bygger kontrollpunkter:

- temperatur: `Kyl 1 - Kok`, `Kyl 2 - Servering`, `Frys 1 - Lager`
- stadning: `Kok`, `Servering`, `Toaletter`
- datummarkning: produkter eller omraden som ska kontrolleras
- egenkontrollrunda: omraden som ska kontrolleras

For temperatur ska admin inte skapa ett extra falt som heter `Temperatur`. Temperaturen ar matningen for kontrolltypen. Admin ska skapa/redigera kontrollpunkter och ange namn, gransvarde, enhet och instruktion.

### Faltbaserad

Anvands for sparbarhet.

Admin bygger informationsfalt som personalen fyller i:

- `Produkt`
- `Batchnummer`
- `Bast fore`
- `Leverantor`
- `Foto / etikett`

Objekt/kontrollpunkter ska inte vara huvudmodellen for sparbarhet i forsta versionen.

### Blandad

Anvands for varumottagning.

Admin bygger delar som kan vara olika typer:

- `Leverantor`
- `Temperatur`
- `Korrekt markning`
- `Foljesedel`

Temperaturdelen kan ha gransvarde. Foto visas som en del av mottagningsflodet. Preview ska visa hur personalen faktiskt fyller i kontrollen.

## Guardrails for forsta versionen

Detta far inte goras i forsta implementationen:

- Ingen datamigration.
- Ingen RLS-andring.
- Ingen andring av historik, export eller delning.
- Ingen drag and drop.
- Ingen hard radering.
- Ingen ombyggnad av sparade run-/snapshot-format.
- Ingen specialdatamodell for kontrolltypseditorn.

Detta ska galla i alla slices:

- Inaktivera/arkivera i stallet for hard delete.
- Datum, tid och anvandare ska betraktas som systemdata.
- Kommentar/atgard ska visas vid avvikelse eller `Ej OK`, inte som standardfalt i byggvyn.
- Dokumentationsflodet fran Idag-vyn far inte bli langsammare eller ga sonder.
- Preview i editorn ska bygga pa samma kontrollrendering som dokumentationsflodet dar det ar mojligt.

## Forsta implementationens prioritet

Implementera i sma slices, med temperatur som forsta vertikala slice.

1. Lasa briefen och lagga GitHub-issues.
2. Etablera bygglageslogik och copy utan datamodellandring.
3. Temperaturflode: kontrollpunkter med maxgrans, enhet och instruktion.
4. Punktbaserade checklistor: stadning, datummarkning och egenkontrollrunda.
5. Sparbarhet: faltbaserad byggvy.
6. Varumottagning: blandad byggvy.
7. Visuell verifiering innan merge for varje slice.

## Acceptansprinciper

Varje implementation-issue ska kunna verifieras separat.

Minimikrav per slice:

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Mobil bredd ska kontrolleras visuellt.
- Ingen text far tryckas ihop, hamna utanfor eller bli svar att tolka.
- Preview ska jamforas mot styrande Figma-yta.
- Idag-flodet ska fortfarande ga att oppna och spara relevant kontroll.
- Historik/export/delning ska inte andras av slicen.

## Fardig definition for editor-v1

Editor-v1 ar klar nar admin kan forsta och redigera de viktigaste kontrolltyperna utan tekniska begrepp:

- Temperatur byggs som kontrollpunkter med gransvarden.
- Checklistor byggs som punkter/omraden med `OK / Ej OK`.
- Sparbarhet byggs som informationsfalt.
- Varumottagning byggs som blandade delar.
- Preview visar samma logik som personalens dokumentationsvy.
- Alla guardrails ovan ar uppfyllda.
