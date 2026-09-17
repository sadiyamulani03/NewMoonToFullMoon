# Transaction Reliability — MidnightTrace (Phase D)

**Status:** Implemented for existing flows (openCase, logStep, discloseFinding, closeCase, grantAccess). **No contract changes** — idempotency via `caseId` uniqueness (`midnighttrace.compact:90`).

## 1. Lifecycle audited
```
User action (Run/Open) → validateAmount/caseId → check isConnected/membership → busy=true, txState=preparing → busyStage=proving → callOpenCase/callLogStep (wallet → private-state → proof → balance → submit) → onLanded(addReceipt) → refreshLedger/refreshMidnight → txState=success → busy=false
```
Failure branches: wallet disconnected, not-member, allowlist unknown → early return with `msg` (no tx). `call*` throws → catch → `msg`/`msgTechnical` + `txState=failed/cancelled/timeout` → `busy=false`. Demo path (`isDemo`) bypasses provider/prover entirely (`demoLogStep`).

## 2. Explicit states
`src/pages/CaseDetail.tsx:22` `TxState = 'idle'|'preparing'|'awaiting_wallet'|'proving'|'submitting'|'confirming'|'success'|'cancelled'|'failed'|'timeout'`
`busyStage: 'proof'|'submit'` retained for `TxProgress` bar. `txState` drives user text:
- preparing — `Preparing secure proof…`
- proving — `Generating proof…` (wallet popup)
- submitting — `Submitting transaction…`
- confirming — `Waiting for Preprod confirmation…`
- success — `✓ Proof verified — receipt filed`
- cancelled — `Wallet declined…`
- failed/timeout — specific prover/network messages

## 3. False-success eliminated
- Success msg set **only after** `await onLanded` + `await refreshMidnight` (which queries `publicDataProvider.queryContractState`). No fake `lastProof` until `call*` returns `txId/blockHeight`.
- Demo `mockTx` is explicitly `Demo — not on-chain` and never `addReceipt` with real chain.
- Case sealing: `stamp Sealed` shown only after `onChainCase.phase === CLOSED` (queried ledger), not local `caseItem.status`.

## 4. Retry / idempotency
| Operation | Safe retry | Reason |
|-----------|------------|--------|
| `proof` (ZK) | Yes | No chain mutation yet |
| `wallet connect` | Yes | Idempotent |
| `read query` | Yes | No mutation |
| `submit` (`openCase` etc.) | **No — must analyze** | `openCase` asserts `!cases.member(caseId)` → duplicate `caseId` fails `Case already exists`; `logStep` would double-count `total`/`aggregate` if retried with same `amount` — not idempotent |
| `confirm/poll` | Yes | Read-only |

**Frontend policy:** Disable primary button while `busy` (`disabled={busy}` + `isConnectingRef` for wallet), restore after `success/failed`. Do **not** auto-retry `submit` on uncertain outcome. Store last `txId` in `lastProof` and `sessionStorage: midnighttrace:lastTx:{caseId}` for recovery (see §6). Duplicate `caseId` on retry surfaces `Case already exists` — user must pick new `caseId` (UI shows `Next free #`).

## 5. Browser refresh / recovery
- During `proving`/`submitting`: in-memory `unprovenTx` is lost — no recovery without `txId`. UI shows `busy` overlay; refresh clears it → user sees no stale success.
- After `submit` returns `txId`: `onLanded` writes `addReceipt` to `/api/cases` (Vercel Blob or `/tmp`) + `setCaseStatus` for close. If refresh occurs after `txId` but before confirmation, recovery via `refreshMidnight` on reload (polls `queryContractState` for `caseId`) — public `total/eventCount` will reflect new state; user can verify via `/audit?case=<id>` and `Ledger history` (persisted receipts).
- If `txId` response lost (frontend crash after wallet signs but before `onLanded`): transaction may still be included. Recovery: manual `/audit?case=<id>` check or `Recent Evidence` table (reads `cases` from API + ledger). No automatic resubmit.

