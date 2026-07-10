# Migrationskarta för innehåll

Issue: #247
Datum: 2026-07-10
Bygger på: #243, #245, PR #246, `docs/strategy/PIVOT.md` och `docs/strategy/CURRENT_STATE_INVENTORY.md`

Det här dokumentet översätter nulägesinventeringen till en praktisk migrationskarta. Det tar inte bort, slår ihop, omdirigerar, skriver om, designar om eller bygger om någon sida.

Grundrekommendationen är att bevara befintliga URL:er tills det finns tydliga data om trafik, Search Console, inlänkar, konvertering eller produktvärde som motiverar en ändring.

## Vägledande princip

Migrationen ska följa pivotens princip:

**Hjälp först -> bygg förtroende -> låt användaren prova värdet -> visa sedan att samma arbete kan göras ännu enklare i appen.**

Det innebär att:

- informationssidor ska svara på användarens fråga innan appen visas,
- resurssidor ska leverera den utlovade mallen, checklistan eller verktyget innan något efterfrågas,
- sidor med hög köpavsikt kan visa appen tydligt,
- beslut om URL:er, sammanslagningar och omdirigeringar ska vänta på underlag när det finns meningsfull SEO-risk.

## 1. Migrationskarta sida för sida

### Publika React-sidor och publika/appnära ingångar

| Nuvarande URL | Nuvarande roll/syfte | Framtida sidtyp | Rekommenderad åtgärd | Appens synlighet | Beroenden eller risker |
| --- | --- | --- | --- | --- | --- |
| `/` | Produktstartsida och väg till förhandsregistrering. | Startsida | Behåll URL och migrera till ny startsidemall. | Tydlig | Måste förklara plattformens bredd, inte bara appen. Beror på framtida visuell riktning och webb/app-separation. |
| `/kunskapsbank` | Katalog för guider grupperade efter ämne. | Resursbibliotek | Behåll URL och bygg ut till riktigt resursbibliotek med filtrering och länkar till nav. | Måttlig | Fungerar idag också som ämnesnav. Undvik att göra den till säljsida. |
| `/digital-egenkontroll-livsmedel` | Förklarar digital egenkontroll och produktvärde. | Sida med hög köpavsikt | Behåll som hög-intent-sida och förbättra produkt-/värdeberättelsen senare. | Tydlig | Ska behålla kommersiellt fokus men länka tillbaka till hjälpsamma resurser. |
| `/egenkontroll-restaurang` | Produkt-/värdesida för restauranger. | Sida med hög köpavsikt | Behåll som hög-intent-sida. | Tydlig | Bra kandidat för branschspecifik lösningssida; behöver framtida konverteringsdata. |
| `/egenkontroll-cafe` | Produkt-/värdesida för café och bageri. | Sida med hög köpavsikt | Behåll som hög-intent-sida. | Tydlig | Bra kandidat för branschspecifik lösningssida; behöver framtida konverteringsdata. |
| `/dokumentation-egenkontroll-livsmedel` | Förklarar dokumentation och journalföring. | Faktasida / artikel | Behåll URL och migrera till faktasidemall. | Diskret | Kopplad till produktvärde, men primär avsikt är information. |
| `/sparbarhet-livsmedel` | Förklarar spårbarhet för livsmedel och länkar till spårbarhetsklustret. | Ämnesnav eller stark huvudartikel | Bygg ut till ämnesnav eller stark huvudartikel; behåll URL. | Måttlig | Överlappar statiska spårbarhetssidor. Slå inte ihop utan sök-/inlänksdata. |
| `/haccp-sma-livsmedelsforetag` | Förklarar HACCP för små verksamheter. | Ämnesnav eller stark huvudartikel | Bygg ut till HACCP-nav eller stark huvudartikel; behåll URL. | Måttlig | Överlappar HACCP-/risksidor. Bra pilotkandidat. |
| `/faroanalys-livsmedel` | Förklarar faroanalys. | Faktasida / artikel; möjlig verktygskandidat | Behåll URL och förbättra som artikel; utvärdera inbäddad generator eller undersida senare. | Diskret | Verktygs-/generatorbeslut kräver UX- och produktbeslut. |
| `/avvikelser-korrigerande-atgarder-livsmedel` | Förklarar avvikelser och korrigerande åtgärder. | Faktasida / artikel | Behåll URL och migrera till faktasidemall. | Diskret | Appen är relevant som nästa steg, inte som sidans huvudsyfte. |
| `/verifiering-egenkontroll-livsmedel` | Förklarar verifiering. | Faktasida / artikel | Behåll URL och migrera till faktasidemall. | Diskret | Del av HACCP-/riskklustret. |
| `/spara-sparbarhetsuppgifter-livsmedel` | Förklarar hur länge spårbarhetsuppgifter ska sparas. | Faktasida / artikel | Behåll URL och förbättra. Kandidat för sammanslagning först efter data. | Diskret | Överlappar `/sparbarhet-livsmedel` och statiska spårbarhetssidor. |
| `/login` | Inloggning / magic-link-ingång. | Inloggning | Behåll utanför innehållsmigrationen. Framtida mål kan vara `app.minegenkontroll.se/login`. | Tydlig | Auth-/sessionsrisk. Robots disallow idag. Kräver separat beslut om webb/app-separation. |
| `/signup` | Kontoskapande / förhandsregistrering. | Signup | Behåll utanför innehållsmigrationen. Framtida mål kan vara `app.minegenkontroll.se/signup`. | Tydlig | Auth-/sessions- och konverteringsrisk. Robots disallow idag. |
| `/integritetspolicy` | Integritets-/juridisk information. | Legal / stödjande sida | Behåll utanför innehållsmigrationen, men inkludera i framtida legal sidmodell. | Diskret | Finns inte i sitemap idag. Juridisk text ska inte skrivas om slentrianmässigt. |
| `/anvandarvillkor` | Användarvillkor. | Legal / stödjande sida | Behåll utanför innehållsmigrationen, men inkludera i framtida legal sidmodell. | Diskret | Finns inte i sitemap idag. Juridisk text ska inte skrivas om slentrianmässigt. |
| `/#inspector=<key>` | Publik-via-token tillsyns-/delningsvy. | Delat appflöde / ej SEO-sida | Behåll utanför innehållsmigrationen. | Tydlig i flödet | Högriskflöde för delning i appen. Ska inte behandlas som SEO-innehåll. |

