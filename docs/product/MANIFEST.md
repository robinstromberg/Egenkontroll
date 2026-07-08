# MANIFEST - Min Egenkontroll

Min Egenkontroll finns för att göra egenkontroll möjlig att faktiskt få gjord i vardagen. Inte som ett extra administrativt lager, utan som ett enkelt stöd när verksamheten redan är full av gäster, leveranser, personalfrågor och tidspress.

## Vem appen är till för

Primär målgrupp är små livsmedelsverksamheter:

- restauranger,
- caféer,
- bagerier,
- foodtrucks,
- livsmedelsbutiker,
- andra mindre verksamheter som behöver dokumentera egenkontroll.

Användaren är ofta inte tekniker. Den kan vara ägare, platsansvarig, kökspersonal, extrapersonal eller någon som bara behöver bocka av dagens kontroll utan att förstå systemets uppbyggnad.

## Problemet vi löser

Egenkontroll blir lätt:

- utspridd mellan papper, bilder, anteckningar och minne,
- beroende av att rätt person kommer ihåg rätt sak,
- svår att visa upp när kontrollanten frågar,
- tung att följa upp när något avviker,
- för teknisk eller omständlig för personalen.

Appen ska minska den friktionen. Användaren ska känna: "Jag ser vad som ska göras, gör det direkt och vet att det sparas rätt."

## Produktlöftet

Min Egenkontroll ska hjälpa verksamheten att:

- se dagens kontroller tydligt,
- dokumentera på plats i mobilen,
- hantera avvikelser utan separata lappar,
- veta vem som gjort vad och när,
- hitta historiken snabbt,
- dela relevant dokumentation vid kontroll,
- bygga egna rutiner utan att det känns som programmering.

## Grundprinciper

### 1. Det ska bli gjort

Det viktigaste är inte maximal flexibilitet. Det viktigaste är att personalen faktiskt gör kontrollen. Varje vy ska prioritera nästa handling.

### 2. Mobilen är arbetsplatsen

Appen ska fungera där kontrollen sker: vid kylen, i köket, vid leveransen, i serveringen. Mobilbredd och touch ska vara förstahandsmiljön.

### 3. Redigering ska likna utförande

När ansvarig bygger en kontrolltyp ska det vara tydligt hur personalen senare kommer att fylla i den. Begrepp som kontrolltyp, kontrollpunkt, fält och objekt får inte bli ett hinder för användaren.

### 4. Historik och spårbarhet får inte skadas

Gamla kontroller, avvikelser, bilagor, export och delningslänkar är produktens förtroendekapital. Förändringar i editor, design eller datamodell får inte göra historiken missvisande eller otillgänglig.

### 5. Säkert utan att kännas tungt

Organisationsdata ska vara isolerad och skyddad. Samtidigt ska vardagsflödet inte kännas som ett säkerhetssystem. Säkerheten ska bära produkten i bakgrunden.

### 6. Svenska, konkret och lugnt

Språket ska vara kort, mänskligt och handlingsinriktat. Undvik tekniska och konsultiga formuleringar när en enkel svensk mening räcker.

## Det appen inte ska bli

- En generell formulärbyggare för alla tänkbara branscher i första versionen.
- Ett tungt administrationssystem där vardagsflödet göms bakom inställningar.
- Ett system som kräver lång utbildning för personal.
- En app som ser modern ut men gör kontroller långsammare.
- En offline-app som låtsas kunna spara säkert utan fungerande synk.

## Beslutsregel för nya funktioner

När en ny funktion, vy eller teknisk lösning övervägs, fråga:

1. Gör detta det enklare att få kontrollen gjord?
2. Förstår en stressad, icke-teknisk användare vad den ska göra?
3. Skyddar detta historik, ansvar och spårbarhet?
4. Fungerar det bra på mobil?
5. Kan vi göra det med liten risk för auth, RLS, data och befintliga flöden?

Om svaret är nej på flera punkter ska funktionen skjutas upp, förenklas eller delas upp.

## Vad AI/Codex ska väga högst

Codex ska inte bara fråga "går detta att bygga?". Codex ska väga:

- enkelhet före teknisk elegans,
- tydligt vardagsflöde före maximal konfiguration,
- små säkra steg före stora omskrivningar,
- verifierad arkitektur före antaganden,
- produktens förtroende före snabb kosmetik.

När dokumentation och implementation drar åt olika håll ska befintlig fungerande app inventeras först. Därefter ska dokumentationen eller koden justeras med tydlig scope, inte genom gissningar.
