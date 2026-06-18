import { FormEvent, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { ActionButton } from './ui/ActionButton';
import { BackButton } from './ui/BackButton';
import type { Organization } from '../types/database';
import { updateOrganizationBranding, uploadOrganizationLogo } from '../services/organizationService';
import './OrganizationBrandingView.css';

export type OrganizationBrandingViewProps = {
  organization: Organization;
  onBack: () => void;
  onSaved: (organization: Organization) => void;
};

const defaultBrandColor = '#5b46e1';
type BrandPreviewStyle = CSSProperties & { '--brand-color': string };

export function OrganizationBrandingView({
  organization,
  onBack,
  onSaved,
}: OrganizationBrandingViewProps) {
  const [name, setName] = useState(organization.name);
  const [orgNumber, setOrgNumber] = useState(organization.org_number ?? '');
  const [logoUrl, setLogoUrl] = useState(organization.logo_url ?? '');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState('');
  const [brandColor, setBrandColor] = useState(organization.brand_color ?? defaultBrandColor);
  const [status, setStatus] = useState<'idle' | 'saving' | 'error' | 'saved'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!logoFile) {
      setLogoPreviewUrl('');
      return undefined;
    }

    const nextUrl = URL.createObjectURL(logoFile);
    setLogoPreviewUrl(nextUrl);

    return () => URL.revokeObjectURL(nextUrl);
  }, [logoFile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('saving');
    setMessage('');

    try {
      const logo = logoFile
        ? await uploadOrganizationLogo(organization.id, logoFile)
        : undefined;
      const savedOrganization = await updateOrganizationBranding({
        organizationId: organization.id,
        name,
        orgNumber,
        logoUrl,
        brandColor,
        logo,
      });
      onSaved(savedOrganization);
      setLogoFile(null);
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

      <div className="branding-preview" style={{ '--brand-color': brandColor } as BrandPreviewStyle}>
        {logoPreviewUrl || logoUrl ? (
          <img alt="" src={logoPreviewUrl || logoUrl} />
        ) : (
          <span>{name.trim().slice(0, 2).toUpperCase() || 'EK'}</span>
        )}
        <div>
          <strong>{name || 'Verksamhet'}</strong>
          <small>Visas i inspektorsrapporter och utskrifter</small>
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

        <label className="field-label" htmlFor="organization-logo-file">
          Logotypfil
        </label>
        <input
          id="organization-logo-file"
          className="text-input"
          type="file"
          accept="image/*"
          onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)}
        />
        <p className="muted-copy">
          Logotypen sparas privat och konverteras till JPEG fÃ¶r servergenererad PDF.
        </p>

        <label className="field-label" htmlFor="organization-logo-url">
          Extern logotyp-URL
        </label>
        <input
          id="organization-logo-url"
          className="text-input"
          value={logoUrl}
          onChange={(event) => setLogoUrl(event.target.value)}
          placeholder="https://exempel.se/logotyp.png"
          type="url"
        />

        <label className="field-label" htmlFor="organization-brand-color">
          Profilfarg
        </label>
        <div className="brand-color-field">
          <input
            id="organization-brand-color"
            aria-label="Profilfarg"
            type="color"
            value={brandColor}
            onChange={(event) => setBrandColor(event.target.value)}
          />
          <input
            className="text-input"
            value={brandColor}
            onChange={(event) => setBrandColor(event.target.value)}
            pattern="^#[0-9A-Fa-f]{6}$"
            required
          />
        </div>

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
