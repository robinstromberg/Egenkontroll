import { Component, type ErrorInfo, type ReactNode } from 'react';
import { reportClientError } from '../lib/errorReporting';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    reportClientError(error, {
      source: 'error-boundary',
      componentStack: errorInfo.componentStack ?? undefined,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-shell">
          <section className="status-panel" aria-labelledby="app-error-title">
            <p className="eyebrow">Något gick fel</p>
            <h1 id="app-error-title">Appen kunde inte visa vyn.</h1>
            <p className="muted-copy">
              Felet har loggats. Ladda om sidan och försök igen.
            </p>
            <button className="primary-button" type="button" onClick={() => window.location.reload()}>
              Ladda om
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
