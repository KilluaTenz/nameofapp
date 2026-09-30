import { VIEW_HEIGHT, VIEW_WIDTH, WORLD_WIDTH } from "./constants.js";
import { getTier } from "./difficulty.js";
import { drawPlayer } from "../components/Player.jsx";
import { drawPlatform } from "../components/Platform.jsx";
import { drawSpike } from "../components/Spike.jsx";
import { drawZombie } from "../components/Zombie.jsx";

function lerpColor(a, b, t) {
  const cl = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return [n >> 16, (n >> 8) & 255, n & 255];
  };
  const A = cl(a);
  const B = cl(b);
  const m = (i) => Math.round(A[i] + (B[i] - A[i]) * t);
  return `rgb(${m(0)},${m(1)},${m(2)})`;
}

function skyColors(meters) {
  const stops = [
    { h: 0, top: "#6ec7ff", bot: "#d8f1ff" },
    { h: 400, top: "#3a7bd5", bot: "#89c4ff" },
    { h: 900, top: "#1b2a6b", bot: "#4b6cb7" },
    { h: 1800, top: "#0b1028", bot: "#1a2452" },
    { h: 5000, top: "#05060d", bot: "#14082a" },
    { h: 12000, top: "#02010a", bot: "#2a0622" },
    { h: 25000, top: "#000000", bot: "#0a1f1a" },
  ];
  let i = 0;
  while (i < stops.length - 1 && meters > stops[i + 1].h) i += 1;
  const a = stops[i];
  const b = stops[Math.min(i + 1, stops.length - 1)];
  const span = Math.max(1, b.h - a.h);
  const t = Math.max(0, Math.min(1, (meters - a.h) / span));
  return { top: lerpColor(a.top, b.top, t), bot: lerpColor(a.bot, b.bot, t) };
}

export function drawWorld(ctx, state) {
  const { player, camera, platforms, spikes, zombies, particles, banners, debug, heightMeters, time } =
    state;
  const w = VIEW_WIDTH;
  const h = VIEW_HEIGHT;

  drawBackground(ctx, camera, heightMeters, time, w, h);

  ctx.save();
  ctx.translate(0, -camera.y);

  for (const p of platforms) {
    if (p.broken && p.visible <= 0) continue;
    drawPlatform(ctx, p);
  }
  for (const s of spikes) drawSpike(ctx, s);
  for (const z of zombies) drawZombie(ctx, z);
  for (const pt of particles) drawParticle(ctx, pt);
  drawPlayer(ctx, player);

  if (debug) drawDebug(ctx, state);

  ctx.restore();

  for (const b of banners) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, b.life);
    ctx.fillStyle = "#f8fbff";
    ctx.font = "700 28px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText(b.text, w / 2, 120 + (1 - b.life) * -20);
    ctx.restore();
  }
}

function drawBackground(ctx, camera, meters, time, w, h) {
  const sky = skyColors(meters);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, sky.top);
  g.addColorStop(1, sky.bot);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const starAlpha = Math.max(0, Math.min(1, (meters - 700) / 900));
  if (starAlpha > 0) {
    ctx.globalAlpha = starAlpha;
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 60; i += 1) {
      const sx = (i * 97) % w;
      const sy = (i * 53 + camera.y * 0.08) % h;
      ctx.fillRect(sx, ((sy % h) + h) % h, i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1);
    }
    ctx.globalAlpha = 1;
  }

  const cloudAlpha = Math.max(0, 1 - meters / 1200);
  if (cloudAlpha > 0) {
    ctx.globalAlpha = cloudAlpha * 0.55;
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 8; i += 1) {
      const cx = (i * 140 + time * (8 + i)) % (w + 160) - 80;
      const cy = 40 + ((i * 47 + camera.y * 0.12) % (h * 0.7));
      roundCloud(ctx, cx, cy, 36 + (i % 3) * 10);
    }
    ctx.globalAlpha = 1;
  }

  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.beginPath();
  for (let x = 0; x < WORLD_WIDTH; x += 80) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  ctx.stroke();
}

function roundCloud(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.arc(x + r * 0.8, y + 6, r * 0.7, 0, Math.PI * 2);
  ctx.arc(x - r * 0.7, y + 8, r * 0.6, 0, Math.PI * 2);
  ctx.fill();
}

function drawParticle(ctx, p) {
  ctx.globalAlpha = Math.max(0, p.life / p.max);
  ctx.fillStyle = p.color;
  ctx.fillRect(p.x, p.y, p.size, p.size);
  ctx.globalAlpha = 1;
}

function drawDebug(ctx, state) {
  const { player, platforms, spikes, zombies } = state;
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(34,211,238,0.9)";
  ctx.strokeRect(player.x, player.y, player.width, player.height);
  ctx.fillStyle = "rgba(34,211,238,0.15)";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.strokeStyle = "rgba(250,250,120,0.85)";
  for (const p of platforms) {
    if (p.broken && p.visible <= 0) continue;
    ctx.strokeRect(p.x, p.y, p.width, p.height);
  }
  ctx.strokeStyle = "rgba(255,70,70,0.95)";
  for (const s of spikes) ctx.strokeRect(s.x, s.y, s.width, s.height);
  for (const z of zombies) {
    ctx.strokeStyle = "rgba(80,255,120,0.95)";
    ctx.strokeRect(z.x, z.y, z.width, z.height);
    ctx.strokeStyle = "rgba(80,255,120,0.35)";
    ctx.beginPath();
    ctx.arc(z.x + z.width / 2, z.y + z.height / 2, z.detectRange, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export function formatMeters(n) {
  return `${Math.floor(n).toLocaleString()} M`;
}

export function currentTier(meters) {
  return getTier(meters);
}
