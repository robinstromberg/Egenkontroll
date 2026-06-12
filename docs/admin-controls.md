# Adminflöde för kontrolltyper och objekt

Issue #6 lägger till första adminflödet för verksamhetens kontrollstruktur.

## Vem ser flödet

Endast användare med roll `owner` eller `admin` ser adminpanelen i appen.

## Vad går att göra i denna version

Admin kan:

- se befintliga kontrolltyper,
- skapa nya kontrolltyper,
- välja kategori och frekvens,
- aktivera och inaktivera kontrolltyper,
- välja en kontrolltyp,
- se kontrollpunkter/objekt för vald kontrolltyp,
- skapa nya kontrollpunkter,
- ange plats och maxgräns för kontrollpunkt,
- aktivera och inaktivera kontrollpunkter.

## Viktig princip

Objekt och kontrolltyper inaktiveras istället för att hårdraderas. Det gör att framtida historik kan fortsätta förstås även om verksamheten ändrar sina kontroller.

## Avgränsning

Full redigering av alla fält, mer avancerade formulärdefinitioner och detaljerad sortering kan byggas vidare senare. Detta issue etablerar ett fungerande första adminflöde.
