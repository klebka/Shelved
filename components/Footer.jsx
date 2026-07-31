'use client'
import { useState, useEffect } from 'react'

export default function Footer() {
  const [visits, setVisits] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const hasVisited = sessionStorage.getItem('shelved_visited')
    const url = hasVisited ? '/api/visitors?readOnly=true' : '/api/visitors'

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setVisits(data.count)
        if (!hasVisited) {
          sessionStorage.setItem('shelved_visited', 'true')
        }
      })
      .catch(() => null)
  }, [])

  const visitTooltipText = "Counts unique browser sessions. Page refreshes and navigation during your current session do not inflate the total count."

  return (
    <footer className="footer">
      <div className="footer-content">
        {visits !== null && (
          <div className="visitor-badge tooltip-target">
            <span className="visitor-pulse-dot" />
            <span className="visitor-text">{visits.toLocaleString()} Total Visits</span>
            <span className="tooltip-bubble">{visitTooltipText}</span>
          </div>
        )}
        <p className="footer-copyright">— Shelved by klebka —</p>
      </div>
    </footer>
  )
}
