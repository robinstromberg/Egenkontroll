import type { User } from '@supabase/supabase-js';
import { FormEvent, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import { updateProfile } from '../services/organizationService';
import './MenuDestinationView.css';

export type ProfileViewProps = {
  user: User;
  onBack: () => void;
};

function readInitialName(user: User): string {
  const metadataName = user.user_metadata?.full_name || user.user_metadata?.name;
  return typeof metadataName === 'string' ? metadataName : '';
}

export function ProfileView({ user, onBack }: ProfileViewProps) {
  const [fullName, setFullName] = useState(readInitialName(user));
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('saving');
    setMessage('');

    try {
      await updateProfile({
        userId: user.id,
        fullName,
        email: user.email ?? null,
      });
      setStatus('saved');
      setMessage('Profilen sparades.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Kunde inte spara profilen.');
    }
  }

  return (
    <section className="menu-destination-view" aria-labelledby="profile-title">
      <div className="view-topbar">
        <button className="nav-back-button" type="button" onClick={onBack}>
          Tillbaka
        </button>
        <div>
          <p className="eyebrow">Min profil</p>
          <h3 id="profile-title">Personliga uppgifter</h3>
        </div>
      </div>

      <form className="menu-destination-panel form-stack" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="profile-name">
          Namn
        </label>
        <input
          id="profile-name"
          className="text-input"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Ditt namn"
        />

        <label className="field-label" htmlFor="profile-email">
          E-post
        </label>
        <input
          id="profile-email"
          className="text-input"
          value={user.email ?? ''}
          readOnly
        />

        <ActionButton type="submit" disabled={status === 'saving'}>
          {status === 'saving' ? 'Sparar...' : 'Spara profil'}
        </ActionButton>
      </form>

      {message ? (
        <p className={status === 'error' ? 'form-message error-message' : 'form-message success-message'}>
          {message}
        </p>
      ) : null}
    </section>
  );
}
