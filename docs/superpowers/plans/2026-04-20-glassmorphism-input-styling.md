# Glassmorphism Input Styling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add glassmorphism to all cards, ambient background lighting, integer-only age input, and smart dollar formatting with `$` prefix + comma toggle on focus.

**Architecture:** Ambient gradient orbs live in `App.jsx` as absolutely-positioned divs behind the layout. Glass treatment is applied via direct CSS property overrides in each component's existing CSS file. Dollar input formatting uses a single `focusedField` string state in `InputPanel` to toggle between `toLocaleString()` display and raw number editing.

**Tech Stack:** React (JSX), CSS (no libraries), Vite dev server

---

## File Map

| File | Change |
|------|--------|
| `src/styles.css` | Update `body` background; update `input[type="number"]` and `input[type="text"]` base + focus styles |
| `src/App.jsx` | Wrap layout in `.app-bg` div; add three `.orb` divs |
| `src/App.css` | Add `.app-bg` + `.orb` + `.orb-1/2/3` positioning styles |
| `src/components/InputPanel.css` | Replace flat surface bg/shadow with glass; add `.input-prefix-wrap` + `.prefix-sym` styles |
| `src/components/ResultsSummary.css` | Replace `.stat-card` flat surface bg/shadow with glass |
| `src/components/CombinedChart.css` | Replace `.chart-card` flat surface bg/shadow with glass |
| `src/components/InputPanel.jsx` | Add `focusedField` state; fix age `onChange`; replace dollar inputs with prefix-wrapped text inputs |

---

## Task 1: Ambient Background — Body Gradient + Orb Divs

**Files:**
- Modify: `src/styles.css`
- Modify: `src/App.jsx`
- Modify: `src/App.css`

- [ ] **Step 1: Update body background in `src/styles.css`**

Replace the existing `body` rule:

```css
body {
  background: radial-gradient(ellipse at 20% 20%, rgba(212,113,78,0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 80%, rgba(201,168,130,0.06) 0%, transparent 50%),
              radial-gradient(ellipse at 65% 10%, rgba(212,113,78,0.05) 0%, transparent 40%),
              #1E1C1A;
  color: var(--text);
  font-family: var(--font);
  font-size: 14px;
  line-height: 1.5;
  min-height: 100vh;
}
```

- [ ] **Step 2: Add `.app-bg` and orb styles to `src/App.css`**

Replace the entire contents of `src/App.css`:

```css
.app-bg {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;
  z-index: 0;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: rgba(212, 113, 78, 0.12);
  top: -120px;
  left: -100px;
}

.orb-2 {
  width: 350px;
  height: 350px;
  background: rgba(201, 168, 130, 0.08);
  bottom: 60px;
  right: -80px;
}

.orb-3 {
  width: 250px;
  height: 250px;
  background: rgba(212, 113, 78, 0.07);
  top: 35%;
  right: 25%;
}

.app {
  display: flex;
  gap: 24px;
  padding: 32px;
  align-items: flex-start;
  position: relative;
  z-index: 1;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}
```

- [ ] **Step 3: Wrap layout in `.app-bg` + add orb divs in `src/App.jsx`**

Replace the `return` block in `App`:

```jsx
return (
  <div className="app-bg">
    <div className="orb orb-1" />
    <div className="orb orb-2" />
    <div className="orb orb-3" />
    <div className="app">
      <InputPanel inputs={inputs} onChange={setInputs} />
      <main className="app-main">
        <ResultsSummary firePoint={firePoint} currentYear={new Date().getFullYear()} />
        <CombinedChart chartData={chartData} curves={curves} />
      </main>
    </div>
  </div>
)
```

- [ ] **Step 4: Start dev server and verify ambient orbs visible**

```bash
npm run dev
```

Open `http://localhost:5173`. Should see warm orange/sand glow blobs behind the dark background. App layout unchanged.

- [ ] **Step 5: Commit**

```bash
git add src/styles.css src/App.jsx src/App.css
git commit -m "feat: add ambient gradient background with accent orbs"
```

---

## Task 2: Glass Treatment — All Three Cards

**Files:**
- Modify: `src/components/InputPanel.css`
- Modify: `src/components/ResultsSummary.css`
- Modify: `src/components/CombinedChart.css`

- [ ] **Step 1: Apply glass to `.input-panel` in `src/components/InputPanel.css`**

Replace the `.input-panel` rule (lines 1–14):

```css
.input-panel {
  background: rgba(212, 113, 78, 0.06);
  border: 1px solid rgba(212, 113, 78, 0.22);
  box-shadow:
    0 8px 40px rgba(0,0,0,0.45),
    inset 0 1px 0 rgba(212,113,78,0.12),
    0 0 0 1px rgba(212,113,78,0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--radius);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 300px;
  flex-shrink: 0;
  align-self: flex-start;
  position: sticky;
  top: 32px;
}
```

- [ ] **Step 2: Apply glass to `.stat-card` in `src/components/ResultsSummary.css`**

Replace the `.stat-card` rule (lines 8–12):

