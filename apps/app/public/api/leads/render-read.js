import { displayValue, labelFor } from './view-helpers.js';

const fields = ['name', 'business_type', 'address', 'postal_code', 'city', 'priority', 'lead_status', 'first_seen_at'];

export function drawQueue(container, rows) {
  container.replaceChildren();
  if (!rows.length) {
    const empty = document.createElement('p');
    empty.textContent = 'Inga nya verksamheter just nu.';
    container.append(empty);
    return;
  }
  for (const row of rows) {
    const card = document.createElement('article');
    card.className = 'business-card';
    for (const key of fields) {
      const entry = Object.entries(row).find(([field]) => field === key);
      if (!entry || entry[1] === null || entry[1] === '') continue;
      const line = document.createElement(key === 'name' ? 'h2' : 'p');
      if (key === 'name') line.textContent = displayValue(key, entry[1]);
      else line.textContent = `${labelFor(key)}: ${displayValue(key, entry[1])}`;
      card.append(line);
    }
    container.append(card);
  }
}
