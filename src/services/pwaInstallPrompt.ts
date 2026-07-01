let deferredPrompt: BeforeInstallPromptEvent | null = null;
let initialized = false;

const listeners = new Set<(prompt: BeforeInstallPromptEvent | null) => void>();

function notifyListeners() {
  for (const listener of listeners) {
    listener(deferredPrompt);
  }
}

export function setupPwaInstallPromptListener() {
  if (initialized) return;
  initialized = true;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notifyListeners();
  });
}

export function subscribePwaInstallPrompt(listener: (prompt: BeforeInstallPromptEvent | null) => void) {
  listeners.add(listener);
  listener(deferredPrompt);

  return () => {
    listeners.delete(listener);
  };
}

export async function runPwaInstallPrompt() {
  if (!deferredPrompt) return null;

  const prompt = deferredPrompt;
  await prompt.prompt();
  const choice = await prompt.userChoice;
  deferredPrompt = null;
  notifyListeners();
  return choice.outcome;
}
