# MidnightTrace — Private Blockchain Forensics on Midnight

![CI](https://github.com/sadiyamulani03/NewMoonToFullMoon/actions/workflows/ci.yml/badge.svg)

> A privacy-first forensics dApp on the Midnight Network: an on-chain counter
> that proves each forensic step (a hidden amount) without ever revealing the
> amount itself. Built across three levels — the Compact contract (Level 1),
> the full-stack dApp (Level 2), and the deployed, CI-covered submission
> (Level 3).

## Live Demo

- **Live Link:** https://midnighttrace.vercel.app
- **Demo video :** https://drive.google.com/file/d/1JJAdLMOgTcaPM4rzJhvJraAfWfsvKE0i/view?usp=sharing

> Runs the complete dApp: wallet + on-chain calls, the multi-page React frontend,
> and the Express API (`/api/health`, `/api/cases`, `/api/stats`, …). Deployed
> from the repo root via the included `vercel.json`.

## Project Vision

In real-world forensic work you often need to *prove that you performed an
analysis step* — traced a hidden transaction amount, counted evidence items,
verified a batch size — without disclosing the underlying data. MidnightTrace
gives auditors, compliance officers, and forensic analysts exactly that:
each forensic step runs through a Midnight circuit whose proof lands on-chain,
while the amount that backs the proof stays private forever.

Midnight is the core of this because its Compact smart contracts run
*selective disclosure* natively: the ledger holds only the public running
`total`, while the witness that backs it (the `amount`) is proved in
zero-knowledge and then dropped. The DApp is delivered in three levels:

### Level 1 

A Compact smart contract (`contracts/counter.compact`) with two circuits:

- `increment(amount)` advances the public counter `total` by the given amount —
  but the amount is a **private witness** that is never stored on-chain.
- `incrementAndReveal(amount)` does the same arithmetic but *deliberately*
  publishes the amount into the public `lastDisclosed` ledger field via
  `disclose()`.

Both share the same arithmetic; the only difference is whether the caller
chooses to keep the amount private or reveal it. This is the core Midnight
pattern — selective disclosure — applied to the smallest meaningful contract.

### Level 2 

A multi-page React app + Express API that puts the contract to work:

1. Browse **Cases** — forensic cases stored server-side, each tracking its own
   proof receipts against the one deployed counter contract.
2. Connect your Midnight wallet (**1AM** or **Lace**) on **Preprod**.
3. **Run the circuit** — `increment(amount)` is called with a **private witness
   amount**. A zero-knowledge proof is generated in the browser proving
   `total' = total + amount`, and the proof is submitted on-chain.
4. The public ledger updates (`total` increases), but the hidden `amount` never
   lands on-chain and never appears in the UI nor the API — it exists only
   inside the ZK proof. The proof is attached to the current case as a receipt.

Pages: **Dashboard** (`/`), **Cases** (`/cases`), **Case detail** (`/cases/:id`),
**New case** (`/new`), **About** (`/about`).

### Level 3

The unified, deployed product: the repo is a single package (contracts, CLI
scripts, API, and frontend together), live on Vercel, gated by a two-job CI/CD
pipeline, with a written product proposal and this README.

## Contract Deployment

| Network  | Contract address                                                  | Used by |
|----------|-------------------------------------------------------------------|---------|
| Preprod  | `03123eac1002b6268b357400033d4c440c165e68559bda54ba3de08c6d2549c1` | Live demo (baked into `src/config.ts`) |
| Preview  | `e86050af934fed3ed7d6e8dfab05a7198d4d91521b68279ecaccd26e68d4ffb6` | Level 1 deploy |

Anyone can query the contract's public state straight from the Preprod
indexer and see the running `total` — but never the amounts behind it.

## What an on-chain observer sees

| Goes on chain (public)                    | Stays private (proved in ZK, then dropped) |
|-------------------------------------------|--------------------------------------------|
| `ledger.total` — running counter value    | `amount` — the witness of each circuit |
| `ledger.lastDisclosed` — amounts a caller deliberately published via `incrementAndReveal` (left at `0` in the private path) | the connection between a case and its evidence amounts |
| receipt `txId` / `blockHeight` (off-chain metadata pointing at the public tx) | case description/owner (off-chain metadata only) |

## Privacy model

- **What is PUBLIC (on-chain, visible to anyone):**
  - `ledger total` — the running counter value. Every call produces a publicly
    visible new value.
  - `ledger lastDisclosed` — the most recent step amount that a caller
    deliberately published via `incrementAndReveal`.
- **What is PRIVATE (private witness, never on-chain):**
  - The `amount` argument of each circuit. It exists only in the caller's ZK
    witness and is fed into the circuit; unless a circuit explicitly
    `disclose()`s it, the amount never appears in the ledger. The Compact
    compiler rejects any implicit disclosure.
- **What the user PROVES without revealing:**
  - That the new `total` honestly equals the previous `total` plus the hidden
    `amount` — without the network or anyone else learning the `amount`.

### Privacy claim

To an on-chain observer, MidnightTrace shows: a transaction was submitted that
moved the public `total` counter by exactly the hidden amount, and the proof
was cryptographically valid. The `amount` itself is not a ledger field, is not
part of the public transcript, and is never rendered in the UI. A
fork-and-diff comparison against `incrementAndReveal` proves the difference:
the reveal path writes the amount to `lastDisclosed`; the private path leaves
it nowhere on-chain.

### Threat model

| Threat | Mitigation in MidnightTrace |
|--------|-----------------------------|
| Compromised API server | The server never sees the private witness — proofs are generated for a connected wallet (1AM sponsors proving + fees) or delegated to a proof server. A compromised API leaks case metadata and public totals only. |
| Malicious indexer / RPC | A hostile indexer sees only public ledger state — the `total` and any `lastDisclosed`. It cannot see the `amount`; the ZK proof proves the claims without revealing witnesses. |
| Fake claims | Circuits are fail-closed: a proof asserting `total' = total + amount` for a false amount fails. A non-deliberate witness amount never lands in public ledger state (enforced by the 8-test suite, including privacy tests). |

## Key features

- **Three levels of tooling**: Compact contract sources + compiled
  artifacts (`contracts/managed/`), a CLI script set (`scripts/`: setup,
  deploy, cli, counter-demo, check-balance, network, e2e-check), and the
  full-stack web app.
- **Zero-knowledge selective disclosure** — public `total` plus an optional
  deliberate `lastDisclosed`; the `amount` never crosses the proof boundary.
- **On-chain proof receipts per case** — each circuit call is recorded against a
  forensic case via the Express API (`/api/cases`, `/api/cases/:id/receipts`,
  `/api/stats`).
- **DApp Connector wallet integration** — `useMidnight` connects a 1AM or Lace
  wallet, validates the network, and drives the circuit from the shared
  `MidnightContext`.
- **In-browser proving** — ZK config is fetched from the bundled assets
  (`/contract/compiled/`), and proofs are generated by the wallet's proving
  provider (or its proof-server fallback).
- **Privacy-labelled prove flow** — every ZK action states the private step
  never reaches the chain or the screen.

## Tech stack

- Midnight Network
- Compact smart contract language (`counter.compact`, compiled artifacts + ZK
  keys under `contracts/managed/`)
- Midnight.js SDK (`@midnight-ntwrk/midnight-js` 4.1.1 — indexer public data
  provider, level private state provider, fetch ZK config provider, ledger-v8)
- DApp Connector API (`@midnight-ntwrk/dapp-connector-api`)
- React 19 + Vite + TypeScript
- React Router 7 (multi-page navigation)
- Express 5 (backend API: cases, receipts, stats; serves the built frontend)
- 1AM or Lace wallet (browser extension)
- Vitest (contract tests), GitHub Actions (CI)

## Local development

```bash
# 1. Install dependencies (root package.json covers contracts, scripts, frontend)
npm install

# 2. Configure the Preprod contract address (set VITE_CONTRACT_ADDRESS if yours
#    differs). Default in src/config.ts already points to the Preprod address.
cp .env.example .env   # edit .env and paste your address if needed

# 3. Run the whole stack (API on :4000 + web on :5173)
npm run dev
# open the printed URL, connect your wallet (1AM or Lace) on Preprod,
# browse Cases, and run the circuit

# 4. Contract app (Level 1) — compile + tests
npm run compile
npm run test:contract

# 5. Production build — the Express server serves dist/ + API together
npm run build
npm start   # http://localhost:4000
```

### Contract app (Level 1) — local proof server & deploy

```bash
# 1. Start the proof server (pins the SDK-compatible proof-server image)
docker compose up -d --wait proof-server

# 2. Compile both contracts into contracts/managed/
npm run compile

# 3. Deploy the counter contract to a network (prints your wallet address —
#    fund it at the faucet first, then it continues)
npm run deploy -- --network preprod --contract counter
```

Notes:

- Deployment records are stored in `.midnight-state.json` (gitignored).
- Wallet seeds per network are in `.midnight-state.json`; the wallet sync cache
  lives in `.midnight-wallet-state/` (gitignored).
- Use `npm run clean` to remove generated artifacts and reset local state.

### Tests

```bash
# Contract unit tests (circuit logic, state transitions, privacy) — 8 tests
npm run test:contract

# Frontend build + ZK smoke test + API smoke test
npm run test:frontend
```

Output (contract tests):

```
> midnighttrace@1.0.0 test:contract
> vitest run

 ✓ tests/counter.test.ts (8 tests) 110ms

 Test Files  1 passed (1)
      Tests  8 passed (8)
```

Output (frontend tests):

```
✓ ZK assets ship in dist/          (tests/smoke.mjs)
✓ API healthy (7 endpoint checks)  (tests/api-smoke.mjs)
```

Screenshot of the contract test output:

<img src="screenshots/contract-tests.svg" alt="Contract unit test output — 8 tests passing" width="640" />

## Deploy to Vercel

The repo ships a [`vercel.json`](./vercel.json) config that deploys
the full-stack app: the Vite frontend as static output (`dist/`) plus the Express
API as a serverless function (`api/index.mjs`), with `/api/*` rewired to
the function and all other routes falling back to the SPA.

1. Push this repo to GitHub (it is already public) and import it into Vercel.
2. Leave the root directory at the repo root and set the framework preset to **Vite**.
3. Add env vars: `VITE_NETWORK_ID=preprod` and `VITE_CONTRACT_ADDRESS`
   (secret) set to the Preprod address above.
4. Deploy. Vercel builds `npm install && npm run build` and serves both the
   static site and the `/api/*` endpoints.

> The default data store is a JSON file in the function's writable dir; Vercel
> serverless storage is ephemeral, so case data reseeds on each cold start. For
> persistence, set `MIDNIGHTTRACE_DATA_FILE` to an external store or a Vercel
> Blob/MySQL connection.

## Mainnet path

The dApp needs, on mainnet: the same `counter.compact` deployed at a higher
security threshold (`npm run deploy` is already automated), the mainnet indexer
endpoints in `src/config.ts`, wallet-delegated proving (already the flow), a
persistent host for the Express API, and 1AM / Lace on mainnet via the
network-agnostic DApp Connector flow. Full detail in **PROPOSAL.md**.

## Future scope

- Encrypted evidence hashes and auditor access keys on the case store.
- Retention/expiry timestamps and multi-signature handoff records.
- A deliberate `incrementAndReveal`-based disclosure flow in the UI for
  regulation-driven reporting.

## CI/CD

A GitHub Actions pipeline runs on every push to `main` and on every pull
request. The workflow lives at `.github/workflows/ci.yml` and runs two jobs:

1. **contract** — installs the Compact compiler, compiles `counter.compact`,
   and runs the 8 contract unit tests.
2. **frontend** — installs dependencies, runs the production Vite build, and
   runs both the ZK-asset smoke test and the Express API smoke test.

Status badge: ![CI](https://github.com/sadiyamulani03/NewMoonToFullMoon/actions/workflows/ci.yml/badge.svg)

## Project structure

```
NewMoonToFullMoon/
├── .github/workflows/ci.yml     # CI/CD pipeline (push main + PR)
├── PROPOSAL.md                  # product proposal (idea, users, data model, mainnet feasibility)
├── README.md
├── contracts/                   # Compact sources + compiled artifacts
│   ├── counter.compact          #   Level 1 contract (increment / incrementAndReveal)
│   ├── hello-world.compact
│   └── managed/                 #   compiled contract artifacts + ZK keys
├── api/index.mjs                # Express API entry (serverless for Vercel)
├── server/index.mjs             # Express API (cases, receipts, stats) + prod static hosting
├── scripts/                     # Level 1 CLI: setup, deploy, network, wallet, demo, e2e-check
├── src/
│   ├── components/              # Layout (nav + wallet pill), CircuitCall
│   ├── context/                 # MidnightProvider (shared wallet/contract state)
│   ├── hooks/                   # useMidnight.ts (connect, join, run circuit)
│   ├── lib/                     # api client, providers, wallet adapter, ledger, types
│   ├── pages/                   # Dashboard, Cases, CaseDetail, CreateCase, About
│   ├── App.tsx                  # React Router routes
│   ├── main.tsx
│   └── config.ts                # Preprod contract address
├── tests/                       # counter.test.ts (8 unit tests), simulator, ZK + API smoke
├── screenshots/                 # test-output screenshot for the submission
├── vercel.json                  # Vercel full-stack deploy config
├── docker-compose.yml           # local proof server for Level 1
└── package.json
```

## Companion docs

| Doc | Use when |
|-----|----------|
| `PROPOSAL.md` | Product proposal — idea, users, Midnight rationale, data model, mainnet feasibility |
| `screenshots/contract-tests.svg` | Test-output screenshot (8 tests passing) |
| `.github/workflows/ci.yml` | CI/CD pipeline with passing runs |
