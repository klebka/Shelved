export function PlatformIcon({ type }) {
  if (type === 'Win') {
    return (
      <svg className="platform-svg-icon" viewBox="0 0 88 88" fill="currentColor" title="Windows Compatible">
        <path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm0 33.562l35.685.16.016 34.462-35.701-4.872zm39.697-39.06l48.303-6.904v41.341l-48.303.328zm0 39.297l48.303.268v41.531l-48.303-6.852z"/>
      </svg>
    )
  }
  if (type === 'Mac') {
    return (
      <svg className="platform-svg-icon" viewBox="0 0 170 170" fill="currentColor" title="macOS Compatible">
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.85.24-9.72-1.81-14.6-6.14-3.32-2.83-7.22-7.46-11.7-13.88-6.18-8.87-11.1-18.77-14.75-29.71-3.65-10.94-5.48-21.36-5.48-31.25 0-14.67 3.8-26.65 11.41-35.95 7.61-9.31 17.1-14.07 28.48-14.28 5.09 0 10.37 1.16 15.84 3.47 5.48 2.31 9.4 3.51 11.77 3.61 2.01 0 6.01-1.25 12-3.75 5.99-2.5 11.12-3.65 15.4-3.47 8.01.36 15.22 2.35 21.62 5.96-6.07 5.56-9.11 12.38-9.11 20.47 0 9.07 3.48 16.59 10.45 22.56 6.97 5.97 15.35 9.17 25.13 9.6-1.57 7.76-3.9 15.49-7 23.2zm-28.67-97.16c0 6.64-2.45 13.06-7.35 18.25-4.9 5.2-10.95 8.35-18.15 9.46-.24-.96-.36-1.92-.36-2.88 0-6.76 2.54-13.25 7.62-18.47 5.08-5.22 11.23-8.31 18.46-9.27.12.96.18 1.93.18 2.91z"/>
      </svg>
    )
  }
  if (type === 'Linux') {
    return (
      <svg className="platform-svg-icon" viewBox="0 0 24 24" fill="currentColor" title="Linux Compatible">
        <path d="M12 2c-2.4 0-4.3 1.9-4.3 4.3 0 1.2.5 2.3 1.3 3.1-.3 1.2-1.3 3.4-1.8 4.2-.6.9-1.2 1.3-2.1 1.7-.8.4-1.6.5-1.9 1.3-.3.7.2 1.5.9 1.8 1.2.5 3 .2 4.1-.6 1.1-.8 1.9-2 2.3-3.1.5.3 1 .4 1.5.4s1-.1 1.5-.4c.4 1.1 1.2 2.3 2.3 3.1 1.1.8 2.9 1.1 4.1.6.7-.3 1.2-1.1.9-1.8-.3-.8-1.1-.9-1.9-1.3-.9-.4-1.5-.8-2.1-1.7-.5-.8-1.5-3-1.8-4.2.8-.8 1.3-1.9 1.3-3.1C16.3 3.9 14.4 2 12 2z"/>
      </svg>
    )
  }
  if (type === 'Deck') {
    return (
      <svg className="platform-svg-icon" viewBox="0 0 24 24" fill="currentColor" title="Steam Deck Verified">
        <path d="M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2zm2 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm12 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-6 2a2 2 0 100 4 2 2 0 000-4z"/>
      </svg>
    )
  }
  return null
}

export function ClockIcon() {
  return (
    <svg className="badge-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export function TrophyIcon() {
  return (
    <svg className="badge-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H8v4h8v-4h-1c-.55 0-1-.45-1-1v-2.34" />
      <path d="M18 4H6v7a6 6 0 0012 0V4z" />
    </svg>
  )
}

export function HourglassIcon() {
  return (
    <svg className="badge-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 22h14" />
      <path d="M5 2h14" />
      <path d="M17 22v-4.172a2 2 0 00-.586-1.414L12 12l-4.414 4.414A2 2 0 007 17.828V22" />
      <path d="M7 2v4.172a2 2 0 00.586 1.414L12 12l4.414-4.414A2 2 0 0017 6.172V2" />
    </svg>
  )
}
