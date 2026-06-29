import { FormEvent, useEffect, useState } from 'react';
import { BackButton } from './ui/BackButton';
import { ActionButton } from './ui/ActionButton';
import {
  createOrganizationInvitation,
  listOrganizationInvitations,
  listOrganizationMembers,
  renewOrganizationInvitation,
  revokeOrganizationInvitation,
} from '../services/organizationService';
import type { OrganizationInvitationSummary, OrganizationMemberSummary } from '../services/organizationService';
import type { OrganizationRole } from '../types/database';
import './MenuDestinationView.css';

export type UsersViewProps = {
  organizationId: string;
  userId: string;
  canManage: boolean;
  onBack: () => void;
};

const roleLabels = {
  owner: 'Ägare',
  admin: 'Admin',
  staff: 'Personal',
};

const invitationStatusLabels = {
  pending: 'Väntar',
  accepted: 'Accepterad',
  revoked: 'Återkallad',
  expired: 'Utgången',
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('sv-SE', { dateStyle: 'medium' }).format(new Date(value));
}

export function UsersView({ organizationId, userId, canManage, onBack }: UsersViewProps) {
  const [members, setMembers] = useState<OrganizationMemberSummary[]>([]);
  const [invitations, setInvitations] = useState<OrganizationInvitationSummary[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Exclude<OrganizationRole, 'owner'>>('staff');
  const [loading, setLoading] = useState(true);
  const [savingInvitation, setSavingInvitation] = useState(false);
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadUsersView() {
      try {
        setLoading(true);
        setMessage('');
        setSuccessMessage('');
        const [nextMembers, nextInvitations] = await Promise.all([
          listOrganizationMembers(organizationId),
          canManage ? listOrganizationInvitations(organizationId) : Promise.resolve([]),
        ]);
        if (active) {
          setMembers(nextMembers);
          setInvitations(nextInvitations);
        }
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : 'Kunde inte läsa användare.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadUsersView();

    return () => {
      active = false;
    };
  }, [canManage, organizationId]);

  async function refreshInvitations() {
    if (!canManage) return;
    const nextInvitations = await listOrganizationInvitations(organizationId);
    setInvitations(nextInvitations);
  }

  async function handleCreateInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      setSavingInvitation(true);
      setMessage('');
      setSuccessMessage('');
      await createOrganizationInvitation({
        organizationId,
        email: inviteEmail,
        role: inviteRole,
        invitedBy: userId,
      });
      setInviteEmail('');
      setInviteRole('staff');
      await refreshInvitations();
      setSuccessMessage('Inbjudan skapades.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte skapa inbjudan.');
    } finally {
      setSavingInvitation(false);
    }
  }

  async function handleRevokeInvitation(invitationId: string) {
    try {
      setMessage('');
      setSuccessMessage('');
      await revokeOrganizationInvitation(invitationId);
      await refreshInvitations();
      setSuccessMessage('Inbjudan återkallades.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte återkalla inbjudan.');
    }
  }

  async function handleRenewInvitation(invitationId: string) {
    try {
      setMessage('');
      setSuccessMessage('');
      await renewOrganizationInvitation(invitationId);
      await refreshInvitations();
      setSuccessMessage('Inbjudan förlängdes med 7 dagar.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte förlänga inbjudan.');
    }
  }

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
      {successMessage ? <p className="form-message success-message">{successMessage}</p> : null}

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
            ? 'Här ser du verksamhetens medlemmar och kan bjuda in fler användare till rätt roll.'
            : 'Administratören hanterar roller och nya användare.'}
        </p>
      </div>
      {canManage ? (
        <>
          <form className="menu-destination-panel invitation-form" onSubmit={handleCreateInvitation}>
            <h4>Bjud in användare</h4>
            <p className="muted-copy">
              Skapa inbjudan med rätt roll. Acceptanslänken byggs i nästa steg och kopplar personen till verksamheten efter inloggning.
            </p>
            <label>
              <span>E-postadress</span>
              <input
                className="text-input"
                type="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="namn@example.se"
                required
              />
            </label>
            <label>
              <span>Roll</span>
              <select
                className="text-input"
                value={inviteRole}
                onChange={(event) => setInviteRole(event.target.value as Exclude<OrganizationRole, 'owner'>)}
              >
                <option value="staff">Personal - kan utföra kontroller</option>
                <option value="admin">Admin - kan hantera struktur och inbjudningar</option>
              </select>
            </label>
            <ActionButton type="submit" disabled={savingInvitation || !inviteEmail.trim()}>
              {savingInvitation ? 'Skapar...' : 'Skapa inbjudan'}
            </ActionButton>
          </form>

          <div className="menu-destination-panel">
            <h4>Inbjudningar</h4>
            {invitations.length === 0 ? (
              <p className="muted-copy">Inga inbjudningar finns ännu.</p>
            ) : (
              <div className="menu-record-list">
                {invitations.map((invitation) => (
                  <article className="menu-record-row invitation-row" key={invitation.id}>
                    <span className="menu-record-mark" aria-hidden="true">
                      {invitation.email.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="menu-record-copy">
                      <strong>{invitation.email}</strong>
                      <span>
                        {roleLabels[invitation.role]} - {invitationStatusLabels[invitation.status]} - gäller till {formatDate(invitation.expires_at)}
                      </span>
                    </span>
                    {invitation.status === 'pending' ? (
                      <span className="invitation-actions">
                        <button type="button" onClick={() => handleRenewInvitation(invitation.id)}>
                          Förläng
                        </button>
                        <button type="button" onClick={() => handleRevokeInvitation(invitation.id)}>
                          Återkalla
                        </button>
                      </span>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
