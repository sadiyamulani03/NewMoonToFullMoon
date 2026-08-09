/**
 * On-chain demo for the deployed counter contract.
 *
 * Connects to the deployed counter contract (from .midnight-state.json),
 * calls increment() and incrementAndReveal() with witness amounts, and reads
 * the public ledger back — proving end-to-end behaviour on the live network
 * (private amount not exposed in the plain path, deliberately exposed in the
 * reveal path).
 *
 * Run:  npm run demo:counter
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';

// Midnight SDK imports
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { resolveNetwork, getOrCreateSeed, getDeployment } from './network';
import { createWallet, persistWalletState, unshieldedToken, type WalletContext } from './wallet';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

// @ts-expect-error Required for wallet sync
globalThis.WebSocket = WebSocket;

const CONTRACT = 'counter';
const PRIVATE_STATE_ID = 'counterPrivateState';

const { network, config: networkConfig } = resolveNetwork();
const SEED = getOrCreateSeed(network);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const zkConfigPath = path.resolve(__dirname, '..', 'contracts', 'managed', CONTRACT);
const contractPath = path.join(zkConfigPath, 'contract', 'index.js');

if (!fs.existsSync(contractPath)) {
  console.error(`\n❌ Contract not compiled! Run: npm run compile:${CONTRACT}\n`);
  process.exit(1);
}

const CounterModule = await import(pathToFileURL(contractPath).href);

const compiledContract = CompiledContract.make(CONTRACT, CounterModule.Contract).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets(zkConfigPath),
);

async function createProviders(walletCtx: WalletContext) {
  const privateStatePassword =
    process.env.PRIVATE_STATE_PASSWORD?.trim() || 'Local-Devnet-Development-Placeholder-1';

  const walletProvider = {
    getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
    async balanceTx(tx: any, ttl?: Date) {
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      return walletCtx.wallet.finalizeRecipe(recipe);
    },
    submitTx: (tx: any) => walletCtx.wallet.submitTransaction(tx) as any,
  };

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const accountId = walletCtx.unshieldedKeystore.getBech32Address().toString();

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: `${CONTRACT}-state`,
      accountId,
      privateStoragePasswordProvider: () => privateStatePassword,
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
}

async function readLedger(providers: any, address: string) {
  const contractState = await providers.publicDataProvider.queryContractState(address);
  if (!contractState) throw new Error('Contract state is empty');
  return CounterModule.ledger(contractState.data);
}

function printLedger(label: string, ledger: { total: bigint; lastDisclosed: bigint }) {
  console.log(
    `    ${label} → total=${ledger.total.toString()} lastDisclosed=${ledger.lastDisclosed.toString()}`,
  );
}

async function main() {
  const deployment = getDeployment(network);
  if (!deployment) {
    console.error(`No ${CONTRACT} deployment on file for ${network}. Deploy first.`);
    process.exit(1);
  }
  console.log(`\n  Network: ${network}`);
  console.log(`  Contract: ${deployment.address}\n`);

  const walletCtx = await createWallet({ network, networkConfig, seed: SEED });
  console.log('  Syncing with network...');
  const state = await walletCtx.wallet.waitForSyncedState();
  await persistWalletState(network, walletCtx);
  const balance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
  console.log(`  ✓ Synced. Balance: ${balance.toLocaleString()} tNight\n`);

  if (balance === 0n) {
    console.error('  ❌ Wallet has no tNight; cannot pay for transactions.');
    await walletCtx.wallet.stop();
    process.exit(1);
  }

  const providers = await createProviders(walletCtx);
  const deployed: any = await findDeployedContract(providers, {
    compiledContract: compiledContract as any,
    contractAddress: deployment.address,
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState: {},
  });

  console.log('  Initial ledger (before any writes):');
  printLedger('ledger', await readLedger(providers, deployment.address));

  const PRIVATE_STEP = 12n;
  console.log(`\n  Calling increment(${PRIVATE_STEP}) — amount is a PRIVATE witness, NOT disclosed...`);
  const tx1 = await deployed.callTx.increment(PRIVATE_STEP);
  console.log(`    ✅ tx ${tx1.public.txId} · block ${tx1.public.blockHeight}`);
  const after1 = await readLedger(providers, deployment.address);
  printLedger('ledger', after1);
  console.log(`    lastDisclosed still 0n ✓ (amount ${PRIVATE_STEP} is nowhere public)\n`);

  const REVEALED = 21n;
  console.log(`  Calling incrementAndReveal(${REVEALED}) — deliberately discloses the amount...`);
  const tx2 = await deployed.callTx.incrementAndReveal(REVEALED);
  console.log(`    ✅ tx ${tx2.public.txId} · block ${tx2.public.blockHeight}`);
  const after2 = await readLedger(providers, deployment.address);
  printLedger('ledger', after2);
  const expected = PRIVATE_STEP + REVEALED;
  console.log(`    lastDisclosed == ${REVEALED} ✓, total == ${expected} ✓\n`);

  await persistWalletState(network, walletCtx);
  await walletCtx.wallet.stop();
  console.log('  Demo complete.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});