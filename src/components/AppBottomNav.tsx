import { t } from '../locales';

export type AppView = 'today' | 'history' | 'add' | 'sharing' | 'menu';

const items: { id: AppView; label: string }[] = [
  { id: 'today', label: t.navigationToday },
  { id: 'history', label: t.navigationHistory },
  { id: 'add', label: t.navigationAdd },
  { id: 'sharing', label: t.navigationSharing },
  { id: 'menu', label: t.navigationMenu },
];

const targets: Record<AppView, string> = {
  today: '.dashboard-card',
  history: '.history-view',
  add: '.today-dashboard',
  sharing: '.sharing-view',
  menu: '.module-grid',
};

function changeView(view: AppView, onChangeView?: (view: AppView) => void) {
  if (onChangeView) {
    onChangeView(view);
    return;
  }

  const target = document.querySelector(targets[view]);
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

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
            onClick={() => changeView(item.id, props.onChangeView)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') changeView(item.id, props.onChangeView);
            }}
          >
            {item.label}
          </span>
        );
      })}
    </div>
  );
}
