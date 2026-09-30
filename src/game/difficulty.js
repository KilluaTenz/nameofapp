export function getDifficulty(heightMeters) {
  const raw = 1 + heightMeters / 500;
  return Math.min(raw, 10);
}

export function getTier(heightMeters) {
  if (heightMeters < 100) return "EASY";
  if (heightMeters < 500) return "NORMAL";
  if (heightMeters < 1000) return "HARD";
  if (heightMeters < 5000) return "EXTREME";
  if (heightMeters < 15000) return "INSANE";
  return "VOID";
}

export function generationParams(heightMeters) {
  const d = getDifficulty(heightMeters);
  const t = Math.min(1, heightMeters / 8000);

  const minWidth = Math.max(70, 150 - d * 8);
  const maxWidth = Math.max(minWidth + 20, 240 - d * 14);
  const minGapY = 46;
  const maxGapY = Math.min(118, 62 + d * 7);
  const maxDx = Math.min(155, 90 + d * 8);
  const movingChance = Math.min(0.55, 0.04 + d * 0.06);
  const spikeChance = Math.min(0.62, heightMeters < 80 ? 0 : 0.05 + d * 0.07);
  const zombieChance = Math.min(0.45, heightMeters < 140 ? 0 : 0.04 + d * 0.05);
  const breakableChance = Math.min(0.28, heightMeters < 220 ? 0 : 0.03 + d * 0.03);
  const bouncyChance = Math.min(0.18, heightMeters < 60 ? 0.02 : 0.04);
  const dangerousChance = Math.min(0.16, heightMeters < 400 ? 0 : 0.02 + d * 0.015);
  const moveSpeed = 0.7 + d * 0.22 + t * 0.8;
  const moveAmp = 40 + d * 10;
  const zombieSpeed = 40 + d * 12;

  return {
    d,
    minWidth,
    maxWidth,
    minGapY,
    maxGapY,
    maxDx,
    movingChance,
    spikeChance,
    zombieChance,
    breakableChance,
    bouncyChance,
    dangerousChance,
    moveSpeed,
    moveAmp,
    zombieSpeed,
  };
}
