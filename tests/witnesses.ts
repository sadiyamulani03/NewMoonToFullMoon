// Shared type and empty witness set for the counter contract.
//
// The counter contract takes its private data as circuit *arguments*
// (Uint<16> witnesses) rather than as off-chain witness callbacks, so the
// witness container stays empty.
export type CounterPrivateState = Record<string, never>;

export const witnesses = {};
