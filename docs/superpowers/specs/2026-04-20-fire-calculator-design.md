# FIRE Calculator — Design Spec

**Date:** 2026-04-20  
**Status:** Approved

---

## Overview

A personal FIRE (Financial Independence, Retire Early) calculator built as a static web app. Targets FIRE-aware users who want a powerful projection tool without hand-holding. Models current savings and investing carried forward to the FIRE point using inflation-adjusted expenses and configurable return rates.

---

## Inputs

All inputs live in a single input panel. State is held in `App.jsx` and passed down. No backend; all computation is client-side.

| Input | Notes |
|---|---|
| Current age | Starting point for projection |
| Current portfolio value | Existing savings/investments |
| Annual income | Used when savings mode is % of income |
| Annual expenses (today's $) | Base for FIRE number and inflation projection |
| Annual savings | Toggle: **fixed $** amount or **% of income** |
| Inflation rate | Applied to expenses year-over-year |
| Pre-retirement return rate | Portfolio growth rate until FIRE |
| Post-retirement return rate | Optional; defaults to pre-retirement rate if unset |
| Safe withdrawal rate (SWR) | Defaults to 4% |
| Sensitivity range | ±N% around base return rate for scenario bands |

**FIRE number** = `inflation_adjusted_annual_expenses_at_retirement / SWR`

The FIRE date is solved iteratively: run a year-by-year loop applying return, adding savings, and inflation-adjusting expenses until `portfolio >= FIRE number`.

---

## Architecture

**Stack:** Vite + React, Recharts for visualisation, no backend.

```
src/
├── components/
│   ├── InputPanel.jsx       # All inputs, savings mode toggle
│   ├── ResultsSummary.jsx   # Key stats: FIRE date, number, years, final value
│   └── CombinedChart.jsx    # Family of savings rate curves + sensitivity bands
├── lib/
│   └── calculator.js        # Pure projection functions, no React
└── App.jsx                  # Layout, state, wires inputs → calculator → outputs
```

`calculator.js` exports pure functions so they can be unit tested independently of React.

---

## Outputs

### Results Summary

Displayed as stat cards above the chart:

- FIRE date (year + age at retirement)
- FIRE number (inflation-adjusted portfolio target)
- Years to FIRE
- Final portfolio value at FIRE (base case)

### Combined Chart

A single chart containing all three dimensions:

1. **Savings rate curves** — a family of portfolio-over-time lines across a range of savings rates (e.g., current rate ±10% in steps). The user's configured savings rate is the highlighted base case.
2. **Sensitivity bands** — each curve optionally shows a shaded band representing the low/high return scenarios derived from the configured sensitivity range.
3. **Sensitivity toggle** — a UI toggle to show/hide sensitivity bands, reducing visual clutter when not needed.

All outputs update live as inputs change — no submit button.

---

## Projection Engine

Year-by-year loop in `calculator.js`:

```
for each year:
  portfolio = portfolio * (1 + return_rate) + annual_savings
  expenses = expenses * (1 + inflation_rate)
  fire_number = expenses / SWR
  if portfolio >= fire_number → FIRE year found
```

For sensitivity: run the same loop with `return_rate ± sensitivity_range` to produce the band boundaries.

For the savings rate family: run the loop for 5 curves — the base rate, ±10%, and ±20% of the base savings rate.

---

## Hosting

**Platform:** Vercel Hobby (free tier)

- Auto-detects Vite, runs `npm run build`, serves `dist/`
- Free `*.vercel.app` subdomain; custom domain attachable at no cost
- Connect GitHub repo → every push to `main` auto-deploys
- Preview deployments on pull requests

**Setup steps:**
1. `npm create vite@latest fire-calculator -- --template react`
2. Push repo to GitHub
3. Import in Vercel dashboard → deploy
4. Optionally: `npm i -g vercel` for CLI deploys (`vercel deploy --prod`)

No backend, no functions, no storage — stays on free tier indefinitely.

---

## Visual Design

**Theme:** Dark dashboard  
**Font:** Inter (Google Fonts)

**Palette:**

| Role | Value |
|---|---|
| Background | `#1E1C1A` (deep charcoal) |
| Card surface | Rounded cards, subtle shadow, slightly lighter than background (`#272422`) |
| Primary accent | `#D4714E` (terracotta) |
| Secondary accent | `#C9A882` (warm sand) |
| Text primary | Warm off-white (`#F5F0EA`) |
| Text muted | Warm gray (`#9E9189`) |

**Component style:** Rounded corners, soft drop shadows, generous spacing — approachable and readable.

**Chart styling:**

- Background: matches card surface
- Base case curve: terracotta (`#D4714E`), slightly thicker stroke
- Savings rate curve family: gradient from sand (`#C9A882`) at the lowest rate through to terracotta (`#D4714E`) at the highest rate — 5 curves total
- Sensitivity bands: semi-transparent terracotta fill around each curve
- Sensitivity bands togglable via a UI toggle to reduce visual clutter
