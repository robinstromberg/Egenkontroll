# Search Console, Bing Webmaster och mätning

Det här dokumentet beskriver hur organisk trafik och sökprestanda kan mätas utan att införa tracking eller externa scripts nu.

## Grundprincip

Sökverifiering ska förberedas utan att hitta på verifieringskoder.

Analytics, cookies, heatmaps och beteendespårning kräver separat produkt- och integritetsbeslut.

## Google Search Console

Rekommenderad metod:

1. Lägg till domänen `minegenkontroll.se` i Google Search Console.
2. Använd DNS-verifiering om möjligt.
3. Om DNS inte används kan HTML-fil eller meta-tag användas.
4. Skicka in sitemap: `https://minegenkontroll.se/sitemap.xml`.

Om HTML-fil används:

- placera filen i `public/`
- filnamnet ska vara exakt det Google ger
- innehållet ska vara exakt det Google ger
- skapa separat commit när verifieringsfilen finns

Om meta-tag används:

- lägg den i `index.html`
- använd exakt verifieringsvärde från Google
- använd inte placeholder i produktion

## Bing Webmaster Tools

Rekommenderad metod:

1. Lägg till `https://minegenkontroll.se/` i Bing Webmaster Tools.
2. Importera från Google Search Console om Google redan är verifierat, eller använd Bing-verifiering.
3. Skicka in sitemap: `https://minegenkontroll.se/sitemap.xml`.

Om XML- eller HTML-verifieringsfil används:

- placera filen i `public/`
- använd exakt filnamn och innehåll från Bing

## Analytics senare

Möjliga framtida alternativ:

- Google Analytics
- Plausible eller annat integritetsvänligt alternativ
- Microsoft Clarity
- Vercel Web Analytics

Inget av detta ska läggas in utan separat issue.

## Integritet

Innan analytics eller beteendemätning införs behövs beslut om:

- cookie-banner eller samtycke
- personuppgiftshantering
- datalagring
- vilka events som får mätas
- om inloggade appflöden ska exkluderas

Första rekommenderade mätning:

- Search Console och Bing Webmaster för sökdata
- ingen klienttracking i appen

## Klart för nu

Teknisk grund finns:

- `public/sitemap.xml`
- `public/robots.txt`
- canonical URL i `index.html`
- metadata för publika landingpagen

Robin behöver manuellt skapa/verifiera egendomar i Google Search Console och Bing Webmaster Tools och hämta eventuella verifieringskoder om fil-/meta-verifiering väljs.
