# MidnightTrace — Private Blockchain Forensics

> A privacy-first blockchain forensics tool on the Midnight Network: an on-chain counter that proves each forensic step (a hidden amount) without ever revealing the amount itself.

## Live Demo

https://midnighttrace.vercel.app

## Contract Address

| Network  | Address                          |
|----------|----------------------------------|
| Preprod  | `03123eac1002b6268b357400033d4c440c165e68559bda54ba3de08c6d2549c1` |

## What This Does

MidnightTrace is a privacy-preserving forensics dApp. In real-world forensic
work you often need to *prove that you performed an analysis step* (e.g. traced
a hidden transaction amount, counted evidence items, or verified a batch size)
without disclosing the underlying data. This dApp demonstrates exactly that
pattern using the Midnight counter contract from Level 1:

1. Connect your Midnight wallet (**1AM** or **Lace**) on **Preprod**.
2. The dApp joins the deployed `counter` contract on-chain.
3. Press **Run Circuit** — the `increment(amount)` circuit is called with a
   **private witness amount** (`amount`). A zero-knowledge proof is generated
   in the browser proving `total' = total + amount`, and the proof is submitted
   on-chain.
4. The public ledger updates (`total` increases), but the hidden `amount` is
   never placed on-chain and never appears in the UI — it exists only inside
   the ZK proof.

The same arithmetic also powers `incrementAndReveal`, which a caller could use
to *deliberately* publish an amount via `disclose()`. MidnightTrace uses the
private path, showing how an auditor can prove work without leaking evidence.

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

# 4. Run the dev server
npm run dev
# open http://localhost:5173, connect your wallet (1AM or Lace) on Preprod, and run the circuit

# Or build for production
npm run build
npm run preview
```

## Deploy

The frontend is a static Vite build (output: `dist/`). Both `vercel.json` and
`netlify.toml` are included.

**Vercel:**

```bash
cd level2
npm install -g vercel
vercel --prod --env VITE_CONTRACT_ADDRESS=<your-preprod-address>
```

**Netlify:**

```bash
cd level2
npm install -g netlify-cli
netlify deploy --prod --dir dist
```

> The live URL connects to the Preprod contract address baked into
> `src/config.ts` (via `VITE_CONTRACT_ADDRESS`).

## Demo Video

https://drive.google.com/file/d/1U-yyNHPf1lOPNUK99Ix6JgZanA0ziv-i/view?usp=sharing

## Tests

```bash
cd level2
npm test   # builds the app, then verifies the dist/ bundle ships the ZK assets
```

## File Structure

```
level2/
├── contracts/            (reference — the counter.compact source)
├── public/
├── src/
│   ├── components/
│   │   ├── WalletConnect.tsx
│   │   └── CircuitCall.tsx
│   ├── hooks/
│   │   └── useMidnight.ts
│   ├── lib/              (providers, wallet adapter, ledger, types)
│   ├── contract/compiled/counter/  (compiled ZK assets, served statically)
│   ├── App.tsx
│   ├── main.tsx
│   └── config.ts         (Preprod contract address)
├── tests/
├── .github/workflows/    (CI build check)
├── vercel.json / netlify.toml
└── package.json
```
