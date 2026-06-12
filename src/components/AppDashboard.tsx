import type { User } from '@supabase/supabase-js';
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
        <button className="secondary-button" type="button" onClick={onSignOut}>
          Logga ut
        </button>
      </div>

      <div className="role-panel">
        <h3>Roll och åtkomst</h3>
        <p>
          {canManage
            ? 'Du kan hantera verksamhetens struktur, användare och kommande delningslänkar.'
            : 'Du kan utföra kontroller och se relevant historik för verksamheten.'}
        </p>
      </div>

      <div className="module-grid">
        <article className="module-card">
          <h3>Idag</h3>
          <p>Dagens kontrollista byggs i kommande issue.</p>
        </article>
        <article className="module-card">
          <h3>Kontrolltyper</h3>
          <p>{canManage ? 'Adminflöde kommer att aktiveras här.' : 'Admin hanterar kontrolltyper.'}</p>
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
    </section>
  );
}
