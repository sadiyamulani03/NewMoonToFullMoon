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

## What We Heard (Themes)
- **Overall:** 6 of 8 testers rated 4–5/5; one rated 3/5. App was easy to use for most; two hit **wallet connection timeout** issues.
- **Favorite features:** the public **Audit window** (3 mentions), the **Dashboard**, the **privacy concept**, and the **noir/retro theme** (2 mentions).
- **Bugs:** two testers couldn't run the dApp on mobile due to **wallet connection timeouts** (Midnight wallets need a desktop extension — handled in the mobile UX update).
- **Suggestion themes:**
  - Explain **zero-knowledge proofs** more (1 request) — ✅ done
  - **Better wallet connection status** (1 request) — clearer connect/error messaging
  - **Localization** — UI appeared mixed English/Turkish for one tester (browser auto-translation)
  - **Visual ergonomics** — dense stripe background causes eye strain / contrast issues; text-heavy, could use icons; duplicate "Connect wallet" buttons in header + wallet card

## What We Changed
| Change | Reason | Commit |
|--------|--------|--------|
| Added "How zero-knowledge proofs work" explainer to the About page | Tester suggested "add more explanation of ZK proofs" | `6d1bd32` |
| Added ZK proof note to the Audit window intro | Same suggestion; Audit was the most-mentioned feature | `6d1bd32` |