export default function PauseMenu({ onResume, onRestart, onMenu }) {
  return (
    <div className="overlay">
      <div className="panel">
        <h2>PAUSED</h2>
        <div className="btn-row">
          <button className="btn" onClick={onResume}>
            RESUME
          </button>
          <button className="btn ghost" onClick={onRestart}>
            RESTART
          </button>
          <button className="btn ghost" onClick={onMenu}>
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}