## 6. Wallet lifecycle
- `useMidnight.ts:96` poll 5s for `window.midnight`, `waitForWalletReady 3500ms`, `isConnectingRef` prevents double connect.
- `disconnect` clears `providersRef/midProvidersRef/membershipSecretRef` and resets `walletState`.
- Account change: `accountId: shieldedAddress` scopes LevelDB partition; changing wallet → new `shieldedAddress` → new derived password (`signData` over new address) → isolated private state. Old state remains under old `accountId` (not exposed). UI detects `membershipStatus` via `allowlist.findPathForLeaf` after `refreshMidnight`.
- Network mismatch → `network-mismatch` state with `Retry after switching`.
- Private-state `signData` rejection → `private-state` error with Demo fallback.

## 7. Prover failures
Integrated with `src/lib/providers.ts` environment-aware prover (local `http://localhost:6300` only if `isLocalHost`, production requires `https://` prover or Lace in-wallet). Distinct messages in `CaseDetail.tsx:129-140`:
- `wallet disconnected` → `Connect wallet or enable Demo`
- `wallet rejected` → `Wallet declined — nothing was submitted`
- `prover unavailable` (localhost vs hosted) → `Local proof service is unavailable…` with env-specific hint
- `timeout` → `Wallet didn’t respond in time`
- `not-member` → `Not on allowlist… Join as investigator`
- All keep `msgTechnical` behind `Hide technical details`.

## 8. Loading / duplicate-click protection
- Primary `Open`/`Generate proof` buttons `disabled={busy}`; `TxProgress` shows `proof` then `submit` stage; `isConnectingRef` blocks concurrent `connect`.
- Double-click, rapid clicks, back/forward, wallet popup twice — all blocked by `busy` + `isConnectingRef`.
- No relying solely on button disable for idempotency — contract `caseId` uniqueness is the source of truth.

## 9. Audit logging (no sensitive data)
Utility `src/lib/auditLog.ts:1` `logTx({ op, caseId, txId, network, latencyMs, outcome, errorCategory })` — logs only `op` (`openCase` etc.), `caseId`, truncated `txId` (first 8 chars), `network`, `success/failed`, `latency`, `errorCategory` (e.g., `prover_unavailable`). Never logs `amount`, `secret`, `privateState`, `seed`, `password`, `API keys`.

## 10. User-facing history
Improved `Ledger history` (`CaseDetail.tsx:373` timeline) and `Recent Evidence` (`Dashboard.tsx`) already show `txId` prefix, `blockHeight`, `caseId`, `total`, `phase`, `Verified/Sealed` stamps — no fabricated hashes; `lastProof` card shows `Verification: VERIFIED` only after real `txId`.

## 11. Tested scenarios
- [x] Demo open/log/disclose/close (mock, no prover) — LOCAL MOCKED
- [x] Audit read-only without wallet/prover — LOCAL REAL (public indexer)
- [x] Wallet first-connect (poll, waitForWalletReady) — LOCAL MOCKED (no real wallet in CI)
- [x] Wrong network / rejection / disconnect / account change — LOCAL MOCKED (state transitions)
- [x] Prover unavailable / timeout / localhost guard — LOCAL MOCKED (error messages)
- [x] Double-click prevention (`busy`) — LOCAL MOCKED
- [x] `npm run typecheck` PASS, `npm run build` PASS, existing `vitest` contract tests PASS
- [ ] Real Preprod IAM/Lace `openCase` with hosted prover — UNVERIFIED (requires hosted `proof-server:8.1.0` at `VITE_PROOF_SERVER_URI=https://…` + funded wallet; not provisioned in this workspace)

## 12. Known limitations
- Private-state loss on browser clear is non-recoverable without `exportPrivateStates` backup (SDK warning).
- `openCase` idempotency requires new `caseId`; retrying same `caseId` will fail `Case already exists` — documented, not auto-retried.
- Refresh after wallet sign but before `onLanded` leaves receipt not yet in `/api/cases` — recovery via `/audit` manual check.
- Refresh during `proving` loses in-memory `unprovenTx` — no resume; safe to retry (still `proving`, no chain mutation).
- IAM/1AM production real transaction still **UNVERIFIED** until hosted prover is deployed (Phase C blocker).

## 13. Security / no-logging
Grepped `seed phrase, private key, PRIVATE_STATE_PASSWORD` — only `DEMO_PRIVATE_STATE_PASSWORD` (demo-only) remains; production uses `signData` derivation, never `localStorage` or server. `auditLog` never includes witnesses.