### Statiska SEO-sidor

| Nuvarande URL | Nuvarande roll/syfte | Framtida sidtyp | Rekommenderad åtgärd | Appens synlighet | Beroenden eller risker |
| --- | --- | --- | --- | --- | --- |
| `/seo/kallor-och-faktagranskning.html` | Förklaring av källor och faktagranskning. | Legal / stödjande sida eller Faktasida / artikel | Behåll URL och förbättra som stödjande förtroende-/redaktionell sida. | Diskret | Kan stödja E-E-A-T. Göm inte undan om den har förtroendevärde. |
| `/seo/kritiska-gransvarden.html` | Kritiska gränsvärden i HACCP. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Stark stödsida i HACCP-klustret. |
| `/seo/kontrollplan.html` | Grunderna i kontrollplan. | Mall / checklista / resurskandidat | Kandidat för framtida mall/checklista; behåll URL medan format beslutas. | Måttlig | Bra resurskandidat. Kräver mall-/checkliste-UX-beslut. |
| `/seo/hygien-och-daglig-drift.html` | Översikt över hygien och daglig drift. | Ämnesnav | Bygg ut till ämnesnav. | Måttlig | Tunt nav idag; behåll URL och bygg ut före många nya undersidor. |
| `/seo/personlig-hygien-livsmedel.html` | Personlig hygien. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Hör hemma under hygiennav. |
| `/seo/rengoring-livsmedelsverksamhet.html` | Rengöringsrutiner. | Faktasida / artikel; checklistekandidat | Behåll URL och förbättra; kandidat för checklista/resurs. | Måttlig | Bra operativ checklistekandidat. |
| `/seo/skadedjur-livsmedelsverksamhet.html` | Förebyggande arbete mot skadedjur. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Hör hemma under hygien eller grundförutsättningar. |
| `/seo/temperaturkontroll-livsmedel.html` | Översikt över temperaturkontroll. | Faktasida / artikel eller stark huvudartikel | Behåll URL och förbättra som huvudartikel för temperaturklustret. | Måttlig | Överlappar temperaturprocessnav; besluta hierarki senare med data. |
| `/seo/allergeninformation-restaurang.html` | Allergeninformation för restauranger/caféer. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Kan senare länka till checklista/resurs. |
| `/seo/hantering-och-forvaring-livsmedel.html` | Översikt över hantering och förvaring. | Ämnesnav | Bygg ut till ämnesnav. | Måttlig | Tunt nav idag; sannolikt stark IA-nod. |
| `/seo/varumottagning-livsmedel.html` | Varumottagning. | Faktasida / artikel; checklistekandidat | Behåll URL och förbättra; kandidat för varumottagningschecklista. | Måttlig | Bra brygga mellan resurs och app. |
| `/seo/korskontamination-livsmedel.html` | Korskontamination. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Hör hemma under hantering/förvaring. |
| `/seo/separera-raa-och-atfardiga-livsmedel.html` | Separera råa och ätfärdiga livsmedel. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Relaterad till korskontamination; slå ihop endast med data. |
| `/seo/kemikalier-i-livsmedelsverksamhet.html` | Kemikalier i livsmedelsverksamhet. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Operativ sida för regelefterlevnad. |
| `/seo/allergenkontamination-livsmedel.html` | Allergenkontamination. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Relaterad till allergeninformation; slå ihop endast med data. |
| `/seo/grundforutsattningar-livsmedel.html` | Översikt över grundförutsättningar. | Ämnesnav | Bygg ut till ämnesnav. | Måttlig | Brett kluster; undvik att göra sidan för generisk. |
| `/seo/lokaler-och-utrustning-livsmedel.html` | Lokaler och utrustning. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Hör hemma under grundförutsättningar. |
| `/seo/materialval-livsmedelslokal.html` | Materialval i livsmedelslokal. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Specifik fråga om regelefterlevnad. |
| `/seo/underhall-livsmedelslokal.html` | Underhåll. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Kan senare kopplas till checklista. |
| `/seo/toalett-och-handfat-livsmedelsverksamhet.html` | Krav på toalett och handfat. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Specifik fråga om regelefterlevnad. |
| `/seo/ventilation-livsmedelsverksamhet.html` | Ventilation. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Specifik fråga om regelefterlevnad. |
| `/seo/avfall-livsmedelsverksamhet.html` | Avfallshantering. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Relaterad till soprumssidan; slå ihop endast med data. |
| `/seo/soprum-och-avfallsutrymme-livsmedel.html` | Soprum / avfallsutrymme. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Relaterad till avfallshantering; slå ihop endast med data. |
| `/seo/transport-av-livsmedel.html` | Transport av livsmedel. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Kan höra hemma under hantering/förvaring eller grundförutsättningar. |
| `/seo/utbildning-livsmedelshygien-personal.html` | Utbildning i livsmedelshygien för personal. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Kan senare kopplas till checklista/resurs. |
| `/seo/vatten-i-livsmedelsverksamhet.html` | Vatten i livsmedelsverksamheter. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Specifik fråga om regelefterlevnad. |
| `/seo/is-i-livsmedelsverksamhet.html` | Ishygien. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Relaterad till vatten/hygien; slå ihop endast med data. |
| `/seo/temperaturprocesser-livsmedel.html` | Översikt över temperaturprocesser. | Ämnesnav | Bygg ut till ämnesnav. | Måttlig | Behöver relationsbeslut mot `/seo/temperaturkontroll-livsmedel.html`. |
| `/seo/kylforvaring-livsmedel.html` | Kylförvaring. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Temperaturklustret. |
| `/seo/upptining-livsmedel.html` | Upptining. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Temperaturklustret. |
| `/seo/varmhallning-mat-temperatur.html` | Varmhållning. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Temperaturklustret. |
| `/seo/nedkylning-mat-livsmedel.html` | Nedkylning av mat. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Temperaturklustret; starkt operativt värde. |
| `/seo/ateruppvarmning-mat.html` | Återuppvärmning av mat. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Temperaturklustret. |
| `/seo/datummarkning-livsmedel.html` | Översikt över datummärkning. | Ämnesnav | Bygg ut till ämnesnav. | Måttlig | Starkt kluster finns redan. |
| `/seo/bast-fore-eller-sista-forbrukningsdag.html` | Bäst före jämfört med sista förbrukningsdag. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Stark informationssökning. |
| `/seo/salja-mat-efter-bast-fore.html` | Sälja mat efter bäst före. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Fråga om regelefterlevnad och operativ hantering. |
| `/seo/mat-efter-sista-forbrukningsdag.html` | Mat efter sista förbrukningsdag. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Fråga om regelefterlevnad; ska svara snabbt. |
| `/seo/bestamma-hallbarhetsdatum-livsmedel.html` | Bestämma hållbarhetsdatum. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Kan senare kopplas till verktyg/resurs. |
| `/seo/frysa-in-kylvaror-fore-utgangsdatum.html` | Frysa in kylvaror före utgångsdatum. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Specifik operativ fråga. |
| `/seo/information-och-markning-livsmedel.html` | Översikt över information och märkning. | Ämnesnav | Bygg ut till ämnesnav. | Måttlig | Stort kluster; stark kandidat för riktigt nav. |
| `/seo/ansvar-livsmedelsinformation.html` | Ansvar för livsmedelsinformation. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Märkningsklustret. |
| `/seo/vilseledande-livsmedelsinformation.html` | Vilseledande livsmedelsinformation. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Märkningsklustret. |
| `/seo/fardigforpackade-livsmedel-markning.html` | Definition av färdigförpackade livsmedel. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Märkningsklustret. |
| `/seo/obligatorisk-markning-livsmedel.html` | Översikt över obligatorisk märkning. | Faktasida / artikel eller stark huvudartikel | Behåll URL och förbättra som större artikel. | Diskret | Kan bli huvudartikel under märkningsnav. |
| `/seo/ingrediensforteckning-livsmedel.html` | Ingrediensförteckning. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Märkningsklustret. |
| `/seo/livsmedlets-beteckning.html` | Livsmedlets beteckning. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Märkningsklustret. |
| `/seo/forvaringsanvisning-livsmedel.html` | Förvaringsanvisning. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Märkningsklustret; även relaterad till förvaring. |
| `/seo/marka-om-fardigforpackade-livsmedel.html` | Märka om färdigförpackade livsmedel. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Märkningsklustret. |
| `/seo/oforpackade-livsmedel-information.html` | Information om oförpackade livsmedel. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Märkningsklustret. |
| `/seo/obligatorisk-information-oforpackad-mat.html` | Obligatorisk information för oförpackad mat. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Relaterad till oförpackade livsmedel; slå ihop endast med data. |
| `/seo/distansforsaljning-oforpackad-mat.html` | Distansförsäljning av oförpackad mat. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Specifik fråga om regelefterlevnad. |
| `/seo/intern-sparbarhet-livsmedel.html` | Intern spårbarhet. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Spårbarhetsklustret; appen kan vara relevant efter svaret. |
| `/seo/partimarkning-livsmedel.html` | Partimärkning. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Spårbarhetsklustret. |
| `/seo/aterkalla-livsmedel-sparbarhet.html` | Återkallelse och spårbarhet. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Stark operativ betydelse. |
| `/seo/mangdbalans-sparbarhet-livsmedel.html` | Mängdbalans / kvantitativ spårbarhet. | Faktasida / artikel | Behåll URL och migrera till artikelmall. | Diskret | Spårbarhetsklustret. |

