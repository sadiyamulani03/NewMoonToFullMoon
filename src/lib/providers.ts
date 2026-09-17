import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import type { ConnectedAPI, ProvingProvider } from '@midnight-ntwrk/dapp-connector-api';
import { CostModel } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import type { ProofProvider, AnyProvableCircuitId, MidnightProviders } from '@midnight-ntwrk/midnight-js-types';

import { createWalletProvidersFromConnectedAPI } from './walletAdapter';
import type { ShieldedAddress } from './walletAdapter';

// Private-state encryption: production uses wallet-derived password via
// signData (no seed extraction), demo retains static password.
// The static value is kept ONLY for Demo mode and for migration detection
// (existing users may have DB encrypted with it). Production path never
// uses it — it derives a per-wallet, per-account password by asking the
// wallet to sign a deterministic message (signData, keyType: unshielded).
// See docs/STARTUP_READINESS_PLAN.md Phase B for full design and
// recovery semantics.
export const DEMO_PRIVATE_STATE_PASSWORD = 'MidnightTrace-demo-storage-password!';
// Production derivation is implemented in `createPrivateStatePasswordProvider`
// below — it uses `connectedAPI.signData` so the seed never leaves the wallet.
// Never log or display the derived value.

/**
 * Public Midnight indexer endpoints per network. Some wallets (notably the
 * 1AM wallet) report their own ProofStation gateway as the indexer URI in
 * `getConfiguration()`. Those proxy endpoints require an API key and return
 * HTTP 401 to a DApp that does not hold one, which breaks every
 * `queryContractState` call. Since the DApp only needs public ledger data,
 * we remap the wallet-provided indexer URIs to the public Midnight indexer
 * for whatever network the wallet is connected to. Proving, balancing, and
 * submission remain delegated to the wallet itself.
 */
const PUBLIC_INDEXER_URIS: Record<string, { http: string; ws: string }> = {
  preprod: {
    http: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    ws: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
  },
  preview: {
    http: 'https://indexer.preview.midnight.network/api/v4/graphql',
    ws: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
  },
  mainnet: {
    http: 'https://indexer.mainnet.midnight.network/api/v4/graphql',
    ws: 'wss://indexer.mainnet.midnight.network/api/v4/graphql/ws',
  },
};

/**
 * Read-only public data provider for a network — no wallet, no private state.
 * Used by the Auditor page so any third party can pin the on-chain truths
 * (aggregate, per-case totals, allowlist root) of a deployed MidnightTrace
 * contract without holding a membership secret.
 */
export async function buildPublicDataProvider(networkId: string) {
  const uris = PUBLIC_INDEXER_URIS[networkId] ?? PUBLIC_INDEXER_URIS.preprod;
  return indexerPublicDataProvider(
    uris.http,
    uris.ws,
    // The browser's native WebSocket (see buildProvidersFromConnectedAPI).
    // @ts-expect-error ws's WebSocket constructor and the DOM WebSocket are
    // structurally different only in their static members, and the browser's
    // WebSocket is what we want here.
    WebSocket,
  );
}

function resolveIndexerUris(config: { networkId: string; indexerUri: string; indexerWsUri: string }) {
  const publicUris = PUBLIC_INDEXER_URIS[config.networkId];
  if (!publicUris) {
    return { indexerUri: config.indexerUri, indexerWsUri: config.indexerWsUri };
  }
  const isOneAmProxy =
    /^https?:\/\/[^/]*\.1am\.xyz/i.test(config.indexerUri) &&
    /\/api\/v4\/graphql/i.test(config.indexerUri);
  const isOneAmWsProxy = /wss?:\/\/[^/]*\.1am\.xyz/i.test(config.indexerWsUri);
  return {
    indexerUri: isOneAmProxy ? publicUris.http : config.indexerUri,
    indexerWsUri: isOneAmWsProxy ? publicUris.ws : config.indexerWsUri,
  };
}

/**
 * Build the full set of Midnight.js providers from a connected DApp
 * Connector wallet. Proof generation is delegated to the wallet's proving
 * provider first (proofs are produced locally in the browser/wallet). If the
 * wallet does not expose a proving provider, we fall back to the wallet's
 * configured proof server URI.
 */
/**
 * Create a private-state password provider that derives a stable, per-wallet
 * password via wallet `signData` (no seed extraction). The wallet signs a
 * deterministic message `MidnightTrace private-state v1:<shieldedAddress>:<networkId>`
 * with `keyType: unshielded` (deterministic for the wallet's unshielded key).
 * The signature hex is hashed (SHA-256) and formatted to satisfy
 * `validatePassword` (≥16 chars, 3 classes, no 3 identical, no sequential).
 * Cached in-memory for the session so we prompt only once; never persisted.
 * If `signData` is rejected/unsupported, we throw with a clear message — the
 * caller (`useMidnight`) surfaces it and offers Demo fallback.
 */
