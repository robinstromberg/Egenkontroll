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
    <div className="bottom-bar">
      {items.map((item) => {
        const selected = item.id === (props.activeView ?? 'today');
        return (
          <span
            className={selected ? 'bottom-bar-item selected' : 'bottom-bar-item'}
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => props.onChangeView?.(item.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') props.onChangeView?.(item.id);
            }}
          >
            {item.label}
          </span>
        );
      })}
    </div>
  );
}
