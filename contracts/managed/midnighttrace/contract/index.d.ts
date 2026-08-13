import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum Phase { ACTIVE = 0, CLOSED = 1 }

export type Case = { total: bigint;
                     lastDisclosed: bigint;
                     eventCount: bigint;
                     phase: Phase
                   };

export type Witnesses<PS> = {
  findAuthPath(context: __compactRuntime.WitnessContext<Ledger, PS>,
               commitment_0: Uint8Array): [PS, { leaf: Uint8Array,
                                                 path: { sibling: { field: bigint
                                                                  },
                                                         goes_left: boolean
                                                       }[]
                                               }];
}

export type ImpureCircuits<PS> = {
  openCase(context: __compactRuntime.CircuitContext<PS>, caseId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  grantAccess(context: __compactRuntime.CircuitContext<PS>,
              newCommitment_0: Uint8Array,
              secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  logStep(context: __compactRuntime.CircuitContext<PS>,
          caseId_0: bigint,
          amount_0: bigint,
          secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  discloseFinding(context: __compactRuntime.CircuitContext<PS>,
                  caseId_0: bigint,
                  amount_0: bigint,
                  secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  closeCase(context: __compactRuntime.CircuitContext<PS>,
            caseId_0: bigint,
            secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  openCase(context: __compactRuntime.CircuitContext<PS>, caseId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  grantAccess(context: __compactRuntime.CircuitContext<PS>,
              newCommitment_0: Uint8Array,
              secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  logStep(context: __compactRuntime.CircuitContext<PS>,
          caseId_0: bigint,
          amount_0: bigint,
          secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  discloseFinding(context: __compactRuntime.CircuitContext<PS>,
                  caseId_0: bigint,
                  amount_0: bigint,
                  secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  closeCase(context: __compactRuntime.CircuitContext<PS>,
            caseId_0: bigint,
            secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  openCase(context: __compactRuntime.CircuitContext<PS>, caseId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  grantAccess(context: __compactRuntime.CircuitContext<PS>,
              newCommitment_0: Uint8Array,
              secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  logStep(context: __compactRuntime.CircuitContext<PS>,
          caseId_0: bigint,
          amount_0: bigint,
          secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  discloseFinding(context: __compactRuntime.CircuitContext<PS>,
                  caseId_0: bigint,
                  amount_0: bigint,
                  secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  closeCase(context: __compactRuntime.CircuitContext<PS>,
            caseId_0: bigint,
            secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  cases: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): Case;
    [Symbol.iterator](): Iterator<[bigint, Case]>
  };
  allowlist: {
    isFull(): boolean;
    checkRoot(rt_0: { field: bigint }): boolean;
    root(): __compactRuntime.MerkleTreeDigest;
    firstFree(): bigint;
    pathForLeaf(index_0: bigint, leaf_0: Uint8Array): __compactRuntime.MerkleTreePath<Uint8Array>;
    findPathForLeaf(leaf_0: Uint8Array): __compactRuntime.MerkleTreePath<Uint8Array> | undefined;
    history(): Iterator<__compactRuntime.MerkleTreeDigest>
  };
  readonly memberCount: bigint;
  readonly aggregate: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               ownerCommitment_0: Uint8Array): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
