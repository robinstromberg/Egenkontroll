import { t } from '../locales';

export type AppView = 'today' | 'history' | 'add' | 'sharing' | 'menu';

const items: { id: AppView; label: string }[] = [
  { id: 'today', label: t.navigationToday },
  { id: 'history', label: t.navigationHistory },
  { id: 'add', label: t.navigationAdd },
  { id: 'sharing', label: t.navigationSharing },
  { id: 'menu', label: t.navigationMenu },
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
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
