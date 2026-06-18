import { ActionButton } from './ui/ActionButton';
import type { OrganizationContext } from '../services/organizationService';
import './MenuView.css';

export type MenuViewProps = {
  context: OrganizationContext;
  userEmail: string | null | undefined;
  roleLabel: string;
  canManage: boolean;
  onOpenProfile: () => void;
  onOpenOrganization: () => void;
  onOpenUsers: () => void;
  onOpenControlTypes: () => void;
  onOpenSuppliers: () => void;
  onOpenHelp: () => void;
  onSignOut: () => Promise<void>;
};

type MenuAction = 'profile' | 'organization' | 'users' | 'controlTypes' | 'suppliers' | 'help';

type MenuItem = {
  title: string;
  description: string;
  icon: string;
  action: MenuAction;
  adminOnly?: boolean;
};

const menuItems: MenuItem[] = [
  {
    title: 'Min profil',
    description: 'Namn, e-post och personliga inställningar.',
    icon: 'P',
    action: 'profile',
  },
  {
    title: 'Verksamheten',
    description: 'Grunduppgifter, plats och information som visas i rapporter.',
    icon: 'V',
    action: 'organization',
    adminOnly: true,
  },
  {
    title: 'Användare',
    description: 'Se personal och hantera roller.',
    icon: 'A',
    action: 'users',
    adminOnly: true,
  },
  {
    title: 'Kontrolltyper',
    description: 'Hantera kontroller, frekvenser och kontrollobjekt.',
    icon: 'K',
    action: 'controlTypes',
    adminOnly: true,
  },
  {
    title: 'Leverantörer',
    description: 'Leverantörer för varumottagning och spårbarhet.',
    icon: 'L',
    action: 'suppliers',
    adminOnly: true,
  },
  {
    title: 'Hjälp',
    description: 'Instruktioner, frågor och stöd vid kontroll.',
    icon: '?',
    action: 'help',
  },
];

export function MenuView({
  context,
  userEmail,
  roleLabel,
  canManage,
  onOpenProfile,
  onOpenOrganization,
  onOpenUsers,
  onOpenControlTypes,
  onOpenSuppliers,
  onOpenHelp,
  onSignOut,
}: MenuViewProps) {
  const visibleItems = menuItems.filter((item) => canManage || !item.adminOnly);
  const actionHandlers: Record<MenuAction, () => void> = {
    profile: onOpenProfile,
    organization: onOpenOrganization,
    users: onOpenUsers,
    controlTypes: onOpenControlTypes,
    suppliers: onOpenSuppliers,
    help: onOpenHelp,
  };

  return (
    <section className="menu-view" aria-labelledby="menu-title">
      <div className="menu-card">
        <p className="eyebrow">Meny</p>
        <h3 id="menu-title">{context.organization.name}</h3>
        <p className="muted-copy">
          {userEmail} - {roleLabel}
        </p>
      </div>

      <div className="menu-list" aria-label="Menyval">
        {visibleItems.map((item) => (
          <button
            className="menu-list-item"
            type="button"
            key={item.title}
            onClick={actionHandlers[item.action]}
          >
            <span className="menu-list-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="menu-list-copy">
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </span>
            <span className="menu-list-chevron" aria-hidden="true">
              &rsaquo;
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
