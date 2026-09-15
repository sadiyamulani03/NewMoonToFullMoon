/**
 * MidnightTrace — Level 2 configuration.
 *
 * The Preprod contract address is MANDATORY. Replace the placeholder below
 * with the counter contract address you deployed on Preprod in Level 1.
 */
export const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS ??
  '03123eac1002b6268b357400033d4c440c165e68559bda54ba3de08c6d2549c1';

/**
 * Midnight network the dApp connects to via the Lace wallet.
 * The wallet must be switched to this network for the DApp Connector
 * connection to succeed.
 */
export const NETWORK_ID = (import.meta.env.VITE_NETWORK_ID ?? 'preprod') as 'preprod' | 'preview' | 'undeployed';

/**
 * Identifier under which this contract's private state is stored in the
 * browser's local IndexedDB (via the level private state provider).
 */
export const PRIVATE_STATE_ID = 'midnighttraceCounterPrivateState';

/**
 * MidnightTrace — Level 4 configuration.
 *
 * The two contract addresses are MANDATORY. The counter address was deployed
 * in Level 1/2; the midnighttrace address must be pasted after deploying the
 * Level 4 contract with `npm run deploy:midnighttrace` (Step 5).
 */
export const MIDNIGHTTRACE_CONTRACT_ADDRESS =
  import.meta.env.VITE_MIDNIGHTTRACE_CONTRACT_ADDRESS ??
  'df5e0583af7a3beca784ca0520b90614b2942f0daf76b37682868e766d129501';

/** Private state id used by the midnighttrace contract. */
export const MIDNIGHTTRACE_PRIVATE_STATE_ID = 'midnighttracePrivateState';

/**
 * The deployer-printed owner secret (hex 64 chars) from step 5. It boots the
 * on-chain allowlist, so it doubles as the dApp's first authorized member.
 */
export const MIDNIGHTTRACE_OWNER_SECRET =
  import.meta.env.VITE_MIDNIGHTTRACE_OWNER_SECRET ??
  '281062cf3798a205c766ba62020351b18f8af1388e896762dd6a57542006ee04';
