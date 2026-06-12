import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element saknas. Kontrollera att index.html innehåller <div id="root"></div>.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
