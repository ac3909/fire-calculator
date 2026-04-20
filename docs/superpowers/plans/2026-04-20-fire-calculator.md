# FIRE Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal FIRE (Financial Independence, Retire Early) calculator as a Vite + React static web app with a dark terracotta theme, deployed to Vercel.

**Architecture:** Single-page app with all state in `App.jsx`. Pure calculation functions in `lib/calculator.js` are unit-tested with Vitest. Three display components (`InputPanel`, `ResultsSummary`, `CombinedChart`) receive props from App. No backend — all computation is client-side and runs on every render via `useMemo`.

**Tech Stack:** Vite 6, React 18, Recharts 2, Vitest, Vercel Hobby (free tier)

---

## File Map

| File | Responsibility |
|---|---|
| `src/lib/calculator.js` | All projection math — pure functions, no React |
| `src/lib/calculator.test.js` | Vitest unit tests for calculator |
| `src/components/InputPanel.jsx` | All user inputs including savings mode toggle |
| `src/components/InputPanel.css` | Input panel styles |
| `src/components/ResultsSummary.jsx` | Key stats cards (FIRE date, number, years, portfolio) |
| `src/components/ResultsSummary.css` | Stat card styles |
| `src/components/CombinedChart.jsx` | 5 savings rate curves + sensitivity bands + toggle |
| `src/components/CombinedChart.css` | Chart card styles |
| `src/App.jsx` | Layout, state, wires inputs → calculator → components |
| `src/App.css` | Two-column layout |
| `src/styles.css` | CSS variables, global resets, input base styles |
| `src/main.jsx` | React root mount |
| `index.html` | Inter font import |
| `vite.config.js` | Vite + Vitest config |

> **Note:** Post-retirement return rate is not included as an input — without a drawdown chart it is unused. YAGNI.

---

### Task 1: Project scaffolding

**Files:**
- Create: `fire-calculator/` (Vite scaffold)
- Modify: `vite.config.js`
- Modify: `index.html`
- Modify: `src/main.jsx`

- [ ] **Step 1: Scaffold the Vite React project**

Run from `F:/Code_Projects/`:
```bash
npm create vite@latest fire-calculator -- --template react
cd fire-calculator
npm install
```

- [ ] **Step 2: Install dependencies**

```bash
npm install recharts
npm install -D vitest
```

- [ ] **Step 3: Configure Vitest in vite.config.js**

Replace `vite.config.js` with:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 4: Add test scripts to package.json**

In `package.json`, add to the `"scripts"` section:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Add Inter font to index.html**

In `index.html`, add inside `<head>` before the closing tag:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

- [ ] **Step 6: Remove Vite boilerplate**

```bash
rm src/assets/react.svg public/vite.svg src/App.css src/index.css
```

Replace `src/main.jsx` with:
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 7: Verify the dev server starts**

```bash
npm run dev
```
Expected: Vite starts on `http://localhost:5173`. Browser may show an error since `App.jsx` doesn't exist yet — that's fine.

- [ ] **Step 8: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Vite React project with Recharts and Vitest"
```

---

### Task 2: Calculator engine (TDD)

**Files:**
- Create: `src/lib/calculator.js`
- Create: `src/lib/calculator.test.js`

- [ ] **Step 1: Create the test file**

Create `src/lib/calculator.test.js`:
```js
import { describe, it, expect } from 'vitest'
import {
  resolveSavings,
  projectPortfolio,
  findFirePoint,
  generateCurves,
  projectBand,
  buildChartData,
} from './calculator.js'

describe('resolveSavings', () => {
  it('returns fixed value when mode is fixed', () => {
    expect(resolveSavings(100000, { mode: 'fixed', value: 40000 })).toBe(40000)
  })

  it('returns percentage of income when mode is percent', () => {
    expect(resolveSavings(100000, { mode: 'percent', value: 40 })).toBe(40000)
  })
})

