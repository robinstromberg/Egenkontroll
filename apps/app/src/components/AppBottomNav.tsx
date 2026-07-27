import { appUiIcons } from '../config/assets';
import type { IconAsset } from '../config/assets';
import { t } from '../locales';
import { AssetIcon } from './ui/AssetIcon';
import { AppNavButton } from './ui/AppPrimitives';

export type AppView = 'today' | 'history' | 'kpi' | 'sharing' | 'menu';

const items: { id: AppView; icon: IconAsset; label: string }[] = [
  { id: 'today', icon: appUiIcons.today, label: t.navigationToday },
  { id: 'history', icon: appUiIcons.history, label: t.navigationHistory },
  { id: 'kpi', icon: appUiIcons.kpi, label: 'KPI' },
  { id: 'sharing', icon: appUiIcons.sharing, label: t.navigationSharing },
  { id: 'menu', icon: appUiIcons.menu, label: t.navigationMenu },
];

export function AppBottomNav(props: { activeView?: AppView; onChangeView?: (view: AppView) => void } = {}) {
  return (
    <nav className="bottom-bar" aria-label="Huvudnavigation">
      {items.map((item) => {
        const selected = item.id === (props.activeView ?? 'today');
        return (
          <AppNavButton
            className={selected ? 'bottom-bar-item selected' : 'bottom-bar-item'}
            key={item.id}
            aria-current={selected ? 'page' : undefined}
            onClick={() => props.onChangeView?.(item.id)}
          >
            <span className="bottom-bar-icon" aria-hidden="true">
              <AssetIcon icon={item.icon} />
            </span>
            <span>{item.label}</span>
          </AppNavButton>
        );
      })}
    </nav>
  );
}
