import { useState } from 'react'
import './InputPanel.css'

export default function InputPanel({ inputs, onChange }) {
  const [focusedField, setFocusedField] = useState(null)
  const [editingValue, setEditingValue] = useState('')

  function set(key, value) {
    onChange({ ...inputs, [key]: value })
  }

  function setSavings(key, value) {
    onChange({ ...inputs, savingsInput: { ...inputs.savingsInput, [key]: value } })
  }

  function dollarValue(fieldKey, raw) {
    return focusedField === fieldKey ? editingValue : raw.toLocaleString()
  }

  function parseDollar(str) {
    return Math.max(0, Number(str.replace(/,/g, '')) || 0)
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
            onFocus={() => { setFocusedField('currentPortfolio'); setEditingValue(String(inputs.currentPortfolio)) }}
            onBlur={() => setFocusedField(null)}
            onChange={e => { setEditingValue(e.target.value); set('currentPortfolio', parseDollar(e.target.value)) }}
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
            onFocus={() => { setFocusedField('annualExpenses'); setEditingValue(String(inputs.annualExpenses)) }}
            onBlur={() => setFocusedField(null)}
            onChange={e => { setEditingValue(e.target.value); set('annualExpenses', parseDollar(e.target.value)) }}
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
              onFocus={() => { setFocusedField('savingsValue'); setEditingValue(String(inputs.savingsInput.value)) }}
              onBlur={() => setFocusedField(null)}
              onChange={e => { setEditingValue(e.target.value); setSavings('value', parseDollar(e.target.value)) }}
            />
          </div>
        ) : (
          <>
            <div className="input-prefix-wrap">
              <span className="prefix-sym">$</span>
              <input
                type="text"
                value={dollarValue('income', inputs.income)}
                onFocus={() => { setFocusedField('income'); setEditingValue(String(inputs.income)) }}
                onBlur={() => setFocusedField(null)}
                onChange={e => { setEditingValue(e.target.value); set('income', parseDollar(e.target.value)) }}
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
              = ${resolvedSavings != null ? resolvedSavings.toLocaleString() : '0'} / yr
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
