import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { AppBottomNav } from './components/AppBottomNav';
import type { AppView } from './components/AppBottomNav';
import { AppDashboard } from './components/AppDashboard';
import { AuthPanel } from './components/AuthPanel';
import { InspectorView } from './components/InspectorView';
import { OrganizationSetup } from './components/OrganizationSetup';
import { PasswordSetupPanel } from './components/PasswordSetupPanel';
import { getCurrentSession, signOut } from './services/authService';
import { ensureProfile, listOrganizationContexts } from './services/organizationService';
import type { OrganizationContext } from './services/organizationService';
import { supabase } from './lib/supabaseClient';

const appViews: AppView[] = ['today', 'history', 'add', 'sharing', 'menu'];

function isAppView(value: string | null): value is AppView {
  return Boolean(value && appViews.includes(value as AppView));
}

function readHashParams(): URLSearchParams {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  return new URLSearchParams(hash);
}

function readInspectorKey(): string | null {
  const params = readHashParams();
  return params.get('inspector');
}

function readActiveView(): AppView {
  const params = readHashParams();
  const view = params.get('view');
  return isAppView(view) ? view : 'today';
}

function writeActiveView(view: AppView) {
  const nextHash = view === 'today' ? '' : `#view=${view}`;
  const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;
  window.history.replaceState(null, '', nextUrl);
}

function App() {
  const inspectorKey = readInspectorKey();
  const [session, setSession] = useState<Session | null>(null);
  const [activeView, setActiveView] = useState<AppView>(() => readActiveView());
  const [organizationContexts, setOrganizationContexts] = useState<OrganizationContext[]>([]);
  const [passwordRecovery, setPasswordRecovery] = useState(
    () => window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery'),
  );
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

    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecovery(true);
      }

      setSession(nextSession);
      if (nextSession?.user) {
        void ensureProfile(nextSession.user).then(loadOrganizationContext);
      } else {
        setOrganizationContexts([]);
      }
    });

    return () => data.subscription.unsubscribe();
  }, [inspectorKey, loadOrganizationContext, loadSession]);

  useEffect(() => {
    if (inspectorKey) return;

    function handleHashChange() {
      const nextInspectorKey = readInspectorKey();
      if (nextInspectorKey) return;
      setActiveView(readActiveView());
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [inspectorKey]);

  useEffect(() => {
    if (inspectorKey || !session?.user || passwordRecovery) return;
    writeActiveView(activeView);
  }, [activeView, inspectorKey, passwordRecovery, session?.user]);

  async function handleSignOut() {
    await signOut();
    setSession(null);
    setOrganizationContexts([]);
    setActiveView('today');
    setPasswordRecovery(false);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  }

  if (inspectorKey) {
    return <InspectorView shareKey={inspectorKey} />;
  }

  const activeContext = organizationContexts[0];
  const showNavigation = Boolean(session?.user);

  return (
    <>
      <main className={showNavigation ? 'app-shell with-bottom-bar' : 'app-shell'}>
        {!showNavigation ? <section className="hero-card" aria-labelledby="page-title">
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
        </section> : null}

        {message ? <p className="form-message error-message">{message}</p> : null}

        {loading ? (
          <section className="status-panel">
            <p className="eyebrow">Laddar</p>
            <h2>Kontrollerar session...</h2>
          </section>
        ) : !session?.user ? (
          <AuthPanel />
        ) : passwordRecovery ? (
          <PasswordSetupPanel onSaved={() => setPasswordRecovery(false)} onSkip={() => setPasswordRecovery(false)} />
        ) : activeContext ? (
          <AppDashboard
            activeView={activeView}
            user={session.user}
            context={activeContext}
            onChangeView={setActiveView}
            onSignOut={handleSignOut}
          />
        ) : (
          <OrganizationSetup user={session.user} onCreated={loadOrganizationContext} />
        )}
      </main>
      {showNavigation ? <AppBottomNav activeView={activeView} onChangeView={setActiveView} /> : null}
    </>
  );
}

export default App;
