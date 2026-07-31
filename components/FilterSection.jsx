import { MOOD_FILTERS, EXCLUSION_FILTERS, matchesMood } from '@/lib/filters'

export default function FilterSection({
  games,
  minHours = 0,
  maxHours = 12,
  mood,
  exclusions = [],
  onMinHoursChange,
  onMaxHoursChange,
  onMoodToggle,
  onExclusionToggle,
  onResetFilters
}) {
  const hasActiveFilters = minHours > 0 || maxHours < 12 || mood || exclusions.length > 0

  const getMoodCount = (mFilter) => {
    if (!games) return null
    return games.filter(g => matchesMood(g, mFilter.id)).length
  }

  const formatHourLabel = (h) => {
    if (h === 0) return '0h'
    if (h >= 12) return '12h+'
    return `${h}h`
  }

  const timeTooltipText = "Filter games by expected session length or remaining completion duration between your selected min and max hours."
  const moodTooltipText = "Categorizes games using official Steam Store tags, genre metadata, and gameplay heuristics so 100% of your library matches Chill, Action, Story, Quick, or Co-Op moods."
  const exclusionTooltipText = "Filters out unwanted games matching selected exclusion tags (such as Horror/Zombie or VR-Only titles) from candidate picks."

  return (
    <div className="filter-section">
      <div className="flex-between filter-header">
        <span className="filter-section-title">Filter Preferences</span>
        {hasActiveFilters && (
          <button type="button" onClick={onResetFilters} className="btn-reset-filters">
            Reset Filters
          </button>
        )}
      </div>

      {/* Two-Point Dual Range Slider for Time Available */}
      <div className="filter-group">
        <div className="flex-between">
          <div className="filter-label-with-tooltip">
            <p className="filter-label">Time Available</p>
            <span className="tooltip-target info-circle-icon">
              ?
              <span className="tooltip-bubble">{timeTooltipText}</span>
            </span>
          </div>
          <span className="time-range-badge">
            {formatHourLabel(minHours)} — {formatHourLabel(maxHours)}
          </span>
        </div>

        <div className="dual-slider-wrapper">
          <div className="dual-slider-track-bg" />
          <div
            className="dual-slider-track-active"
            style={{
              left: `${(minHours / 12) * 100}%`,
              width: `${((maxHours - minHours) / 12) * 100}%`
            }}
          />
          <input
            type="range"
            min="0"
            max="12"
            step="0.5"
            value={minHours}
            onChange={e => {
              const val = Math.min(Number(e.target.value), maxHours - 0.5)
              onMinHoursChange(val)
            }}
            className="dual-range-thumb thumb-min"
          />
          <input
            type="range"
            min="0"
            max="12"
            step="0.5"
            value={maxHours}
            onChange={e => {
              const val = Math.max(Number(e.target.value), minHours + 0.5)
              onMaxHoursChange(val)
            }}
            className="dual-range-thumb thumb-max"
          />
        </div>
        <div className="slider-labels">
          <span>0h (Quick)</span>
          <span>6h</span>
          <span>12h+ (All Day)</span>
        </div>
      </div>

      {/* Mood & Genre with Interactive ? Tooltip */}
      <div className="filter-group">
        <div className="filter-label-with-tooltip">
          <p className="filter-label">Mood & Genre</p>
          <span className="tooltip-target info-circle-icon">
            ?
            <span className="tooltip-bubble">{moodTooltipText}</span>
          </span>
        </div>
        <div className="filters-row">
          {MOOD_FILTERS.map(f => {
            const count = getMoodCount(f)
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onMoodToggle(f)}
                className={`pill ${mood?.id === f.id ? 'active' : ''}`}
              >
                {f.label}
                {count !== null && count > 0 && <span className="pill-count">{count}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Exclusions with Interactive ? Tooltip */}
      <div className="filter-group">
        <div className="filter-label-with-tooltip">
          <p className="filter-label">Exclusions (Avoid)</p>
          <span className="tooltip-target info-circle-icon">
            ?
            <span className="tooltip-bubble">{exclusionTooltipText}</span>
          </span>
        </div>
        <div className="filters-row">
          {EXCLUSION_FILTERS.map(f => {
            const active = exclusions.includes(f.id)
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onExclusionToggle(f.id)}
                className={`pill pill-exclude ${active ? 'active' : ''}`}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
