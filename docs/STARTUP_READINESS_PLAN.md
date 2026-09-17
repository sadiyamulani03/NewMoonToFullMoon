# MidnightTrace — Startup Readiness Plan (MVP/DEMO READY → Production)

**Status:** MVP / Demo Ready. Not startup-ready until Blockers 1 & 2 are resolved.
**Branch:** `main` — no contract redeploy, no Mainnet, no fake proofs.
**Contracts frozen:** `contracts/midnighttrace.compact` (checkMembership in openCase/logStep/grantAccess/discloseFinding/closeCase), addresses `03123eac…` / `df5e0583…` on Preprod — unchanged in all phases.

---

## Phase A — Research Findings (STOP AND REPORT)

### A1. Current private-state implementation
- `src/lib/providers.ts:18` `PRIVATE_STATE_PASSWORD = 'MidnightTrace-demo-storage-password!'` with header “Demo-only … NOT authentication … Production would derive from wallet seed or user passphrase”. `src/lib/providers.ts:291` `levelPrivateStateProvider({ privateStoragePasswordProvider: () => PRIVATE_STATE_PASSWORD, accountId: shieldedAddress })` encrypts LevelDB `midnight-level-db` (`private-states` + `signing-keys`) with `StorageEncryption` (AES-GCM + PBKDF2, `src/lib/providers.ts:1` via `@midnight-ntwrk/midnight-js-level-private-state-provider`). Password policy in `@midnight-ntwrk/midnight-js-utils:259` `validatePassword` (≥16 chars, ≥3 classes, etc.). SDK warning in `level-private-state-provider.d.ts: WARNING` — “lacks a recovery mechanism … DO NOT use for production requiring persistence”.
- `src/hooks/useMidnight.ts:32` `walletState` + `isConnectingRef`, `membershipSecretRef`, `accountId` derived from `shieldedAddress` (`src/lib/providers.ts:293` hashed first 32 chars of SHA-256). Changing wallet → new `accountId` → isolated partition; deleting IndexedDB → permanent loss (no chain recovery). `midnighttrace.compact` witnesses (`amount`, `secret`) are transient per-tx; LevelDB holds only Midnight.js private-state for next tx construction, not the `Case` ledger (which is public).

### A2. IAM/1AM wallet capabilities (installed SDK 4.1.1 / wallet-sdk 1.2.0)
- Wallet injection: `window.midnight: Record<string, InitialAPI>` (`src/hooks/useMidnight.ts:37` `listWallets()`), `InitialAPI.connect(networkId) => ConnectedAPI`.
- `node_modules/@midnight-ntwrk/dapp-connector-api/dist/api.d.ts:55` `WalletConnectedAPI` exposes **no seed/private-key export**. Only `getShieldedAddresses()`, `getProvingProvider(keyMaterialProvider)`, `signData(data, options)`, `getConfiguration(): { indexerUri, proverServerUri?, networkId }`, `submitTransaction`, `balanceUnsealedTransaction`.
- `signData:161` is the **only** wallet-secret operation — wallet signs arbitrary data internally, returns `Signature` without exposing seed. This is the sanctioned way to derive app-specific secrets.
- `getProvingProvider:175` takes `KeyMaterialProvider` (zkConfig) and returns `ProvingProvider` compatible with `ledger-v8`. For **Lace**, this is in-wallet (no server). For **1AM/IAM**, `getProvingProvider` often returns `null` (caught `src/lib/providers.ts:110` `.catch(()=>null)`) — 1AM delegates proving off-device to `config.proverServerUri` (`*.1am.xyz` cloud prover, needs API key) or to configured `VITE_PROOF_SERVER_URI`.

**Conclusion:** Seed is **not** accessible. Wallet-derived encryption must use `signData`, not seed extraction. Never ask for seed phrase.

### A3. Midnight SDK password mechanism
- `level-private-state-provider.d.ts:38` `privateStoragePasswordProvider: () => string|Promise<string>` with `validatePassword` policy. Example: `async () => await getSecretPassword()`. Docs warn `SECURITY: Never use public key material`. No built-in wallet-derived helper — app must supply its own `getSecretPassword` (e.g., `signData`-derived). SDK provides `exportPrivateStates`/`importPrivateStates` with password rotation (`changePassword`).

