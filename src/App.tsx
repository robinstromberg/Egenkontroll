import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { AppBottomNav } from './components/AppBottomNav';
import type { AppView } from './components/AppBottomNav';
import { AppDashboard } from './components/AppDashboard';
import { AuthPanel } from './components/AuthPanel';
import { InspectorView } from './components/InspectorView';
import { OrganizationSetup } from './components/OrganizationSetup';
import { PasswordSetupPanel } from './components/PasswordSetupPanel';
import { PublicLandingPage } from './components/PublicLandingPage';
import { brandAssets } from './config/assets';
import { getCurrentSession, signOut } from './services/authService';
import { ensureProfile, listOrganizationContexts } from './services/organizationService';
import type { OrganizationContext } from './services/organizationService';
import { supabase } from './lib/supabaseClient';

const appViews: AppView[] = ['today', 'history', 'kpi', 'sharing', 'menu'];
type PublicPath = 'home' | 'login' | 'signup';
const ACTIVE_ORGANIZATION_KEY = 'egenkontroll:active-organization-id';

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
  const params = new URLSearchParams();

  if (view !== 'today') {
    params.set('view', view);
  }

  const nextHash = params.toString() ? `#${params.toString()}` : '';
  const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;
  window.history.replaceState(null, '', nextUrl);
}

function readPublicPath(): PublicPath {
  if (window.location.pathname === '/login') return 'login';
  if (window.location.pathname === '/signup') return 'signup';
  return 'home';
}

function readStoredOrganizationId(): string | null {
  return window.localStorage.getItem(ACTIVE_ORGANIZATION_KEY);
}

function App() {
  const inspectorKey = readInspectorKey();
  const [session, setSession] = useState<Session | null>(null);
  const [activeView, setActiveView] = useState<AppView>(() => readActiveView());
  const [publicPath, setPublicPath] = useState<PublicPath>(() => readPublicPath());
  const [organizationContexts, setOrganizationContexts] = useState<OrganizationContext[]>([]);
  const [activeOrganizationId, setActiveOrganizationId] = useState<string | null>(() => readStoredOrganizationId());
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

    function handlePopState() {
      setPublicPath(readPublicPath());
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [inspectorKey]);

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
    setActiveOrganizationId(null);
    setActiveView('today');
    setPasswordRecovery(false);
    window.localStorage.removeItem(ACTIVE_ORGANIZATION_KEY);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  }

  function handleChangeOrganization(organizationId: string) {
    setActiveOrganizationId(organizationId);
    window.localStorage.setItem(ACTIVE_ORGANIZATION_KEY, organizationId);
    setActiveView('today');
  }

  function navigatePublic(path: PublicPath) {
    const pathname = path === 'home' ? '/' : `/${path}`;
    window.history.pushState(null, '', pathname);
    setPublicPath(path);
  }

  const activeContext =
    organizationContexts.find((context) => context.organization.id === activeOrganizationId) ??
    organizationContexts[0];

  useEffect(() => {
    if (!session?.user || organizationContexts.length === 0) return;
    if (activeContext && activeContext.organization.id === activeOrganizationId) return;

    const nextOrganizationId = activeContext?.organization.id ?? organizationContexts[0].organization.id;
    setActiveOrganizationId(nextOrganizationId);
    window.localStorage.setItem(ACTIVE_ORGANIZATION_KEY, nextOrganizationId);
  }, [activeContext, activeOrganizationId, organizationContexts, session?.user]);
  const showNavigation = Boolean(session?.user);

  if (inspectorKey) {
    return <InspectorView shareKey={inspectorKey} />;
  }

  if (!loading && !session?.user && !passwordRecovery && publicPath === 'home') {
    return <PublicLandingPage onStartTrial={() => navigatePublic('signup')} onLogin={() => navigatePublic('login')} />;
  }

  return (
    <>
      <main className={showNavigation ? 'app-shell with-bottom-bar' : 'app-shell'}>
        {!showNavigation ? <section className="hero-card auth-hero-card" aria-labelledby="page-title">
          <div className="app-icon" aria-hidden="true">
            <img src={brandAssets.icon} alt="" />
          </div>
          <div className="hero-copy">
            <p className="eyebrow">{publicPath === 'signup' ? 'Förhandslansering' : 'Välkommen tillbaka'}</p>
            <h1 id="page-title">Min Egenkontroll</h1>
            <p className="lead">
              Digital egenkontroll för livsmedelsverksamheter. Gå med i förhandslanseringen, logga in eller
              använd magic link som reserv.
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
          <AuthPanel key={publicPath} initialMode={publicPath === 'signup' ? 'create' : 'enter'} />
        ) : passwordRecovery ? (
          <PasswordSetupPanel onSaved={() => setPasswordRecovery(false)} onSkip={() => setPasswordRecovery(false)} />
        ) : activeContext ? (
          <AppDashboard
            activeView={activeView}
            user={session.user}
            context={activeContext}
            contexts={organizationContexts}
            onChangeOrganization={handleChangeOrganization}
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
