export default function MainMenu({
  playerName,
  onNameChange,
  onPlay,
  onLeaderboard,
  supabaseReady,
}) {
  return (
    <div className="overlay">
      <div className="panel">
        <h1>CUBE ASCENT</h1>
        <p className="tagline">CLIMB AS HIGH AS YOU CAN</p>
        <div className="name-field">
          <label htmlFor="player-name">PLAYER NAME</label>
          <input
            id="player-name"
            maxLength={24}
            value={playerName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Cube Climber"
          />
        </div>
        <div className="btn-row">
          <button className="btn" onClick={onPlay}>
            PLAY
          </button>
          <button className="btn ghost" onClick={onLeaderboard}>
            LEADERBOARD
          </button>
        </div>
        {!supabaseReady && (
          <p className="notice">Supabase is not configured. Scores will stay on this device.</p>
        )}
        <div className="controls-help">
          Controls:
          <br />
          A / D or Arrows — Move
          <br />
          SPACE or W / Up — Jump
          <br />
          ESC — Pause
          <br />
          F3 — Debug Hitboxes
        </div>
      </div>
    </div>
  );
}