### A4. Proof-server architecture
- `src/lib/providers.ts:86` `buildProvidersFromConnectedAPI(connectedAPI, contractName)` builds `zkConfigProvider` from `/contract/compiled/<name>`, `publicDataProvider` (remapped `PUBLIC_INDEXER_URIS.preprod` to avoid 1AM proxy 401), then prover selection:
  ```
  Browser
   ├─ IAM/1AM Wallet (window.midnight)
   │   ├─ getProvingProvider → in-wallet (Lace) or null (1AM)
   │   └─ getConfiguration().proverServerUri (1AM cloud, needs API key)
   ├─ Application (VITE_PROOF_SERVER_URI)
   │   └─ httpClientProofProvider(VITE_PROOF_SERVER_URI) (docker proof-server)
   └─ Midnight Preprod (indexer + ledger)
  ```
- `VITE_PROOF_SERVER_URI` (`src/lib/providers.ts:121`) from `.env` (`http://localhost:6300`) — **local-dev only**. `vite.config.ts` has no hardcode; `vercel.json` sets no env, so production `configuredProverUri===undefined`. Prior bug: `tryLocalFallback` fetched `localhost:6300` on Vercel (fixed in `src/lib/providers.ts:132` `if (!isLocalHost) return`).
- `docker-compose.yml:69` `proof-server: midnightntwrk/proof-server:8.1.0` on `6300` (distroless, healthcheck via `/dev/tcp/127.0.0.1/6300`) — pinned to match `ledger-v8 8.1.0` (7.x hangs on Apple Silicon, 9.x is rc). Resource: stateless, ~1-2 vCPU, 2GB RAM, concurrent proofs scale linearly.

**Findings:** No official Midnight-hosted public prover endpoint is documented in repo/`@midnight-ntwrk/*` for 1AM/IAM Preprod. 1AM **requires** a proof server; `localhost:6300` is the only provided one. Production IAM without a hosted prover → architectural limitation (reported as `BROKEN for 1AM/IAM path`).

---

## Phase B — Private State Design (not yet implemented)

**Goals:** Per-user isolation (`accountId` hash), wallet/account binding, no seed extraction, no hardcoded password, clear recovery semantics.

**Design (to be implemented after approval):**
- Production path: `privateStoragePasswordProvider = async () => { await connectedAPI.hintUsage(['signData']); const sig = await connectedAPI.signData('MidnightTrace private-state v1:'+shieldedAddress, { mode: 'plain' }); return kdf(sig.signature) }` where `kdf` = `SHA256(sig) → base64 → pad to 20 chars meeting validatePassword (upper/lower/digits/special)` — stable per wallet+app, never leaves device, not `localStorage`.
- Keep Demo path on static `PRIVATE_STATE_PASSWORD` (`isDemo` branch).
- Migration: detect legacy DB salt (via `StorageEncryption.getVersion` / try decrypt with demo password), prompt user `Migrate demo state?` → `exportPrivateStates(demoPwd)` → `importPrivateStates(newDerivedPwd)` → `changePassword` + delete legacy copy. If decrypt fails, report `non-recoverable` (expected per SDK WARNING).
- Browser deletion / different wallet: show `Your private state is gone — cases remain on-chain (public totals/allowlist), but you must re-join via owner secret or restore from export.`

**Open risk:** `signData` is wallet-specific; if wallet changes `signData` format, derived password rotates — mitigate by versioning the signed message (`v1`) and offering passphrase fallback.

---

## Phase C — Hosted Prover Design (not yet implemented)

**Option A (official) — none verified:** Search of `@midnight-ntwrk` packages/docs shows no `https://prover.midnight.network` endpoint for 1AM Preprod. Do **not** invent.

