const labels = {
  business_type: 'Typ',
  address: 'Adress',
  postal_code: 'Postnummer',
  city: 'Ort',
  priority: 'Prioritet',
  lead_status: 'Status',
  first_seen_at: 'Upptäckt',
};

const states = {
  baseline: 'Ej kontaktad',
  new: 'Ny',
  contacted: 'Mailat',
  customer: 'Kund',
  ignored: 'Ignorerad',
};

export function valueFor(row, wanted) {
  return Object.entries(row).find(([key]) => key === wanted)?.[1];
}

export function labelFor(key) {
  return labels[key] || key;
}

export function displayValue(key, value) {
  if (key === 'lead_status') return states[value] || value;
  if (key === 'priority') return value === 'high' ? 'Hög' : 'Sekundär';
  if (key === 'first_seen_at') return new Intl.DateTimeFormat('sv-SE', { dateStyle: 'medium' }).format(new Date(value));
  return String(value ?? '-');
}
