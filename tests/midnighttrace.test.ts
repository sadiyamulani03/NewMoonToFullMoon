// Unit tests for the midnighttrace smart contract (Level 4).
//
// These run against the compiled contract artifacts in
// contracts/managed/midnighttrace via the offline MidnightTraceSimulator —
// no wallet, no network, no proof server.
//
// Grouped so the suite covers:
//   - the privacy model (a hidden amount never lands in named public state)
//   - chain-of-custody (ordered, immutable event counter per case)
//   - selective disclosure (the deliberate disclose() flow)
//   - private allowlist (only ZK-verified members can mutate a case)
//   - multi-case isolation and aggregate reconciliation
//   - sealed integrity (closeCase makes a case immutable)
import { describe, it, expect } from 'vitest';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { MidnightTraceSimulator } from './midnighttrace-simulator.js';
import { testSecret, memberCommitment } from './midnighttrace-witnesses.js';

setNetworkId('undeployed');

const OWNER = testSecret(0);
const OWNER_COMMITMENT = memberCommitment(OWNER);

describe('MidnightTrace smart contract', () => {
  it('bootstraps the allowlist from the deploying owner', () => {
    const sim = new MidnightTraceSimulator({ ownerCommitment: OWNER_COMMITMENT });
    expect(sim.memberCount()).toEqual(1n);
    expect(sim.getLedger().cases.isEmpty()).toBe(true);
    expect(sim.aggregate()).toEqual(0n);
  });

  it('generates an empty, deterministic initial ledger between instances', () => {
    const a = new MidnightTraceSimulator({ ownerCommitment: OWNER_COMMITMENT });
    const b = new MidnightTraceSimulator({ ownerCommitment: OWNER_COMMITMENT });
    expect(a.getLedger().cases.isEmpty()).toEqual(b.getLedger().cases.isEmpty());
    expect(a.memberCount()).toEqual(b.memberCount());
    expect(a.aggregate()).toEqual(b.aggregate());
  });

  it('opens an independent case file with a zeroed public ledger', () => {
    const sim = new MidnightTraceSimulator({ ownerCommitment: OWNER_COMMITMENT });
    sim.openCase(1n);
    const caseState = sim.case(1n);
    expect(caseState).toBeDefined();
    expect(caseState!.total).toEqual(0n);
    expect(caseState!.lastDisclosed).toEqual(0n);
    expect(caseState!.eventCount).toEqual(0n);
    expect(caseState!.phase).toBe(0); // Phase.ACTIVE
  });

  it('does not open the same case twice', () => {
    const sim = new MidnightTraceSimulator({ ownerCommitment: OWNER_COMMITMENT });
    sim.openCase(1n);
    expect(() => sim.openCase(1n)).toThrow();
  });

  it('moves the case total by a hidden amount without publishing it (logStep)', () => {
    const sim = new MidnightTraceSimulator({ ownerCommitment: OWNER_COMMITMENT });
    sim.openCase(1n);
    const secret = 42n; // private witness of the step
    sim.logStep(1n, secret, OWNER);
    const caseState = sim.case(1n)!;
    expect(caseState.total).toEqual(42n);
    // The amount must not appear in any named public field:
    expect(caseState.lastDisclosed).toEqual(0n);
  });

  it('keeps the amount private across a mixed sequence (chain of custody)', () => {
    const sim = new MidnightTraceSimulator({ ownerCommitment: OWNER_COMMITMENT });
    sim.openCase(1n);
    sim.logStep(1n, 10n, OWNER);
    sim.logStep(1n, 5n, OWNER);
    sim.logStep(1n, 3n, OWNER);
    const caseState = sim.case(1n)!;
    expect(caseState.total).toEqual(18n);
    // Each step is an ordered, public on-chain event:
    expect(caseState.eventCount).toEqual(3n);
    // No step ever disclosed the amounts:
    expect(caseState.lastDisclosed).toEqual(0n);
  });

  it('deliberately publishes a specific finding via disclose() (discloseFinding)', () => {
    const sim = new MidnightTraceSimulator({ ownerCommitment: OWNER_COMMITMENT });
    sim.openCase(1n);
    sim.logStep(1n, 10n, OWNER); // private steps stay private
    sim.discloseFinding(1n, 7n, OWNER); // one deliberate disclosure
    const caseState = sim.case(1n)!;
    expect(caseState.total).toEqual(17n);
    // Only the deliberately published finding is public:
    expect(caseState.lastDisclosed).toEqual(7n);
    // The fully-private path never poisons lastDisclosed on later steps:
    sim.logStep(1n, 11n, OWNER);
    expect(sim.case(1n)!.lastDisclosed).toEqual(7n);
  });

  it('accepts only allowlisted investigators (private allowlist)', () => {
    const sim = new MidnightTraceSimulator({ ownerCommitment: OWNER_COMMITMENT });
    sim.openCase(1n);
    const intruder = testSecret(9);
    // Could not have real "fake secret" happen: the committee never registered the intruder.
    expect(() => sim.logStep(1n, 5n, intruder)).toThrow();
    sim.logStep(1n, 5n, OWNER); // the real member still works
    expect(sim.case(1n)!.total).toEqual(5n);
  });

  it('lets an authorized member admit a colleague without an identity leak (grantAccess)', () => {
    const sim = new MidnightTraceSimulator({ ownerCommitment: OWNER_COMMITMENT });
    sim.openCase(1n);
    const colleague = testSecret(1);
    sim.grantAccess(memberCommitment(colleague), OWNER);
    expect(sim.memberCount()).toEqual(2n);
    // The colleague can now log a forensic step under their own secret.
    sim.logStep(1n, 21n, colleague);
    expect(sim.case(1n)!.total).toEqual(21n);
  });

  it('refuses to grant access to someone who is not already a member', () => {
    const sim = new MidnightTraceSimulator({ ownerCommitment: OWNER_COMMITMENT });
    expect(() => sim.grantAccess(memberCommitment(testSecret(2)), testSecret(9))).toThrow();
    expect(sim.memberCount()).toEqual(1n);
  });

  it('keeps independent cases isolated while the aggregate reconciles', () => {
    const sim = new MidnightTraceSimulator({ ownerCommitment: OWNER_COMMITMENT });
    sim.openCase(1n);
    sim.openCase(2n);
    sim.logStep(1n, 10n, OWNER);
    sim.logStep(1n, 5n, OWNER);
    sim.logStep(2n, 4n, OWNER);
    const a = sim.case(1n)!;
    const b = sim.case(2n)!;
    expect(a.total).toEqual(15n);
    expect(b.total).toEqual(4n);
    expect(a.eventCount).toEqual(2n);
    expect(b.eventCount).toEqual(1n);
    // Public aggregate = sum of all (hidden) amounts — the auditor's anchor.
    expect(sim.aggregate()).toEqual(19n);
    expect(sim.aggregate()).toEqual(a.total + b.total);
  });

  it('seals a case so its integrity can never change (closeCase)', () => {
    const sim = new MidnightTraceSimulator({ ownerCommitment: OWNER_COMMITMENT });
    sim.openCase(1n);
    sim.logStep(1n, 12n, OWNER);
    sim.closeCase(1n, OWNER);
    const sealed = sim.case(1n)!;
    expect(sealed.phase).toBe(1); // Phase.CLOSED
    expect(sealed.eventCount).toEqual(2n); // closing is itself an audited event
    // A sealed report can be quoted as "current and unchanged".
    expect(sealed.total).toEqual(12n);
    expect(() => sim.logStep(1n, 9n, OWNER)).toThrow();
    expect(() => sim.closeCase(1n, OWNER)).toThrow();
    expect(sim.case(1n)!.total).toEqual(12n);
  });

  it('only stores allowlist commitments on-chain, never the members themselves', () => {
    const sim = new MidnightTraceSimulator({ ownerCommitment: OWNER_COMMITMENT });
    sim.openCase(1n);
    const secretBytes = Array.from(OWNER);
    // Nothing in the public ledger holds the member secret/identity values.
    const ledgerJson = JSON.stringify(sim.getLedger().cases);
    expect(ledgerJson).not.toContain(JSON.stringify(secretBytes));
    expect(ledgerJson.length).toBeGreaterThan(0);
  });
});