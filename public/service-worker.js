/* global self */

const SERVICE_WORKER_VERSION = 'min-egenkontroll-pwa-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // Network-only on purpose. Offline sync/cache is a separate product decision.
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'PING') {
    event.source?.postMessage({ type: 'PONG', version: SERVICE_WORKER_VERSION });
  }
});