### Övriga publika eller publiknära ytor

De här är inte mål för innehållsmigrationen.

| Yta | Framtida klassificering | Rekommenderad åtgärd | Appens synlighet | Beroenden eller risker |
| --- | --- | --- | --- | --- |
| `/api/leads/index.html` och relaterade statiska filer | Stödjande/privat adminyta, inte SEO-innehåll | Behåll utanför innehållsmigrationen. Separat åtkomst-/säkerhetsgranskning vid behov. | Ej relevant | Publik åtkomlighet verifierades inte i körning i #245. |
| `/api/shared-attachment-url` | Stödjande API | Behåll utanför innehållsmigrationen. | Ej relevant | Säkerhet för delade bilagor och tokenhantering är skyddade appfrågor. |
| `/api/send-inspector-report` | Stödjande API | Behåll utanför innehållsmigrationen. | Ej relevant | Tillsyns-/rapportflödet är appnära och ska inte ändras i innehållsmigrationen. |
| `/api/client-error` | Stödjande API | Behåll utanför innehållsmigrationen. | Ej relevant | Operativ slutpunkt, inte innehåll. |

## 2. Rekommenderade ämnesnav och kluster

Den första strukturen återanvänder befintligt innehåll. Den bör styra wireframes och informationsarkitektur före större omskrivningar.

