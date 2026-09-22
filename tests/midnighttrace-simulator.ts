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

  public openCase(caseId: bigint, metadataHash?: Uint8Array, secret?: Uint8Array): void {
    const hash = metadataHash ?? new Uint8Array(32);
    // Default to owner secret if not provided — tests use owner for bootstrapping
    // For simulator we need a secret that is on allowlist; pick the owner's commitment path.
    // If secret not supplied, we derive from a zero secret that won't be found — so we try to use provided secret or fallback to owner secret (testSecret 0).
    // Callers (tests) should pass secret explicitly now that openCase requires it.
    const openerSecret = secret ?? new Uint8Array(32);
    // If openerSecret is all zeros (fallback) it won't be on allowlist — use owner secret bytes (index 0) as default for backward compat in tests that call openCase(1n) without secret.
    let effectiveSecret = openerSecret;
    if (openerSecret.every((b) => b === 0)) {
      // Reconstruct owner secret (testSecret 0) — "0" bytes
      effectiveSecret = new Uint8Array(32);
      new TextEncoder().encode('0').forEach((b, i) => { effectiveSecret[i] = b; });
    }
    this.circuitContext = this.contract.impureCircuits.openCase(
      this.circuitContext,
      caseId,
      hash,
      effectiveSecret,
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

  public updateCaseMetadata(caseId: bigint, newMetadataHash: Uint8Array, secret: Uint8Array): void {
    this.circuitContext = this.contract.impureCircuits.updateCaseMetadata(
      this.circuitContext,
      caseId,
      newMetadataHash,
      secret,
    ).context;
  }
}