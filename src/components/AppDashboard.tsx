import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import type { AppView } from './AppBottomNav';
import { ControlRunFormWithPhotos } from './ControlRunFormWithPhotos';
import { ControlTypesView } from './ControlTypesView';
import { HistoryView } from './HistoryView';
import { MenuView } from './MenuView';
import { SavedControlView } from './SavedControlView';
import type { SavedControlSummary } from './SavedControlView';
import { SharingView } from './SharingView';
import { TodayDashboard } from './TodayDashboard';
import type { OrganizationContext } from '../services/organizationService';
import { canManageOrganization } from '../services/organizationService';

export type AppDashboardProps = {
  activeView: AppView;
  user: User;
  context: OrganizationContext;
  onChangeView: (view: AppView) => void;
  onSignOut: () => Promise<void>;
};

const roleLabels = {
  owner: 'Ägare',
  admin: 'Admin',
  staff: 'Personal',
};

function getDisplayName(user: User): string {
  const metadataName = user.user_metadata?.full_name || user.user_metadata?.name;
  if (typeof metadataName === 'string' && metadataName.trim()) return metadataName.trim();
  return user.email ?? 'Inloggad användare';
}

export function AppDashboard({ activeView, user, context, onChangeView, onSignOut }: AppDashboardProps) {
  const canManage = canManageOrganization(context.membership.role);
  const [activeControlTypeId, setActiveControlTypeId] = useState<string | null>(null);
  const [savedSummary, setSavedSummary] = useState<SavedControlSummary | null>(null);
  const [dashboardKey, setDashboardKey] = useState(0);

  useEffect(() => {
    if (activeView !== 'today') {
      setActiveControlTypeId(null);
      setSavedSummary(null);
    }
  }, [activeView]);

  async function handleControlSaved(summary: SavedControlSummary) {
    setActiveControlTypeId(null);
    setSavedSummary(summary);
    setDashboardKey((current) => current + 1);
    onChangeView('today');
  }

  function handleStartControl(controlTypeId: string) {
    setSavedSummary(null);
    setActiveControlTypeId(controlTypeId);
    onChangeView('today');
  }

  function renderView() {
    if (activeControlTypeId) {
      return (
        <ControlRunFormWithPhotos
          controlTypeId={activeControlTypeId}
          organizationId={context.organization.id}
          userId={user.id}
          performedBy={getDisplayName(user)}
          onCancel={() => setActiveControlTypeId(null)}
          onSaved={handleControlSaved}
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

    if (activeView === 'add') {
      return (
        <ControlTypesView
          organizationId={context.organization.id}
          userId={user.id}
          canManage={canManage}
        />
      );
    }

    if (activeView === 'sharing') {
      return canManage ? (
        <SharingView organizationId={context.organization.id} userId={user.id} />
      ) : (
        <section className="empty-view-card" aria-labelledby="sharing-title">
          <p className="eyebrow">Delning</p>
          <h3 id="sharing-title">Admin krävs</h3>
          <p className="muted-copy">Delningslänkar hanteras av administratörer.</p>
        </section>
      );
    }

    if (activeView === 'menu') {
      return (
        <MenuView
          context={context}
          userEmail={user.email}
          roleLabel={roleLabels[context.membership.role]}
          canManage={canManage}
          onSignOut={onSignOut}
        />
      );
    }

    return (
      <TodayDashboard
        key={dashboardKey}
        organizationId={context.organization.id}
        userId={user.id}
        onStartControl={handleStartControl}
      />
    );
  }

  return (
    <section className="dashboard-card" aria-labelledby="dashboard-title">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Inloggad</p>
          <h2 id="dashboard-title">{context.organization.name}</h2>
          <p className="muted-copy">
            {user.email} · {roleLabels[context.membership.role]}
          </p>
        </div>
      </div>

      {renderView()}
    </section>
  );
}
