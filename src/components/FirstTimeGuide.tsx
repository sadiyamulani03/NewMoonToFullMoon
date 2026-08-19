import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'midnighttrace-first-time-dismissed';

export default function FirstTimeGuide() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(STORAGE_KEY) !== '1');
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
      // storage unavailable — fine
    }
  };

  return (
    <section className="card first-time-guide">
      <p className="section-head">
        <span className="section-no">00</span> First time here?
      </p>
      <ol className="privacy-list">
        <li>
          <strong>Connect a wallet</strong> — install <strong>1AM</strong> or <strong>Lace</strong> on a desktop
          browser, switch to <strong>Preprod</strong>, and hit Connect.
        </li>
        <li>
          <strong>Open a case</strong> — create a case file, then open it on-chain with a case index.
        </li>
        <li>
          <strong>Log a hidden step</strong> — the amount stays private forever; only a zero-knowledge proof goes
          on-chain.
        </li>
        <li>
          <strong>Verify without a wallet</strong> — the <Link to="/audit">Audit window</Link> lets anyone check the
          ledger.
        </li>
      </ol>
      <p className="muted-text">
        Everything you need lives in <Link to="/about">About → How zero-knowledge proofs work</Link>.
      </p>
      <button className="btn btn-secondary" onClick={dismiss}>
        Got it — hide this
      </button>
    </section>
  );
}