export async function createPrivateStatePasswordProvider(
  connectedAPI: ConnectedAPI,
  shieldedAddress: string,
  networkId: string,
): Promise<() => Promise<string>> {
  let cached: string | null = null;
  return async () => {
    if (cached) return cached;
    const message = `MidnightTrace private-state v1:${shieldedAddress}:${networkId}`;
    try {
      // Hint wallet that signData will be used (lets it pre-request permission)
      await connectedAPI.hintUsage(['signData']).catch(() => {});
      const sig = await connectedAPI.signData(message, { encoding: 'text', keyType: 'unshielded' });
      const sigHex: string = (sig as unknown as { signature: string }).signature ?? String(sig);
      // Hash signature to get uniform 32-byte hex, then format to pass validatePassword
      const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(sigHex));
      const hashHex = Array.from(new Uint8Array(hashBuf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      // Construct: Mt + 8 lower + - + 6 upper + !A1 + 6 lower + xQ => 16+ chars, 3+ classes
      // Example: Mt a3f9c2d1-4B8E2F!A1b9e4c7xQ (mixed case, digits, - and !)
      let pwd = `Mt${hashHex.slice(0, 8)}-${hashHex.slice(8, 14).toUpperCase()}!A1${hashHex.slice(14, 20)}xQ`;
      // Defensive: if somehow fails policy (extremely unlikely — hash is random), fallback
      try {
        const { validatePassword } = await import('@midnight-ntwrk/midnight-js-utils');
        validatePassword(pwd);
      } catch {
        pwd = `MidnightTrace-${hashHex.slice(0, 12)}!A1b2${hashHex.slice(12, 16).toUpperCase()}`;
      }
      cached = pwd;
      return pwd;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/reject/i.test(msg)) throw new Error(`Private-state key derivation was cancelled — signature rejected. You can use Demo mode or try again and approve the signature (no funds at risk).`);
      throw new Error(`Wallet does not support private-state signing (${msg}). Use Demo mode or a wallet that supports signData (Lace/IAM).`);
    }
  };
}

