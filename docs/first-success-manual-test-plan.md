# First-success testplan

Den här testplanen används inför större onboardingändringar och skarpa deployer. Målet är att verifiera den första lyckade användarresan:

`landingpage -> signup -> login -> skapa verksamhet -> första kontroll -> historik -> delning`

## Förutsättningar

- Testa med ett konto som inte har någon befintlig verksamhet, eller rensa testkontots verksamheter i testmiljö.
- Supabase Auth behöver vara konfigurerat för lösenordsinloggning.
- Magic link-test kräver fungerande SMTP eller att Supabase egna e-postgränser inte är uppnådda.
- Använd inte produktion med verklig kunddata för destruktiva tester.
- Kör hela planen en gång på mobil viewport och en gång på desktop viewport.

## Mobil

1. Öppna startsidan.
2. Tryck på knappen för att skapa konto.
3. Skapa konto med e-post, lösenord och bekräfta lösenord.
4. Bekräfta e-post om Supabase kräver det.
5. Logga in med e-post och lösenord.
6. Kontrollera att magic link fortfarande finns som reserv på login-skärmen.
7. Skapa verksamhet med valfri verksamhetstyp.
8. Låt föreslagna startmallar vara valda.
9. Kontrollera att appen landar på `Idag`.
10. Kontrollera att en kort kom igång-hjälp visas efter skapad verksamhet.
11. Tryck `Utför första kontrollen`.
12. Spara en kontroll utan avvikelse.
13. Kontrollera bekräftelsen och välj att visa historik.
14. Kontrollera att kontrollen syns i historiken.
15. Gå tillbaka till `Idag`.
16. Öppna en kontroll igen och skapa en avvikelse.
17. Spara kontrollen och kontrollera att avvikelsen visas på `Idag`.
18. Gå till `Delning`.
19. Skapa en inspektörslänk eller QR-länk om användaren har admin/owner-roll.
20. Öppna länken i en separat flik och kontrollera att läsvyn visas.

## Desktop

1. Upprepa mobilflödet på desktop.
2. Kontrollera att kort, formulärfält och knappar är centrerade och inte hamnar utanför skärmen.
3. Kontrollera att bottennavigationen byter vy även efter att en kontroll har öppnats.
4. Kontrollera att `Historik`, `Delning` och `Meny` visar rätt verksamhet.
5. Om testkontot har flera verksamheter: byt verksamhet i väljaren och kontrollera att `Idag`, `Historik`, `Delning` och `Meny` uppdateras.

## Tomma lägen

Testa med en verksamhet utan aktiva kontroller eller med alla startmallar avmarkerade:

1. Skapa verksamhet utan startmallar.
2. Kontrollera att `Idag` förklarar varför inget kan utföras.
3. Som owner/admin: kontrollera att det finns väg till `Kontrolltyper`.
4. Som staff: kontrollera att texten säger att admin behöver konfigurera kontroller.
5. Öppna en kontrolltyp utan fält och kontrollera att appen förklarar vad som saknas.
6. Öppna en kontrolltyp utan kontrollpunkter och kontrollera att appen förklarar vad som saknas.

## Klart när

- Ny användare kan komma från signup till första sparade kontroll utan hjälp.
- Användaren förstår att sparade kontroller finns i historik.
- Avvikelseflödet går att spara och följa upp.
- Delningsflödet fungerar för admin/owner.
- Staff får tydliga begränsningar utan admin-CTA.
- Mobil och desktop är manuellt verifierade.
