import { ledger as compiledLedger } from '../contract';

import type { StateValue, ChargedState, MerkleTreeDigest } from '@midnight-ntwrk/compact-runtime';
import type { Ledger as MidnightTraceLedger } from '../contract/midnighttrace';

export interface CounterLedger {
  total: bigint;
  lastDisclosed: bigint;
}

export function readCounterLedger(state: StateValue | ChargedState): CounterLedger {
  return compiledLedger(state) as CounterLedger;
}

/** Public per-case view the dApp renders from the on-chain ledger. */
export interface OnChainCase {
  caseId: bigint;
  total: bigint;
  lastDisclosed: bigint;
  eventCount: bigint;
  phase: 'ACTIVE' | 'CLOSED';
  metadataHash: Uint8Array;
  creatorCommitment: Uint8Array;
}

export interface MidnightTraceLedgerView {
  cases: OnChainCase[];
  aggregate: bigint;
  memberCount: bigint;
  allowlistRoot: MerkleTreeDigest | null;
}

import { ledger as midnightTraceLedger } from '../contract/midnighttrace';

export function readMidnightTraceLedger(state: StateValue | ChargedState): MidnightTraceLedgerView {
  const l = midnightTraceLedger(state);
  const cases: OnChainCase[] = [];
  for (const [caseId, caseState] of l.cases) {
    // v1.0 compatibility: old ledger has no metadataHash
    const meta = (caseState as unknown as { metadataHash?: Uint8Array }).metadataHash ?? new Uint8Array(32);
    const cc = (caseState as unknown as { creatorCommitment?: Uint8Array }).creatorCommitment ?? new Uint8Array(32);
    cases.push({
      caseId,
      total: caseState.total,
      lastDisclosed: caseState.lastDisclosed,
      eventCount: caseState.eventCount,
      phase: caseState.phase === 0 ? 'ACTIVE' : 'CLOSED',
      metadataHash: meta,
      creatorCommitment: cc,
    });
  }
  cases.sort((a, b) => (a.caseId < b.caseId ? -1 : 1));
  return {
    cases,
    aggregate: l.aggregate,
    memberCount: l.memberCount,
    allowlistRoot: l.allowlist.root(),
  };
}