import { useEffect, useState } from 'react';
import { BackButton } from './ui/BackButton';
import { listOrganizationMembers } from '../services/organizationService';
import type { OrganizationMemberSummary } from '../services/organizationService';
import './MenuDestinationView.css';

export type UsersViewProps = {
  organizationId: string;
  canManage: boolean;
  onBack: () => void;
};

const roleLabels = {
  owner: 'Ägare',
  admin: 'Admin',
  staff: 'Personal',
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('sv-SE', { dateStyle: 'medium' }).format(new Date(value));
}

export function UsersView({ organizationId, canManage, onBack }: UsersViewProps) {
  const [members, setMembers] = useState<OrganizationMemberSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadMembers() {
      try {
        setLoading(true);
        setMessage('');
        const nextMembers = await listOrganizationMembers(organizationId);
        if (active) setMembers(nextMembers);
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : 'Kunde inte läsa användare.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadMembers();

    return () => {
      active = false;
    };
  }, [organizationId]);

  return (
    <section className="menu-destination-view" aria-labelledby="users-title">
      <div className="view-topbar">
        <BackButton onClick={onBack} />
        <div>
          <p className="eyebrow">Användare</p>
          <h3 id="users-title">Roller och åtkomst</h3>
        </div>
      </div>

      {message ? <p className="form-message error-message">{message}</p> : null}

      {loading ? (
        <p className="muted-copy">Laddar användare...</p>
      ) : (
        <div className="menu-record-list">
          {members.map((member) => (
            <article className="menu-record-row" key={member.id}>
              <span className="menu-record-mark" aria-hidden="true">
                {(member.full_name || member.email || '?').slice(0, 2).toUpperCase()}
              </span>
              <span className="menu-record-copy">
                <strong>{member.full_name || member.email || 'Användare'}</strong>
                <span>
                  {roleLabels[member.role]} - {member.status} - sedan {formatDate(member.created_at)}
                </span>
              </span>
            </article>
          ))}
        </div>
      )}

      <div className="menu-destination-panel">
        <h4>{canManage ? 'Rollhantering' : 'Din atkomst'}</h4>
        <p className="muted-copy">
          {canManage
            ? 'Här ser du verksamhetens medlemmar, roller och status samlat på en egen menysida.'
            : 'Administratören hanterar roller och nya användare.'}
        </p>
      </div>
    </section>
  );
}
