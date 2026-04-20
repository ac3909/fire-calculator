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

// Sand (#C9A882) → Terracotta (#D4714E) across 5 curves
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
