# Support och hjälpcenter

Det här dokumentet beskriver målbilden för hjälp och support utan att störa kontrollflödet. Det implementerar inget komplett hjälpcenter.

## Grundprincip

Hjälp ska vara lätt att hitta men aldrig påträngande.

Daglig dokumentation ska fortsätta vara snabb, ren och fri från obligatoriska guider.

## Vanliga hjälpområden

Ett framtida hjälpcenter bör kunna täcka:

- kom igång
- skapa kontroller
- utföra dagens kontroller
- hantera avvikelser
- visa historik
- dela med kontrollant
- exportera PDF/CSV
- hantera användare
- betalning och abonnemang
- säkerhet och dataskydd

## Placering

Hjälp bör primärt ligga i meny eller annan administrativ yta.

Kontextuell hjälp kan finnas nära svåra flöden, men ska vara frivillig och diskret.

Exempel på säkra mönster:

- länk till hjälp
- kort FAQ
- tomt läge med förklarande text
- kontaktväg till support
- felsökningslista när något misslyckas

Mönster som ska undvikas i kärnflödet:

- obligatoriska popups
- långa guider innan kontroll kan utföras
- blockerande utbildningssteg
- visuellt tunga hjälppaneler i kontrollformulär

## Framtida supportvägar

Möjliga framtida kontaktvägar:

- e-post
- formulär
- länkar till hjälptexter
- supportsystem efter separat beslut
- AI-assistent efter separat issue

Extern supportplattform ska inte införas utan separat produkt- och integritetsbeslut.

## Guardrails

När hjälp eller support implementeras ska Codex:

- inte lägga in störande modaler i dagligt kontrollflöde
- inte kräva utbildning för att utföra kontroller
- inte göra kontrollvyer visuellt tyngre
- inte bygga AI-assistent utan separat issue
- inte införa extern supportplattform utan separat beslut
- verifiera att dagens kontroller fortfarande är lika snabba att nå

## Klart när

Området är produktmässigt uppfyllt när:

- det finns en tydlig plan för hur hjälp nås
- hjälp inte stör dagligt kontrollflöde
- vanliga användarfrågor är identifierade
- supportfunktioner kan byggas stegvis
- det är tydligt vad som kräver separat issue