### Egenkontroll i vardagen

- Besökarens avsikt: förstå vad egenkontroll är, varför det spelar roll och hur man börjar praktiskt.
- Nuvarande sidor: `/`, `/digital-egenkontroll-livsmedel`, `/dokumentation-egenkontroll-livsmedel`, `/seo/kontrollplan.html`.
- Starka huvudartiklar: `/dokumentation-egenkontroll-livsmedel`, `/seo/kontrollplan.html`.
- Luckor: nybörjaröversikt för "vad är egenkontroll", utskrivbar startchecklista, enkel ansvarskarta för små team.

### HACCP och riskstyrning

- Besökarens avsikt: förstå HACCP, faroanalys, gränsvärden, avvikelser och verifiering.
- Nuvarande sidor: `/haccp-sma-livsmedelsforetag`, `/faroanalys-livsmedel`, `/avvikelser-korrigerande-atgarder-livsmedel`, `/verifiering-egenkontroll-livsmedel`, `/seo/kritiska-gransvarden.html`, `/seo/kontrollplan.html`.
- Starka huvudartiklar: `/haccp-sma-livsmedelsforetag`, `/faroanalys-livsmedel`.
- Luckor: steg-för-steg-nav för HACCP, enkel arbetsmall för faroanalys, exempel på kritiska gränser, generator för första utkast till faroanalys.

