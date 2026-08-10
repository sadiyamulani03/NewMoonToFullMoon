# MidnightTrace — Private Blockchain Forensics

![CI](https://github.com/sadiyamulani03/NewMoonToFullMoon/actions/workflows/ci.yml/badge.svg)

> A privacy-first forensics dApp on the Midnight Network: an on-chain counter that proves each forensic step (a hidden amount) without ever revealing the amount itself.

## Live Demo

**Full-stack (Express API + frontend, Vercel):** https://midnighttrace.vercel.app

> Runs the complete dApp: wallet + on-chain calls, the multi-page React frontend,
> and the Express API (`/api/health`, `/api/cases`, `/api/stats`, …). Deployed
> from the repo root via the included `vercel.json` (see
> **Deploy to Vercel** below).

## Contract Address

| Network  | Address                          |
|----------|----------------------------------|
| Preprod  | `03123eac1002b6268b357400033d4c440c165e68559bda54ba3de08c6d2549c1` |

## What This Does

MidnightTrace is a privacy-preserving **full-stack, multi-page forensics dApp**. In
real-world forensic work you often need to *prove that you performed an analysis
step* (e.g. traced a hidden transaction amount, counted evidence items, or
verified a batch size) without disclosing the underlying data. This dApp
demonstrates exactly that pattern using the Midnight counter contract:

1. Browse **Cases** — forensic cases stored server-side, each tracking its own
   proof receipts against the one deployed counter contract.
2. Connect your Midnight wallet (**1AM** or **Lace**) on **Preprod**.
3. **Run the circuit** — the `increment(amount)` circuit is called with a
   **private witness amount** (`amount`). A zero-knowledge proof is generated
   proving `total' = total + amount`, and the proof is submitted on-chain.
4. The public ledger updates (`total` increases), but the hidden `amount` is
   never placed on-chain and never appears in the UI nor the API — it exists
   only inside the ZK proof. The proof is attached to the current case as a
   receipt.

The same arithmetic also powers `incrementAndReveal`, which a caller could use
to *deliberately* publish an amount via `disclose()`. MidnightTrace uses the
private path, showing how an auditor can prove work without leaking evidence.

## Pages

- **Dashboard** (`/`) — wallet status, case stats, latest proof receipt, quick actions.
- **Cases** (`/cases`) — list forensic cases loaded from the API.
- **Case detail** (`/cases/:id`) — run the circuit for the case and view its proof history.
- **New case** (`/new`) — create a case (stored via the API).
- **About** (`/about`) — the privacy model and architecture explained.

## Privacy Model

- **What is PUBLIC (on-chain, visible to anyone):**
  - `ledger total` — the running counter value. Every call produces a publicly
    visible new value.
  - `ledger lastDisclosed` — the most recent step amount that a caller
    deliberately published via `incrementAndReveal` (left at `0` in the
    private path used here).
- **What is PRIVATE (private witness, never on-chain):**
  - The `amount` argument of each circuit. It exists only in the caller's ZK
    witness and is fed into the circuit; unless a circuit explicitly
    `disclose()`s it, the amount never appears in the ledger.
- **What the user PROVES without revealing:**
  - That the new `total` honestly equals the previous `total` plus the hidden
    `amount` — without the network or anyone else learning the `amount`.

## Privacy Claim

To an on-chain observer, MidnightTrace shows: a transaction was submitted that
moved the public `total` counter by exactly the hidden amount, and the proof
was cryptographically valid.

What an on-chain observer **cannot** see: the `amount` itself. It is not a
ledger field, is not part of the public transcript, and is never rendered in
the UI. A fork-and-diff comparison against `incrementAndReveal` proves the
difference: the reveal path writes the amount to `lastDisclosed`; the private
path leaves it nowhere on-chain.

## Tech Stack

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
- GitHub Actions (CI)

## Prerequisites

- **1AM** or **Lace wallet** extension installed in your browser and switched
  to **Preprod** (1AM also sponsors proving + fees, so no DUST setup needed)
- **Node.js v22** (the Midnight toolchain requires ≥ 22)
- **Compact compiler** (only needed if you recompile the contract locally):
  `curl --proto '=https' --tlsv1.2 -LsSf https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh` then `compact update 0.31.1`
- Docker (only needed if you redeploy the contract locally)

## Setup & Run Locally

```bash
# Install dependencies (root package.json covers contracts, scripts, frontend)
npm install

# Configure the Preprod contract address (set VITE_CONTRACT_ADDRESS to the
# Preprod address below). Default in src/config.ts already points there.
cp .env.example .env   # edit .env and paste your address if needed

# Run the whole stack (API on :4000 + web on :5173)
npm run dev
# open the printed URL, connect your wallet (1AM or Lace) on Preprod,
# browse Cases, and run the circuit

# Contract app (Level 1) — compile + tests
npm run compile
npm run test:contract

# Or build for production and let the Express server serve dist/ + API
npm run build
npm start   # http://localhost:4000
```

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

## Run Tests (npm test)

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

## Screenshots

Contract unit tests (8 passing — circuit logic, state transitions, privacy):

<img src="screenshots/contract-tests.svg" alt="Contract unit test output — 8 tests passing" width="640" />

Frontend build + tests are verified in CI (`.github/workflows/ci.yml`) on every push and pull request.

## CI/CD

A GitHub Actions pipeline runs on every push to `main` and on every pull
request. The workflow lives at `.github/workflows/ci.yml` and runs two jobs:

1. **contract** — installs the Compact compiler, compiles `counter.compact`,
   and runs the 8 contract unit tests.
2. **frontend** — installs dependencies, runs the production Vite build, and
   runs both the ZK-asset smoke test and the Express API smoke test.

Status badge: ![CI](https://github.com/sadiyamulani03/NewMoonToFullMoon/actions/workflows/ci.yml/badge.svg)

## Product Proposal

See **[PROPOSAL.md](./PROPOSAL.md)** — the full product pitch, data model,
Midnight rationale, and mainnet feasibility plan.

---

## Repository layout

```
NewMoonToFullMoon/
├── .github/workflows/ci.yml     # CI/CD pipeline (push main + PR)
├── PROPOSAL.md                  # product proposal
├── README.md
├── contracts/                   # Compact sources + compiled artifacts
│   ├── counter.compact
│   ├── hello-world.compact
│   └── managed/                 # compiled contract artifacts + ZK keys
├── api/index.mjs                # Express API entry (serverless for Vercel)
├── server/index.mjs             # Express API (cases, receipts, stats) + prod static hosting
├── scripts/                     # Level 1 CLI: setup, deploy, network, wallet, demo
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
├── vercel.json                  # Vercel full-stack deploy config
└── package.json
```
