import { useEffect } from 'react'

export function useKeyboardShortcuts({ enabled, onPickAgain, onSkip, onResetFilters, suggestion }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (['input', 'textarea', 'select'].includes(e.target.tagName.toLowerCase())) return
      if (!enabled) return

      if (e.code === 'Space' || e.key.toLowerCase() === 'r') {
        e.preventDefault()
        onPickAgain()
      } else if (e.key.toLowerCase() === 's' && suggestion) {
        e.preventDefault()
        onSkip(suggestion.appid)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onResetFilters()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, suggestion, onPickAgain, onSkip, onResetFilters])
}
