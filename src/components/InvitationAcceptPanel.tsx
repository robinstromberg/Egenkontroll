import { FormEvent, useEffect, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import {
  acceptOrganizationInvitation,
  getOrganizationInvitation,
  updateProfile,
} from '../services/organizationService';
import type { OrganizationInvitationSummary } from '../services/organizationService';
import './MenuDestinationView.css';

type InvitationAcceptPanelProps = {
  invitationId: string;
  userId: string;
  userEmail: string | null | undefined;
  initialFullName?: string;
  onAccepted: (organizationId: string) => Promise<void>;
  onSkip: () => void;
};

const roleLabels = {
  admin: 'Admin',
  staff: 'Personal',
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('sv-SE', { dateStyle: 'medium' }).format(new Date(value));
}

export function InvitationAcceptPanel({
  invitationId,
  userId,
  userEmail,
  initialFullName = '',
  onAccepted,
  onSkip,
}: InvitationAcceptPanelProps) {
  const [invitation, setInvitation] = useState<OrganizationInvitationSummary | null>(null);
  const [fullName, setFullName] = useState(initialFullName);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadInvitation() {
      try {
        setLoading(true);
        setMessage('');
        const nextInvitation = await getOrganizationInvitation(invitationId);
        if (active) setInvitation(nextInvitation);
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : 'Kunde inte läsa inbjudan.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadInvitation();

    return () => {
      active = false;
    };
  }, [invitationId]);

  async function handleAccept(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setAccepting(true);
      setMessage('');
      await updateProfile({
        userId,
        fullName,
        email: userEmail ?? null,
      });
      const organizationId = await acceptOrganizationInvitation(invitationId);
      await onAccepted(organizationId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte acceptera inbjudan.');
    } finally {
      setAccepting(false);
    }
  }

  return (
    <section className="auth-card" aria-labelledby="invitation-title">
      <p className="eyebrow">Inbjudan</p>
      <h2 id="invitation-title">Acceptera verksamhetsinbjudan</h2>
      {loading ? <p className="muted-copy">Laddar inbjudan...</p> : null}
      {!loading && !invitation ? (
        <p className="muted-copy">
          Inbjudan kunde inte visas. Kontrollera att du är inloggad med samma e-postadress som inbjudan skickades till.
        </p>
      ) : null}
      {invitation ? (
        <>
          <div className="menu-destination-panel">
            <h4>{invitation.email}</h4>
            <p className="muted-copy">
              Du är inloggad som {userEmail ?? 'okänd e-post'}. Inbjudan ger rollen {roleLabels[invitation.role]} och gäller till {formatDate(invitation.expires_at)}.
            </p>
          </div>
          <form className="form-stack" onSubmit={handleAccept}>
            <label className="field-label" htmlFor="invitation-name">
              Ditt namn
            </label>
            <input
              id="invitation-name"
              className="text-input"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Exempel: Robin Strömberg"
              autoComplete="name"
              required
            />
            <div className="form-actions">
              <ActionButton type="submit" disabled={accepting || invitation.status !== 'pending'}>
                {accepting ? 'Accepterar...' : 'Acceptera inbjudan'}
              </ActionButton>
              <ActionButton type="button" variant="secondary" onClick={onSkip} disabled={accepting}>
                Inte nu
              </ActionButton>
            </div>
          </form>
        </>
      ) : null}
      {message ? <p className="form-message error-message">{message}</p> : null}
    </section>
  );
}
