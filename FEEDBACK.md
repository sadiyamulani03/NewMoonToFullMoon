# User Feedback — Level 5

## Feedback Collection Method

Collected via a short online feedback form (e.g. Google Forms) shared after each
tester tries the dApp, plus optional follow-up in DMs/Telegram for specifics.
Form link: https://docs.google.com/forms/d/e/1FAIpQLSdu1YTgndgZVt7H9Wp4Ygesg7iPk4UhPPm80SZCjupbuOlHag/viewform
Responses sheet: https://docs.google.com/spreadsheets/d/1sFUZgxrgwmuzkYCVkcxC3DNAmBqUymqzejVyTPjwtKc/edit

Form fields (all optional, ~1 min):

1. **Wallet address** (Preprod) — so we can log you in USERS.md *(text, required)*
2. **Overall experience** — 😀 Loved it / 🙂 Good / 😐 Okay / 😞 Confusing *(single choice)*
3. **Easiest thing to do** *(short text, optional)*
4. **Hardest or most confusing part** *(short text, optional)*
5. **Anything you'd change or add?** *(short text, optional)*

## Raw Feedback Log
| # | User | Feedback Summary | Date |
|---|------|-----------------|------|
| 1 | `mn_addr_preview10ehmmgf…` | 5/5, very easy to use, liked the Audit page, no bugs, nothing to change | 2026-08-15 |
| 2 | `mn_addr_preprod1sjt4wn…` | 5/5, very easy, liked the Dashboard, no bugs | 2026-08-15 |
| 3 | `mn_addr_preview1jqh0xan…` | 5/5, very easy, liked the Audit page, no bugs | 2026-08-15 |
| 4 | `mn_addr_preprod1jqh0xan…` | 5/5, very easy, liked the Audit page, no bugs | 2026-08-15 |
| 5 | `mn_addr_preprod14puds48…` | 5/5, easy, liked the privacy concept, no bugs — suggested more explanation of ZK proofs | 2026-08-16 |
| 6 | `mn_addr_preprod1vrfws32…` | 3/5, normal ease, liked the Dashboard, no bugs — suggested better wallet connection status | 2026-08-16 |
| 7 | `mn_addr_preview14gydf7u…` | 4/5, normal, liked the noir/retro theme but couldn't test features (wallet connection timeout) — suggested localization, loading indicators, background contrast, icons, fewer duplicate buttons, error toasts | 2026-08-17 |
| 8 | `mn_addr_preprod14gydf7u…` | 4/5, normal, liked the noir/retro theme — same detailed feedback as #7 (localization, loading states, contrast, icons, duplicate buttons, error boundaries) | 2026-08-17 |
| 9 | `mn_addr_preprod1lgfpgdf…` | 5/5, very easy, liked case creation, no bugs | 2026-08-18 |
| 10 | `mn_addr_preprod1qxfvktg…` | 5/5, very easy, liked the privacy feature, no bugs | 2026-08-18 |
| 11 | `mn_addr_preprod128f7563…` | 5/5, very easy, liked the UI, no bugs | 2026-08-18 |
| 12 | `mn_addr_preprod13tl9q45…` | 4/5, easy, liked the Audit page — proof generation took a while; suggested a transaction progress indicator | 2026-08-18 |
| 13 | `mn_addr_preprod1gmdyfxe…` | 4/5, easy, liked the privacy concept + simple interface — wallet connection took a few seconds; asked for clearer first-time instructions and a status indicator during proofs | 2026-08-19 |
| 14 | `mn_addr_preprod143zsqtz…` | 5/5, easy, overall good experience, no bugs | 2026-08-19 |
| 15 | `mn_addr_preprod12a4wlq6…` | 5/5, very easy, liked the proof workflow, no bugs | 2026-08-19 |
| 16 | `mn_addr_preprod1guapunl…` | 5/5, easy, liked the clean design — transaction took a while; wants transactions to work faster | 2026-08-19 |
| 17 | `mn_addr_preprod1lrh5s9l…` | 5/5, easy, liked the unique dApp idea, no issues | 2026-08-19 |
| 18 | `mn_addr_preprod1g0v8ay4…` | 3/5, normal, liked the Dashboard — some terminology was unclear; suggested tooltips for technical terms | 2026-08-20 |
| 19 | `mn_addr_preprod14k6g4l7…` | 5/5, very easy, overall good experience, no bugs | 2026-08-20 |
| 20 | `mn_addr_preprod1hd2wmhz…` | 4/5, easy, liked the proof workflow — suggested showing proof-generation progress | 2026-08-20 |

## What We Heard (Themes)
- **Overall:** 15 of 20 testers rated 5/5; three rated 4/5; one rated 3/5.
- **Favorite features:** the public **Audit window** (4 mentions), the **privacy concept** (2), **case creation**, the **Dashboard** (2), the **UI/clean design** (2), the **proof workflow** (2), the **unique idea**, and the **noir/retro theme** (2).
- **Bugs / friction:** mobile **wallet connection timeouts** (2 — Midnight wallets need a desktop extension; handled in the mobile UX update); **proof generation and transactions take a while** (3 mentions — progress indicator now added).
- **Suggestion themes:**
  - Explain **zero-knowledge proofs** more (1 request) — ✅ done
  - **Better wallet connection status** (2 requests) — ✅ done (status messages + retry label)
  - **Duplicate Connect buttons** (1 request) — ✅ done
  - **Transaction progress indicator** (3 requests) — ✅ done
  - **Clearer first-time instructions** (1 request) — ✅ done (Dashboard guide)
  - **Tooltips for technical terms** (1 request) — explain terminology in the UI
  - **Faster transactions** (1 request) — infra/chain-side, not UI
  - **Localization** — UI appeared mixed English/Turkish for one tester (browser auto-translation)
  - **Visual ergonomics** — dense stripe background causes eye strain / contrast issues; text-heavy, could use icons

## What We Changed
| Change | Reason | Commit |
|--------|--------|--------|
| Added "How zero-knowledge proofs work" explainer to the About page | Tester suggested "add more explanation of ZK proofs" | `6d1bd32` |
| Added ZK proof note to the Audit window intro | Same suggestion; Audit was the most-mentioned feature | `6d1bd32` |
| Better wallet connection status messages | "Better wallet connection status" request + connection timeouts | `e489068` |
| Removed duplicate "Connect wallet" buttons (header + card) | Testers flagged redundant stacked Connect buttons | `e489068` |
| Added transaction progress indicator (stage + elapsed time + bar) | "Proof generation took some time" — wanted a progress indicator | `9ccb2c9` |
| Added first-time user guide on the Dashboard (dismissible) | "Add clearer instructions for first-time users" | `1698bb9` |
| Added Glossary section to About page defining technical terms | "Add tooltips for technical terms" request | `eafc482` |
| Styled the Audit result badge/checks, ledger table, case timeline, and sealed status tags | Testers liked the Audit page; these rendered unstyled | `6153fc6` |
| Softened the dense header stripe and raised text contrast | "Dense stripe background causes eye strain / contrast issues" | `6153fc6` |
| Added icons to the main navigation | "Text-heavy, could use icons" | `6153fc6` |
| Added a global error boundary (recovery card instead of blank screen) | Tester suggested "error boundaries" in detailed feedback | `367dd95` |
| Added spinners to data-loading states | Tester suggested "loading indicators" | `367dd95` |
| Mobile nav scrolls horizontally instead of wrapping | Mobile UX polish for smaller screens | `367dd95` |
| Marked the app root `translate="no"` | "UI appeared mixed English/Turkish (browser auto-translation)" | `367dd95` |