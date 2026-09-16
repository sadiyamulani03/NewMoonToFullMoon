import { useEffect, useState } from 'react';

interface TxProgressProps {
  stage: 'proof' | 'submit';
}

const STAGE_LABELS: Record<TxProgressProps['stage'], string> = {
  proof: 'Processing — generating zero-knowledge proof',
  submit: 'Transaction submitted — awaiting finalization',
};

export default function TxProgress({ stage }: TxProgressProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const estimated = stage === 'proof' ? 25 : 10;
  const remaining = Math.max(0, estimated - elapsed);
  const pct = stage === 'proof' ? Math.min(70, (elapsed / estimated) * 70) : Math.min(100, 70 + (elapsed / estimated) * 30);

  return (
    <div className="loading-row tx-progress" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <div>
        <p className="ok-text">{STAGE_LABELS[stage]}… {stage === 'submit' && pct >= 100 ? '✓ Verifying on-chain…' : ''}</p>
        <p className="muted-text">
          Elapsed: <strong>{elapsed}s</strong> · Est. remaining: ~{remaining}s · Preprod avg: proving 15–30s + finalization 6–12s.
        </p>
        <p className="muted-text" style={{ fontSize: '0.82rem' }}>
          You can keep using the app — this continues in background. Keep this tab open until you see the receipt.
        </p>
        <div className="tx-progress-track" aria-hidden="true">
          <div className="tx-progress-bar" style={{ width: `${pct}%`, background: pct >= 100 ? 'var(--verify)' : undefined }} />
        </div>
      </div>
    </div>
  );
}