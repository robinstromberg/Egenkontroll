import { ADMIN_EMAIL, db, PAGE_SIZE } from './config.js';
import { fetchLatestRun } from './data.js';
import { drawRun } from './run-view.js';
import { loadRows, setLeadStatus } from './source.js';

const authBox = document.querySelector('#auth-state');
const dashboard = document.querySelector('#dashboard');
const message = document.querySelector('#message');
const list = document.querySelector('#business-list');
const resultCount = document.querySelector('#result-count');
const resultRange = document.querySelector('#result-range');
const pagination = document.querySelector('#pagination');
const previousPage = document.querySelector('#previous-page');
const nextPage = document.querySelector('#next-page');
const pageLabel = document.querySelector('#page-label');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const sortSelect = document.querySelector('#sort-select');

const statusLabels = {
  baseline: 'Ej kontaktad',
  new: 'Ny',
  contacted: 'Mailat',
  customer: 'Kund',
  ignored: 'Ignorerad',
};

const state = {
  rows: [],
  filter: 'uncontacted',
  search: '',
  sort: 'newest',
  page: 0,
  busyLeadId: null,
};

authBox.hidden = true;
dashboard.hidden = true;

function showGate(title, text, withLogin = false) {
  authBox.replaceChildren();
  const heading = document.createElement('h2');
  heading.textContent = title;
  const copy = document.createElement('p');
  copy.textContent = text;
  authBox.append(heading, copy);
  if (withLogin) {
    const link = document.createElement('a');
    link.href = '/login';
    link.textContent = 'Logga in';
    authBox.append(link);
  }
  authBox.hidden = false;
}

function showMessage(text = '', kind = 'info') {
  message.textContent = text;
  message.dataset.kind = kind;
  message.hidden = !text;
}

function normalize(value) {
  return String(value ?? '').toLocaleLowerCase('sv-SE').trim();
}

function formatDate(value) {
  if (!value) return 'Okänt';
  return new Intl.DateTimeFormat('sv-SE', { dateStyle: 'medium' }).format(new Date(value));
}

function websiteUrl(value) {
  if (!value) return '';
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function matchesFilter(row) {
  if (state.filter === 'new') return row.lead_status === 'new';
  if (state.filter === 'uncontacted') return row.lead_status === 'new' || row.lead_status === 'baseline';
  if (state.filter === 'contacted') return row.lead_status === 'contacted';
  if (state.filter === 'email') return Boolean(normalize(row.contact_email));
  return true;
}

function matchesSearch(row) {
  if (!state.search) return true;
  const haystack = [
    row.name,
    row.business_type,
    row.address,
    row.postal_code,
    row.city,
    row.contact_email,
    row.contact_phone,
    row.website,
  ].map(normalize).join(' ');
  return haystack.includes(state.search);
}

function compareRows(a, b) {
  if (state.sort === 'email') {
    const emailDifference = Number(Boolean(b.contact_email)) - Number(Boolean(a.contact_email));
    if (emailDifference !== 0) return emailDifference;
  }

  if (state.sort === 'name') return normalize(a.name).localeCompare(normalize(b.name), 'sv-SE');
  if (state.sort === 'type') {
    return normalize(a.business_type).localeCompare(normalize(b.business_type), 'sv-SE')
      || normalize(a.name).localeCompare(normalize(b.name), 'sv-SE');
  }
  if (state.sort === 'city') {
    return normalize(a.city).localeCompare(normalize(b.city), 'sv-SE')
      || normalize(a.name).localeCompare(normalize(b.name), 'sv-SE');
  }

  const dateDifference = new Date(b.first_seen_at).getTime() - new Date(a.first_seen_at).getTime();
  return dateDifference || normalize(a.name).localeCompare(normalize(b.name), 'sv-SE');
}

function currentRows() {
  return state.rows
    .filter(matchesFilter)
    .filter(matchesSearch)
    .sort(compareRows);
}

function makeContactLink(label, value, href) {
  const line = document.createElement('p');
  line.className = 'contact-line';
  const strong = document.createElement('strong');
  strong.textContent = `${label}: `;
  const link = document.createElement('a');
  link.href = href;
  link.textContent = value;
  if (href.startsWith('http')) {
    link.target = '_blank';
    link.rel = 'noreferrer';
  }
  line.append(strong, link);
  return line;
}

function makeStatusButton(row, status, label, className = '') {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.className = className;
  button.disabled = state.busyLeadId === row.id || row.lead_status === status;
  button.addEventListener('click', () => void changeStatus(row.id, status));
  return button;
}

function makeCard(row) {
  const card = document.createElement('article');
  card.className = 'business-card';

  const top = document.createElement('div');
  top.className = 'business-card-top';

  const titleBox = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = row.name || 'Namnlös verksamhet';
  const type = document.createElement('p');
  type.className = 'business-type';
  type.textContent = row.business_type || 'Okänd verksamhetstyp';
  titleBox.append(title, type);

  const badge = document.createElement('span');
  badge.className = `status-badge status-${row.lead_status}`;
  badge.textContent = statusLabels[row.lead_status] || row.lead_status;
  top.append(titleBox, badge);

  const address = document.createElement('p');
  address.className = 'business-address';
  address.textContent = [row.address, row.postal_code, row.city].filter(Boolean).join(', ') || 'Adress saknas';

  const contactBox = document.createElement('div');
  contactBox.className = 'contact-box';
  if (row.contact_email) contactBox.append(makeContactLink('E-post', row.contact_email, `mailto:${row.contact_email}`));
  if (row.contact_phone) contactBox.append(makeContactLink('Telefon', row.contact_phone, `tel:${row.contact_phone}`));
  if (row.website) contactBox.append(makeContactLink('Webb', row.website, websiteUrl(row.website)));
  if (!contactBox.childElementCount) {
    const noContact = document.createElement('p');
    noContact.className = 'no-contact';
    noContact.textContent = 'Kontaktuppgifter saknas ännu';
    contactBox.append(noContact);
  }

  const meta = document.createElement('div');
  meta.className = 'business-meta';
  const priority = document.createElement('span');
  priority.textContent = row.priority === 'high' ? 'Hög prioritet' : 'Sekundär';
  const seen = document.createElement('span');
  seen.textContent = `Upptäckt ${formatDate(row.first_seen_at)}`;
  meta.append(priority, seen);

  const actions = document.createElement('div');
  actions.className = 'business-actions';
  actions.append(
    makeStatusButton(row, 'contacted', 'Mailat', 'action-mailed'),
    makeStatusButton(row, 'customer', 'Kund', 'action-customer'),
    makeStatusButton(row, 'ignored', 'Ignorera', 'action-ignore'),
  );
  if (row.lead_status === 'contacted' || row.lead_status === 'customer' || row.lead_status === 'ignored') {
    actions.append(makeStatusButton(row, 'baseline', 'Återställ', 'action-reset'));
  }

  card.append(top, address, contactBox, meta, actions);
  return card;
}

function render() {
  const rows = currentRows();
  const total = rows.length;
  const maxPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);
  if (state.page > maxPage) state.page = maxPage;

  const start = state.page * PAGE_SIZE;
  const pageRows = rows.slice(start, start + PAGE_SIZE);
  const first = total ? start + 1 : 0;
  const last = Math.min(start + PAGE_SIZE, total);

  resultCount.textContent = `${total.toLocaleString('sv-SE')} träffar`;
  resultRange.textContent = total ? `Visar ${first}–${last}` : '';

  list.replaceChildren();
  if (!pageRows.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = '<h2>Inga träffar</h2><p>Byt filter eller sökning.</p>';
    list.append(empty);
  } else {
    for (const row of pageRows) list.append(makeCard(row));
  }

  pagination.hidden = total <= PAGE_SIZE;
  previousPage.disabled = state.page === 0;
  nextPage.disabled = state.page >= maxPage;
  pageLabel.textContent = `Sida ${state.page + 1} av ${maxPage + 1}`;
}