### Hygien och daglig drift

- Besökarens avsikt: lösa dagliga operativa hygienfrågor och rutiner.
- Nuvarande sidor: `/seo/hygien-och-daglig-drift.html`, `/seo/personlig-hygien-livsmedel.html`, `/seo/rengoring-livsmedelsverksamhet.html`, `/seo/skadedjur-livsmedelsverksamhet.html`, `/seo/allergeninformation-restaurang.html`, `/seo/utbildning-livsmedelshygien-personal.html`.
- Starka huvudartiklar: `/seo/hygien-och-daglig-drift.html`, `/seo/rengoring-livsmedelsverksamhet.html`.
- Luckor: daglig hygienchecklista, mall för rengöringsschema, onboardingresurs för personalhygien.

### Hantering och förvaring

- Besökarens avsikt: hantera, ta emot, förvara och separera livsmedel säkert.
- Nuvarande sidor: `/seo/hantering-och-forvaring-livsmedel.html`, `/seo/varumottagning-livsmedel.html`, `/seo/korskontamination-livsmedel.html`, `/seo/separera-raa-och-atfardiga-livsmedel.html`, `/seo/kemikalier-i-livsmedelsverksamhet.html`, `/seo/allergenkontamination-livsmedel.html`, `/seo/transport-av-livsmedel.html`.
- Starka huvudartiklar: `/seo/hantering-och-forvaring-livsmedel.html`, `/seo/varumottagning-livsmedel.html`.
- Luckor: varumottagningschecklista, checklista för förvaringszoner, snabbguide om korskontamination.

