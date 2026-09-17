export type TxOp = 'openCase' | 'logStep' | 'discloseFinding' | 'closeCase' | 'grantAccess' | 'connect' | 'proving';
export type TxOutcome = 'success' | 'failed' | 'cancelled' | 'timeout';

export function logTx(entry: {
  op: TxOp;
  caseId?: string;
  txId?: string;
  network?: string;
  latencyMs?: number;
  outcome: TxOutcome;
  errorCategory?: string;
}) {
  // Never log private witnesses, secrets, passwords, or seed phrases.
  // Only high-level operational data.
  const safe = {
    op: entry.op,
    caseId: entry.caseId ?? null,
    txId: entry.txId ? `${entry.txId.slice(0, 8)}…` : null,
    network: entry.network ?? null,
    latencyMs: entry.latencyMs ?? null,
    outcome: entry.outcome,
    errorCategory: entry.errorCategory ?? null,
    ts: new Date().toISOString(),
  };
  // Dev-only console, plus optional Vercel log drain (no secrets)
  if (typeof window !== 'undefined' && (import.meta.env.DEV || (import.meta.env.VITE_DEBUG as string | undefined))) {
    console.debug('[audit]', safe);
  } else {
    // In production, still emit to console for Vercel log ingestion (safe fields only)
    console.info('[audit]', safe);
  }
}