describe('projectPortfolio', () => {
  const base = {
    currentPortfolio: 0,
    currentAge: 30,
    annualSavings: 40000,
    annualExpenses: 40000,
    inflationRate: 3,
    returnRate: 7,
    swr: 4,
  }

  it('starts at year 0 with current portfolio and age', () => {
    const data = projectPortfolio(base)
    expect(data[0].year).toBe(0)
    expect(data[0].portfolio).toBe(0)
    expect(data[0].age).toBe(30)
  })

  it('grows portfolio each year', () => {
    const data = projectPortfolio(base)
    expect(data[1].portfolio).toBeGreaterThan(data[0].portfolio)
  })

  it('stops when portfolio reaches fire number', () => {
    const data = projectPortfolio(base)
    const last = data.at(-1)
    expect(last.portfolio).toBeGreaterThanOrEqual(last.fireNumber)
  })

  it('fire number grows with inflation each year', () => {
    const data = projectPortfolio(base)
    expect(data[1].fireNumber).toBeGreaterThan(data[0].fireNumber)
  })

  it('respects maxYears cap', () => {
    const data = projectPortfolio({ ...base, annualSavings: 0, maxYears: 10 })
    expect(data.at(-1).year).toBeLessThanOrEqual(10)
  })
})

describe('findFirePoint', () => {
  it('returns the first data point where portfolio >= fireNumber', () => {
    const data = projectPortfolio({
      currentPortfolio: 0,
      currentAge: 30,
      annualSavings: 40000,
      annualExpenses: 40000,
      inflationRate: 3,
      returnRate: 7,
      swr: 4,
    })
    const pt = findFirePoint(data)
    expect(pt).not.toBeNull()
    expect(pt.portfolio).toBeGreaterThanOrEqual(pt.fireNumber)
  })

  it('returns null if FIRE is never reached within maxYears', () => {
    const data = projectPortfolio({
      currentPortfolio: 0,
      currentAge: 30,
      annualSavings: 0,
      annualExpenses: 100000,
      inflationRate: 3,
      returnRate: 7,
      swr: 4,
      maxYears: 5,
    })
    expect(findFirePoint(data)).toBeNull()
  })
})

describe('generateCurves', () => {
  const baseInputs = {
    currentPortfolio: 100000,
    currentAge: 35,
    annualExpenses: 50000,
    inflationRate: 3,
    returnRate: 7,
    swr: 4,
  }

  it('returns exactly 5 curves', () => {
    expect(generateCurves(baseInputs, 40000)).toHaveLength(5)
  })

  it('marks exactly one curve as base (index 2)', () => {
    const curves = generateCurves(baseInputs, 40000)
    expect(curves.filter(c => c.isBase)).toHaveLength(1)
    expect(curves[2].isBase).toBe(true)
  })

  it('higher savings multiplier reaches FIRE sooner', () => {
    const curves = generateCurves(baseInputs, 40000)
    const fireYears = curves.map(c => findFirePoint(c.data)?.year ?? Infinity)
    expect(fireYears[4]).toBeLessThan(fireYears[0])
  })
})

describe('projectBand', () => {
  const baseInputs = {
    currentPortfolio: 100000,
    currentAge: 35,
    annualExpenses: 50000,
    inflationRate: 3,
    returnRate: 7,
    swr: 4,
  }

  it('returns low and high projection arrays', () => {
    const band = projectBand(baseInputs, 40000, 2)
    expect(Array.isArray(band.low)).toBe(true)
    expect(Array.isArray(band.high)).toBe(true)
  })

  it('high portfolio exceeds low portfolio at same year', () => {
    const band = projectBand(baseInputs, 40000, 2)
    expect(band.high[5].portfolio).toBeGreaterThan(band.low[5].portfolio)
  })
})

describe('buildChartData', () => {
  const baseInputs = {
    currentPortfolio: 100000,
    currentAge: 35,
    annualExpenses: 50000,
    inflationRate: 3,
    returnRate: 7,
    swr: 4,
  }

  it('includes one entry per year from 0 to maxYear', () => {
    const curves = generateCurves(baseInputs, 40000)
    const data = buildChartData(curves, null)
    expect(data[0].year).toBe(0)
    expect(data.at(-1).year).toBeGreaterThan(0)
  })

  it('includes curve0 through curve4 keys', () => {
    const curves = generateCurves(baseInputs, 40000)
    const data = buildChartData(curves, null)
    expect(data[0]).toHaveProperty('curve0')
    expect(data[0]).toHaveProperty('curve4')
  })

  it('includes low/diff band keys when bands provided', () => {
    const curves = generateCurves(baseInputs, 40000)
    const bands = curves.map(c => projectBand(baseInputs, c.multiplier * 40000, 2))
    const data = buildChartData(curves, bands)
    expect(data[1]).toHaveProperty('low0')
    expect(data[1]).toHaveProperty('diff0')
  })
})
```

- [ ] **Step 2: Run tests to confirm they all fail**

```bash
npm test
```
Expected: All tests fail with `Cannot find module './calculator.js'`

- [ ] **Step 3: Create calculator.js**

Create `src/lib/calculator.js`:
```js
export function resolveSavings(income, savingsInput) {
  if (savingsInput.mode === 'percent') {
    return income * (savingsInput.value / 100)
  }
  return savingsInput.value
}

