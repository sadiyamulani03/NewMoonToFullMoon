import { ledger as compiledLedger } from '../contract/compiled/counter/contract/index.js';

import type { StateValue, ChargedState } from '@midnight-ntwrk/compact-runtime';

export interface CounterLedger {
  total: bigint;
  lastDisclosed: bigint;
}

export function readCounterLedger(state: StateValue | ChargedState): CounterLedger {
  return compiledLedger(state) as CounterLedger;
}