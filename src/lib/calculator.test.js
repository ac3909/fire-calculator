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
    const data = projectPortfolio({
      currentPortfolio: 0,
      currentAge: 30,
      annualSavings: 0,
      annualExpenses: 100000,
      inflationRate: 3,
      returnRate: 7,
      swr: 4,
      maxYears: 10,
    })
    expect(data.at(-1).year).toBe(10)
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
