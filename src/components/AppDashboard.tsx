import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import type { AppView } from './AppBottomNav';
import { ControlRunFormWithPhotos } from './ControlRunFormWithPhotos';
import { ControlTypesView } from './ControlTypesView';
import { HistoryView } from './HistoryView';
import { SharingView } from './SharingView';
import { TodayDashboard } from './TodayDashboard';
import { ActionButton } from './ui/ActionButton';
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

export function AppDashboard({ activeView, user, context, onChangeView, onSignOut }: AppDashboardProps) {
  const canManage = canManageOrganization(context.membership.role);
  const [activeControlTypeId, setActiveControlTypeId] = useState<string | null>(null);
  const [dashboardKey, setDashboardKey] = useState(0);

  useEffect(() => {
    if (activeView !== 'today') {
      setActiveControlTypeId(null);
    }
  }, [activeView]);

  async function handleControlSaved() {
    setActiveControlTypeId(null);
    setDashboardKey((current) => current + 1);
    onChangeView('today');
  }

  function handleStartControl(controlTypeId: string) {
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
          onCancel={() => setActiveControlTypeId(null)}
          onSaved={handleControlSaved}
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
        <section className="menu-view" aria-labelledby="menu-title">
          <div className="menu-card">
            <p className="eyebrow">Meny</p>
            <h3 id="menu-title">{context.organization.name}</h3>
            <p className="muted-copy">
              {user.email} · {roleLabels[context.membership.role]}
            </p>
          </div>
          <div className="role-panel">
            <h3>Roll och åtkomst</h3>
            <p>
              {canManage
                ? 'Du kan hantera verksamhetens struktur, användare och delningslänkar.'
                : 'Du kan utföra kontroller och se relevant historik för verksamheten.'}
            </p>
          </div>
          <ActionButton variant="secondary" type="button" onClick={onSignOut}>
            Logga ut
          </ActionButton>
        </section>
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
