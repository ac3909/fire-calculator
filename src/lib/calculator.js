export function resolveSavings(income, savingsInput) {
  if (savingsInput.mode === 'percent') return income * (savingsInput.value / 100)
  if (savingsInput.mode === 'fixed') return savingsInput.value
  throw new Error(`Unknown savings mode: ${savingsInput.mode}`)
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
    const entry = { year, age: curves[0].data[0].age + year }
    curves.forEach((curve, i) => {
      const point = curve.data.find(p => p.year === year)
      if (point !== undefined) {
        entry[`curve${i}`] = point.portfolio
        entry[`fire${i}`] = point.fireNumber
      }
      if (bands) {
        const lowPt = bands[i].low.find(p => p.year === year)
        const highPt = bands[i].high.find(p => p.year === year)
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
