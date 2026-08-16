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

## What We Heard (Themes)
- **Overall:** all 5 testers rated 5/5; the app was easy to use on first try.
- **Favorite features:** the public **Audit window** (3 mentions) and the **Dashboard** (1 mention).
- **Bugs:** none reported.
- **Suggestion:** explain **zero-knowledge proofs** more (1 request).

## What We Changed
| Change | Reason | Commit |
|--------|--------|--------|
| Added "How zero-knowledge proofs work" explainer to the About page | Tester suggested "add more explanation of ZK proofs" | `6d1bd32` |
| Added ZK proof note to the Audit window intro | Same suggestion; Audit was the most-mentioned feature | `6d1bd32` |