import { ActionButton } from './ui/ActionButton';
import type { OrganizationContext } from '../services/organizationService';

export type MenuViewProps = {
  context: OrganizationContext;
  userEmail: string | null | undefined;
  roleLabel: string;
  canManage: boolean;
  onSignOut: () => Promise<void>;
};

type MenuItem = {
  title: string;
  description: string;
  icon: string;
  adminOnly?: boolean;
};

const menuItems: MenuItem[] = [
  {
    title: 'Min profil',
    description: 'Namn, e-post och personliga inställningar.',
    icon: '◉',
  },
  {
    title: 'Verksamheten',
    description: 'Grunduppgifter, plats och information som visas i rapporter.',
    icon: '⌂',
    adminOnly: true,
  },
  {
    title: 'Användare',
    description: 'Bjud in personal och hantera roller.',
    icon: '◎',
    adminOnly: true,
  },
  {
    title: 'Kontrolltyper',
    description: 'Hantera kontroller, frekvenser och kontrollobjekt.',
    icon: '□',
    adminOnly: true,
  },
  {
    title: 'Leverantörer',
    description: 'Leverantörer för varumottagning och spårbarhet.',
    icon: '◇',
    adminOnly: true,
  },
  {
    title: 'Hjälp',
    description: 'Instruktioner, frågor och stöd vid kontroll.',
    icon: '?',
  },
];

export function MenuView({ context, userEmail, roleLabel, canManage, onSignOut }: MenuViewProps) {
  const visibleItems = menuItems.filter((item) => canManage || !item.adminOnly);

  return (
    <section className="menu-view" aria-labelledby="menu-title">
      <div className="menu-card">
        <p className="eyebrow">Meny</p>
        <h3 id="menu-title">{context.organization.name}</h3>
        <p className="muted-copy">
          {userEmail} · {roleLabel}
        </p>
      </div>

      <div className="menu-list" aria-label="Menyval">
        {visibleItems.map((item) => (
          <button className="menu-list-item" type="button" key={item.title}>
            <span className="menu-list-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="menu-list-copy">
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </span>
            <span className="menu-list-chevron" aria-hidden="true">
              ›
            </span>
          </button>
        ))}
      </div>

      <div className="role-panel">
        <h3>Roll och åtkomst</h3>
        <p>
          {canManage
            ? 'Du kan hantera verksamhetens struktur, användare och delningslänkar.'
            : 'Du kan utföra kontroller och se relevant historik för verksamheten.'}
        </p>
      </div>

      <ActionButton variant="secondary" type="button" onClick={onSignOut}>
        Logga ut
      </ActionButton>
    </section>
  );
}
