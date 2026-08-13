// Offline simulator for the midnighttrace contract.
//
// Runs the compiled Compact contract (contracts/managed/midnighttrace)
// directly against the compact-runtime circuit context — no network, no
// wallet, no proof server.
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
  type Case,
} from '../contracts/managed/midnighttrace/contract/index.js';
import { midnighttraceWitnesses } from './midnighttrace-witnesses.js';

export interface MidnightTraceSimulatorOptions {
  /** First authorized member. Defaults to an all-zero commitment. */
  ownerCommitment?: Uint8Array;
}

export class MidnightTraceSimulator {
  readonly contract: Contract;
  circuitContext: CircuitContext;

  constructor(options: MidnightTraceSimulatorOptions = {}) {
    const ownerCommitment = options.ownerCommitment ?? new Uint8Array(32);
    this.contract = new Contract(midnighttraceWitnesses);
    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState,
    } = this.contract.initialState(
      createConstructorContext({}, '0'.repeat(64)),
      ownerCommitment,
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

  public case(caseId: bigint): Case | undefined {
    const cases = this.getLedger().cases;
    if (!cases.member(caseId)) return undefined;
    return cases.lookup(caseId);
  }

  public memberCount(): bigint {
    return this.getLedger().memberCount;
  }

  public aggregate(): bigint {
    return this.getLedger().aggregate;
  }

  public openCase(caseId: bigint): void {
    this.circuitContext = this.contract.impureCircuits.openCase(
      this.circuitContext,
      caseId,
    ).context;
  }

  public grantAccess(newCommitment: Uint8Array, secret: Uint8Array): void {
    this.circuitContext = this.contract.impureCircuits.grantAccess(
      this.circuitContext,
      newCommitment,
      secret,
    ).context;
  }

  public logStep(caseId: bigint, amount: bigint, secret: Uint8Array): void {
    this.circuitContext = this.contract.impureCircuits.logStep(
      this.circuitContext,
      caseId,
      amount,
      secret,
    ).context;
  }

  public discloseFinding(caseId: bigint, amount: bigint, secret: Uint8Array): void {
    this.circuitContext = this.contract.impureCircuits.discloseFinding(
      this.circuitContext,
      caseId,
      amount,
      secret,
    ).context;
  }

  public closeCase(caseId: bigint, secret: Uint8Array): void {
    this.circuitContext = this.contract.impureCircuits.closeCase(
      this.circuitContext,
      caseId,
      secret,
    ).context;
  }
}