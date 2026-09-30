import { PLATFORM_TYPES } from "../game/constants.js";

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawPlatform(ctx, p) {
  ctx.save();
  ctx.globalAlpha = p.visible;
  let fill = "#7dd3fc";
  let edge = "#0369a1";
  if (p.type === PLATFORM_TYPES.MOVING) {
    fill = "#a78bfa";
    edge = "#5b21b6";
  } else if (p.type === PLATFORM_TYPES.BREAKABLE) {
    fill = "#fdba74";
    edge = "#c2410c";
  } else if (p.type === PLATFORM_TYPES.BOUNCY) {
    fill = "#86efac";
    edge = "#15803d";
  } else if (p.type === PLATFORM_TYPES.DANGEROUS) {
    fill = "#fb7185";
    edge = "#9f1239";
  } else if (p.type === PLATFORM_TYPES.NARROW) {
    fill = "#67e8f9";
    edge = "#0e7490";
  }
  ctx.fillStyle = fill;
  ctx.strokeStyle = edge;
  ctx.lineWidth = 2;
  roundRect(ctx, p.x, p.y, p.width, p.height, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.fillRect(p.x + 4, p.y + 2, Math.max(0, p.width - 8), 3);
  ctx.restore();
}

export default function Platform() {
  return null;
}
