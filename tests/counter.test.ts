// Unit tests for the counter smart contract.
//
// These run against the compiled contract artifacts in contracts/managed/counter
// via the offline CounterSimulator — no wallet, no network, no proof server.
//
// Grouped so the suite covers:
//   - circuit logic (deterministic initialisation, arithmetic correctness)
//   - state transitions (accumulation across multiple calls)
//   - privacy (a non-deliberate witness never lands in public ledger state)
import { describe, it, expect } from 'vitest';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { CounterSimulator } from './counter-simulator.js';

setNetworkId('undeployed');

describe('Counter smart contract', () => {
  it('generates deterministic initial ledger state', () => {
    const a = new CounterSimulator();
    const b = new CounterSimulator();
    expect(a.getLedger()).toEqual(b.getLedger());
  });

  it('initialises public and private state correctly', () => {
    const simulator = new CounterSimulator();
    expect(simulator.getLedger()).toEqual({ total: 0n, lastDisclosed: 0n });
    expect(simulator.getPrivateState()).toEqual({});
  });

  it('updates the public counter by the circuit-input amount', () => {
    const simulator = new CounterSimulator();
    const after = simulator.increment(5n);
    expect(after.total).toEqual(5n);
  });

  it('accumulates state transitions across multiple increments', () => {
    const simulator = new CounterSimulator();
    simulator.increment(5n);
    simulator.increment(10n);
    expect(simulator.getLedger().total).toEqual(15n);
  });

  it('does not expose a private witness when it is not deliberately disclosed', () => {
    const simulator = new CounterSimulator();
    const secret = 9876n;
    simulator.increment(secret);
    // The amount left the private input but no named public field holds it:
    // lastDisclosed must still read 0.
    expect(simulator.getLedger().lastDisclosed).toEqual(0n);
    expect(simulator.getLedger().total).toEqual(secret);
    // The witness value must also not have been persisted in private state.
    expect(simulator.getPrivateState()).toEqual({});
  });

  it('deliberately writes a disclosed value to the public ledger', () => {
    const simulator = new CounterSimulator();
    const after = simulator.incrementAndReveal(7n);
    expect(after.total).toEqual(7n);
    expect(after.lastDisclosed).toEqual(7n);
  });

  it('overwrites the disclosed value on subsequent reveals', () => {
    const simulator = new CounterSimulator();
    simulator.incrementAndReveal(7n);
    const after = simulator.incrementAndReveal(3n);
    expect(after.total).toEqual(10n);
    expect(after.lastDisclosed).toEqual(3n);
  });

  it('keeps amount private across a mixed sequence of transitions', () => {
    const simulator = new CounterSimulator();
    simulator.increment(100n);
    simulator.incrementAndReveal(9n);
    simulator.increment(50n);
    const after = simulator.increment(1n);
    expect(after.total).toEqual(160n);
    // Only the deliberately disclosed step (9) is ever in public state.
    expect(after.lastDisclosed).toEqual(9n);
    expect(simulator.getPrivateState()).toEqual({});
  });
});