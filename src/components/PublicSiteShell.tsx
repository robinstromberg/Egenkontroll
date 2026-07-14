import { useEffect, useRef, useState, type ReactNode } from 'react';
import { brandAssets } from '../config/assets';
import './PublicSiteShell.css';

type Props = { children: ReactNode; onStartTrial: () => void; onLogin: () => void; className?: string };
type Theme = 'light' | 'dark';
const themeKey = 'egenkontroll:homepage-theme';
const links = [['/kunskapsbank', 'Kunskap'], ['/seo/kontrollplan.html', 'Mallar och checklistor'], ['/faroanalys-livsmedel', 'Verktyg'], ['/seo/utbildning-livsmedelshygien-personal.html', 'Utbildning'], ['/seo/kallor-och-faktagranskning.html', 'Referenser och källor'], ['/digital-egenkontroll-livsmedel', 'Appen']] as const;
function readTheme(): Theme { const value = localStorage.getItem(themeKey); return value === 'light' || value === 'dark' ? value : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }

export function PublicSiteShell({ children, onStartTrial, onLogin, className = '' }: Props) {
  const [menuOpen, setMenuOpen] = useState(false); const [theme, setTheme] = useState<Theme>(readTheme);
  const button = useRef<HTMLButtonElement>(null); const panel = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!menuOpen) return; const dialog = panel.current; dialog?.querySelector<HTMLElement>('a,button')?.focus(); const keydown = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMenuOpen(false); button.current?.focus(); return; } if (event.key !== 'Tab' || !dialog) return; const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')); const first = focusable[0]; const last = focusable[focusable.length - 1]; if (!first || !last) return; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } }; addEventListener('keydown', keydown); return () => removeEventListener('keydown', keydown); }, [menuOpen]);
  const close = () => { setMenuOpen(false); button.current?.focus(); };
  const toggle = () => setTheme((current) => { const next = current === 'light' ? 'dark' : 'light'; localStorage.setItem(themeKey, next); return next; });
  const themeLabel = theme === 'light' ? 'Aktivera mörkt läge' : 'Aktivera ljust läge';
  return <div className={`home-page ${className}`} data-theme={theme}>
    <a className="home-skip" href="#main-content">Hoppa till innehållet</a>
    <header className="home-header"><div className="home-shell home-header__inner"><a className="home-brand" href="/"><img src={brandAssets.icon} alt="" /><span>Min Egenkontroll</span></a><nav className="home-nav" aria-label="Huvudnavigation">{links.map(([href, label]) => <a href={href} key={href}>{label}</a>)}</nav><div className="home-header__actions"><button className="home-theme-toggle" type="button" onClick={toggle} aria-label={themeLabel}><span aria-hidden="true">{theme === 'light' ? '◐' : '◑'}</span><span className="home-theme-toggle__text">{theme === 'light' ? 'Mörkt' : 'Ljust'}</span></button><button className="home-login" type="button" onClick={onLogin}>Logga in</button><button className="ds-button ds-button--primary" type="button" onClick={onStartTrial}>Kom igång</button><button ref={button} className="home-menu-button" type="button" aria-controls="home-menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>Meny</button></div></div></header>
    {menuOpen && <div className="home-menu-backdrop"><div className="home-menu" id="home-menu" ref={panel} role="dialog" aria-modal="true" aria-label="Huvudmeny"><div><strong>Min Egenkontroll</strong><button type="button" onClick={close}>Stäng</button></div><nav>{links.map(([href, label]) => <a href={href} onClick={close} key={href}>{label}</a>)}<button className="home-theme-toggle" type="button" onClick={toggle} aria-label={themeLabel}>{themeLabel}</button><button type="button" onClick={onLogin}>Logga in</button><button className="ds-button ds-button--primary" type="button" onClick={onStartTrial}>Kom igång</button></nav></div></div>}
    {children}
    <footer className="home-footer"><div className="home-shell"><span>© 2026 Min Egenkontroll</span><nav><a href="/kunskapsbank">Kunskap</a><a href="/seo/kontrollplan.html">Mallar</a><a href="/faroanalys-livsmedel">Verktyg</a><a href="/digital-egenkontroll-livsmedel">Appen</a><a href="/integritetspolicy">Integritet</a><a href="/anvandarvillkor">Villkor</a></nav></div></footer>
  </div>;
}
