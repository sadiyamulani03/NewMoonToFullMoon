import {
  type CoinPublicKey,
  type EncPublicKey,
  type FinalizedTransaction,
  Transaction,
  type Binding,
} from '@midnight-ntwrk/ledger-v8';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';

export function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToUint8Array(hex: string): Uint8Array {
  const cleaned = hex.replace(/^0x/, '');
  const matches = cleaned.match(/.{1,2}/g);
  if (!matches) return new Uint8Array();
  return new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
}

export interface ShieldedAddress {
  shieldedAddress: string;
  shieldedCoinPublicKey: string;
  shieldedEncryptionPublicKey: string;
}

export function createWalletProvidersFromConnectedAPI(
  connectedAPI: ConnectedAPI,
  shieldedAddress: ShieldedAddress,
) {
  const walletProvider = {
    getCoinPublicKey(): CoinPublicKey {
      return shieldedAddress.shieldedCoinPublicKey;
    },
    getEncryptionPublicKey(): EncPublicKey {
      return shieldedAddress.shieldedEncryptionPublicKey;
    },
    async balanceTx(tx: any) {
      const serialized = tx.serialize();
      const serializedStr = uint8ArrayToHex(serialized);
      const result = await connectedAPI.balanceUnsealedTransaction(serializedStr);
      const resultBytes = hexToUint8Array(result.tx);
      const deserializedTx = Transaction.deserialize('signature', 'proof', 'binding', resultBytes) as FinalizedTransaction;
      return deserializedTx;
    },
  };

  const midnightProvider = {
    async submitTx(tx: any): Promise<string> {
      const serialized = tx.serialize();
      const serializedStr = uint8ArrayToHex(serialized);
      await connectedAPI.submitTransaction(serializedStr);
      const txId = tx.identifiers()[0];
      return txId;
    },
  };

  return { walletProvider, midnightProvider };
}