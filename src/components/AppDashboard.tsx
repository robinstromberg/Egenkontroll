import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import type { AppView } from './AppBottomNav';
import { ControlRunFormWithPhotos } from './ControlRunFormWithPhotos';
import { ControlTypesView } from './ControlTypesView';
import { HelpView } from './HelpView';
import { HistoryView } from './HistoryView';
import { KpiView } from './KpiView';
import { MenuView } from './MenuView';
import { OrganizationBrandingView } from './OrganizationBrandingView';
import { ProfileView } from './ProfileView';
import { SavedControlView } from './SavedControlView';
import type { SavedControlSummary } from './SavedControlView';
import { SharingView } from './SharingView';
import { SuppliersView } from './SuppliersView';
import { TodayDashboard } from './TodayDashboard';
import { UsersView } from './UsersView';
import { BackButton } from './ui/BackButton';
import { FIRST_RUN_ORGANIZATION_KEY } from './OrganizationSetup';
import type { OrganizationContext } from '../services/organizationService';
import { canManageOrganization } from '../services/organizationService';
import type { Organization } from '../types/database';

export type AppDashboardProps = {
  activeView: AppView;
  user: User;
  context: OrganizationContext;
  contexts: OrganizationContext[];
  onChangeOrganization: (organizationId: string) => void;
  onChangeView: (view: AppView) => void;
  onSignOut: () => Promise<void>;
};

export type FirstRunMode = 'owner' | 'staff';
export const STAFF_ONBOARDING_ORGANIZATION_KEY = 'egenkontroll:staff-onboarding-organization-id';

const roleLabels = {
  owner: 'Ägare',
  admin: 'Admin',
  staff: 'Personal',
};

function getDisplayName(user: User, profileName?: string | null): string {
  if (profileName?.trim()) return profileName.trim();
  const metadataName = user.user_metadata?.full_name || user.user_metadata?.name;
  if (typeof metadataName === 'string' && metadataName.trim()) return metadataName.trim();
  return user.email ?? 'Inloggad användare';
}

function getHeaderMeta(displayName: string, roleLabel: string, email?: string): string {
  return displayName && displayName !== email ? `${displayName} · ${roleLabel}` : roleLabel;
}

function readFirstRunMode(organizationId: string): FirstRunMode | null {
  if (window.localStorage.getItem(FIRST_RUN_ORGANIZATION_KEY) === organizationId) return 'owner';
  if (window.localStorage.getItem(STAFF_ONBOARDING_ORGANIZATION_KEY) === organizationId) return 'staff';
  return null;
}

