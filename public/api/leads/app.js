import { ADMIN_EMAIL, db } from './config.js';
import { fetchLatestRun } from './data.js';
import { loadQueue } from './load-queue.js';
import { drawRun } from './run-view.js';

const authBox = document.querySelector('#auth-state');
const dashboard = document.querySelector('#dashboard');
const message = document.querySelector('#message');

authBox.hidden = true;
dashboard.hidden = true;
document.querySelector('.filter-bar').hidden = true;
document.querySelector('.search-form').hidden = true;
document.querySelector('#pagination').hidden = true;

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
  try {
    drawRun(document.querySelector('#sync-summary'), await fetchLatestRun());
    await loadQueue();
  } catch (error) {
    message.textContent = error instanceof Error ? error.message : 'Kunde inte läsa listan.';
    message.hidden = false;
  }
}

void start();