### Grundförutsättningar

- Besökarens avsikt: förstå krav på lokaler, utrustning, vatten, avfall, ventilation och underhåll.
- Nuvarande sidor: `/seo/grundforutsattningar-livsmedel.html`, `/seo/lokaler-och-utrustning-livsmedel.html`, `/seo/materialval-livsmedelslokal.html`, `/seo/underhall-livsmedelslokal.html`, `/seo/toalett-och-handfat-livsmedelsverksamhet.html`, `/seo/ventilation-livsmedelsverksamhet.html`, `/seo/avfall-livsmedelsverksamhet.html`, `/seo/soprum-och-avfallsutrymme-livsmedel.html`, `/seo/vatten-i-livsmedelsverksamhet.html`, `/seo/is-i-livsmedelsverksamhet.html`.
- Starka huvudartiklar: `/seo/grundforutsattningar-livsmedel.html`, `/seo/lokaler-och-utrustning-livsmedel.html`.
- Luckor: egenkontrollchecklista för lokaler, mall för underhållsplan, checklista för avfallshantering.

### Temperatur

- Besökarens avsikt: förstå temperaturkontroll och specifika temperaturprocesser.
- Nuvarande sidor: `/seo/temperaturkontroll-livsmedel.html`, `/seo/temperaturprocesser-livsmedel.html`, `/seo/kylforvaring-livsmedel.html`, `/seo/upptining-livsmedel.html`, `/seo/varmhallning-mat-temperatur.html`, `/seo/nedkylning-mat-livsmedel.html`, `/seo/ateruppvarmning-mat.html`.
- Starka huvudartiklar: `/seo/temperaturkontroll-livsmedel.html`, `/seo/temperaturprocesser-livsmedel.html`.
- Luckor: temperaturjournalmall, kalkylator/generator för nedkylningstid, guide för kontrollfrekvens.

### Datummärkning och hållbarhet

- Besökarens avsikt: förstå hållbarhetsdatum, vad som får säljas och hur datum bestäms.
- Nuvarande sidor: `/seo/datummarkning-livsmedel.html`, `/seo/bast-fore-eller-sista-forbrukningsdag.html`, `/seo/salja-mat-efter-bast-fore.html`, `/seo/mat-efter-sista-forbrukningsdag.html`, `/seo/bestamma-hallbarhetsdatum-livsmedel.html`, `/seo/frysa-in-kylvaror-fore-utgangsdatum.html`.
- Starka huvudartiklar: `/seo/datummarkning-livsmedel.html`, `/seo/bast-fore-eller-sista-forbrukningsdag.html`.
- Luckor: beslutsträd för datummärkning, arbetsblad för hållbarhetsdatum, utskrivbar datummärkningschecklista.

### Information och märkning

