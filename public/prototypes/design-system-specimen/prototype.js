const menu = document.querySelector('#mobile-menu');
const menuOpen = document.querySelector('[data-menu-open]');
const menuClose = document.querySelector('[data-menu-close]');
const themeToggle = document.querySelector('[data-theme-toggle]');
const main = document.querySelector('main');
let previousFocus;

function closeMenu({ restoreFocus = true } = {}) {
  if (!menu?.open) return;
  menu.close();
  menuOpen?.setAttribute('aria-expanded', 'false');
  if (restoreFocus) previousFocus?.focus();
}

menuOpen?.addEventListener('click', () => {
  previousFocus = document.activeElement;
  menu.showModal();
  menuOpen.setAttribute('aria-expanded', 'true');
  menuClose?.focus();
});
menuClose?.addEventListener('click', () => closeMenu());
menu?.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeMenu();
});
menu?.addEventListener('click', (event) => {
  if (event.target === menu) closeMenu();
});
menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  closeMenu({ restoreFocus: false });
  window.setTimeout(() => {
    const target = document.querySelector(link.hash);
    target?.setAttribute('tabindex', '-1');
    target?.focus();
  }, 0);
}));

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const dark = theme === 'dark';
  themeToggle?.setAttribute('aria-pressed', String(dark));
  if (themeToggle) themeToggle.textContent = dark ? 'Ljust läge' : 'Mörkt läge';
  localStorage.setItem('mek-design-theme', theme);
}

setTheme(localStorage.getItem('mek-design-theme') || 'light');
themeToggle?.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));

document.querySelector('[data-search]')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const term = event.currentTarget.search.value.trim();
  const message = document.querySelector('[data-search-message]');
  message.textContent = term
    ? `Exempelresultat för ”${term}”. I produktion ska frasen finnas kvar på en separat resultatsida.`
    : 'Skriv en sökfras för att visa resultattillståndet.';
});

document.querySelector('.skip-link')?.addEventListener('click', () => window.setTimeout(() => main?.focus(), 0));
