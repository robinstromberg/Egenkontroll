type ErrorReportContext = {
  source: string;
  componentStack?: string;
};

const MAX_MESSAGE_LENGTH = 1000;
const MAX_STACK_LENGTH = 4000;

let globalReportingIsSetup = false;

function trimText(value: string | undefined, maxLength: number) {
  if (!value) return undefined;
  return value.slice(0, maxLength);
}

function readErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Okänt frontendfel.';
}

function readErrorStack(error: unknown) {
  return error instanceof Error ? error.stack : undefined;
}

export function reportClientError(error: unknown, context: ErrorReportContext) {
  if (typeof window === 'undefined') return;

  const payload = {
    message: trimText(readErrorMessage(error), MAX_MESSAGE_LENGTH),
    stack: trimText(readErrorStack(error), MAX_STACK_LENGTH),
    source: context.source,
    route: window.location.pathname,
    componentStack: trimText(context.componentStack, MAX_STACK_LENGTH),
    userAgent: trimText(window.navigator.userAgent, 500),
    timestamp: new Date().toISOString(),
  };

  window.fetch('/api/client-error', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => undefined);
}

export function setupGlobalErrorReporting() {
  if (typeof window === 'undefined' || globalReportingIsSetup) return;
  globalReportingIsSetup = true;

  window.addEventListener('error', (event) => {
    reportClientError(event.error ?? event.message, { source: 'window.error' });
  });

  window.addEventListener('unhandledrejection', (event) => {
    reportClientError(event.reason, { source: 'window.unhandledrejection' });
  });
}
