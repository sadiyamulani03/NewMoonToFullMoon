import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: null };

  static getDerivedStateFromError(err: unknown): State {
    return { hasError: true, message: err instanceof Error ? err.message : String(err) };
  }

  componentDidCatch(err: unknown) {
    console.error('UI crashed — caught by error boundary', err);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <section className="card">
        <p className="section-head">
          <span className="section-no">!!</span> Something went wrong
        </p>
        <p className="error-text">
          This view hit an unexpected error: {this.state.message ?? 'unknown'}. Your case files and on-chain state are
          safe — reload to continue.
        </p>
        <div className="wallet-actions">
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Reload app
          </button>
        </div>
      </section>
    );
  }
}