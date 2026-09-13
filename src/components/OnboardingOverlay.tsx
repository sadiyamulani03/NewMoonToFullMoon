import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'midnighttrace-onboarding-seen';

export default function OnboardingOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== '1') {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
  };

  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true" aria-label="Welcome to MidnightTrace">
      <div className="onboarding-backdrop" onClick={dismiss} />
      <div className="onboarding-modal card">
        <p className="eyebrow">MidnightTrace — Preprod live</p>
        <h2 style={{ margin: '10px 0 8px', fontFamily: 'var(--font-display)', fontSize: '1.6rem' }}>
          Prove a forensic step without exposing the evidence.
        </h2>
        <p className="muted-text">
          A privacy-first desk for investigators and auditors on the Midnight Network. Each step is a{' '}
          <strong>zero-knowledge proof</strong> — the chain verifies <em>that</em> you counted, without ever seeing{' '}
          <em>what</em> you counted.
        </p>
        <p className="privacy-note">
          Privacy in one line: your hidden <code>amount</code> is a private witness — the proof shows{' '}
          <code>total&apos; = total + amount</code> is true, while <code>amount</code> never goes on-chain and never
          appears on screen.
        </p>
        <ol className="privacy-list" style={{ marginTop: '14px' }}>
          <li>
            <strong>Open a case</strong> — give it a number and a title (off-chain metadata).
          </li>
          <li>
            <strong>Log a hidden step</strong> — your wallet proves <em>total&apos; = total + amount</em> without
            revealing the amount.
          </li>
          <li>
            <strong>Disclose on your terms</strong> — publish the running total only when you choose.
          </li>
          <li>
            <strong>Anyone can audit</strong> — the public Audit window reads the live ledger with no wallet.
          </li>
        </ol>
        <p className="muted-text" style={{ marginTop: '12px' }}>
          Don&apos;t want to connect a wallet?{' '}
          <Link to="/audit" onClick={dismiss}>
            Verify publicly
          </Link>{' '}
          — audit any case without a wallet or secrets.
        </p>
        <div className="quick-links" style={{ marginTop: '16px' }}>
          <Link className="btn btn-primary" to="/dashboard" onClick={dismiss}>
            Launch App
          </Link>
          <Link className="btn btn-secondary" to="/audit" onClick={dismiss}>
            Verify in Audit window
          </Link>
          <button className="btn btn-secondary" onClick={dismiss}>
            Got it — hide
          </button>
        </div>
      </div>
    </div>
  );
}
