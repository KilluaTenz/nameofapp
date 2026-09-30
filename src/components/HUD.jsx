export default function HUD({ height, best }) {
  return (
    <div className="hud">
      <div className="label">HEIGHT</div>
      <div className="value">{Math.floor(height).toLocaleString()} M</div>
      <div className="best">BEST: {Math.floor(best).toLocaleString()} M</div>
    </div>
  );
}
