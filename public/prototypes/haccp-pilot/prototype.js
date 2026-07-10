const panels = [...document.querySelectorAll('[data-screen-panel]')];
const screenLinks = [...document.querySelectorAll('[data-screen]')];
const menu = document.querySelector('[data-mobile-menu]');
const menuOpenButton = document.querySelector('[data-menu-open]');
const menuCloseButton = document.querySelector('[data-menu-close]');
const themeButton = document.querySelector('[data-theme-toggle]');
const toast = document.querySelector('[data-toast]');
const exampleButton = document.querySelector('[data-example-toggle]');
const filledExample = document.querySelector('[data-filled-example]');
let lastFocusedElement = null;
let toastTimer = null;

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { toast.hidden = true; }, 3600);
}

function normalizeScreen(value) {
  return ['fact', 'topic', 'resource'].includes(value) ? value : 'fact';
}

function setScreen(screen, updateHash = true) {
  const nextScreen = normalizeScreen(screen);
  panels.forEach((panel) => {
    const active = panel.dataset.screenPanel === nextScreen;
    panel.hidden = !active;
  });
  screenLinks.forEach((link) => {
    const active = link.dataset.screen === nextScreen;
    link.toggleAttribute('aria-current', active);
  });
  if (updateHash) window.history.replaceState(null, '', `#${nextScreen}`);
  document.querySelector('[data-screen-panel]:not([hidden]) h1')?.focus?.();
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeButton.textContent = theme === 'dark' ? 'Ljust' : 'Mörkt';
  themeButton.setAttribute('aria-label', theme === 'dark' ? 'Byt till ljust tema' : 'Byt till mörkt tema');
  window.localStorage.setItem('haccp-pilot-theme', theme);
}

function preferredTheme() {
  const saved = window.localStorage.getItem('haccp-pilot-theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function focusableMenuElements() {
  return [...menu.querySelectorAll('a[href], button:not([disabled])')];
}

function openMenu() {
  lastFocusedElement = document.activeElement;
  menu.showModal();
  menuOpenButton.setAttribute('aria-expanded', 'true');
  window.setTimeout(() => menuCloseButton.focus(), 0);
}

function closeMenu() {
  if (menu.open) menu.close();
  menuOpenButton.setAttribute('aria-expanded', 'false');
  lastFocusedElement?.focus?.();
}

screenLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    setScreen(link.dataset.screen);
    if (menu.open) closeMenu();
    window.scrollTo({ top: 0, behavior: 'auto' });
  });
});

menuOpenButton.addEventListener('click', openMenu);
menuCloseButton.addEventListener('click', closeMenu);
menu.addEventListener('cancel', (event) => { event.preventDefault(); closeMenu(); });
menu.addEventListener('click', (event) => { if (event.target === menu) closeMenu(); });
menu.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') { event.preventDefault(); closeMenu(); return; }
  if (event.key !== 'Tab') return;
  const focusable = focusableMenuElements();
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

themeButton.addEventListener('click', () => {
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});

document.querySelectorAll('[data-prototype-notice]').forEach((button) => {
  button.addEventListener('click', () => showToast('Detta är en isolerad prototyp. Ingen produktionsfunktion eller registrering startas.'));
});

exampleButton?.addEventListener('click', () => {
  const expanded = exampleButton.getAttribute('aria-expanded') === 'true';
  exampleButton.setAttribute('aria-expanded', String(!expanded));
  exampleButton.textContent = expanded ? 'Visa ifyllt exempel' : 'Dolj ifyllt exempel';
  filledExample.hidden = expanded;
  if (!expanded) filledExample.querySelector('strong')?.focus?.();
});

document.querySelector('[data-print]')?.addEventListener('click', () => window.print());
window.addEventListener('hashchange', () => setScreen(window.location.hash.slice(1), false));

setTheme(preferredTheme());
setScreen(window.location.hash.slice(1), false);
