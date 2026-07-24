export default function PrivateProfileNotice({ onRetry }) {
  return (
    <div className="private-profile-card">
      <div className="notice-header">
        <h3>Steam Library is Private</h3>
      </div>
      <p className="notice-text">
        Steam's API cannot read games from private profiles. To unblock this:
      </p>
      <ol className="notice-steps">
        <li>Open Steam → Click your profile → <strong>Edit Profile</strong></li>
        <li>Go to <strong>Privacy Settings</strong></li>
        <li>Set <strong>Game details</strong> to <strong>Public</strong></li>
      </ol>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-retry-privacy">
          Try Again
        </button>
      )}
    </div>
  )
}
