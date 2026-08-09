# Midnight Counter — Privacy-Preserving Counter on Midnight

> A Compact smart contract that maintains a public on-chain counter while keeping each increment's step amount private behind a Zero-Knowledge proof — with an explicit, deliberate disclosure path.

## Contract Address

| Network  | Address                          |
|----------|----------------------------------|
| Preview  | `e86050af934fed3ed7d6e8dfab05a7198d4d91521b68279ecaccd26e68d4ffb6` |
| Preprod  | [PASTE ADDRESS AFTER DEPLOY]     |

## What This Does

This is a Midnight Network smart contract written in Compact. It implements a
simple counter with a privacy twist:

- Anyone can call `increment(amount)` which advances the public counter `total`
  by the given amount — but the *amount itself* is a private witness that is
  never stored on-chain.
- `incrementAndReveal(amount)` does the same arithmetic but *deliberately*
  publishes the amount into the public `lastDisclosed` ledger field via
  `disclose()`.

The same shared arithmetic appears in both circuits; the only difference is
whether the caller chooses to keep the amount private or reveal it. This is the
core Midnight pattern — *selective disclosure* — applied to the smallest
meaningful contract: a counter.

## Privacy Model

- **What is PUBLIC (on-chain, visible to anyone):**
  - `ledger total` — the running counter value. Every call produces a
    publicly visible new value.
  - `ledger lastDisclosed` — the most recent step amount that a caller
    deliberately published using `incrementAndReveal`.
- **What is PRIVATE (private witness, never on-chain):**
  - The `amount` argument of each circuit. It exists only in the caller's
    ZK witness and is fed into the circuit; unless a circuit explicitly
    `disclose()`s it, the amount never appears in the ledger.
- **What the user PROVES without revealing:**
  - That the new `total` honestly equals the previous `total` plus the
    hidden `amount` — without the network or anyone else learning the
    `amount`. Privacy is enforced by the Compact compiler, which rejects
    any implicit disclosure (see the amendment comment header in
    `contracts/counter.compact`).

## Tech Stack

- Midnight Network
- Compact smart contract language
- Node.js v22
- Docker (for the local proof server)
- TypeScript, Vitest, @midnight-ntwrk SDK packages

## Prerequisites

- Node.js v22 (tested with 22.x; the Midnight toolchain requires ≥ 22)
- Docker running (Docker Desktop with the WSL2/Linux integration enabled)
- The Compact compiler: `npm install -g @midnight-ntwrk/compact-compiler`
- The Midnight proof server container (pulled automatically by the dev tools):
  `docker pull midnightntwrk/proof-server`
- A funded Midnight wallet for Preview/Preprod (funded at the network faucet)

## Setup

```bash
# 1. Install dependencies
cd level1
npm install

# 2. Start the proof server (pins the SDK-compatible proof-server image)
docker compose up -d --wait proof-server
# or, with plain Docker:
#   docker run -p 6300:6300 midnightnetwork/proof-server

# 3. Compile both contracts into contracts/managed/
npm run compile

# 4. Deploy the counter contract to Preview
#    (prints your wallet address — fund it at the faucet, then it continues)
npm run deploy -- --network preview --contract counter
#    Preprod: npm run deploy -- --network preprod --contract counter
```

## Run Tests

```bash
cd level1
npm test
```

The 8 unit tests in `tests/counter.test.ts` run the compiled contract offline
through a `CounterSimulator` (no network, no wallet, no proof server). They
cover circuit logic, cumulative state transitions, and — critically — that a
non-deliberate witness amount never lands in public ledger state while a
deliberate `disclose()` does.

## Initial Idea

[LEAVE PLACEHOLDER — I will fill this in manually]

## Screenshots

[LEAVE PLACEHOLDER — I will add compile output and contract Deploy address screenshot]

## Notes

- Deployment records are stored in `.midnight-state.json` (gitignored).
- Wallet seeds per network are in `.midnight-state.json`; wallet sync cache lives
  in `.midnight-wallet-state/` (gitignored).
- Use `npm run clean` to remove generated artifacts and reset local state.