import type { User } from '@supabase/supabase-js';
import { FormEvent, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import { createFirstOrganization } from '../services/organizationService';

export type OrganizationSetupProps = {
  user: User;
  onCreated: () => Promise<void>;
};

export function OrganizationSetup({ user, onCreated }: OrganizationSetupProps) {
  const [organizationName, setOrganizationName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      await createFirstOrganization(user, organizationName.trim());
      await onCreated();
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Det gick inte att skapa verksamheten.');
    }
  }

  return (
    <section className="auth-card" aria-labelledby="setup-title">
      <p className="eyebrow">Första start</p>
      <h2 id="setup-title">Skapa din verksamhet</h2>
      <p className="muted-copy">
        Verksamheten blir den isolerade yta där kontroller, historik och användare sparas.
        Du blir ägare för den första verksamheten.
      </p>

      <form className="form-stack" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="organization-name">
          Verksamhetsnamn
        </label>
        <input
          id="organization-name"
          className="text-input"
          value={organizationName}
          onChange={(event) => setOrganizationName(event.target.value)}
          placeholder="Exempel: Café Solgläntan"
          required
        />
        <ActionButton type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Skapar...' : 'Skapa verksamhet'}
        </ActionButton>
      </form>

      {message ? <p className="form-message error-message">{message}</p> : null}
    </section>
  );
}
