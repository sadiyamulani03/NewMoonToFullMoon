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
    initialPrivateState: {},
  });
}

// ---------------------------------------------------------------------------
// MidnightTrace — Level 4 contract
// ---------------------------------------------------------------------------
import * as MidnightTraceOutput from '../contract/midnighttrace';
import { midnighttraceBrowserWitnesses } from './membership';

export type MidnightTraceContract = MidnightTraceOutput.Contract<any, MidnightTraceOutput.Witnesses<any>>;

export type MidnightTraceCircuits = ProvableCircuitId<MidnightTraceContract>;

export type MidnightTraceProviders = MidnightProviders<MidnightTraceCircuits>;

export const CompiledMidnightTraceContract = CompiledContract.make<MidnightTraceContract>(
  'midnighttrace',
  MidnightTraceOutput.Contract,
).pipe(
  CompiledContract.withWitnesses(midnighttraceBrowserWitnesses),
  CompiledContract.withCompiledFileAssets('./contract/compiled/midnighttrace'),
);

export async function findDeployedMidnightTrace(providers: MidnightTraceProviders, contractAddress: string) {
  return findDeployedContract(providers, {
    compiledContract: CompiledMidnightTraceContract,
    contractAddress,
    privateStateId: 'midnighttracePrivateState',
    initialPrivateState: {},
  });
}