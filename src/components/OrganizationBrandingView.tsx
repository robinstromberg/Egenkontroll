import { FormEvent, useState } from 'react';
import { brandAssets } from '@min-egenkontroll/brand';
import { ActionButton } from './ui/ActionButton';
import { BackButton } from './ui/BackButton';
import type { Organization } from '../types/database';
import { updateOrganizationBranding } from '../services/organizationService';
import './OrganizationBrandingView.css';

export type OrganizationBrandingViewProps = {
  organization: Organization;
  onBack: () => void;
  onSaved: (organization: Organization) => void;
};

export function OrganizationBrandingView({
  organization,
  onBack,
  onSaved,
}: OrganizationBrandingViewProps) {
  const [name, setName] = useState(organization.name);
  const [orgNumber, setOrgNumber] = useState(organization.org_number ?? '');
  const [status, setStatus] = useState<'idle' | 'saving' | 'error' | 'saved'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('saving');
    setMessage('');

    try {
      const savedOrganization = await updateOrganizationBranding({
        organizationId: organization.id,
        name,
        orgNumber,
      });
      onSaved(savedOrganization);
      setStatus('saved');
      setMessage('Verksamheten sparades.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Kunde inte spara verksamheten.');
    }
  }

  return (
    <section className="organization-branding-view" aria-labelledby="organization-branding-title">
      <div className="view-topbar">
        <BackButton onClick={onBack} />
        <div>
          <p className="eyebrow">Verksamheten</p>
          <h3 id="organization-branding-title">Rapportprofil</h3>
        </div>
      </div>

      <div className="branding-preview">
        <span aria-hidden="true">
          <img src={brandAssets.icon} alt="" />
        </span>
        <div>
          <strong>{name || 'Verksamhet'}</strong>
          <small>Egenkontrolls gemensamma logotyp används i rapporter.</small>
        </div>
      </div>

      <form className="form-stack" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="organization-name-edit">
          Namn
        </label>
        <input
          id="organization-name-edit"
          className="text-input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />

        <label className="field-label" htmlFor="organization-number-edit">
          Organisationsnummer
        </label>
        <input
          id="organization-number-edit"
          className="text-input"
          value={orgNumber}
          onChange={(event) => setOrgNumber(event.target.value)}
          placeholder="Valfritt"
        />

        <ActionButton type="submit" disabled={status === 'saving'}>
          {status === 'saving' ? 'Sparar...' : 'Spara verksamhet'}
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
