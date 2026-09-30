export default function GameOver({ height, best, onRetry, onMenu }) {
  return (
    <div className="overlay">
      <div className="panel">
        <h2>GAME OVER</h2>
        <div className="stat-block">
          <div className="label muted">HEIGHT REACHED</div>
          <div className="big">{Math.floor(height).toLocaleString()} M</div>
        </div>
        <div className="stat-block">
          <div className="label muted">BEST HEIGHT</div>
          <div>{Math.floor(best).toLocaleString()} M</div>
        </div>
        <div className="btn-row">
          <button className="btn" onClick={onRetry}>
            RETRY
          </button>
          <button className="btn ghost" onClick={onMenu}>
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}
