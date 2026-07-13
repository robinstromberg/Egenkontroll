import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DesignSystemShowcase } from './components/DesignSystemShowcase';
import { setupGlobalErrorReporting } from './lib/errorReporting';
import { setupPwaInstallPromptListener } from './services/pwaInstallPrompt';
import './styles/global.css';
import './components/ui/designSystem.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element saknas. Kontrollera att index.html innehåller <div id="root"></div>.');
}

const isDesignSystemShowcase = import.meta.env.DEV && window.location.pathname === '/utveckling/designsystem';

if (isDesignSystemShowcase) {
  document.title = 'Designsystem – Min Egenkontroll';
  createRoot(rootElement).render(
    <StrictMode>
      <DesignSystemShowcase />
    </StrictMode>,
  );
} else {
  setupGlobalErrorReporting();
  setupPwaInstallPromptListener();

  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}

if (!isDesignSystemShowcase && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch((error: unknown) => {
      console.info('Service worker kunde inte registreras.', error);
    });
  });
}
