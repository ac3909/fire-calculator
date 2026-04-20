# Glassmorphism Input Styling — Design Spec

**Date:** 2026-04-20

## Overview

Redesign the FIRE calculator's visual style by introducing glassmorphism across all cards, adding ambient background lighting, fixing the age field to integers, and adding smart number formatting to dollar inputs.

---

## 1. Background & Ambient Lighting

Add layered radial gradients and blurred orbs to the `body` / app root to create depth behind glass cards.

- Body background: `#1E1C1A` base + 3 radial gradients using `--accent` (#D4714E) and `--sand` (#C9A882) at low opacity (5–12%)
- 3 absolutely-positioned `.orb` elements (blurred circles, `filter: blur(60px)`, pointer-events none) placed at top-left, bottom-right, and center-right
- Orbs use `#D4714E` and `#C9A882` at 7–12% opacity

---

## 2. Glassmorphism Treatment — All Cards

Applied to: `InputPanel`, `ResultsSummary`, `CombinedChart` container.

Glass style (bold, accent-tinted):
```css
background: rgba(212, 113, 78, 0.06);
border: 1px solid rgba(212, 113, 78, 0.22);
box-shadow:
  0 8px 40px rgba(0,0,0,0.45),
  inset 0 1px 0 rgba(212,113,78,0.12),
  0 0 0 1px rgba(212,113,78,0.04);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
```

Replaces current flat `background: var(--surface)` + `box-shadow: var(--shadow)` on all three components.

---

## 3. Input Field Restyling

All `input[type="number"]` in the panel get updated base style:
```css
background: rgba(0, 0, 0, 0.28);
border: 1px solid rgba(212, 113, 78, 0.18);
```

Focus state:
```css
border-color: rgba(212, 113, 78, 0.5);
box-shadow: 0 0 0 3px rgba(212, 113, 78, 0.12);
```

Replaces current `background: var(--bg)` + `border: 1px solid var(--border)`.

---

## 4. Age Field — Integer Only

`currentAge` input: add `step={1}` and parse with `parseInt` (not `Number`) in `onChange` so fractional input is blocked.

```jsx
onChange={e => set('currentAge', parseInt(e.target.value, 10) || inputs.currentAge)}
```

`parseInt` on empty string returns `NaN` — fallback to current value keeps state valid. No other age-related changes.

---

## 5. Dollar Input Formatting — Smart Toggle

Dollar fields: `currentPortfolio`, `annualExpenses`, `savingsInput.value` (fixed mode), `income` (percent mode).

Each dollar field becomes a prefix-wrapped input:

```jsx
<div className="input-prefix-wrap">
  <span className="prefix-sym">$</span>
  <input
    type="text"
    value={focused ? rawValue : rawValue.toLocaleString()}
    onFocus={() => setFocused(true)}
    onBlur={() => setFocused(false)}
    onChange={e => set('field', Number(e.target.value.replace(/,/g, '')) || 0)}
  />
</div>
```

Behavior:
- **Blurred:** shows formatted value with commas (e.g. `50,000`)
- **Focused:** shows raw number (e.g. `50000`) for easy editing
- Strip commas in `onChange` before parsing; `|| 0` guards against NaN on empty input

Use a single `focusedField` string state in `InputPanel` (field key name, or `null`). Check `focusedField === 'currentPortfolio'` etc. per input.

Percent and rate fields (`inflationRate`, `returnRate`, `swr`, `sensitivityRange`, `savingsInput.value` in percent mode) remain `type="number"` unchanged — no dollar formatting needed.

---

## 6. CSS Changes Summary

| File | Change |
|------|--------|
| `styles.css` | Add ambient gradient to body, add orb utility class, update base input styles |
| `InputPanel.css` | Replace surface bg with glass vars, add `.input-prefix-wrap` + `.prefix-sym` styles |
| `ResultsSummary.css` | Replace surface bg with glass |
| `CombinedChart.css` | Replace surface bg with glass |

No new component files. No changes to `calculator.js` or test files.

---

## 7. Out of Scope

- Animated orbs / CSS keyframes
- Glassmorphism on any element outside the three cards
- Changes to chart colors, axes, or data logic
- Mobile / responsive changes
