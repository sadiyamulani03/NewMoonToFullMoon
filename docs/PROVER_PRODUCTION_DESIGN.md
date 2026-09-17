# Prover Production Design — MidnightTrace (1AM/IAM)

**SDK:** `@midnight-ntwrk/* 4.1.1`, `ledger-v8 8.1.0`, `dapp-connector-api 4.1.1`, `proof-server:8.1.0`. **Network:** Preprod. **No contract changes.**

## 1. Current architecture (audited)
`src/lib/providers.ts:86` `buildProvidersFromConnectedAPI(connectedAPI, contractName)`:

```
Browser (Vercel or localhost)
 ├─ window.midnight (IAM/1AM or Lace) — InitialAPI.connect(networkId) → ConnectedAPI
 │   ├─ getProvingProvider(keyMaterialProvider) → ProvingProvider | null
 │   │   └─ Lace: returns in-wallet prover (browser-local, no server)
 │   │   └─ 1AM/IAM: often null — delegates proving off-device
 │   └─ getConfiguration() → { indexerUri, proverServerUri?, networkId }
 │       └─ 1AM: proverServerUri = https://*.1am.xyz/... (ProofStation, needs API key → 401 from browser)
 │       └─ Lace: proverServerUri often undefined (in-wallet suffices)
 ├─ Application
 │   ├─ zkConfigProvider = FetchZkConfigProvider(/contract/compiled/<name>)
 │   ├─ VITE_PROOF_SERVER_URI (import.meta.env) — operator-configured, e.g. http://localhost:6300
 │   └─ LOCAL_FALLBACK_URI = http://localhost:6300
 ├─ Proof Provider selection (src/lib/providers.ts:220)
 │   ├─ if effectiveConfiguredUri → httpClientProofProvider(effectiveConfiguredUri) + wrapWithFallback
 │   ├─ else if provingProvider → unprovenTx.prove(provingProvider) → fallback to walletReported prover → localhost (only if isLocalHost)
 │   └─ else if config.proverServerUri → httpClientProofProvider(config.proverServerUri) (no wrap)
 └─ Midnight Preprod (indexer, ledger)
```

`isLocalHost = /^(localhost|127\.0\.0\.1)$/.test(location.hostname)` (`src/lib/providers.ts:127`). `effectiveConfiguredUri` strips `localhost:6300` on Vercel (`src/lib/providers.ts:129`). `tryLocalFallback` now early-returns if `!isLocalHost`.

`src/hooks/useMidnight.ts:32` handles `connect`, `waitForWalletReady 3500ms`, `isConnectingRef`, 5× retry for `sync` (1AM first sync 20–40s).

`docker-compose.yml:69` `proof-server:8.1.0` on `6300` (healthcheck via `/dev/tcp/127.0.0.1/6300`) — **local-dev only**, never for Vercel browser.