export async function buildProvidersFromConnectedAPI<Circuits extends AnyProvableCircuitId>(
  connectedAPI: ConnectedAPI,
  contractName: string,
): Promise<MidnightProviders<Circuits>> {
  const zkConfigBase = window.location.origin + '/contract/compiled/' + contractName;
  const zkConfigProvider = new FetchZkConfigProvider<Extract<Circuits, string>>(zkConfigBase, fetch.bind(window));

  const config = await connectedAPI.getConfiguration();

  const { indexerUri, indexerWsUri } = resolveIndexerUris(config);

  const publicDataProvider = indexerPublicDataProvider(
    indexerUri,
    indexerWsUri,
    // The browser's native WebSocket; isomorphic-ws's named export is missing
    // in the browser build, so pin the impl explicitly.
    // @ts-expect-error ws's WebSocket constructor and the DOM WebSocket are
    // structurally different only in their static members, and the browser's
    // WebSocket is what we want here.
    WebSocket,
  );

  // Preferred: the wallet generates the zero-knowledge proof in the browser.
  const provingProvider: ProvingProvider | null = await connectedAPI
    .getProvingProvider(zkConfigProvider.asKeyMaterialProvider())
    .catch(() => null);

  const costModel = CostModel.initialCostModel();

  // A proof server explicitly configured by the operator (e.g. a self-hosted
  // Midnight proof server, `npm run proof-server:start`) takes priority: many
  // connectors (e.g. 1AM) delegate proving to a cloud proving station this
  // dApp cannot reach without an API key, surfacing as "Proving check failed:
  // Failed to fetch". The wallet's in-wallet prover remains the default so the
  // connect flow never depends on a possibly-malformed wallet-reported URI.
  const configuredProverUri = (import.meta.env.VITE_PROOF_SERVER_URI as string | undefined)?.trim();

  const LOCAL_FALLBACK_URI = 'http://localhost:6300';

  // Host check — on Vercel/production, localhost is the user's machine, not the
  // server. Never try to fetch localhost in production.
  const isLocalHost =
    typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
  const effectiveConfiguredUri =
    configuredProverUri && configuredProverUri === LOCAL_FALLBACK_URI && !isLocalHost ? undefined : configuredProverUri;

  async function tryLocalFallback(unprovenTx: unknown, priorErr: unknown): Promise<unknown> {
    // Last resort: if wallet proving failed due to network, try local proof server
    // even when VITE_PROOF_SERVER_URI is not set. This is the `docker compose up -d proof-server` path.
    // In production (Vercel) localhost is never reachable — fail fast back to caller.
    if (!isLocalHost) return Promise.reject(priorErr);
    if (configuredProverUri === LOCAL_FALLBACK_URI) return Promise.reject(priorErr);
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 1200);
      await fetch(LOCAL_FALLBACK_URI, { method: 'GET', signal: controller.signal }).catch(() => {});
      clearTimeout(t);
    } catch {
      // probe is best-effort only
    }
    try {
      return await httpClientProofProvider(LOCAL_FALLBACK_URI, zkConfigProvider).proveTx(unprovenTx as never);
    } catch (e) {
      throw priorErr;
    }
  }

  // Resilient wrapper: configured URI gets first try, but falls back to
  // wallet in-wallet prover + wallet-reported prover + localhost. This
  // matters because Docker Desktop (proof-server) is often stopped or WSL
  // integration is off (`wsl --list` shows docker-desktop Stopped),
  // surfacing as plain `Failed to fetch`. We surface an actionable message.
  // On deployed hosts (Vercel, not localhost) a baked `http://localhost:6300`
  // can never be reached from the user's browser — detect that and prefer
  // wallet/Demo instead.

  function wrapWithFallback(primary: ProofProvider, label: string): ProofProvider {
    if (!provingProvider && !config.proverServerUri) return primary;
    return {
      async proveTx(unprovenTx: any) {
        try {
          return await primary.proveTx(unprovenTx as never);
        } catch (primaryErr: unknown) {
          const msg = String((primaryErr as Error)?.message ?? primaryErr);
          const isNetworkError =
            primaryErr instanceof TypeError ||
            /failed to fetch|networkerror|load failed|enotfound|econnreset|aborted|check.*returned an error/i.test(msg);
          if (!isNetworkError) throw primaryErr;
          // Try wallet in-wallet prover (Lace) if we started with a server
          if (provingProvider) {
            try {
              return await unprovenTx.prove(provingProvider, costModel);
            } catch {}
          }
          // Try wallet-reported prover URI (1AM cloud)
          if (config.proverServerUri && config.proverServerUri !== configuredProverUri) {
            try {
              return await httpClientProofProvider(config.proverServerUri, zkConfigProvider).proveTx(unprovenTx as never);
            } catch {}
          }
          // Try localhost fallback only when we are on localhost (Vercel can't reach user's localhost)
          if (isLocalHost && LOCAL_FALLBACK_URI !== configuredProverUri) {
            try {
              return await httpClientProofProvider(LOCAL_FALLBACK_URI, zkConfigProvider).proveTx(unprovenTx as never);
            } catch {}
          }
          const dockerHint = isLocalHost
            ? `Docker Desktop is not reachable at ${label} (${msg}). ` +
              `On Windows/WSL: 1) Start Docker Desktop, 2) Settings → Resources → WSL Integration → enable your distro (Ubuntu), 3) ` +
              `docker compose up -d --wait proof-server, 4) keep VITE_PROOF_SERVER_URI=${LOCAL_FALLBACK_URI} in .env and restart npm run dev. ` +
              `Preprod also works with your Midnight wallet (in-wallet proving, no server) — or toggle Demo — no wallet in the header for a wallet-free mock ledger.`
            : `Proving station unreachable from this deployed site (${label} → ${msg}). ` +
              `On Vercel/remote hosts http://localhost:6300 is your machine, not the server — use your supported Midnight wallet (in-wallet proving, no server needed) or toggle Demo — no wallet in the header for a wallet-free mock ledger. ` +
              `For local dev, run the proof server locally: docker compose up -d --wait proof-server with VITE_PROOF_SERVER_URI=${LOCAL_FALLBACK_URI}.`;
          throw new Error(dockerHint, { cause: primaryErr });
        }
      },
    };
  }

  // Safe debug logging (dev only) — helps trace which prover is selected and
  // whether localhost is being used. Never logs private keys/secrets.
  if (typeof window !== 'undefined' && (import.meta.env.DEV || (import.meta.env.VITE_DEBUG as string | undefined))) {
    console.debug('[MidnightTrace] prover selection', {
      isLocalHost,
      walletProverUri: config.proverServerUri ?? null,
      configuredProverUri: configuredProverUri ?? null,
      effectiveConfiguredUri: effectiveConfiguredUri ?? null,
      hasInWalletProver: !!provingProvider,
      selectedBranch: effectiveConfiguredUri ? 'configuredUri' : provingProvider ? 'inWalletProver' : config.proverServerUri ? 'walletReportedProver' : 'none',
      willUseLocalhostFallback: isLocalHost,
    });
  }

  const proofProvider: ProofProvider = effectiveConfiguredUri
    ? wrapWithFallback(httpClientProofProvider(effectiveConfiguredUri, zkConfigProvider), effectiveConfiguredUri)
    : provingProvider
      ? {
          async proveTx(unprovenTx: any) {
            try {
              return await unprovenTx.prove(provingProvider, costModel);
            } catch (err) {
              const isNetworkError =
                err instanceof TypeError ||
                (err instanceof Error &&
                  /failed to fetch|networkerror|network error|load failed|enotfound|econnreset|aborted|check.*returned an error/i.test(
                    err.message ?? '',
                  ));
              // 1) retry wallet-reported prover if available
              if (config.proverServerUri) {
                try {
                  return await httpClientProofProvider(config.proverServerUri, zkConfigProvider).proveTx(unprovenTx);
                } catch (fallbackErr) {
                  if (isNetworkError && isLocalHost) {
                    try {
                      return (await tryLocalFallback(unprovenTx, fallbackErr)) as never;
                    } catch {
                      // fall through to user-facing error
                    }
                  }
                  const deployedHint = isLocalHost
                    ? `Fix (local): docker compose up -d --wait proof-server && set VITE_PROOF_SERVER_URI=${LOCAL_FALLBACK_URI} in .env then restart (npm run dev). ` +
                      `Or use your supported Midnight wallet (in-wallet proving) or Demo — no wallet.`
                    : `Fix (deployed site): this host can't reach http://localhost:6300 — that is your browser's machine, not the server. Use your supported Midnight wallet (in-wallet proving, no server) or toggle Demo — no wallet. For local dev, run proof server locally.`;
                  throw new Error(
                    `Proving failed via wallet and its prover (${String(fallbackErr)}). ${deployedHint} Underlying check: ${String(err)}`,
                    { cause: fallbackErr },
                  );
                }
              }
              if (isNetworkError) {
                // Only try localhost fallback when on localhost (deployed Vercel shouldn't fetch user's localhost)
                if (isLocalHost) {
                  try {
                    return (await tryLocalFallback(unprovenTx, err)) as never;
                  } catch {
                    // local fallback also unreachable
                  }
                }
                const hint = isLocalHost
                  ? `Wallet proving station unreachable (${String(err)}). Fix: docker compose up -d --wait proof-server && set VITE_PROOF_SERVER_URI=${LOCAL_FALLBACK_URI} in .env then restart (npm run dev), or use your supported Midnight wallet (in-wallet proving), or use Demo — no wallet.`
                  : `Wallet proving station unreachable from deployed site (${String(err)}). Use your supported Midnight wallet (in-wallet proving, e.g. IAM Wallet) or toggle Demo — no wallet. http://localhost:6300 is only for local dev with Docker Desktop running.`;
                throw new Error(hint, { cause: err });
              }
              throw err;
            }
          },
        }
      : config.proverServerUri
        ? httpClientProofProvider(config.proverServerUri, zkConfigProvider)
        : (() => {
            throw new Error(
              'No proving infrastructure: wallet has no in-wallet prover and no prover URI. ' +
                `Start local proof server (docker compose up -d --wait proof-server) and set VITE_PROOF_SERVER_URI=${LOCAL_FALLBACK_URI} in .env, ` +
                'or use Demo — no wallet in the header.',
            );
          })();

  const shieldedAddress: ShieldedAddress = await connectedAPI.getShieldedAddresses();

  const { walletProvider, midnightProvider } = createWalletProvidersFromConnectedAPI(
    connectedAPI,
    shieldedAddress,
  );

  // Production private-state: wallet-derived via signData (per-user, per-account,
  // deterministic, never leaves device). Demo mode retains static password — see
  // docs/STARTUP_READINESS_PLAN.md Phase B.
  const privateStatePasswordProvider = await createPrivateStatePasswordProvider(
    connectedAPI,
    shieldedAddress.shieldedAddress,
    config.networkId,
  );
  const privateStateProvider = levelPrivateStateProvider({
    privateStoragePasswordProvider: privateStatePasswordProvider,
    accountId: shieldedAddress.shieldedAddress,
  });

  return {
    privateStateProvider,
    publicDataProvider,
    zkConfigProvider,
    proofProvider,
    walletProvider,
    midnightProvider,
  } as unknown as MidnightProviders<Circuits>;
}