export function drawSpike(ctx, s) {
  const spikes = Math.max(1, Math.round(s.width / 10));
  const w = s.width / spikes;
  ctx.fillStyle = "#e11d48";
  ctx.beginPath();
  for (let i = 0; i < spikes; i += 1) {
    const x = s.x + i * w;
    ctx.moveTo(x, s.y + s.height);
    ctx.lineTo(x + w / 2, s.y);
    ctx.lineTo(x + w, s.y + s.height);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#881337";
  ctx.stroke();
}

export default function Spike() {
  return null;
}
