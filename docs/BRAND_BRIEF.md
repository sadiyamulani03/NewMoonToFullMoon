# MidnightTrace — Brand Brief (Level 6 — Sep 17 Revision)

## Tagline

**Prove a forensic step without exposing the evidence.**

## Three Key Messages

1. **Privacy-first forensics, not publishing:** MidnightTrace keeps every hidden amount as a private witness — the chain verifies that `total' = total + amount` without ever seeing `amount`. Competing ledgers publish everything; we prove without surveillance.

2. **Selective disclosure is native:** Midnight’s Compact `disclose()` makes publicity a deliberate choice, not a leak. Log hidden steps by default, disclose a running total only when you choose — the same contract, two privacy modes.

3. **Anyone can audit, no wallet needed:** The public Audit window reads live Preprod ledger state (aggregate, per-case totals, allowlist root, receipt book) with a SHA-256 fingerprint — verifiability without permission or identity.

## Color Palette

* **Primary — Midnight Ink** `#0B1020` — deep navy used for header, shell background, and primary text contrast (`--ink` in `src/styles.css:6`). Conveys trust, night, and forensics.
* **Accent — Forensic Amber** `#F4C770` — warm amber for **primary CTA only** (`--ochre` in `src/styles.css:16`). WCAG contrast with ink is ≥4.5:1 for buttons. Single-accent discipline per Pinterest/Dribbble research — amber never decorative.
* **Success — Verify Green** `#3FA772` — for `Verified` stamps and check badges only (`--verify`).

Supporting: `--paper` `#F5EFE8`, `--muted-ink` `#9AA3B5`, `--line-ink` `rgba(255,255,255,0.07)`.

See `docs/DESIGN_RESEARCH.md` for Pinterest/Dribbble principles that informed tokens (8px grid, 64px section rhythm, 10/14px radius, mono for data).

## X Bio (under 160 characters — 119)

> Private forensics on Midnight. ZK proofs for every step — public audit, private evidence. Preprod live: https://midnighttrace.vercel.app

## X Banner — Implemented

*File: `public/x-banner.svg` (1500×500) — export to PNG for upload. Safe-zone: critical text at x≥360 avoids the 133px circular profile overlay (left ~60px).*

* **Background:** `url(#bg)` ink `#0B1020→#141E32` + amber radial at 88% / 0%, plus subtle 32px grid (0.03 opacity) — flat, no heavy shadow.
* **Left (x 360):** 52px rounded-square mark (`BrandMark`) + wordmark `MidnightTrace` in ivory/Fraunces, kicker `MIDNIGHT NETWORK · PREPROD` in mono.
* **Headline:** `Prove work happened. / Keep evidence private.` 46px Fraunces (−0.035em), amber second line; sub in 15.5px muted; three pills below (`SELECTIVE DISCLOSURE` / `PRIVATE ALLOWLIST` / `✓ PUBLIC AUDIT`).
* **Right:** Ledger card stack (360× ~270px) — ZK proof card + public/private pills + `PREPROD · df5e05…29501` meta + CTA bar.
* **Bottom:** 70px amber strip `#F4C770` with `Private forensics on Midnight — midnighttrace.vercel.app · @MidnightTraceAp · Preprod live` in ink/Fraunces, plus mono kicker.

## Logo — Implemented

*Files: `public/logo.svg` (360×48 lockup), `public/logo-mark.svg` (64×64), `public/x-profile.svg` (400×400 circular), `public/favicon.svg` (32×32). React: `src/components/BrandMark.tsx` used in `Layout` and `MarketingLayout`.*

* **Mark:** Rounded square (9–14px radius) in ink `#0B1020`, 1.2px amber border (`rgba(244,199,112,0.42)`), `M` in Fraunces 700 `#F8D78D`, and a 5–7px green verified notch (✓ on `#3FA772`) at top-right — privacy (redacted bar accent on X profile) + verifiability in one.
* **Wordmark:** `MidnightTrace` in Fraunces 700/600, tracked `-0.035em`, midnight ink on light / ivory `#F5EFE8` on dark; `Trace` amber tint for emphasis.
* **Variants:** Dark-on-light lockup for docs, light-on-dark for header/rail, circular X profile with thick 1.2px amber ring, mono `M` favicon with notch for wallet pill and loader.

> Visual assets are original SVGs in `public/`; export PNGs at 400×400 (profile) and 1500×500 (banner) for X upload. See `docs/DESIGN_RESEARCH.md` for research attribution.
