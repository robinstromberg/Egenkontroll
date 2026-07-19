import { useEffect, useRef, useState } from 'react';
import { brandAssets } from '@min-egenkontroll/brand';
import { appUrls } from '../config/appUrls';

type Theme = 'light' | 'dark';

const themeKey = 'egenkontroll:homepage-theme';
const links = [
  ['/kunskapsbank', 'Kunskap'],
  ['/mall-kontrollplan-livsmedel', 'Mallar och checklistor'],
  ['/verktyg-faroanalys-livsmedel', 'Verktyg'],
  ['/seo/utbildning-livsmedelshygien-personal.html', 'Utbildning'],
  ['/seo/kallor-och-faktagranskning.html', 'Referenser och källor'],
  ['/digital-egenkontroll-livsmedel', 'Appen'],
] as const;

function readTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const value = window.localStorage.getItem(themeKey);
  if (value === 'light' || value === 'dark') return value;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  document.querySelector<HTMLElement>('[data-public-site-root]')?.setAttribute('data-theme', theme);
}

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuPanel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialTheme = readTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const dialog = menuPanel.current;
    dialog?.querySelector<HTMLElement>('a,button')?.focus();

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButton.current?.focus();
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('a[href],button:not([disabled])'));
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    menuButton.current?.focus();
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(themeKey, nextTheme);
  };

  const themeLabel = theme === 'light' ? 'Aktivera mörkt läge' : 'Aktivera ljust läge';

  return <>
    <header className="home-header">
      <div className="home-shell home-header__inner">
        <a className="home-brand" href="/"><img src={brandAssets.icon} alt="" /><span>Min Egenkontroll</span></a>
        <nav className="home-nav" aria-label="Huvudnavigation">
          {links.map(([href, label]) => <a href={href} key={href}>{label}</a>)}
        </nav>
        <div className="home-header__actions">
          <button className="home-theme-toggle" type="button" onClick={toggleTheme} aria-label={themeLabel}>
            <span aria-hidden="true">{theme === 'light' ? '◐' : '◑'}</span>
            <span className="home-theme-toggle__text">{theme === 'light' ? 'Mörkt' : 'Ljust'}</span>
          </button>
          <a className="home-login" href={appUrls.login}>Logga in</a>
          <a className="ds-button ds-button--primary" href={appUrls.signup}>Kom igång</a>
          <button ref={menuButton} className="home-menu-button" type="button" aria-controls="home-menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>Meny</button>
        </div>
      </div>
    </header>
    {menuOpen ? <div className="home-menu-backdrop">
      <div className="home-menu" id="home-menu" ref={menuPanel} role="dialog" aria-modal="true" aria-label="Huvudmeny">
        <div><strong>Min Egenkontroll</strong><button type="button" onClick={closeMenu}>Stäng</button></div>
        <nav>
          {links.map(([href, label]) => <a href={href} onClick={closeMenu} key={href}>{label}</a>)}
          <button className="home-theme-toggle" type="button" onClick={toggleTheme} aria-label={themeLabel}>{themeLabel}</button>
          <a href={appUrls.login} onClick={closeMenu}>Logga in</a>
          <a className="ds-button ds-button--primary" href={appUrls.signup} onClick={closeMenu}>Kom igång</a>
        </nav>
      </div>
    </div> : null}
  </>;
}
