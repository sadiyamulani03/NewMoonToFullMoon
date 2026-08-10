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
          batch — without disclosing the underlying data. This dApp demonstrates that pattern on the Midnight counter
          contract from Level 1.
        </p>
      </section>

      <section className="card">
        <p className="section-head">
          <span className="section-no">06</span> Privacy model
        </p>
        <ul className="privacy-list">
          <li>
            <strong>Public:</strong> the running <code>total</code> and the <code>lastDisclosed</code> value (only when
            a caller deliberately reveals).
          </li>
          <li>
            <strong>Private:</strong> the <code>amount</code> witness of each circuit. It lives only inside the
            zero-knowledge proof.
          </li>
          <li>
            <strong>Proved without revealing:</strong> that <code>total' = total + amount</code> for a hidden{' '}
            <code>amount</code>.
          </li>
        </ul>
        <p className="privacy-note">An on-chain observer sees a valid proof, never the amount.</p>
      </section>

      <section className="card">
        <p className="section-head">
          <span className="section-no">07</span> Full-stack architecture
        </p>
        <p className="muted-text">
          The dApp is a multi-page React app served by an Express API. On-chain logic stays in the Compact counter
          contract; the API manages case metadata and proof receipts. Privacy is preserved end to end: the witness
          amount never leaves your wallet, and the API only stores what the contract makes public.
        </p>
      </section>

      <Link className="btn btn-primary" to="/cases">
        Go to cases
      </Link>
    </>
  );
}