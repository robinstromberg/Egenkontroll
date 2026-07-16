import './PublicLandingPage.css';
import { brandAssets } from '@min-egenkontroll/brand';

export function TermsPage() {
  return (
    <main className="public-site public-legal-page">
      <nav className="public-nav" aria-label="Publik navigation">
        <a className="public-brand" href="/">
          <img src={brandAssets.logo} alt="Min Egenkontroll" />
        </a>
        <div className="public-nav-actions">
          <a href="/">Till startsidan</a>
          <a href="/login">Logga in</a>
        </div>
      </nav>

      <article className="public-legal-card">
        <p className="public-eyebrow">Juridik och användning</p>
        <h1>Användarvillkor</h1>
        <p className="public-legal-updated">Senast uppdaterad: 29 juni 2026</p>

        <section>
          <h2>1. Om tjänsten</h2>
          <p>
            Min Egenkontroll är en digital tjänst för dokumentation av egenkontroll i livsmedelsverksamheter.
            Tjänsten kan användas för att skapa kontrolltyper, registrera kontroller, dokumentera avvikelser,
            spara historik och dela dokumentation.
          </p>
          <p>
            Under förhandslanseringen tillhandahålls tjänsten kostnadsfritt medan den fortsätter att utvecklas
            och testas tillsammans med användare.
          </p>
        </section>

        <section>
          <h2>2. Vem får använda tjänsten?</h2>
          <p>
            Tjänsten är avsedd för företag, organisationer och personer som arbetar med eller ansvarar för
            egenkontroll i en verksamhet. Den som skapar konto ansvarar för att uppgifterna som lämnas är korrekta
            och att användningen sker för en legitim verksamhet.
          </p>
        </section>

        <section>
          <h2>3. Konto och behörigheter</h2>
          <p>
            Användaren ansvarar för att skydda sina inloggningsuppgifter och för den aktivitet som sker via det egna
            kontot. Om du misstänker obehörig åtkomst ska du kontakta oss så snart som möjligt.
          </p>
          <p>
            En verksamhet kan ha flera användare med olika roller och behörigheter. Den som administrerar en
            verksamhet ansvarar för att endast behöriga personer får tillgång till verksamhetens information.
          </p>
        </section>

        <section>
          <h2>4. Användarens ansvar</h2>
          <p>
            Min Egenkontroll är ett verktyg för dokumentation och uppföljning. Användaren och verksamheten ansvarar
            själva för att egenkontrollen är korrekt, aktuell och anpassad till verksamhetens faktiska behov och till
            de krav som gäller för verksamheten.
          </p>
          <p>Användaren får inte använda tjänsten för att:</p>
          <ul>
            <li>registrera information som är olaglig, vilseledande eller kränkande</li>
            <li>försöka få obehörig åtkomst till andra användares eller verksamheters data</li>
            <li>störa, överbelasta eller skada tjänstens drift</li>
            <li>kringgå säkerhetsfunktioner eller behörighetskontroller</li>
          </ul>
        </section>

        <section>
          <h2>5. Egenkontroll och myndighetskrav</h2>
          <p>
            Tjänsten hjälper till att strukturera och spara dokumentation, men ersätter inte verksamhetens eget
            ansvar för livsmedelssäkerhet, rutiner, utbildning, uppföljning eller kontakt med kontrollmyndighet.
          </p>
          <p>
            Vi kan inte garantera att en viss användning av tjänsten automatiskt uppfyller alla krav som gäller för
            varje enskild verksamhet. Verksamheten ansvarar för att kontrollera vilka regler, rutiner och gränsvärden
            som gäller i det egna fallet.
          </p>
        </section>

        <section>
          <h2>6. Förhandslansering</h2>
          <p>
            Under förhandslanseringen kan funktioner ändras, läggas till eller tas bort. Tjänsten kan innehålla
            brister eller tillfälliga begränsningar. Vi försöker informera användare om större ändringar som påverkar
            användningen.
          </p>
          <p>
            Om tjänsten senare övergår till betalda abonnemang kommer användare att informeras i god tid innan några
            betalningar börjar gälla.
          </p>
        </section>

        <section>
          <h2>7. Pris och betalning</h2>
          <p>
            Under förhandslanseringen är tjänsten kostnadsfri. Planerade priser efter lansering kan komma att visas
            på webbplatsen, men de börjar inte gälla förrän tjänsten lanseras skarpt och användaren har informerats
            om villkoren.
          </p>
          <p>
            Betalningsvillkor, abonnemangsperioder, uppsägning och eventuell återbetalning kommer att förtydligas
            innan betald användning införs.
          </p>
        </section>

        <section>
          <h2>8. Tillgänglighet och ändringar</h2>
          <p>
            Vi strävar efter att tjänsten ska vara tillgänglig och fungera stabilt, men kan inte garantera oavbruten
            drift. Tjänsten kan tillfälligt vara otillgänglig på grund av underhåll, tekniska fel eller störningar hos
            leverantörer.
          </p>
          <p>
            Vi får ändra, vidareutveckla eller avveckla funktioner när det behövs, till exempel av tekniska,
            säkerhetsmässiga, juridiska eller affärsmässiga skäl.
          </p>
        </section>

        <section>
          <h2>9. Data och innehåll</h2>
          <p>
            Användaren och verksamheten behåller ansvaret för den information som läggs in i tjänsten. Vi gör inte
            anspråk på äganderätt till användarens egenkontrolldata.
          </p>
          <p>
            Vi får behandla informationen i den utsträckning som behövs för att tillhandahålla, säkra, felsöka och
            förbättra tjänsten. Hur personuppgifter behandlas beskrivs i vår integritetspolicy.
          </p>
        </section>

        <section>
          <h2>10. Ansvarsbegränsning</h2>
          <p>
            Tjänsten tillhandahålls som ett hjälpmedel. Vi ansvarar inte för verksamhetens faktiska egenkontroll,
            myndighetsbedömningar, förlorad dokumentation som beror på felaktig användning eller beslut som fattas
            enbart baserat på information i tjänsten.
          </p>
          <p>
            Vi ansvarar inte för indirekta skador, utebliven vinst, produktionsbortfall eller liknande följder, i den
            utsträckning sådan begränsning är tillåten enligt lag.
          </p>
        </section>

        <section>
          <h2>11. Avslut av konto</h2>
          <p>
            Användare kan kontakta oss för att avsluta konto eller begära radering av personuppgifter. Viss
            verksamhetsdokumentation kan behöva hanteras av verksamhetens administratör eller sparas under en tid om
            det krävs för dokumentation, rättsliga krav eller tvist.
          </p>
        </section>

        <section>
          <h2>12. Kontakt</h2>
          <p>
            Frågor om dessa villkor skickas till <a href="mailto:support@minegenkontroll.se">support@minegenkontroll.se</a>.
          </p>
        </section>

        <section>
          <h2>13. Ändringar av villkoren</h2>
          <p>
            Vi kan uppdatera dessa användarvillkor vid behov. Den senaste versionen finns alltid tillgänglig på
            denna sida. Vid större ändringar som påverkar användningen av tjänsten försöker vi informera användare på
            ett tydligt sätt.
          </p>
        </section>
      </article>
    </main>
  );
}
