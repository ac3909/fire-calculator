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
          onChange={e => set('currentAge', parseInt(e.target.value, 10) || inputs.currentAge)}
          min={18}
          max={80}
          step={1}
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
