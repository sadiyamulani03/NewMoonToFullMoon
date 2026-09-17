# MidnightTrace — Design Research (Sep 17, 2026 Revision)

> Before implementing the UI revision, we researched current Pinterest and Dribbble patterns for privacy/security SaaS, Web3 dashboards, developer tools, and modern landing pages. No design was copied. Principles below were extracted and translated into an original "evidence ledger" system.

## Sources Consulted

- **Pinterest / Gestalt** — `shadcn.io/design/pinterest`, `styles.refero.design/style/pinterest`, `designsystems.one/gestalt`, `open-design.ai/plugins/design-system-pinterest`, `awesome-design-md/pinterest/DESIGN.md`
- **Dribbble** — searches for "privacy security SaaS dashboard", "Web3 dashboard dark mode", "developer tools dashboard", "cybersecurity landing page hero" (Secureth hero, Cloud Security Dashboard, Cyber Dashboard — Endpoint Protection, FinSight AI Ops & Compliance, Apollo GraphQL Explorer dark-mode case study)
- **Enterprise SaaS typography** — Lollypop "B2B SaaS Typography Rules" (Minor Third scale, mono for data, 8px grid)

## Patterns Extracted (not copied)

### 1. Layout & Spacing (Pinterest Gestalt + SaaS dashboards)
- **8px base grid** with 4/6/12/16/24/32/64 steps; **64px section rhythm** between major blocks.
- **Max width 1180–1280px**, centered, with internal 16–24px gutters — not edge-to-edge masonry.
- **Quiet chrome**: warm-cream/paper surfaces recede, imagery/data leads. Flat tonal bands create depth instead of heavy shadows.
- **Dribbble SaaS dashboards**: data-dense but hierarchical — KPIs first, context second, deep analytics third. Every widget has a purpose; no equal-weight card walls.

**Adopted for MidnightTrace:**
- `src/styles.css` tokens: `--space-section: 64px`, `--max: 1180px`, `--radius: 10px / --radius-lg: 14px` (modern SaaS, up from 4/6px).
- Single section gap between Landing blocks, consistent `ledger` containers, flat tonal bands (ink) rather than gradients.

### 2. Typography Hierarchy
- **Pinterest**: Pin Sans only, 70px display-xl (−1.2px tracking) drops steeply to 16px body; hierarchy via size + weight, not color.
- **Enterprise SaaS**: disciplined scale (Major Second 1.125 / Minor Third 1.2), 7-step scale, **mono for numbers/data** (IBM Plex Mono), label vs value typographically distinct (weight+size+color).
- **WCAG**: 4.5:1 body, 3:1 large text; never rely on color alone.

**Adopted:**
- Fraunces (display) + IBM Plex Sans (UI) + IBM Plex Mono (data) unchanged but tightened tracking on H1 (`-0.035em`), mono labels at 0.62–0.68rem uppercase, values larger/heavier in mono.
- Body 1.4 line-height, data rows 1.4, chart axes 1.2.

### 3. Shape & Radius Discipline
- **Pinterest**: two-radius system — `16px` for buttons/cards, `32px` for modals/large cards, `pill` for chips/search. No value in between.
- **Dribbble security dashboards**: 12–16px radius on cards, pill for status badges, no sharp corners.

**Adopted:**
- `--radius: 10px` (buttons/inputs/cards), `--radius-lg: 14px` (large ledger/inspect), `--radius-pill: 9999px` (chips, badges) — simplified two-step, no 4px legacy.

### 4. Color — Single Accent Rule
- **Pinterest Red** reserved exclusively for primary CTA; every other surface warm-cream/plum.
- **Secureth/Cloud Security**: dark navy base (`#070A12` / `#0B1020`) with **one amber/gold for CTAs** and **one green for success**, never decorative.

**Adopted:**
- `--ink: #0B1020` (primary midnight), `--ochre: #F4C770` (primary CTA only), `--verify: #3FA772` (success only). Supporting tints: `verify-soft/border`, `ochre-soft/border` for stamps. No random blues/decorative gradients.

