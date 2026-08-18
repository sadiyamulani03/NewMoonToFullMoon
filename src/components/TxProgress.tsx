import { useEffect, useState } from 'react';

interface TxProgressProps {
  stage: 'proof' | 'submit';
}

const STAGE_LABELS: Record<TxProgressProps['stage'], string> = {
  proof: 'Generating zero-knowledge proof',
  submit: 'Submitting transaction on-chain',
};

export default function TxProgress({ stage }: TxProgressProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="loading-row tx-progress">
      <span className="spinner" />
      <div>
        <p className="ok-text">{STAGE_LABELS[stage]}…</p>
        <p className="muted-text">
          Proofs can take 10–60&nbsp;s. Elapsed: <strong>{elapsed}s</strong> — keep this tab open.
        </p>
        <div className="tx-progress-track">
          <div className="tx-progress-bar" style={{ width: `${Math.min(90, elapsed * 3)}%` }} />
        </div>
      </div>
    </div>
  );
}