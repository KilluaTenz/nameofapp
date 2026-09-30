export function drawZombie(ctx, z) {
  const bob = Math.sin(z.bob * 6) * 2;
  ctx.save();
  ctx.translate(z.x, z.y + bob);
  ctx.fillStyle = "#4ade80";
  ctx.fillRect(0, 0, z.width, z.height);
  ctx.fillStyle = "#166534";
  ctx.fillRect(2, 4, 6, 4);
  ctx.fillRect(z.width - 8, 4, 6, 4);
  ctx.fillStyle = "#14532d";
  ctx.fillRect(6, 14, z.width - 12, 4);
  ctx.restore();
}

export default function Zombie() {
  return null;
}
