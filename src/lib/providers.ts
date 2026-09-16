import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import type { ConnectedAPI, ProvingProvider } from '@midnight-ntwrk/dapp-connector-api';
import { CostModel } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import type { ProofProvider, AnyProvableCircuitId, MidnightProviders } from '@midnight-ntwrk/midnight-js-types';

import { createWalletProvidersFromConnectedAPI } from './walletAdapter';
import type { ShieldedAddress } from './walletAdapter';

// Demo-only IndexedDB encryption for the browser's local private state (Level DB).
// This is NOT authentication and NOT production key management. Each browser's
// shielded state is encrypted at rest with this static demo password; the real
// privacy guarantee comes from the ZK circuit (amount/secret never leave the
// device nor land on-chain). Production would derive this from the wallet's
// seed or a user-supplied passphrase. Never log or display this value.
const PRIVATE_STATE_PASSWORD = 'MidnightTrace-demo-storage-password!';

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

  async function tryLocalFallback(unprovenTx: unknown, priorErr: unknown): Promise<unknown> {
    // Last resort: if wallet proving failed due to network, try local proof server
    // even when VITE_PROOF_SERVER_URI is not set. This is the `docker compose up -d proof-server` path.
    // We probe quickly with a short timeout so we don't hang if docker is not running.
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

  const proofProvider: ProofProvider = configuredProverUri
    ? httpClientProofProvider(configuredProverUri, zkConfigProvider)
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
                  if (isNetworkError) {
                    try {
                      return (await tryLocalFallback(unprovenTx, fallbackErr)) as never;
                    } catch {
                      // fall through to user-facing error
                    }
                  }
                  throw new Error(
                    `Proving failed via wallet and its prover (${String(fallbackErr)}). ` +
                      `Fix: run local proof server → docker compose up -d --wait proof-server, ` +
                      `set VITE_PROOF_SERVER_URI=${LOCAL_FALLBACK_URI} in .env, restart dev server. ` +
                      `Or enable Demo — no wallet (header toggle) to bypass proving. Underlying: ${String(err)}`,
                    { cause: fallbackErr },
                  );
                }
              }
              if (isNetworkError) {
                try {
                  return (await tryLocalFallback(unprovenTx, err)) as never;
                } catch {
                  // local fallback also unreachable
                }
                throw new Error(
                  `Wallet proving station unreachable (${String(err)}). ` +
                    `Fix: docker compose up -d --wait proof-server && set VITE_PROOF_SERVER_URI=${LOCAL_FALLBACK_URI} in .env then restart (npm run dev), ` +
                    `or switch to Lace (in-wallet proving), or use Demo — no wallet.`,
                  { cause: err },
                );
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

  const privateStateProvider = levelPrivateStateProvider({
    privateStoragePasswordProvider: () => PRIVATE_STATE_PASSWORD,
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