async function changeStatus(leadId, status) {
  try {
    state.busyLeadId = leadId;
    showMessage('Sparar status…');
    render();
    const updated = await setLeadStatus(leadId, status);
    const row = state.rows.find((item) => item.id === leadId);
    if (row) row.lead_status = updated.lead_status;
    showMessage(status === 'contacted' ? 'Markerad som mailad.' : 'Status sparad.', 'success');
  } catch (error) {
    showMessage(error instanceof Error ? error.message : 'Kunde inte spara status.', 'error');
  } finally {
    state.busyLeadId = null;
    render();
  }
}

function bindControls() {
  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      state.filter = button.dataset.filter;
      state.page = 0;
      render();
    });
  });

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    state.search = normalize(searchInput.value);
    state.page = 0;
    render();
  });

  searchInput.addEventListener('input', () => {
    if (!searchInput.value.trim()) {
      state.search = '';
      state.page = 0;
      render();
    }
  });

  sortSelect.addEventListener('change', () => {
    state.sort = sortSelect.value;
    state.page = 0;
    render();
  });

  previousPage.addEventListener('click', () => {
    state.page = Math.max(0, state.page - 1);
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  nextPage.addEventListener('click', () => {
    state.page += 1;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

async function start() {
  const sessionResponse = await db.auth.getSession();
  const session = sessionResponse.data.session;
  if (!session) {
    showGate('Du är inte inloggad', 'Logga in i Min Egenkontroll först och öppna sedan den här sidan igen.', true);
    return;
  }
  if ((session.user.email || '').toLowerCase() !== ADMIN_EMAIL) {
    showGate('Ingen åtkomst', 'Den här sidan är privat och kopplad till Robins adminkonto.');
    return;
  }

  dashboard.hidden = false;
  bindControls();

  try {
    drawRun(document.querySelector('#sync-summary'), await fetchLatestRun());
    showMessage('Laddar leads…');
    state.rows = await loadRows();
    showMessage();
    render();
  } catch (error) {
    showMessage(error instanceof Error ? error.message : 'Kunde inte läsa listan.', 'error');
  }
}

void start();
