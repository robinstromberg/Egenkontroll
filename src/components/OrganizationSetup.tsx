import type { User } from '@supabase/supabase-js';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import type { BillingPlan } from '../config/subscription';
import { billingPlans } from '../config/subscription';
import { createFirstOrganization } from '../services/organizationService';
import type { BusinessType } from '../services/organizationService';
import { listActiveControlTemplates } from '../services/templateService';
import type { ControlTemplate } from '../types/database';
import './OrganizationSetup.css';

export type OrganizationSetupProps = {
  user: User;
  onCreated: () => Promise<void>;
};

export const FIRST_RUN_ORGANIZATION_KEY = 'egenkontroll:first-run-organization-id';

const businessTypes: { id: BusinessType; label: string; description: string }[] = [
  { id: 'restaurant', label: 'Restaurang', description: 'Dagliga rutiner för kök, servering och temperaturer.' },
  { id: 'cafe', label: 'Café', description: 'Enkel start för beredning, servering och kylda varor.' },
  { id: 'bakery', label: 'Bageri/konditori', description: 'Passar produktion, städning och spårbarhet.' },
  { id: 'kiosk', label: 'Kiosk', description: 'Fokus på datummärkning, varor och kylar.' },
  { id: 'foodtruck', label: 'Foodtruck', description: 'Mobil verksamhet med tydliga dagliga kontroller.' },
  { id: 'catering', label: 'Catering', description: 'Bra för produktion, transport och leveransrutiner.' },
  { id: 'chilled_store', label: 'Butik med kylda varor', description: 'Startar med kylar, mottagning och märkning.' },
];

export function OrganizationSetup({ user, onCreated }: OrganizationSetupProps) {
  const [organizationName, setOrganizationName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('restaurant');
  const [billingPlan, setBillingPlan] = useState<BillingPlan>('monthly');
  const [templates, setTemplates] = useState<ControlTemplate[]>([]);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadTemplates() {
      try {
        const activeTemplates = await listActiveControlTemplates();
        if (!active) return;
        setTemplates(activeTemplates);
        setSelectedTemplateIds(activeTemplates.map((template) => template.id));
      } catch (error) {
        if (!active) return;
        setMessage(error instanceof Error ? error.message : 'Kunde inte läsa startmallarna.');
      } finally {
        if (active) setLoadingTemplates(false);
      }
    }

    void loadTemplates();

    return () => {
      active = false;
    };
  }, []);

  const allSelected = useMemo(
    () => templates.length > 0 && selectedTemplateIds.length === templates.length,
    [selectedTemplateIds.length, templates.length],
  );

  function toggleTemplate(templateId: string) {
    setSelectedTemplateIds((current) =>
      current.includes(templateId)
        ? current.filter((id) => id !== templateId)
        : [...current, templateId],
    );
  }

  function toggleAllTemplates() {
    setSelectedTemplateIds(allSelected ? [] : templates.map((template) => template.id));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const organizationId = await createFirstOrganization(user, organizationName.trim(), selectedTemplateIds, {
        industry: 'food',
        businessType,
      }, {
        billingPlan,
      });
      window.localStorage.setItem(FIRST_RUN_ORGANIZATION_KEY, organizationId);
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
        Välj verksamhetstyp och startmallar. Vi skapar en användbar första yta direkt, och allt går att ändra senare.
      </p>

      <ol className="setup-steps" aria-label="Onboardingsteg">
        <li className="active">Konto</li>
        <li className="active">Verksamhet</li>
        <li>Startmallar</li>
      </ol>

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

        <div className="industry-panel" aria-label="Bransch">
          <span className="industry-icon" aria-hidden="true">LV</span>
          <span>
            <strong>Bransch: Livsmedel</strong>
            <small>Fler branscher kan läggas till senare utan att ändra onboardingflödet.</small>
          </span>
        </div>

        <fieldset className="business-type-picker">
          <legend>Verksamhetstyp</legend>
          <div className="business-type-list">
            {businessTypes.map((type) => {
              const selected = businessType === type.id;
              return (
                <button
                  aria-pressed={selected}
                  className={selected ? 'business-type-card selected' : 'business-type-card'}
                  key={type.id}
                  onClick={() => setBusinessType(type.id)}
                  type="button"
                >
                  <strong>{type.label}</strong>
                  <span>{type.description}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="billing-plan-picker">
          <legend>Förhandslansering och betalning</legend>
          <div className="trial-summary">
            <strong>Kostnadsfritt under förhandslanseringen</strong>
            <span>Ingen betalmetod krävs nu. Betalning kan kopplas på senare, med tydlig information i god tid.</span>
          </div>
          <div className="billing-plan-list">
            {(Object.entries(billingPlans) as [BillingPlan, typeof billingPlans[BillingPlan]][]).map(([planId, plan]) => {
              const selected = billingPlan === planId;
              return (
                <button
                  aria-pressed={selected}
                  className={selected ? 'billing-plan-card selected' : 'billing-plan-card'}
                  key={planId}
                  onClick={() => setBillingPlan(planId)}
                  type="button"
                >
                  <span>
                    <strong>{plan.label}</strong>
                    <small>{plan.description}</small>
                  </span>
                  <b>{plan.priceLabel}</b>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="template-picker" aria-label="Startmallar">
          <div className="template-picker-header">
            <div>
              <p className="eyebrow">Startmallar</p>
              <h3>Föreslagna kontroller</h3>
            </div>
            <button className="template-toggle" type="button" onClick={toggleAllTemplates}>
              {allSelected ? 'Avmarkera alla' : 'Välj alla'}
            </button>
          </div>

          {loadingTemplates ? <p className="muted-copy">Laddar mallar...</p> : null}

          {!loadingTemplates && templates.length === 0 ? (
            <p className="muted-copy">
              Inga startmallar hittades. Du kan skapa verksamheten ändå och lägga till kontrolltyper från Meny senare.
            </p>
          ) : null}

          {!loadingTemplates && templates.length > 0 && selectedTemplateIds.length === 0 ? (
            <p className="muted-copy">
              Du har inte valt några startmallar. Verksamheten skapas ändå, men Idag är tomt tills du aktiverar kontroller.
            </p>
          ) : null}

          <div className="template-list">
            {templates.map((template) => {
              const selected = selectedTemplateIds.includes(template.id);
              return (
                <label className={selected ? 'template-card selected' : 'template-card'} key={template.id}>
                  <input
                    checked={selected}
                    onChange={() => toggleTemplate(template.id)}
                    type="checkbox"
                  />
                  <span>
                    <strong>{template.name}</strong>
                    <small>{template.description}</small>
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <ActionButton type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Skapar...' : 'Skapa verksamhet och mallar'}
        </ActionButton>
      </form>

      {message ? <p className="form-message error-message">{message}</p> : null}
    </section>
  );
}
