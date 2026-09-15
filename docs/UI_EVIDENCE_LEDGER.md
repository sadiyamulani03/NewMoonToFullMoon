# MidnightTrace — Evidence Ledger UI (2026-09 redesign)

Replaces the previous generic dashboard skin with an **evidence-ledger** system grounded in the real mechanic: *content that is provably real but partially redacted*.

No contract, wallet-hook, or API logic was changed — `contracts/midnighttrace.compact`, `src/hooks/useMidnight.ts`, `src/lib/api.ts`, `src/context/DemoContext.tsx` are untouched. This is **UI/UX only**.

---

## Design direction

**Folder, not dashboard.** The app reads as a case folder with ledger inserts, not SaaS cards.

- **Redaction bars** (`#0D0F12` solid, not blur) for every private `amount`
- **Verification stamps** (rotated mono border, not checkmark icons) for `Verified / Sealed / Disclosed`
- **Folder-tab side rail** (`src/components/Layout.tsx:1`) — tabs protrude 1px into content when active, paper-cream on ink-navy
- **Ledger rows with 1px dividers** — card treatment reserved for the single inspected object (`.inspect`)

### Tokens — `src/styles.css:1`

```
--ink: #14181F        ledger-ink navy (app bg)
--paper: #EDE7D8      case-paper cream (marketing bg)
--redact: #0D0F12     true redaction black
--verify: #3FA772     muted verify-green
--ochre: #C98A3E      pending/disclosed
--blue: #5B7FBD       soft blue for proof/wire diagrams
--radius: 4px        3–6px range, no double borders
--line: 1px solid    single borders only
```

Fonts loaded in CSS (`@import`):

- **Fraunces** — headlines only (`--font-display`)
- **IBM Plex Sans** — all UI text (`--font-sans`)
- **IBM Plex Mono** — only hashes, case IDs, tx values (`--font-mono`)

Shadows are removed except for the inspected card; everything else is flat 1px.

---

## Pages — what changed

