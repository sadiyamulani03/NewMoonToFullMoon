# MidnightTrace — Brand Brief (Level 6)

## Tagline

**Prove a forensic step without exposing the evidence.**

## Three Key Messages

1. **Privacy-first forensics, not publishing:** MidnightTrace keeps every hidden amount as a private witness — the chain verifies that `total' = total + amount` without ever seeing `amount`. Competing ledgers publish everything; we prove without surveillance.

2. **Selective disclosure is native:** Midnight’s Compact `disclose()` makes publicity a deliberate choice, not a leak. Log hidden steps by default, disclose a running total only when you choose — the same contract, two privacy modes.

3. **Anyone can audit, no wallet needed:** The public Audit window reads live Preprod ledger state (aggregate, per-case totals, allowlist root, receipt book) with a SHA-256 fingerprint — verifiability without permission or identity.

## Color Palette

* **Primary — Midnight Ink** `#0B1020` — deep navy used for header, shell background, and primary text contrast (`--paper`/`--paper-deep` in `src/styles.css:4`). Conveys trust, night, and forensics.
* **Accent — Forensic Amber** `#F4C770` — warm amber for CTAs, progress, and highlights (`--amber` in `src/styles.css:11`). Signals proof, signal, and verification. WCAG contrast with ink is ≥4.5:1 for buttons.

Supporting: `--ink` `#EDF3FF`, `--ink-soft` `#D7E0F3`, `--ok` `#8BE0AF` for success stamps.

## X Bio (under 160 characters — 119)

> Private forensics on Midnight. ZK proofs for every step — public audit, private evidence. Preprod live: https://midnighttrace.vercel.app

## X Banner Concept

*Describe what the banner should visually contain — no final PNG claimed:*

* **Background:** Deep Midnight Ink `#0B1020` → `#1A2438` gradient with subtle noise (as in `src/styles.css:54`), faint amber radial at top-right.
* **Left:** Large `M` mark (52px rounded square, amber border, `Fraunces` type) + wordmark `MidnightTrace` in ivory.
* **Center:** Three pill highlights — `Zero-knowledge` · `Selective disclosure` · `Public audit` — in translucent white.
* **Right:** Minimal ledger visualization — 3 stacked case cards (`#7`, `#12`, `#19`) with `total` and `AUDIT √` stamps, plus a fingerprint hash bar at bottom `SHA-256: 0x…`.
* **Tagline bar:** Bottom strip in amber `#F4C770` with `Prove a forensic step without exposing the evidence.` in ink.

## Logo Concept

*Describe the logo — no final SVG claimed beyond the `M` in `src/components/Layout.tsx:15`:*

* **Mark:** Rounded square (14px radius) with `M` in `Fraunces 700`, amber `#F8D78D` on Ink `#0B1020`, 1px amber border (`rgba(244,199,112,0.42)`), inset highlight. The `M` doubles as a ledger block with a check-notch.
* **Wordmark:** `MidnightTrace` in `Fraunces SemiBold`, tracked `-0.04em`, ivory `#F5EFE8`; `Trace` weight 600 to emphasize verifiability.
* **Variants:** Ink-on-amber for dark backgrounds, amber-on-ink for light; mono `MT` favicon for wallet pill.

> Visual assets beyond `screenshots/` are concepts; no final brand PNG/SVG is claimed in this submission.
