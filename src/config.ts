/**
 * MidnightTrace — Level 2 configuration.
 *
 * The Preprod contract address is MANDATORY. Replace the placeholder below
 * with the midnighttrace contract address you deployed on Preprod in Level 1.
 * Currently set to the v1.2 local devnet deployment; Preprod deployment is
 * blocked by a wallet-SDK crash on `midnight:event[v9]` DUST events
 * (see https://github.com/midnightntwrk/midnight-wallet/issues/436).
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
 * Live Preprod contract address deployed on Midnight Preprod (Level 4).
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

/**
 * Public product profile — X (Twitter).
 * Centralized so reviewers never hit a stale hardcoded URL.
 * If the primary handle is suspended/under appeal, set VITE_X_PROFILE_URL
 * to the replacement handle (e.g. https://x.com/MidnightTrace_) and redeploy.
 * The UI surfaces handle + direct link + backup (GitHub/docs) to avoid
 * “invalid x profile link” rejections when X moderation flags the account.
 */
export const X_HANDLE = (import.meta.env.VITE_X_HANDLE as string | undefined) ?? 'MidnightTraceAp';
export const X_PROFILE_URL =
  (import.meta.env.VITE_X_PROFILE_URL as string | undefined) ?? `https://x.com/${X_HANDLE}`;
export const X_PROFILE_STATUS: 'live' | 'appeal' =
  (import.meta.env.VITE_X_PROFILE_STATUS as 'live' | 'appeal' | undefined) ?? 'live';
export const GITHUB_URL = 'https://github.com/sadiyamulani03/NewMoonToFullMoon';
export const DEMO_VIDEO_URL =
  'https://drive.google.com/file/d/1GzbWaAiR5OGbSrmPNTnla1CH2yEdAnCh/view?usp=sharing';