**Option B (self-hosted) — required for IAM production:**
```
Vercel frontend (HTTPS)
  ↓ fetch
Hosted proof-server (midnightntwrk/proof-server:8.1.0, 6300, TLS via Caddy/Nginx, auth via Bearer token in Vercel env VITE_PROOF_SERVER_TOKEN)
  ↓
Midnight Preprod
```
- Hosting: Fly.io/Railway/EC2/Fargate, 2 vCPU/4GB, autoscale, healthcheck `echo > /dev/tcp/127.0.0.1/6300`, logs to Loki/CloudWatch, metrics `proof_latency`, `error_rate`, `queue_depth`.
- Auth: Do not expose unauthenticated `6300`; front with HTTPS + `Authorization: Bearer <token>` validated by proof-server wrapper or reverse-proxy; token in Vercel env `VITE_PROOF_SERVER_TOKEN`, never committed.
- Concurrency/timeout: `httpClientProofProvider` 30s timeout, client retries 1× on `Failed to fetch` only if `isLocalHost`, production retries on `429` with backoff.
- Monitoring: Uptime check `/` every 30s, alert if `availability <99.5%` or `p95 latency >8s`.
- Verification: after provisioning, `npm run typecheck && npm run build` + real `1AM` `openCase` on Preprod via Vercel (guarded by `VITE_PROOF_SERVER_URI=https://<hosted>`), confirm `localhost` not fetched (`providers.ts` debug log `selectedBranch: configuredUri`).

**Env:** Local: `VITE_PROOF_SERVER_URI=http://localhost:6300` (`.env`). Production: `VITE_PROOF_SERVER_URI=https://<hosted>` + `VITE_PROOF_SERVER_TOKEN` (Vercel dashboard, never git). App fails clearly if missing in production (`No proving infrastructure` branch → `Local proof service is unavailable…`) — no silent localhost fallback (already fixed).

---

## Phase D — Reliability (outline)
- Transaction states `IDLE→PREPARING→PROVING→AWAITING_SIGNATURE→SUBMITTING→CONFIRMED/FAILED/RETRYABLE` already partially in `src/pages/CaseDetail.tsx:22` `busyStage`, but need idempotency analysis: contract `openCase` `assert(!cases.member(caseId))` makes retry **not** idempotent — duplicate `caseId` fails with `Case already exists`. Do **not** change contract; document: generate client `caseId` via `Date.now()` + random and disable double-click (`isConnectingRef` pattern), rely on `caseId` uniqueness for dedup.
- Provider readiness: `useMidnight.ts:92` poll 5s, `waitForWalletReady 3500ms`, `hintUsage` before `signData` to avoid race; add same for prover readiness.
- Monitoring: prover uptime, indexer health, tx submission callbacks.

## Phase E — Security Review Checklist
- No seed/private-key extraction, no `localStorage` secrets, no API keys in repo (grep `PRIVATE_STATE_PASSWORD`, `VITE_PROOF_SERVER_URI`).

---

## Acceptance Criteria Mapping
- Private-state: static password removed from production path, per-user isolation via `accountId`, wallet-derived via `signData`, recovery documented — **pending Phase B impl**.
- Prover: verified HTTPS hosted prover, Vercel env, no localhost in production, 1AM real tx succeeds — **pending Phase C provisioning**.
- Transactions: duplicate-click guarded, prover failure handled, pending/confirmed states — **partial**.
- Existing: Demo/Audit unchanged — **true**.
- Security: no secrets committed — **true**.

## Production Impact
Phase A alone does not move to startup-ready, but provides the **correct** basis to avoid insecure `seed-derive` or invented prover URL. Phase B+C will close the two CRITICAL blockers.

## Contract Status
`contracts unchanged, Preprod unchanged, contract addresses unchanged` (verified `git diff -- contracts/` empty).

## Git (Phase A)
- Commit: to be created after approval (`docs/STARTUP_READINESS_PLAN.md`)
- Push: pending approval
- Working tree: `docs/STARTUP_READINESS_PLAN.md` untracked

## Remaining Risks
- `signData`-derived password stability across wallet versions.
- No hosted prover yet — IAM production proving still BROKEN until Phase C.
- Browser storage loss remains non-recoverable without backup (SDK limitation).
