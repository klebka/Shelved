export default function Header({ viewMode, setViewMode, soundMuted, setSoundMuted }) {
  return (
    <header className="header">
      <div className="title-row flex-between">
        <div className="brand">
          <h1>Shelved</h1>
          <span className="badge-pill">RNG Game Picker</span>
        </div>

        <div className="header-controls">
          <button
            type="button"
            className="sound-toggle-btn"
            onClick={() => setSoundMuted(!soundMuted)}
            title={soundMuted ? 'Unmute spin audio' : 'Mute spin audio'}
          >
            {soundMuted ? 'Sound OFF' : 'Sound ON'}
          </button>

          <div className="view-mode-tabs">
            <button
              type="button"
              className={`tab-btn ${viewMode === 'picker' ? 'active' : ''}`}
              onClick={() => setViewMode('picker')}
            >
              RNG Picker
            </button>
            <button
              type="button"
              className={`tab-btn ${viewMode === 'browse' ? 'active' : ''}`}
              onClick={() => setViewMode('browse')}
            >
              Browse Library
            </button>
          </div>
        </div>
      </div>
      <p className="subtitle">Too many games, not enough time. Let RNG pick what to play next.</p>
    </header>
  )
}
