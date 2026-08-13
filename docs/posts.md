# MidnightTrace — Level 4 X/Twitter posts

Three promotional threads for the Midnight Builder Challenge Level 4 submission.
Pair with the live link (https://midnighttrace.vercel.app), a screenshot of the
Public Audit window, and the GitHub repo.

---

### Post 1 — The problem (launch)

> Blockchain is the worst place to keep secrets — and the best place to prove
> you don't have to.
>
> Forensic examiners must *prove* each step of an investigation without
> leaking the evidence itself. MidnightTrace is that desk: every analysis step
> lands on-chain as a zero-knowledge proof, while the amount stays private.
>
> Level 4 ships:
> • Multi-case desk with a private allowlist
> • Log hidden steps, disclose on your terms
> • Chain-of-custody timeline with receipt export
> • A wallet-free public audit window
>
> Built in Compact on @MidnightNetwork. https://midnighttrace.vercel.app
> #MidnightNetwork #ZeroKnowledge #Forensics

### Post 2 — The privacy core (ZKP explainer)

> How does an on-chain case file stay private?
>
> MidnightTrace stores only *commitments* — hashes of member secrets in a
> Merkle tree. Proving you're on the investigation team is a ZK membership
> proof: your secret opens a leaf, the root matches on-chain, and *which leaf
> is yours* never leaves your wallet.
>
> Same idea for the numbers. A step's `amount` is a private witness — the
> circuit proves `total' = total + amount` without ever publishing `amount`.
> Disclosure is a deliberate act (discloseFinding), never a leak.
>
> Selective disclosure, natively. #DPR #MidnightNetwork

### Post 3 — The honest auditor (verifiability, no trust)

> Anyone can audit a MidnightTrace investigation — no wallet, no secret.
>
> The Public Audit window reads the live ledger straight from the Midnight
> indexer and pins:
> ✅ aggregate == Σ case totals
> ✅ each case's disclosures
> ✅ the allowlist root
> ✅ disclosed receipts match on-chain
>
> It even prints a SHA-256 fingerprint of the on-chain truths, so two auditors
> can prove they saw the same state.
>
> That's auditability without surveillance. #Verifiable #Web3 #MidnightNetwork