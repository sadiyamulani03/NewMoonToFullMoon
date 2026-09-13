# MidnightTrace — User Guide (Simplified)

> **In one sentence:** Prove you did forensic work on-chain without ever showing the evidence itself. MidnightTrace uses zero-knowledge proofs — the chain checks the math, not the data.

Full tech details are in [README](../README.md); the idea and mainnet plan are in [PROPOSAL.md](../PROPOSAL.md).

## Quick start (2 minutes)

1. **Open the dApp:** https://midnighttrace.vercel.app — start at **Home** for a 30-second explainer, then go to **Dashboard**.
2. **Connect your wallet:** Lace or 1AM, switched to **Preprod**, funded with tNIGHT (faucet: https://faucet.preprod.midnight.network).
3. **Try it:** *Cases → New case → Case detail → Investigate → Log a hidden step*. Then check **Audit** — no wallet needed to verify.

## Getting Started on Preprod

Plain-English setup for first-time testers on **Midnight Preprod** (not Mainnet):

1. **Install Lace wallet:** Add the Lace extension from the Chrome Web Store and create a wallet. (1AM also works.)
2. **Select Midnight Preprod:** Open Lace → Network → choose **Midnight Preprod**. If you see `preprod` in the wallet header, you are on the right network.
3. **Get Preprod funds (if needed):** Go to https://faucet.preprod.midnight.network, paste your wallet address, and request **tNIGHT** (test tokens). No real money needed.
4. **Open the live dApp:** Go to **https://midnighttrace.vercel.app** — this is the Preprod deployment (contracts `03123eac…` and `c69ac004…`).
5. **Connect wallet:** On the dApp, click **Connect wallet** → approve in Lace. You should see `Wallet connected on Preprod`.
6. **Use the application:** Follow *Your First Transaction* below, or browse **Home** for the 1-line privacy explainer.

## Your First Transaction

Beginner-friendly flow — your first ZK proof on Preprod:

1. **Connect wallet** (see above) — ensure the dApp shows `member` or `aggregate` on the Dashboard.
2. **Perform the main action:** Go to **Cases → New case** (create a case), open that case, and in *Investigate* choose **Log a hidden step** → enter any number (e.g., `42`) → click **Log step**.
3. **Approve the transaction:** Lace will pop up → review the fee in tNIGHT → click **Approve**. Your wallet builds the zero-knowledge proof locally.
4. **Wait for confirmation:** You’ll see `Generating proof…` (15–30s) then `Sending it on-chain…` (6–12s). Elapsed time and progress bar are shown — you can keep browsing while it finishes in the background.
5. **Verify the result:** When you see `Transaction landed on-chain` with a `txId` and `block`, check **Dashboard** (aggregate increased) and **Audit** (`/audit` → `Run audit` → filter by your case ID) — the total is public, the amount you entered stays private.

## 0. First-time setup (only for local deploy)

```bash
npm install
docker compose up -d --wait proof-server   # only for local deploys, not the demo
npm run compile
npm run deploy:midnighttrace -- --network preprod
```

The deploy prints two values:

* **Owner secret** — keep private (64 hex). It unlocks the first case.
* **Owner commitment** — hash on-chain (safe to share).

Put them in `.env`:

| Variable | Value |
|---|---|
| `VITE_MIDNIGHTTRACE_CONTRACT_ADDRESS` | printed contract address |
| `VITE_MIDNIGHTTRACE_OWNER_SECRET` | printed owner secret |

## 1. Cases

* **New case (`/new`)** — create a case file (title, description). This is off-chain metadata in the API.
* **Open on-chain** — in *Case detail → Investigate*, enter a **case number** (0, 1, 2…) and click **Open case on-chain**. This runs the `openCase` transaction.
* One contract holds many cases. The **Dashboard** shows the combined **aggregate** total.

## 2. Chain of custody

Every proof appears in *Chain of custody* in block order. Each entry shows:

* `txId` — the on-chain transaction
* Block number — when it finalized
* Step type — `Step logged`, `Finding disclosed`, or `Case sealed`
* Case number

Because the order comes from block numbers, no one can reorder or delete steps.

## 3. Private steps vs. public disclosures

**Private (default):**

1. In *Investigate*, select **Log a hidden step**.
2. Enter an **amount** — this is private and never goes on-chain. The proof only updates the public case `total`.

**Public (when you choose):**

1. Switch to **Disclose a finding**.
2. Enter the **running total** you want others to see. This writes to the public `lastDisclosed` field.

> **Privacy takeaway:** Disclosing is a choice, not a leak. Nothing private ever appears on-chain unless you explicitly disclose it.

## 4. Team access (private allowlist)

* The chain stores only **commitments** (hashes of secrets) in a tree — not names or secrets.
* Your wallet proves you are on the team with a **zero-knowledge membership proof** — the chain checks the proof, never sees who you are.
* To add a teammate: in *Team and membership*, paste their **64-hex secret** and click **Grant access**. Only team members can do this.

You can see the **allowlist root** (a short hash) on the Audit page — it is the fingerprint of the whole team tree.

## 5. Seal a case

* **Seal the case** runs `closeCase` and sets the case to **CLOSED**. Totals then never change.
* Receipts show block numbers, so auditors know how fresh each total is. The Audit page always reads **live** data from the indexer.

## 6. Audit — no wallet needed (`/audit`)

Anyone can verify:

1. Paste the contract address, pick **Preprod**, click **Run audit**.
2. Get a checklist:
   * contract reachable
   * aggregate equals sum of all case totals
   * each case has valid totals and phase
   * allowlist root pinned
   * disclosed totals match the receipt book
3. Use the **Filter by case ID** box to narrow to one case.
4. Copy the **audit fingerprint** (SHA-256) to prove two auditors saw the same state.

## 7. Export receipts

In *Chain of custody*, click **Export receipts (JSON)**. You get a file with every proof ordered (step type, txId, block, network) — ready to send to auditors or regulators.

## Wallet tips

* Use **Lace or 1AM** on **Preprod**. Proofs are built in your wallet — private data never leaves the browser.
* Your wallet creates a private **member secret** automatically. If you deployed the contract, set `VITE_MIDNIGHTTRACE_OWNER_SECRET` to your printed secret, or paste it in *Team and membership*.
* If your secret is not on the allowlist, the circuit correctly refuses to run — that is expected.

## Example forensic scenario

1. Open case #7.
2. Log three hidden steps with amounts `a1, a2, a3` — the ledger total becomes `a1+a2+a3` but the three amounts stay private.
3. Disclose the total when ready — the auditor sees only the total.
4. Seal the case; the Audit window shows CLOSED and a fingerprint.

Try this exact flow on Preprod with your wallet.

