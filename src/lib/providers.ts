import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import type { ConnectedAPI, ProvingProvider } from '@midnight-ntwrk/dapp-connector-api';
import { CostModel } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import type { ProofProvider } from '@midnight-ntwrk/midnight-js-types';

import { createWalletProvidersFromConnectedAPI } from './walletAdapter';
import type { ShieldedAddress } from './walletAdapter';
import type { CounterCircuits, CounterProviders } from './types';

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
export async function buildProvidersFromConnectedAPI(
  connectedAPI: ConnectedAPI,
  contractName: string,
): Promise<CounterProviders> {
  const zkConfigBase = window.location.origin + '/contract/compiled/' + contractName;
  const zkConfigProvider = new FetchZkConfigProvider<CounterCircuits>(zkConfigBase, fetch.bind(window));

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

  const proofProvider: ProofProvider = configuredProverUri
    ? httpClientProofProvider(configuredProverUri, zkConfigProvider)
    : provingProvider
      ? {
          async proveTx(unprovenTx: any) {
            try {
              return await unprovenTx.prove(provingProvider, costModel);
            } catch (err) {
              // Wallet-internal proving can fail when its proving station is
              // unreachable (e.g. "Failed to fetch" on the wallet's `check`
              // step). If the wallet reported a prover server URI, retry
              // against it before giving up.
              const isNetworkError =
                err instanceof TypeError ||
                (err instanceof Error &&
                  /failed to fetch|networkerror|network error|load failed|enotfound|econnreset|aborted|check.*returned an error/i.test(
                    err.message ?? '',
                  ));
              if (config.proverServerUri) {
                try {
                  return await httpClientProofProvider(config.proverServerUri, zkConfigProvider).proveTx(unprovenTx);
                } catch (fallbackErr) {
                  throw new Error(
                    `The wallet could not reach its proving station (${String(err)}), and retrying ` +
                      `against the wallet-reported prover also failed (${String(fallbackErr)}). Start the ` +
                      `local proof server (npm run proof-server:start) and set ` +
                      `VITE_PROOF_SERVER_URI=http://localhost:6300 in .env, then restart the dev ` +
                      `server, or switch to a wallet that proves locally in the browser.`,
                    { cause: fallbackErr },
                  );
                }
              }
              if (isNetworkError) {
                throw new Error(
                  `The wallet could not reach its proving station (${String(err)}). Start the local ` +
                    `proof server (npm run proof-server:start) and set ` +
                    `VITE_PROOF_SERVER_URI=http://localhost:6300 in .env, then restart the dev ` +
                    `server, or switch to a wallet that proves locally in the browser.`,
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
              'No proving infrastructure available: the wallet exposed no in-wallet ' +
                'proving provider and no prover server URI is configured. Set ' +
                'VITE_PROOF_SERVER_URI (e.g. http://localhost:6300 for the local ' +
                'proof server) or use a wallet that supports in-wallet proving.',
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
  } as unknown as CounterProviders;
}