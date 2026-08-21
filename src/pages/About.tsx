import { Link } from 'react-router-dom';

export default function About() {
  return (
    <>
      <section className="card">
        <p className="section-head">
          <span className="section-no">05</span> What this is
        </p>
        <p className="muted-text">
          MidnightTrace is a privacy-first blockchain forensics dApp. In real forensic work you often need to{' '}
          <em>prove that you performed an analysis step</em> — traced a hidden amount, counted evidence, verified a
          batch — without disclosing the underlying data. This dApp demonstrates that pattern first with the Level 1
          counter contract, then as a full case-management system on the midnighttrace contract.
        </p>
      </section>

      <section className="card">
        <p className="section-head">
          <span className="section-no">06</span> Privacy model
        </p>
        <ul className="privacy-list">
          <li>
            <strong>Public:</strong> the on-chain aggregate, the <code>lastDisclosed</code> column (only when a caller
            deliberately reveals a running total), the allowlist root, member count, and case phases.
          </li>
          <li>
            <strong>Private:</strong> every step <code>amount</code> witness and every member secret. They live only
            inside the zero-knowledge proofs.
          </li>
          <li>
            <strong>Proved without revealing:</strong> that a hidden step moved the case forward, that the caller's
            secret really is on the allowlist (a Merkle membership proof), and that disclosed totals follow the hidden
            total.
          </li>
        </ul>
        <p className="privacy-note">An on-chain observer sees a valid proof, never the amount or the identity.</p>
      </section>

      <section className="card">
        <p className="section-head">
          <span className="section-no">07</span> How zero-knowledge proofs work
        </p>
        <p className="muted-text">
          In plain terms, a zero-knowledge proof lets you say{' '}
          <em>&quot;I know the answer — and I can prove it — without telling you the answer&quot;</em>. MidnightTrace
          uses this everywhere. Here&apos;s what happens when you log a hidden step:
        </p>
        <ul className="privacy-list">
          <li>
            <strong>1. You pick a private amount.</strong> The step amount lives only in your wallet — it never leaves
            your device.
          </li>
          <li>
            <strong>2. Your wallet builds a proof.</strong> It proves the statement{' '}
            <em>&quot;new total = old total + my amount&quot;</em> is true, in a way that leaks nothing about the
            amount itself. This is the &quot;zero-knowledge&quot; part.
          </li>
          <li>
            <strong>3. The proof goes on-chain.</strong> The network checks the math is correct and updates the public
            total. It does <em>not</em> learn your amount — only that your claim is true.
          </li>
          <li>
            <strong>4. Anyone can verify, no one can see.</strong> The public Audit window re-checks the ledger without
            a wallet. The total is trustworthy because it was proven — not because anyone had to be trusted.
          </li>
        </ul>
        <p className="privacy-note">
          Analogy: a friend proves they can open a lock by opening it inside a screen — you see it open, you never see
          the key.
        </p>
      </section>

      <section className="card">
        <p className="section-head">
          <span className="section-no">08</span> Level 4 feature set
        </p>
        <ul className="privacy-list">
          <li>
            <strong>Multi-case management:</strong> number-addressed case files on one contract, plus an off-chain
            receipt book.
          </li>
          <li>
            <strong>Chain of custody:</strong> every proof is filed with its finalized block, in order, so custody is
            independently verifiable.
          </li>
          <li>
            <strong>Selective disclosure:</strong> log hidden steps whenever you want, then publish only the running
            total you choose (discloseFinding).
          </li>
          <li>
            <strong>Private allowlist:</strong> only commitments (hashes) are stored; membership is a ZK proof, and the
            owner grants others in zero knowledge.
          </li>
          <li>
            <strong>Freshness &amp; integrity:</strong> case sealing makes totals permanent; the public audit window
            verifies aggregate, totals, root, and the receipt book against on-chain state.
          </li>
        </ul>
      </section>

      <section className="card">
        <p className="section-head">
          <span className="section-no">09</span> Full-stack architecture
        </p>
        <p className="muted-text">
          The dApp is a multi-page React app served by an Express API. On-chain logic lives in the Compact counter and
          midnighttrace contracts; the API manages case metadata and proof receipts. Privacy is preserved end to end:
          witnesses never leave your wallet, and the API only stores what the contract makes public.
        </p>
      </section>

      <div className="quick-links">
        <Link className="btn btn-primary" to="/cases">
          Go to cases
        </Link>
        <Link className="btn btn-secondary" to="/audit">
          Public audit window
        </Link>
      </div>
      <section className="card">
        <p className="section-head">
          <span className="section-no">10</span> Glossary
        </p>
        <dl className="glossary">
          <dt>Aggregate</dt>
          <dd>The total sum of all case totals on-chain, visible to anyone.</dd>
          <dt>Allowlist</dt>
          <dd>A Merkle tree of committed investigator secrets; membership is proved in zero knowledge.</dd>
          <dt>Commitment</dt>
          <dd>The persistent hash of an investigator's secret, stored on-chain; never the secret itself.</dd>
          <dt>Zero-knowledge proof</dt>
          <dd>A cryptographic proof that lets one party prove a statement is true without revealing any hidden data.</dd>
          <dt>Persistent hash</dt>
          <dd>A one-way hash of a secret that can be recomputed and compared on-chain without revealing the secret.</dd>
          <dt>Event count</dt>
          <dd>The per-case counter of how many forensic steps have been logged.</dd>
          <dt>Phase</dt>
          <dd>The current state of a case: ACTIVE (open) or CLOSED (sealed permanently).</dd>
        </dl>
      </section>
      <div className="quick-links">
        <Link className="btn btn-primary" to="/cases">
          Go to cases
        </Link>
        <Link className="btn btn-secondary" to="/audit">
          Public audit window
        </Link>
      </div>
    </>
  );
}