# Auth och åtkomstmodell

Issue #3 lägger den första inloggnings- och åtkomstgrunden för Egenkontroll.

## Inloggning

MVP använder lösenordsfri e-postinloggning via Supabase Auth.

Flöde:

1. Användaren anger e-postadress.
2. Supabase skickar en inloggningslänk.
3. Användaren öppnar länken och får en session i webappen.
4. Appen skapar/uppdaterar användarens profil i `profiles`.

## Verksamhet

När en inloggad användare inte har någon verksamhet visas ett startflöde där användaren skapar sin första verksamhet.

När verksamheten skapas:

- en rad skapas i `organizations`,
- användaren skapas som `owner` i `organization_memberships`,
- kommande data kopplas till verksamhetens `organization_id`.

## Roller

MVP har tre interna roller:

- `owner` – ägare av verksamheten,
- `admin` – kan hantera verksamhetens struktur,
- `staff` – kan utföra kontroller och se relevant historik.

Inspektörsåtkomst byggs senare via tidsbegränsad read-only-länk, inte som vanlig inloggad roll.

## UI-regel

Appen visar olika information beroende på roll:

- `owner` och `admin` får se att de kan hantera struktur och delningar.
- `staff` får se att de kan utföra kontroller och se relevant historik.

## Dataskydd

RLS-grunden från issue #2 skyddar verksamhetsdata per `organization_id`.

Det betyder att UI-behörigheter inte är det enda skyddet. Databasen ska också begränsa åtkomsten.

## Viktigt för test

Supabase Auth måste tillåta den domän som används vid test. För Vercel-preview kan redirect-domäner behöva läggas till i Supabase Auth-inställningarna om inloggningslänken inte fungerar.
