# Publication gate – operativ guide

Denna guide gäller all framtida innehållsproduktion och bulkproduktion.

Kör `npm run publication:verify` före varje ny fullstyrd sida eller bulkändring. Kommandot kontrollerar route- och artikelkontrakt, grandfathered-baslinjen och negativa fixtures. Kör även `npm run build` när ändringen berör internlänkar; bygget kontrollerar att deklarerade inkommande länkar faktiskt finns i genererad HTML.

CI kör samma route- och kontraktskontroller och jämför grandfathered-baslinjen med PR:ens base-SHA (eller föregående push-SHA). Baslinjen får endast minska. Vid verklig migration tas den gamla posten bort ur baslinjen och samma befintliga route ansluts med `full` governance och exakt ett v2-kontrakt. Nya `transitional`, `legacy-inventory` eller `seo-only`-undantag är inte tillåtna.

En ny full sida ansluts utan parallella route-, canonical-, sitemap- eller innehållsregister: route-registret är sanningen. Lägg full route-governance, ett komplett v2-kontrakt med materiella kärnytor och claims, samt en internlänkningsplan som bevisas i byggd HTML. Titel, H1, metabeskrivning och direkt svar eller ingress är obligatoriska materiella ytor för fulla kontrakt.

`/faroanalys-livsmedel` (#392) är tills vidare exakt grandfathered `transitional`. Dess innehåll, källor, status och reviewmetadata ändras inte av publication gate-arbete. När sidan senare kan bli full tas den befintliga baseline-posten bort; grinden ska då passera utan specialundantag eller regeländring.
