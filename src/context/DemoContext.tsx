import { createContext, useContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ForensicCase, Receipt } from '../lib/api';
import type { MidnightTraceLedgerView, OnChainCase } from '../lib/ledger';

const STORAGE_KEY = 'midnighttrace-demo-enabled';

function makeTxId(): string {
  return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

function nowIso(): string {
  return new Date().toISOString();
}

const MOCK_INITIAL_CASES: ForensicCase[] = [
  {
    id: 'demo-7',
    title: 'Case #7 — Hidden batches',
    description: 'Demo: three hidden batches proved without revealing batch sizes.',
    owner: 'demo@midnighttrace',
    status: 'open',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    receipts: [
      {
        txId: makeTxId(),
        blockHeight: 412310,
        total: '0',
        network: 'demo',
        stepType: 'logStep',
        caseIndex: 7,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      },
      {
        txId: makeTxId(),
        blockHeight: 412315,
        total: '42',
        network: 'demo',
        stepType: 'logStep',
        caseIndex: 7,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      },
      {
        txId: makeTxId(),
        blockHeight: 412320,
        total: '42',
        network: 'demo',
        stepType: 'discloseFinding',
        caseIndex: 7,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
    ],
  },
  {
    id: 'demo-12',
    title: 'Case #12 — Audit sample',
    description: 'Demo: single step, already disclosed for Audit view.',
    owner: 'demo@midnighttrace',
    status: 'open',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    receipts: [
      {
        txId: makeTxId(),
        blockHeight: 412400,
        total: '15',
        network: 'demo',
        stepType: 'logStep',
        caseIndex: 12,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      },
    ],
  },
];

function buildMockLedger(cases: ForensicCase[]): MidnightTraceLedgerView {
  const map = new Map<number, OnChainCase>();
  for (const c of cases) {
    for (const r of c.receipts) {
      const idx = r.caseIndex ?? 7;
      if (!map.has(idx)) {
        map.set(idx, {
          caseId: BigInt(idx),
          total: 0n,
          lastDisclosed: 0n,
          eventCount: 0n,
          phase: c.status === 'closed' ? 'CLOSED' : 'ACTIVE',
          metadataHash: new Uint8Array(32),
          creatorCommitment: new Uint8Array(32),
        });
      }
    }
    // Ensure every ForensicCase id that looks like demo-7 has ledger entry
    const maybeIdx = c.receipts[0]?.caseIndex;
    if (maybeIdx !== undefined && !map.has(maybeIdx)) {
      map.set(maybeIdx, {
        caseId: BigInt(maybeIdx),
        total: 0n,
        lastDisclosed: 0n,
        eventCount: 0n,
        phase: c.status === 'closed' ? 'CLOSED' : 'ACTIVE',
        metadataHash: new Uint8Array(32),
        creatorCommitment: new Uint8Array(32),
      });
    }
  }
  // Derive totals from receipts count logic: logStep adds hidden  amount simulated as 20/22 etc,
  // For demo we store totals as simple incremental simulation
  for (const [idx, entry] of map) {
    const relatedReceipts = cases.flatMap((c) => c.receipts.filter((r) => (r.caseIndex ?? 7) === idx));
    // total = number of logStep * 20-ish + disclose keeps lastDisclosed
    const logSteps = relatedReceipts.filter((r) => r.stepType === 'logStep').length;
    const lastDisclose = [...relatedReceipts].reverse().find((r) => r.stepType === 'discloseFinding');
    entry.eventCount = BigInt(relatedReceipts.length);
    // Use a deterministic demo total: 42 for case 7, 15 for 12, otherwise logSteps*10
    if (idx === 7) entry.total = cPhaseTotal(cases, idx);
    else if (idx === 12) entry.total = cPhaseTotal(cases, idx);
    else entry.total = BigInt(logSteps * 10);
    entry.lastDisclosed = lastDisclose ? BigInt(lastDisclose.total) : 0n;
    const owningCase = cases.find((c) => c.receipts.some((r) => (r.caseIndex ?? 7) === idx));
    if (owningCase) entry.phase = owningCase.status === 'closed' ? 'CLOSED' : 'ACTIVE';
  }
  // Ensure ledger has at least entries for cases without receipts (openCase only)
  for (const c of cases) {
    if (c.receipts.length === 0) {
      const idx = Number(c.id.replace('demo-', '')) || 99;
      if (!map.has(idx)) {
        map.set(idx, {
          caseId: BigInt(idx),
          total: 0n,
          lastDisclosed: 0n,
          eventCount: 0n,
          phase: c.status === 'closed' ? 'CLOSED' : 'ACTIVE',
          metadataHash: new Uint8Array(32),
          creatorCommitment: new Uint8Array(32),
        });
      }
    }
  }

  const list = Array.from(map.values()).sort((a, b) => (a.caseId < b.caseId ? -1 : 1));
  const aggregate = list.reduce((a, c) => a + c.total, 0n);
  return {
    cases: list,
    aggregate,
    memberCount: 2n,
    allowlistRoot: null,
  };
}

function cPhaseTotal(cases: ForensicCase[], idx: number): bigint {
  if (idx === 7) {
    const c = cases.find((x) => x.id === 'demo-7');
    if (!c) return 42n;
    // derive from receipts: count logSteps
    const n = c.receipts.filter((r) => r.stepType === 'logStep').length;
    // start 42 for initial 2 logSteps, then + amount simulation
    if (n <= 2) return 42n;
    return 42n + BigInt((n - 2) * 15);
  }
  if (idx === 12) {
    const c = cases.find((x) => x.id === 'demo-12');
    if (!c) return 15n;
    const n = c.receipts.filter((r) => r.stepType === 'logStep').length;
    if (n <= 1) return 15n;
    return 15n + BigInt((n - 1) * 10);
  }
  return 0n;
}

export interface DemoContextValue {
  isDemo: boolean;
  mockCases: ForensicCase[];
  mockLedger: MidnightTraceLedgerView;
  enableDemo: () => void;
  disableDemo: () => void;
  toggleDemo: () => void;
  demoLogStep: (caseId: bigint, amount: bigint, forensicId: string) => void;
  demoDisclose: (caseId: bigint, amount: bigint, forensicId: string) => void;
  demoClose: (caseId: bigint, forensicId: string) => void;
  demoOpenCase: (caseId: bigint, title: string, description: string) => string;
  getDemoCase: (id: string) => ForensicCase | undefined;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemo, setIsDemo] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [mockCases, setMockCases] = useState<ForensicCase[]>(() => {
    try {
      const raw = localStorage.getItem('midnighttrace-demo-cases');
      if (raw) return JSON.parse(raw) as ForensicCase[];
    } catch { /* ignore */ }
    return MOCK_INITIAL_CASES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, isDemo ? '1' : '0');
    } catch { /* ignore */ }
  }, [isDemo]);

  useEffect(() => {
    try {
      localStorage.setItem('midnighttrace-demo-cases', JSON.stringify(mockCases));
    } catch { /* ignore */ }
  }, [mockCases]);

  const mockLedger = useMemo(() => buildMockLedger(mockCases), [mockCases]);

  const enableDemo = useCallback(() => setIsDemo(true), []);
  const disableDemo = useCallback(() => setIsDemo(false), []);
  const toggleDemo = useCallback(() => setIsDemo((v) => !v), []);

  const demoOpenCase = useCallback((caseId: bigint, title: string, description: string): string => {
    const idx = Number(caseId);
    const id = `demo-${idx}-${Date.now()}`;
    const newCase: ForensicCase = {
      id,
      title: title || `Case #${idx}`,
      description: description || `Demo case #${idx}`,
      owner: 'demo@midnighttrace',
      status: 'open',
      createdAt: nowIso(),
      receipts: [
        {
          txId: makeTxId(),
          blockHeight: 500000 + Math.floor(Math.random() * 10000),
          total: '0',
          network: 'demo',
          stepType: 'logStep',
          caseIndex: idx,
          createdAt: nowIso(),
        },
      ],
    };
    setMockCases((prev) => [...prev, newCase]);
    return id;
  }, []);

  const demoLogStep = useCallback((caseId: bigint, _amount: bigint, forensicId: string) => {
    const idx = Number(caseId);
    setMockCases((prev) =>
      prev.map((c) => {
        if (c.id !== forensicId) return c;
        const next: Receipt = {
          txId: makeTxId(),
          blockHeight: 500000 + Math.floor(Math.random() * 10000),
          total: '0',
          network: 'demo',
          stepType: 'logStep',
          caseIndex: idx,
          createdAt: nowIso(),
        };
        return { ...c, receipts: [...c.receipts, next] };
      }),
    );
  }, []);

  const demoDisclose = useCallback((caseId: bigint, amount: bigint, forensicId: string) => {
    const idx = Number(caseId);
    setMockCases((prev) =>
      prev.map((c) => {
        if (c.id !== forensicId) return c;
        const next: Receipt = {
          txId: makeTxId(),
          blockHeight: 500000 + Math.floor(Math.random() * 10000),
          total: amount.toString(),
          network: 'demo',
          stepType: 'discloseFinding',
          caseIndex: idx,
          createdAt: nowIso(),
        };
        return { ...c, receipts: [...c.receipts, next] };
      }),
    );
  }, []);

  const demoClose = useCallback((caseId: bigint, forensicId: string) => {
    const idx = Number(caseId);
    setMockCases((prev) =>
      prev.map((c) => {
        if (c.id !== forensicId) return c;
        const next: Receipt = {
          txId: makeTxId(),
          blockHeight: 500000 + Math.floor(Math.random() * 10000),
          total: '0',
          network: 'demo',
          stepType: 'closeCase',
          caseIndex: idx,
          createdAt: nowIso(),
        };
        return { ...c, status: 'closed' as const, receipts: [...c.receipts, next] };
      }),
    );
  }, []);

  const getDemoCase = useCallback((id: string) => mockCases.find((c) => c.id === id), [mockCases]);

  const value: DemoContextValue = {
    isDemo,
    mockCases,
    mockLedger,
    enableDemo,
    disableDemo,
    toggleDemo,
    demoLogStep,
    demoDisclose,
    demoClose,
    demoOpenCase,
    getDemoCase,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used within DemoProvider');
  return ctx;
}
