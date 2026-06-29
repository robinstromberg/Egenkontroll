# Team och inbjudningar: manuell testplan

Den här testplanen verifierar owner/admin/staff-flödet för verksamhetsinbjudningar.

## Förutsättningar

- Migrationen för `organization_invitations` är applicerad.
- Testa med en testverksamhet, inte verklig kunddata.
- Använd minst tre testkonton:
  - owner/admin-konto
  - invitee-konto
  - staff-konto
- Kör flödet på både mobil och desktop.

## Owner/admin bjuder in

1. Logga in som owner eller admin.
2. Gå till `Meny -> Användare`.
3. Kontrollera att befintliga medlemmar visas.
4. Skapa en inbjudan till invitee-kontots e-post.
5. Välj rollen `Personal`.
6. Kontrollera att inbjudan visas som `Väntar`.
7. Kopiera inbjudningslänken.
8. Förläng inbjudan och kontrollera att giltighetsdatum uppdateras.
9. Skapa en andra inbjudan och återkalla den.
10. Kontrollera att återkallad inbjudan inte kan användas.

## Invitee accepterar

1. Öppna inbjudningslänken i en separat session eller privat fönster.
2. Logga in med samma e-postadress som inbjudan gäller.
3. Kontrollera att acceptansvyn visas.
4. Acceptera inbjudan.
5. Kontrollera att appen landar i rätt verksamhet.
6. Kontrollera att workspace-väljaren visar den nya verksamheten om kontot har flera verksamheter.
7. Gå till `Meny -> Användare` som owner/admin och kontrollera att invitee nu visas som aktiv medlem.

## Fel e-post

1. Öppna en giltig inbjudningslänk.
2. Logga in med en annan e-postadress än den inbjudna.
3. Kontrollera att inbjudan inte visas eller inte kan accepteras.
4. Kontrollera att kontot inte blir medlem i verksamheten.

## Staff-behörighet

1. Logga in som en användare med rollen `Personal`.
2. Kontrollera att användaren kan se `Idag`.
3. Utför och spara en kontroll.
4. Kontrollera att användaren inte kan skapa kontrolltyper.
5. Kontrollera att användaren inte kan skapa delningslänk.
6. Kontrollera att användaren inte ser inbjudningsformulär i `Meny -> Användare`.

## Admin-behörighet

1. Logga in som admin.
2. Kontrollera att admin kan se medlemmar och inbjudningar.
3. Kontrollera att admin kan skapa och återkalla inbjudningar.
4. Kontrollera att admin kan hantera kontrolltyper.
5. Kontrollera att admin kan skapa delningslänk.

## Utgången inbjudan

1. Skapa eller simulera en inbjudan med passerat `expires_at`.
2. Öppna länken som rätt invitee.
3. Kontrollera att acceptans misslyckas.
4. Kontrollera att användaren inte blir medlem.

## Klart när

- Owner/admin kan bjuda in och hantera status.
- Invitee kan acceptera med rätt konto och hamnar i rätt verksamhet.
- Fel konto kan inte acceptera inbjudan.
- Staff kan utföra kontroller men inte administrera struktur, delning eller inbjudningar.
- Mobil och desktop fungerar utan att formulär eller länkar hamnar utanför skärmen.
- `supabase/tests/organization_invitations_smoke.sql` passerar mot testmiljö eller rollback-säkert prelaunch-projekt.