```css
.stat-card {
  background: rgba(212, 113, 78, 0.06);
  border: 1px solid rgba(212, 113, 78, 0.22);
  box-shadow:
    0 8px 40px rgba(0,0,0,0.45),
    inset 0 1px 0 rgba(212,113,78,0.12),
    0 0 0 1px rgba(212,113,78,0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--radius);
  padding: 20px 24px;
}
```

- [ ] **Step 3: Apply glass to `.chart-card` in `src/components/CombinedChart.css`**

Replace the `.chart-card` rule (lines 1–6):

```css
.chart-card {
  background: rgba(212, 113, 78, 0.06);
  border: 1px solid rgba(212, 113, 78, 0.22);
  box-shadow:
    0 8px 40px rgba(0,0,0,0.45),
    inset 0 1px 0 rgba(212,113,78,0.12),
    0 0 0 1px rgba(212,113,78,0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--radius);
  padding: 24px;
}
```

- [ ] **Step 4: Verify in browser**

All three cards should now show frosted glass with subtle orange tint and inner highlight edge. Orbs behind should be visible through the glass effect.

- [ ] **Step 5: Commit**

```bash
git add src/components/InputPanel.css src/components/ResultsSummary.css src/components/CombinedChart.css
git commit -m "feat: apply glassmorphism to all three cards"
```

---

## Task 3: Input Field Restyling

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Update input base + focus styles in `src/styles.css`**

Replace the existing `input[type="number"], input[type="text"]` and focus rules:

```css
input[type="number"],
input[type="text"] {
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(212, 113, 78, 0.18);
  border-radius: 6px;
  color: var(--text);
  font-family: var(--font);
  font-size: 14px;
  padding: 8px 10px;
  width: 100%;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

input[type="number"]:focus,
input[type="text"]:focus {
  border-color: rgba(212, 113, 78, 0.5);
  box-shadow: 0 0 0 3px rgba(212, 113, 78, 0.12);
}
```

- [ ] **Step 2: Verify in browser**

All inputs in the panel should have dark semi-transparent background and subtle orange border. Focus state should show orange glow ring.

- [ ] **Step 3: Commit**

```bash
git add src/styles.css
git commit -m "feat: restyle inputs with glass-matching dark bg and accent focus ring"
```

---

## Task 4: Age Field — Integer Only

**Files:**
- Modify: `src/components/InputPanel.jsx`

- [ ] **Step 1: Fix age `onChange` handler and add `step={1}`**

In `src/components/InputPanel.jsx`, replace the `currentAge` input (lines 22–28):

```jsx
<input
  type="number"
  value={inputs.currentAge}
  onChange={e => set('currentAge', parseInt(e.target.value, 10) || inputs.currentAge)}
  min={18}
  max={80}
  step={1}
/>
```

- [ ] **Step 2: Verify in browser**

Type a decimal in the age field (e.g. `30.5`). On blur, value should snap to `30` (or stay at current). Spinner arrows should step by 1.

- [ ] **Step 3: Commit**

```bash
git add src/components/InputPanel.jsx
git commit -m "fix: restrict age field to integers"
```

---

## Task 5: Dollar Inputs — Prefix Wrap CSS + Smart Toggle Logic

**Files:**
- Modify: `src/components/InputPanel.css`
- Modify: `src/components/InputPanel.jsx`

- [ ] **Step 1: Add prefix wrap styles to `src/components/InputPanel.css`**

Append to the end of `InputPanel.css`:

```css
.input-prefix-wrap {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(212, 113, 78, 0.18);
  border-radius: 6px;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.input-prefix-wrap:focus-within {
  border-color: rgba(212, 113, 78, 0.5);
  box-shadow: 0 0 0 3px rgba(212, 113, 78, 0.12);
}

.prefix-sym {
  padding: 8px 8px 8px 10px;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.02);
  border-right: 1px solid rgba(212, 113, 78, 0.1);
  user-select: none;
  flex-shrink: 0;
}

.input-prefix-wrap input[type="text"] {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 8px 10px;
  width: 100%;
}

.input-prefix-wrap input[type="text"]:focus {
  border-color: transparent;
  box-shadow: none;
}
```

- [ ] **Step 2: Replace `InputPanel.jsx` with full updated version**

> **Note:** This replacement already includes the Task 4 age fix (`step={1}` + `parseInt` handler). If Task 4 was completed first, this step supersedes that commit — the age fix is preserved.

Replace the entire contents of `src/components/InputPanel.jsx`:

