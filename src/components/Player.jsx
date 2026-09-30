export function drawPlayer(ctx, player) {
  const sq = player.squash || 1;
  const w = player.width * sq;
  const h = player.height / sq;
  const x = player.x - (w - player.width) / 2;
  const y = player.y + (player.height - h);
  ctx.save();
  ctx.fillStyle = player.alive ? "#22d3ee" : "#64748b";
  ctx.strokeStyle = "#0e7490";
  ctx.lineWidth = 2;
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = "#082f49";
  const eye = player.facing >= 0 ? w * 0.55 : w * 0.18;
  ctx.fillRect(x + eye, y + h * 0.28, 5, 5);
  ctx.fillRect(x + eye + (player.facing >= 0 ? 7 : -7), y + h * 0.28, 4, 5);
  ctx.restore();
}

export default function Player() {
  return null;
}
