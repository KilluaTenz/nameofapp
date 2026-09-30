export default function DebugPanel({ stats, show }) {
  if (!show || !stats) return null;
  const text = `DEBUG MODE

FPS: ${stats.fps}
PLAYER X: ${stats.x.toFixed(1)}
PLAYER Y: ${stats.y.toFixed(1)}
HEIGHT: ${stats.height} M
TIER: ${stats.tier}
DIFF: ${stats.difficulty.toFixed(2)}

VELOCITY:
X: ${stats.vx.toFixed(1)}
Y: ${stats.vy.toFixed(1)}

OBJECTS: ${stats.objects}
ZOMBIES: ${stats.zombies}
PLATFORMS: ${stats.platforms}`;
  return <div className="debug-panel">{text}</div>;
}
