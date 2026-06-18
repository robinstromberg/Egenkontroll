import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import {
  createSupplier,
  deactivateSupplier,
  listSuppliers,
  updateSupplier,
} from '../services/supplierService';
import type { Supplier } from '../types/database';
import './SuppliersView.css';

export type SuppliersViewProps = {
  organizationId: string;
  userId: string;
  onBack: () => void;
};

export function SuppliersView({ organizationId, userId, onBack }: SuppliersViewProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [query, setQuery] = useState('');
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadSuppliers() {
      setLoading(true);
      setMessage('');

      try {
        const nextSuppliers = await listSuppliers(organizationId, true);
        if (active) setSuppliers(nextSuppliers);
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : 'Kunde inte läsa leverantörer.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadSuppliers();

    return () => {
      active = false;
    };
  }, [organizationId]);

  const filteredSuppliers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return suppliers;

    return suppliers.filter((supplier) => supplier.name.toLowerCase().includes(normalizedQuery));
  }, [query, suppliers]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newName.trim()) return;

    try {
      setSaving(true);
      setMessage('');
      const supplier = await createSupplier(organizationId, newName, userId);
      setSuppliers((current) => [supplier, ...current].sort((a, b) => a.name.localeCompare(b.name, 'sv')));
      setNewName('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte skapa leverantör.');
    } finally {
      setSaving(false);
    }
  }

  function startEditing(supplier: Supplier) {
    setEditingId(supplier.id);
    setEditingName(supplier.name);
    setMessage('');
  }

  async function handleSaveEdit(supplier: Supplier) {
    if (!editingName.trim()) return;

    try {
      setSaving(true);
      setMessage('');
      const updatedSupplier = await updateSupplier(supplier.id, organizationId, {
        name: editingName,
        active: supplier.active,
      });
      setSuppliers((current) => current.map((item) => (item.id === supplier.id ? updatedSupplier : item)));
      setEditingId(null);
      setEditingName('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte uppdatera leverantör.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(supplier: Supplier) {
    try {
      setSaving(true);
      setMessage('');
      const updatedSupplier = await updateSupplier(supplier.id, organizationId, {
        name: supplier.name,
        active: !supplier.active,
      });
      setSuppliers((current) => current.map((item) => (item.id === supplier.id ? updatedSupplier : item)));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte ändra leverantör.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(supplier: Supplier) {
    try {
      setSaving(true);
      setMessage('');
      await deactivateSupplier(supplier.id, organizationId);
      setSuppliers((current) => current.map((item) => (
        item.id === supplier.id ? { ...item, active: false } : item
      )));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte inaktivera leverantör.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="suppliers-view" aria-labelledby="suppliers-title">
      <div className="suppliers-header">
        <div>
          <p className="eyebrow">Meny</p>
          <h3 id="suppliers-title">Leverantörer</h3>
          <p className="muted-copy">Återanvänd leverantörer i varumottagning och spårbarhet.</p>
        </div>
        <ActionButton className="nav-back-button" type="button" variant="secondary" onClick={onBack}>
          <span aria-hidden="true">←</span>
          Tillbaka
        </ActionButton>
      </div>

      {message ? <p className="form-message error-message">{message}</p> : null}

      <form className="supplier-create-form" onSubmit={handleCreate}>
        <label htmlFor="new-supplier">Ny leverantör</label>
        <div className="supplier-create-row">
          <input
            className="text-input"
            id="new-supplier"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Leverantörsnamn"
          />
          <ActionButton type="submit" disabled={saving || !newName.trim()}>
            Lägg till
          </ActionButton>
        </div>
      </form>

      <div className="supplier-search">
        <label htmlFor="supplier-search">Sök</label>
        <input
          className="text-input"
          id="supplier-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Sök leverantör"
        />
      </div>

      {loading ? <p className="muted-copy">Laddar leverantörer...</p> : null}

      {!loading && filteredSuppliers.length === 0 ? (
        <section className="empty-view-card">
          <p className="eyebrow">Tomt</p>
          <h3>Inga leverantörer hittades</h3>
          <p className="muted-copy">Lägg till de leverantörer som används i kontrollerna.</p>
        </section>
      ) : null}

      <div className="supplier-list" aria-label="Leverantörer">
        {filteredSuppliers.map((supplier) => {
          const isEditing = editingId === supplier.id;

          return (
            <article className={supplier.active ? 'supplier-item' : 'supplier-item inactive'} key={supplier.id}>
              <div className="supplier-item-main">
                {isEditing ? (
                  <input
                    className="text-input"
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    aria-label="Leverantörsnamn"
                  />
                ) : (
                  <>
                    <strong>{supplier.name}</strong>
                    <span>{supplier.active ? 'Aktiv' : 'Inaktiv'}</span>
                  </>
                )}
              </div>

              <div className="supplier-actions">
                {isEditing ? (
                  <>
                    <ActionButton
                      type="button"
                      onClick={() => handleSaveEdit(supplier)}
                      disabled={saving || !editingName.trim()}
                    >
                      Spara
                    </ActionButton>
                    <ActionButton
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setEditingId(null);
                        setEditingName('');
                      }}
                    >
                      Avbryt
                    </ActionButton>
                  </>
                ) : (
                  <>
                    <ActionButton type="button" variant="secondary" onClick={() => startEditing(supplier)}>
                      Redigera
                    </ActionButton>
                    <ActionButton type="button" variant="secondary" onClick={() => handleToggleActive(supplier)}>
                      {supplier.active ? 'Inaktivera' : 'Aktivera'}
                    </ActionButton>
                    {supplier.active ? (
                      <ActionButton type="button" variant="secondary" onClick={() => handleDeactivate(supplier)}>
                        Ta bort
                      </ActionButton>
                    ) : null}
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
