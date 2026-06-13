import { t } from '../locales';

export type AppView = 'today' | 'history' | 'add' | 'sharing' | 'menu';

const items: { id: AppView; icon: string; label: string }[] = [
  { id: 'today', icon: '□', label: t.navigationToday },
  { id: 'history', icon: '↺', label: t.navigationHistory },
  { id: 'add', icon: '+', label: t.navigationAdd },
  { id: 'sharing', icon: '◇', label: t.navigationSharing },
  { id: 'menu', icon: '≡', label: t.navigationMenu },
];

export function AppBottomNav(props: { activeView?: AppView; onChangeView?: (view: AppView) => void } = {}) {
  return (
    <nav className="bottom-bar" aria-label="Huvudnavigation">
      {items.map((item) => {
        const selected = item.id === (props.activeView ?? 'today');
        return (
          <button
            type="button"
            className={selected ? 'bottom-bar-item selected' : 'bottom-bar-item'}
            key={item.id}
            aria-current={selected ? 'page' : undefined}
            onClick={() => props.onChangeView?.(item.id)}
          >
            <span className="bottom-bar-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
