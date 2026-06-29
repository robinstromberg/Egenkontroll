import './PublicLandingPage.css';
import { brandAssets } from '../config/assets';

export function PrivacyPolicyPage() {
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
        <p className="public-eyebrow">Juridik och integritet</p>
        <h1>Integritetspolicy</h1>
        <p className="public-legal-updated">Senast uppdaterad: 29 juni 2026</p>

        <section>
          <h2>1. Vem ansvarar för personuppgifterna?</h2>
          <p>
            Min Egenkontroll tillhandahålls av Robin Strömberg. Om tjänsten senare drivs genom ett bolag kommer
            denna information att uppdateras.
          </p>
          <p>
            Kontakt i integritetsfrågor: <a href="mailto:integritet@minegenkontroll.se">integritet@minegenkontroll.se</a>
          </p>
        </section>

        <section>
          <h2>2. Vilka uppgifter behandlas?</h2>
          <p>
            Vi behandlar de personuppgifter som behövs för att skapa konto, logga in, använda tjänsten och
            dokumentera egenkontroll i en verksamhet.
          </p>
          <ul>
            <li>namn och e-postadress</li>
            <li>kontoinformation, användarroll och behörigheter</li>
            <li>uppgifter om verksamheten användaren tillhör</li>
            <li>kontroller, signeringar, kommentarer, avvikelser och historik som registreras i tjänsten</li>
            <li>bilder eller filer som användaren själv laddar upp</li>
            <li>teknisk information, till exempel IP-adress, enhet, webbläsare och systemloggar</li>
            <li>supportärenden och annan kommunikation med oss</li>
          </ul>
          <p>Vi behandlar inte lösenord i klartext.</p>
        </section>

        <section>
          <h2>3. Varför behandlas uppgifterna?</h2>
          <p>Personuppgifter behandlas för att:</p>
          <ul>
            <li>skapa och hantera användarkonton</li>
            <li>tillhandahålla appens funktioner</li>
            <li>låta verksamheter dokumentera egenkontroll</li>
            <li>visa historik, avvikelser och rapporter</li>
            <li>möjliggöra export och delning av dokumentation</li>
            <li>ge support</li>
            <li>förbättra säkerhet, felsöka problem och förebygga missbruk</li>
            <li>uppfylla rättsliga skyldigheter när sådana finns</li>
          </ul>
        </section>

        <section>
          <h2>4. Laglig grund</h2>
          <p>
            Behandlingen sker främst för att kunna tillhandahålla tjänsten och fullgöra avtalet med användaren
            eller den verksamhet användaren representerar.
          </p>
          <p>
            Vissa uppgifter behandlas med stöd av berättigat intresse, till exempel tekniska loggar, säkerhet,
            support och felsökning. Om vi behöver spara uppgifter för att följa lagkrav, till exempel bokföringsregler
            vid framtida betalning, sker behandlingen med stöd av rättslig förpliktelse.
          </p>
        </section>

        <section>
          <h2>5. Hur länge sparas uppgifterna?</h2>
          <p>
            Personuppgifter sparas så länge de behövs för att tillhandahålla tjänsten och uppfylla syftena ovan.
            Kontouppgifter sparas normalt så länge kontot är aktivt.
          </p>
          <p>
            Uppgifter som ingår i en verksamhets egenkontrolldokumentation sparas så länge verksamheten behöver
            dokumentationen för historik, uppföljning eller kontroll. När uppgifter inte längre behövs raderas eller
            anonymiseras de, om vi inte måste spara dem längre enligt lag.
          </p>
        </section>

        <section>
          <h2>6. Vilka leverantörer används?</h2>
          <p>Vi säljer inte personuppgifter. Följande leverantörer kan behandla uppgifter för att tjänsten ska fungera:</p>
          <ul>
            <li>Supabase för databas, inloggning, autentisering och lagring</li>
            <li>Vercel för hosting och drift av webbappen</li>
            <li>Proton för e-post, om e-post via den egna domänen aktiveras</li>
            <li>Hostinger för domän- och DNS-hantering</li>
            <li>betalningsleverantör om betalning införs senare</li>
          </ul>
          <p>
            Leverantörerna får bara behandla personuppgifter i den utsträckning som krävs för att leverera sina
            tjänster till oss.
          </p>
        </section>

        <section>
          <h2>7. Överföring utanför EU/EES</h2>
          <p>
            Vi strävar efter att använda leverantörer och datacenter inom EU/EES när det är möjligt. Vissa
            leverantörer kan dock ha koncernbolag, supportfunktioner eller underleverantörer utanför EU/EES. I sådana
            fall ska lämpliga skyddsåtgärder användas, till exempel standardavtalsklausuler eller motsvarande skydd
            enligt dataskyddslagstiftningen.
          </p>
        </section>

        <section>
          <h2>8. Säkerhet</h2>
          <p>
            Vi använder tekniska och organisatoriska skyddsåtgärder för att minska risken för obehörig åtkomst,
            förlust, ändring eller radering av personuppgifter.
          </p>
          <ul>
            <li>inloggning och behörighetsstyrning</li>
            <li>begränsad åtkomst till data</li>
            <li>krypterad kommunikation via HTTPS</li>
            <li>drift hos etablerade leverantörer</li>
            <li>backup- och återställningsrutiner inför skarp drift</li>
          </ul>
        </section>

        <section>
          <h2>9. Cookies och lokal lagring</h2>
          <p>
            Min Egenkontroll använder nödvändiga tekniker, till exempel cookies eller lokal lagring, för att
            inloggning och appfunktioner ska fungera. Om vi senare använder cookies för statistik, marknadsföring
            eller andra icke-nödvändiga ändamål kommer vi att informera om detta och be om samtycke där det krävs.
          </p>
        </section>

        <section>
          <h2>10. Dina rättigheter</h2>
          <p>Du har rätt att:</p>
          <ul>
            <li>få information om hur dina personuppgifter behandlas</li>
            <li>begära tillgång till dina personuppgifter</li>
            <li>begära rättelse av felaktiga uppgifter</li>
            <li>begära radering av uppgifter</li>
            <li>begära begränsning av behandling</li>
            <li>invända mot viss behandling</li>
            <li>begära dataportabilitet där det är tillämpligt</li>
            <li>återkalla samtycke där behandlingen bygger på samtycke</li>
          </ul>
          <p>
            Kontakta oss på <a href="mailto:integritet@minegenkontroll.se">integritet@minegenkontroll.se</a> om du vill
            använda någon av dina rättigheter.
          </p>
          <p>
            Du har även rätt att lämna klagomål till Integritetsskyddsmyndigheten, IMY.
          </p>
        </section>

        <section>
          <h2>11. Begära export eller radering av data</h2>
          <p>
            Vill du begära export eller radering av personuppgifter skickar du ett mejl till
            {' '}<a href="mailto:integritet@minegenkontroll.se">integritet@minegenkontroll.se</a>.
          </p>
          <p>Mejlet bör innehålla:</p>
          <ul>
            <li>vilken e-postadress ditt konto använder</li>
            <li>om begäran gäller export eller radering</li>
            <li>vilken verksamhet eller organisation begäran gäller, om det är relevant</li>
            <li>om begäran gäller ditt eget konto eller en verksamhet du administrerar</li>
          </ul>
          <p>
            Vi kan behöva kontrollera din identitet och behörighet innan vi lämnar ut, raderar eller ändrar data.
            Om begäran gäller en verksamhets egenkontrolldata behöver vi kontrollera att du har rätt att företräda
            verksamheten eller är administratör för den i tjänsten.
          </p>
          <p>
            Viss information kan behöva sparas även efter en raderingsbegäran, till exempel om det krävs enligt lag,
            för bokföring, säkerhetsutredning eller för att hantera en rättslig tvist.
          </p>
        </section>

        <section>
          <h2>12. Ändringar</h2>
          <p>
            Vi kan uppdatera denna integritetspolicy vid behov. Den senaste versionen finns alltid tillgänglig på
            denna sida.
          </p>
        </section>
      </article>
    </main>
  );
}