export function AppDashboard({
  activeView,
  user,
  context,
  contexts,
  onChangeOrganization,
  onChangeView,
  onSignOut,
}: AppDashboardProps) {
  const canManage = canManageOrganization(context.membership.role);
  const displayName = getDisplayName(user, context.profile?.full_name);
  const headerMeta = getHeaderMeta(displayName, roleLabels[context.membership.role], user.email);
  const [activeContext, setActiveContext] = useState(context);
  const [activeControlTypeId, setActiveControlTypeId] = useState<string | null>(null);
  const [menuSubview, setMenuSubview] = useState<
    'profile' | 'organization' | 'users' | 'controlTypes' | 'suppliers' | 'help' | null
  >(null);
  const [savedSummary, setSavedSummary] = useState<SavedControlSummary | null>(null);
  const [dashboardKey, setDashboardKey] = useState(0);
  const [firstRunMode, setFirstRunMode] = useState<FirstRunMode | null>(
    () => readFirstRunMode(context.organization.id),
  );

  useEffect(() => {
    setActiveContext(context);
    setActiveControlTypeId(null);
    setSavedSummary(null);
    setMenuSubview(null);
    setDashboardKey((current) => current + 1);
    setFirstRunMode(readFirstRunMode(context.organization.id));
  }, [context]);

  useEffect(() => {
    if (activeView !== 'today') {
      setActiveControlTypeId(null);
      setSavedSummary(null);
    }
    if (activeView !== 'menu') {
      setMenuSubview(null);
    }
  }, [activeView]);

  async function handleControlSaved(summary: SavedControlSummary) {
    setActiveControlTypeId(null);
    setSavedSummary(summary);
    setDashboardKey((current) => current + 1);
    if (window.localStorage.getItem(FIRST_RUN_ORGANIZATION_KEY) === context.organization.id) {
      window.localStorage.removeItem(FIRST_RUN_ORGANIZATION_KEY);
    }
    if (window.localStorage.getItem(STAFF_ONBOARDING_ORGANIZATION_KEY) === context.organization.id) {
      window.localStorage.removeItem(STAFF_ONBOARDING_ORGANIZATION_KEY);
    }
    setFirstRunMode(null);
    onChangeView('today');
  }

  function handleStartControl(controlTypeId: string) {
    setSavedSummary(null);
    setActiveControlTypeId(controlTypeId);
    onChangeView('today');
  }

  function handleOrganizationSaved(organization: Organization) {
    setActiveContext((current) => ({
      ...current,
      organization,
    }));
  }

  function renderView() {
    if (activeControlTypeId) {
      return (
        <ControlRunFormWithPhotos
          controlTypeId={activeControlTypeId}
          organizationId={context.organization.id}
          userId={user.id}
          performedBy={displayName}
          onCancel={() => setActiveControlTypeId(null)}
          onSaved={handleControlSaved}
          canManage={canManage}
          onConfigureControlType={() => {
            setActiveControlTypeId(null);
            setMenuSubview('controlTypes');
            onChangeView('menu');
          }}
        />
      );
    }

    if (savedSummary) {
      return (
        <SavedControlView
          summary={savedSummary}
          onDone={() => setSavedSummary(null)}
          onShowHistory={() => {
            setSavedSummary(null);
            onChangeView('history');
          }}
        />
      );
    }

    if (activeView === 'history') {
      return <HistoryView organizationId={context.organization.id} />;
    }

    if (activeView === 'kpi') {
      return <KpiView organizationId={context.organization.id} />;
    }

    if (activeView === 'sharing') {
      return canManage ? (
        <SharingView
          organizationId={context.organization.id}
          userId={user.id}
          onBackToToday={() => onChangeView('today')}
        />
      ) : (
        <section className="empty-view-card" aria-labelledby="sharing-title">
          <p className="eyebrow">Delning</p>
          <h3 id="sharing-title">Admin krävs</h3>
          <p className="muted-copy">Delningslänkar hanteras av administratörer.</p>
          <BackButton label="Till idag" onClick={() => onChangeView('today')} />
        </section>
      );
    }

    if (activeView === 'menu') {
      if (menuSubview === 'profile') {
        return <ProfileView user={user} initialFullName={context.profile?.full_name ?? ''} onBack={() => setMenuSubview(null)} />;
      }

      if (menuSubview === 'organization') {
        return (
          <OrganizationBrandingView
            organization={activeContext.organization}
            onBack={() => setMenuSubview(null)}
            onSaved={handleOrganizationSaved}
          />
        );
      }

      if (menuSubview === 'users') {
        return (
          <UsersView
            organizationId={context.organization.id}
            userId={user.id}
            canManage={canManage}
            onBack={() => setMenuSubview(null)}
          />
        );
      }

      if (menuSubview === 'controlTypes') {
        return (
          <ControlTypesView
            organizationId={context.organization.id}
            userId={user.id}
            canManage={canManage}
            onBack={() => setMenuSubview(null)}
          />
        );
      }

      if (menuSubview === 'suppliers') {
        return (
          <SuppliersView
            organizationId={context.organization.id}
            userId={user.id}
            onBack={() => setMenuSubview(null)}
          />
        );
      }

      if (menuSubview === 'help') {
        return <HelpView onBack={() => setMenuSubview(null)} />;
      }

      return (
        <MenuView
          context={activeContext}
          userEmail={user.email}
          roleLabel={roleLabels[context.membership.role]}
          canManage={canManage}
          onOpenProfile={() => setMenuSubview('profile')}
          onOpenOrganization={() => setMenuSubview('organization')}
          onOpenUsers={() => setMenuSubview('users')}
          onOpenControlTypes={() => setMenuSubview('controlTypes')}
          onOpenSuppliers={() => setMenuSubview('suppliers')}
          onOpenHelp={() => setMenuSubview('help')}
          onSignOut={onSignOut}
        />
      );
    }

    return (
      <TodayDashboard
        key={dashboardKey}
        organizationId={context.organization.id}
        userId={user.id}
        displayName={displayName}
        onStartControl={handleStartControl}
        canManage={canManage}
        firstRunMode={firstRunMode}
        onOpenControlTypes={() => {
          setMenuSubview('controlTypes');
          onChangeView('menu');
        }}
      />
    );
  }

  return (
    <section className="dashboard-card" aria-labelledby="dashboard-title">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Inloggad</p>
          <h2 id="dashboard-title">{activeContext.organization.name}</h2>
          <p className="muted-copy">
            {headerMeta}
          </p>
        </div>
        {contexts.length > 1 ? (
          <label className="workspace-switcher">
            <span>Verksamhet</span>
            <select
              value={context.organization.id}
              onChange={(event) => onChangeOrganization(event.target.value)}
            >
              {contexts.map((item) => (
                <option value={item.organization.id} key={item.organization.id}>
                  {item.organization.name} - {roleLabels[item.membership.role]}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {renderView()}
    </section>
  );
}
