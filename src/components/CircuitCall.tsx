import { useState } from 'react';
import type { FoundContract } from '@midnight-ntwrk/midnight-js-contracts';

import type { CounterContract } from '../lib/types';
import { useMidnightContext } from '../context/MidnightContext';
import TxProgress from './TxProgress';

export interface CircuitCallProps {
  contract: FoundContract<CounterContract> | null;
  callCircuit: () => Promise<{ txId: string; blockHeight: number | bigint }>;
  onLanded?: (result: { txId: string; blockHeight: number | bigint }) => void | Promise<void>;
}

type CallStatus =
  | { status: 'idle' }
  | { status: 'generating-proof'; startedAt: number }
  | { status: 'submitting' }
  | { status: 'success'; txId: string; blockHeight: number | bigint }
  | { status: 'error'; message: string };

export function CircuitCall({ contract, callCircuit, onLanded }: CircuitCallProps) {
  const [callStatus, setCallStatus] = useState<CallStatus>({ status: 'idle' });
  const { ledgerTotal, lastDisclosed } = useMidnightContext();

  async function onCall() {
    if (!contract) return;
    setCallStatus({ status: 'generating-proof', startedAt: Date.now() });
    try {
      const result = await callCircuit();
      setCallStatus({ status: 'success', txId: result.txId, blockHeight: result.blockHeight });
      if (onLanded) {
        await onLanded(result);
      }
    } catch (e: unknown) {
      const err = e as Error & { reason?: string };
      setCallStatus({ status: 'error', message: err?.reason ?? err?.message ?? String(e) });
      console.error('circuit call error', e);
    }
  }

  const isBusy = callStatus.status === 'generating-proof' || callStatus.status === 'submitting';

  return (
    <section className="card circuit-card">
      <p className="section-head">
        <span className="section-no">03</span> Run the circuit
      </p>

      <p className="muted-text">
        This fires the <code>increment</code> circuit on the deployed counter. The step amount is a{' '}
        <strong>private witness</strong> — the proof convinces the chain the counter moved, but neither the ledger nor
        this page ever learns by how much.
      </p>

      {!contract ? (
        <p className="error-text">Connect the wallet first so we can pick the contract back up.</p>
      ) : (
        <>
          <div className="ledger-row">
            <span className="info-label">Recorded total</span>
            <code className="value">{ledgerTotal === null ? '…' : ledgerTotal.toString()}</code>
            <span className="info-label">Last disclosed</span>
            <code className="value">{lastDisclosed === null ? '…' : lastDisclosed.toString()}</code>
          </div>

          <button className="btn btn-primary btn-block" onClick={onCall} disabled={isBusy}>
            {callStatus.status === 'generating-proof'
              ? 'Working out the proof…'
              : callStatus.status === 'submitting'
                ? 'Sending it on-chain…'
                : 'Run the circuit'}
          </button>

          {callStatus.status === 'generating-proof' && (
            <TxProgress stage="proof" />
          )}

          {callStatus.status === 'submitting' && (
            <TxProgress stage="submit" />
          )}

          {callStatus.status === 'success' && (
            <div className="result-box">
              <p className="ok-text">Transaction landed on-chain</p>
              <p>
                <span className="info-label">txId</span> <code className="tx-id">{callStatus.txId}</code>
              </p>
              <p>
                <span className="info-label">block</span> <code>{callStatus.blockHeight.toString()}</code>
              </p>
              <p className="privacy-note">✓ proved without ever revealing your step</p>
            </div>
          )}

          {callStatus.status === 'error' && <p className="error-text">Call failed: {callStatus.message}</p>}
        </>
      )}
    </section>
  );
}