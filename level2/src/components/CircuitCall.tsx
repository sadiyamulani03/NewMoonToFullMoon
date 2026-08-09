import { useState } from 'react';
import type { FoundContract } from '@midnight-ntwrk/midnight-js-contracts';

import type { CounterContract } from '../lib/types';

export interface CircuitCallProps {
  contract: FoundContract<CounterContract> | null;
  callCircuit: () => Promise<{ txId: string; blockHeight: number | bigint }>;
  total: bigint | null;
  lastDisclosed: bigint | null;
  proofMode: 'wallet' | 'proof-server';
}

type CallStatus =
  | { status: 'idle' }
  | { status: 'generating-proof'; startedAt: number }
  | { status: 'submitting' }
  | { status: 'success'; txId: string; blockHeight: number | bigint }
  | { status: 'error'; message: string };

export function CircuitCall({ contract, callCircuit, total, lastDisclosed, proofMode }: CircuitCallProps) {
  const [callStatus, setCallStatus] = useState<CallStatus>({ status: 'idle' });

  async function onCall() {
    if (!contract) return;
    setCallStatus({ status: 'generating-proof', startedAt: Date.now() });
    try {
      const result = await callCircuit();
      setCallStatus({ status: 'success', txId: result.txId, blockHeight: result.blockHeight });
    } catch (e: unknown) {
      const err = e as Error & { reason?: string };
      setCallStatus({ status: 'error', message: err?.reason ?? err?.message ?? String(e) });
      console.error('circuit call error', e);
    }
  }

  const isBusy =
    callStatus.status === 'generating-proof' || callStatus.status === 'submitting';

  return (
    <section className="card circuit-card">
      <h2 className="card-title">Forensics Circuit</h2>

      <p className="muted-text">
        Calls the <code>increment</code> circuit on the deployed counter contract. The step amount is a{' '}
        <strong>private witness</strong> fed into the zero-knowledge proof — it is never placed on-chain and never
        shown in this UI.
      </p>

      {!contract ? (
        <p className="error-text">Connect your wallet first to join the contract.</p>
      ) : (
        <>
          <div className="ledger-row">
            <span className="info-label">Public ledger — total:</span>
            <code className="value">{total === null ? '…' : total.toString()}</code>
            <span className="info-label">lastDisclosed:</span>
            <code className="value">{lastDisclosed === null ? '…' : lastDisclosed.toString()}</code>
          </div>

          <button className="btn btn-primary btn-block" onClick={onCall} disabled={isBusy}>
            {callStatus.status === 'generating-proof'
              ? 'Generating zero-knowledge proof locally…'
              : callStatus.status === 'submitting'
                ? 'Submitting transaction…'
                : 'Run Circuit'}
          </button>

          {callStatus.status === 'generating-proof' && (
            <div className="loading-row">
              <span className="spinner" />
              <p className="muted-text">
                Generating a zero-knowledge proof in the browser
                {proofMode === 'wallet' ? ' (delegated to your wallet)' : ' (via proof server)'}. This proves the
                counter moved by your hidden amount without revealing it.
              </p>
            </div>
          )}

          {callStatus.status === 'success' && (
            <div className="result-box">
              <p className="ok-text">Transaction submitted on-chain</p>
              <p>
                <span className="info-label">txId:</span> <code className="tx-id">{callStatus.txId}</code>
              </p>
              <p>
                <span className="info-label">block:</span> <code>{callStatus.blockHeight.toString()}</code>
              </p>
              <p className="privacy-note">✓ Proved without revealing your input</p>
            </div>
          )}

          {callStatus.status === 'error' && <p className="error-text">Call failed: {callStatus.message}</p>}
        </>
      )}
    </section>
  );
}