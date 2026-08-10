import { useCallback, useEffect, useRef, useState } from 'react';
import type { ConnectedAPI, InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { setNetworkId as setGlobalNetworkId, type NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import type { FoundContract } from '@midnight-ntwrk/midnight-js-contracts';

import { buildProvidersFromConnectedAPI } from '../lib/providers';
import type { CounterContract, CounterProviders } from '../lib/types';
import { findDeployedCounter } from '../lib/types';
import { CONTRACT_ADDRESS, NETWORK_ID } from '../config';
import { readCounterLedger } from '../lib/ledger';

export type WalletState =
  | { status: 'idle' }
  | { status: 'wallet-not-installed' }
  | { status: 'detected'; wallets: InitialAPI[] }
  | { status: 'connecting' }
  | { status: 'network-mismatch'; expected: string; actual: string }
  | { status: 'rejected' }
  | { status: 'connected' }
  | { status: 'error'; message: string };

export interface WalletInfo {
  address: string;
  walletName: string;
  networkId: string;
}

export function listWallets(): InitialAPI[] {
  const injected = (window as Window & { midnight?: Record<string, InitialAPI> }).midnight;
  if (!injected) return [];
  return Object.values(injected);
}

export function findFirstWallet(): InitialAPI | null {
  const wallets = listWallets();
  return wallets.length > 0 ? wallets[0] : null;
}

const CONNECT_TIMEOUT_MS = 20_000;

function withTimeout<T>(promise: Promise<T>, ms: number, what: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${what} timed out after ${ms / 1000}s — no response from the wallet extension.`));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

export function useMidnight() {
  const [walletState, setWalletState] = useState<WalletState>({ status: 'idle' });
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [connectedAPI, setConnectedAPI] = useState<ConnectedAPI | null>(null);
  const [contract, setContract] = useState<FoundContract<CounterContract> | null>(null);
  const [contractAddress, setContractAddress] = useState<string>(CONTRACT_ADDRESS);
  const [ledgerTotal, setLedgerTotal] = useState<bigint | null>(null);
  const [lastDisclosed, setLastDisclosed] = useState<bigint | null>(null);

  const providersRef = useRef<CounterProviders | null>(null);
  const connectedAPIRef = useRef<ConnectedAPI | null>(null);
  const contractRef = useRef<FoundContract<CounterContract> | null>(null);

  const isConnected = walletState.status === 'connected';

  useEffect(() => {
    const wallets = listWallets();
    if (wallets.length > 0) {
      setWalletState({ status: 'detected', wallets });
    } else {
      setWalletState({ status: 'wallet-not-installed' });
    }
  }, []);

  // Keep the global network id in sync for the Midnight.js runtime.
  useEffect(() => {
    try {
      setGlobalNetworkId(NETWORK_ID as NetworkId);
    } catch {
      // Invalid network id — ignored.
    }
  }, []);

  const refreshLedger = useCallback(async () => {
    const providers = providersRef.current;
    const deployed = contractRef.current;
    if (!providers || !deployed) return;
    const contractState = await providers.publicDataProvider.queryContractState(
      deployed.deployTxData.public.contractAddress,
    );
    if (!contractState) return;
    const ledger = readCounterLedger(contractState.data);
    setLedgerTotal(ledger.total);
    setLastDisclosed(ledger.lastDisclosed);
  }, []);

  const connect = useCallback(async () => {
    const wallet = findFirstWallet();
    if (!wallet) {
      setWalletState({ status: 'wallet-not-installed' });
      return;
    }

    setWalletState({ status: 'connecting' });
    try {
      const connected = await withTimeout(wallet.connect(NETWORK_ID), CONNECT_TIMEOUT_MS, 'Wallet connect');
      const config = await withTimeout(connected.getConfiguration(), CONNECT_TIMEOUT_MS, 'Wallet configuration');

      if (config.networkId !== NETWORK_ID) {
        setWalletState({ status: 'network-mismatch', expected: NETWORK_ID, actual: config.networkId });
        return;
      }

      const shielded = await connected.getShieldedAddresses();

      const providers = await buildProvidersFromConnectedAPI(connected, 'counter');
      providersRef.current = providers;

      const deployed = await findDeployedCounter(providers, CONTRACT_ADDRESS);
      contractRef.current = deployed;
      setContract(deployed);
      setContractAddress(CONTRACT_ADDRESS);

      connectedAPIRef.current = connected;
      setConnectedAPI(connected);

      setWalletInfo({
        address: shielded.shieldedAddress,
        walletName: wallet.name,
        networkId: config.networkId,
      });
      setWalletState({ status: 'connected' });

      await refreshLedger();
    } catch (e: unknown) {
      const err = e as Error & { code?: string; reason?: string };
      const reason = err?.reason ?? '';
      const message = err?.message ?? String(e);
      if (err?.code === 'Rejected' || /reject/i.test(reason + ' ' + message)) {
        setWalletState({ status: 'rejected' });
      } else {
        setWalletState({ status: 'error', message });
      }
      console.error('connect error', e);
    }
  }, [refreshLedger]);

  const disconnect = useCallback(() => {
    connectedAPIRef.current = null;
    contractRef.current = null;
    providersRef.current = null;
    setConnectedAPI(null);
    setContract(null);
    setWalletInfo(null);
    setLedgerTotal(null);
    setLastDisclosed(null);
    const wallets = listWallets();
    if (wallets.length > 0) {
      setWalletState({ status: 'detected', wallets });
    } else {
      setWalletState({ status: 'wallet-not-installed' });
    }
  }, []);

  const callCircuit = useCallback(async () => {
    const deployed = contractRef.current;
    if (!deployed) {
      throw new Error('Wallet not connected / contract not joined.');
    }
    const result = await deployed.callTx.increment(7n);
    await refreshLedger();
    const providers = providersRef.current;
    const contractState = providers
      ? await providers.publicDataProvider.queryContractState(deployed.deployTxData.public.contractAddress)
      : null;
    return {
      txId: result.public.txId,
      blockHeight: result.public.blockHeight,
      total: contractState ? readCounterLedger(contractState.data).total : null,
    };
  }, [refreshLedger]);

  return {
    walletState,
    walletInfo,
    connectedAPI,
    contract,
    contractAddress,
    ledgerTotal,
    lastDisclosed,
    isConnected,
    connect,
    disconnect,
    refreshLedger,
    callCircuit,
    providers: providersRef.current,
  };
}

export type UseMidnightReturn = ReturnType<typeof useMidnight>;