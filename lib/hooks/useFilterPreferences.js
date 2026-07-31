import { useState } from 'react'

export function useFilterPreferences() {
  const [minHours, setMinHours] = useState(0)
  const [maxHours, setMaxHours] = useState(12)
  const [mood, setMood] = useState(null)
  const [exclusions, setExclusions] = useState([])
  const [skippedAppIds, setSkippedAppIds] = useState([])

  function resetFilters() {
    setMinHours(0)
    setMaxHours(12)
    setMood(null)
    setExclusions([])
    setSkippedAppIds([])
  }

  function toggleMood(f) {
    const next = mood?.id === f.id ? null : f
    setMood(next)
    return next
  }

  function toggleExclusion(exId) {
    const updated = exclusions.includes(exId)
      ? exclusions.filter(id => id !== exId)
      : [...exclusions, exId]
    setExclusions(updated)
    return updated
  }

  function addSkipped(appid) {
    const updated = [...skippedAppIds, appid]
    setSkippedAppIds(updated)
    return updated
  }

  return {
    minHours,
    setMinHours,
    maxHours,
    setMaxHours,
    mood,
    setMood,
    exclusions,
    setExclusions,
    skippedAppIds,
    setSkippedAppIds,
    resetFilters,
    toggleMood,
    toggleExclusion,
    addSkipped
  }
}