- Besökarens avsikt: förstå ansvar för livsmedelsinformation och märkningskrav.
- Nuvarande sidor: `/seo/information-och-markning-livsmedel.html`, `/seo/ansvar-livsmedelsinformation.html`, `/seo/vilseledande-livsmedelsinformation.html`, `/seo/fardigforpackade-livsmedel-markning.html`, `/seo/obligatorisk-markning-livsmedel.html`, `/seo/ingrediensforteckning-livsmedel.html`, `/seo/livsmedlets-beteckning.html`, `/seo/forvaringsanvisning-livsmedel.html`, `/seo/marka-om-fardigforpackade-livsmedel.html`, `/seo/oforpackade-livsmedel-information.html`, `/seo/obligatorisk-information-oforpackad-mat.html`, `/seo/distansforsaljning-oforpackad-mat.html`.
- Starka huvudartiklar: `/seo/information-och-markning-livsmedel.html`, `/seo/obligatorisk-markning-livsmedel.html`.
- Luckor: märkningschecklista, checklista för oförpackad information, enkelt granskningsverktyg för märkning.

### Spårbarhet

- Besökarens avsikt: förstå vilken spårbarhetsinformation som ska sparas, hur partier identifieras och vad man gör vid återkallelse.
- Nuvarande sidor: `/sparbarhet-livsmedel`, `/spara-sparbarhetsuppgifter-livsmedel`, `/seo/intern-sparbarhet-livsmedel.html`, `/seo/partimarkning-livsmedel.html`, `/seo/aterkalla-livsmedel-sparbarhet.html`, `/seo/mangdbalans-sparbarhet-livsmedel.html`.
- Starka huvudartiklar: `/sparbarhet-livsmedel`, `/seo/intern-sparbarhet-livsmedel.html`.
- Luckor: mall för spårbarhetsjournal, återkallelsechecklista, exempel på parti-/lotmärkning, arbetsblad för mängdbalans.

## 3. Kommersiell återhållsamhet per sidtyp

| Framtida sidtyp | Rekommenderad synlighet för appen | Motivering |
| --- | --- | --- |
| Startsida | Tydlig | Besökaren utvärderar hela erbjudandet, så appen kan vara tydlig samtidigt som sidan leder vidare till kunskap och resurser. |
| Ämnesnav | Måttlig | Besökaren orienterar sig inom ett ämne. Appen ska finnas som relevant nästa steg, inte som huvudinnehåll. |
| Faktasida / artikel | Diskret | Besökaren vill ha ett svar. Appen bör visas efter svaret och knytas till sidans praktiska problem. |
| Sida med hög köpavsikt | Tydlig | Besökaren är redan lösningsmedveten, så appvärde, signup och bevis kan vara framträdande. |
| Mall / checklista / nedladdningsbar resurs | Måttlig | Resursen måste gå att använda först. Appvärdet kan visas som enklare löpande arbetsflöde efter resursen. |
| Verktyg / generator | Måttlig | Verktyget och resultatet kommer först. Appen kan erbjudas efter resultatet när den hjälper användaren att spara eller upprepa arbetet. |
| Resursbibliotek | Måttlig | Besökaren letar hjälp. Appens synlighet ska stödja upptäckt utan att blockera resurser. |
| Inloggning | Tydlig | Sidan är redan en appingång och ska vara friktionsfri. |
| Signup | Tydlig | Sidan är redan ett konverteringsflöde och ska vara friktionsfri. |
| Legal / stödjande sida | Diskret | Besökaren behöver förtroendeinformation eller information om regelefterlevnad. Kommersiellt innehåll ska hållas minimalt. |
| Delat appflöde / ej SEO-sida | Tydlig i flödet | Användaren är inne i ett appstött flöde. Behandla inte som publikt innehåll eller SEO. |

## 4. Första kompletta minisystemet

Den första piloten bör testa hela strategin på ett smalt men kommersiellt relevant område med befintligt innehåll och tydlig produktkoppling. Rekommenderad pilot är **HACCP och riskstyrning för små livsmedelsverksamheter**.

