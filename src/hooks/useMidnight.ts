import { useCallback, useEffect, useRef, useState } from 'react';
import type { ConnectedAPI, InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { setNetworkId as setGlobalNetworkId, type NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import type { FoundContract } from '@midnight-ntwrk/midnight-js-contracts';

import { buildProvidersFromConnectedAPI } from '../lib/providers';
import type { CounterContract, CounterCircuits, CounterProviders } from '../lib/types';
import { findDeployedCounter } from '../lib/types';
import type { MidnightTraceContract, MidnightTraceCircuits, MidnightTraceProviders } from '../lib/types';
import { findDeployedMidnightTrace } from '../lib/types';
import type { MidnightTraceLedgerView } from '../lib/ledger';
import { readCounterLedger, readMidnightTraceLedger } from '../lib/ledger';
import { commitmentForSecret, defaultMemberSecret, fromHex, toHex } from '../lib/membership';
import { ledger as midnightTraceLedger } from '../contract/midnighttrace';
import { CONTRACT_ADDRESS, MIDNIGHTTRACE_CONTRACT_ADDRESS, MIDNIGHTTRACE_OWNER_SECRET, NETWORK_ID } from '../config';
import { isMobileDevice } from '../lib/device';

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

export type MembershipStatus = 'unknown' | 'member' | 'not-member';

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

  // MidnightTrace — Level 4
  const [midContract, setMidContract] = useState<FoundContract<MidnightTraceContract> | null>(null);
  const [midContractAddress, setMidContractAddress] = useState<string>(MIDNIGHTTRACE_CONTRACT_ADDRESS);
  const [midLedger, setMidLedger] = useState<MidnightTraceLedgerView | null>(null);
  const [membershipSecret, setMembershipSecret] = useState<Uint8Array | null>(null);
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus>('unknown');

  const providersRef = useRef<CounterProviders | null>(null);
  const midProvidersRef = useRef<MidnightTraceProviders | null>(null);
  const connectedAPIRef = useRef<ConnectedAPI | null>(null);
  const contractRef = useRef<FoundContract<CounterContract> | null>(null);
  const midContractRef = useRef<FoundContract<MidnightTraceContract> | null>(null);
  const membershipSecretRef = useRef<Uint8Array | null>(null);

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

  const refreshMidnight = useCallback(async () => {
    const providers = midProvidersRef.current;
    const deployed = midContractRef.current;
    const secret = membershipSecretRef.current;
    if (!providers || !deployed) return;
    const contractState = await providers.publicDataProvider.queryContractState(
      deployed.deployTxData.public.contractAddress,
    );
    if (!contractState) return;
    const view = readMidnightTraceLedger(contractState.data);
    setMidLedger(view);
    if (secret) {
      try {
        const committed = commitmentForSecret(secret);
        const liveLedger = midnightTraceLedger(contractState.data);
        setMembershipStatus(liveLedger.allowlist.findPathForLeaf(committed) ? 'member' : 'not-member');
      } catch {
        setMembershipStatus('unknown');
      }
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.allSettled([refreshLedger(), refreshMidnight()]);
  }, [refreshLedger, refreshMidnight]);

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

      const providers = await buildProvidersFromConnectedAPI<CounterCircuits>(connected, 'counter');
      providersRef.current = providers;

      const deployed = await findDeployedCounter(providers, CONTRACT_ADDRESS);
      contractRef.current = deployed;
      setContract(deployed);
      setContractAddress(CONTRACT_ADDRESS);

      // MidnightTrace (Level 4) uses its own compiled circuits, so build a
      // second provider set keyed to its artifacts. The wallet, network, and
      // private state backing are the same; only the ZK config paths differ.
      const midProviders = MIDNIGHTTRACE_CONTRACT_ADDRESS
        ? await buildProvidersFromConnectedAPI<MidnightTraceCircuits>(connected, 'midnighttrace')
        : null;
      midProvidersRef.current = midProviders;
      if (midProviders && MIDNIGHTTRACE_CONTRACT_ADDRESS) {
        try {
          const midDeployed = await findDeployedMidnightTrace(midProviders, MIDNIGHTTRACE_CONTRACT_ADDRESS);
          midContractRef.current = midDeployed;
          setMidContract(midDeployed);
          setMidContractAddress(MIDNIGHTTRACE_CONTRACT_ADDRESS);
        } catch (e) {
          console.error('midnighttrace join failed (is the Level 4 address configured?)', e);
        }
      }

      // Member secret: the deployer-printed owner secret wins when configured;
      // otherwise derive a stable per-wallet secret from the shielded address.
      let secret: Uint8Array | null = null;
      if (MIDNIGHTTRACE_OWNER_SECRET) {
        try {
          secret = fromHex(MIDNIGHTTRACE_OWNER_SECRET);
        } catch {
          secret = null;
        }
      }
      if (!secret) {
        secret = await defaultMemberSecret(shielded.shieldedAddress);
      }
      membershipSecretRef.current = secret;
      setMembershipSecret(secret);

      connectedAPIRef.current = connected;
      setConnectedAPI(connected);

      setWalletInfo({
        address: shielded.shieldedAddress,
        walletName: wallet.name,
        networkId: config.networkId,
      });
      setWalletState({ status: 'connected' });

      await Promise.allSettled([refreshLedger(), refreshMidnight()]);
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
  }, [refreshLedger, refreshMidnight]);

  const disconnect = useCallback(() => {
    connectedAPIRef.current = null;
    contractRef.current = null;
    providersRef.current = null;
    midContractRef.current = null;
    midProvidersRef.current = null;
    setConnectedAPI(null);
    setContract(null);
    setWalletInfo(null);
    setLedgerTotal(null);
    setLastDisclosed(null);
    setMidContract(null);
    setMidLedger(null);
    setMembershipSecret(null);
    setMembershipStatus('unknown');
    membershipSecretRef.current = null;
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

  // -------------------------------------------------------------------------
  // MidnightTrace circuits
  // -------------------------------------------------------------------------

  const requireMid = useCallback(async () => {
    const deployed = midContractRef.current;
    if (!deployed) {
      throw new Error(
        MIDNIGHTTRACE_CONTRACT_ADDRESS
          ? 'The MidnightTrace contract could not be joined. Check the console for the join error.'
          : 'No MidnightTrace contract address is configured yet. Deploy the Level 4 contract and set VITE_MIDNIGHTTRACE_CONTRACT_ADDRESS.',
      );
    }
    return deployed;
  }, []);

  const requireSecret = useCallback(async (): Promise<Uint8Array> => {
    let secret = membershipSecretRef.current;
    if (!secret) {
      secret = await defaultMemberSecret(walletInfo?.address ?? 'unconnected');
      membershipSecretRef.current = secret;
      setMembershipSecret(secret);
    }
    return secret;
  }, [walletInfo]);

  const callOpenCase = useCallback(
    async (caseId: bigint) => {
      const deployed = await requireMid();
      const result = await deployed.callTx.openCase(caseId);
      await refreshMidnight();
      return { txId: result.public.txId, blockHeight: result.public.blockHeight };
    },
    [requireMid, refreshMidnight],
  );

  const callGrantAccess = useCallback(
    async (newSecret: Uint8Array) => {
      const deployed = await requireMid();
      const secret = await requireSecret();
      const result = await deployed.callTx.grantAccess(commitmentForSecret(newSecret), secret);
      await refreshMidnight();
      return {
        txId: result.public.txId,
        blockHeight: result.public.blockHeight,
        commitment: toHex(commitmentForSecret(newSecret)),
      };
    },
    [requireMid, requireSecret, refreshMidnight],
  );

  const callLogStep = useCallback(
    async (caseId: bigint, amount: bigint) => {
      const deployed = await requireMid();
      const secret = await requireSecret();
      const result = await deployed.callTx.logStep(caseId, amount, secret);
      await refreshMidnight();
      return { txId: result.public.txId, blockHeight: result.public.blockHeight };
    },
    [requireMid, requireSecret, refreshMidnight],
  );

  const callDiscloseFinding = useCallback(
    async (caseId: bigint, amount: bigint) => {
      const deployed = await requireMid();
      const secret = await requireSecret();
      const result = await deployed.callTx.discloseFinding(caseId, amount, secret);
      await refreshMidnight();
      return { txId: result.public.txId, blockHeight: result.public.blockHeight };
    },
    [requireMid, requireSecret, refreshMidnight],
  );

  const callCloseCase = useCallback(
    async (caseId: bigint) => {
      const deployed = await requireMid();
      const secret = await requireSecret();
      const result = await deployed.callTx.closeCase(caseId, secret);
      await refreshMidnight();
      return { txId: result.public.txId, blockHeight: result.public.blockHeight };
    },
    [requireMid, requireSecret, refreshMidnight],
  );

  const applyOwnerSecret = useCallback((hex: string) => {
    const secret = fromHex(hex);
    membershipSecretRef.current = secret;
    setMembershipSecret(secret);
    void refreshMidnight();
  }, [refreshMidnight]);

  const memberCommitmentHex = membershipSecret ? toHex(commitmentForSecret(membershipSecret)) : null;
  const isOnAllowlist = membershipStatus === 'member';

  return {
    walletState,
    walletInfo,
    connectedAPI,
    contract,
    contractAddress,
    ledgerTotal,
    lastDisclosed,
    isConnected,
    isMobile: isMobileDevice(),
    connect,
    disconnect,
    refreshLedger,
    callCircuit,
    providers: providersRef.current,
    // MidnightTrace — Level 4
    midContract,
    midContractAddress,
    midLedger,
    membershipSecret,
    membershipStatus,
    memberCommitmentHex,
    isOnAllowlist,
    applyOwnerSecret,
    refreshMidnight,
    callOpenCase,
    callGrantAccess,
    callLogStep,
    callDiscloseFinding,
    callCloseCase,
  };
}

export type UseMidnightReturn = ReturnType<typeof useMidnight>;