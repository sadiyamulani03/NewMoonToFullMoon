// Browser-side membership helpers for the midnighttrace allowlist.
//
// The on-chain allowlist stores only *commitments* — the persistent hash of a
// member's secret. Only the person holding the secret can prove membership in
// zero knowledge (that is exactly what the MidnightTrace circuit proves). This
// module derives a per-wallet secret deterministically (so a returning
// investigator keeps their standing in the allowlist), and exposes the same
// persistent hash the circuit uses on the JavaScript side.
import { persistentHash, Bytes32Descriptor } from '@midnight-ntwrk/compact-runtime';
import type { Witnesses as MidnightTraceWitnessesType } from '../contract/midnighttrace';

/** Persistent hash — the exact mirror of the circuit's `persistentHash<Bytes<32>>`. */
export function commitmentForSecret(secret: Uint8Array): Uint8Array {
  return persistentHash(Bytes32Descriptor, secret);
}

export function toHex(bytes: Uint8Array): string {
  let out = '';
  for (const b of bytes) out += b.toString(16).padStart(2, '0');
  return out;
}

export function fromHex(hex: string): Uint8Array {
  const clean = hex.replace(/^0x/i, '').trim();
  if (!/^[0-9a-fA-F]+$/.test(clean) || clean.length !== 64) {
    throw new Error('A commitment must be exactly 64 hex characters (32 bytes).');
  }
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

/**
 * Deterministic per-wallet member secret. Repeated visits derive the same
 * secret for the same wallet, so a granted commitment stays usable.
 */
export async function defaultMemberSecret(shieldedAddress: string): Promise<Uint8Array> {
  const material = new TextEncoder().encode(`midnighttrace:member:${shieldedAddress}`);
  const digest = await crypto.subtle.digest('SHA-256', material);
  return new Uint8Array(digest);
}

/**
 * Merkle-path witness used by the compiled contract in the browser. It
 * locates the caller's commitment in the current on-chain allowlist; that
 * path is private witness material the ZK circuit folds into a root check.
 */
export const midnighttraceBrowserWitnesses: MidnightTraceWitnessesType<any> = {
  findAuthPath: (context, commitment) => {
    const path = context.ledger.allowlist.findPathForLeaf(commitment);
    if (!path) {
      throw new Error('This wallet is not on the investigation allowlist (no matching commitment).');
    }
    return [context.privateState, path];
  },
};