export function projectPortfolio({
  currentPortfolio,
  currentAge,
  annualSavings,
  annualExpenses,
  inflationRate,
  returnRate,
  swr,
  maxYears = 80,
}) {
  const r = returnRate / 100
  const inf = inflationRate / 100
  const swrDecimal = swr / 100

  let portfolio = currentPortfolio
  let expenses = annualExpenses
  const data = []

  for (let year = 0; year <= maxYears; year++) {
    const fireNumber = expenses / swrDecimal
    data.push({
      year,
      age: currentAge + year,
      portfolio: Math.round(portfolio),
      fireNumber: Math.round(fireNumber),
    })
    if (portfolio >= fireNumber) break
    portfolio = portfolio * (1 + r) + annualSavings
    expenses = expenses * (1 + inf)
  }

  return data
}

export function findFirePoint(data) {
  return data.find(d => d.portfolio >= d.fireNumber) ?? null
}

// Generates 5 savings rate curves at multipliers: 0.8, 0.9, 1.0, 1.1, 1.2 of baseSavings
export function generateCurves(baseInputs, baseSavings) {
  const multipliers = [0.8, 0.9, 1.0, 1.1, 1.2]
  return multipliers.map(mult => ({
    isBase: mult === 1.0,
    multiplier: mult,
    data: projectPortfolio({ ...baseInputs, annualSavings: baseSavings * mult }),
  }))
}

// Projects low/high portfolio paths by adjusting returnRate by ±sensitivityRange
export function projectBand(baseInputs, annualSavings, sensitivityRange) {
  const low = projectPortfolio({
    ...baseInputs,
    annualSavings,
    returnRate: baseInputs.returnRate - sensitivityRange,
  })
  const high = projectPortfolio({
    ...baseInputs,
    annualSavings,
    returnRate: baseInputs.returnRate + sensitivityRange,
  })
  return { low, high }
}

// Merges curve + band arrays into a flat array for Recharts.
// Band uses stacked Area trick: low (transparent) + diff (high-low, filled).
export function buildChartData(curves, bands) {
  const maxYear = Math.max(...curves.map(c => c.data.at(-1).year))
  const result = []

  for (let year = 0; year <= maxYear; year++) {
    const entry = { year }
    curves.forEach((curve, i) => {
      const point = curve.data[year]
      if (point !== undefined) {
        entry.age = point.age
        entry[`curve${i}`] = point.portfolio
        entry[`fire${i}`] = point.fireNumber
      }
      if (bands) {
        const lowPt = bands[i].low[year]
        const highPt = bands[i].high[year]
        if (lowPt !== undefined && highPt !== undefined) {
          entry[`low${i}`] = lowPt.portfolio
          entry[`diff${i}`] = highPt.portfolio - lowPt.portfolio
        }
      }
    })
    result.push(entry)
  }

  return result
}
```

- [ ] **Step 4: Run tests and confirm they all pass**

```bash
npm test
```
Expected: All tests pass. Output shows green checkmarks for all `describe` groups.

- [ ] **Step 5: Commit**

```bash
git add src/lib/
git commit -m "feat: add FIRE projection calculator engine with Vitest tests"
```

---

### Task 3: Global styles

**Files:**
- Create: `src/styles.css`

- [ ] **Step 1: Create styles.css**

Create `src/styles.css`:
```css
:root {
  --bg: #1E1C1A;
  --surface: #272422;
  --accent: #D4714E;
  --sand: #C9A882;
  --text: #F5F0EA;
  --text-muted: #9E9189;
  --border: #3E3B38;
  --radius: 12px;
  --shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  --font: 'Inter', sans-serif;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  font-size: 14px;
  line-height: 1.5;
  min-height: 100vh;
}

input[type="number"],
input[type="text"] {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  font-family: var(--font);
  font-size: 14px;
  padding: 8px 10px;
  width: 100%;
  outline: none;
  transition: border-color 0.15s;
}

