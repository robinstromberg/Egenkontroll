import type { User } from '@supabase/supabase-js';
import { useState } from 'react';
import { AdminControls } from './AdminControls';
import { ControlRunForm } from './ControlRunForm';
import { TodayDashboard } from './TodayDashboard';
import { ActionButton } from './ui/ActionButton';
import type { OrganizationContext } from '../services/organizationService';
import { canManageOrganization } from '../services/organizationService';

export type AppDashboardProps = {
  user: User;
  context: OrganizationContext;
  onSignOut: () => Promise<void>;
};

const roleLabels = {
  owner: 'Ägare',
  admin: 'Admin',
  staff: 'Personal',
};

export function AppDashboard({ user, context, onSignOut }: AppDashboardProps) {
  const canManage = canManageOrganization(context.membership.role);
  const [activeControlTypeId, setActiveControlTypeId] = useState<string | null>(null);
  const [dashboardKey, setDashboardKey] = useState(0);

  async function handleControlSaved() {
    setActiveControlTypeId(null);
    setDashboardKey((current) => current + 1);
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
        <ActionButton variant="secondary" type="button" onClick={onSignOut}>
          Logga ut
        </ActionButton>
      </div>

      <div className="role-panel">
        <h3>Roll och åtkomst</h3>
        <p>
          {canManage
            ? 'Du kan hantera verksamhetens struktur, användare och kommande delningslänkar.'
            : 'Du kan utföra kontroller och se relevant historik för verksamheten.'}
        </p>
      </div>

      {activeControlTypeId ? (
        <ControlRunForm
          controlTypeId={activeControlTypeId}
          organizationId={context.organization.id}
          userId={user.id}
          onCancel={() => setActiveControlTypeId(null)}
          onSaved={handleControlSaved}
        />
      ) : (
        <TodayDashboard
          key={dashboardKey}
          organizationId={context.organization.id}
          onStartControl={setActiveControlTypeId}
        />
      )}

      <div className="module-grid">
        <article className="module-card">
          <h3>Kontrolltyper</h3>
          <p>{canManage ? 'Du kan skapa och inaktivera kontroller nedan.' : 'Admin hanterar kontrolltyper.'}</p>
        </article>
        <article className="module-card">
          <h3>Historik</h3>
          <p>Utförda kontroller och avvikelser kopplas till verksamheten.</p>
        </article>
        <article className="module-card">
          <h3>Delning</h3>
          <p>Inspektörslänk och QR-kod byggs i senare issue.</p>
        </article>
      </div>

      {canManage ? (
        <AdminControls organizationId={context.organization.id} userId={user.id} />
      ) : null}
    </section>
  );
}
