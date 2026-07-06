import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function OnlineOnlyBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside className="online-only-banner" role="status" aria-live="polite">
      <strong>Internet saknas</strong>
      <span>Appen kräver internet för att spara kontroller. Vänta med att spara tills anslutningen är tillbaka.</span>
    </aside>
  );
}
