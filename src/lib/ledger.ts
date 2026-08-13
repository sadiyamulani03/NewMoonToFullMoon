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
    cases.push({
      caseId,
      total: caseState.total,
      lastDisclosed: caseState.lastDisclosed,
      eventCount: caseState.eventCount,
      phase: caseState.phase === 0 ? 'ACTIVE' : 'CLOSED',
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