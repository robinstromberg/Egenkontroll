import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Alert } from '@min-egenkontroll/design-system';

export function OnlineOnlyBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <Alert className="online-only-banner" tone="warning" title="Internet saknas" live="polite">
      Appen kräver internet för att spara kontroller. Vänta med att spara tills anslutningen är tillbaka.
    </Alert>
  );
}
