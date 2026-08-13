// Shared witness functions, commitment helpers, and private-state type for
// the midnighttrace contract. Reused by both the unit-test simulator and the
// `src` helpers, so the written (circuit) hash always matches the one the
// tests apply on the TypeScript side.
import { persistentHash, Bytes32Descriptor } from '@midnight-ntwrk/compact-runtime';

/** Private state for the midnighttrace contract: it keeps none. */
export type MidnightTracePrivateState = Record<string, never>;

/**
 * Mirrors the circuit's `persistentHash<Bytes<32>>`: produces the 32-byte
 * commitment an investigator registers in the on-chain allowlist. Only the
 * person holding `secret` can later prove membership with it.
 */
export function memberCommitment(secret: Uint8Array): Uint8Array {
  return persistentHash(Bytes32Descriptor, secret);
}

/** Deterministic 32-byte secret for tests (zero-padded index). */
export function testSecret(index: number): Uint8Array {
  const bytes = new Uint8Array(32);
  new TextEncoder().encode(String(index)).forEach((b, i) => {
    bytes[i] = b;
  });
  return bytes;
}

/**
 * Merkle-path witness for the allowlist. The caller's client finds the path
 * for their commitment in the *current* on-chain tree; that path is private
 * witness material the ZK circuit uses to recompute the root and compare it
 * on-chain — never revealing which leaf the caller holds.
 */
export const midnighttraceWitnesses = {
  findAuthPath: (
    context: { ledger: { allowlist: { findPathForLeaf(leaf: Uint8Array): unknown } }; privateState: unknown },
    commitment: Uint8Array,
  ): [unknown, unknown] => {
    const path = context.ledger.allowlist.findPathForLeaf(commitment);
    if (!path) {
      throw new Error('commitment is not on the on-chain allowlist');
    }
    return [context.privateState, path];
  },
};