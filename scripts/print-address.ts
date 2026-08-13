// Offline address derivation — minimal imports, no wallet facade.
import { HDWallet, createKeystore, Roles } from '@midnight-ntwrk/wallet-sdk';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { loadState } from './network';

function addressFor(network: 'preprod' | 'preview'): string | null {
  const state = loadState();
  const seed = state?.wallets?.[network]?.seed;
  if (!seed) return null;
  setNetworkId(network);
  const hd = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
  if (hd.type !== 'seedOk') throw new Error('bad seed');
  const r = hd.hdWallet.selectAccount(0).selectRoles([Roles.NightExternal]).deriveKeysAt(0);
  if (r.type !== 'keysDerived') throw new Error('derivation failed');
  hd.hdWallet.clear();
  return createKeystore(r.keys[Roles.NightExternal], network).getBech32Address();
}

const preprod = addressFor('preprod');
const preview = addressFor('preview');
console.log(`preprod: ${preprod ?? 'no seed'}`);
console.log(`preview: ${preview ?? 'no seed'}`);