## 2. Failure cause (deployed Vercel + IAM/1AM)
1. User on `https://*.vercel.app` (isLocalHost=false) connects IAM Wallet (1AM semantics, `provingProvider==null`, `proverServerUri=https://*.1am.xyz`).
2. `buildProviders` selects `httpClientProofProvider(config.proverServerUri)` — browser `fetch(https://*.1am.xyz)` fails `Failed to fetch` (CORS / missing API key / not browser-callable).
3. Prior code then `tryLocalFallback` → `fetch(http://localhost:6300)` from Vercel → `TypeError: Failed to fetch` (localhost is user's machine) → wrapped as `Proving failed via wallet and its prover ... Vercel cannot reach localhost:6300`.
4. Result: real `openCase/logStep` never proves; Demo/Audit still work (no prover).

**No official Midnight-hosted public prover** for Preprod is documented in `@midnight-ntwrk/* 4.1.1` or `midnight.network` docs that is browser-callable without API key. `*.1am.xyz` is not intended for direct browser use. `proof-server:8.1.0` is the **self-hosted** option.

## 3. Production architecture (self-hosted — Option B)

**Verified:** `midnightntwrk/proof-server:8.1.0` is the official prover for this ledger (pinned to `ledger-v8 8.1.0`, `midnight-js 4.1.1`). No public `https://prover.midnight.network` exists for this stack.

```
LOCAL (npm run dev)
  Browser (localhost)
   → VITE_PROOF_SERVER_URI=http://localhost:6300
   → httpClientProofProvider(http://localhost:6300) or Lace in-wallet
   → docker proof-server:6300 (healthcheck /dev/tcp)
   → Preprod

PRODUCTION (Vercel)
  Browser (https://midnighttrace-*.vercel.app)
   → VITE_PROOF_SERVER_URI=https://prover.midnighttrace.yourdomain.com  (HTTPS, hosted proof-server)
   → httpClientProofProvider(https://prover...)  (no localhost fallback)
   → Hosted proof-server:8.1.0 (Fly/Railway/EC2, 2 vCPU/4GB, autoscale)
   → Preprod
   └─ Lace alternative: no VITE_PROOF_SERVER_URI needed, Lace in-wallet proving (provingProvider) — no server
```

**IAM/1AM on production:** Requires hosted `https://` prover. Lace on production: in-wallet proving, no server needed (already works).

## 4. Endpoint configuration

| Env | `VITE_PROOF_SERVER_URI` | Behavior |
|-----|------------------------|----------|
| Local | `http://localhost:6300` | `effectiveConfiguredUri=http://localhost:6300`, `isLocalHost=true`, local fallback allowed |
| Production IAM | `https://prover.yourdomain.com` (self-hosted) | `effectiveConfiguredUri=https://...`, `wrapWithFallback` tries it first, then wallet prover, no localhost |
| Production Lace (no env) | unset | `effectiveConfiguredUri=undefined`, `provingProvider` (in-wallet) used, no localhost fetch |
| Production IAM misconfigured (unset) | unset | `config.proverServerUri` (1AM cloud) → `Failed to fetch` → clear error `Set VITE_PROOF_SERVER_URI to hosted prover or use Lace/Demo` — never localhost |

**Validation:** If `VITE_PROOF_SERVER_URI` is set and `!isLocalHost` then it **must** be `https://` and not `localhost`/`127.0.0.1`; otherwise `buildProviders` throws `VITE_PROOF_SERVER_URI must be https:// in production` at startup (diagnostic).

## 5. Authentication, CORS, TLS, rate limiting, resources

- **TLS/HTTPS:** Required in production; proof-server itself is HTTP, so front with Caddy/Nginx/Cloudflare TLS termination (`https://` → `http://127.0.0.1:6300`).
- **Authentication:** Do **not** put raw API key in `VITE_*` (exposed to browser). Hosted prover for this image has **no built-in auth**; protect via reverse-proxy `Authorization: Bearer <token>` where token is **not** in `VITE_*` — instead use Vercel **backend proxy** (`/api/prove` → server-side fetch to prover with `Authorization` header from `PROOF_SERVER_TOKEN` env, not `VITE_`). MVP alternative (current): expose prover without auth but restrict via **CORS** (`Access-Control-Allow-Origin: https://midnighttrace-*.vercel.app` only) + **IP allowlist / Cloudflare WAF** + **rate limit** (see below). Documented as acceptable for MVP, not for high-value startup.
- **CORS:** Proof-server must send `Access-Control-Allow-Origin: https://midnighttrace.vercel.app` (or `*.vercel.app`), `Allow-Methods: POST`, `Allow-Headers: Content-Type`. Browser direct `fetch(proverUri)` requires it.
- **Rate limiting:** Nginx `limit_req_zone` 10 req/s per IP, burst 20; proof-server is CPU-bound (1 proof ~2-5s on 2 vCPU), so also limit concurrency (see below).
- **Resource limits:** `proof-server:8.1.0` per `docker-compose.yml:83` — `RUST_BACKTRACE=full`, 2 vCPU/4GB recommended; each `/prove` is single-threaded actix worker, so run 2-4 replicas behind load balancer, or set `proof-server` with `--workers 4`. Timeout `30s` per proof (client `httpClientProofProvider` default).
- **Concurrency/timeout:** Client `httpClientProofProvider` 30s timeout; `wrapWithFallback` retries once on `Failed to fetch` only if `isLocalHost`; production retries are bounded (1×) to avoid duplicate transactions. Transaction idempotency is via `caseId` uniqueness (`midnighttrace.compact:90` `assert(!cases.member(caseId))` — duplicate `caseId` fails, so double-click is not idempotent; UI disables submit while `busy` (`src/pages/CaseDetail.tsx:22` `busy`).
- **Vercel:** Frontend only; proof server must run **separately** (Vercel cannot run `proof-server` container). Vercel env `VITE_PROOF_SERVER_URI` is build-time, baked into JS — no secrets in `VITE_`.

## 6. Monitoring/logging

- **Health check:** `echo > /dev/tcp/127.0.0.1/6300` (container) + external `GET https://prover.yourdomain.com/health` (if exposed) or `POST /prove` with minimal dummy (expect 400 but not 502) every 30s.
- **Availability:** target `99.5%` (MVP), alert if 2 consecutive health failures.
- **Latency:** `p50 <3s, p95 <8s`; log `proving_time_ms` per request.
- **Error rate:** alert if `5xx >5%` over 5m.
- **Logs:** `RUST_BACKTRACE=full`, but **never log** `secret`, `amount`, `privateState`, `seed`; log only `caseId`, `txId` prefix, `latency`, `status`.
- **Resource:** alert if `CPU >85%` or `memory >80%` for 5m.
- **Client:** `src/lib/providers.ts:208` debug log already (DEV only) — `selectedBranch`, `isLocalHost`, `hasInWalletProver` (no secrets).

## 7. Secret handling & failure recovery

- **Secrets:** `VITE_PROOF_SERVER_URI` (if HTTPS public prover, no secret; if auth required, use backend proxy, not `VITE_`), `PROOF_SERVER_TOKEN` (if used) lives in Vercel env (server-side) and prover host env, never in `src/`, never committed. `PRIVATE_STATE_PASSWORD` already removed from production (`src/lib/providers.ts:20` demo only, production via `signData`).
- **Failure states:** `WALLET_DISCONNECTED` → `Connect wallet`, `WALLET_REJECTED` → `Connection was cancelled`, `PROVER_UNAVAILABLE` → `Local proof service is unavailable… or Hosted prover unreachable…`, `PROOF_TIMEOUT` → `Wallet didn’t respond in time`, `CONTRACT_REJECTED` (`Case already exists` / `Not authorized`), `NETWORK_UNAVAILABLE` (`Failed to fetch` indexer). Each has distinct `msg` + `msgTechnical` behind `Hide technical details` (`CaseDetail.tsx:125`).
- **Recovery:** Browser refresh during `PROVING` loses in-memory `unprovenTx` — user must retry (new `prove`); refresh after `submit` but before confirmation: indexer will eventually show case; user can `Refresh ledger` / check `/audit`. No duplicate `openCase` with same `caseId` (contract rejects).

## 8. Local vs production behavior

- **Local:** `VITE_PROOF_SERVER_URI=http://localhost:6300`, `isLocalHost=true`, `effectiveConfiguredUri=http://localhost:6300`, `tryLocalFallback` allowed, `wrapWithFallback` tries configured → wallet → localhost.
- **Production:** `VITE_PROOF_SERVER_URI=https://<hosted>` (for IAM) or unset (for Lace), `isLocalHost=false`, `effectiveConfiguredUri` strips any `localhost`, `tryLocalFallback` early-returns, never `fetch(http://localhost:6300)`. If misconfigured (IAM without hosted prover and without in-wallet prover), app fails clearly: `No proving infrastructure… or Local proof service is unavailable…` — no silent localhost.

## 9. Verification checklist

- [ ] Hosted `proof-server:8.1.0` deployed with HTTPS, CORS for Vercel domain, healthcheck passing
- [ ] Vercel env `VITE_PROOF_SERVER_URI=https://…` set (or unset for Lace-only)
- [ ] Deployed Vercel + IAM Wallet → `openCase` succeeds, `prover selection` debug shows `configuredUri`, no `localhost` fetch in Network tab
- [ ] `npm run typecheck && npm run build` PASS
- [ ] Demo/Audit still work without wallet/prover

## 10. Remaining blockers if not hosted

If no hosted prover is provisioned, `IAM/1AM` on Vercel **remains BROKEN by design** (not a code bug) — must use `Lace` (in-wallet) or Demo. This document must be updated with the verified `https://` endpoint once provisioned; do not invent `https://prover.midnight.network`.
