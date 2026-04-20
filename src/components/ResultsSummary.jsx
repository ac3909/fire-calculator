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
