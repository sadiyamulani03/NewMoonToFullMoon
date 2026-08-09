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
