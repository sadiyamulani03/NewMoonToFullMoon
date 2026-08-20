interface LoadingProps {
  label?: string;
}

export default function Loading({ label = 'Loading…' }: LoadingProps) {
  return (
    <div className="loading-row" role="status" aria-live="polite">
      <span className="spinner" />
      <p className="muted-text">{label}</p>
    </div>
  );
}