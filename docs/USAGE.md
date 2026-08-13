# MidnightTrace — Level 4 User Guide

MidnightTrace is a privacy-first blockchain forensics desk. This guide walks
through the seven Level 4 capabilities on Preprod. Full architecture notes live
in the [README](../README.md); the product idea and mainnet plan are in
[PROPOSAL.md](../PROPOSAL.md).

## 0. Get the parts ready

```bash
npm install
docker compose up -d --wait proof-server     # only needed for deploys/Cli, not the demo
npm run compile
```

Deploy the investigation contract (Step 5 of the submission flow):

```bash
npm run deploy:midnighttrace -- --network preprod
```

The script prints two 64-hex values you must keep:

- **Owner secret** — the private key that boots the on-chain allowlist.
- **Owner commitment** — the hash that goes on-chain (safe to share).

Paste both into `.env` (see table in the README) and rebuild:

| Variable | Value |
|----------|-------|
| `VITE_MIDNIGHTTRACE_CONTRACT_ADDRESS` | the printed contract address |
| `VITE_MIDNIGHTTRACE_OWNER_SECRET` | the printed owner secret |

## 1. Multi-case management

- **Open a case file off-chain** under *New case* (`/new`) — a title, a
  description, an owner. This book lives in the Express API.
- **Open the same case on-chain** from *Case detail* → *Investigate* → give it
  a **case index** (`0`, `1`, …) and press *Open case # on-chain first*. The
  `openCase` circuit mints the on-chain case file.
- One contract hosts many case files at once. The chain reconciles them
  against a single `aggregate` you can inspect on the Dashboard.

## 2. Chain-of-custody timeline

Every proof you run is filed in *Chain of custody* in **finalization order**
(block height, then timestamp). Each entry shows:

- the `txId` of the Midnight transaction the ZK proof travelled in,
- the block it was finalized at,
- the step type (`Step logged` / `Finding disclosed` / `Case sealed`), and
- the case index.

Because ordering comes from on-chain block numbers, the timeline is
independently verifiable — nobody can quietly reorder or delete a step.

## 3. Selective disclosure (log a step, then reveal on your terms)

1. Under *Investigate*, keep *Log a hidden step* selected.
2. Enter an **amount** — this is a private witness. The `logStep` circuit
   raises the case `total` by that amount; the amount itself never exists
   on-chain or in the UI.
3. When you want a third party to see the running total, switch to *Disclose a
   finding*, enter the **running total** you choose to publish, and run it. The
   `discloseFinding` circuit writes it into the public `lastDisclosed` column
   (and into the receipt book as `total`).

The privacy guarantee: *disclosure is a deliberate act*, not a leak.

## 4. Private allowlist (zero-knowledge membership)

- The contract stores only **commitments** — `persistentHash` of each member's
  secret — inside a Merkle tree. Identity and secrets never appear on-chain.
- When you run any circuit, your client finds your commitment's **Merkle path**
  (private witness material) and the circuit proves, in zero knowledge, that
  the path's recomputed root matches the live on-chain root.
- To authorize a colleague: in the *Team and membership* panel paste their
  **secret** (64 hex), press *Grant access*. Only an allowlisted member can run
  `grantAccess`; a non-member's proof is rejected by the circuit.
- The allowlist root digest is public and printed in the Auditor, so everyone
  can pin the membership tree without seeing any member.

## 5. Freshness & integrity attestations

- **Sealing**: *Seal the case* runs `closeCase`, flipping the case phase to
  `CLOSED`. From then on the totals are permanent — the live Auditor reads
  `CLOSED` and treats `total` as the final number of record.
- **Freshness**: receipts carry block heights, so you always know how current a
  disclosed total was when published, and the Auditor reads *live* state
  directly from the Midnight indexer at the moment of the audit.

## 6. Public audit window — verifier with no wallet

The **Audit** page (`/audit`) needs **no wallet, no secret, no membership**.
Any third party can:

1. Paste the deployed contract address (and pick a network).
2. Press *Run audit*.
3. Get a pass/fail checklist that independently verifies, against on-chain
   state:
   - the contract is reachable,
   - the aggregate reconciles with the sum of all case totals,
   - each case's invariants (non-negative totals, disclosed ≤ total),
   - the allowlist root is pinned, and
   - disclosed totals in the team's receipt book match what is on-chain.

The audit window shows the on-chain ledger (per-case totals, `lastDisclosed`,
event counts, phases) and an **audit fingerprint** — a SHA-256 of the recorded
truths, so two auditors can compare that they saw the same state.

## 7. Receipt export

In the *Chain of custody* panel, press **Export receipts (JSON)**. You get a
machine-readable record (`midnighttrace-receipt-export`) listing every proof,
ordered, with step type, txId, block height, network, and disclosed total — the
exportable chain-of-custody deliverable for regulators or opposing auditors.

## Wallet notes

- **1AM or Lace** on **Preprod**. The wallet hosts proof generation; no private
  witness ever leaves the browser.
- The dApp derives a deterministic per-wallet **member secret** from your
  shielded address. If you are the deployer (owner), instead set
  `VITE_MIDNIGHTTRACE_OWNER_SECRET` to your printed owner secret, or paste it
  in the *Team and membership* panel (*Use as my member secret*). Without a
  matching commitment on the allowlist, circuits correctly refuse to run.
- The Counter circuit (Levels 1–3 dashboard) and the MidnightTrace contract can
  both be driven from the same wallet session.