### 5. Navigation & Information Architecture
- **Pinterest**: sticky 64px white nav, minimal text links, search as primary element, hamburger at 768px.
- **Dribbble SaaS**: left rail 168px for dashboards (active tab filled, icons 16px, gap 2px), sticky top header 64px for marketing; tabs use `border-right: none` trick to merge with content.

**Adopted:**
- Marketing: sticky 64px `marketing-header` with 5 text links + 2 CTAs (Try demo ghost + Enter gold). Dashboard: 168px `rail` with `rail-tab-active` filled paper, negative tracking on kicker.
- No mega-menus; active states via background + border, not color alone.

### 6. Cards / Dashboard Patterns
- **FinSight/Cloud Security**: KPI stat row (4-up, each `value / label / trend`), wire diagram (PRIVATE → ZK → VERIFIABLE), checklist (pass/fail rows), ledger timeline (dot + tx meta), filtered table (search + status stamp).
- **Empty/loading**: shimmer skeletons, `📁` empty with descriptive text + primary CTA + secondary ghost.

**Adopted:**
- Stats row 4-up with mono values; wire `PRIVATE → ZK → VERIFIABLE` three boxes; inbox-style ledger rows with `Verified/Sealed` stamps; cases filter (`q`) + `Clear`; shimmer `.skeleton` + `.spinner`.

### 7. Landing Page Structure (Pinterest home + SaaS hero)
- **Pinterest home**: asymmetric 2-column hero (70px headline + CTA vs image stack), alternating feature bands (text+image), masonry grid below fold, 80–120px gaps.
- **Secureth**: headline left (Prove work → Keep private), wire excerpt right, pill row below headline, demo/video + quotes split.

**Adopted (Landing.tsx):**
- Hero 1.15fr/0.85fr ledger: headline + 2 CTAs + faucet/audit links + stats row left; live ledger excerpt wire right.
- Features 3-up ledgers, "How a case moves" timeline, video + quotes split, worked example table, FAQ accordion, live demo ledger, final CTA — each separated by consistent `gap: 18px` within `marketing-container`.

### 8. Privacy/Security Product Aesthetics
- **Copy tone**: "Verify sensitive analysis. Reveal only what needs to be known." Headline answers What/Problem/Why privacy/Why Midnight in 5–10s.
- **Visual metaphor**: redaction bar (black `████`) as feature, not bug; rotated `Verified` stamp; mono wire `total' = total + amount`.

**Adopted:**
- Hero sub: "use private evidence to produce zero-knowledge proofs without exposing underlying data. The ledger shows you counted, not what you counted." Privacy model isolated to `/about`, not repeated per page.

## What We Did NOT Copy
- No Pinterest masonry grid, no exact layouts, no Pin Sans, no Pinterest Red, no Dribbble illustrations, logos, screenshots, or proprietary assets.
- No decorative gradients/glassmorphism/animations beyond the subtle radial amber at hero.
- No generic crypto imagery.

## Original Design Created
- **Name lock**: MidnightTrace wordmark — Fraunces 700/600, `-0.035em` tracking, midnight ink + amber.
- **Mark**: rounded square (9–14px) in ink with amber `M` (F8D78D) + green verified notch (✓ on #3FA772).
- **X profile**: 400×400 circular safe-zone SVG (`public/x-profile.svg`) — mark centered with white-ring, amber radial, rotated not an issue at small size.
- **X banner**: 1500×500 (`public/x-banner.svg`) — left-locked brand near x=360 to avoid circular profile overlap, headline + pills + right ledger cards + bottom amber tagline bar.
- **Favicon / OG**: 32×32 and 1200×630 aligned with same tokens.

## Files
- `public/logo.svg` — full lockup
- `public/logo-mark.svg` — compact mark
- `public/x-profile.svg` — X avatar source (export PNG 400×400 for upload)
- `public/x-banner.svg` — X banner source (export PNG 1500×500 for upload)
- `public/favicon.svg` / `public/og-image.svg` — updated
- `src/components/BrandMark.tsx` — React mark used in both shells
- `src/styles.css` — refined tokens (see comment header)

## Verification
- Contracts unchanged (see `src/config.ts` — still Preprod `df5e05…`, `03123e…`).
- No contract redeploy; network remains Preprod/Testnet.
- UI research informed tokens + structure only; no external assets vendored.
