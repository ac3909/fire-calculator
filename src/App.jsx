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
}