| Page | File | Old | New |
|------|------|-----|-----|
| **Landing** | `src/pages/Landing.tsx:1` | 6+ stacked cards, repeated privacy model, generic shield | **3 sections only**: (1) hero anchored on one concrete redacted entry `#07` with `total 42` + `Verified` stamp + wire `amount → total' = total+amount`, (2) real 4-step `01 Open → 02 Log → 03 Disclose → 04 Verify`, (3) single CTA (demo + launch). No privacy-model duplication. |
| **Dashboard** | `src/pages/Dashboard.tsx:1` | Hero + 2 stats grids + duplicate privacy card + FirstTimeGuide | **Hero + single `stats-row`** (`open / findings / disclosed / verified this week`) + **one recent-activity `ledger`** (5 inserts, redacted + stamp). Wallet status folded into hero footnote. |
| **Cases** | `src/pages/Cases.tsx:1` | Flat list, blank on API reset | **Ledger list** with `input` search/filter, ochre/verify legend, **real empty state** (`🗂️ Ledger just reset — ephemeral store explanation + Open first case / Try demo`). Each row shows folder insert: title, `mono #id`, `redacted → total verified`, `Open/Sealed` stamp. Demo-aware. |
| **CaseDetail** | `src/pages/CaseDetail.tsx:1` | 5 stacked vertical cards | **2 panels max** at `grid 0.95fr / 1.05fr` (stacks on mobile): **(a) `inspect` — status + primary actions** (public total / last disclosed, phase, owner, case-# input, action select `Log/Disclose/Close`, amount → redacted wire, member grant inline) **(b) `ledger` — history + receipts** (timeline dots blue/verify/ochre, `redacted` + `Verified/Disclosed` stamps, export). Sticky left panel. |
| **Auditor** | `src/pages/Auditor.tsx:1` | Generic audit table, 7+ mixed checks | **Wallet-free checklist**: input `Case ID` (+ network/contract), button `Verify case #N` / `Run full-ledger check`, **pass/fail `checklist`** with 4 required items: `Aggregate matches sum`, `Allowlist root matches`, `Phase order valid`, `No future-block references`, plus `Case #N exists` when filtered. Fingerprint + ledger snapshot table uses `redacted` for amounts, `Verified/Sealed` stamps. Demo branch uses `mockLedger` — `Demo — not on-chain` label. |
| **About** | `src/pages/About.tsx:1` | Long generic docs, scattered privacy notes | **Single home for privacy model** (3-column ledger: Public / Private (black bars) / Proved in ZK), wire diagram `amount —ZK→ total + Verified`, **concrete 3-batch worked example** `#07` table (Open → 3× hidden batch → Disclose → Close) with observer vs auditor ledger view, glossary with `Redacted / Verified / Disclosed`. |
| **New case** | `src/pages/CreateCase.tsx:1` | Old `.card` form | Restyled to `inspect` + `wire` footer, same logic. |

**Shells**

- `src/components/Layout.tsx:1` — `app-shell` now `168px` folder rail (`rail`, `rail-tab`), not flat sidebar. Tabs protrude when active (`paper` background, `::after` spine). Demo toggle in rail callout + footer wallet pill. Mobile wraps to top row.
- `src/components/MarketingLayout.tsx:1` — `marketing-shell` is `paper` cream (`#EDE7D8`) with `marketing-header` + paper tabs. Demo toggle in header.
- `src/styles.css:1` — full token reset: `13.98 kB` (was `31.29 kB`). Defines `.redacted`, `.stamp`, `.ledger`, `.stats-row`, `.inspect`, `.wire`, `.checklist`, `.empty`, `.demo-bar`.

---

## Demo / guest mode

Every page reads `useDemo()`.

- Toggle: rail callout `Try demo — no wallet` / `● Demo on` (`Layout.tsx:18`), marketing header button, `demo-bar` banner at top of each app page (`Ledger-wrap` in `Layout.tsx:108`)
- Label: every mock value shows `Demo — not on-chain` (`stamp-verify`) and `redacted` bars stay black
- Data: `DemoContext.tsx:15` seeds `Case #07` (2 hidden + 1 disclose → total 42) and `Case #12` in-memory; actions (`demoLogStep`, `demoDisclose`, `demoClose`, `demoOpenCase`) mutate `mockCases` + derived `mockLedger` without touching chain or wallet
- No wallet or `tNIGHT` needed — reviewer can `Dashboard → Cases → Case #07 → Log finding → Disclose → /audit → Verify #07` entirely wallet-free

---

## How to drop into existing repo (Vite + React)

The new UI assumes the existing project at this repo root:

```
npm install
npm run build   # tsc -b && vite build — must pass
```

Files to replace (UI only):

```
src/styles.css                 — tokens + ledger system (overwrites old file)
src/components/Layout.tsx      — folder-tab rail
src/components/MarketingLayout.tsx — cream marketing shell
src/pages/Landing.tsx
src/pages/Dashboard.tsx
src/pages/Cases.tsx
src/pages/CaseDetail.tsx
src/pages/Auditor.tsx
src/pages/About.tsx
src/pages/CreateCase.tsx       — restyled to match
```

Keep untouched:

```
contracts/midnighttrace.compact
src/hooks/useMidnight.ts
src/lib/api.ts
src/context/DemoContext.tsx / MidnightContext.tsx
src/lib/ledger.ts
```

No env changes. `npm run build` now emits `dist/assets/index-*.css 13.98 kB` and `✓ built in ~30s`.

---

## Visual QA checklist

- [ ] Landing hero shows one redacted entry with `Verified` stamp before any other section
- [ ] No privacy-model table appears on Landing — only on About
- [ ] Dashboard shows exactly one 4-cell stats row + one ledger (not two grids)
- [ ] Cases empty state is illustrative (not blank) when API resets
- [ ] CaseDetail is 2 panels max on `>860px`, never 5 stacked cards
- [ ] Auditor shows 4 checklist rows (aggregate / root / phase / future-block) + optional case filter
- [ ] Every private amount is a solid `#0D0F12` bar, not blur or `•••`
- [ ] Borders are 1px, radius 4–6px, no stacked shadows
- [ ] Demo banner reads `Demo — not on-chain` and disappears when toggled off