| Del som krävs | Rekommenderad URL / resurs | Varför detta är en bra pilot |
| --- | --- | --- |
| 1 startsida | `/` | Testar det nya plattformslöftet och leder användare mot kunskap, resurser och app utan att göra appen till enda vägen. |
| 1 ämnesnav | `/haccp-sma-livsmedelsforetag` | Redan stark och bred nog att bli HACCP-/risknav. Hög relevans för produkten. |
| 2-3 faktasidor | `/faroanalys-livsmedel`, `/avvikelser-korrigerande-atgarder-livsmedel`, `/verifiering-egenkontroll-livsmedel` | Tillsammans täcker de förstå -> bedöm risk -> dokumentera avvikelse -> verifiera kontroll. |
| 1 mall-/checklistekandidat | `/seo/kontrollplan.html` | En kontrollplan blir naturligt ett praktiskt arbetsblad/checklista och kopplar direkt till appflöden. |
| 1 verktygs-/generatorkandidat | `/faroanalys-livsmedel` | Faroanalys kan stödja en framtida guidad generator för ett första utkast eller strukturerat arbetsblad. |
| Resursbibliotek | `/kunskapsbank` | Testar om biblioteket kan visa pilotnavet, artiklar, resursen och verktygskandidaten tydligt. |
| Inloggnings-/signup-flöde | `/login`, `/signup` | Testar en naturlig övergång från publik hjälp till appingång utan att ändra autentisering i denna issue. |

Pilotens gränser:

- Behåll nuvarande URL:er.
- Omdirigera eller ta inte bort överlappande sidor.
- Introducera inte en ny verktygs-URL innan wireframe-/produktbeslut är fattat.
- Använd piloten för att validera sidtypswireframes, appens synlighet, internlänkning och metadatastrategi före skalning.

## 5. Beslut

### Kan beslutas nu utifrån repo och strategi

- Befintliga publika URL:er ska bevaras som grundregel för migrationen.
- `/` ska fortsätta vara publik startsida.
- `/kunskapsbank` ska bli resursbibliotek snarare än renodlad kommersiell sida.
- Hög-intent-sidor är `/digital-egenkontroll-livsmedel`, `/egenkontroll-restaurang` och `/egenkontroll-cafe`.
- De flesta nuvarande statiska SEO-sidor bör förbli fakta-/artikelsidor och senare få bättre artikelmallar.
- Nuvarande tunna navliknande sidor bör behandlas som framtida ämnesnav snarare än som sidor att ta bort.
- Appens synlighet bör vara lägre på faktasidor än på sidor med hög köpavsikt och autentiseringssidor.
- `/login`, `/signup`, legal-sidor, inspektörslänkar och API-ytor ska ligga utanför innehållsmigrationen.
- Det första minisystemet bör använda ett befintligt ämneskluster före bred innehållsmigration.

### Kräver data eller användarbeslut först

- Alla omdirigeringar, borttagningar eller permanenta sammanslagningar av befintliga URL:er.
- Om `/sparbarhet-livsmedel` eller `/haccp-sma-livsmedelsforetag` ska vara slutliga nav-URL:er eller huvudartiklar.
- Om `/seo/temperaturkontroll-livsmedel.html` eller `/seo/temperaturprocesser-livsmedel.html` ska leda temperaturklustret.
- Vilka överlappande sidor om spårbarhet, allergener, avfall och information om oförpackade livsmedel som ska vara separata.
- Search Console-data om visningar, klick, sökfrågor, indexering och kannibaliseringssignaler.
- Organisk trafik, inlänkar, assisterade konverteringar, signup-vägar och betalt/kundvärde per sida.
- Slutlig visuell riktning och designsystembeslut för varje sidtyp.
- Om publik webb och app ska flyttas till `minegenkontroll.se` och `app.minegenkontroll.se` i ett steg eller etappvis.
- Om framtida verktyg/generatorer ska få egna URL:er, inbäddade sektioner eller båda.
- Om `/api/leads` ska ligga kvar på den deployade publika ytan.

## Nästa användning

Använd den här kartan för att styra nästa fas först efter att den strategiska kontexten och nulägesinventeringen har lästs. Nästa säkra leverans är sannolikt sidtypswireframes eller ett implementationsneutralt beslut om informationsarkitektur, inte innehållsomskrivningar eller route-ändringar.
