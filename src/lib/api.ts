export interface Receipt {
  txId: string;
  blockHeight: number;
  total: string;
  network: string;
  /** Which circuit produced this receipt: logStep, discloseFinding, or closeCase. */
  stepType?: 'logStep' | 'discloseFinding' | 'closeCase';
  /** On-chain case index (Uint<16> key) this receipt belongs to. */
  caseIndex?: number;
  createdAt: string;
}

export interface ForensicCase {
  id: string;
  title: string;
  description: string;
  owner: string;
  status: 'open' | 'closed';
  createdAt: string;
  receipts: Receipt[];
}

export interface Stats {
  totalCases: number;
  openCases: number;
  totalProofs: number;
  lastReceipt: Receipt | null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function getStats(): Promise<Stats> {
  return request<Stats>('/api/stats');
}

export function listCases(): Promise<ForensicCase[]> {
  return request<ForensicCase[]>('/api/cases');
}

export function getCase(id: string): Promise<ForensicCase> {
  return request<ForensicCase>(`/api/cases/${id}`);
}

export function createCase(input: { title: string; description: string; owner?: string }): Promise<ForensicCase> {
  return request<ForensicCase>('/api/cases', { method: 'POST', body: JSON.stringify(input) });
}

export function addReceipt(
  id: string,
  input: {
    txId: string;
    blockHeight: number | bigint;
    total: bigint | string;
    network?: string;
    stepType?: 'logStep' | 'discloseFinding' | 'closeCase';
    caseIndex?: number | bigint;
  },
): Promise<Receipt> {
  return request<Receipt>(`/api/cases/${id}/receipts`, {
    method: 'POST',
    body: JSON.stringify({
      txId: input.txId,
      blockHeight: Number(input.blockHeight),
      total: input.total.toString(),
      network: input.network ?? 'preprod',
      stepType: input.stepType ?? 'logStep',
      caseIndex: input.caseIndex === undefined ? undefined : Number(input.caseIndex),
    }),
  });
}

export function setCaseStatus(id: string, status: 'open' | 'closed'): Promise<ForensicCase> {
  return request<ForensicCase>(`/api/cases/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function exportCaseReceipts(caseItem: ForensicCase): string {
  const rows = caseItem.receipts
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((r) => ({
      case: caseItem.id,
      title: caseItem.title,
      stepType: r.stepType ?? 'logStep',
      caseIndex: r.caseIndex ?? 0,
      txId: r.txId,
      blockHeight: r.blockHeight,
      network: r.network,
      total: r.total,
      recordedAt: r.createdAt,
    }));
  return JSON.stringify(
    { event: 'midnighttrace-receipt-export', exportedAt: new Date().toISOString(), receipts: rows },
    null,
    2,
  );
}