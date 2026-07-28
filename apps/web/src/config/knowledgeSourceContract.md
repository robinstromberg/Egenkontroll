# Källspårbarhetskontrakt för kunskapsartiklar

`knowledgeSourceContract.ts` är den centrala registreringen för Fas A i #368 och #370.

När en ny artikel registreras:

1. Lägg källan i `knowledgeSources` med ett stabilt ID, exakt URL, källtyp, relevanta avsnitt, faktakontrolldatum, åtkomstdatum och eventuell rättslig hänvisning.
2. Återanvänd en versionssatt post i `knowledgeDisclaimers` när samma regulatoriska begränsning används på flera artiklar.
3. Använd en versionssatt post i `knowledgeLanguagePolicies` för reglerna som skiljer lagkrav, myndighetsvägledning, rekommendation, exempel och osäkerhet.
4. Ge artikeln ett stabilt `id`, ange `sourceIds`, `languagePolicyIds`, `disclaimerIds` och `aiInterpretation`.
5. Ange `sourceIds` på varje materiellt block. Använd `claims` endast när ett block blandar källor eller klassificeringar; varje claim ska ha ett stabilt ID och egna `sourceIds`.

`migratedKnowledgeArticleSourceImpactIndex` genereras från artiklarna. Lägg inte till manuella omvända indexposter. Kontraktet stoppar okända referenser, dubbletter, ogiltiga URL:er och materiella block utan källkoppling.

Fas A innehåller ingen crawler, schemalagd bevakning, hashning, AI-genererad ändrings-PR eller automatisk publicering. Alla regulatoriska ändringar kräver mänsklig granskning.