input[type="number"]:focus,
input[type="text"]:focus {
  border-color: var(--accent);
}

button {
  cursor: pointer;
  font-family: var(--font);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles.css src/main.jsx
git commit -m "feat: add global dark theme CSS variables and base styles"
```

---

### Task 4: InputPanel component

**Files:**
- Create: `src/components/InputPanel.jsx`
- Create: `src/components/InputPanel.css`

- [ ] **Step 1: Create InputPanel.css**

Create `src/components/InputPanel.css`:
```css
.input-panel {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
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

.input-panel h2 {
  font-size: 15px;
  font-weight: 600;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.savings-toggle {
  display: flex;
  background: var(--bg);
  border-radius: 6px;
  padding: 2px;
  gap: 2px;
}

.savings-toggle button {
  flex: 1;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
  padding: 6px;
  transition: background 0.15s, color 0.15s;
}

.savings-toggle button.active {
  background: var(--accent);
  color: #fff;
}

.input-hint {
  font-size: 11px;
  color: var(--text-muted);
}

.divider {
  border: none;
  border-top: 1px solid var(--border);
}
```

- [ ] **Step 2: Create InputPanel.jsx**

Create `src/components/InputPanel.jsx`:
```jsx
import './InputPanel.css'

export default function InputPanel({ inputs, onChange }) {
  function set(key, value) {
    onChange({ ...inputs, [key]: value })
  }

  function setSavings(key, value) {
    onChange({ ...inputs, savingsInput: { ...inputs.savingsInput, [key]: value } })
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
          onChange={e => set('currentAge', Number(e.target.value))}
          min={18}
          max={80}
        />
      </div>

      <div className="input-group">
        <label>Current Portfolio ($)</label>
        <input
          type="number"
          value={inputs.currentPortfolio}
          onChange={e => set('currentPortfolio', Number(e.target.value))}
          min={0}
          step={1000}
        />
      </div>

      <div className="input-group">
        <label>Annual Expenses ($)</label>
        <input
          type="number"
          value={inputs.annualExpenses}
          onChange={e => set('annualExpenses', Number(e.target.value))}
          min={0}
          step={1000}
        />
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
          <input
            type="number"
            value={inputs.savingsInput.value}
            onChange={e => setSavings('value', Number(e.target.value))}
            min={0}
            step={1000}
          />
        ) : (
          <>
            <input
              type="number"
              value={inputs.income}
              onChange={e => set('income', Number(e.target.value))}
              min={0}
              step={1000}
              placeholder="Annual income ($)"
            />
            <input
              type="number"
              value={inputs.savingsInput.value}
              onChange={e => setSavings('value', Number(e.target.value))}
              min={1}
              max={100}
              placeholder="Savings rate (%)"
            />
            <span className="input-hint">
              = ${resolvedSavings?.toLocaleString()} / yr
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

- [ ] **Step 3: Commit**

```bash
git add src/components/InputPanel.jsx src/components/InputPanel.css
git commit -m "feat: add InputPanel with savings mode toggle"
```

---

### Task 5: ResultsSummary component

**Files:**
- Create: `src/components/ResultsSummary.jsx`
- Create: `src/components/ResultsSummary.css`

- [ ] **Step 1: Create ResultsSummary.css**

Create `src/components/ResultsSummary.css`:
```css
.results-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 20px 24px;
}

.stat-label {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
}

.stat-sub {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 5px;
}

.no-fire-card {
  grid-column: 1 / -1;
}

.no-fire-card .stat-value {
  font-size: 15px;
  color: var(--text-muted);
}
```

- [ ] **Step 2: Create ResultsSummary.jsx**

Create `src/components/ResultsSummary.jsx`:
```jsx
import './ResultsSummary.css'

function fmt(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

export default function ResultsSummary({ firePoint, currentYear }) {
  if (!firePoint) {
    return (
      <div className="results-summary">
        <div className="stat-card no-fire-card">
          <div className="stat-label">Status</div>
          <div className="stat-value">FIRE not reached within 80-year projection</div>
        </div>
      </div>
    )
  }

  return (
    <div className="results-summary">
      <div className="stat-card">
        <div className="stat-label">FIRE Year</div>
        <div className="stat-value">{currentYear + firePoint.year}</div>
        <div className="stat-sub">Age {firePoint.age}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Years to FIRE</div>
        <div className="stat-value">{firePoint.year}</div>
        <div className="stat-sub">from today</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">FIRE Number</div>
        <div className="stat-value">{fmt(firePoint.fireNumber)}</div>
        <div className="stat-sub">inflation-adjusted target</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Portfolio at FIRE</div>
        <div className="stat-value">{fmt(firePoint.portfolio)}</div>
        <div className="stat-sub">base case</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ResultsSummary.jsx src/components/ResultsSummary.css
git commit -m "feat: add ResultsSummary stat cards"
```

---

### Task 6: CombinedChart component

**Files:**
- Create: `src/components/CombinedChart.jsx`
- Create: `src/components/CombinedChart.css`

- [ ] **Step 1: Create CombinedChart.css**

Create `src/components/CombinedChart.css`:
```css
.chart-card {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 24px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  font-size: 14px;
  font-weight: 600;
}

.band-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-muted);
  cursor: pointer;
  user-select: none;
}

.band-toggle input[type="checkbox"] {
  width: auto;
  accent-color: var(--accent);
  cursor: pointer;
}
```

- [ ] **Step 2: Create CombinedChart.jsx**

The chart uses Recharts `ComposedChart` with stacked `Area` components for sensitivity bands (transparent base + filled diff) and `Line` for the 5 savings rate curves. Gradient colors interpolate sand → terracotta across the 5 curves.

Create `src/components/CombinedChart.jsx`:
```jsx
import React, { useState } from 'react'
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import './CombinedChart.css'

// Sand (#C9A882) → Terracotta (#D4714E) across 5 steps
const CURVE_COLORS = ['#C9A882', '#CB8E70', '#CD7B5E', '#D0744E', '#D4714E']

function fmtMoney(v) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
  return `$${v}`
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const lines = payload.filter(p => typeof p.dataKey === 'string' && p.dataKey.startsWith('curve'))
  return (
    <div style={{
      background: '#1E1C1A',
      border: '1px solid #3E3B38',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 12,
    }}>
      <div style={{ color: '#9E9189', marginBottom: 6 }}>Year {label}</div>
      {lines.map(p => (
        <div key={p.dataKey} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: {fmtMoney(p.value)}
        </div>
      ))}
    </div>
  )
}

export default function CombinedChart({ chartData, curves }) {
  const [showBands, setShowBands] = useState(false)
  const hasBands = chartData.length > 1 && 'low0' in chartData[1]

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>Portfolio Projection by Savings Rate</h3>
        <label className="band-toggle">
          <input
            type="checkbox"
            checked={showBands}
            disabled={!hasBands}
            onChange={e => setShowBands(e.target.checked)}
          />
          Show sensitivity bands
        </label>
      </div>

      <ResponsiveContainer width="100%" height={440}>
        <ComposedChart data={chartData} margin={{ top: 8, right: 24, bottom: 16, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2E2B28" vertical={false} />
          <XAxis
            dataKey="year"
            stroke="#9E9189"
            tick={{ fill: '#9E9189', fontSize: 11 }}
            tickLine={false}
            label={{ value: 'Years from today', position: 'insideBottom', offset: -8, fill: '#9E9189', fontSize: 11 }}
          />
          <YAxis
            stroke="#9E9189"
            tick={{ fill: '#9E9189', fontSize: 11 }}
            tickLine={false}
            tickFormatter={fmtMoney}
            width={68}
          />
          <Tooltip content={<ChartTooltip />} />

          {showBands && hasBands && curves.map((curve, i) => (
            <React.Fragment key={`band-${i}`}>
              <Area
                dataKey={`low${i}`}
                stackId={`band${i}`}
                stroke="none"
                fill="transparent"
                legendType="none"
                isAnimationActive={false}
              />
              <Area
                dataKey={`diff${i}`}
                stackId={`band${i}`}
                stroke="none"
                fill={CURVE_COLORS[i]}
                fillOpacity={0.12}
                legendType="none"
                isAnimationActive={false}
              />
            </React.Fragment>
          ))}

          {curves.map((curve, i) => (
            <Line
              key={`curve-${i}`}
              dataKey={`curve${i}`}
              name={`${Math.round(curve.multiplier * 100)}% savings`}
              stroke={CURVE_COLORS[i]}
              strokeWidth={curve.isBase ? 2.5 : 1.5}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/CombinedChart.jsx src/components/CombinedChart.css
git commit -m "feat: add CombinedChart with gradient savings rate curves and togglable sensitivity bands"
```

---

### Task 7: App.jsx — wire everything together

**Files:**
- Create: `src/App.jsx`
- Create: `src/App.css`

- [ ] **Step 1: Create App.css**

Create `src/App.css`:
```css
.app {
  display: flex;
  gap: 24px;
  padding: 32px;
  min-height: 100vh;
  align-items: flex-start;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}
```

- [ ] **Step 2: Create App.jsx**

Create `src/App.jsx`:
```jsx
import { useState, useMemo } from 'react'
import InputPanel from './components/InputPanel.jsx'
import ResultsSummary from './components/ResultsSummary.jsx'
import CombinedChart from './components/CombinedChart.jsx'
import {
  resolveSavings,
  generateCurves,
  findFirePoint,
  projectBand,
  buildChartData,
} from './lib/calculator.js'
import './App.css'

const DEFAULT_INPUTS = {
  currentAge: 30,
  currentPortfolio: 50000,
  income: 100000,
  annualExpenses: 50000,
  savingsInput: { mode: 'fixed', value: 40000 },
  inflationRate: 3,
  returnRate: 7,
  swr: 4,
  sensitivityRange: 2,
}

export default function App() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS)

  const { curves, chartData, firePoint } = useMemo(() => {
    const annualSavings = resolveSavings(inputs.income, inputs.savingsInput)

    const baseInputs = {
      currentPortfolio: inputs.currentPortfolio,
      currentAge: inputs.currentAge,
      annualExpenses: inputs.annualExpenses,
      inflationRate: inputs.inflationRate,
      returnRate: inputs.returnRate,
      swr: inputs.swr,
    }

    const curves = generateCurves(baseInputs, annualSavings)

    const bands = inputs.sensitivityRange > 0
      ? curves.map(curve =>
          projectBand(baseInputs, curve.multiplier * annualSavings, inputs.sensitivityRange)
        )
      : null

    const chartData = buildChartData(curves, bands)
    const baseCurve = curves.find(c => c.isBase)
    const firePoint = baseCurve ? findFirePoint(baseCurve.data) : null

    return { curves, chartData, firePoint }
  }, [inputs])

  return (
    <div className="app">
      <InputPanel inputs={inputs} onChange={setInputs} />
      <main className="app-main">
        <ResultsSummary firePoint={firePoint} currentYear={new Date().getFullYear()} />
        <CombinedChart chartData={chartData} curves={curves} />
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Run dev server and verify the full app**

```bash
npm run dev
```

Open `http://localhost:5173`. Verify:
- Dark `#1E1C1A` background with rounded card panel on the left
- 4 stat cards showing FIRE date, years, number, and portfolio value
- Chart with 5 gradient lines from sand to terracotta, base case slightly thicker
- Sensitivity bands toggle enables/disables shaded areas around each curve
- Changing any input updates all outputs instantly with no submit button

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx src/App.css
git commit -m "feat: wire App with state, calculator, and all components"
```

---

### Task 8: Vercel deployment

**Files:**
- No new files — Vite's scaffold `.gitignore` covers `node_modules` and `dist`

- [ ] **Step 1: Verify production build works locally**

```bash
npm run build
npm run preview
```
Open `http://localhost:4173`. Confirm app renders and all interactions work identically to dev.

- [ ] **Step 2: Push repo to GitHub**

Create a new empty repo on GitHub named `fire-calculator`, then:
```bash
git remote add origin https://github.com/<your-username>/fire-calculator.git
git push -u origin main
```

- [ ] **Step 3: Import and deploy on Vercel**

1. Go to [vercel.com](https://vercel.com), sign in
2. Click **Add New → Project**
3. Import the `fire-calculator` GitHub repo
4. Vercel auto-detects Vite. Confirm: Framework = **Vite**, Build Command = `npm run build`, Output Directory = `dist`
5. Click **Deploy**

Expected: Build succeeds, app live at `https://fire-calculator-<hash>.vercel.app`

- [ ] **Step 4: Enable automatic deploys**

In the Vercel project settings → Git, confirm the Production Branch is set to `main`. Every push to `main` will now auto-deploy.

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "chore: production build verified and deployed to Vercel"
```
