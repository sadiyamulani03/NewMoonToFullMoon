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
          <span className="section-no">07</span> Level 4 feature set
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
          <span className="section-no">08</span> Full-stack architecture
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
    </>
  );
}