```jsx
import { useState } from 'react'
import './InputPanel.css'

export default function InputPanel({ inputs, onChange }) {
  const [focusedField, setFocusedField] = useState(null)

  function set(key, value) {
    onChange({ ...inputs, [key]: value })
  }

  function setSavings(key, value) {
    onChange({ ...inputs, savingsInput: { ...inputs.savingsInput, [key]: value } })
  }

  function dollarValue(fieldKey, raw) {
    return focusedField === fieldKey ? String(raw) : raw.toLocaleString()
  }

  function parseDollar(str) {
    return Number(str.replace(/,/g, '')) || 0
  }

  const resolvedSavings = inputs.savingsInput.mode === 'percent'
    ? Math.round((inputs.income * inputs.savingsInput.value) / 100)
    : null

  return (
    <aside className="input-panel">
      <h2>Your Numbers</h2>

      <div className="input-group">
        <label>Current Age</label>
        <input
          type="number"
          value={inputs.currentAge}
          onChange={e => set('currentAge', parseInt(e.target.value, 10) || inputs.currentAge)}
          min={18}
          max={80}
          step={1}
        />
      </div>

      <div className="input-group">
        <label>Current Portfolio</label>
        <div className="input-prefix-wrap">
          <span className="prefix-sym">$</span>
          <input
            type="text"
            value={dollarValue('currentPortfolio', inputs.currentPortfolio)}
            onFocus={() => setFocusedField('currentPortfolio')}
            onBlur={() => setFocusedField(null)}
            onChange={e => set('currentPortfolio', parseDollar(e.target.value))}
          />
        </div>
      </div>

      <div className="input-group">
        <label>Annual Expenses</label>
        <div className="input-prefix-wrap">
          <span className="prefix-sym">$</span>
          <input
            type="text"
            value={dollarValue('annualExpenses', inputs.annualExpenses)}
            onFocus={() => setFocusedField('annualExpenses')}
            onBlur={() => setFocusedField(null)}
            onChange={e => set('annualExpenses', parseDollar(e.target.value))}
          />
        </div>
      </div>

      <hr className="divider" />

      <div className="input-group">
        <label>Annual Savings</label>
        <div className="savings-toggle">
          <button
            className={inputs.savingsInput.mode === 'fixed' ? 'active' : ''}
            onClick={() => setSavings('mode', 'fixed')}
          >
            Fixed $
          </button>
          <button
            className={inputs.savingsInput.mode === 'percent' ? 'active' : ''}
            onClick={() => setSavings('mode', 'percent')}
          >
            % of Income
          </button>
        </div>

        {inputs.savingsInput.mode === 'fixed' ? (
          <div className="input-prefix-wrap">
            <span className="prefix-sym">$</span>
            <input
              type="text"
              value={dollarValue('savingsValue', inputs.savingsInput.value)}
              onFocus={() => setFocusedField('savingsValue')}
              onBlur={() => setFocusedField(null)}
              onChange={e => setSavings('value', parseDollar(e.target.value))}
            />
          </div>
        ) : (
          <>
            <div className="input-prefix-wrap">
              <span className="prefix-sym">$</span>
              <input
                type="text"
                value={dollarValue('income', inputs.income)}
                onFocus={() => setFocusedField('income')}
                onBlur={() => setFocusedField(null)}
                onChange={e => set('income', parseDollar(e.target.value))}
                placeholder="Annual income"
              />
            </div>
            <input
              type="number"
              value={inputs.savingsInput.value}
              onChange={e => setSavings('value', Number(e.target.value))}
              min={1}
              max={100}
              placeholder="Savings rate (%)"
            />
            <span className="input-hint">
              = ${resolvedSavings.toLocaleString()} / yr
            </span>
          </>
        )}
      </div>

      <hr className="divider" />

      <div className="input-group">
        <label>Inflation Rate (%)</label>
        <input
          type="number"
          value={inputs.inflationRate}
          onChange={e => set('inflationRate', Number(e.target.value))}
          min={0}
          max={20}
          step={0.1}
        />
      </div>

      <div className="input-group">
        <label>Investment Return (%)</label>
        <input
          type="number"
          value={inputs.returnRate}
          onChange={e => set('returnRate', Number(e.target.value))}
          min={0}
          max={30}
          step={0.1}
        />
      </div>

      <div className="input-group">
        <label>Safe Withdrawal Rate (%)</label>
        <input
          type="number"
          value={inputs.swr}
          onChange={e => set('swr', Number(e.target.value))}
          min={1}
          max={10}
          step={0.1}
        />
      </div>

      <div className="input-group">
        <label>Sensitivity Range (±%)</label>
        <input
          type="number"
          value={inputs.sensitivityRange}
          onChange={e => set('sensitivityRange', Number(e.target.value))}
          min={0}
          max={10}
          step={0.5}
        />
        <span className="input-hint">Return rate ± this for bands</span>
      </div>
    </aside>
  )
}
```

- [ ] **Step 3: Verify in browser**

- Dollar fields show `$50,000` style when not focused
- Clicking a dollar field shows raw `50000` for easy editing
- Typing a new value (e.g. `75000`) and blurring shows `$75,000`
- Chart and results update live as values change
- Savings `% of Income` mode: income field shows `$` prefix + formatted; savings rate field stays plain number
- Age field accepts only whole numbers

- [ ] **Step 4: Run existing tests to confirm no calculator logic broken**

```bash
npm run test
```

Expected output: all tests pass (calculator logic untouched).

- [ ] **Step 5: Commit**

```bash
git add src/components/InputPanel.jsx src/components/InputPanel.css
git commit -m "feat: add dollar prefix wrap and smart comma formatting to dollar inputs"
```
