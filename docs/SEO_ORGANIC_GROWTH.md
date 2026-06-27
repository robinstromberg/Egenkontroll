# SEO och organisk tillväxt

Det här dokumentet är målbilden för SEO och organisk tillväxt. Det implementerar inte betalda annonser, tracking eller nya innehållssidor.

## Mål

Min Egenkontroll ska vara lätt att hitta, förstå och rekommendera utan betald annonsering.

Organisk tillväxt ska bygga på:

- teknisk SEO
- snabbt mobilgränssnitt
- tydlig landingpage
- trovärdigt innehåll
- relevant kunskapsbank
- strukturerad data
- integritetsmedveten mätning

SEO får aldrig försämra appens kontrollflöde, hastighet eller enkelhet.

## Sökintentioner

Första SEO-arbetet bör fokusera på problem och frågor från svenska livsmedelsföretagare:

- digital egenkontroll
- egenkontroll livsmedel
- egenkontroll restaurang
- egenkontroll café
- temperaturkontroll livsmedel
- spårbarhet livsmedel
- livsmedelskontroll dokumentation
- dokumentera avvikelser
- städschema restaurang
- HACCP för små verksamheter

## Teknisk grund

Första tekniska nivån är nu påbörjad:

- svensk `title`
- svensk meta description
- canonical URL till `https://minegenkontroll.se/`
- Open Graph och Twitter/X metadata
- favicon och apple touch icon
- JSON-LD för `WebSite`, `Organization`, `SoftwareApplication` och synlig FAQ
- `robots.txt`
- `sitemap.xml`

## Innehållsplan

Första kunskapsbank bör byggas som separata issues och inte blandas in i appflödet.

Rekommenderade första artiklar:

1. Egenkontroll för café
2. Egenkontroll för restaurang
3. Vad tittar livsmedelsinspektören på?
4. Hur ofta ska kyltemperatur dokumenteras?
5. Temperaturkontroll i livsmedelsverksamhet
6. Spårbarhet enligt Livsmedelsverket
7. HACCP för små verksamheter
8. Checklista inför livsmedelskontroll
9. Digital egenkontroll jämfört med pärm
10. Hur dokumenterar man avvikelser?

## Programmatic SEO

Programmatic SEO kan bli aktuellt senare, men ska inte byggas med tunt duplicerat innehåll.

Möjliga framtida sidor:

- `/egenkontroll-cafe`
- `/egenkontroll-restaurang`
- `/temperaturkontroll-kyl`
- `/sparbarhet-livsmedel`
- `/haccp-sma-verksamheter`

Varje sida ska ha unik, användbar copy och naturlig väg till produkten.

## Trovärdighet

Eftersom produkten berör livsmedelssäkerhet ska sidan vara tydlig med:

- avsändare
- kontaktväg
- vad appen gör
- vad appen inte garanterar
- att produkten är i förhandslansering när det är relevant
- relevanta myndighetskällor när innehåll byggs

Sidan ska inte påstå att appen garanterar godkänd myndighetskontroll.

## AI-optimering

Innehåll ska struktureras så att AI-assistenter kan förstå tjänsten korrekt:

- tydliga rubriker
- FAQ
- korta sammanfattningar
- konkreta definitioner
- semantisk HTML
- strukturerad data som matchar synligt innehåll

## Mätning

Sökprestanda ska mätas utan att införa tracking i onödan.

Första steg:

- Google Search Console
- Bing Webmaster Tools
- eventuell integritetsvänlig analytics senare

Tracking, cookies och beteendeanalys kräver separat integritetsbeslut.

## Guardrails

När SEO bryts ned i implementation ska Codex:

- inte ändra appens kontrollflöde
- inte försämra mobilprestanda
- inte lägga in analytics eller tracking utan separat beslut
- inte skapa tunt eller duplicerat innehåll
- inte ändra Supabase, RLS eller auth
- hålla SEO-ändringar små, verifierbara och lätta att granska
