# MidnightTrace — Onboarding Guide for Testers (Preprod)

> Goal: 2 minutes — prove a forensic step without exposing the evidence, on **Midnight Preprod** (not Mainnet).

## Checklist

1. **Install Lace** — Chrome Web Store → *Lace* extension → Create wallet → Save recovery phrase offline.
2. **Select Midnight Preprod** — Open Lace → Network → **Midnight Preprod** (header should show `Preprod`). If you see `Mainnet`, switch.
3. **Open the dApp** — Go to **https://midnighttrace.vercel.app** → Start at **Home** (1-line privacy explainer) → then **Dashboard**.
4. **Connect wallet** — On the dApp, click **Connect wallet** → Approve in Lace → You should see `Wallet connected on Preprod` + `aggregate` on Dashboard.
5. **Use the main feature — Log a hidden step:**
   * Go to **Cases → New case** → Create a case (e.g., `Test case 7`).
   * Open that case → *Investigate* → Keep **Log a hidden step** selected → Enter any number (e.g., `42`) → Click **Log step**.
   * (Alternative main action: **Disclose a finding** — publish the running total only when you choose.)
6. **Complete the transaction** — Lace will pop up → Review tNIGHT fee → Click **Approve** → Your wallet builds the ZK proof locally (private amount never leaves the wallet) → You’ll see `Generating proof…` (15–30s) + `Sending it on-chain…` (6–12s) with elapsed timer → You can keep browsing — it continues in background → Keep tab open until `Transaction landed on-chain` with `txId`/`block`.
7. **Verify the result** —
   * **Dashboard:** `aggregate` increased, but your `amount` never appears.
   * **Public Audit (`/audit`):** No wallet needed → Paste contract `c69ac004457738109af76035270359ffd7ef5019d4b166e82d9cfcefe3552d72` (or use default) → **Run audit** → Use **Filter by case ID** to find your case → `All integrity checks passed` + fingerprint.
8. **Send wallet address** — Copy your `mn_addr_preprod…` from Lace (Receive → Copy) → Paste it in the feedback form: https://docs.google.com/forms/d/e/1FAIpQLSdMZQVcwBSz4oQIHFUWWDdkxkBbyNo-wBMB7BiINVrQ70r9tw/viewform (or DM the coordinator). This counts you toward the **70 unique Preprod user target** (66/70 verified so far; see `LAUNCH_USERS.md`). The official response sheet is: https://docs.google.com/spreadsheets/d/1Ncc6OihXwjqCNs8Nm3CRIpyhNiFJsXEEFQlA4AyZGyA/edit?gid=1372265754#gid=1372265754
9. **Give feedback** — In the same form: rating 1–5, ease (Very Easy/Easy/Normal), what you liked, hardest part, one change you’d make → Submit. Your feedback directly shapes the next iteration (see `docs/FEEDBACK.md`).

### Need help?

* **No funds?** Get tNIGHT at https://faucet.preprod.midnight.network
* **Wallet not connecting?** Ensure Lace is on **Preprod**, refresh, and check `VITE_NETWORK_ID=preprod` in the dApp.
* **Proof failed?** Only team members can log steps — if you’re not on the allowlist, the circuit correctly rejects. Contact the deployer to be granted access.
* **Want to verify without a wallet?** Just open `/audit` — anyone can verify aggregate, totals, and allowlist root with no secrets.

