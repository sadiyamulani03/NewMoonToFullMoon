import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { addReceipt, getCase, type ForensicCase } from '../lib/api';
import { useMidnightContext } from '../context/MidnightContext';
import { CircuitCall } from '../components/CircuitCall';

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

export default function CaseDetail() {
  const { id = '' } = useParams();
  const [caseItem, setCaseItem] = useState<ForensicCase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { contract } = useMidnightContext();

  const reload = useCallback(() => {
    getCase(id).then(setCaseItem).catch((e: unknown) => setError(String(e)));
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  const callCircuit = useCallback(async () => {
    const deployed = contract;
    if (!deployed) {
      throw new Error('Wallet not connected / contract not joined.');
    }
    const result = await deployed.callTx.increment(7n);
    return { txId: result.public.txId, blockHeight: result.public.blockHeight } as {
      txId: string;
      blockHeight: number | bigint;
    };
  }, [contract]);

  const onReceiptLanded = useCallback(
    async (result: { txId: string; blockHeight: number | bigint }) => {
      await addReceipt(id, {
        txId: result.txId,
        blockHeight: result.blockHeight,
        total: 0n, // private witness — never disclosed on-chain; stored off-chain is optional metadata
        network: 'preprod',
      }).catch(() => undefined);
      reload();
    },
    [id, reload],
  );

  return (
    <>
      <div className="breadcrumb">
        <Link to="/cases">Cases</Link>
        <span> / </span>
        <span className="info-label">{caseItem?.title ?? 'case'}</span>
      </div>

      <section className="card">
        <p className="section-head">
          <span className="section-no">02</span> Case details
        </p>
        {error && <p className="error-text">{error}</p>}
        {!caseItem && !error && <p className="muted-text">Loading case…</p>}
        {caseItem && (
          <>
            <strong className="case-title">{caseItem.title}</strong>
            <span className="status-tag">{caseItem.status}</span>
            <p className="muted-text">{caseItem.description}</p>
            <p>
              <span className="info-label">Owner</span> <code className="address">{caseItem.owner}</code>
            </p>
          </>
        )}
      </section>

      <CircuitCall contract={contract} callCircuit={callCircuit} onLanded={onReceiptLanded} proofMode="wallet" />

      <section className="card">
        <p className="section-head">
          <span className="section-no">04</span> Proof history
        </p>
        {!caseItem && <p className="muted-text">Loading…</p>}
        {caseItem && caseItem.receipts.length === 0 && (
          <p className="muted-text">No proofs recorded for this case yet — run the circuit above.</p>
        )}
        {caseItem && caseItem.receipts.length > 0 && (
          <ul className="case-list">
            {caseItem.receipts.map((r) => (
              <li key={r.txId}>
                <div className="case-row">
                  <div>
                    <strong className="case-title">Proof {fmtTime(r.createdAt)}</strong>
                    <p>
                      <span className="info-label">txId</span> <code className="tx-id">{r.txId}</code>
                    </p>
                    <p>
                      <span className="info-label">block</span> <code>{r.blockHeight}</code> · {r.network}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}