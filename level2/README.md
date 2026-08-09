# MidnightTrace — Private Blockchain Forensics

![CI](https://github.com/sadiyamulani03/NewMoonToFullMoon/actions/workflows/ci.yml/badge.svg)

> A privacy-first **full-stack, multi-page** blockchain forensics tool on the Midnight Network: an on-chain counter that proves each forensic step (a hidden amount) without ever revealing the amount itself.

## Live Demo

https://midnighttrace.vercel.app

## Contract Address

| Network  | Address                          |
|----------|----------------------------------|
| Preprod  | `03123eac1002b6268b357400033d4c440c165e68559bda54ba3de08c6d2549c1` |

## What This Does

MidnightTrace is a privacy-preserving forensics dApp with multiple pages. In
real-world forensic work you often need to *prove that you performed an
analysis step* without disclosing the underlying data:

1. Browse **Cases** — server-stored forensic cases, each with its own proof receipts.
2. Connect your Midnight wallet (**1AM** or **Lace**) on **Preprod**.
3. From a case, press **Run the circuit** — `increment(amount)` is called with a
   **private witness amount** (`amount`). A zero-knowledge proof is generated
   in the browser, proving `total' = total + amount` on-chain.
4. The proof lands as a **receipt on the case**; the hidden `amount` is never
   placed on-chain and never appears in the UI or the API — it exists only
   inside the ZK proof.

The same arithmetic also powers `incrementAndReveal`, which a caller could use
to *deliberately* publish an amount via `disclose()`. MidnightTrace uses the
private path, showing how an auditor can prove work without leaking evidence.

## Pages

| Route | Page |
|-------|------|
| `/` | Dashboard — wallet status, case stats, last proof |
| `/cases` | Cases — list of forensic cases |
| `/cases/:id` | Case detail — run the circuit, view proof history |
| `/new` | New case — create a case |
| `/about` | About — privacy model & architecture |

## Architecture

`Express` (server) + `React Router` (pages) + `useMidnight` hook (wallet and
contract) shared across pages via a React context provider. The Vite dev server
proxies `/api` to the Express server on `:4000`; in production the Express
server serves the built `dist/` and the API together.

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
- Compact smart contract language (`counter.compact`)
- Midnight.js SDK (`@midnight-ntwrk/midnight-js` 4.1.1)
- DApp Connector API (`@midnight-ntwrk/dapp-connector-api`)
- React 19 + Vite + TypeScript
- React Router 7 (multi-page navigation)
- Express 5 (backend API: cases, receipts, stats)
- 1AM or Lace wallet (browser extension)

## Prerequisites

- **1AM** or **Lace wallet** extension installed in your browser and switched
  to **Preprod** (1AM also sponsors proving + fees, so no DUST setup needed)
- **Node.js v22** (the Midnight toolchain requires ≥ 22)
- Docker (only needed if you redeploy the contract locally)

## Run Locally

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd NewMoonToFullMoon/level2

# 2. Install dependencies
npm install

# 3. Configure the Preprod contract address
#    (set VITE_CONTRACT_ADDRESS to your Level 1 Preprod address)
cp .env.example .env
# edit .env and paste your address

# 4. Run the full stack (Express API on :4000 + Vite web, together)
npm run dev
# open the printed URL, connect your wallet (1AM or Lace) on Preprod,
# browse Cases, and run the circuit

# Or build for production — the Express server serves dist/ + API together
npm run build
npm start
# open http://localhost:4000
```

## Deploy

The app is a full-stack package: an Express server that serves the static
Vite build (`dist/`) **and** the REST API on the same port — so any Node
host works (`npm install && npm run build && npm start`).

For static-only hosts, the built `dist/` can still be uploaded standalone
(the API endpoints will 404 on such hosts). Both `vercel.json` and
`netlify.toml` are included for the frontend; the live URL below connects to
the Preprod contract address baked into `src/config.ts`.

## Demo Video

https://drive.google.com/file/d/1U-yyNHPf1lOPNUK99Ix6JgZanA0ziv-i/view?usp=sharing

## Tests

```bash
cd level2
npm test   # builds the app, verifies ZK assets ship in dist/, and smoke-tests the API
```

## CI/CD

The repo-wide pipeline lives at `<repo-root>/.github/workflows/ci.yml` and runs on every push to `main` and every pull request. The `frontend` job installs dependencies, runs the production Vite build, and runs both the ZK-asset smoke test and the Express API smoke test. The `contract` job compiles the counter contract and runs the unit tests in `level1`.

Status badge: ![CI](https://github.com/sadiyamulani03/NewMoonToFullMoon/actions/workflows/ci.yml/badge.svg)

## Product Proposal

See **[PROPOSAL.md](../PROPOSAL.md)** in the repo root.

## File Structure

```
level2/
├── server/                      (Express API: cases, receipts, stats — serves dist/ in prod)
├── contracts/            (reference — the counter.compact source)
├── public/
├── src/
│   ├── components/
│   │   ├── Layout.tsx           (nav shell + wallet pill)
│   │   └── CircuitCall.tsx
│   ├── context/
│   │   └── MidnightContext.tsx  (shared wallet/contract state)
│   ├── hooks/
│   │   └── useMidnight.ts
│   ├── lib/              (api client, providers, wallet adapter, ledger, types)
│   ├── pages/            (Dashboard, Cases, CaseDetail, CreateCase, About)
│   ├── contract/compiled/counter/  (compiled ZK assets, served statically)
│   ├── App.tsx           (React Router routes)
│   ├── main.tsx
│   └── config.ts         (Preprod contract address)
├── tests/                (smoke.mjs — ZK assets; api-smoke.mjs — Express API)
├── vercel.json / netlify.toml
└── package.json
```
