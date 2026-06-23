import { appUiIcons } from '../config/assets';
import { t } from '../locales';
import { AssetIcon } from './ui/AssetIcon';

export type AppView = 'today' | 'history' | 'add' | 'sharing' | 'menu';

const items: { id: AppView; icon: string; fallback: string; label: string }[] = [
  { id: 'today', icon: appUiIcons.today, fallback: '□', label: t.navigationToday },
  { id: 'history', icon: appUiIcons.history, fallback: '↺', label: t.navigationHistory },
  { id: 'add', icon: appUiIcons.add, fallback: '+', label: t.navigationAdd },
  { id: 'sharing', icon: appUiIcons.sharing, fallback: '◇', label: t.navigationSharing },
  { id: 'menu', icon: appUiIcons.menu, fallback: '≡', label: t.navigationMenu },
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
            <span className="bottom-bar-icon" aria-hidden="true">
              <AssetIcon src={item.icon} fallback={item.fallback} />
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
