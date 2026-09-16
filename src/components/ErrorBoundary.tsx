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
      <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: 24, background: '#14181F' }}>
        <section className="ledger" style={{ maxWidth: 560, width: '100%', borderColor: 'rgba(255,255,255,0.13)', background: '#1A1E26' }}>
          <div className="ledger-head" style={{ background: '#151A22', borderBottomColor: 'rgba(255,255,255,0.08)' }}>
            <span className="ledger-title" style={{ color: '#EDE7D8' }}>Something went wrong</span>
            <span className="stamp stamp-fail stamp-small" style={{ transform: 'none' }}>Error</span>
          </div>
          <div style={{ padding: 16, display: 'grid', gap: 12 }}>
            <p style={{ margin: 0, color: '#ff8d7a', fontSize: '0.9rem', lineHeight: 1.6 }}>
              This view hit an unexpected error: <code className="mono" style={{ background: 'rgba(0,0,0,0.25)', padding: '2px 6px', borderRadius: 3, wordBreak: 'break-all', fontSize: '0.82rem' }}>{this.state.message ?? 'unknown'}</code>
            </p>
            <p style={{ margin: 0, color: '#9AA3B5', fontSize: '0.84rem', lineHeight: 1.5 }}>Your case files and on-chain ledger state are safe — this is a UI error only. Reload to continue.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ background: '#EDE7D8', color: '#14181F', borderColor: '#EDE7D8' }}>Reload app</button>
              <a href="/" className="btn btn-secondary" style={{ color: '#EDE7D8', borderColor: 'rgba(255,255,255,0.13)' }}>Go to Landing</a>
            </div>
          </div>
        </section>
      </div>
    );
  }
}