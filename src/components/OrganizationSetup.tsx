import type { User } from '@supabase/supabase-js';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import { createFirstOrganization } from '../services/organizationService';
import { listActiveControlTemplates } from '../services/templateService';
import type { ControlTemplate } from '../types/database';

export type OrganizationSetupProps = {
  user: User;
  onCreated: () => Promise<void>;
};

export function OrganizationSetup({ user, onCreated }: OrganizationSetupProps) {
  const [organizationName, setOrganizationName] = useState('');
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
      await createFirstOrganization(user, organizationName.trim(), selectedTemplateIds);
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
        Välj de startmallar som ska kopieras in i verksamheten. Allt går att ändra senare.
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
            <p className="muted-copy">Inga mallar hittades. Du kan ändå skapa verksamheten.</p>
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
