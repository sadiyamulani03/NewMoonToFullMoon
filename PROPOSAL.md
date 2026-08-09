# Product Proposal

## What is the product, and who uses it?

MidnightTrace is a **privacy-first blockchain forensics dashboard**. It gives
auditors, compliance officers, and forensic analysts a way to *prove that they
performed an investigative step* — traced a hidden transfer, counted evidence
items, verified a batch size — without ever disclosing the underlying amounts.

Who uses it:

- **Forensic analysts** who must document a chain of custody for each analysis
  step without leaking the sensitive data they analysed.
- **Compliance / anti-money-laundering teams** that need auditable proof of
  due-diligence checks without exposing transaction amounts to third parties.
- **Regulators and external auditors** who want to verify *that* evidence was
  examined and *that* the math checks out, while respecting data privacy.

The product shows, per case: how many proof steps ran, the on-chain receipt for
each proof, and the running (public) total — while the amount inside every
proof stays private.

## Why Midnight specifically?

Midnight's data-privacy model is the core reason: a developer can keep
sensitive data private while still *proving properties about it* on-chain.
Most other chains either publish everything or, at best, offer opaque
commitments that are hard for third parties to verify.

- The **counter contract** is the exact pattern forensics needs: a private
  witness (`amount`) is fed into a circuit, the proof `total' = total + amount`
  goes on-chain, and the amount itself never does. This is `increment(amount)`
  in `counter.compact`.
- A deliberate `incrementAndReveal` path exists, letting a case owner choose to
  publish an amount when regulation requires it.
- Midnight's **Compact language + ZK wallet proving** means proofs are generated
  for a connected wallet, and the server never sees the private witness — so a
  compromised API cannot leak case evidence.

## Data Model

| Data Point | Type | Disclosed To |
|------------|------|--------------|
| `ledger.total` | Uint (public ledger) | Everyone — updated on every circuit call |
| `ledger.lastDisclosed` | Uint (public ledger) | Everyone — only when a caller deliberately discloses |
| `amount` (circuit witness) | Uint (private witness) | No one — fed into the ZK proof only |
| `case.id` / `case.title` / `case.description` | String (server DB) | Case owner + anyone they share the case link with (off-chain metadata, not on-chain) |
| `case.owner` | String (server DB) | Case owner (off-chain metadata) |
| `receipt.txId` | String (server DB) | Case owner + anyone with the case link (points to the public on-chain tx) |
| `receipt.blockHeight` | Number (server DB) | Case owner + anyone with the case link |
| `receipt.total` | String (server DB) | Case owner + anyone with the case link — stores only the **public** ledger total, never the witness |

Rows to add as the product grows: encrypted evidence hashes, retention/expiry
timestamps, auditor access keys, multi-signature handoff records.

## Mainnet Feasibility

The dApp needs, on mainnet:

- **A deployed `counter.compact` contract** — same contract, higher security
  threshold. Deployment and address baking are already automated
  (`npm run deploy`), so this is a config change, not new code.
- **An indexer** for public ledger state — the app already uses the public data
  provider; mainnet indexer endpoints replace the preprod ones in `config.ts`.
- **A proof server or wallet-delegated proving** — proofs are already generated
  for a connected wallet (1AM sponsors proving + fees on preprod). On mainnet,
  the same wallet-delegated flow applies, or a self-hosted proof server can be
  pointed to via the proof-provider config.
- **The Express API** needs a persistent host (Node process + disk) instead of a
  JSON file — swap `server/index.mjs`'s store for a hosted database; the REST
  interface is unchanged.
- **Wallet integration** — 1AM / Lace on mainnet; the DApp Connector flow is
  network-agnostic once `NETWORK_ID` is set to mainnet.