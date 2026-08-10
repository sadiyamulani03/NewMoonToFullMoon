// Offline simulator for the counter contract.
//
// Runs the compiled Compact contract (contracts/managed/counter) directly
// against the compact-runtime circuit context — no network, no wallet, no
// proof server. The same pattern scales to much more complex contracts.
import {
  createCircuitContext,
  createConstructorContext,
  sampleContractAddress,
  type CircuitContext,
} from '@midnight-ntwrk/compact-runtime';
import {
  Contract,
  ledger,
  type Ledger,
} from '../contracts/managed/counter/contract/index.js';
import { type CounterPrivateState, witnesses } from './witnesses.js';

export class CounterSimulator {
  readonly contract: Contract<CounterPrivateState>;
  circuitContext: CircuitContext<CounterPrivateState>;

  constructor() {
    this.contract = new Contract<CounterPrivateState>(witnesses);
    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState,
    } = this.contract.initialState(
      createConstructorContext({}, '0'.repeat(64)),
    );
    this.circuitContext = createCircuitContext(
      sampleContractAddress(),
      currentZswapLocalState,
      currentContractState,
      currentPrivateState,
    );
  }

  public getLedger(): Ledger {
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public getPrivateState(): CounterPrivateState {
    return this.circuitContext.currentPrivateState;
  }

  public increment(amount: bigint): Ledger {
    this.circuitContext = this.contract.impureCircuits.increment(
      this.circuitContext,
      amount,
    ).context;
    return this.getLedger();
  }

  public incrementAndReveal(amount: bigint): Ledger {
    this.circuitContext = this.contract.impureCircuits.incrementAndReveal(
      this.circuitContext,
      amount,
    ).context;
    return this.getLedger();
  }
}
