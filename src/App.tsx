import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { AppBottomNav } from './components/AppBottomNav';
import { AppDashboard } from './components/AppDashboard';
import { AuthPanel } from './components/AuthPanel';
import { InspectorView } from './components/InspectorView';
import { OrganizationSetup } from './components/OrganizationSetup';
import { getCurrentSession, signOut } from './services/authService';
import { ensureProfile, listOrganizationContexts } from './services/organizationService';
import type { OrganizationContext } from './services/organizationService';
import { supabase } from './lib/supabaseClient';

function readInspectorKey(): string | null {
  const marker = '#inspector=';
  if (!window.location.hash.startsWith(marker)) return null;
  return window.location.hash.slice(marker.length);
}

function App() {
  const inspectorKey = readInspectorKey();
  const [session, setSession] = useState<Session | null>(null);
  const [organizationContexts, setOrganizationContexts] = useState<OrganizationContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadOrganizationContext = useCallback(async () => {
    const contexts = await listOrganizationContexts();
    setOrganizationContexts(contexts);
  }, []);

  const loadSession = useCallback(async () => {
    setLoading(true);
    setMessage('');

    try {
      const currentSession = await getCurrentSession();
      setSession(currentSession);

      if (currentSession?.user) {
        await ensureProfile(currentSession.user);
        await loadOrganizationContext();
      } else {
        setOrganizationContexts([]);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Appen kunde inte läsa sessionen.');
    } finally {
      setLoading(false);
    }
  }, [loadOrganizationContext]);

  useEffect(() => {
    if (inspectorKey) return;

    void loadSession();

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        void ensureProfile(nextSession.user).then(loadOrganizationContext);
      } else {
        setOrganizationContexts([]);
      }
    });

    return () => data.subscription.unsubscribe();
  }, [inspectorKey, loadOrganizationContext, loadSession]);

  async function handleSignOut() {
    await signOut();
    setSession(null);
    setOrganizationContexts([]);
  }

  if (inspectorKey) {
    return <InspectorView shareKey={inspectorKey} />;
  }

  const activeContext = organizationContexts[0];
  const showNavigation = Boolean(session?.user);

  return (
    <>
      <main className={showNavigation ? 'app-shell with-bottom-bar' : 'app-shell'}>
        <section className="hero-card" aria-labelledby="page-title">
          <div className="app-icon" aria-hidden="true">
            ✓
          </div>
          <div className="hero-copy">
            <p className="eyebrow">Mobilförst SaaS-webapp</p>
            <h1 id="page-title">Egenkontroll</h1>
            <p className="lead">
              Digital egenkontroll för livsmedelsverksamheter. Inloggning, verksamhetsyta
              och rollbaserad åtkomst är nu på plats som grund för kommande kontrollflöden.
            </p>
          </div>
        </section>

        {message ? <p className="form-message error-message">{message}</p> : null}

        {loading ? (
          <section className="status-panel">
            <p className="eyebrow">Laddar</p>
            <h2>Kontrollerar session...</h2>
          </section>
        ) : !session?.user ? (
          <AuthPanel />
        ) : activeContext ? (
          <AppDashboard user={session.user} context={activeContext} onSignOut={handleSignOut} />
        ) : (
          <OrganizationSetup user={session.user} onCreated={loadOrganizationContext} />
        )}
      </main>
      {showNavigation ? <AppBottomNav /> : null}
    </>
  );
}

export default App;
