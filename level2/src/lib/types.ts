import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';

import * as CompiledOutput from '../contract/index';
import type { ProvableCircuitId } from '@midnight-ntwrk/compact-js';
import type { MidnightProviders } from '@midnight-ntwrk/midnight-js-types';

export type CounterContract = CompiledOutput.Contract<undefined>;

export type CounterCircuits = ProvableCircuitId<CounterContract>;

export type CounterProviders = MidnightProviders<CounterCircuits>;

export const CompiledCounterContract = CompiledContract.make<CompiledOutput.Contract>(
  'counter',
  CompiledOutput.Contract,
).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets('./contract/compiled/counter'),
);

export function createSimpleContractInstance(): CounterContract {
  return new CompiledOutput.Contract({});
}

export async function findDeployedCounter(providers: CounterProviders, contractAddress: string) {
  return findDeployedContract(providers, {
    compiledContract: CompiledCounterContract,
    contractAddress,
    privateStateId: 'midnighttraceCounterPrivateState',
  });
}