import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <>
      <section className="card about-hero">
        <div className="about-hero-copy">
          <span className="eyebrow">MidnightTrace — Preprod live</span>
          <h2>Prove a forensic step without exposing the evidence.</h2>
          <p className="muted-text">
            A privacy-first desk for investigators and auditors on the Midnight Network. Each step is a{' '}
            <strong>zero-knowledge proof</strong> — the chain verifies <em>that</em> you counted, without ever seeing{' '}
            <em>what</em> you counted.
          </p>
          <p className="privacy-note" style={{ marginTop: '10px' }}>
            Privacy in one line: your hidden <code>amount</code> is a private witness — the proof shows{' '}
            <code>total&apos; = total + amount</code> is true, while <code>amount</code> never goes on-chain and never
            appears on screen.
          </p>
        </div>
        <div className="quick-links">
          <Link className="btn btn-primary" to="/dashboard">
            Open investigation desk
          </Link>
          <Link className="btn btn-secondary" to="/audit">
            Verify in Audit window
          </Link>
          <Link className="btn btn-secondary" to="/about">
            How ZK works
          </Link>
        </div>
      </section>

      <section className="card">
        <p className="section-head">
          <span className="section-no">01</span> How it works — 30 seconds
        </p>
        <ol className="privacy-list">
          <li>
            <strong>Open a case</strong> — give it a number and a title (off-chain metadata).
          </li>
          <li>
            <strong>Log a hidden step</strong> — enter a private amount; your wallet proves{' '}
            <em>total&apos; = total + amount</em> without revealing the amount.
          </li>
          <li>
            <strong>Disclose on your terms</strong> — publish the running total only when you choose; otherwise it
            stays private.
          </li>
          <li>
            <strong>Anyone can audit</strong> — the public Audit window reads the live ledger with no wallet and checks
            aggregate, totals and allowlist root.
          </li>
        </ol>
      </section>

      <section className="card">
        <p className="section-head">
          <span className="section-no">02</span> Why Midnight
        </p>
        <p className="muted-text">
          Most chains publish everything. Midnight&apos;s Compact contracts keep your witness private by default and
          require an explicit <code>disclose()</code> to make anything public. MidnightTrace uses that to give you
          selective disclosure natively: public totals for verifiability, private amounts for confidentiality.
        </p>
        <div className="feature-pills" style={{ marginTop: '12px' }}>
          <span>Selective disclosure</span>
          <span>Private allowlist</span>
          <span>Chain-of-custody receipts</span>
        </div>
      </section>

      <section className="card">
        <p className="section-head">
          <span className="section-no">03</span> Example forensic scenario
        </p>
        <p className="muted-text">
          <strong>Scenario:</strong> An auditor must confirm that a lab processed <em>3 hidden evidence batches</em>{' '}
          without learning the batch sizes.
        </p>
        <ol className="privacy-list">
          <li>Investigator opens case #7 — `openCase(7)`.</li>
          <li>Logs three hidden steps — `logStep(7, amount=a1)`, `logStep(7, amount=a2)`, `logStep(7, amount=a3)` — each
            as a ZK proof. The on-chain <code>total</code> becomes <code>a1+a2+a3</code>, but <code>a1</code>,{' '}
            <code>a2</code>, <code>a3</code> are never stored on-chain.
          </li>
          <li>Chooses to disclose the total — `discloseFinding(7, amount=total)` — so the auditor sees the verifiable
            total with a receipt.
          </li>
          <li>Seals the case — `closeCase(7)` — totals become permanent; the Audit window shows phase CLOSED and a
            fingerprint anyone can recompute.
          </li>
        </ol>
        <p className="privacy-note">Try this flow yourself on the Cases → Case detail page with your Preprod wallet.</p>
      </section>

      <section className="card">
        <p className="section-head">
          <span className="section-no">04</span> Need a wallet?
        </p>
        <p className="muted-text">
          Install <strong>Lace</strong> or <strong>1AM</strong>, switch to <strong>Preprod</strong>, fund with tNIGHT
          at the faucet, then return here. MidnightTrace connects via the DApp Connector — no seed ever leaves your
          wallet.
        </p>
        <div className="quick-links" style={{ marginTop: '12px' }}>
          <a className="btn btn-secondary" href="https://midnight.network" target="_blank" rel="noreferrer">
            midnight.network
          </a>
          <a className="btn btn-secondary" href="https://faucet.preprod.midnight.network" target="_blank" rel="noreferrer">
            Get tNIGHT
          </a>
        </div>
      </section>
    </>
  );
}
